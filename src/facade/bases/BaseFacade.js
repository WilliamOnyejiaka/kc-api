const HttpStatus = require("../../constants/HttpStatus");
const BaseService = require("../../services/bases/BaseService");

class BaseFacade {

    constructor(invalidTypeMessage = "Invalid type") {
        this.service = new BaseService();
        this.invalidTypeMessage = invalidTypeMessage;
    }

    handleServiceError(serviceResult) {
        if (serviceResult.json.error) {
            return serviceResult;
        }
        return null;
    }

    invalidType() {
        return this.service.responseData(HttpStatus.INTERNAL_SERVER_ERROR, true, this.invalidTypeMessage);
    }
}

module.exports = BaseFacade;
