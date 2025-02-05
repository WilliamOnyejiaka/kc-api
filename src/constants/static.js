
const UserType = Object.freeze({
    Admin: "admin",
    Member: "member"
});


const OTPType = Object.freeze({
    Reset: "passwordReset",
    Verification: "emailVerification"
});

module.exports = { UserType, OTPType }