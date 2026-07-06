// Listing model: one stay, its image, location, owner, and review IDs.
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require('./review.js');

// Fallback image keeps old/seeded listings from rendering broken image boxes.
const placeholderImageUrl = "https://www.monstertreeservice.com/cms/thumbnails/24/1080x540/images/articles/GettyImages-476116580.jpg";

const listingSchema = new Schema({ 
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    image: {
        filename: {
            type: String,
            default: "listingimage"
        },
        url: {
            type: String,
            default: placeholderImageUrl,
            set: (v) => v === "" ? placeholderImageUrl : v
        }
    },
    price: {
        type: Number,
        required: true
    },
    category: {
        type: String,
        required: true,
        default: 'Other',
        enum: ['Arctic', 'Pools', 'Farms', 'Rooms', 'Mountains', 'Igloos', 'Nature', 'Castles', 'Trending', 'Other'],
    },
    location: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true
    },
    // Coordinates are saved as [longitude, latitude] for map use.
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number],
            default: undefined
        }
    },
    // These IDs point to separate Review documents.
    reviews: [{
        type: Schema.Types.ObjectId,
        ref: 'Review'
    }],
    // This ID points to the User who created the listing.
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});


// Deleting a listing should also clean up its review documents.
listingSchema.post('findOneAndDelete', async function(doc) {
    if (doc) {
        await Review.deleteMany({
            _id: { $in: doc.reviews }
        });
    }
});

const Listing = mongoose.model('Listing', listingSchema);

module.exports = Listing;
