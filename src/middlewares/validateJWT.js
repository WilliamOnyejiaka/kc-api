
const http = require('./../constants/http.js');
const Token = require('./../services/Token.js');
const TokenBlackList = require('./../cache/TokenBlackList.js');

const validateJWT = (types, tokenSecret, neededData = ['data']) => async (req, res, next) => {
    if (!req.headers.authorization || req.headers.authorization.indexOf('Bearer ') === -1) {
        res.status(401).json({ error: true, message: 'Missing Bearer Authorization Header' });
        return;
    }

    const token = req.headers.authorization.split(' ')[1];
    if (!token) {
        res.status(401).json({
            error: true,
            message: "Token missing"
        });
        return;
    }
    const cache = new TokenBlackList();
    const isBlacklistedResult = await cache.get(token);

    if (isBlacklistedResult.error) {
        res.status(500).json({
            error: true,
            message: http('500')
        });
        return;
    }

    if (isBlacklistedResult.data) {
        res.status(401).json({
            error: true,
            message: "Token is invalid"
        });
        return;
    }

    const tokenValidationResult = Token.validateToken(token, types, tokenSecret);

    if (tokenValidationResult.error) {
        const statusCode = tokenValidationResult.message == http("401") ? 401 : 400;
        res.status(statusCode).json({
            error: true,
            message: tokenValidationResult.message
        });
        return;
    }

    for (let item of neededData) {
        res.locals[item] = tokenValidationResult.data[item];
    }
    next();
}

module.exports = validateJWT;