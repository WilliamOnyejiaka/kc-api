
module.exports = function validations(key) {

    return {
        'phoneNumber': "Invalid phone number format",
        '400Email': "Email already exists"
    }[key]
}