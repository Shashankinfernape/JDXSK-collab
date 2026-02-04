const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure Storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // chatID-timestamp-random.ext
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        let ext = path.extname(file.originalname);
        
        // If extension is missing, try to infer it from mimetype
        if (!ext) {
            if (file.mimetype === 'audio/webm' || file.mimetype === 'video/webm') {
                ext = '.webm';
            } else if (file.mimetype === 'audio/ogg' || file.mimetype === 'video/ogg') {
                ext = '.ogg';
            } else if (file.mimetype === 'audio/mpeg') {
                ext = '.mp3';
            } else if (file.mimetype === 'image/jpeg') {
                ext = '.jpg';
            } else if (file.mimetype === 'image/png') {
                ext = '.png';
            } else if (file.mimetype === 'image/gif') {
                ext = '.gif';
            } else if (file.mimetype === 'image/webp') {
                ext = '.webp';
            }
        }
        
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

// File Filter (Audio & Images)
const fileFilter = (req, file, cb) => {
    if (
        file.mimetype.startsWith('image/') || 
        file.mimetype.startsWith('audio/') ||
        file.mimetype === 'video/webm' || 
        file.mimetype === 'video/ogg' ||
        file.mimetype === 'application/octet-stream'
    ) {
        cb(null, true);
    } else {
        // Fallback: Check extension if mimetype is weird
        if (file.originalname.match(/\.(webm|mp3|wav|m4a|ogg|jpg|jpeg|png|gif|webp)$/i)) {
             cb(null, true);
        } else {
             cb(new Error('Invalid file type. Only images and audio are allowed!'), false);
        }
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

module.exports = upload;