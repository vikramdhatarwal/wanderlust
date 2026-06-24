const express=require('express');
const router=express.Router();
const wrapAsync=require("../utils/wrapAsync.js");
const { listingSchema } = require("../schema.js");
const ExpressError=require("../utils/ExpressError.js");
const Listing=require("../models/listing");


//server side validation middleware for listing  using Joi schemas
const validateListing=(req,res,next)=>{
    const { error } = listingSchema.validate(req.body);
    if (error) {
        const errMsg=error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400,errMsg);
    }
    next();
};

//Index route to display all listings
router.get("/",wrapAsync(async(req,res)=>{
   
    const allListings=await Listing.find({});
    res.render("listings/index.ejs",{allListings});
    
}));


//new route to display a form for creating a new listing
router.get("/new",wrapAsync(async(req,res)=>{
    res.render("listings/new.ejs");
}));

//Create route to handle form submission and create a new listing
router.post("/",validateListing,wrapAsync(async(req,res)=>{
    const newListing=new Listing(req.body.listing);
    await newListing.save();
    req.flash("success","Successfully created a new listing!");
    res.redirect("/listings");

}));


//Show route to display a single listing by ID
router.get("/:id",wrapAsync(async(req,res)=>{
    const {id}=req.params;
    
    const listing=await Listing.findById(id).populate("reviews");
    if(!listing){
        req.flash("error","Listing not found");
        return res.redirect("/listings");
        // throw new ExpressError(404,"Listing not found");
    }
    res.render("listings/show.ejs",{listing});
    
}));

//Edit route to display a form for editing an existing listing
router.get("/:id/edit",wrapAsync(async(req,res)=>{
    const {id}=req.params;
    
    const listing=await Listing.findById(id);
    if(!listing){
        req.flash("error","Listing not found");
        return res.redirect("/listings");
        // throw new ExpressError(404,"Listing not found");
    }
    res.render("listings/edit.ejs",{listing});
    
}));

//Update route to handle form submission and update an existing listing
router.put("/:id",validateListing,wrapAsync(async(req,res)=>{
    const {id}=req.params;
  
    const updatedListing=await Listing.findByIdAndUpdate(id,req.body.listing,{new:true,runValidators:true});
    if(!updatedListing){
        req.flash("error","Listing not found");
        return res.redirect("/listings");
        //  
        // throw new ExpressError(404,"Listing not found");
    }
    req.flash("success","Successfully updated the listing!");
    res.redirect(`/listings/${updatedListing._id}`);
 
}));

//confirm delete route to display a confirmation page before deleting a listing
router.get("/:id/delete",wrapAsync(async(req,res)=>{
    const {id}=req.params;

    const listing=await Listing.findById(id);
    if(!listing){
        throw new ExpressError(404,"Listing not found");
    }
    res.render("listings/confirmDelete.ejs",{listing});

}));

//Delete route to delete an existing listing
router.delete("/:id",wrapAsync(async(req,res)=>{
    const {id}=req.params;
    
    const deletedListing=await Listing.findByIdAndDelete(id);
    if(!deletedListing){
        throw new ExpressError(404,"Listing not found");
    }
    req.flash("success","Successfully deleted the listing!");
    res.redirect("/listings");
  
}));


module.exports=router;