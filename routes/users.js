var express = require("express");
var app = express();
var moment = require("moment");
var FacebookStrategy = require("passport-facebook").Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
var router  = express.Router();
var async = require('async')
var crypto = require('crypto')
var flash = require('connect-flash')
var nodemailer = require('nodemailer')
var passport = require("passport");
var Post = require('../models/post.js');
var User = require('../models/user.js');
var Ip = require('../models/ip.js');
const Trending = require("../models/trending.js");
const Popular = require("../models/popular.js");
const Recommended = require("../models/recommended.js");
const Review = require("../models/review.js")
const middlewareObj = require("../middleware/index.js");
const auth = require("../middleware/auth.js");
const check = require("../controllers/checkAuthcontroller");
const dashboardObj = require("../controllers/dashboardcontroller.js");
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken");
const ejsLint = require('ejs-lint');
const nodemailerSendgrid = require('nodemailer-sendgrid');
const {USER, PASS, HOSTNAME, PROTOCOL} = require("../config/index")
const { 
  FACEBOOK_APP_ID, FACEBOOK_APP_SECRET, F_callback_url,
  GOOGLE_APP_ID,GOOGLE_APP_SECRET,G_callback_url        
} = require("../config/third_party_auth.js")

// app.use((req,res,next)=>{
//   res.locals.successmessage = req.flash('success')
//   res.locals.errormessage = req.flash('error')
//   res.locals.warningmessage = req.flash('warning')
//   next();
// })


const transport = nodemailer.createTransport(
  nodemailerSendgrid({
    apiKey: "SG.B1IJJAIJRQaThbsOibOhuw.ITEDqiEbtNvqRqLRTNZNqRAeAXFbDG8NgmAYnJMv2Sw"
  })
  )


router.get('/aboutus',(req,res)=>{
  res.render('aboutus');
})


router.get("/" , check ,function(req, res){
  // console.log("in home : ",req.user)
  var message=undefined;
  if(req.query.message){
    message = req.query.message;
  }
  // console.log("all user ids :", "google_id : ",req.user.google_id," fb_id : ",req.user.fb_id," bb_id : ",req.user.bb_id);
  var obj = new Object();
  // console.log("req.user and req.is authenticated  : " ,req.isAuthenticated(), req.user )
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

      var berecommendedpost = obj.berecommendedpost
      var crecommendedpost = obj.crecommendedpost
      var erecommendedpost = obj.erecommendedpost
      var pdrecommendedpost = obj.pdrecommendedpost

      const reviews = await Review.find({});

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

      berecommendedpost: berecommendedpost,
      crecommendedpost: crecommendedpost,
      erecommendedpost: erecommendedpost,
      pdrecommendedpost: pdrecommendedpost,
      reviews: reviews,
      message: req.flash('success')
      // async: true 
    }
    
    );

  }
  call();
  
  var ip = req.headers['x-forwarded-for'] || 
     req.connection.remoteAddress || 
     req.socket.remoteAddress ||
     (req.connection.socket ? req.connection.socket.remoteAddress : null);
    //  console.log(ip);
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
  // console.log("user is successfully serialized in home page")
  // console.log(req.user)
  
});

router.get('/delete', check ,async (req,res)=>{
  var user = await User.findOne({_id: req.user._id});
  user.deleted = true;
  user.deletedAt = moment().format('MMMM Do YYYY, h:mm:ss a');
  await user.save();
  req.flash('success','your account was deleted');
  res.send()
})

router.get("/termsandconditions", function(req, res){
  res.render("termsandconditions");
});

router.get("/privacypolicy", function(req, res){
  res.render("privacypolicy");
});

router.get("/blogs",(req,res)=>{
  res.render('allblogspage')
})

router.get('/myposts',(req,res)=>{
  if(!req.user){
    res.redirect("/register_or_login");
  }
  User.findById(req.user._id).populate("posts").exec(function(err,user){
    if(err){
      console.log("Error occured while displaying all posts written by current user");
      console.log(err);
    } else{
      res.render("userposts",{posts: user.posts});
      
    }
  })
})

router.get('/findUser', auth, (req,res)=>{
  var CurrentUser
  console.log("request made by ajax to find user")
  if(req.user === null){
    res.json({CurrentUser: null});
  } else {
    res.json({CurrentUser: req.user});
  }
})

