const Status = require('../models/status.model');
const User = require('../models/user.model');

// Create a new status
const createStatus = async (req, res) => {
  const { content, contentType } = req.body;
  if (!content) {
    return res.status(400).json({ message: 'Status content is required' });
  }

  try {
    const newStatus = new Status({
      userId: req.user._id,
      content,
      contentType: contentType || 'text', // Default to text if not provided
    });
    
    await newStatus.save();
    res.status(201).json(newStatus);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get statuses from the user's contacts
const getStatuses = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id);
    const contactIds = currentUser.contacts;
    
    // Find statuses from all contacts + self, group by user
    const statuses = await Status.find({ 
      userId: { $in: [...contactIds, req.user._id] } 
    }).populate('userId', 'name profilePic')
      .sort({ createdAt: -1 });
      
    // Group statuses by user
    const groupedStatuses = statuses.reduce((acc, status) => {
      const userId = status.userId._id.toString();
      if (!acc[userId]) {
        acc[userId] = {
          user: status.userId,
          statuses: []
        };
      }
      acc[userId].statuses.push(status);
      return acc;
    }, {});

    res.json(Object.values(groupedStatuses));
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createStatus,
  getStatuses,
};