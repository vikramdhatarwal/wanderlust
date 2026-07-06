// Nested review URLs live under /listings/:id/reviews.
const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync=require("../utils/wrapAsync.js");
const { reviewSchema } = require("../schema.js");
const ExpressError=require("../utils/ExpressError.js");
const Listing=require("../models/listing");
const Review=require("../models/review");
const { isLoggedIn, isReviewAuthor } = require("../middleware.js");

// Check rating and comment before a review is saved.
const validateReview=(req,res,next)=>{
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const errMsg=error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400,errMsg);
    }
    next();
};
const reviewController=require("../controllers/reviews.js");


//review route to handle form submission and create a new review for a listing
router.post("/", isLoggedIn, validateReview, wrapAsync(reviewController.createReview));

//Delete route to delete an existing review
router.delete("/:reviewId", isLoggedIn, isReviewAuthor, wrapAsync(reviewController.deleteReview));

module.exports=router;
