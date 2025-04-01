const AdminKey = require("../cache/AdminKey");
const env = require("../config/env");
const HttpStatus = require("../constants/HttpStatus");
const http = require("../constants/http");
const { UserType, ResourceType, CdnFolders } = require("../constants/static");
const Password = require("../utils/Password");
const CipherUtility = require("../utils/CipherUtility");
const parseJson = require("../utils/parseJson");
const Token = require("./Token");
const Authentication = require("./bases/Authentication");
const Cloudinary = require("./Cloudinary");

class UserRegistration extends Authentication {

    constructor() {
        super();
    }

    async userSignUp(memberData, file) {
        const cloudinary = new Cloudinary();
        const { uploadedFiles, failedFiles, publicIds } = await cloudinary.upload([file], ResourceType.IMAGE, CdnFolders.PROFILEPICTURE);

        if (uploadedFiles.length > 0) {
            const passwordHash = Password.hashPassword(memberData.password, this.storedSalt);
            memberData.password = passwordHash;

            const repoResult = await this.userRepo.insert(memberData, uploadedFiles[0]);
            const error = repoResult.error;
            const statusCode = repoResult.type;
            const message = !error ? "User has been created successfully" : repoResult.message;
            const result = repoResult.data;
            result['profilePicture'] = result['profilePicture'][0].imageUrl;

            if (!error) {
                delete result.password;
                const cacheSuccessful = await this.userCache.set(
                    String(result.id),
                    result
                );

                return cacheSuccessful ? super.responseData(statusCode, error, message, {
                    token: Token.createToken(env('tokenSecret'), { id: result.id }, [UserType.User]),
                    user: result
                }) : super.responseData(statusCode, error, message);
            }
            return super.responseData(statusCode, error, message, result);
        }
        return this.responseData(500, true, "Something went wrong", failedFiles);
    }

    async adminSignUp(signUpData) {
        const keyCache = new AdminKey();
        const cacheResult = await keyCache.get(signUpData.key);

        if (cacheResult.error) {
            return super.responseData(HttpStatus.INTERNAL_SERVER_ERROR, true, http(HttpStatus.INTERNAL_SERVER_ERROR.toString()));
        }

        if (!cacheResult.data) {
            return super.responseData(HttpStatus.NOT_FOUND, true, "Key not found");
        }

        const decryptResult = CipherUtility.decrypt(signUpData.key, this.secretKey);
        if (decryptResult.error) {
            return super.responseData(HttpStatus.INTERNAL_SERVER_ERROR, true, http(HttpStatus.INTERNAL_SERVER_ERROR.toString()));
        }

        const decodedJson = parseJson(decryptResult.originalText);
        if (decodedJson.error) {
            return super.responseData(HttpStatus.BAD_REQUEST, true, decodedJson.message);
        }

        const keyDetails = decodedJson.data;
        delete signUpData.key;
        signUpData.roleId = keyDetails.roleId;

        const serviceResult = await (new AdminService()).createAdmin(signUpData, keyDetails.createdBy);
        return serviceResult;
    }

}

module.exports = UserRegistration;
