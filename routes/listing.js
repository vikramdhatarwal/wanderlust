const express=require('express');
const router=express.Router();
const wrapAsync=require("../utils/wrapAsync.js");
const Listing=require("../models/listing");
const ExpressError=require("../utils/ExpressError.js");
const { isLoggedIn, isowner ,validateListing} = require("../middleware.js");
const listingController=require("../controllers/listings.js");


// Collection routes
router.route("/")
    .get(wrapAsync(listingController.index))
    .post(
        isLoggedIn,
        validateListing,
        wrapAsync(listingController.createListing)
    );

// New listing form
router.get(
    "/new",
    isLoggedIn,
    wrapAsync(listingController.renderNewForm)
);

// Individual listing routes
router.route("/:id")
    .get(wrapAsync(listingController.showListing))
    .put(
        isLoggedIn,
        isowner,
        validateListing,
        wrapAsync(listingController.updateListing)
    )
    .delete(
        isLoggedIn,
        isowner,
        wrapAsync(listingController.deleteListing)
    );

// Edit form
router.get(
    "/:id/edit",
    isLoggedIn,
    isowner,
    wrapAsync(listingController.renderEditForm)
);

// Delete confirmation page
router.get(
    "/:id/delete",
    isLoggedIn,
    isowner,
    wrapAsync(listingController.renderDeleteForm)
);

module.exports=router;
