const express=require("express");
const app=express();
const mongoose=require("mongoose");
const path=require("path");
const ejs=require("ejs");
const Listing=require("./models/listing");
const PORT=3000;
app.use(express.urlencoded({extended:true}));
const methodOverride=require("method-override");
app.use(methodOverride("_method"));

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"/views"));
app.get("/",(req,res)=>{
    res.send("Hi,I am root");
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

//Index route to display all listings
app.get("/listings",async(req,res)=>{
    try{
        const allListings=await Listing.find({});
        res.render("listings/index.ejs",{allListings});
    }catch(err){
        console.error("Error fetching listings:", err);
        res.status(500).send("Internal Server Error");
    }
});


//new route to display a form for creating a new listing
app.get("/listings/new",(req,res)=>{
    res.render("listings/new.ejs");
});

//Create route to handle form submission and create a new listing
app.post("/listings",async(req,res)=>{
    try{
        const newListing=new Listing(req.body.listing);
        await newListing.save();
        res.redirect("/listings");
    }catch(err){
        console.error("Error creating listing:", err);
        res.status(500).send("Internal Server Error");
    }
});


//Show route to display a single listing by ID
app.get("/listings/:id",async(req,res)=>{
    const {id}=req.params;
    try{
        const listing=await Listing.findById(id);
        if(!listing){
            return res.status(404).send("Listing not found");
        }
        res.render("listings/show.ejs",{listing});
    }catch(err){
        console.error("Error fetching listing:", err);
        res.status(500).send("Internal Server Error");
    }
});

//Edit route to display a form for editing an existing listing
app.get("/listings/:id/edit",async(req,res)=>{
    const {id}=req.params;
    try{
        const listing=await Listing.findById(id);
        if(!listing){
            return res.status(404).send("Listing not found");
        }
        res.render("listings/edit.ejs",{listing});
    }catch(err){
        console.error("Error fetching listing:", err);
        res.status(500).send("Internal Server Error");
    }
});

//Update route to handle form submission and update an existing listing
app.put("/listings/:id",async(req,res)=>{
    const {id}=req.params;
    try{
        const updatedListing=await Listing.findByIdAndUpdate(id,req.body.listing,{new:true});
        if(!updatedListing){
            return res.status(404).send("Listing not found");
        }
        res.redirect(`/listings/${updatedListing._id}`);
    }catch(err){
        console.error("Error updating listing:", err);
        res.status(500).send("Internal Server Error");
    }
});

//confirm delete route to display a confirmation page before deleting a listing
app.get("/listings/:id/delete",async(req,res)=>{
    const {id}=req.params;
    try{
        const listing=await Listing.findById(id);
        if(!listing){
            return res.status(404).send("Listing not found");
        }
        res.render("listings/confirmDelete.ejs",{listing});
    }catch(err){
        console.error("Error fetching listing:", err);
        res.status(500).send("Internal Server Error");
    }
});

//Delete route to delete an existing listing
app.delete("/listings/:id",async(req,res)=>{
    const {id}=req.params;
    try{
        const deletedListing=await Listing.findByIdAndDelete(id);
        if(!deletedListing){
            return res.status(404).send("Listing not found");
        }
        res.redirect("/listings");
    }catch(err){
        console.error("Error deleting listing:", err);
        res.status(500).send("Internal Server Error");
    }
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

