const { validationResult } = require("express-validator");
const Controller = require("./bases/Controller.js");
const ListingRepo = require('./../repos/Listing.js');

class Listing {

    static async create(req,res){
        const validationErrors = validationResult(req);

        if (!validationErrors.isEmpty()) {

            Controller.handleValidationErrors(res, validationErrors);
            return;
        }

        const listingPhotos = req.files;
        if (!listingPhotos) {
            res.status(400).json({
                'error': true,
                'message': "No images found"
            });
            return;
        }

        req.body['guestCount'] = Number(req.body['guestCount']);
        req.body['bedroomCount'] = Number(req.body['bedroomCount']);
        req.body['bedCount'] = Number(req.body['bedCount']);
        req.body['bathroomCount'] = Number(req.body['bathroomCount']);
        req.body['price'] = Number(req.body['price']);
        req.body['amenities'] = JSON.parse(req.body['amenities']);
        // req.body['amenities'] = ["Hello"];

        // console.log(req.body['amenities']);
        // console.log(JSON.parse(req.body['amenities']));
        
        
        const {
            category,
            type,
            streetAddress,
            aptSuite,
            city,
            province,
            country,
            guestCount,
            bedroomCount,
            bedCount,
            bathroomCount,
            amenities,
            title,
            description,
            price,
        } = req.body;


        const repo = new ListingRepo();
        const data = {
            ...req.body,
            userId: res.locals.data.id
        };

        res.status(400).json({
            'error': true,
            'message': listingPhotos.length,
            'user': res.locals.data.id,
            'listing': await repo.insert(data,"ehhcd")
        })
    }
}

module.exports = Listing;