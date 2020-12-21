var express = require("express");
var multer = require("multer");
// var GridFsStorage = require("multer-gridfs-storage");
// var Grid = require("gridfs-storage");
var router  = express.Router();
const util = require('util')
var Post = require('../models/post.js');
var User = require('../models/user.js');
var Trending = require('../models/trending.js');
var Recommended = require('../models/recommended.js');
var Viewed = require('../models/viewed.js');
var Popular = require('../models/popular.js');
var moment = require('moment');
var locus = require('locus');
const auth  = require("../middleware/auth.js");
const check = require("../controllers/checkAuthcontroller");
var deleteObj = require("../controllers/deleteController")
var showObj = require("../controllers/showPageController")
const { route } = require("./users.js");
var middlewareObj = require("../middleware/index")
var storage = multer.diskStorage({
  destination: function(req,file,cb){
    cb(null,'public/uploads/img/posts');
  },
  filename: function(req,file,cb){
    const extension = file.mimetype.split('/')[1];
    cb(null,file.originalname);
  }
});

var multerFilter = (req,file,cb)=>{
  if(file.mimetype.startsWith("image")){
    cb(null,true);
  } else {
    cb("Please upload a photo",false);
  }
};

var upload = multer({
  storage: storage,
  fileFilter: multerFilter
});












router.get("/business-economics", check ,async (req,res)=>{
  var popularposts = [];
  var recommendedPosts = [];
  var  tc=0,pc=0,rc=0;
  var r = await Recommended.find({});
  var array = [];
  // console.log("r length : ", r.length)
  for(var i=0; i<r.length; i++){
    // console.log(r[i].rank)
    array.push(r[i].rank);
  }
  console.log("array of recommended posts : " ,array)

  await Recommended.find({subject: 'business-economics'}).populate('post').exec(async (err,posts)=>{
    if(err) res.send(err)
    else{
      recommendedPosts = posts;
      console.log("recommended posts : " ,posts)
      // rc = posts.length;
      rc = (posts.length>=3)?3:posts.length;
    }
  })
  await Popular.find({subject: 'business-economics'}).populate("post").exec(async (err,posts)=>{
    if(err) console.log(err)
    else{
      popularposts = await posts;
      pc = posts.length
      pc = (posts.length>=3)?3:posts.length;
    }
  })

  if(req.query.search){
    if(!req.query.page){
      req.query.page = 1;
    }
    var noMatch;
// gives search results on author name, content and title of the post
    const regex = await new RegExp(escapeRegex(req.query.search), 'gi') 
    Post.find({$or: [{title:regex} , {content:regex}, {'author.username':regex}], subject: "business-economics", isReviewedByAdmin: true}, function(err,allposts){
      if(err) res.send(err)
      else{
        
        if(allposts.length<1){
          noMatch = "No posts matched the search results , please try again"
        }
        Trending.find({subject: 'business-economics'}).populate('post').exec((err,trendingPosts)=>{
          if(err) console.log(err)
          else {


            tc = trendingPosts.length;
            tc = (trendingPosts.length>=3)?3:trendingPosts.length;
            let pageoffset = req.query.page-1;
            let len = allposts.length;
            let val = pageoffset*10;
            let limit=0;
            var page = parseInt(req.query.page);
            var nextpage = page+1;

            console.log("next",nextpage, " page : ",page)
            let start = val;
            var showsidebox=true, shownextbutton=false;
            // impoertant
            // len-val gives number of cards to be shown on a particular page
            if(len-val <= 2){
              showsidebox=false;
            }
            if(len-val>10){
              shownextbutton=true;
            }
            if(len-val <= 9){
               limit = len-1;
            } else {
              limit = val+9;
            }


            console.log(tc,rc,pc)
            res.render("business-economics", {
              posts: allposts, 
              noMatch: noMatch, 
              message: req.flash('success'), 
              trendingPosts: trendingPosts, 
              popularPosts: popularposts, 
              recommendedPosts: recommendedPosts,
              start: start, 
              limit: limit,
              nextpage: nextpage,
              page:page,
              showsidebox:showsidebox,
              shownextbutton: shownextbutton,
              array: array,
              trendingCount: tc,
              recommendedCount: rc,
              popularCount: pc
            });
          }
        })
        
      }
    })
    
  } else{
    Post.find({subject: "business-economics", isReviewedByAdmin: true}, function(err,allposts){
      if(err) {
        res.send(err);
      }
      else{
        Trending.find({subject: 'business-economics'}).populate("post").exec(async (err,trendingPosts)=>{
          if(err) console.log(err)
          else {
            tc = trendingPosts.length;
            tc = (trendingPosts.length>=3)?3:trendingPosts.length;
            // console.log("****************************",popularposts , "*********************************")
            let pageoffset = req.query.page-1;
            let len = allposts.length;
            let val = pageoffset*10;
            let limit=0;
            var page = parseInt(req.query.page);
            var nextpage = page+1;

            console.log("next",nextpage, " page : ",page)
            let start = val;
            var showsidebox=true, shownextbutton=false;
            // impoertant
            // len-val gives number of cards to be shown on a particular page
            if(len-val <= 2){
              showsidebox=false;
            }
            if(len-val>10){
              shownextbutton=true;
            }
            if(len-val <= 9){
               limit = len-1;
            } else {
              limit = val+9;
            }
            console.log(tc,rc,pc)
            res.render("business-economics", {
              posts: allposts, 
              noMatch: noMatch, 
              message: req.flash('success'), 
              trendingPosts: await trendingPosts, 
              popularPosts: await popularposts, 
              recommendedPosts: await recommendedPosts,
              start: start, 
              limit: limit,
              nextpage: nextpage,
              page:page,
              showsidebox:showsidebox,
              shownextbutton: shownextbutton,
              array: array,
              trendingCount: tc,
              recommendedCount: rc,
              popularCount: pc
            });
          }
        })
      }
    })
  }
})












