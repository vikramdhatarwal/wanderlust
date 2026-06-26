const Listing = require("../models/listing");
const ExpressError = require("../utils/ExpressError.js");

const getMapToken = () => process.env.MAP_TOKEN || process.env.MAP_API_KEY || "";

const hasValidCoordinates = (coordinates) => {
    return Array.isArray(coordinates)
        && coordinates.length === 2
        && coordinates.every((coordinate) => Number.isFinite(coordinate));
};

const geocodeListingLocation = async (listing) => {
    const mapToken = getMapToken();
    const address = [listing.location, listing.country].filter(Boolean).join(", ");

    if (!mapToken || !address.trim()) {
        return null;
    }

    const geocodingParams = new URLSearchParams({
        key: mapToken,
        limit: "1"
    });
    const geocodingUrl = `https://api.maptiler.com/geocoding/${encodeURIComponent(address)}.json?${geocodingParams.toString()}`;

    try {
        const response = await fetch(geocodingUrl);

        if (!response.ok) {
            return null;
        }

        const data = await response.json();
        const coordinates = data.features && data.features[0] && data.features[0].center;

        return hasValidCoordinates(coordinates) ? coordinates : null;
    } catch (error) {
        return null;
    }
};

module.exports.index=async(req,res)=>{
    const { q = "", category = "" } = req.query;
    const trimmedSearch = q.trim();
    const trimmedCategory = category.trim();
    const filters = [];

    // Escape user text before building regex filters for search/category links.
    const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const buildTextFilter = (text) => {
        const pattern = new RegExp(escapeRegex(text), "i");

        return {
            $or: [
                { title: pattern },
                { description: pattern },
                { location: pattern },
                { country: pattern }
            ]
        };
    };

    if (trimmedSearch) {
        filters.push(buildTextFilter(trimmedSearch));
    }

    if (trimmedCategory) {
        filters.push({ category: trimmedCategory });
    }

    const query = filters.length ? { $and: filters } : {};
    const allListings=await Listing.find(query);

    res.render("listings/index.ejs",{
        allListings,
        searchQuery: trimmedSearch,
        selectedCategory: trimmedCategory
    });
    
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

    const coordinates = await geocodeListingLocation(newListing);

    if (coordinates) {
        newListing.geometry = {
            type: "Point",
            coordinates
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
        mapToken: getMapToken()
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
    }

    const coordinates = await geocodeListingLocation(updatedListing);

    if (coordinates) {
        updatedListing.geometry = {
            type: "Point",
            coordinates
        };
    }

    await updatedListing.save();
    

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
