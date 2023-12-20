const express = require('express');
const router = express.Router();
const User = require("../model/User");
const Developer = require("../model/Developer");

// Get all users of types Developer and User

router.get('/dashboard', async (req, res) => {
    try {
      const users = await Promise.all([
        User.find().select('username email'),
        Developer.find().select('username email'),
      ]);
  
      const allUsers = users.flat(); // Combine User and Developer data
      res.json(allUsers);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

// Delete a user by ID
router.delete('/dashboard/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await User.findByIdAndRemove(id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});


module.exports = router;
