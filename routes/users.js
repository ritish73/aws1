var express = require("express");

var FacebookStrategy = require("passport-facebook").Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
var router  = express.Router();
var async = require('async')
var crypto = require('crypto')
var nodemailer = require('nodemailer')
var passport = require("passport");
var Post = require('../models/post.js');
var User = require('../models/user.js');
var Ip = require('../models/ip.js');
const Trending = require("../models/trending.js");
const Popular = require("../models/popular.js");
const e = require("express");
const Recommended = require("../models/recommended.js");
const middlewareObj = require("../middleware/index.js");
const ejsLint = require('ejs-lint');
router.get("/", function(req, res){
  var obj = new Object();
  
  var call  = async function(){
    await middlewareObj.getPostsHomePage(obj);
    // console.log("<<<<<<<<<<<<<<<<<<<>>>>>>>>>>>>>>>>",obj);
      var betrendingpost = obj.betrendingpost
      var ctrendingpost = obj.ctrendingpost
      var etrendingpost = obj.etrendingpost
      var pdtrendingpost = obj.pdtrendingpost
      var bepopularpost = obj.bepopularpost
      var cpopularpost = obj.cpopularpost
      var epopularpost = obj.epopularpost
      var pdpopularpost = obj.pdpopularpost
      res.render("home", 
    {
      betrendingpost: betrendingpost,
      ctrendingpost: ctrendingpost,
      etrendingpost: etrendingpost,
      pdtrendingpost: pdtrendingpost,
      bepopularpost: bepopularpost,
      cpopularpost: cpopularpost,
      epopularpost: epopularpost,
      pdpopularpost: pdpopularpost,
      // async: true
    }
    
    );

  }
  call();
  
  var ip = req.headers['x-forwarded-for'] || 
     req.connection.remoteAddress || 
     req.socket.remoteAddress ||
     (req.connection.socket ? req.connection.socket.remoteAddress : null);
     console.log(ip);
     Ip.findOne({ip_address: ip}, (err,foundip)=>{
       if(err) console.log(err);
       else if(!foundip){
        var newip = new Ip();
        newip.ip_address = ip;
        newip.count = 1;
        newip.save()
       } else if(foundip){
        foundip.count += 1;
        foundip.save();
       }
     })
  console.log("user is successfully serialized in home page")
  console.log(req.user)
  
});


router.get("/T&C", function(req, res){
  res.render("about");
});

router.get("/privacyPolicy", function(req, res){
  res.render("about");
});

router.get("/dashboard", (req,res)=>{
  res.render("dashboard")
})

router.get('/myposts',(req,res)=>{
  if(!req.user){
    res.redirect("/register_or_login");
  }
  User.findById(req.user._id).populate("posts").exec(function(err,user){
    if(err){
      console.log("error occured while displaying all posts written by current user");
      console.log(err);
    } else{
      res.render("userposts",{posts: user.posts});
      
    }
  })
})

router.get('/findUser', (req,res)=>{
  var CurrentUser
  console.log("request made by ajax to find user")
  if(req.user === null){
    res.json({CurrentUser: null});
  } else {
    res.json({CurrentUser: req.user});
  }
})

router.get("/savetolater/:slug", (req,res)=>{
  console.log("request made")
  console.log(req.user)
    Post.findOne({slug: req.params.slug}, (err,foundpost)=>{
      if(err) console.log(err)
      else if(req.user){
        User.findById(req.user._id).populate("saved_for_later").exec(function(err,user){
          if(err) console.log(err)
          else {
            
            var ispushed = 0
            console.log("before length: " + user.saved_for_later.length)
            for(var i=0; i<user.saved_for_later.length;i++){
              
              if(foundpost.title === user.saved_for_later[i].title){
                console.log("entered")
                ispushed = 1 
              }
            }
            console.log("ispushed: " + ispushed)
  
            if(!ispushed){
              console.log("post pushed to save to later posts of : " + req.user.username)
              user.saved_for_later.push(foundpost);
              user.save((err,user)=>{
                if(err) console.log(err)
                else {
                  console.log("after length: " + user.saved_for_later.length)
                  console.log("this is the user who wants to add to watch later list", user)
                  res.json({sl: user.saved_for_later ,message: 'saved to later successfully'});
                }
              })
              
            } else {
              res.json({sl: user.saved_for_later ,message: 'you have already saved this post'});
            }
            
  
          }
        })
      } else{
        console.log("no one is logged in");
        res.json({message : "you need to login to save this post"})
      }
    })
  
  
})


