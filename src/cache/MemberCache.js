const BaseCache = require("./BaseCache");

class MemberCache extends BaseCache {
    constructor() {
        super('member', 2_592_000);
    }
}

module.exports = MemberCache;
