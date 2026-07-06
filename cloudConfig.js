if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const cloudinaryUrl = process.env.CLOUDINARY_URL;
const hasPlaceholder = (value) => value && /<your_|your_api_key|your_api_secret|placeholder/i.test(value);
const hasCloudinaryCredentials = Boolean(
  cloudinaryUrl || (
    process.env.CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  )
);

const localUploadDirectory = path.join(__dirname, 'public', 'uploads');

if (!fs.existsSync(localUploadDirectory)) {
  fs.mkdirSync(localUploadDirectory, { recursive: true });
}

if (
  hasCloudinaryCredentials && (
    hasPlaceholder(cloudinaryUrl) ||
    hasPlaceholder(process.env.CLOUD_NAME) ||
    hasPlaceholder(process.env.CLOUDINARY_API_KEY) ||
    hasPlaceholder(process.env.CLOUDINARY_API_SECRET)
  )
) {
  throw new Error("Replace the placeholder Cloudinary credentials in .env with your real Cloudinary values.");
}

const cloudinaryConfig = cloudinaryUrl ? {
    cloudinary_url: cloudinaryUrl
} : {
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
};

const storage = hasCloudinaryCredentials
  ? new CloudinaryStorage({
      cloudinary: cloudinary,
      params: {
        folder: 'wanderlust_DEV',
        allow_formats: ['jpeg', 'png', 'jpg'],
      },
    })
  : multer.diskStorage({
      destination: localUploadDirectory,
      filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
      }
    });

if (hasCloudinaryCredentials) {
  cloudinary.config(cloudinaryConfig);
}

module.exports = {
  cloudinary,
  storage,
  usesCloudinary: hasCloudinaryCredentials
};
