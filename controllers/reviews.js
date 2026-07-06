// Review controllers add a review to a listing or remove an existing review.
const Listing = require("../models/listing");
const Review = require("../models/review");
const ExpressError = require("../utils/ExpressError.js");



// Create a review and save its ID inside the matching listing.
module.exports.createReview=async(req,res)=>{
    const {id}=req.params;
    const {rating, comment} = req.body.review;
    const listing = await Listing.findById(id);
    if (!listing) {
        throw new ExpressError(404, "Listing not found");
    }
    const newReview = new Review({
        rating,
        comment,
        author: req.user._id
    });
    newReview.author = req.user._id;
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    req.flash("success","Successfully created a new review!");
    res.redirect(`/listings/${id}`);
}


// Remove the review ID from the listing first, then remove the review document.
module.exports.deleteReview=async(req,res)=>{
    const {id, reviewId}=req.params;
    await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash("success","Successfully deleted the review!");
    res.redirect(`/listings/${id}`);
}
