const express = require("express");
const router = express.Router({ mergeParams: true });
const User=require("../models/user.js");
const wrapAsync=require("../utils/wrapAsync.js");
const passport=require("passport");
router.get("/register", (req, res) => {
    res.render("users/signup.ejs");
});


router.post("/register", wrapAsync(async (req, res) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, (err) => {
            if (err) return next(err);
            req.flash("success", "Welcome to WonderLust!");
            res.redirect("/listings");
        });
    } catch (error) {
        req.flash("error", "Already registered with this email or username. Please try again.");
        res.redirect("/register");
    }
}));

router.get("/login", (req, res) => {
    res.render("users/login.ejs");
});


router.post("/login",
    passport.authenticate("local", {
    failureFlash: true,
    failureRedirect: "/login"  
}),
async(req, res) => {
    req.flash("success", "Welcome back!");
    res.redirect("/listings");
});

router.get("/logout", (req, res,next) => {
    req.logout(function(err) {
        if (err) { return next(err); }
        req.flash("success", "You have been logged out!");
        res.redirect("/login");
    });
});


module.exports = router;