router.get("/commerce", check ,async (req,res)=>{
  var popularposts = [];
  var recommendedPosts = [];
  var  tc=0,pc=0,rc=0;
  var r = await Recommended.find({});
  var array = [];
  // console.log("r length : ", r.length)
  for(var i=0; i<r.length; i++){
    // console.log(r[i].rank)
    array.push(r[i].rank);
  }
  console.log("array of recommended posts : " ,array)

  await Recommended.find({subject: 'commerce'}).populate("post").exec(async (err,posts)=>{
    if(err) res.send(err)
    else{
      recommendedPosts = posts;
      console.log("recommended posts : " ,recommendedPosts)
      rc = posts.length;
      rc = (posts.length>=3)?3:posts.length;
    }
  })
  await Popular.find({subject: 'commerce'}).populate("post").exec(async (err,posts)=>{
    if(err) console.log(err)
    else{
      popularposts = await posts;
      pc = posts.length
      pc = (posts.length>=3)?3:posts.length;
    }
  })

  if(req.query.search){
    if(!req.query.page){
      req.query.page = 1;
    }
    var noMatch;
// gives search results on author name, content and title of the post
    const regex = await new RegExp(escapeRegex(req.query.search), 'gi') 
    Post.find({$or: [{title:regex} , {content:regex}, {'author.username':regex}], subject: "commerce", isReviewedByAdmin: true}, function(err,allposts){
      if(err) res.send(err)
      else{
        
        if(allposts.length<1){
          noMatch = "No posts matched the search results , please try again"
        }
        Trending.find({subject: 'commerce'}).populate('post').exec((err,trendingPosts)=>{
          if(err) console.log(err)
          else {


            tc = trendingPosts.length;
            tc = (trendingPosts.length>=3)?3:trendingPosts.length;
            let pageoffset = req.query.page-1;
            let len = allposts.length;
            let val = pageoffset*10;
            let limit=0;
            var page = parseInt(req.query.page);
            var nextpage = page+1;

            console.log("next",nextpage, " page : ",page)
            let start = val;
            var showsidebox=true, shownextbutton=false;
            // impoertant
            // len-val gives number of cards to be shown on a particular page
            if(len-val <= 2){
              showsidebox=false;
            }
            if(len-val>10){
              shownextbutton=true;
            }
            if(len-val <= 9){
               limit = len-1;
            } else {
              limit = val+9;
            }


            console.log(tc,rc,pc)
            res.render("commerce", {
              posts: allposts, 
              noMatch: noMatch, 
              message: req.flash('success'), 
              trendingPosts: trendingPosts, 
              popularPosts: popularposts, 
              recommendedPosts: recommendedPosts,
              start: start, 
              limit: limit,
              nextpage: nextpage,
              page:page,
              showsidebox:showsidebox,
              shownextbutton: shownextbutton,
              array: array,
              trendingCount: tc,
              recommendedCount: rc,
              popularCount: pc
            });
          }
        })
        
      }
    })
    
  } else{
    Post.find({subject: "commerce", isReviewedByAdmin: true}, function(err,allposts){
      if(err) {
        res.send(err);
      }
      else{
        Trending.find({subject: 'commerce'}).populate("post").exec(async (err,trendingPosts)=>{
          if(err) console.log(err)
          else {
            tc = trendingPosts.length;
            tc = (trendingPosts.length>=3)?3:trendingPosts.length;
            // console.log("****************************",popularposts , "*********************************")
            let pageoffset = req.query.page-1;
            let len = allposts.length;
            let val = pageoffset*10;
            let limit=0;
            var page = parseInt(req.query.page);
            var nextpage = page+1;

            console.log("next",nextpage, " page : ",page)
            let start = val;
            var showsidebox=true, shownextbutton=false;
            // impoertant
            // len-val gives number of cards to be shown on a particular page
            if(len-val <= 2){
              showsidebox=false;
            }
            if(len-val>10){
              shownextbutton=true;
            }
            if(len-val <= 9){
               limit = len-1;
            } else {
              limit = val+9;
            }
            console.log(tc,rc,pc)
            res.render("commerce", {
              posts: allposts, 
              noMatch: noMatch, 
              message: req.flash('success'), 
              trendingPosts:  trendingPosts, 
              popularPosts:  popularposts, 
              recommendedPosts:  recommendedPosts,
              start: start, 
              limit: limit,
              nextpage: nextpage,
              page:page,
              showsidebox:showsidebox,
              shownextbutton: shownextbutton,
              array: array,
              trendingCount: tc,
              recommendedCount: rc,
              popularCount: pc
            });
          }
        })
      }
    })
  }
})















