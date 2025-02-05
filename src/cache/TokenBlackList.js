

class TokenBlackList extends require('./BaseCache.js') {

    constructor() {
        super('blacklist');
    }
}

module.exports = TokenBlackList;