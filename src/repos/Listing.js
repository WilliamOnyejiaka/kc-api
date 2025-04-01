const prisma = require("./bases/prisma");
const Repo = require('./bases/Repo.js');

class Listing extends Repo {
    constructor() {
        super('listing');
    }

    async insert(data, media) {
        try {
            const newItem = await prisma.listing.create({
                data: {
                    userId: data.userId,
                    category: data.category,
                    type: data.type,
                    streetAddress: data.streetAddress,
                    aptSuite: data.aptSuite,
                    city: data.city,
                    province: data.province,
                    country: data.country,
                    guestCount: data.guestCount,
                    bedroomCount: data.bedroomCount,
                    bedCount: data.bedCount,
                    bathroomCount: data.bathroomCount,
                    amenities: data.amenities,
                    title: data.title,
                    description: data.description,
                    price: data.price
                },
                include: {
                    listingPhotos: {
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

module.exports = Listing;