router.get("/engineering", check ,async (req,res)=>{
  var popularposts = [];
  var recommendedPosts = [];
  var  tc=0,pc=0,rc=0;
  var r = await Recommended.find({});
  var array = [];
  // console.log("r length : ", r.length)
  for(var i=0; i<r.length; i++){
    // console.log(r[i].rank)
    array.push(r[i].rank);
  }
  console.log("array of recommended posts : " ,array)

  await Recommended.find({subject: 'engineering'}).populate("post").exec(async (err,posts)=>{
    if(err) res.send(err)
    else{
      recommendedPosts = await posts;
      rc = posts.length;
      rc = (posts.length>=3)?3:posts.length;
      console.log("rc : ", rc)
    }
  })
  await Popular.find({subject: 'engineering'}).populate("post").exec(async (err,posts)=>{
    if(err) console.log(err)
    else{
      popularposts = await posts;
      pc = posts.length
      pc = (posts.length>=3)?3:posts.length;
    }
  })

  if(req.query.search){
    if(!req.query.page){
      req.query.page = 1;
    }
    var noMatch;
// gives search results on author name, content and title of the post
    const regex = await new RegExp(escapeRegex(req.query.search), 'gi') 
    Post.find({$or: [{title:regex} , {content:regex}, {'author.username':regex}], subject: "engineering", isReviewedByAdmin: true}, function(err,allposts){
      if(err) res.send(err)
      else{
        
        if(allposts.length<1){
          noMatch = "No posts matched the search results , please try again"
        }
        Trending.find({subject: 'engineering'}).populate('post').exec((err,trendingPosts)=>{
          if(err) console.log(err)
          else {


            tc = trendingPosts.length;
            tc = (trendingPosts.length>=3)?3:trendingPosts.length;
            let pageoffset = req.query.page-1;
            let len = allposts.length;
            let val = pageoffset*10;
            let limit=0;
            var page = parseInt(req.query.page);
            var nextpage = page+1;

            console.log("next",nextpage, " page : ",page)
            let start = val;
            var showsidebox=true, shownextbutton=false;
            // impoertant
            // len-val gives number of cards to be shown on a particular page
            if(len-val <= 2){
              showsidebox=false;
            }
            if(len-val>10){
              shownextbutton=true;
            }
            if(len-val <= 9){
               limit = len-1;
            } else {
              limit = val+9;
            }


            console.log(tc,rc,pc)
            res.render("engineering", {
              posts: allposts, 
              noMatch: noMatch, 
              message: req.flash('success'), 
              trendingPosts: trendingPosts, 
              popularPosts: popularposts, 
              recommendedPosts: recommendedPosts,
              start: start, 
              limit: limit,
              nextpage: nextpage,
              page:page,
              showsidebox:showsidebox,
              shownextbutton: shownextbutton,
              array: array,
              trendingCount: tc,
              recommendedCount: rc,
              popularCount: pc
            });
          }
        })
        
      }
    })
    
  } else{
    Post.find({subject: "engineering", isReviewedByAdmin: true}, function(err,allposts){
      if(err) {
        res.send(err);
      }
      else{
        Trending.find({subject: 'engineering'}).populate("post").exec(async (err,trendingPosts)=>{
          if(err) console.log(err)
          else {
            tc = trendingPosts.length;
            tc = (trendingPosts.length>=3)?3:trendingPosts.length;
            // console.log("****************************",popularposts , "*********************************")
            let pageoffset = req.query.page-1;
            let len = allposts.length;
            let val = pageoffset*10;
            let limit=0;
            var page = parseInt(req.query.page);
            var nextpage = page+1;

            console.log("next",nextpage, " page : ",page)
            let start = val;
            var showsidebox=true, shownextbutton=false;
            // impoertant
            // len-val gives number of cards to be shown on a particular page
            if(len-val <= 2){
              showsidebox=false;
            }
            if(len-val>10){
              shownextbutton=true;
            }
            if(len-val <= 9){
               limit = len-1;
            } else {
              limit = val+9;
            }
            console.log(tc,rc,pc)
            res.render("engineering", {
              posts: allposts, 
              noMatch: noMatch, 
              message: req.flash('success'), 
              trendingPosts: await trendingPosts, 
              popularPosts: await popularposts, 
              recommendedPosts: await recommendedPosts,
              start: start, 
              limit: limit,
              nextpage: nextpage,
              page:page,
              showsidebox:showsidebox,
              shownextbutton: shownextbutton,
              array: array,
              trendingCount: tc,
              recommendedCount: rc,
              popularCount: pc
            });
          }
        })
      }
    })
  }
})








