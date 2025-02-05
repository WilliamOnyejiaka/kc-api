const bodyValidator = require("./../../validators/bodyValidator.js");

const validateBody = (neededAttributes) => (req, res, next) => {
    const validationResponse = bodyValidator(req.body, neededAttributes);

    if (validationResponse.error) {
        return res.status(400).json(validationResponse);
    }

    next();
};

module.exports = validateBody;
