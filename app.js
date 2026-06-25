const express=require("express");
const app=express();
const mongoose=require("mongoose");
const path=require("path");
const ejs=require("ejs");
const PORT=3000;
const ejsMate=require("ejs-mate");
const session=require("express-session");
const Flash=require("connect-flash");
const ExpressError = require("./utils/ExpressError.js");
const listingRoutes=require("./routes/listing.js");
const reviewRoutes=require("./routes/review.js");
const userRoutes=require("./routes/user.js");
const methodOverride=require("method-override");
const passport=require("passport");
const LocalStrategy=require("passport-local");
const User=require("./models/user.js");


app.engine("ejs",ejsMate);
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.use (express.static(path.join(__dirname,"/public")));

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"/views"));

const sessionOptions={
    secret:"thisshouldbeabettersecret!",
    resave:false,
    saveUninitialized:true,
    cookie:{
        httpOnly:true,
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
        maxAge:1000*60*60*24*7
    }
};

app.use(session(sessionOptions));
app.use(Flash());


app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
    res.locals.currentUser=req.user;
    next();
});



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





app.use("/listings",listingRoutes);
app.use("/listings/:id/reviews",reviewRoutes);
app.use("/",userRoutes);


app.use((req,res,next)=>{
    next(new ExpressError(404,"Page Not Found!"));
});

app.use((err,req,res,next)=>{
    let {statusCode=500,message="Something went wrong!"}=err;
    
    res.status(statusCode).render("listings/error.ejs",{err});
    // res.status(statusCode).send(message);
});