router.get("/personality-development", check ,async (req,res)=>{
  var popularposts = [];
  var recommendedPosts = [];
  var  tc=0,pc=0,rc=0;
  var r = await Recommended.find({});
  var array = [];
  // console.log("r length : ", r.length)
  for(var i=0; i<r.length; i++){
    // console.log(r[i].rank)
    array.push(r[i].rank);
  }
  console.log("array of recommended posts : " ,array)

  await Recommended.find({subject: 'personality-development'}).populate("post").exec(async (err,posts)=>{
    if(err) res.send(err)
    else{
      recommendedPosts = await posts;
      rc = posts.length;
      rc = (posts.length>=3)?3:posts.length;
    }
  })
  await Popular.find({subject: 'personality-development'}).populate("post").exec(async (err,posts)=>{
    if(err) console.log(err)
    else{
      popularposts = await posts;
      pc = posts.length;
      pc = (posts.length>=3)?3:posts.length;
    }
  })

  if(req.query.search){
    if(!req.query.page){
      req.query.page = 1;
    }
    var noMatch;
// gives search results on author name, content and title of the post
    const regex = await new RegExp(escapeRegex(req.query.search), 'gi') 
    Post.find({$or: [{title:regex} , {content:regex}, {'author.username':regex}], subject: "personality-development", isReviewedByAdmin: true}, function(err,allposts){
      if(err) res.send(err)
      else{
        
        if(allposts.length<1){
          noMatch = "No posts matched the search results , please try again"
        }
        Trending.find({subject: 'personality-development'}).populate('post').exec((err,trendingPosts)=>{
          if(err) console.log(err)
          else {


            tc = trendingPosts.length;
            tc = (trendingPosts.length>=3)?3:trendingPosts.length;
            let pageoffset = req.query.page-1;
            let len = allposts.length;
            let val = pageoffset*10;
            let limit=0;
            var page = parseInt(req.query.page);
            var nextpage = page+1;

            console.log("next",nextpage, " page : ",page)
            let start = val;
            var showsidebox=true, shownextbutton=false;
            // impoertant
            // len-val gives number of cards to be shown on a particular page
            if(len-val <= 2){
              showsidebox=false;
            }
            if(len-val>10){
              shownextbutton=true;
            }
            if(len-val <= 9){
               limit = len-1;
            } else {
              limit = val+9;
            }


            console.log(tc,rc,pc)
            res.render("personality-development", {
              posts: allposts, 
              noMatch: noMatch, 
              message: req.flash('success'), 
              trendingPosts: trendingPosts, 
              popularPosts: popularposts, 
              recommendedPosts: recommendedPosts,
              start: start, 
              limit: limit,
              nextpage: nextpage,
              page:page,
              showsidebox:showsidebox,
              shownextbutton: shownextbutton,
              array: array,
              trendingCount: tc,
              recommendedCount: rc,
              popularCount: pc
            });
          }
        })
        
      }
    })
    
  } else{
    Post.find({subject: "personality-development", isReviewedByAdmin: true}, function(err,allposts){
      if(err) {
        res.send(err);
      }
      else{
        Trending.find({subject: 'personality-development'}).populate("post").exec(async (err,trendingPosts)=>{
          if(err) console.log(err)
          else {
            tc = trendingPosts.length;
            tc = (trendingPosts.length>=3)?3:trendingPosts.length;
            // console.log("****************************",popularposts , "*********************************")
            let pageoffset = req.query.page-1;
            let len = allposts.length;
            let val = pageoffset*10;
            let limit=0;
            var page = parseInt(req.query.page);
            var nextpage = page+1;

            console.log("next",nextpage, " page : ",page)
            let start = val;
            var showsidebox=true, shownextbutton=false;
            // impoertant
            // len-val gives number of cards to be shown on a particular page
            if(len-val <= 2){
              showsidebox=false;
            }
            if(len-val>10){
              shownextbutton=true;
            }
            if(len-val <= 9){
               limit = len-1;
            } else {
              limit = val+9;
            }
            console.log(tc,rc,pc)
            res.render("personality-development", {
              posts: allposts, 
              noMatch: noMatch, 
              message: req.flash('success'), 
              trendingPosts: await trendingPosts, 
              popularPosts: await popularposts, 
              recommendedPosts: await recommendedPosts,
              start: start, 
              limit: limit,
              nextpage: nextpage,
              page:page,
              showsidebox:showsidebox,
              shownextbutton: shownextbutton,
              array: array,
              trendingCount: tc,
              recommendedCount: rc,
              popularCount: pc
            });
          }
        })
      }
    })
  }
})




















