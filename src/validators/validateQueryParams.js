const numberValidator = require("./numberValidator.js");

module.exports = function validateQueryParams(params) {
    return (req, res, next) => {
        const sanitizedQuery = {};

        for (const param of params) {
            const value = req.query[param.name];

            // Check if parameter is missing
            if (value === undefined || value === null) {
                res.status(400).json({
                    error: true,
                    message: `${param.name} is missing`,
                });
                return;
            }

            if (param.type === "number") {
                const numberResult = numberValidator(value);
                if (numberResult.error) {
                    res.status(400).json({
                        error: true,
                        message: `${param.name} must be a valid number`
                    });
                    return;
                }
                sanitizedQuery[param.name] = numberResult.number;
            } else if (typeof value !== param.type) {
                res.status(400).json({
                    error: true,
                    message: `${param.name} must be of type ${param.type}`,
                });
                return;
            } else {
                sanitizedQuery[param.name] = value;
            }
        }

        req.query = sanitizedQuery;
        next();
    };
};
