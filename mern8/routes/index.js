var express = require("express");
var router = express.Router();
const User = require("../models/userModel");
const passport = require("passport");
const LocalStrategy = require("passport-local");

passport.use(new LocalStrategy(User.authenticate()));
// passport.use(User.createStrategy());

const nodemailer = require("nodemailer");

router.get("/", function (req, res, next) {
    res.render("index", { admin: req.user });
});

router.get("/signup", function (req, res, next) {
    res.render("signup", { admin: req.user });
});

router.post("/signup", async function (req, res, next) {
    try {
        await User.register(
            { username: req.body.username, email: req.body.email },
            req.body.password
        );
        res.redirect("/signin");
    } catch (error) {
        console.log(error);
        res.send(error);
    }
});

router.get("/signin", function (req, res, next) {
    res.render("signin", { admin: req.user });
});

router.post(
    "/signin",
    passport.authenticate("local", {
        successRedirect: "/profile",
        failureRedirect: "/signin",
    }),
    function (req, res, next) {}
);


router.get("/forget", function (req, res, next) {
    res.render("forget", { admin: req.user });
});

router.post("/forget", async function (req, res, next) {
    try {
        const user = await User.findOne({ username: req.body.username });
        if (!user)
            return res.send("User not found! <a href='/forget'>Try Again</a>.");

        await user.setPassword(req.body.newpassword);
        await user.save();
        res.redirect("/signin");
    } catch (error) {
        res.send(error);
    }
});


router.get("/profile", isLoggedIn, function (req, res, next) {
    console.log(req.user);
    res.render("profile", { admin: req.user });
});

router.get("/reset", isLoggedIn, function (req, res, next) {
    res.render("reset", { admin: req.user });
});

router.post("/reset", isLoggedIn, async function (req, res, next) {
    try {
        await req.user.changePassword(
            req.body.oldpassword,
            req.body.newpassword
        );
        await req.user.save();
        res.redirect("/profile");
    } catch (error) {
        res.send(error);
    }
});

router.get("/signout", isLoggedIn, function (req, res, next) {
    req.logout(() => {
        res.redirect("/signin");
    });
});

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.redirect("/signin");
    }
}

function sendmail(email, res) {
    const transport = nodemailer.createTransport({
        service: "gmail",
        host: "smtp.gmail.com",
        port: 465,
        auth: {
            user: "email",
            pass: "password",
        },
    });

    const mailOptions = {
        from: "Dhanesh Pvt. Ltd.<dhanesh1296@gmail.com>",
        to: email,
        subject: "Password Reset Link",
        // text: "Do not share this link to anyone.",
        html: `This is Test Mail`,
    };

    transport.sendMail(mailOptions, (err, info) => {
        if (err) return res.send(err);
        console.log(info);

        return res.send(
            "<h1 style='text-align:center;color: tomato; margin-top:10%'><span style='font-size:60px;'>✔️</span> <br />Email Sent! Check your inbox , <br/>check spam in case not found in inbox.</h1>"
        );
    });
}

module.exports = router;
