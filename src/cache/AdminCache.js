const BaseCache = require("./BaseCache");

class AdminCache extends BaseCache {
    constructor() {
        super('admin', 2_592_000);
    }
}

module.exports = AdminCache;
