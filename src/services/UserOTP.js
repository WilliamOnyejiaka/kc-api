const OTP = require("./OTP.js");
const env = require("../config/env.js");
const constants = require("../constants/constants.js");
const { OTPType, UserType } = require("../constants/static.js");
const Password = require("../utils/Password.js");
const Authentication = require("./bases/Authentication.js");

class UserOTP extends Authentication {

    constructor() {
        super();
    }

    async sendUserOTP(repo, email, otpType, userType) {
        console.log(userType);

        const repoResult = await repo.getUserProfileWithEmail(email);
        const repoResultError = this.handleRepoError(repoResult);
        if (repoResultError) return repoResultError;

        const userProfile = repoResult.data;

        if (userProfile) {
            const userName = userProfile.firstName + " " + userProfile.lastName;
            const otpService = new OTP(userProfile.email, otpType, userType);
            const otpServiceResult = await otpService.send(userName);
            return otpServiceResult;
        }

        return super.responseData(404, true, constants('404User'));
    }

    async sendMemberOTP(email, otpType) {
        return await this.sendUserOTP(this.memberRepo, email, otpType, UserType.Member);
    }

    async sendAdminOTP(email, otpType) {
        return await this.sendUserOTP(this.adminRepo, email, otpType, UserType.Admin);
    }

    async emailVerification(repo, cache, email, otpCode, userType) {
        const otp = new OTP(email, OTPType.Verification, userType);
        const otpServiceResult = await otp.confirmOTP(otpCode);

        if (otpServiceResult.json.error) return otpServiceResult;

        const deletedOTPServiceResult = await otp.deleteOTP();

        if (deletedOTPServiceResult.json.error) {
            return deletedOTPServiceResult;
        }

        const updatedResult = await repo.updateVerifiedStatus(email);
        const updatedResultError = this.handleRepoError(updatedResult);
        if (updatedResultError) return updatedResultError;

        const repoResult = userType === "admin" ? await this.adminRepo.getAdminAndRoleWithEmail(email) : await repo.getUserProfileWithEmail(email);
        const repoResultError = this.handleRepoError(repoResult);
        if (repoResultError) return repoResultError;

        const userProfile = repoResult.data;

        if (userProfile) {
            this.setUserProfilePicture(userProfile, repo);
            delete userProfile.password;
            delete userProfile[repo.imageRelation];

            const cacheSuccessful = await cache.set(
                userProfile.id,
                userProfile
            );

            return cacheSuccessful ? super.responseData(200, false, otpServiceResult.json.message, {
                token: userType === "admin" ? this.generateAdminToken(userProfile) : this.generateUserToken(userProfile.id, userType),
                vendor: userProfile
            }) : super.responseData(500, true, constants('500'));
        }
        return super.responseData(404, true, constants('404User'));
    }

    async memberEmailVerification(email, otpCode) {
        return await this.emailVerification(this.memberRepo, this.memberCache, email, otpCode, UserType.Member);
    }

    async adminEmailVerification(email, otpCode) {
        return await this.emailVerification(this.adminRepo, this.adminCache, email, otpCode, UserType.Admin);
    }

    async passwordReset(repo, cache, email, password, otpCode, userType) {
        const otp = new OTP(email, OTPType.Reset, userType);
        const otpServiceResult = await otp.confirmOTP(otpCode);

        if (otpServiceResult.json.error) return otpServiceResult;

        const deletedOTPServiceResult = await otp.deleteOTP();

        if (deletedOTPServiceResult.json.error) {
            return deletedOTPServiceResult;
        }

        const hashedPassword = Password.hashPassword(password, env("storedSalt"));
        const updatedResult = await repo.updatePassword(email, hashedPassword);
        const updatedResultError = this.handleRepoError(updatedResult);
        if (updatedResultError) return updatedResultError;

        const repoResult = userType === "admin" ? await this.adminRepo.getAdminAndRoleWithEmail(email) : await repo.getUserProfileWithEmail(email);
        const repoResultError = this.handleRepoError(repoResult);
        if (repoResultError) return repoResultError;

        const userProfile = repoResult.data;

        if (userProfile) {
            this.setUserProfilePicture(userProfile, repo);
            delete userProfile.password;
            delete userProfile[repo.imageRelation];

            return super.responseData(200, false, "Password has been reset successfully");
        }
        return super.responseData(404, true, constants('404User'));
    }

    async adminPasswordReset(email, password, otpCode) {
        return await this.passwordReset(this.adminRepo, this.adminCache, email, password, otpCode, UserType.Admin);
    }

    async memberPasswordReset(email, password, otpCode) {
        return await this.passwordReset(this.memberRepo, this.memberCache, email, password, otpCode, UserType.Member);
    }
}

module.exports = UserOTP;
