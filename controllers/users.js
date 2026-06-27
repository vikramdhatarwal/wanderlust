const User=require("../models/user.js");
const Listing=require("../models/listing.js");
const Review=require("../models/review.js");
const ExpressError=require("../utils/ExpressError.js");

const consumeRedirectUrl = (req, res) => {
    const redirectUrl = res.locals.redirectUrl || req.session.redirectUrl || "/listings";
    delete req.session.redirectUrl;
    return redirectUrl;
};

module.exports.renderSignUpForm = (req, res) => {
    res.render("users/signup.ejs");
}


module.exports.signUp = async (req, res, next) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, (err) => {
            if (err) return next(err);
            req.flash("success", "Welcome to WonderLust!");
            res.redirect(consumeRedirectUrl(req, res));
        });
    } catch (error) {
        req.flash("error", "Already registered with this email or username. Please try again.");
        res.redirect("/register");
    }
}

module.exports.renderLoginForm = (req, res) => {
    res.render("users/login.ejs");
}

module.exports.renderProfile = async(req, res) => {
    const profileUser = await User.findById(req.user._id);

    if (!profileUser) {
        throw new ExpressError(404, "We could not find your profile.");
    }

    const [userListings, reviewCount] = await Promise.all([
        Listing.find({ owner: profileUser._id }).sort({ _id: -1 }),
        Review.countDocuments({ author: profileUser._id })
    ]);

    res.render("users/profile.ejs", {
        user: profileUser,
        userListings,
        reviewCount
    });
}

module.exports.login = async(req, res) => {
    req.flash("success", "Welcome back!");
    res.redirect(consumeRedirectUrl(req, res));
}

module.exports.logout = (req, res,next) => {
    req.logout(function(err) {
        if (err) { return next(err); }
        req.flash("success", "You have been logged out!");
        res.redirect("/login");
    });
}
