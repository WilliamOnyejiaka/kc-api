const prisma = require("./prisma.js");
const Repo = require("./Repo.js");

class UserRepo extends Repo {
    constructor(tblName, imageRelation) {
        super(tblName);
        this.imageRelation = imageRelation;
    }

    async getUserWithId(userId) {
        return await super.getItemWithId(userId);
    }

    async getUserWithPhoneNumber(phoneNumber) {
        return await super.getItem({ 'phoneNumber': phoneNumber });
    }

    async getUserProfile(userIdOrEmail) {
        const where = typeof userIdOrEmail == "number" ? { id: userIdOrEmail } : { email: userIdOrEmail };
        return await super.getItem(where, {
            include: {
                [this.imageRelation]: {
                    select: {
                        imageUrl: true,
                        publicId: true,
                        mimeType: true
                    },
                }
            }
        });
    }

    async getUserProfileWithId(userId) {
        return await this.getUserProfile(userId);
    }

    async getUserProfileWithEmail(userEmail) {
        return await this.getUserProfile(userEmail);
    }

    async getAll(filter = {}) {
        return await super.getAll({
            include: {
                [this.imageRelation]: {
                    select: {
                        imageUrl: true
                    }
                }
            }
        });
    }

    async updateWithIdOrEmail(idOrEmail, data) {
        const where = typeof idOrEmail == "number" ? { id: idOrEmail } : { email: idOrEmail };
        return await this.update(where, data);
    }

    async updateActiveStatus(userId, activate = true) {
        return await this.updateWithIdOrEmail(userId, { active: activate });
    }

    async updatePassword(email, password) {
        return await this.updateWithIdOrEmail(email, { password: password });
    }

    async updateVerifiedStatus(email) {
        return await super.update({ email: email }, { verified: true });
    }

    async paginate(skip, take) {
        return super.paginate(skip, take, {
            include: {
                [this.imageRelation]: {
                    select: {
                        imageUrl: true
                    }
                }
            }
        });
    }
}

module.exports = UserRepo;
