const prisma = require("./bases/prisma");
const UserRepo = require("./bases/UserRepo");

class Member extends UserRepo {
    constructor() {
        super('member', 'profilePicture');
    }

    async insert(data, media) {
        try {
            const newItem = await prisma.member.create({
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
                include:{
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
}

module.exports = Member;