// FACEBOOK AUTHENTICATION
// facebook strategy
var FACEBOOK_APP_ID='1054812551601760';
var  FACEBOOK_APP_SECRET='6c64261a02a8bc25f44337d8766b50ee';

passport.use(new FacebookStrategy(
  {
    clientID: FACEBOOK_APP_ID,
    clientSecret: FACEBOOK_APP_SECRET,
    callbackURL: "http://localhost:3000/auth/facebook/callback",
    profileFields: ['id', 'displayName', 'name', 'gender', 'picture.type(large)', 'email']
  }, 
  function(accessToken, refreshToken, profile, done) {
    console.log(profile)
    // asynchronous
    process.nextTick(function() {

      // find the user in the database based on their facebook id
      User.findOne( {fb_id: profile.id} , function(err, user) {

          // if there is an error, stop everything and return that
          // ie an error connecting to the database
          if (err)
              return done(err);

          // if the user is found, then log them in
          if (user) {
              console.log("user found")
              console.log(user)
              return done(null, user); // user found, return that user
          } else {
              var numberofusers = middlewareObj.countUsers();
              // if there is no user found with that facebook id, create them
              var newUser  = new User();

              // set all of the facebook information in our user model
              newUser.fb_id    = profile.id; // set the users facebook id                   
              newUser.fb_token = profile.token; // we will save the token that facebook provides to the user                    
              newUser.username  = profile.name.givenName + profile.name.familyName; // look at the passport user profile to see how names are returned
              newUser.email = profile.emails[0].value; // facebook can return multiple emails so we'll take the first
              newUser.bb_id = numberofusers+1;
              // newUser.gender = profile.gender
              // newUser.pic = profile.photos[0].value
              // save our user to the database
              newUser.save(function(err) {
                  if (err)
                      throw err;

                  // if successful, return the new user
                  return done(null, newUser);
              });
          }

      });

  })

    // console.log(profile)
    // return done(null,profile);
  }))

router.get("/auth/facebook", passport.authenticate('facebook',{ scope:'email'}));

router.get("/auth/facebook/callback",passport.authenticate('facebook',{
  successRedirect: "/good",
  failureRedirect: "/failed"
})
)


// Google Authentication

passport.use(new GoogleStrategy({
  clientID: "562343987437-hhntpe0uh3qt19lgca4shh8fttrvgkpv.apps.googleusercontent.com",
  clientSecret: "aaPbLLz1nanGc2nQoOe07PEh",
  callbackURL: "http://localhost:3000/google/callback"
},
// api key AIzaSyCn8rZMwbOxiTAU08ObK9dFPuz-p53PbMU
function(accessToken, refreshToken, profile, done) {
    console.log(profile)
    User.findOne({google_id: profile.id}, (err,user)=>{
      if(err) console.log(err)
      if(user){
        console.log("the user we already have who registered using google auth is: ")
        console.log(user)
        return done(null,user)
      } else {
        var numberofusers = middlewareObj.countUsers();
        var newuser = new User()
        newuser.google_id = profile.id
        newuser.email = profile.emails[0].value
        newuser.username = profile.name.givenName + profile.name.familyName
        newuser.bb_id = numberofusers+1;
        newuser.save((err)=>{
          if(err) {
            console.log("an error was encountered while saving the user to database who used google authentication: ");
            console.log(err.errors.username.properties);
            console.log(err.errors.email.properties);
            return done(err,null);      // here i want to redirect user to login page 
          }
          else{
            return done(null,newuser)
          }
        })
      }
    })
    // return done(null, profile);
  })
);


router.get('/google',passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/failed' }),
  function(req, res) {

    

    // Successful authentication, redirect home.
    res.redirect('/good');
  });


router.get("/failed", (req,res)=>{
  res.send("you failed ass hole!!!!!!");
})

router.get("/good", isLoggedIn,(req,res)=>{

  res.send("profile")
})
  





