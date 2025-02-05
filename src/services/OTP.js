const Email = require("./Email.js");
const OTPCache = require("../cache/OTPCache");
const constants = require("../constants/constants");
const BaseService = require("./bases/BaseService.js");
const { OTPType } = require("../constants/static.js");
const path = require("path");
const randomInt = require("../utils/randomInt.js");

class OTP extends BaseService {

    constructor(email, otpType, userType) {
        super();
        const cachePreKey = otpType + "-" + userType;
        this.cache = new OTPCache(cachePreKey);
        this.email = email;
        this.otpType = otpType;
        this.userType = userType;
    }

    generateOTP() {
        let otp = "";
        for (let i = 0; i <= 5; i++) otp += randomInt(0, 9);
        return otp;
    }

    async storeOTP(otpCode) {
        return await this.cache.set(this.email, otpCode);
    }

    emailSubject() {
        return {
            [OTPType.Verification]: "Email Verification",
            [OTPType.Reset]: "Password Reset"
        }[this.otpType];
    }

    emailTemplate() {
        return {
            [OTPType.Verification]: path.join(__dirname, './../views', "email.ejs"),
            [OTPType.Reset]: path.join(__dirname, './../views', "reset-password.ejs")
        }[this.otpType];
    }

    async sendOTP(templateData, templatePath) {
        const email = new Email();
        const emailContent = await email.getEmailTemplate(templateData, templatePath);
        const mailResult = await email.sendEmail(
            "Ecommerce Api",
            this.email,
            this.emailSubject(),
            emailContent
        );
        return mailResult;
    }

    async send(userFullName) {
        const otpCode = this.generateOTP();
        const storedOTP = await this.storeOTP(otpCode);

        if (storedOTP) {
            const templateData = {
                name: userFullName,
                otpCode: otpCode
            };
            const sentOTP = await this.sendOTP(templateData, this.emailTemplate());
            const error = sentOTP ? false : true;
            const statusCode = sentOTP ? 200 : 500;
            const message = sentOTP ? "OTP has been sent successfully" : constants("500");

            return super.responseData(statusCode, error, message);
        }
        return super.responseData(500, true, constants("failedCache"));
    }

    async confirmOTP(otpCode) {
        const cacheResult = await this.cache.get(this.email);

        if (cacheResult.error) {
            return super.responseData(500, cacheResult.error, constants("500"));
        }

        if (!cacheResult.otpCode) {
            return super.responseData(404, true, "OTP code was not found");
        }

        const validOTPCode = cacheResult.otpCode === otpCode;
        const message = validOTPCode ? "Email has been verified successfully" : "Invalid otp";
        const statusCode = validOTPCode ? 200 : 401;
        const error = statusCode === 200;
        return super.responseData(statusCode, !error, message);
    }

    async deleteOTP() {
        const deleted = await this.cache.delete(this.email);
        const message = deleted ? null : constants("500");
        const statusCode = deleted ? 200 : 500;
        return super.responseData(statusCode, !deleted, message);
    }
}

module.exports = OTP;
