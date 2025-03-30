const { validationResult } = require("express-validator");
const Controller = require("./bases/Controller.js");
const AuthenticationManagementFacade = require("./../facade/AuthenticationManagementFacade.js");

class Auth {

    static facade = new AuthenticationManagementFacade();

    static login(userType) {
        return async (req, res) => {
            const { email, password } = req.body;
            const serviceResult = await Auth.facade.login(
                email,
                password,
                userType
            );

            Controller.response(res, serviceResult);
        };
    }

    static sendUserOTP(userType, otpType) {
        return async (req, res) => {
            const serviceResult = await Auth.facade.sendUserOTP(req.params.email, otpType, userType);
            Controller.response(res, serviceResult);
        };
    }

    static emailVerification(userType) {
        return async (req, res) => {
            const serviceResult = await Auth.facade.emailVerification(req.params.email, req.params.otpCode, userType);
            Controller.response(res, serviceResult);
        };
    }

    static passwordReset(userType) {
        return async (req, res) => {
            const validationErrors = validationResult(req);
            if (!validationErrors.isEmpty()) {
                Controller.handleValidationErrors(res, validationErrors);
                return;
            }

            const { otp, password, email } = req.body;
            const serviceResult = await Auth.facade.passwordReset(email, password, otp, userType);
            Controller.response(res, serviceResult);
        };
    }

    static async memberSignUp(req, res) {
        const validationErrors = validationResult(req);

        if (!validationErrors.isEmpty()) {

            Controller.handleValidationErrors(res, validationErrors);
            return;
        }

        const serviceResult = await Auth.facade.memberSignUp({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            password: req.body.password,
            email: req.body.email,
            phoneNumber: req.body.phoneNumber
        }, req.file);
        Controller.response(res, serviceResult);
    }

    static async logOut(req, res) {
        const validationErrors = validationResult(req);

        if (!validationErrors.isEmpty()) {
            Controller.handleValidationErrors(res, validationErrors);
            return;
        }
        const token = req.headers.authorization.split(' ')[1];
        const serviceResult = await Auth.facade.logOut(token);
        Controller.response(res, serviceResult);
    }

    static async adminSignUp(req, res) {
        const serviceResult = await Auth.facade.adminSignUp(req.body);
        Controller.response(res, serviceResult);
    }
}

module.exports = Auth;