// router.get("/commerce", (req,res)=>{
//   console.log(req.query)
//   var popularposts = [];
//   Popular.find({subject: 'commerce'}).populate("post").exec((err,posts)=>{
//     if(err) console.log(err)
//     else{
//       popularposts = posts;
//     }
//   })

//   if(req.query.search){
//     var noMatch;
// // gives search results on author name, content and title of the post
//     const regex = new RegExp(escapeRegex(req.query.search), 'gi') 
//     Post.find({$or: [{title:regex} , {content:regex}, {'author.username':regex}], subject: "commerce"}, function(err,allposts){
//       if(err) console.log(err)
//       else{
        
//         if(allposts.length<1){
//           noMatch = "No posts matched the search results , please try again"
//         }
//         Trending.find({subject: 'commerce'},(err,trendingPosts)=>{
//           if(err) console.log(err)
//           else {
//             console.log(trendingPosts)
//             res.render("commerce", {posts: allposts, noMatch: noMatch, message: req.flash('success'), trendingPosts: trendingPosts, popularPosts: popularposts});
//           }
//         })
        
//       }
//     })
    
//   } else{
//     Post.find({subject: "commerce"}, function(err,allposts){
//       if(err) {
//         console.log(err);
//         res.statusCode = 500;
//         res.end('error');
//       }
//       else{
//         console.log("these are all posts of commerce while loading the commerce show page", allposts)
//         Trending.find({subject: 'commerce'}).populate("post").exec((err,trendingPosts)=>{
//           if(err) console.log(err)
//           else {
//             console.log("****************************",popularposts , "*********************************")
//             res.render("commerce", {posts: allposts, noMatch: noMatch, message: req.flash('success'), trendingPosts: trendingPosts, popularPosts: popularposts});
//           }
//         })
//       }
//     })
//   }
// })


// // show page of engineering blogs
// router.get("/engineering", (req,res)=>{
//   console.log(req.query)
//   var popularposts = [];
//   Popular.find({subject: 'engineering'}).populate("post").exec((err,posts)=>{
//     if(err) console.log(err)
//     else{
//       popularposts = posts;
//     }
//   })

//   if(req.query.search){
//     var noMatch;
// // gives search results on author name, content and title of the post
//     const regex = new RegExp(escapeRegex(req.query.search), 'gi') 
//     Post.find({$or: [{title:regex} , {content:regex}, {'author.username':regex}], subject: "engineering"}, function(err,allposts){
//       if(err) console.log(err)
//       else{
        
//         if(allposts.length<1){
//           noMatch = "No posts matched the search results , please try again"
//         }
//         Trending.find({subject: 'engineering'},(err,trendingPosts)=>{
//           if(err) console.log(err)
//           else {
//             console.log(trendingPosts)
//             res.render("engineering", {posts: allposts, noMatch: noMatch, message: req.flash('success'), trendingPosts: trendingPosts, popularPosts: popularposts});
//           }
//         })
        
//       }
//     })
    
//   } else{
//     Post.find({subject: "engineering"}, function(err,allposts){
//       if(err) {
//         console.log(err);
//         res.statusCode = 500;
//         res.end('error');
//       }
//       else{
//         Trending.find({subject: 'engineering'}).populate("post").exec((err,trendingPosts)=>{
//           if(err) console.log(err)
//           else {
//             console.log("****************************",popularposts , "*********************************")
//             res.render("engineering", {posts: allposts, noMatch: noMatch, message: req.flash('success'), trendingPosts: trendingPosts, popularPosts: popularposts});
//           }
//         })
//       }
//     })
//   }
// })

// // personality development posts page
// router.get("/personality-development", (req,res)=>{
//   console.log(req.query)
//   var popularposts = [];
//   Popular.find({subject: 'personality-development'}).populate("post").exec((err,posts)=>{
//     if(err) console.log(err)
//     else{
//       popularposts = posts;
//     }
//   })

