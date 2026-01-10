const User = require('../models/user.model');
const Notification = require('../models/notification.model');
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
    const users = await User.find({
      $and: [
        { _id: { $ne: req.user._id } }, // Exclude self
        {
          $or: [
            { name: { $regex: query, $options: 'i' } },
            { email: { $regex: query, $options: 'i' } }
          ]
        }
      ]
    }).limit(10).lean();
    
    const currentUser = req.user;

    const usersWithStatus = users.map(user => {
      let status = 'none';
      if (currentUser.friends && currentUser.friends.some(id => id.toString() === user._id.toString())) {
        status = 'friend';
      } else if (currentUser.sentRequests && currentUser.sentRequests.some(id => id.toString() === user._id.toString())) {
        status = 'pending_sent';
      } else if (currentUser.pendingRequests && currentUser.pendingRequests.some(id => id.toString() === user._id.toString())) {
        status = 'pending_received';
      }
      return { ...user, connectionStatus: status };
    });

    res.json(usersWithStatus);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const sendFriendRequest = async (req, res) => {
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

module.exports = {
  getUserProfile,
  updateUserProfile,
  searchUsers,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  getNotifications,
  getFriends
};