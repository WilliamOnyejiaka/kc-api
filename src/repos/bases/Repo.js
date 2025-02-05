const { Prisma } = require("@prisma/client");
const prisma = require("./prisma.js")
const http = require("../../constants/http.js");
const logger = require("../../config/logger.js");

class Repo {
    constructor(tblName) {
        this.tblName = tblName;
    }

    async insert(data) {
        try {
            const newItem = await prisma[this.tblName].create({ data });
            return this.repoResponse(false, 201, null, newItem);
        } catch (error) {
            return this.handleDatabaseError(error);
        }
    }

    async insertMany(data) {
        try {
            const newItems = await prisma[this.tblName].createMany({ data, skipDuplicates: true });
            return this.repoResponse(false, 201, null, newItems);
        } catch (error) {
            return this.handleDatabaseError(error);
        }
    }

    async checkIfTblHasData() {
        const result = await this.countTblRecords();
        return result.error ? result : this.repoResponse(false, 200, null, result.data > 0);
    }

    async getItemWithId(id) {
        return await this.getItem({ id });
    }

    async getItemWithName(name) {
        return await this.getItem({ name });
    }

    async getItemWithRelation(where, include) {
        try {
            const item = await prisma[this.tblName].findUnique({ where, include });
            return this.repoResponse(false, 200, null, item);
        } catch (error) {
            return this.handleDatabaseError(error);
        }
    }

    async getItem(where, others = {}) {
        try {
            const item = await prisma[this.tblName].findFirst({ where, ...others });
            return this.repoResponse(false, 200, null, item);
        } catch (error) {
            return this.handleDatabaseError(error);
        }
    }

    async delete(where) {
        try {
            const deletedData = await prisma[this.tblName].delete({ where });
            return this.repoResponse(false, 200, null, deletedData);
        } catch (error) {
            return this.handleDatabaseError(error);
        }
    }

    async deleteWithId(id) {
        return await this.delete({ id });
    }

    async update(where, data) {
        try {
            const updatedItem = await prisma[this.tblName].update({ where, data });
            return this.repoResponse(false, 200, null, updatedItem);
        } catch (error) {
            return this.handleDatabaseError(error);
        }
    }

    async countTblRecords() {
        try {
            const count = await prisma[this.tblName].count();
            return this.repoResponse(false, 200, null, count);
        } catch (error) {
            return this.handleDatabaseError(error);
        }
    }

    async paginate(skip, take, filter = {}) {
        try {
            const items = await prisma[this.tblName].findMany({ skip, take, ...filter });
            const totalItems = await prisma[this.tblName].count();
            return this.repoResponse(false, 200, null, { items, totalItems });
        } catch (error) {
            return this.handleDatabaseError(error);
        }
    }

    async getAll(filter = {}) {
        try {
            const items = await prisma[this.tblName].findMany(filter);
            return this.repoResponse(false, 200, null, items);
        } catch (error) {
            return this.handleDatabaseError(error);
        }
    }

    repoResponse(error, type, message = null, data = {}) {
        return { error, message, type, data };
    }

    handleDatabaseError(error) {
        if (error.code === "P2002") {
            logger.error(`Unique constraint violation error for the ${this.tblName} table`);
            return { error: true, message: "A record with this data already exists.", type: 400, data: {} };
        } else if (error.code === "P2025") {
            logger.error(`Item was not found for the ${this.tblName} table`);
            return { error: true, message: "Item was not found.", type: 404, data: {} };
        } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
            switch (error.code) {
                case "P2003":
                    logger.error(`Foreign key constraint violation error for the ${this.tblName} table`);
                    return { error: true, message: "Invalid foreign key reference. Please check related fields.", type: 400, data: {} };
                case "P2001":
                    logger.error(`Record not found for the ${this.tblName} table`);
                    return { error: true, message: "The requested record could not be found.", type: 400, data: {} };
                case "P2000":
                    logger.error(`Value too long for a column for the ${this.tblName} table`);
                    return { error: true, message: "A value provided is too long for one of the fields.", type: 400, data: {} };
                default:
                    logger.error(`An unexpected database error occurred for the ${this.tblName} table`, error.message);
                    return { error: true, message: "An unexpected database error occurred.", type: 400, data: {} };
            }
        } else if (error instanceof Prisma.PrismaClientValidationError) {
            logger.error(`Validation error in the ${this.tblName} table`);
            return { error: true, message: "Invalid data provided. Please check that all fields are correctly formatted.", type: 400, data: {} };
        }

        logger.error(error);
        return { error: true, message: http("500"), type: 500, data: {} };
    }
}

module.exports = Repo;
