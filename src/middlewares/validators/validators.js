const { body, header, param, query } = require("express-validator");
const zipCodeValidator = require("../../validators/zipCodeValidator.js");
const bodyValidator = require("./../../validators/bodyValidator.js");
const emailValidator = require("./../../validators/emailValidator.js");
const numberValidator = require("./../../validators/numberValidator.js");
const phoneNumberValidator = require("./../../validators/phoneNumberValidator.js");
const constants = require("../../constants/constants");
const HttpStatus = require("../../constants/HttpStatus");

const errorDetails = (message, statusCode) => {
    return JSON.stringify({
        message: message,
        statusCode: statusCode
    });
};

const isValidPassword = (value) => {
    if (value.length < 5) {
        throw new Error(errorDetails("Password must be greater than 5", HttpStatus.BAD_REQUEST));
    }
    return true;
};

const isValidPhoneNumber = (value) => {
    const phoneNumberIsValid = phoneNumberValidator(value);

    if (phoneNumberIsValid !== null) {
        throw new Error(errorDetails(phoneNumberIsValid, HttpStatus.BAD_REQUEST));
    }
    return true;
};

const isValidEmail = (value) => {
    if (!emailValidator(value)) {
        throw new Error(errorDetails(constants("400Email"), HttpStatus.BAD_REQUEST));
    }
    return true;
};

const emailExists = (repo) => async (value) => {
    const repoResult = await repo.getUserProfileWithEmail(value);

    if (repoResult.error) {
        throw new Error(JSON.stringify({
            message: repoResult.message,
            statusCode: repoResult.type
        }));
    } else if (repoResult.data) {
        throw new Error(errorDetails("Email already exists", HttpStatus.BAD_REQUEST));
    }
    return true;
};

const phoneNumberExists = (repo) => async (value) => {
    const repoResult = await repo.getUserWithPhoneNumber(value);

    if (repoResult.error) {
        throw new Error(JSON.stringify({
            message: repoResult.message,
            statusCode: repoResult.type
        }));
    } else if (repoResult.data) {
        throw new Error(errorDetails("Phone number already exists", HttpStatus.BAD_REQUEST));
    }
    return true;
};

const nameExists = (repo) => async (value) => {
    const repoResult = await repo.getItemWithName(value);

    if (repoResult.error) {
        throw new Error(JSON.stringify({
            message: repoResult.message,
            statusCode: repoResult.type
        }));
    } else if (repoResult.data) {
        throw new Error(errorDetails("Name already exists", HttpStatus.BAD_REQUEST));
    }
    return true;
};

const isValidZipCode = (value) => {
    const isValid = zipCodeValidator(value);
    if (isValid.error) {
        throw new Error(errorDetails(isValid.message, HttpStatus.BAD_REQUEST));
    }
    return true;
};

const isTokenPresent = (value, { req }) => {
    if (!req.headers.authorization || req.headers.authorization.indexOf('Bearer ') === -1) {
        throw new Error(errorDetails("Missing Bearer Authorization Header", HttpStatus.UNAUTHORIZED));
    }
    if (!req.headers.authorization.split(' ')[1]) {
        throw new Error(errorDetails("Token missing", HttpStatus.UNAUTHORIZED));
    }
    return true;
};

const isValidNumber = (value) => {
    const idResult = numberValidator(value);

    if (idResult.error) {
        throw new Error(errorDetails("Param must be an integer", HttpStatus.BAD_REQUEST));
    }
    return true;
};

const isValidBoolean = (message) => (value) => {
    if (typeof value !== "boolean") {
        throw new Error(errorDetails(message, HttpStatus.BAD_REQUEST));
    }
    return true;
};

const validateQueryNumber = (name) => (value) => {
    const numberResult = numberValidator(value);

    if (numberResult.error) {
        throw new Error(errorDetails(`${name} query param must be an integer`, HttpStatus.BAD_REQUEST));
    }
    return true;
};

module.exports = {
    passwordIsValid: body('password').custom(isValidPassword),
    phoneNumberIsValid: body('phoneNumber').custom(isValidPhoneNumber),
    emailIsValid: body('email').custom(isValidEmail),
    userEmailExists: (repo) => body('email').custom(emailExists(repo)),
    userPhoneNumberExists: (repo) => body('phoneNumber').custom(phoneNumberExists(repo)),
    zipCodeIsValid: body('zip').custom(isValidZipCode),
    tokenIsPresent: header('Authorization').custom(isTokenPresent),
    paramNumberIsValid: (paramName) => param(paramName).custom(isValidNumber),
    bodyNumberIsValid: (bodyName) => body(bodyName).custom(isValidNumber),
    itemNameExists: (repo, bodyName) => body(bodyName).custom(nameExists(repo)),
    pageQueryIsValid: query('page').custom(validateQueryNumber('page')),
    pageSizeQueryIsValid: query('pageSize').custom(validateQueryNumber('pageSize')),
    queryIsValidNumber: (queryName) => query(queryName).custom(validateQueryNumber(queryName)),
    bodyBooleanIsValid: (bodyName) => body(bodyName).custom(isValidBoolean(`${bodyName} must be a boolean`)),
};
