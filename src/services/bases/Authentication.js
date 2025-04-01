const UserCache = require("../../cache/MemberCache.js");
const TokenBlackList = require("../../cache/TokenBlackList.js");
const env = require("../../config/env.js");
const User = require("../../repos/User.js");
const Admin = require("../../repos/Admin.js");
const Token = require("../Token");
const BaseService = require("./BaseService");
const AdminCache = require("../../cache/AdminCache.js");


class Authentication extends BaseService {

    userCache = new UserCache();
    adminRepo = new Admin();
    userRepo = new User();
    adminCache = new AdminCache();

    constructor() {
        super();
        this.storedSalt = env("storedSalt");
        this.tokenSecret = env('tokenSecret');
        this.secretKey = env('secretKey');
        this.tokenBlackListCache = new TokenBlackList();
    }

    generateToken(data, role) {
        return Token.createToken(this.tokenSecret, data, [role]);
    }

    generateUserToken(userId, role) {
        return this.generateToken({ id: userId }, role);
    }

    generateAdminToken(admin) {
        return this.generateToken(admin, "admin");
    }

    setUserProfilePicture(userProfile, repo) {
        userProfile.profilePictureUrl = userProfile[repo.imageRelation].length !== 0 ? userProfile[repo.imageRelation][0].imageUrl : null;
    }
}

module.exports = Authentication;
