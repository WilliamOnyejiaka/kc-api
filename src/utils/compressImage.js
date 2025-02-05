const sharp = require("sharp");
const logger = require("../config/logger.js");

module.exports = async function compressImage(image) {
    try {
        const outputPath = `compressed/${image.filename}`;
        await sharp(image.path)
            .resize({
                height: 800, width: 800, fit: 'cover',
            })
            .webp({
                quality: 80
            })
            .toFile(outputPath);

        return {
            error: false,
            outputPath: outputPath
        }
    } catch (error) {
        logger.error(`Error processing the image: ${error}`);
        return {
            error: true,
            outputPath: null
        }
    }
}
