const { Router } = require("express");
const Auth = require("../controllers/Auth.js");
const asyncHandler = require("express-async-handler");
const { userSignUp, login, resetPassword } = require("../middlewares/validators/auth.js");
const { OTPType, UserType } = require("../constants/static.js");
const passport = require('./../config/passport.js');
const repo = require('../repos/User.js');

const auth = Router();

auth.post(
    "/user/sign-up",
    userSignUp,
    asyncHandler(Auth.userSignUp)
);

// auth.post(
//     "/admin/sign-up",
//     adminSignUp,
//     asyncHandler(Auth.adminSignUp)
// );

auth.post("/user/login", login, asyncHandler(Auth.login(UserType.User)));

auth.get("/user/otp/:email", asyncHandler(Auth.sendUserOTP(UserType.User, OTPType.Verification)));
auth.get("/user/email-verification/:email/:otpCode", asyncHandler(Auth.emailVerification(UserType.User)));

auth.get("/user/forgot-password/:email", asyncHandler(Auth.sendUserOTP(UserType.User, OTPType.Reset)));
auth.patch(
    "/user/reset-password",
    resetPassword,
    asyncHandler(Auth.passwordReset(UserType.User))
);

auth.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
auth.get('/google/callback', passport.authenticate('google'), asyncHandler(async (req, res) => {
    const test = new repo();
    console.log('Callback Success, User:', req.user);

    res.status(201).json(await test.insertOAuthUser({
        firstName: req.user._json.given_name,
        lastName: req.user._json.family_name,
        email: req.user._json.email,
        oAuthDetails: req.user._json
    }))

    // res.redirect('/')
}),
    (err, req, res, next) => {
        console.log(typeof err);

        console.error('OAuth Error:', err.oauthError || err);
        res.status(500).send('Authentication failed');
    }
);


// auth.get("/logout", logOut, asyncHandler(Auth.logOut));
// Logout Route
// app.get('/logout', (req, res, next) => {
//     req.logout((err) => {
//         if (err) return next(err);
//         res.redirect('/');
//     });
// });

module.exports = auth;
