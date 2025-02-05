const logger = require("../config/logger");

function parseJson(jsonData) {
    try {
        const decodedJson = JSON.parse(jsonData);
        return {
            error: false,
            message: null,
            data: decodedJson
        };
    } catch (error) {
        logger.error(error.message);
        return {
            error: true,
            message: error.message,
            data: null
        };
    }
}

module.exports = parseJson;
