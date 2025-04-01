const Token = require("./Token.js");
const constants = require("../constants/constants.js");
const http = require("../constants/http.js");
const HttpStatus = require("./../constants/HttpStatus.js");
const { UserType } = require("../constants/static.js");
const Password = require("../utils/Password.js");
const Authentication = require("./bases/Authentication");

class Auth extends Authentication {

    constructor() {
        super();
    }

    async login(repo, logInDetails, cache, role) {
        const repoResult = role === "admin" ? await this.adminRepo.getAdminAndRoleWithEmail(logInDetails.email) : await repo.getUserProfileWithEmail(logInDetails.email);

        const errorResponse = super.handleRepoError(repoResult);
        if (errorResponse) return errorResponse;

        const user = repoResult.data;

        if (user) {
            const hashedPassword = user.password;
            const validPassword = Password.compare(logInDetails.password, hashedPassword, this.storedSalt);

            if (validPassword) {
                user.profilePictureUrl = user[repo.imageRelation].length !== 0 ? user[repo.imageRelation][0].imageUrl : null;
                delete user[repo.imageRelation];
                delete user.password;
                const cacheSuccessful = await cache.set(
                    String(user.id),
                    user
                );

                const token = role === "admin" ? this.generateAdminToken(user) : this.generateUserToken(user.id, role);

                return cacheSuccessful ? super.responseData(200, false, "Login was successful", {
                    token: token,
                    user: user
                }) : super.responseData(HttpStatus.INTERNAL_SERVER_ERROR, true, http(HttpStatus.INTERNAL_SERVER_ERROR.toString()));
            }
            return super.responseData(HttpStatus.BAD_REQUEST, true, "Invalid password");
        }
        return super.responseData(HttpStatus.NOT_FOUND, true, constants("404User"));
    }

    async userLogin(email, password) {
        return await this.login(this.userRepo, { email, password }, this.userCache, UserType.User);
    }

    async adminLogin(email, password) {
        return await this.login(this.adminRepo, { email, password }, this.adminCache, UserType.Admin);
    }

    async logOut(token) {
        const tokenValidationResult = Token.validateToken(token, ["any"], this.tokenSecret);

        if (tokenValidationResult.error) {
            return super.responseData(400, true, tokenValidationResult.message);
        }

        const decoded = Token.decodeToken(token);
        const blacklisted = await this.tokenBlackListCache.set(token, { data: decoded.data, types: decoded.types }, decoded.expiresAt);

        return blacklisted ?
            super.responseData(200, false, "User has been logged out successfully") :
            super.responseData(500, true, http('500'));
    }

    async requestPasswordOTP() {
        // Implementation to be added
    }

    async resetPassword() {
        // Implementation to be added
    }
}

module.exports = Auth;
