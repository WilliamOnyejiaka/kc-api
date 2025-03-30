const UserRegistration = require("../services/UserRegistration.js");
const Auth = require("../services/Auth.js");
const UserOTP = require("../services/UserOTP.js");
const { UserType } = require("./../constants/static.js");
const BaseFacade = require("./bases/BaseFacade");

class AuthenticationManagementFacade extends BaseFacade {

    constructor() {
        super();
        this.userRegistrationService = new UserRegistration();
        this.authService = new Auth();
        this.userOTPService = new UserOTP();
    }

    async memberSignUp(memberData,file) {
        return await this.userRegistrationService.memberSignUp(memberData,file);
    }

    async adminSignUp(adminData) {
        return await this.userRegistrationService.adminSignUp(adminData);
    }

    /**
     * General login method that works for customer, admin, and vendor
     * @param email User email
     * @param password User password
     * @param user User type (customer, admin, or vendor)
     */
    async login(email, password, user) {
        const loginMethods = {
            [UserType.Admin]: this.authService.adminLogin.bind(this.authService),
            [UserType.Member]: this.authService.memberLogin.bind(this.authService),
        };

        const loginMethod = loginMethods[user];
        return loginMethod ? await loginMethod(email, password) : this.service.responseData(500, true, "Invalid user type");
    }

    /**
     * Logs a user out with their jwt token
     * @param token User jwt token
     */
    async logOut(token) {
        return await this.authService.logOut(token);
    }

    /**
     * Sends OTP to the user based on their type
     * @param email User email
     * @param otpType OTP type
     * @param user User type (customer, admin, or vendor)
     */
    async sendUserOTP(email, otpType, user) {
        const sendOTPMethods = {
            [UserType.Admin]: this.userOTPService.sendAdminOTP.bind(this.userOTPService),
            [UserType.Member]: this.userOTPService.sendMemberOTP.bind(this.userOTPService)
        };

        const sendOTPMethod = sendOTPMethods[user];
        return sendOTPMethod ? await sendOTPMethod(email, otpType) : this.service.responseData(500, true, "Invalid user type");
    }

    /**
     * Verifies email for the user based on their type and OTP code
     * @param email User email
     * @param otpCode OTP code
     * @param user User type (customer, admin, or vendor)
     */
    async emailVerification(email, otpCode, user) {
        const verifyEmailMethods = {
            [UserType.Admin]: this.userOTPService.adminEmailVerification.bind(this.userOTPService),
            [UserType.Member]: this.userOTPService.memberEmailVerification.bind(this.userOTPService)
        };

        const verifyEmailMethod = verifyEmailMethods[user];
        return verifyEmailMethod ? await verifyEmailMethod(email, otpCode) : this.service.responseData(500, true, "Invalid user type");
    }

    /**
     * Verifies email for the user based on their type and OTP code
     * @param email User email
     * @param otpCode OTP code
     * @param password User's new password
     * @param user User type (customer, admin, or vendor)
     */
    async passwordReset(email, password, otpCode, user) {
        const verifyEmailMethods = {
            [UserType.Admin]: this.userOTPService.adminPasswordReset.bind(this.userOTPService),
            [UserType.Member]: this.userOTPService.memberPasswordReset.bind(this.userOTPService)
        };

        const verifyEmailMethod = verifyEmailMethods[user];
        return verifyEmailMethod ? await verifyEmailMethod(email, password, otpCode) : this.service.responseData(500, true, "Invalid user type");
    }

}

module.exports = AuthenticationManagementFacade;
