const { logger } = require("../config");

const validateFileUpload = (req, res, next) => {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        logger.warn(`⚠️  No file has been uploaded`);
        return res.status(400).json({
            error: true,
            message: "No file uploaded",
            data: {}
        });
    }

    if (req.files.length > 3) {
        logger.warn(`⚠️ File limit exceeded! Received ${req.files.length} files.`);
        return res.status(400).json({
            error: true,
            message: `⚠️ File limit exceeded! Received ${req.files.length} files.`,
            data: {}
        });
    }

    next();
};

module.exports = validateFileUpload;
