// const { cloudinary, logger } = require("./../../config");
// const BaseService = require("./bases/BaseService");
// const { http, imageFolders } = require("../constants");
// const { CdnFolders, ResourceType } = require("../types/enums");
// const { UploadedFiles, FailedFiles } = require("../types");
// const { compressImage } = require("../utils");

const cloudinary = require("../config/cloudinary.js");
const logger = require("./../config/logger");
const BaseService = require("./bases/BaseService");
const { http, imageFolders } = require("../constants/constants");
const { ResourceType } = require("./../constants/static.js");
const compressImage = require("../utils/compressImage.js");

class ICloudinary extends BaseService {
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

        console.log("Hello");

        const MAX_RETRIES = 3;
        const RETRY_DELAY = (attempt) => new Promise(res => setTimeout(res, 500 * Math.pow(2, attempt)));

        await Promise.all(
            files.map(async (file) => {
                let attempt = 0;
                let success = false;

                while (attempt < MAX_RETRIES && !success) {
                    try {
                        const buffer = resourceType === ResourceType.IMAGE
                            ? await compressImage(file)
                            : { error: false, buffer: file.buffer };

                        if (!buffer.error) {
                            const result = await new Promise((resolve, reject) => {
                                const baseDetails = {
                                    resource_type: resourceType,
                                    folder: folder,
                                    timeout: 100000,
                                };
                                const uploadStreamDetails = resourceType === ResourceType.VIDEO
                                    ? {
                                        ...baseDetails,
                                        eager: [
                                            {
                                                format: "jpg",
                                                transformation: [
                                                    { width: 300, height: 200, crop: "thumb", start_offset: "auto" }
                                                ]
                                            }
                                        ]
                                    }
                                    : baseDetails;

                                const stream = cloudinary.uploader.upload_stream(
                                    uploadStreamDetails,
                                    (error, result) => {
                                        if (error) reject(error);
                                        else resolve(result);
                                    }
                                );
                                stream.end(buffer.buffer);
                            });

                            const thumbnail = resourceType === ResourceType.VIDEO && result.eager
                                ? result.eager[0].secure_url
                                : null;

                            const url = resourceType === ResourceType.IMAGE
                                ? this.getUrl(result.public_id)
                                : result.url;

                            const duration = resourceType === ResourceType.VIDEO
                                ? result.duration
                                : null;

                            uploadedFiles.push({
                                publicId: result.public_id,
                                size: String(result.bytes),
                                url: url,
                                mimeType: file.mimetype,
                                thumbnail: thumbnail,
                                duration: duration
                            });

                            publicIds.push(result.public_id);
                            success = true;
                        } else {
                            failedFiles.push({ filename: file.originalname, error: "Failed to compress image." });
                            break;
                        }
                    } catch (error) {
                        attempt++;
                        if (attempt >= MAX_RETRIES) {
                            console.error(`Upload failed for ${file.originalname}:`, error);
                            failedFiles.push({ filename: file.originalname, error: error.message });
                        } else {
                            console.warn(`Retrying upload for ${file.originalname} (Attempt ${attempt})...`);
                            await RETRY_DELAY(attempt);
                        }
                    }
                }
            })
        );

        return { uploadedFiles, failedFiles, publicIds };
    }

    async deleteFiles(publicIds) {
        try {
            const result = await cloudinary.api.delete_resources(publicIds);
            return this.responseData(200, false, "Files were deleted", result);
        } catch (error) {
            console.error(error);
            return this.responseData(500, true, "Something went wrong");
        }
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
                overwrite: true
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
                return super.responseData(200, false, "File has been deleted")
            }
            return super.responseData(404, true, "File not found");
        } catch (error) {
            logger.error(`Error deleting file: ${error.message}`);
            return super.responseData(500, true, http('500'));
        }
    }
}

module.exports = ICloudinary;