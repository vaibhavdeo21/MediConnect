const multer = require('multer');
const path = require('path');

// 1. Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Files will be saved in the 'uploads' folder
  },
  filename: (req, file, cb) => {
    // Save file as: record-TIMESTAMP-filename.ext
    cb(null, `record-${Date.now()}${path.extname(file.originalname)}`);
  }
});

// 2. File Filter (Optional: Allow only specific types)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|pdf/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only Images and PDFs are allowed!'));
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // Limit: 5MB
});

module.exports = upload;