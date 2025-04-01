
const UserType = Object.freeze({
    Admin: "admin",
    User: "user"
});


const OTPType = Object.freeze({
    Reset: "passwordReset",
    Verification: "emailVerification"
});

const ResourceType = Object.freeze({
    IMAGE: "image",
    VIDEO: "video",
    AUDIO: "video",
    PDF: "raw",
    AUTO: "auto"
});

const CdnFolders = Object.freeze({
    PROFILEPICTURE: "kc-cdn/profile-pictures",
    LISTINGPHOTOS: "kc-cdn/listing-photos"
});

module.exports = { UserType, OTPType, ResourceType, CdnFolders }