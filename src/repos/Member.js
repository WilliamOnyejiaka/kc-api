const prisma = require("./bases/prisma");
const UserRepo = require("./bases/UserRepo");

class Member extends UserRepo {
    constructor() {
        super('member', 'profilePicture');
    }

    async insert(data) {
        // const insertData = {
        //     ...data.customerData,
        //     Address: {
        //         create: data.addressData
        //     }
        // };
        return await super.insert(data);
    }
}

module.exports = Member;
