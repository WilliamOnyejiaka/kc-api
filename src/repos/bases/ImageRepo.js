const prisma = require("./prisma.js");
const Repo = require("./Repo.js");

class ImageRepo extends Repo {
    constructor(tblName, parentIdName) {
        super(tblName);
        this.parentIdName = parentIdName;
    }

    async insertImage(data) {
        const parentColumn = { [this.parentIdName]: data.parentId };
        delete data.parentId;

        try {
            const newImage = await prisma[this.tblName].create({
                data: { ...data, ...parentColumn },
            });
            return super.repoResponse(false, 201, null, newImage);
        } catch (error) {
            return super.handleDatabaseError(error);
        }
    }

    async getImage(id) {
        try {
            const image = await prisma[this.tblName].findUnique({
                where: {
                    [this.parentIdName]: id
                }
            });
            return super.repoResponse(false, 200, null, image);
        } catch (error) {
            return super.handleDatabaseError(error);
        }
    }

    async getImages(id) {
        try {
            const image = await prisma[this.tblName].findMany({
                where: {
                    [this.parentIdName]: id
                }
            });
            return super.repoResponse(false, 200, null, image);
        } catch (error) {
            return super.handleDatabaseError(error);
        }
    }
}

module.exports = ImageRepo;
