const cloudinary = require("../config/cloudinary.js");
const logger = require("./../config/logger");
const BaseService = require("./bases/BaseService");
const { http, imageFolders } = require("../constants/constants");
const { ResourceType } = require("./../constants/static.js");
const compressImage = require("../utils/compressImage.js");

class CloudinaryService extends BaseService {
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

    async upload(files, resourceType, folder) {
        const uploadedFiles = [];
        const failedFiles = [];
        const publicIds = [];

        await Promise.all(
            files.map(async (file) => {
                try {
                    const buffer = resourceType === ResourceType.IMAGE ? await compressImage(file) : { error: false, buffer: file.buffer };
                    if (!buffer.error) {
                        const result = await new Promise((resolve, reject) => {
                            const stream = cloudinary.uploader.upload_stream(
                                { resource_type: resourceType, folder: folder, timeout: 100000 },
                                (error, result) => {
                                    if (error) reject(error);
                                    else resolve(result);
                                }
                            );
                            stream.end(buffer.buffer);
                        });

                        const url = resourceType === ResourceType.IMAGE ? this.getUrl(result.public_id) : result.url;
                        result.url = url;
                        uploadedFiles.push({
                            publicId: result.public_id,
                            size: String(result.bytes),
                            imageUrl: result.url,
                            mimeType: file.mimetype
                        });
                        publicIds.push(result.public_id);
                    } else {
                        failedFiles.push({ filename: file.originalname, error: "Failed to compress image." });
                    }
                } catch (error) {
                    console.error(`Upload failed for ${file.originalname}:`, error);
                    failedFiles.push({ filename: file.originalname, error: error.message });
                }
            })
        );

        return { uploadedFiles, failedFiles, publicIds };
    }

    async deleteFiles(publicIds) {
        try {
            return await cloudinary.api.delete_resources(publicIds);
        } catch (error) {
            console.error(error);
            return false;
        }
    }

    async uploadImage(filePath, imageFolder) {
        let uploadResult = null;
        let folder = imageFolders(imageFolder);

        try {
            uploadResult = await cloudinary.uploader.upload(filePath, { resource_type: "auto", folder: folder });
        } catch (error) {
            logger.error(`Error uploading file: ${error.message}`, { filePath, imageFolder });
            return super.httpResponseData(500, true, http('500'));
        }

        const url = this.getUrl(uploadResult.public_id);

        return super.httpResponseData(201, false, null, {
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

            return super.httpResponseData(201, false, null, {
                imageData: uploadResult,
                url
            });
        } catch (error) {
            logger.error(`Error updating file: ${error.message}`, { filePath });
            return super.httpResponseData(500, true, http('500'));
        }
    }

    fileOptions(type) {
        const resourceMap = {
            'image': {},
            'audio': { resource_type: "video" },
            'video': { resource_type: "video" },
        };
        return resourceMap[type] || {};
    }

    async delete(publicID, type = "image") {
        const options = this.fileOptions(type);

        try {
            const response = await cloudinary.uploader.destroy(publicID, options);
            if (response.result == "ok") {
                return super.httpResponseData(200, false, "File has been deleted");
            }
            return super.httpResponseData(404, true, "File not found");
        } catch (error) {
            logger.error(`Error deleting file: ${error.message}`);
            return super.httpResponseData(500, true, http('500'));
        }
    }
}

module.exports = CloudinaryService;
