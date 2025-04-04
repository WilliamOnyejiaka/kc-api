
module.exports = function numberValidator(number) {
    try {
        number = Number(number);

        if (isNaN(number)) {
            return {
                error: true,
                message: "Item must be an integer",
            }
        }

        return {
            error: false,
            number: number
        }
    } catch (error) {
        console.error("Invalid Item: ", error);
        return {
            error: true,
            message: "Item must be an integer",
        }
    }

}