//   if(req.query.search){
//     var noMatch;
// // gives search results on author name, content and title of the post
//     const regex = new RegExp(escapeRegex(req.query.search), 'gi') 
//     Post.find({$or: [{title:regex} , {content:regex}, {'author.username':regex}], subject: "personality-development"}, function(err,allposts){
//       if(err) console.log(err)
//       else{
        
//         if(allposts.length<1){
//           noMatch = "No posts matched the search results , please try again"
//         }
//         Trending.find({subject: 'personality-development'},(err,trendingPosts)=>{
//           if(err) console.log(err)
//           else {
//             console.log(trendingPosts)
//             res.render("personality-development", {posts: allposts, noMatch: noMatch, message: req.flash('success'), trendingPosts: trendingPosts, popularPosts: popularposts});
//           }
//         })
        
//       }
//     })
    
//   } else{
//     Post.find({subject: "personality-development"}, function(err,allposts){
//       if(err) {
//         console.log(err);
//         res.statusCode = 500;
//         res.end('error');
//       }
//       else{
//         Trending.find({subject: 'personality-development'}).populate("post").exec((err,trendingPosts)=>{
//           if(err) console.log(err)
//           else {
//             console.log("****************************",popularposts , "*********************************")
//             res.render("personality-development", {posts: allposts, noMatch: noMatch, message: req.flash('success'), trendingPosts: trendingPosts, popularPosts: popularposts});
//           }
//         })
//       }
//     })
//   }
// })

// publish a new post
// router.get("/new",isLoggedIn, (req,res)=>{
//   res.render("new")
// })


// this is of no use now
// post request for creating new post 
// router.post("/",isLoggedIn, (req,res)=>{

//   console.log("inside post rote of creating new post");

//   function count(){
//     console.log("inside count function ,post rote of creating new post");

//     let countTotalArticles=0;
//     Post.count({}, function(err, result) {
//       if (err) {
//           console.log(err);
//       } else {
//         console.log("inside admin portal", result)
//         countTotalArticles = result;
//         next(countTotalArticles);
//       }
//     });
//   }

//   function next(countTotalArticles){
//     console.log("inside next function, post rote of creating new post");

//     console.log("*******************************")
//     // console.log(req);
//     console.log("*******************************")
//     var newpost = new Post()
//     newpost.title = req.body.post.title;
//     newpost.content = req.body.post.content;
//     newpost.subject = req.body.post.subject;
//     newpost.publish_date = convertDate().toString();
//     newpost.author.id = req.user._id;
//     newpost.author.username = req.user.username;
//     newpost.publishDay = moment().format('dddd');
//     newpost.postNumber = countTotalArticles+1;
//     Post.create(newpost, function(err, post){
//       if(err) console.log(err)
//       else{
//         console.log(post);
//         User.findById(req.user._id).populate("posts").exec(function(err,user){
//           if(err) console.log(err)
//           else {
//             console.log("user who just created post is found ");
//             // console.log(user)
//             user.posts.push(post);
//             user.save((err,user)=>{
//               if(err) console.log(err)
//               else {
//                 // console.log(user)
                
//                 res.redirect('/posts/' + req.body.post.subject+'?page=1')
//               }
//             })
            
//           }
//         })
//       } 
//     })

//   }  

//   count();

// })


// show page of an business-economics blog
// router.get("/business-economics/:slug", function(req,res){

//   // callback hell
//   var theuser = req.user;
//   var theslug = req.params.slug;
//   middlewareObj.calculateViewes(theuser , theslug , res, middlewareObj.findSimilar);


// })
    



// show page of an commerce blog
router.get("/business-economics/:slug", check , async function(req,res){
  var rc=0,tc=0,pc=0;
  await showObj.recordViews(req).then((v)=>{
    console.log(v)
  })
  var getRecommendedArticles ;
  await showObj.getRecommendedArticles('business-economics')
  .then((posts)=>{
    getRecommendedArticles = posts;
    rc = (posts.length>=3)?3:posts.length
  })
  var getTrendingArticles ;
  await showObj.getTrendingArticles('business-economics')
  .then((posts)=>{
    getTrendingArticles = posts;
    tc = (posts.length>=3)?3:posts.length
  })
  var getPopularArticles; 
  await showObj.getPopularArticles('business-economics')
  .then((posts)=>{
    getPopularArticles = posts;
    pc = (posts.length>=3)?3:posts.length
  })

  var getSimilarArticles; 
  await showObj.getSimilarArticles(req.params.slug, 'business-economics')
  .then((posts)=>{
    getSimilarArticles = posts;
  })

  var post = await Post.findOne({slug: req.params.slug});
  var displaydate = post.publishDate.toDateString();
  console.log("........................................", getSimilarArticles.length)
  var limit = (getSimilarArticles.length<=3)?getSimilarArticles.length:3;
  res.render("show", {
    post: post,
    popularPosts: getPopularArticles,
    trendingPosts: getTrendingArticles,
    recommendedPosts: getRecommendedArticles,
    similarArticles: getSimilarArticles,
    displaydate: displaydate,
    limit: limit,
    trendingCount: tc,
    recommendedCount: rc,
    popularCount: pc
  });
})