router.get('/addFollower/:authname', auth , async (req,res)=>{
  console.log("req.params.authname = " + req.params.authname)
  console.log("hhhhhhhhhhhhhhhhh")
  // add currentuser to follower list of this author
  req.flash('success','now you are following this author')
  await middlewareObj.addFollower(res,req)
  .then((message)=>{
    res.json({message : message})
  })
  
})

router.get('/sharePost/:slug', auth, async (req,res)=>{

  await middlewareObj.sharePost(req);
  var thepost = await Post.findOne({slug:req.params.slug});
  res.json({value: thepost.shares});
})

router.get("/savetolater/:slug", check ,(req,res)=>{
  // console.log("request made")
  // console.log(req.user)
    Post.findOne({slug: req.params.slug}, (err,foundpost)=>{
      if(err) console.log(err)
      else if(req.user){
        User.findById(req.user._id).populate("saved_for_later").exec(async function(err,user){
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
              await user.saved_for_later.push(foundpost);
              await user.save((err,user)=>{
                if(err) console.log(err)
                else {
                  console.log("after length: " + user.saved_for_later.length)
                  console.log("this is the user who wants to add to watch later list", user)
                  res.json({message: 'saved to later successfully'});
                }
              })
              
            } else {
              res.json({message: 'you have already saved this post'});
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
passport.use(new FacebookStrategy(
  {
    clientID: FACEBOOK_APP_ID,
    clientSecret: FACEBOOK_APP_SECRET,
    callbackURL: F_callback_url,
    profileFields: ['id', 'displayName', 'name', 'gender', 'picture.type(large)', 'email']
  }, 
  function(accessToken, refreshToken, profile, done) {
    middlewareObj.helperFacebookAuth(accessToken, refreshToken, profile, done);
  }))

router.get("/auth/facebook", passport.authenticate('facebook',{ scope:'email'}));

router.get("/auth/facebook/callback",passport.authenticate('facebook',{
  failureRedirect: "/register_or_login?message=An error occured while authentication with facebook'"
}), async(req,res)=>{
  if(req.user){
    if(req.user.fb_id) {
     res.cookie('_fb_token' ,req.user.fb_id);
    } else if(req.user.google_id){
      res.cookie('_google_token', req.user.google_id)
    }
  }
    // Successful authentication, redirect home.
    res.redirect('/');
  }
)




// Google Authentication

passport.use(new GoogleStrategy({
  clientID: GOOGLE_APP_ID,
  clientSecret: GOOGLE_APP_SECRET,
  callbackURL: G_callback_url
},
// api key AIzaSyCn8rZMwbOxiTAU08ObK9dFPuz-p53PbMU
function(accessToken, refreshToken, profile, done) {
  middlewareObj.helperGoogleAuth(accessToken, refreshToken, profile, done);
  })
);



router.get('/google',passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/register_or_login?message=An error occured while authentication with google' }),
  function(req, res) {

    if(req.user){
     if(req.user.fb_id) {
      res.cookie('_fb_token' ,req.user.fb_id);
    } else if(req.user.google_id){
      res.cookie('_google_token', req.user.google_id)
    }
  }
    // Successful authentication, redirect home.
    res.redirect('/');
  });


router.get("/failed", (req,res)=>{
  res.send("you failed ass hole!!!!!!");
})

router.get("/good", isLoggedIn,(req,res)=>{

  res.send("profile")
})
  





// register nw user get and post routes
router.get("/register_or_login", (req,res)=>{
  var message;
  console.log(req.query.m)
  if(req.query.m === '0'){
    console.log("hhhhhhhhhhhhh")
    req.flash('error','You need to login to perform this action')
    res.redirect("/register_or_login")
  }else{
    res.render("register");
  }
});

router.post("/register_old",(req,res)=>{
  var numberofusers;
  
    User.countDocuments({},(err, num)=>{
      if(err) console.log(err)
      else{
        console.log(num)
        numberofusers = num;
        var validpass = validatePass(req.body.password)
        var uid = numberofusers + 1;
        if(validpass.status){

          const myfunction = async ()=>{          
            // const isMatch = await bcrypt.compare(password, hashedPassword); //return a boolean value
            var user = new User();
            
            user.username =  req.body.username;
            user.password =  req.body.password;
            user.email =  req.body.email;
            user.bb_id =  uid;
            
            user.save().then(()=>{
              console.log(user);
              res.status(200);
              passport.authenticate("local-user")(req,res,function(){
                res.redirect("/");
              })
            }).catch((e)=>{
              console.log(e);
              res.status(400).redirect("/register_or_login");
            })
          }
          myfunction();

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







router.post("/register",(req,res)=>{
  var numberofusers;
    User.countDocuments({},(err, num)=>{
      if(err) console.log(err)
      else{
        console.log(num)
        numberofusers = num;
        var validpass = validatePass(req.body.password)
        // var validpass = {};
        // validpass.status = 1;
        var uid = numberofusers + 1;
        if(validpass.status){

          const myfunction = async ()=>{
            var user = new User();
            
            user.username =  req.body.username;
            user.password =  req.body.password;
            user.email =  req.body.email;
            user.bb_id =  uid;
            console.log(moment().format('MMMM Do YYYY, h:mm:ss a'))
            user.createdAt = moment().format('MMMM Do YYYY, h:mm:ss a');
            await user.hashPassword()
            user.save().then(async ()=>{
              // console.log(user);
              const token = await user.generateAuthToken();
              res.cookie('bearer_token', token,{
                httpOnly: true,
                path: '/'
              });
              req.flash('success','Welcome to the backbenchers community')
              res.redirect("/");
            }).catch((e)=>{
              console.log(e);
              req.flash('error','An error occured while creating your account')
              res.status(400).redirect("/register_or_login");
            })
          }
          myfunction();

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

router.post("/login" , async (req,res)=>{
  try{
    
    const token = await req.cookies.bearer_token;
    // console.log("token from cookiee : ", token);
    const user = await User.findByCredentials(req.body.username, req.body.password);
    console.log(user)
    // console.log("user: ", user);
    if(user){
      console.log("all user ids :", "google_id : ",user.google_id," fb_id : ",user.fb_id," bb_id : ",user.bb_id);
      // console.log( "req.token: " ,req.token)
      if(!token){
        // this case occors if jwt cookie is deleted on the client side
        // delete previous tokens
        console.log(user.tokens.length)
        user.tokens.length = 0;
        console.log("after  deleting: " ,user.tokens.length)
        await user.save();
        // create token
        const newtoken = await user.generateAuthToken();
        console.log("token: ", newtoken);
        await res.cookie('bearer_token', newtoken,{
          httpOnly: true,
          path: '/'
        });
        req.user = user;
        req.flash('success','Logged in successfully')
        res.redirect('/')
      } else{
        // first check that is that token of the same user who provided credits
        if(token in user.tokens){
          console.log("token in user.tokens.token")
          // verify token
          console.log('token already present')
          console.log(token);
          const decoded = await jwt.verify(token, 'thisisjwtsecret');
          console.log("decoded" ,decoded)
          const userwithtoken = await User.findOne({_id  : decoded._id, 'tokens.token': token});
          console.log( "userwithtoken : ",userwithtoken)
          if(!userwithtoken){
            throw new Error('user was not found with jwt token in the cookie');
          } else{
            req.user = await userwithtoken;
            console.log('token verified')
            req.flash('success','Logged in successfully')
            res.redirect('/')
          }
        } else {
          // create token for this user and delete previous token from the cookie
          const newtoken = await user.generateAuthToken();
          console.log("token: ", newtoken);
          await res.clearCookie('bearer_token');
          await res.cookie('bearer_token', newtoken,{
            httpOnly: true,
            path: '/'
          });
          req.user = user;
          req.flash('success','logged in successfully')
          res.redirect('/')
        } 
      } 
    } else{
      console.log('user not found with provided credentials');
      req.flash('error','Error while logging in')
      return res.redirect('/register_or_login')
    }
    
  } catch(e){
    console.log("An error occured : ", e)
    req.flash('error','Error while logging in')
    res.redirect('/register_or_login')
  }
})


router.get("/logout", auth, async (req,res)=>{
  try{

    if(req.user.google_id || req.user.fb_id){
      console.log("logging out google or fb user");
      if(req.user.google_id || req.cookies._google_token){
        res.clearCookie('_google_token');
       
      }
      if(req.user.fb_id || req.cookies._fb_token){
        res.clearCookie('_fb_token');
      }
      res.clearCookie('connect.sid')
    
      req.user = null;
    
      req.session = null;
     
      req.logout();
    
      // req.flash('success', 'you were logged out successfully')
    
      res.redirect("/")
   
    } else {
      // console.log("tokens : ", req.user.tokens)
      req.user.tokens = await req.user.tokens.filter((token)=>{
        // console.log(" comparing tokens and deleting while logging out ",  token.token.localeCompare(req.token));
        return token.token !== req.token;
      });
      await req.user.save((err,user)=>{
        if(err) console.log(err)
        else{
          console.log("user was saved successfully after deleting the jwt from the database");
        }
      });
      res.clearCookie('bearer_token');
      // req.flash('success', 'you were logged out successfully')
      res.redirect('/') 
    }
   } catch(err){
      res.status(500).send({"error": 'There was an error logging you out'});
      
    }
})



router.post("/updateUser", auth, async (req,res)=>{
  console.log("ah chak" , req.body.username)
  var user = await User.findById(req.user._id);
  if(user.google_id){ 
    user.google_username = req.body.google_username;
  }
  else if(user.fb_id){ 
    user.fb_username = req.body.fb_username;
  } else{
    console.log(user.username , req.body.username)
  user.username = await req.body.username;
  console.log(user.username , req.body.username)
  }

  // user.fullName = req.body.fullName
  user.dob = req.body.dob;
  user.email = req.body.email
  user.gender = req.body.gender
  user.profession = req.body.profession
  user.channel = req.body.channel
  await user.save()
  console.log("uptaded user : ", user)
  // req.flash('success', 'your account details are changed')
  res.redirect("/dashboard")
})



router.post("/login_old", passport.authenticate("local-user" , {
	
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
router.get("/logout_old" ,(req,res)=>{
  
  // console.log("req.user",req.user);
	req.logout();
	res.send("logged you out");
});


router.get('/forgot',(req,res)=>{ 
  res.render('forgot', {message: req.flash('success')});
})

router.post('/forgot', (req,res,next)=>{
  console.log("yes received : " , req.body.email)
   var token;
   crypto.randomBytes(20,(err,buf)=>{
    if(err) console.log(err)
    token = buf.toString('hex');
    console.log(token)
  })
    
  User.findOne({email: req.body.email}, async (err,user)=>{
    if(!user){
      console.log("no user found");
      req.flash('error','No account with this email exists');
      res.redirect('/forgot');
    }
    user.resetPasswordToken = await token;
    user.resetPasswordExpires =  Date.now() + 3600000; //1 hr
    await user.save((err)=>{
      if(err) console.log(err)
    })



    var link = PROTOCOL + HOSTNAME + '/reset/' + token
      
    var mailOptions = {
      to: req.body.recovery_email,
      from: USER,
      subject: 'password reset backbenchers',
      html: `<p>click the link to reset your password</p><div>${link}</div>`
    }
    transport.sendMail(mailOptions,(err)=>{
      console.log('mail sent');
      req.flash('success' , 'An e-mail has been sent to ' + req.body.recovery_email + ' with further instructions.');
    })



  }) 

  
    
    res.redirect('/')
  })



router.get('/reset/:token',(req,res)=>{
  User.findOne({resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } },(err,user)=>{
    if(!user){
      req.flash('error', 'Either token is invalid or expired')
      return res.redirect('forgot')
    } else{
      res.render('reset',{token: req.params.token})
    }
  })
})


router.post('/reset/:token', function(req, res) {   
  
    
  User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } },async function(err, user) {
    if (!user) {
      req.flash('error', 'Password reset token is invalid or has expired.');
      res.redirect('/forgot');
    }

    var validpass = validatePass(req.body.password)
    if(validpass.status){

      if(req.body.password === req.body.confirm) {
        console.log("new password : ", req.body.password)
        user.password = await req.body.password;
        await user.hashPassword()
        await user.save()
        
      } else {
          req.flash("error", "Passwords do not match.");
          res.redirect('/forgot');
      }

    } else {
      res.redirect('/reset/'+req.params.token)
    }
    
  });
   
      
  var mailOptions = {
    to: req.body.recovery_email,
    from: USER,
    subject: 'Your password has been changed',
    text: 'Hello,\n\n' +
      'This is a confirmation that the password for your account has just been changed.\n'
  };
  transport.sendMail(mailOptions, function(err) {
    req.flash('success', 'Success! Your password has been changed.');
  });

  res.redirect("/")
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