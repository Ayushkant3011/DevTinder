const express = require('express');
const mongoose = require('mongoose');
const imageRouter = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { userAuth } = require('../middlewares/auth'); // your existing auth middleware
const User = require('../models/user');
const ConnectionRequestModel = require("../models/connectionRequest");

// Configure Cloudinary (put keys in .env)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB limit

// GET /images — fetch logged-in user's images
imageRouter.get('/images/view', userAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('images');
    res.json({ images: user.images });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch images' });
  }
});

// POST /images/upload — upload an image
imageRouter.post('/images/upload', userAuth, upload.single('image'), async (req, res) => {
  try {
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
            folder: 'devtinder_users',
            resource_type: 'auto',
        },
        (error, result) => (error ? reject(error) : resolve(result))
      );
      stream.end(req.file.buffer);
    });

    const newImage = {
      url: result.secure_url,
      publicId: result.public_id,
    };

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $push: { images: newImage } },
      { new: true }
    );

    res.json({ image: newImage });
  } catch (err) {
    console.error("Upload error:", err); // ADD THIS
    res.status(500).json({ error: err.message || err });
  }
});

// // DELETE /images/:publicId — delete an image
// imageRouter.delete('/images/:publicId', userAuth, async (req, res) => {
//   try {
//     const publicId = decodeURIComponent(req.params.publicId);

//     await cloudinary.uploader.destroy(publicId);

//     await User.findByIdAndUpdate(req.user._id, {
//       $pull: { images: { publicId } },
//     });

//     res.json({ success: true });
//   } catch (err) {
//     res.status(500).json({ error: 'Delete failed' });
//   }
// });


// GET /images/view/:userId — fetch connection's images
imageRouter.get('/images/view/:userId', userAuth, async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const requestedUserId = req.params.userId;

    if (!mongoose.Types.ObjectId.isValid(requestedUserId)) {
        return res.status(400).json({
            error: "Invalid user ID"
        });
    }
    // Make sure the requested user is actually connected
    const connection = await ConnectionRequestModel.findOne({
      status: "accepted",
      $or: [
        {
          fromUserId: loggedInUserId,
          toUserId: requestedUserId
        },
        {
          fromUserId: requestedUserId,
          toUserId: loggedInUserId
        }
      ]
    });

    if (!connection) {
      return res.status(403).json({
        error: "You can only view images of your connections"
      });
    }

    const user = await User.findById(requestedUserId).select("images");

    if (!user) {
      return res.status(404).json({
        error: "User not found"
      });
    }

    res.json({
      images: user.images || []
    });

  } catch (err) {
    console.error("Fetch connection images error:", err);

    res.status(500).json({
      error: "Failed to fetch images"
    });
  }
});

module.exports = imageRouter;