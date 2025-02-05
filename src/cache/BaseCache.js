const constants = require("../constants/constants.js");

const redisClient = require('./../config/redis.js');

class BaseCache {

    preKey;
    expirationTime;


    constructor(preKey, expirationTime = 2_592_000) {
        this.preKey = preKey;
        this.expirationTime = expirationTime;
    }

    cacheResponse(error, message = null, data = {}) {
        return {
            error: error,
            message: message,
            data: data
        }
    }

    async set(key, data, expirationTime) {
        try {
            const success = await redisClient.set(
                `${this.preKey}-${key}`,
                JSON.stringify(data),
                'EX',
                expirationTime ?? this.expirationTime
            );
            return success === "OK";
        } catch (error) {
            console.error(`${constants("failedCache")}: ${error}`);
            return false;
        }
    }

    async get(key) {
        try {
            const item = await redisClient.get(`${this.preKey}-${key}`);
            return {
                error: false,
                data: item ?? JSON.parse(item),
            }
        } catch (error) {
            console.error("Failed to get cached item: ", error);
            return {
                error: true,
                data: null
            };
        }
    }

    async delete(key) {
        try {
            const result = await redisClient.del(`${this.preKey}-${key}`);
            return result === 1;
        } catch (error) {
            console.error("Failed to delete cached item: ", error);
            return true;
        }
    }
}

module.exports = BaseCache;