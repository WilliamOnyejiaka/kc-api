const validateBody = require('./validateBody.js');
const { emailIsValid, userPhoneNumberExists, userEmailExists, passwordIsValid } = require("./validators.js");
const User = require('../../repos/User.js');
const upload = require('./../../middlewares/multer.js');
const { ResourceType } = require('../../constants/static.js');

const userSignUp = [
    upload(ResourceType.IMAGE).single('profilePicture'),
    validateBody([
        'firstName',
        'lastName',
        'password',
        'email'
    ]),
    emailIsValid,
    passwordIsValid,
    userEmailExists(new User())
];

const login = [
    validateBody(['email', 'password'])
];

const resetPassword = [
    validateBody([
        'password',
        'otp',
        'email'
    ]),
    passwordIsValid
];

module.exports = {
    userSignUp,
    login,
    resetPassword
};

// export const adminSignUp = [
//     validateBody([
//         "firstName",
//         "password",
//         "lastName",
//         "email",
//         "phoneNumber",
//         "key"
//     ]),
//     emailIsValid,
//     passwordIsValid,
//     // phoneNumberIsValid,
//     userPhoneNumberExists<Admin>(new Admin()), // ! TODO: check if there is a phone number validation error
//     userEmailExists<Admin>(new Admin())
// ];

// export const logOut = [
//     tokenIsPresent
// ]