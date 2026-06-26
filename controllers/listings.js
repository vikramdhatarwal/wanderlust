const Listing = require("../models/listing");
const ExpressError = require("../utils/ExpressError.js");

module.exports.index=async(req,res)=>{
    const allListings=await Listing.find({});
    res.render("listings/index.ejs",{allListings});
    
}


module.exports.renderNewForm=async(req,res)=>{
    res.render("listings/new.ejs");
}

module.exports.createListing=async(req,res)=>{
    const newListing=new Listing(req.body.listing);
    newListing.owner = req.user._id;

    // Keep uploaded Cloudinary metadata together on the listing document.
    if (req.file) {
        newListing.image = {
            url: req.file.path,
            filename: req.file.filename
        };
    }
    await newListing.save();
    req.flash("success","Successfully created a new listing!");
    res.redirect("/listings");

}


module.exports.showListing=async(req,res)=>{
    const {id}=req.params;
    
    // Populate ownership data so the view can decide which actions to show.
    const listing=await Listing.findById(id).populate({ path: "reviews", populate: { path: "author" } }).populate("owner");
    if(!listing){
        req.flash("error","Listing not found");
        return res.redirect("/listings");
        // throw new ExpressError(404,"Listing not found");
    }
    res.render("listings/show.ejs",{
        listing,
        // Support both env names so existing local .env files keep working.
        mapToken: process.env.MAP_TOKEN || process.env.MAP_API_KEY || ""
    });
    
}


module.exports.renderEditForm=async(req,res)=>{
    const {id}=req.params;
    
    const listing=await Listing.findById(id);
    if(!listing){
        req.flash("error","Listing not found");
        return res.redirect("/listings");
        // throw new ExpressError(404,"Listing not found");
    }
    res.render("listings/edit.ejs",{listing});
    
}

module.exports.updateListing=async(req, res) => {
    const { id } = req.params;
    
    const updatedListing = await Listing.findByIdAndUpdate(
        id,
        req.body.listing,
        { new: true, runValidators: true }
    );

    // Only replace the image when a new file was selected in the edit form.
    if (req.file) {
        updatedListing.image = {
            url: req.file.path,
            filename: req.file.filename
        };
        await updatedListing.save();
    }
    

    req.flash("success", "Successfully updated the listing!");
    res.redirect(`/listings/${updatedListing._id}`);
}


module.exports.renderDeleteForm=async(req,res)=>{
    const {id}=req.params;

    const listing=await Listing.findById(id);
    if(!listing){
        throw new ExpressError(404,"Listing not found");
    }
    res.render("listings/confirmDelete.ejs",{listing});

}

module.exports.deleteListing=async(req,res)=>{
    const {id}=req.params;
    
    const deletedListing=await Listing.findByIdAndDelete(id);
    if(!deletedListing){
        throw new ExpressError(404,"Listing not found");
    }
    req.flash("success","Successfully deleted the listing!");
    res.redirect("/listings");
  
}
