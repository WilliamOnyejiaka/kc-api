const constants = require("../constants/constants");
const redisClient = require("./../config/redis");

class OTPCache {

    constructor(partPreKey) {
        this.preKey = "otp" + "-" + partPreKey;
        this.expirationTime = 900;
    }

    async set(email, otpCode) {
        try {
            const success = await redisClient.set(`${this.preKey}-${email}`, otpCode, 'EX', this.expirationTime);
            return success === "OK";
        } catch (error) {
            console.error(`${constants("failedCache")}: ${error}`);
            return false;
        }
    }

    async get(email) {
        try {
            console.log(`${this.preKey}-${email}`);

            const otpCode = await redisClient.get(`${this.preKey}-${email}`);
            return {
                error: false,
                otpCode: otpCode
            }
        } catch (error) {
            console.error("Failed to get cached item: ", error);
            return {
                error: true,
                otpCode: null
            };
        }
    }

    async delete(email) {
        try {
            const result = await redisClient.del(`${this.preKey}-${email}`);
            return result === 1 ? true : false;
        } catch (error) {
            console.error("Failed to delete cached item: ", error);
            return false;
        }
    }
}

module.exports = OTPCache;
