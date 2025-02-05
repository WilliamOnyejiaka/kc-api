const ImageService = require("../../services/Image.js");

class Controller {

    static imageService = new ImageService();

    static async deleteFiles(files) {
        return await Controller.imageService.deleteFiles(files);
    }

    static paginate(service) {
        return async (req, res) => {
            const { page, pageSize } = req.query;
            const serviceResult = await service.paginate(page, pageSize);
            res.status(serviceResult.statusCode).json(serviceResult.json);
        };
    }

    static handleValidationErrors(res, validationErrors) {
        const error = JSON.parse(validationErrors.array()[0].msg);
        res.status(error.statusCode).json({ error: true, message: error.message });
    }

    static response(res, responseData) {
        res.status(responseData.statusCode).json(responseData.json);
    }
}

module.exports = Controller;
