const BaseCache = require("./BaseCache");

class AdminKey extends BaseCache {

    constructor() {
        super('adminKey', 900);
    }

    async set(key, data = "adminKey", expirationTime) {
        return await super.set(key, data);
    }
}

module.exports = AdminKey;
