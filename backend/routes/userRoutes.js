const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const auth = require('../middleware/auth');
const User = require('../models/User');

// Ensure uploads directory exists
const createUploadsDirectory = async () => {
  const uploadDir = path.join(__dirname, '..', 'uploads', 'profile-images');
  try {
    await fs.mkdir(uploadDir, { recursive: true });
  } catch (error) {
    console.error('Error creating uploads directory:', error);
  }
};

createUploadsDirectory();

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: async function (req, file, cb) {
    const uploadDir = path.join(__dirname, '..', 'uploads', 'profile-images');
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image! Please upload an image.'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: fileFilter
});

// Profile image upload route
router.post('/profile-image', auth, async (req, res) => {
  try {
    // Handle the file upload
    upload.single('profileImage')(req, res, async function(err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ message: 'File too large. Maximum size is 5MB.' });
        }
        return res.status(400).json({ message: err.message });
      } else if (err) {
        return res.status(400).json({ message: err.message });
      }

      try {
        if (!req.file) {
          return res.status(400).json({ message: 'Please upload an image file.' });
        }

        const imageUrl = `/uploads/profile-images/${req.file.filename}`;

        // Delete old profile image if it exists
        if (req.user.profileImage) {
          const oldImagePath = path.join(__dirname, '..', req.user.profileImage);
          try {
            await fs.access(oldImagePath);
            await fs.unlink(oldImagePath);
          } catch (error) {
            console.error('Error deleting old profile image:', error);
          }
        }

        // Update user profile in database
        req.user.profileImage = imageUrl;
        await req.user.save();

        res.json({
          message: 'Profile image updated successfully',
          user: {
            _id: req.user._id,
            fullName: req.user.fullName,
            email: req.user.email,
            profileImage: req.user.profileImage
          }
        });
      } catch (error) {
        console.error('Error processing upload:', error);
        res.status(500).json({ message: 'Error processing upload' });
      }
    });
  } catch (error) {
    console.error('Error in upload route:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
