const multer = require('multer');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadsPath = process.env.PICS_UPLOADS_PATH || 'uploads';
    cb(null, uploadsPath);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  // reject a file
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(new Error('This type of file is not supported'), null, false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: process.env.PICS_UPLOADS_MAX_SIZE ? Number(process.env.PICS_UPLOADS_MAX_SIZE) : 1024 * 1024 * 5,
  },
  fileFilter: fileFilter,
});

module.exports = { upload };