// register nw user get and post routes
router.get("/register_or_login", (req,res)=>{
	res.render("register", {message: ""});
});

router.post("/register",(req,res)=>{
  var numberofusers;
  
    User.countDocuments({},(err, num)=>{
      if(err) console.log(err)
      else{
        console.log(num)
        numberofusers = num;
        var validpass = validatePass(req.body.password)
        var uid = numberofusers + 1;
        if(validpass.status){
          var user = {
            username: req.body.username,
            email: req.body.email,
            bb_id: uid
          }
          User.register(new User(user), req.body.password, function(err, user){
            if(err) {
              console.log(err);
            
              res.redirect("/register_or_login");
            } else{
              passport.authenticate("local-user")(req,res,function(){
                res.redirect("/");
              });
            }
          });
        } else {
          console.log("user creation unsuccessful")
          // for(var i=0;i<validpass.message.length;i++){
          //   validpass.message[i] = req.flash('error',validpass.message[i])
          // }
          res.render('register',{message: validpass.message})
        }
      }
      
    
    });
})

router.post("/login", passport.authenticate("local-user" , {
	
	failureRedirect: "/register_or_login"
}), (req, res)=>{
 
  if(req.user.role === 'admin'){
    res.redirect("/adminportal")
  } else if(req.user.role === 'auditor'){
    res.redirect("/auditorportal")
  } else{
    res.redirect("/")
  }

});









// passport.use('local.signup', new LocalStrategy({
//   usernameField:'email', //it can be email or whatever one chooses
//   passwordField:'password',
//   confirmField:'password',
//   passReqToCallback:true//here is the trick.u pass everything you want to do to a callback
//   },function (req,email, password, done) {
//      req.checkBody('email','Invalid e-mail address...').notEmpty().isEmail().normalizeEmail();//validate email
//      req.checkBody('password','Invalid password...').notEmpty().isLength({min:8});//validate pass to be min 8 chars but you can provide it with checking for capital letters and so on and so forth
//      var errors = req.validationErrors();
//      if(errors){
//      var messages = [];
//      errors.forEach(function (error) {
//      messages.push(error.msg)
//     });
//    return done(null, false, req.flash('error', messages))
//    }

// User.findOne({ email: req.body.email }, function (err, user) {

// // Make sure user doesn't already exist
//   if (user) return done(null, false, {message:'The email address you have 
//   entered is already associated with another account.'
//  });










//logout user route
router.get("/logout" ,(req,res)=>{
  
  console.log("req.user",req.user);
	req.logout();
	res.send("logged you out");
});



router.get('/forgot',(req,res)=>{ 
  res.render('forgot', {message: req.flash('success')});
})

router.post('/forgot',(req,res,next)=>{
  async.waterfall([
    function(done){
      crypto.randomBytes(20,(err,buf)=>{
        var token = buf.toString('hex');
        done(err,token)
      })
    },
    function(token,done){
      User.findOne({email: req.body.email},(err,user)=>{
        if(!user){
          console.log("no user found");
          req.flash('error','no account with this email exists');
          return res.redirect('/forgot');
        }
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; //1 hr
        user.save((err)=>{
          done(err,token,user)
        })
      })
    },
    function(token,user,done){
      var smtpTransport = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: 'BBTESTING69',
          pass: 'BbTesting69'
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'BBTESTING69',
        subject: 'password reset backbenchers',
        text: 'click the link to reset your password\n'+
        'http://' + req.headers.host + '/reset/' + token + '\n\n' 
      }
      smtpTransport.sendMail(mailOptions,(err)=>{
        console.log('mail sent');
        req.flash('success', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
        done(err, 'done');
      })
    }   
  ], function(err){
    if(err) return next(err);
    res.redirect('/forgot')
  })
})


router.get('/reset/:token',(req,res)=>{
  User.findOne({resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } },(err,user)=>{
    if(!user){
      req.flash('error', 'either token is invalid or expired')
      return res.redirect('forgot')
    } else{
      res.render('reset',{token: req.params.token})
    }
  })
})


