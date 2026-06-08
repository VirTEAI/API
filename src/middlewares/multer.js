const multer = require('multer');

const ALLOWED_MIMETYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    if (ALLOWED_MIMETYPES.has(file.mimetype)) return cb(null, true);
    return cb(new Error('Tipo de arquivo inválido. Use JPEG, PNG ou WEBP.'));
  }
});

module.exports = upload;
