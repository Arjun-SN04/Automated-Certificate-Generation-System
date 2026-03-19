const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary with credentials from .env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Cloudinary storage — logos stored in 'IFOA_LOGO' folder
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder:          'IFOA_LOGO',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'svg'],
    transformation:  [{ width: 400, height: 400, crop: 'limit' }],
  },
});

// Multer — max 2 MB, images only
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed.'), false);
    }
    cb(null, true);
  },
});

module.exports = { upload, cloudinary };
