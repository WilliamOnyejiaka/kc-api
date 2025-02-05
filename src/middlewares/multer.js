
const multer = require('multer');
const path = require('path');
const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png'];
const fileSize = 3.0 * 1024 * 1024;

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    if (!allowedMimeTypes.includes(file.mimetype)) {
        return cb(new Error("LIMIT_INVALID_FILE_TYPE"));
    }
    return cb(null, true);
}

const uploads = multer({
    storage: storage,
    limits: {
        fileSize: fileSize
    },
    fileFilter: fileFilter
});

export default uploads;
