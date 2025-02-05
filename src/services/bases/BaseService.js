const constants = require("../../constants/constants.js");
const getPagination = require("../../utils/getPagination.js");

class BaseService {
    constructor(repo) {
        this.repo = repo;
    }

    responseData(statusCode, error, message, data = {}) {
        return {
            statusCode: statusCode,
            json: {
                error: error,
                message: message,
                data: data
            }
        };
    }

    handleRepoError(repoResult) {
        if (repoResult.error) {
            return this.responseData(repoResult.type, true, repoResult.message);
        }
        return null;
    }

    async create(createData, itemName) {
        const repoResult = await this.repo.insert(createData);
        const error = repoResult.error;
        const statusCode = repoResult.type;
        const message = !error ? `${itemName} was created successfully` : repoResult.message;
        return this.responseData(statusCode, error, message, repoResult.data);
    }

    async getAllItems(message200) {
        const repoResult = await this.repo.getAll();

        if (repoResult.error) {
            return this.responseData(repoResult.type, true, repoResult.message);
        }

        return this.responseData(200, false, message200, repoResult.data);
    }

    async getItem(nameOrId, message200) {
        const repoResult = typeof nameOrId == "number" ? await this.repo.getItemWithId(nameOrId) :
            await this.repo.getItemWithName(nameOrId);

        if (repoResult.error) {
            return this.responseData(repoResult.type, true, repoResult.message);
        }

        const data = repoResult.data;
        const statusCode = data ? 200 : 404;
        const error = !data;
        const message = error ? "Item was not found" : message200 ?? "Item was retrieved successfully";

        return this.responseData(statusCode, error, message, data);
    }

    async getItemWithId(id, message200) {
        return await this.getItem(id, message200);
    }

    async getItemWithName(name, message200) {
        return await this.getItem(name, message200);
    }

    async paginate(page, pageSize) {
        const skip = (page - 1) * pageSize;
        const take = pageSize;

        const repoResult = await this.repo.paginate(Number(skip), take);

        if (repoResult.error) {
            return this.responseData(repoResult.type, true, repoResult.message);
        }

        const totalRecords = repoResult.data.totalItems;
        const pagination = getPagination(page, pageSize, totalRecords);

        return this.responseData(200, false, `Items were retrieved successfully`, {
            data: repoResult.data.items,
            pagination
        });
    }

    sanitizeData(data, fieldsToRemove) {
        data.forEach(item => {
            fieldsToRemove.forEach(key => {
                delete item[key];
            });
        });
    }

    async deleteWithId(id) {
        const repoResult = await this.repo.deleteWithId(id);
        if (repoResult.error) {
            return this.responseData(repoResult.type, true, repoResult.message);
        }

        return this.responseData(200, false, "Item was deleted successfully");
    }

    async totalRecords() {
        const repoResult = await this.repo.countTblRecords();
        if (repoResult.error) {
            return this.responseData(repoResult.type, true, repoResult.message);
        }

        return this.responseData(200, false, "Total records were counted successfully", { totalRecords: repoResult.data });
    }

    getRepo() { return this.repo; }
}

module.exports = BaseService;
