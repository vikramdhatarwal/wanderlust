const Listing=require("./models/listing");
const Review=require("./models/review");
const { listingSchema } = require("./schema.js");
const ExpressError=require("./utils/ExpressError.js");

const isSafeLocalRedirect = (redirectUrl) => {
    return typeof redirectUrl === "string"
        && redirectUrl.startsWith("/")
        && !redirectUrl.startsWith("//")
        && !redirectUrl.startsWith("/login");
};

const getRedirectUrl = (req) => {
    if (req.method === "GET" && isSafeLocalRedirect(req.originalUrl)) {
        return req.originalUrl;
    }

    const referrer = req.get("Referrer") || req.get("Referer");

    if (referrer) {
        try {
            const referrerUrl = new URL(referrer, `${req.protocol}://${req.get("host")}`);

            if (referrerUrl.host === req.get("host")) {
                const localUrl = `${referrerUrl.pathname}${referrerUrl.search}`;

                if (isSafeLocalRedirect(localUrl)) {
                    return localUrl;
                }
            }
        } catch (error) {
            return "/listings";
        }
    }

    return "/listings";
};


module.exports.isLoggedIn=(req,res,next)=>{
    if(!req.isAuthenticated()){
        // Remember the useful page, not protected POST endpoints.
        req.session.redirectUrl=getRedirectUrl(req);
        req.flash("error","You must be logged in to do that");
        return res.redirect("/login");
    }
    next();
};


module.exports.saveRedirectUrl=async(req,res,next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl=req.session.redirectUrl;
    }
    next();
};


module.exports.isowner=async(req,res,next)=>{
    const {id}=req.params;
    const listing=await Listing.findById(id);
    if(!listing){
        req.flash("error","Listing not found");
        return res.redirect("/listings");
    }
    if(!listing.owner.equals(req.user._id)){
        req.flash("error","You are not the owner of this listing");
        return res.redirect(`/listings/${id}`);
    }
    next();
};

module.exports.isReviewAuthor=async(req,res,next)=>{
    const {id,reviewId}=req.params;
    const review=await Review.findById(reviewId);
    if(!review){
        req.flash("error","Review not found");
        return res.redirect(`/listings/${id}`);
    }
    if(!review.author || !review.author.equals(req.user._id)){
        req.flash("error","You are not the author of this review");
        return res.redirect(`/listings/${id}`);
    }
    next();
};

module.exports.validateListing=(req,res,next)=>{
    // Joi validates the request body before controllers create/update records.
    const { error } = listingSchema.validate(req.body);
    if (error) {
        const errMsg=error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400,errMsg);
    }
    next();
};
