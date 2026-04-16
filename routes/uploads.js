const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const { upload } = require('../lib/upload');
const { requireAuth } = require('../middleware/auth');
const { createThumbnail, resizeImage } = require('../lib/imageProcessor');
const prisma = require('../lib/prisma');
const { validateUpload } = require('../middleware/uploadSecurity');


const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Max size is 5MB.' });
    }
    return res.status(400).json({ error: err.message });
  }
  if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
};

router.post('/avatar',
  requireAuth,
  upload.single('avatar'),
  handleUploadError,
  validateUpload,
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const thumbnailPath = await createThumbnail(req.file.path, 150, 150);
      const resizedPath = await resizeImage(req.file.path, 800);

      const user = await prisma.user.update({
        where: { id: req.user.sub },
        data: { avatar: req.file.filename },
        select: { id: true, email: true, role: true, avatar: true }
      });

      res.json({
        message: 'Avatar uploaded and processed',
        user,
        thumbnail: path.basename(thumbnailPath),
        resized: path.basename(resizedPath)
      });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ error: 'Upload failed' });
    }
  }
);

module.exports = router;