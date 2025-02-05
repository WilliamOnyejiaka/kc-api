const CryptoJS = require('crypto-js');
const logger = require('../config/logger');

class CipherUtility {

    static encrypt(text, secretKey) {
        const encrypted = CryptoJS.AES.encrypt(text, secretKey).toString();
        return encrypted;
    }

    static decrypt(encryptedText, secretKey) {
        try {
            const bytes = CryptoJS.AES.decrypt(encryptedText, secretKey);
            const originalText = bytes.toString(CryptoJS.enc.Utf8);
            return {
                error: false,
                originalText: originalText
            };
        } catch (error) {
            logger.error(error);
            return {
                error: true,
                originalText: null
            };
        }
    }
}

module.exports = CipherUtility;
