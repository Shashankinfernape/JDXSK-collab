const User = require('../models/user.model');
const Notification = require('../models/notification.model');
const Chat = require('../models/chat.model'); // Import Chat model
const { getIo, getSocketId } = require('../socket/socket');

// Get current user's profile
const getUserProfile = async (req, res) => {
  // 'req.user' is attached by the authMiddleware
  res.json(req.user);
};

// Update user profile (name, about)
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.name = req.body.name || user.name;
    user.about = req.body.about || user.about;
    if (req.body.profilePic) {
        user.profilePic = req.body.profilePic;
    }

    const updatedUser = await user.save();
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Search for users by name or email
const searchUsers = async (req, res) => {
  const query = req.query.q;
  if (!query) {
    return res.status(400).json({ message: 'Search query is required' });
  }

  try {
    // 1. Strict Prefix Match (Highest Relevance)
    // Matches names starting with the query (e.g., "San" -> "Sangeetha")
    const regexStart = new RegExp(`^${query}`, 'i');
    
    const startMatches = await User.find({
      $and: [
        { _id: { $ne: req.user._id } },
        { $or: [{ name: { $regex: regexStart } }, { email: { $regex: regexStart } }] }
      ]
    }).limit(10).lean();

    let results = startMatches;

    // 2. Loose Contains Match (Fill remaining slots if needed)
    // Only run if we don't have enough results, ensuring speed.
    if (results.length < 10) {
        const regexContains = new RegExp(query, 'i');
        const idsToExclude = results.map(u => u._id);
        idsToExclude.push(req.user._id);

        const containMatches = await User.find({
            _id: { $nin: idsToExclude },
            $or: [{ name: { $regex: regexContains } }, { email: { $regex: regexContains } }]
        }).limit(10 - results.length).lean();
        
        results = [...results, ...containMatches];
    }
    
    const currentUser = await User.findById(req.user._id); // Refresh user to get latest following

    const usersWithStatus = results.map(user => {
      let status = 'none';
      // Check Following (Instagram Style)
      if (currentUser.following && currentUser.following.some(id => id.toString() === user._id.toString())) {
        status = 'following';
      } else if (currentUser.followers && currentUser.followers.some(id => id.toString() === user._id.toString())) {
        status = 'follows_you'; // Optional: Show if they follow you but you don't follow back
      }
      
      // Fallback to legacy 'friends' if needed, or just replace logic
      if (status === 'none' && currentUser.friends && currentUser.friends.some(id => id.toString() === user._id.toString())) {
          status = 'following'; // Treat legacy friends as following
      }

      return { ...user, connectionStatus: status };
    });

    res.json(usersWithStatus);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// --- Follow System (Instagram Style) ---
const followUser = async (req, res) => {
  const { recipientId } = req.params; // The user to follow
  const senderId = req.user._id;

  try {
    if (senderId.toString() === recipientId) return res.status(400).json({ message: 'Cannot follow yourself' });

    // 1. Add to My Following
    await User.findByIdAndUpdate(senderId, {
       $addToSet: { following: recipientId }
    });

    // 2. Add to Their Followers
    await User.findByIdAndUpdate(recipientId, {
       $addToSet: { followers: senderId }
    });

    // 3. Ensure Chat Exists (So they appear in "Name Page"/ChatList)
    let chat = await Chat.findOne({
        isGroup: false,
        $and: [
            { participants: { $elemMatch: { $eq: senderId } } },
            { participants: { $elemMatch: { $eq: recipientId } } }
        ]
    });

    if (!chat) {
        chat = await Chat.create({
            participants: [senderId, recipientId],
            isGroup: false
        });
    }

    // 4. Notification
    const notification = await Notification.create({
        recipient: recipientId,
        sender: senderId,
        type: 'follow', // New type
        message: `${req.user.name} started following you`
    });

    // Real-time notification
    try {
        const socketId = getSocketId(recipientId);
        if (socketId) {
            const populatedNotif = await notification.populate('sender', 'name profilePic');
            getIo().to(socketId).emit('newNotification', populatedNotif);
            getIo().to(socketId).emit('newFollower', {
                 _id: req.user._id, name: req.user.name, profilePic: req.user.profilePic
            });
        }
    } catch (e) { console.error("Socket emit error:", e); }

    res.json({ message: 'Followed successfully', chat });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const unfollowUser = async (req, res) => {
  const { recipientId } = req.params;
  const senderId = req.user._id;

  try {
     await User.findByIdAndUpdate(senderId, {
         $pull: { following: recipientId }
     });
     await User.findByIdAndUpdate(recipientId, {
         $pull: { followers: senderId }
     });
     res.json({ message: 'Unfollowed successfully' });
  } catch (error) {
      res.status(500).json({ message: 'Server error' });
  }
};

// ... Legacy Friend Functions (Keep for compatibility or deprecate) ...
const sendFriendRequest = async (req, res) => {
  // Redirect to follow logic or keep separate? 
  // For now, let's keep separate to avoid breaking old clients, 
  // BUT the UI will primarily use followUser.
  // Actually, let's just use followUser logic here if called? 
  // No, safer to keep distinct.
  const { recipientId } = req.params;
  const senderId = req.user._id;

  try {
    if (senderId.toString() === recipientId) {
       return res.status(400).json({ message: 'Cannot send request to yourself' });
    }

    const recipient = await User.findById(recipientId);
    if (!recipient) return res.status(404).json({ message: 'User not found' });

    if (recipient.pendingRequests.includes(senderId)) {
        return res.status(400).json({ message: 'Request already sent' });
    }
    if (recipient.friends.includes(senderId)) {
        return res.status(400).json({ message: 'Already friends' });
    }

    // Update Recipient
    await User.findByIdAndUpdate(recipientId, {
        $push: { pendingRequests: senderId }
    });

    // Update Sender
    await User.findByIdAndUpdate(senderId, {
        $push: { sentRequests: recipientId }
    });

    // Create Notification
    const notification = await Notification.create({
        recipient: recipientId,
        sender: senderId,
        type: 'friend_request',
        message: `${req.user.name} sent you a friend request`
    });

    // Real-time notification
    try {
        const socketId = getSocketId(recipientId);
        if (socketId) {
            const populatedNotif = await notification.populate('sender', 'name profilePic');
            getIo().to(socketId).emit('newNotification', populatedNotif);
        }
    } catch (e) {
        console.error("Socket emit error:", e);
    }

    res.json({ message: 'Friend request sent' });
  } catch (error) {
     console.error(error);
     res.status(500).json({ message: 'Server error' });
  }
};

const acceptFriendRequest = async (req, res) => {
  const senderId = req.params.requestId;
  const recipientId = req.user._id;

  try {
      const sender = await User.findById(senderId);
      if(!sender) return res.status(404).json({message: 'User not found'});

      await User.findByIdAndUpdate(recipientId, {
          $push: { friends: senderId },
          $pull: { pendingRequests: senderId }
      });

      await User.findByIdAndUpdate(senderId, {
          $push: { friends: recipientId },
          $pull: { sentRequests: recipientId }
      });

      // 1. Update the original notification for the RECIPIENT (me)
      // Find the notification where I am the recipient and the sender is the one I just accepted
      await Notification.findOneAndUpdate(
        { recipient: recipientId, sender: senderId, type: 'friend_request' },
        { 
            type: 'friend_request_confirmed', 
            message: `You started following ${sender.name}`,
            isRead: true 
        }
      );

      // 2. Notify Sender (Create NEW notification for them)
      const notification = await Notification.create({
        recipient: senderId,
        sender: recipientId,
        type: 'friend_accept',
        message: `${req.user.name} accepted your friend request`
      });

      // Real-time notification
      try {
        const socketId = getSocketId(senderId);
        if (socketId) {
            const populatedNotif = await notification.populate('sender', 'name profilePic');
            getIo().to(socketId).emit('newNotification', populatedNotif);
            // Emit event to update friend list
            getIo().to(socketId).emit('friendRequestAccepted', {
                _id: req.user._id,
                name: req.user.name,
                profilePic: req.user.profilePic,
                email: req.user.email,
                about: req.user.about
            });
        }
      } catch (e) { console.error("Socket emit error:", e); }

      res.json({ message: 'Friend request accepted', newFriend: sender });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const rejectFriendRequest = async (req, res) => {
    const senderId = req.params.requestId;
    const recipientId = req.user._id;

    try {
        await User.findByIdAndUpdate(recipientId, {
            $pull: { pendingRequests: senderId }
        });

        await User.findByIdAndUpdate(senderId, {
            $pull: { sentRequests: recipientId }
        });

        res.json({ message: 'Friend request rejected' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.user._id })
            .populate('sender', 'name profilePic')
            .sort({ createdAt: -1 });
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const getFriends = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('friends', 'name email profilePic about');
        res.json(user.friends);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const getSocialConnections = async (req, res) => {
    try {
        // Use params.userId if provided (to view others' lists), otherwise current user
        const targetId = req.params.userId || req.user._id;
        const user = await User.findById(targetId)
            .populate('followers', 'name email profilePic about')
            .populate('following', 'name email profilePic about');
            
        if (!user) return res.status(404).json({ message: 'User not found' });
        
        res.json({
            followers: user.followers,
            following: user.following
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Get user by ID (Public info)
const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (e) { res.status(500).json({ message: 'Server error' }); }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  searchUsers,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  getNotifications,
  getFriends,
  followUser,
  unfollowUser,
  getSocialConnections,
  getUserById
};