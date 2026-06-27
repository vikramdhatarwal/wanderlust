const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync=require("../utils/wrapAsync.js");
const passport=require("passport");
const {saveRedirectUrl, isLoggedIn}=require("../middleware.js");

const userController=require("../controllers/users.js");

router.route("/register")
    .get(userController.renderSignUpForm)
    .post(wrapAsync(userController.signUp));



router.route("/login")
    .get(userController.renderLoginForm)
    .post(saveRedirectUrl,
        passport.authenticate("local", {
        failureFlash: true,
        failureRedirect: "/login"  
        }),
        userController.login
    );


router.get("/profile", isLoggedIn, wrapAsync(userController.renderProfile));

router.get("/logout", userController.logout);


module.exports = router;
