const sharp = require("sharp");
const logger = require("../config/logger.js");

async function compressImage(image) {
    try {
        const buffer = await sharp(image.buffer)
            .resize({
                height: 800, width: 800, fit: 'cover',
            })
            .webp({
                quality: 80
            })
            .toBuffer();

        return { error: false, buffer };
    } catch (error) {
        logger.error(`Error processing the image: ${error}`);
        return {
            error: true,
            buffer: null
        };
    }
}

module.exports = compressImage;
