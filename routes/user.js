const express = require("express");
const router = express.Router({ mergeParams: true });
const User=require("../models/user.js");
const wrapAsync=require("../utils/wrapAsync.js");

router.get("/register", (req, res) => {
    res.render("users/signup.ejs");
});


router.post("/register", wrapAsync(async (req, res) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
        req.flash("success", "Welcome to WonderLust!");
        res.redirect("/login");
    } catch (error) {
        req.flash("error", "Already registered with this email or username. Please try again.");
        res.redirect("/register");
    }
}));

module.exports = router;