router.post('/reset/:token', function(req, res) {
  async.waterfall([
    function(done) {
      User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        if (!user) {
          req.flash('error', 'Password reset token is invalid or has expired.');
          return res.redirect('back');
        }
        if(req.body.password === req.body.confirm) {
          user.setPassword(req.body.password, function(err) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;

            user.save(function(err) {
              req.logIn(user, function(err) {
                done(err, user);
              });
            });
          })
        } else {
            req.flash("error", "Passwords do not match.");
            return res.redirect('back');
        }
      });
    },
    function(user, done) {
      var smtpTransport = nodemailer.createTransport({
        service: 'Gmail', 
        auth: {
          user: 'BBTESTING69',
          pass: 'BbTesting69'
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'BBTESTING69',
        subject: 'Your password has been changed',
        text: 'Hello,\n\n' +
          'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        req.flash('success', 'Success! Your password has been changed.');
        done(err);
      });
    }
  ], function(err) {
    res.redirect('/posts/engineering');
  });
});


router.get("/sharepost/:slug", (req,res)=>{

    Post.findOne({slug: req.params.slug},(err,post)=>{
      if(err) console.log(err)
      else if(req.user){
        User.findById(req.user._id, (err,user)=>{
          if(err) console.log(err)
          else{
            var already = false;
            var index = 0;
            for(var i=0; i<user.shared_posts.length ; i++){
              if(post._id.equals(user.shared_posts[i].postid)){
                already = true;
                index = i;
                break;
              }
            }
            console.log("already : ",already)
            if(already){
              user.shared_posts[index].count += 1;

            } else if(!already){
              var obj = {};
              obj.postid = post._id;
              obj.count = 1;
              user.shared_posts.push(obj);
            }
            user.save((err,user)=>{
              if(err) console.log(err)
              console.log(user.shared_posts)
            });
            res.json({
              sharedpostsarray : user.shared_posts,
              message: user.username + " is logged in"
            })
          }
        })
      } else {
        console.log("no user logged in")
        res.json({message: "no user logged in"})
      }
    })
})




// middleware for checking if user is logged in 
function isLoggedIn(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect("/register_or_login");
}

function escapeRegex(string) {
  return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

function validatePass(password){
  var message,status
  var counts=0
  var countu=0,countl=0,countd=0
  console.log("this is the password in validate pass function: "+password)
  if(password.length<8 || password.length>12){
    // message[h++] = 'password length must be between 8 to 12'
    console.log('password length must be between 8 to 12')
    status = 0
  }
  for(var i=0;i<password.length;i++){
    console.log("in the beginning of for loop countu is", countu, " countl is ", countl, "counts is ",counts, " countd is ",countd);
    var c = password[i]
    console.log(c, " ", c.toUpperCase(), " ", c.toLowerCase());
    
    if(c==="#" || c==="@" || c==="$"){
      counts++;
    } 
    else if(c === c.toLowerCase() && (c!="#" && c!="@" && c!="$") && !(c>='0' && c<='9')){
      countl++
      console.log("countlower inside if",countl);
    }
    else if(c>='0' && c<='9'){
      countd++;
    }
    else if(c === c.toUpperCase() && (c!="#" && c!="@" && c!="$") && !(c>='0' && c<='9')){
      countu++
      console.log("countupper inside if", countu);
    }
  }
  console.log("countd: ",countd,"countl: ",countl, "countu: ",countu,"counts: ",counts)
  if(countd === 0 || countl === 0 || countu === 0 || counts===0 ){
    
    if(countd === 0){
      // message[h++] = 'you must enter atleast one number'
      console.log('you must enter atleast one number')
    }
    if(countl === 0){
      // message[h++] = 'you must have atleast one lowercase letter in your password'
      console.log('you must have atleast one lowercase letter in your password')
    }
    if(countu === 0){
      // message[h++] = 'you must have atleast one uppercase letter '
      console.log('you must have atleast one uppercase letter ')
    }
    message = "password must be of minimum 8 and max 12 characters, must contain atleast one uppercase, one lowercase and one number and a special character"
    status = 0
  }
    
  else 
    status = 1

  return {
    message: message,
    status: status
  }
  
}



module.exports = router;

// user register
// author register
// admin register

// user login
// author login
// admin login

// user protected routes
// author protected routes
// admin protected routes