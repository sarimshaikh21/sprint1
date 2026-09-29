const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure credentials using variables from .env
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure cloud disk engine parameters
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'tickets_images',
        resource_type: 'auto',
        public_id: (req, file) => `img-${Date.now()}`
    }
});

const upload = multer({ storage: storage });
module.exports = upload;
