const Joi = require('joi');

const listingCategories = ['Arctic', 'Pools', 'Farms', 'Rooms', 'Mountains', 'Igloos', 'Nature', 'Castles', 'Trending', 'Other'];

// Server-side validation mirrors the required listing form fields.
module.exports.listingSchema = Joi.object({
    listing: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        price: Joi.number().min(1).required(),
        image: Joi.object({
            url: Joi.string().allow('', null),
            filename: Joi.string().allow('', null)
        }),
        category: Joi.string().valid(...listingCategories).required(),
        location: Joi.string().required(),
        country: Joi.string().required()
    }).required()
}).required();

// Review validation keeps ratings inside the star input range.
module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().min(1).max(5).required(),
        comment: Joi.string().required()
    }).required()
}).required();