// show page of an commerce blog
router.get("/commerce/:slug", check , async function(req,res){

  await showObj.recordViews(req).then((v)=>{
    console.log(v)
  })
  var getRecommendedArticles ;
  await showObj.getRecommendedArticles('commerce')
  .then((posts)=>{
    getRecommendedArticles = posts;
    rc = (posts.length>=3)?3:posts.length
  })
  var getTrendingArticles ;
  await showObj.getTrendingArticles('commerce')
  .then((posts)=>{
    getTrendingArticles = posts;
    tc = (posts.length>=3)?3:posts.length
  })
  var getPopularArticles; 
  await showObj.getPopularArticles('commerce')
  .then((posts)=>{
    getPopularArticles = posts;
    pc = (posts.length>=3)?3:posts.length
  })

  var getSimilarArticles; 
  await showObj.getSimilarArticles(req.params.slug, 'commerce')
  .then((posts)=>{
    getSimilarArticles = posts;
  })

  var post = await Post.findOne({slug: req.params.slug});
  var displaydate = post.publishDate.toDateString();
  console.log("........................................", getSimilarArticles.length)
  var limit = (getSimilarArticles.length<=3)?getSimilarArticles.length:3;
  res.render("show", {
    post: post,
    popularPosts: getPopularArticles,
    trendingPosts: getTrendingArticles,
    recommendedPosts: getRecommendedArticles,
    similarArticles: getSimilarArticles,
    displaydate: displaydate,
    limit: limit,
    trendingCount: tc,
    recommendedCount: rc,
    popularCount: pc
  });
})




// show page of an commerce blog
router.get("/engineering/:slug", check , async function(req,res){

  await showObj.recordViews(req).then((v)=>{
    console.log(v)
  })
  var getRecommendedArticles ;
  await showObj.getRecommendedArticles('engineering')
  .then((posts)=>{
    getRecommendedArticles = posts;
    rc = (posts.length>=3)?3:posts.length
  })
  var getTrendingArticles ;
  await showObj.getTrendingArticles('engineering')
  .then((posts)=>{
    getTrendingArticles = posts;
    tc = (posts.length>=3)?3:posts.length
  })
  var getPopularArticles; 
  await showObj.getPopularArticles('engineering')
  .then((posts)=>{
    getPopularArticles = posts;
    pc = (posts.length>=3)?3:posts.length
  })

  var getSimilarArticles; 
  await showObj.getSimilarArticles(req.params.slug, 'engineering')
  .then((posts)=>{
    getSimilarArticles = posts;
  })

  var post = await Post.findOne({slug: req.params.slug});
  var displaydate = post.publishDate.toDateString();
  console.log("........................................", getSimilarArticles.length)
  var limit = (getSimilarArticles.length<=3)?getSimilarArticles.length:3;
  res.render("show", {
    post: post,
    popularPosts: getPopularArticles,
    trendingPosts: getTrendingArticles,
    recommendedPosts: getRecommendedArticles,
    similarArticles: getSimilarArticles,
    displaydate: displaydate,
    limit: limit,
    trendingCount: tc,
    recommendedCount: rc,
    popularCount: pc
  });
})






// show page of an commerce blog
router.get("/personality-development/:slug", check , async function(req,res){

  await showObj.recordViews(req).then((v)=>{
    console.log(v)
  })
  var getRecommendedArticles ;
  await showObj.getRecommendedArticles('personality-development')
  .then((posts)=>{
    getRecommendedArticles = posts;
    rc = (posts.length>=3)?3:posts.length
  })
  var getTrendingArticles ;
  await showObj.getTrendingArticles('personality-development')
  .then((posts)=>{
    getTrendingArticles = posts;
    tc = (posts.length>=3)?3:posts.length
  })
  var getPopularArticles; 
  await showObj.getPopularArticles('personality-development')
  .then((posts)=>{
    getPopularArticles = posts;
    pc = (posts.length>=3)?3:posts.length
  })

  var getSimilarArticles; 
  await showObj.getSimilarArticles(req.params.slug, 'personality-development')
  .then((posts)=>{
    getSimilarArticles = posts;
  })

  var post = await Post.findOne({slug: req.params.slug});
  var displaydate = post.publishDate.toDateString();
  console.log("........................................", getSimilarArticles.length)
  var limit = (getSimilarArticles.length<=3)?getSimilarArticles.length:3;
  res.render("show", {
    post: post,
    popularPosts: getPopularArticles,
    trendingPosts: getTrendingArticles,
    recommendedPosts: getRecommendedArticles,
    similarArticles: getSimilarArticles,
    displaydate: displaydate,
    limit: limit,
    trendingCount: tc,
    recommendedCount: rc,
    popularCount: pc
  });
})








