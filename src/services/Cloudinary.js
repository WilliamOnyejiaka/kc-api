const cloudinary = require("../config/cloudinary.js");
const logger = require("./../config/logger.js");
const BaseService = require("./bases/BaseService.js");
const imageFolders = require("../constants/imageFolders.js");
const http = require("../constants/http.js");

class Cloudinary extends BaseService {

    constructor() {
        super();
    }   

    getUrl(publicId) {
        return cloudinary.url(publicId, {
            transformation: [
                { fetch_format: 'auto' },
                { quality: 'auto' }
            ]
        });
    }

    async uploadImage(filePath, imageFolder) {
        let uploadResult = null;
        let folder = imageFolders(imageFolder);

        try {
            uploadResult = await cloudinary.uploader.upload(filePath, { resource_type: "auto", folder: folder });
        } catch (error) {
            logger.error(`Error uploading file: ${error.message}`, { filePath, imageFolder });
            return super.responseData(500, true, http('500'));
        }

        const url = this.getUrl(uploadResult.public_id);

        return super.responseData(201, false, null, {
            imageData: uploadResult,
            url
        });
    }

    async updateImage(filePath, publicID) {
        try {
            const uploadResult = await cloudinary.uploader.upload(filePath, {
                public_id: publicID,
                overwrite: true // Ensures the image is replaced
            });
            const url = this.getUrl(uploadResult.public_id);

            return super.responseData(201, false, null, {
                imageData: uploadResult,
                url
            });
        } catch (error) {
            logger.error(`Error updating file: ${error.message}`, { filePath });
            return super.responseData(500, true, http('500'));
        }
    }

    fileOptions(type) {
        const resourceMap = Object.freeze({
            'image': {},
            'audio': { resource_type: "video" },
            'video': { resource_type: "video" },
        });
        return resourceMap[type] || {};
    }

    async delete(publicID, type = "image") {
        const options = this.fileOptions(type);

        try {
            const response = await cloudinary.uploader.destroy(publicID, options);
            if (response.result === "ok") {
                return super.responseData(200, false, "File has been deleted");
            }
            return super.responseData(404, true, "File not found");
        } catch (error) {
            logger.error(`Error deleting file: ${error.message}`);
            return super.responseData(500, true, http('500'));
        }
    }
}

module.exports = Cloudinary;
