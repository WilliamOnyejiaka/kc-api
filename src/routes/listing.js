const { Router } = require("express");
const Listing = require("../controllers/Listing.js");
const asyncHandler = require("express-async-handler");
const { memberSignUp, login, resetPassword } = require("../middlewares/validators/auth.js");
const uploads = require('./../middlewares/multer.js');
const { ResourceType } = require('./../constants/static.js');


const listing = Router();

listing.post("/create", uploads(ResourceType.IMAGE).array("listingPhotos", 10), asyncHandler(Listing.create));
module.exports = listing;
