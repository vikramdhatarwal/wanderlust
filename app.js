const express=require("express");
const app=express();
const mongoose=require("mongoose");
const path=require("path");
const ejs=require("ejs");
const Listing=require("./models/listing");

app.listen(3000,()=>{
    console.log("server is running on port 3000");
});


app.get("/",(req,res)=>{
    res.send("Hi,I am root");
});


const MONGO_URL="mongodb://127.0.0.1:27017/wanderlust";


main().then(()=>{
    console.log("Connected to MongoDB");
}).catch((err)=>{
    console.error("Error connecting to MongoDB:", err);
});

async function main(){
    await mongoose.connect(MONGO_URL);

}

app.get("/testlistings",async(req,res)=>{ 
    let sampleListing=new Listing({
        title:"Beautiful Beach House",
        description:"A stunning beach house with breathtaking ocean views. This property features 4 bedrooms, 3 bathrooms, and a spacious living area perfect for entertaining guests. Enjoy the sound of the waves and the fresh sea breeze from the comfort of your own home.",
        
        price:1200,
        location:"Miami, FL",
        country:"USA"
    });
    await sampleListing.save();
    console.log("Sample listing created:");
    res.send("Sample listing created!");
});