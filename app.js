const express=require("express");
const app=express();
const mongoose=require("mongoose");
const path=require("path");
const ejs=require("ejs");
const Listing=require("./models/listing");
const PORT=3000;
const ejsMate=require("ejs-mate");
const wrapAsync=require("./utils/wrapAsync.js");
const ExpressError=require("./utils/ExpressError.js");
const { listingSchema } = require("./schema.js");
const { reviewSchema } = require("./schema.js");
const Review=require("./models/review.js");
app.engine("ejs",ejsMate);
app.use(express.urlencoded({extended:true}));
const methodOverride=require("method-override");
app.use(methodOverride("_method"));
app.use (express.static(path.join(__dirname,"/public")));

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"/views"));
app.get("/",(req,res)=>{
    res.render("home.ejs");
});


const MONGO_URL="mongodb://127.0.0.1:27017/wanderlust";


main().then(()=>{
    console.log("Connected to MongoDB");
    app.listen(PORT,()=>{
        console.log(`server is running on port ${PORT}`);
    });
}).catch((err)=>{
    console.error("Error connecting to MongoDB:", err);
});

async function main(){
    await mongoose.connect(MONGO_URL);

}

//server side validation middleware for listing  using Joi schemas
const validateListing=(req,res,next)=>{
    const { error } = listingSchema.validate(req.body);
    if (error) {
        const errMsg=error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400,errMsg);
    }
    next();
};

//server side validation middleware for review using Joi schemas
const validateReview=(req,res,next)=>{
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const errMsg=error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400,errMsg);
    }
    next();
};

//Index route to display all listings
app.get("/listings",wrapAsync(async(req,res)=>{
   
    const allListings=await Listing.find({});
    res.render("listings/index.ejs",{allListings});
    
}));


//new route to display a form for creating a new listing
app.get("/listings/new",wrapAsync(async(req,res)=>{
    res.render("listings/new.ejs");
}));

//Create route to handle form submission and create a new listing
app.post("/listings",validateListing,wrapAsync(async(req,res)=>{
    const newListing=new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");

}));


//Show route to display a single listing by ID
app.get("/listings/:id",wrapAsync(async(req,res)=>{
    const {id}=req.params;
    
    const listing=await Listing.findById(id).populate("reviews");
    if(!listing){
        throw new ExpressError(404,"Listing not found");
    }
    res.render("listings/show.ejs",{listing});
    
}));

//Edit route to display a form for editing an existing listing
app.get("/listings/:id/edit",wrapAsync(async(req,res)=>{
    const {id}=req.params;
    
    const listing=await Listing.findById(id);
    if(!listing){
        throw new ExpressError(404,"Listing not found");
    }
    res.render("listings/edit.ejs",{listing});
    
}));

//Update route to handle form submission and update an existing listing
app.put("/listings/:id",validateListing,wrapAsync(async(req,res)=>{
    const {id}=req.params;
  
    const updatedListing=await Listing.findByIdAndUpdate(id,req.body.listing,{new:true,runValidators:true});
    if(!updatedListing){
        throw new ExpressError(404,"Listing not found");
    }
    res.redirect(`/listings/${updatedListing._id}`);
 
}));

//confirm delete route to display a confirmation page before deleting a listing
app.get("/listings/:id/delete",wrapAsync(async(req,res)=>{
    const {id}=req.params;

    const listing=await Listing.findById(id);
    if(!listing){
        throw new ExpressError(404,"Listing not found");
    }
    res.render("listings/confirmDelete.ejs",{listing});

}));

//Delete route to delete an existing listing
app.delete("/listings/:id",wrapAsync(async(req,res)=>{
    const {id}=req.params;
    
    const deletedListing=await Listing.findByIdAndDelete(id);
    if(!deletedListing){
        throw new ExpressError(404,"Listing not found");
    }
    res.redirect("/listings");
  
}));

//review route to handle form submission and create a new review for a listing
app.post("/listings/:id/reviews", validateReview, wrapAsync(async(req,res)=>{
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

app.use((req,res,next)=>{
    next(new ExpressError(404,"Page Not Found!"));
});

app.use((err,req,res,next)=>{
    let {statusCode=500,message="Something went wrong!"}=err;
    
    res.status(statusCode).render("listings/error.ejs",{err});
    // res.status(statusCode).send(message);
});


// app.get("/testlistings",async(req,res)=>{ 
//     let sampleListing=new Listing({
//         title:"Beautiful Beach House",
//         description:"A stunning beach house with breathtaking ocean views. This property features 4 bedrooms, 3 bathrooms, and a spacious living area perfect for entertaining guests. Enjoy the sound of the waves and the fresh sea breeze from the comfort of your own home.",
        
//         price:1200,
//         location:"Miami, FL",
//         country:"USA"
//     });
//     await sampleListing.save();
//     console.log("Sample listing created:");
//     res.send("Sample listing created!");
// });

