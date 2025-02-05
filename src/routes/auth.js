const { Router } = require("express");
const Auth = require("../controllers/Auth.js");
const asyncHandler = require("express-async-handler");
const { memberSignUp, login, resetPassword } = require("../middlewares/validators/auth.js");
const { OTPType, UserType } = require("../constants/static.js");

const auth = Router();

auth.post(
    "/member/sign-up",
    memberSignUp,
    asyncHandler(Auth.memberSignUp)
);

// auth.post(
//     "/admin/sign-up",
//     adminSignUp,
//     asyncHandler(Auth.adminSignUp)
// );

// auth.post("/admin/login", login, asyncHandler(Auth.login(UserType.Admin)));
auth.post("/member/login", login, asyncHandler(Auth.login(UserType.Member)));

auth.get("/member/otp/:email", asyncHandler(Auth.sendUserOTP(UserType.Member, OTPType.Verification)));
auth.get("/member/email-verification/:email/:otpCode", asyncHandler(Auth.emailVerification(UserType.Member)));

// auth.get("/admin/otp/:email", asyncHandler(Auth.sendUserOTP(UserType.Admin, OTPType.Verification)));
// auth.get("/admin/email-verification/:email/:otpCode", asyncHandler(Auth.emailVerification(UserType.Admin)));

// auth.get("/admin/forgot-password/:email", asyncHandler(Auth.sendUserOTP(UserType.Admin, OTPType.Reset)));
// auth.patch(
//     "/admin/reset-password",
//     resetPassword,
//     asyncHandler(Auth.passwordReset(UserType.Admin))
// );

auth.get("/member/forgot-password/:email", asyncHandler(Auth.sendUserOTP(UserType.Member, OTPType.Reset)));
auth.patch(
    "/member/reset-password",
    resetPassword,
    asyncHandler(Auth.passwordReset(UserType.Member))
);

// auth.get("/logout", logOut, asyncHandler(Auth.logOut));
// auth.get("/google", Auth.oauthRedirect);
// auth.get("/google/callback", Auth.oauthCallback);

module.exports = auth;
