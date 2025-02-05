const prisma = require("./bases/prisma");
const UserRepo = require("./bases/UserRepo");

class Admin extends UserRepo {
    constructor() {
        super('admin', 'profilePicture');
    }

    async getAdminAndRole(idOrEmail) { // TODO: Rename this method
        const where = typeof idOrEmail === "number" ? { id: idOrEmail } : { email: idOrEmail };

        try {
            const admin = await prisma['admin'].findUnique({ // TODO: change this, use getAllRelations (not the name of the class but you get the point) in the Repo class
                where: where,
                include: {
                    role: {
                        select: {
                            name: true,
                            description: true,
                            RolePermission: {
                                select: {
                                    permission: true,
                                }
                            },
                        }
                    },
                    directPermissions: {
                        select: {
                            permission: true
                        }
                    },
                    profilePicture: {
                        select: {
                            imageUrl: true
                        }
                    }
                },
            });
            return super.repoResponse(false, 200, null, admin);
        } catch (error) {
            return super.handleDatabaseError(error);
        }
    }

    async getAdminAndRoleWithId(id) {
        return await this.getAdminAndRole(id);
    }

    async getAdminAndRoleWithEmail(email) {
        return await this.getAdminAndRole(email);
    }

    async getAdmin(id) {
        return await super.getItemWithId(id);
    }

    async assignRole(adminId, roleId) {
        return await super.update({ id: adminId }, { roleId: roleId });
    }

    async massUnassignRole(roleId) {
        try {
            await prisma['admin'].updateMany({
                where: {
                    roleId: roleId
                },
                data: {
                    roleId: null,
                },
            });
            return super.repoResponse(false, 200);
        } catch (error) {
            return super.handleDatabaseError(error);
        }
    }

    async deleteAdmin(adminId) {
        return await super.delete({ id: adminId });
    }
}

module.exports = Admin;
