const mongoose = require('mongoose');
const Schema = mongoose.Schema;

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
        type: String,
        default: "https://www.monstertreeservice.com/monster-tips/tree-care-tips/the-anatomy-of-trees-shrubs/",
        
        set: (v)=> v===""? "https://www.monstertreeservice.com/monster-tips/tree-care-tips/the-anatomy-of-trees-shrubs/" : v
    },
    price: {
        type: Number,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true
    },
});

const Listing = mongoose.model('Listing', listingSchema);

module.exports = Listing;