const fs = require("fs");
const Cloudinary = require("./Cloudinary.js");
const compressImage = require("../utils/compressImage.js");
const http = require("../constants/http.js");
const logger = require("./../config/logger.js");
const BaseService = require("./bases/BaseService");

const bytesToKB = (bytes) => (bytes / 1024).toFixed(2); // Converts bytes to KB
const bytesToMB = (bytes) => (bytes / (1024 * 1024)).toFixed(2); // Converts bytes to MB

class ImageService extends BaseService {

    constructor() {
        super();
        this.cloudinary = new Cloudinary();
    }

    async deleteFiles(files) {
        const deletionPromises = files.map(file => {
            const filePath = typeof file === 'string' ? file : file.path;
            const fieldname = typeof file === 'string' ? undefined : file.fieldname;

            return fs.promises
                .unlink(filePath)
                .then(() => ({ success: true, path: filePath, fieldname }))
                .catch(error => ({ success: false, path: filePath, fieldname, error }));
        });

        const results = await Promise.all(deletionPromises);

        const errors = results.filter(result => !result.success);
        if (errors.length > 0) {
            logger.error(`Failed to delete some files: ${JSON.stringify(errors)}`);
            return true; // Indicate that there were errors
        }
        return false; // All deletions succeeded
    }

    async processAndUpload(image, imageFolder) {
        const result = await compressImage(image);

        if (result.error) {
            return this.responseData(
                500,
                true,
                http("500"),
            );
        }

        const deleted = await this.deleteFiles([image]);
        if (deleted) {
            return this.responseData(500, true, http('500'));
        }

        const uploadResult = await this.cloudinary.uploadImage(result.outputPath, imageFolder);
        const deletedCompressedImage = await this.deleteFiles([result.outputPath]);
        if (deletedCompressedImage) {
            return this.responseData(500, true, http('500'));
        }
        return uploadResult;
    }

    async uploadImages(images, uploadFolders) {
        try {
            const uploadPromises = images.map(async (image) => {
                const fieldName = image.fieldname;
                const uploadFolder = uploadFolders[fieldName];

                const uploadResult = await this.processAndUpload(image, uploadFolder);

                if (uploadResult.json.error) {
                    return {
                        success: false,
                        fieldName,
                        message: `Failed to upload ${fieldName}: ${uploadResult.json.message}`,
                    };
                }

                return {
                    success: true,
                    fieldName,
                    data: {
                        mimeType: uploadResult.json.data.imageData.format,
                        imageUrl: uploadResult.json.data.url,
                        publicId: uploadResult.json.data.imageData.public_id,
                        size: uploadResult.json.data.imageData.bytes,
                    },
                };
            });

            const results = await Promise.all(uploadPromises);

            const successfulUploads = results.filter((result) => result.success);
            const errors = results.filter((result) => !result.success);

            const uploadedImages = successfulUploads.reduce((acc, { fieldName, data }) => {
                acc[fieldName] = data;
                return acc;
            }, {});

            if (errors.length > 0) {
                return {
                    success: false,
                    data: uploadedImages,
                    error: errors.map((e) => ({ fieldName: e.fieldName, message: e.message })),
                };
            }

            return { success: true, data: uploadedImages };
        } catch (error) {
            console.log(error);
            return {
                success: false,
                error: [{ fieldName: "unknown", message: error.message || "An unexpected error occurred" }],
            };
        }
    }

    async uploadImage(image, parentId, repo, imageFolder) {
        const imageExists = await repo.getImage(parentId);
        if (imageExists.error) {
            await this.deleteFiles([image]);
            return this.responseData(imageExists.type, true, imageExists.message);
        }

        if (imageExists.data) {
            await this.deleteFiles([image]);
            return this.responseData(400, true, "A record with this data already exists.");
        }

        const uploadResult = await this.processAndUpload(image, imageFolder);

        if (uploadResult.json.error) {
            return uploadResult;
        }

        const repoResult = await repo.insertImage({
            mimeType: uploadResult.json.data.imageData.format,
            imageUrl: uploadResult.json.data.url,
            publicId: uploadResult.json.data.imageData.public_id,
            size: uploadResult.json.data.imageData.bytes,
            parentId: parentId
        });

        return !repoResult.error ?
            this.responseData(
                201,
                false,
                "Image was uploaded successfully",
                { imageUrl: uploadResult.json.data.url }
            ) :
            this.responseData(repoResult.type, true, repoResult.message);
    }

    async deleteCloudinaryImage(publicID) {
        return await this.cloudinary.delete(publicID);
    }
}

module.exports = ImageService;
