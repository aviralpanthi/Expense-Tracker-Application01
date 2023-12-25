var express = require('express');
var router = express.Router();
 
const User = require('../models/userModel');
const nodemailer = require("nodemailer");
const Expense = require('../models/data')

const passport = require("passport");
const LocalStrategy = require("passport-local");
passport.use(new LocalStrategy(User.authenticate()));

/* GET home page. */

router.get('/', function(req, res, next) {
  res.render('index', { admin: req.user });
});
router.get('/sendmail', function(req, res, next) {
  res.render('sendmail',{ admin: req.user });
});
router.post('/sendmail', function(req, res, next) {
  sendmail(req.body.email, res)
});

function sendmail(email, res) {
  const transport = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 465,
      auth: {
          user: "aviralaviral7@gmail.com",
          pass: "acedwuaiwomliuxo",
      },
  });

  const mailOptions = {
      from: "Aviral Pvt. Ltd.<aviralaviral7@gmail.com>",
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

router.get('/signup', function(req, res, next) {
  res.render('signup', { admin: req.user });
});

router.post('/signup',async function(req, res, next) {
try {
  await User.register({
    username: req.body.username, email: req.body.email
  },
req.body.password);
res.redirect('/signin')
  
} catch (error) {
  console.log(error.message);
  res.send(error)
}
  
});

router.get('/signin', function(req, res, next) {
  res.render('signin',{admin: req.user});
});

router.post(
  "/signin",
  passport.authenticate("local", {
      successRedirect: "/profile",
      failureRedirect: "/",
  }),
  function (req, res, next) {}
);

// AUTHENTICATED ROUTE MIDDLEWARE

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.redirect("/signin");
    }
}


// SIGNOUT CODE
router.get("/signout", isLoggedIn, function (req, res, next) {
    req.logout(() => {
        res.redirect("/signin");
    });
});

router.get('/forget',function(req,res,next){
  res.render("forget",{admin: req.user})

})

router.post('/forget/:id', async function(req,res,next){
  try {
    const user = await User.findById(req.params.id);
    if(!user)
    return res.send("User not found! <a href='/forget'>Try Again</a>")
  if(user.token == req.body.token){
    user.token = -1;
    await user.setPassword(req.body.newpassword)
    await user.save()
    res.redirect('/signin')
  }else{
    user.token = -1 ;
    await user.save();
    res.send("Invalid Token! <a href='/forget'>Try Again<a/>");
  }
    
  } catch (error) {
    res.send(error)
  }
})

router.get('/reset', isLoggedIn,async function(req,res,next){
  res.render('reset', {admin: req.user})

})

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

router.get("/profile", isLoggedIn, async function (req, res, next) {
  try {
      const { expenses } = await req.user.populate("expenses");
      console.log(req.user, expenses);
      res.render("profile", { admin: req.user, expenses });
  } catch (error) {
      res.send(error);
  }
});

router.get("/createexpense", isLoggedIn, function (req, res, next) {
  res.render("createexpense", { admin: req.user, expenses: [] });
});
router.post("/createexpense", isLoggedIn, async function (req, res, next) {
  try {
    const currentUser = await User.findOne({ _id: req.user._id });

    const newPost = await Expense.create({ 
      amount: req.body.amount,
      category: req.body.category,
      remark: req.body.remark,
      paymentmode: req.body.paymentmode,
      user: currentUser._id,
    });

    // Ensure currentUser.posts is initialized as an array
    currentUser.expenses = currentUser.expenses || [];
        currentUser.expenses.push(newPost._id);
    await currentUser.save();

    res.redirect('/profile');
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error: " + error.message);
  }
});



router.get("/filter", async function (req, res, next) {
  try {
      let { expenses } = await req.user.populate("expenses");
      expenses = expenses.filter((e) => e[req.query.key] == req.query.value);
      res.render("profile", { admin: req.user, expenses });
  } catch (error) {
      console.log(error);
      res.send(error);
  }
});
















module.exports = router;