// // delete route of a post         
// router.delete("/:id", (req,res)=>{
//   var subject;
//   var author;
//   Post.findById(req.params.id,(err,deletedpost)=>{
//     if(err) console.log(err)
//     else{
//       subject = deletedpost.subject;
//       author = deletedpost.author;
//     }
//   })
//   Post.findByIdAndDelete(req.params.id, (err,post)=>{
//     if(err) console.log(err)
//     else {
//       const index = author.posts.indexOf(req.params.id)
//       if (index > -1) {
//         author.posts.splice(index, 1);
//       }
//       console.log(`post  ${req.params.id}  is deleted`)
//     }
//   })
//   res.redirect("/posts/"+subject)
// })



// increment like of particular article in database
router.get('/liked/:slug', check,(req,res)=>{
  
  // Post.updateOne({slug: req.params.slug}, {$inc: {likes:1}}, (err,likedpost)=>{
  //   if(err) console.log(err)
  //   else{
  //   }
  // })
  Post.findOne({slug: req.params.slug}, (err,post)=>{
    if(err) console.log(err)
    else{
      User.findById(req.user._id).populate("liked_posts").exec(function(err,user){
        if(err) console.log(err)
        else{
          
          var ispushed = 0
          console.log("before length: " + user.liked_posts.length)
          for(var i=0; i<user.liked_posts.length;i++){
            
            if(post.title === user.liked_posts[i].title){
              console.log("entered")
              ispushed = 1 
            }
          }
          console.log("ispushed: " + ispushed)

          if(!ispushed){
            post.likes += 1;
            post.save();
            console.log("post pushed to liked posts of" + req.user.username)

            user.liked_posts.push(post);
          
            console.log("after length: " + user.liked_posts.length)
            user.save((err,user)=>{
              if(err) console.log(err)
              else{
                console.log(user)
              }
            })
            res.json({message: "you have liked this post"
                    })
          } else {
            res.json({message: "you can only like this post once"
                    })
          }
        }
        
      })
      
      
    }
  })
  
})


router.get('/findPostIdAndUser/:slug', check, async (req,res)=>{
  
  var CurPost_id=undefined;
  var curuser=undefined;
  var obj = {
    curuser: req.user
  }
  console.log("req made by ajax to find post and user on the show page")
  Post.findOne({slug: req.params.slug}, async (err,foundpost)=>{
    if(err) console.log(err)
    else{
      obj.CurPost_id = await foundpost._id;
      res.json(obj);
    }
  })
})

router.get("/upload", (req,res)=>{
  res.render("uploadform");
})

router.post("/upload/file/:num", upload.single('photo') , (req,res,next)=>{
  console.log("req.params.num  :  ", req.params.num);
  console.log("inside post route of upload file");
  var fileinfo = req.file;
  console.log(fileinfo);
  var filename = req.file.filename;
  // just for testing 
  Post.findOne({postNumber: req.params.num}, (err,post)=>{
    if(err){
      console.log("error while uploading file to database");
      console.log(err);
    } else {
      post.imagename = filename;
      post.save((err,post)=>{
        if(err){
          console.log("error occured while saving the post after uploading image to it ");
          console.log(err);
        } else {
          console.log("this is the image name of post", post , "    ",post.imagename);
          res.send("image uploaded!!")
          // res.render("displayUploads", {imagename: post.imagename})
        }
      })
    }
  })
  
})

// DELETE ROUTE OF A POST BY ADMIN
router.get("/delete/:slug", auth , async (req,res)=>{

  await deleteObj.deleteposteverywhere(res,req)
  await deleteObj.deleteforauthor(res,req)
  .then(()=>{
    console.log("deleted")
  })
  Post.findOneAndRemove({slug: req.params.slug}, async (err,deletedpost)=>{
    if(err) console.log(err)
    else{
      console.log(deletedpost);
      await middlewareObj.popular();
      await middlewareObj.trending();
      await middlewareObj.recommended();

    }
  })
})

router.get("/allblogs",(req,res)=>{
  res.render("allblogspage")
})





function convertDate(given_date){
  var formatted_date = moment(given_date).format('YYYY-MM-DD');
  // console.log(formatted_date);
  return formatted_date;
}

function escapeRegex(string) {
  return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}


module.exports = router;