const prisma = require("./bases/prisma");
const UserRepo = require("./bases/UserRepo");

class User extends UserRepo {
    constructor() {
        super('user', 'profilePicture');
    }

    async insertWithImage(data, media) {
        try {
            const newItem = await prisma.user.create({
                data: {
                    ...data,
                    profilePicture: {
                        create: {
                            mimeType: media.mimeType,
                            size: media.size,
                            imageUrl: media.imageUrl,
                            publicId: media.publicId
                        }
                    }
                },
                include: {
                    profilePicture: {
                        select: {
                            imageUrl: true
                        }
                    }
                }
            })
            return this.repoResponse(false, 201, null, newItem);
        } catch (error) {
            console.log(error)
            return this.handleDatabaseError(error);
        }
    }

    async insert(data) {
        try {
            const newItem = await prisma.user.create({
                data: {
                    ...data
                },
            })
            return this.repoResponse(false, 201, null, newItem);
        } catch (error) {
            console.log(error)
            return this.handleDatabaseError(error);
        }
    }

    async insertOAuthUser(data) {
        try {
            const newItem = await prisma.user.create({
                data: {
                    firstName: data.firstName,
                    lastName: data.lastName,
                    isOauth: true,
                    oAuthDetails: data.oAuthDetails,
                    email: data.email
                }
            })
            return this.repoResponse(false, 201, null, newItem);
        } catch (error) {
            console.log(error)
            return this.handleDatabaseError(error);
        }
    }
}

module.exports = User;
