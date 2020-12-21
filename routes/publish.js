var express = require("express");
var router  = express.Router();
var Post = require('../models/post.js');
var User = require('../models/user.js');
const middlewareObj = require("../middleware/index");
const auth = require("../middleware/auth");
var Trending = require('../models/trending.js');
var Popular = require('../models/popular.js');
var Recommended = require('../models/recommended.js');  
var middleware = require('../middleware/publish')
var moment = require('moment');
var multer = require('multer');
var fs = require('fs');
var path = require('path');

var storage = multer.diskStorage({
    destination: function(req,file,cb){
      cb(null,'public/uploads/data/');
    },
    filename: function(req,file,cb){
        var uid = req.user.bb_id;
        
        console.log(uid + "_" + Date.now() +"_"+ file.originalname);
        cb(null,uid + "_" + Date.now() +"_"+ file.originalname);
    }
});

  var multerFilter = (req,file,cb)=>{
    const extension = file.mimetype.split('/')[1];
    if(extension === 'pdf' || extension === 'docx'){
      cb(null,true);
    } else {
      cb("Please upload a either word or pdf",false);
    }
  };
  
var upload = multer({
    storage: storage,
    multerFilter: multerFilter
  });

router.get("/",(req,res)=>{
    res.render("publish1");

})

router.get("/publish-options", auth, (req,res)=>{
    res.render("publish2");
})

router.get("/publish-personal-info", auth, (req,res)=>{
    res.render("publish3"); 
})

router.post("/additional-info/written" , auth , (req,res)=>{
    
    console.log("inside post rote of creating new post");

    var count =async ()=>{
        let countTotalArticles=0;
        Post.countDocuments({}, async function(err, result) {
        if (err) {
            console.log(err);
        } else {
            countTotalArticles = await result;
            next(countTotalArticles);
        }
        });
    }  

    async function next(countTotalArticles){
        console.log("inside next function, post rote of creating new post");
        console.log("*******************************")
        // console.log(req);
        console.log("*******************************")
        var newpost = new Post()
        newpost.title = req.body.post.title;
        newpost.content = req.body.post.content;
        newpost.subject = req.body.post.subject;
        // newpost.publish_date = middleware.convertDate().toString();
        newpost.publishDate = new Date();
        newpost.author = req.user;
        newpost.shares = 0
        newpost.authorName = req.user.username;
        newpost.publishDay = moment().format('dddd');
        newpost.postNumber = await countTotalArticles+1;
        await newpost.save((err,savedpost)=>{
            if(err) res.send(err);
            else{
                console.log("..................................... : " , savedpost)
            }
        });
        User.findById(req.user._id).populate("posts").exec(async function(err,user){
            if(err) console.log(err)
            else {
                console.log("user who just created post is found ");
                // console.log(user)
                user.posts.push(newpost);
                await user.save((err,saveduser)=>{
                if(err) console.log(err)
                else {
                    if(req.user.add_info === false){
                        req.flash('success','to become an author you need to fill this information or your article will not be posted')
                        res.redirect("/publish/publish-personal-info");
                    } else {
                        res.redirect("/");
                    }
                }
                })  
            }
        }) 
    }  
    count();
})

router.post("/additional-info/uploaded", auth , upload.single("document") , (req,res,next)=>{
    var uid = req.user.bb_id;
    var file = req.file;
    var count = ()=>{
        let countTotalArticles=0;
        Post.countDocuments({}, function(err, result) {
        if (err) {
            console.log(err);
        } else {
            countTotalArticles = result;
            next(countTotalArticles);
        }
        });
    }  

    function next(countTotalArticles){
        var newpost = new Post()
        newpost.title = req.body.post.title;
        newpost.content = " to be edited by auditor______________";
        newpost.subject = req.body.post.subject;
        // newpost.publish_date = middleware.convertDate().toString();
        newpost.publishDate = new Date();
        newpost.author = req.user;
        newpost.shares = 0;
        newpost.authorName = req.user.username;
        newpost.publishDay = moment().format('dddd');
        newpost.postNumber = countTotalArticles+1;
        newpost.filename = uid + "_" + Date.now() +"_"+ file.originalname;
        Post.create(newpost, function(err, post){
        if(err) console.log(err)
        else{
            console.log(post);
            User.findById(req.user._id).populate("posts").exec(function(err,user){
            if(err) console.log(err)
            else {
                console.log("user who just created post is found ");
                // console.log(user)
                user.posts.push(post);
                user.save((err,user)=>{
                if(err) console.log(err)
                else {
                    // console.log(user)    
                    if(req.user.add_info === false){
                        req.flash('success','to become an author you need to fill this information or your article will not be posted')
                        res.redirect("/publish/publish-personal-info");
                    } else {
                        res.redirect("/dashboard");
                    }
                    
                }
                })  
            }
            })
        } 
        })
    }  
    count();
})

router.post("/personal-info", auth ,(req,res)=>{
    console.log(req.body);
    if(req.user){
        User.findById(req.user._id, (err,user)=>{
            if(err) console.log(err)
            else{
                user.profession = req.body.info.profession;
                user.phoneNumber = req.body.info.phoneNumber;
                user.dob = req.body.info.date;
                user.gender = req.body.info.gender;
                user.fullName = req.body.info.name;
                user.add_info = true;
                // user.role = 'author';
                user.save((err,u)=>{
                    if(err) console.log(err)
                    else{
                        console.log(u);
                    }
                })
            }
        })
    }
    var message = "your post will be audited within 2-3 business days and you will get notified when your post is published";
    req.flash('success', message)
    res.redirect("/");
})


router.get("/download", (req,res)=>{
    let  file = req.query.file;
    // var pathoffolder = path.parse(__dirname);   
    // const filepath = path.join(pathoffolder.dir,'public/uploads/data/');
    const filename = `${file}`
    console.log(filename);
    var data = fs.readFileSync("./public/uploads/data/"+filename);
   
    // var fileshow = fs.createReadStream('./public/uploads/data/'+filename);
    // res.download(filepath, filename);
    // res.download(filepath+filename, filename, (err)=>{
    //     console.log(err);
    // });
    res.header('content-type', 'application/pdf');
    res.set('Content-Disposition', 'inline;filename='+filename+'.pdf');
    res.send(data);
})

module.exports = router;

