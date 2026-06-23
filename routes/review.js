const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync=require("../utils/wrapAsync.js");
const { reviewSchema } = require("../schema.js");
const ExpressError=require("../utils/ExpressError.js");
const Listing=require("../models/listing");
const Review=require("../models/review");

const validateReview=(req,res,next)=>{
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const errMsg=error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400,errMsg);
    }
    next();
};

//review route to handle form submission and create a new review for a listing
router.post("/", validateReview, wrapAsync(async(req,res)=>{
    const {id}=req.params;
    const {rating, comment} = req.body.review;

    const listing = await Listing.findById(id);
    if (!listing) {
        throw new ExpressError(404, "Listing not found");
    }

    const newReview = new Review({
        rating,
        comment
    });

    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();

    res.redirect(`/listings/${id}`);
}));

//Delete route to delete an existing review
router.delete("/:reviewId", wrapAsync(async(req,res)=>{
    const {id, reviewId}=req.params;
    await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/listings/${id}`);
}));

module.exports=router;
