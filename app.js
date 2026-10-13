// Main application file: sets up Express, the database, sessions, login, and routes.
if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const express=require("express");
const app=express();
const mongoose=require("mongoose");
const path=require("path");
const ejs=require("ejs");
const PORT=process.env.PORT || 3000;
const ejsMate=require("ejs-mate");
const session=require("express-session");
const { MongoStore } = require('connect-mongo');
const Flash=require("connect-flash");
const ExpressError = require("./utils/ExpressError.js");
const listingRoutes=require("./routes/listing.js");
const reviewRoutes=require("./routes/review.js");
const userRoutes=require("./routes/user.js");
const methodOverride=require("method-override");
const passport=require("passport");
const LocalStrategy=require("passport-local");
const User=require("./models/user.js");

// Stop early when the two values required to run the app are missing.
const requiredEnv = ["ATLASDB_URL", "SECRET"];
const missingEnv = requiredEnv.filter((key) => !process.env[key]);

if (missingEnv.length) {
    throw new Error(`Missing required environment variables: ${missingEnv.join(", ")}`);
}


// Basic Express setup: EJS pages, form data, method override, and public files.
app.engine("ejs",ejsMate);
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.use (express.static(path.join(__dirname,"/public")));

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"/views"));


// Store login sessions in MongoDB so users stay logged in across requests.
const store = new MongoStore({
    mongoUrl: process.env.ATLASDB_URL,
    crypto: {
        secret: process.env.SECRET
    },
    touchAfter: 24 * 60 * 60 // time period in seconds
});


// Cookie settings keep a login active for seven days.
const sessionOptions={
    store: store,
    secret: process.env.SECRET,
    resave:false,
    saveUninitialized:true,
    cookie:{
        httpOnly:true,
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
        maxAge:1000*60*60*24*7
    }
};



// Sessions power login persistence and flash messages.
app.use(session(sessionOptions));
app.use(Flash());


// Passport handles local username/password authentication.
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Make flash messages and auth state available to every EJS template.
app.use((req,res,next)=>{
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
    res.locals.currentUser=req.user;
    next();
});



// Public home page.
app.get("/",(req,res)=>{
    res.render("home.ejs");
});


const MONGO_URL=process.env.ATLASDB_URL;


// Start the server only after MongoDB is reachable.
// Start the server only after MongoDB is reachable.
main().then(()=>{
    console.log("Connected to MongoDB");
    app.listen(PORT, '0.0.0.0', ()=>{
        console.log(`server is running on port ${PORT}`);
    });
}).catch((err)=>{
    console.error("Error connecting to MongoDB:", err);
});

async function main(){
    await mongoose.connect(MONGO_URL);

}





// Group related URLs into separate route files.
app.use("/listings",listingRoutes);
app.use("/listings/:id/reviews",reviewRoutes);
app.use("/",userRoutes);


// 404 and centralized error rendering.
app.use((req,res,next)=>{
    next(new ExpressError(404,"Page Not Found!"));
});

app.use((err,req,res,next)=>{
    if (err.name === "CastError") {
        err = new ExpressError(404, "The page you are looking for does not exist.");
    } else if (err.name === "ValidationError") {
        err = new ExpressError(400, err.message);
    }

    const statusCode = err.statusCode || 500;
    const message = err.message || "Something went wrong!";
    const friendlyTitle = statusCode === 404
        ? "We could not find that page"
        : statusCode === 400
            ? "Something needs a quick fix"
            : "Something went wrong";

    res.status(statusCode).render("listings/error.ejs", {
        err: {
            statusCode,
            message,
            title: friendlyTitle
        }
    });
    // res.status(statusCode).send(message);
});


