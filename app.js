const express=require("express");
const app=express();
const mongoose=require("mongoose");
const path=require("path");
const ejs=require("ejs");

const PORT=3000;
const ejsMate=require("ejs-mate");




const listingRoutes=require("./routes/listing.js");
const reviewRoutes=require("./routes/review.js");
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



//server side validation middleware for review using Joi schemas


app.use("/listings",listingRoutes);
app.use("/listings/:id/reviews",reviewRoutes);


app.use((req,res,next)=>{
    next(new ExpressError(404,"Page Not Found!"));
});

app.use((err,req,res,next)=>{
    let {statusCode=500,message="Something went wrong!"}=err;
    
    res.status(statusCode).render("listings/error.ejs",{err});
    // res.status(statusCode).send(message);
});


