const path = require('path');
const fs = require('fs');

const validateUpload = (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  // Check mimetype and extension
  const filetypes = /jpeg|jpg|png|gif|webp/;
  const mimetype = filetypes.test(req.file.mimetype);
  const extname = filetypes.test(
    path.extname(req.file.originalname).toLowerCase()
  );

  if (!mimetype || !extname) {
    fs.unlinkSync(req.file.path);
    return res.status(400).json({ error: 'Only images allowed' });
  }

  // Check file size
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (req.file.size > maxSize) {
    fs.unlinkSync(req.file.path);
    return res.status(400).json({ error: 'File too large (max 5MB)' });
  }

  // Block SVG (XSS risk)
  if (req.file.mimetype === 'image/svg+xml') {
    fs.unlinkSync(req.file.path);
    return res.status(400).json({ error: 'SVG uploads not allowed (XSS risk)' });
  }

  next();
};

module.exports = { validateUpload };