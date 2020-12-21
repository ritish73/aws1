var express = require("express");
var router  = express.Router();
var Post = require('../models/post.js');
var User = require('../models/user.js');
var Query = require('../models/query.js');
const auth = require("../middleware/auth.js");
var middleware = require("../middleware/index");
var deleteObj = require("../controllers/deleteController")

router.post('/submit/:subject/:page', async (req,res)=>{

    // this route will post queries in a collection and it will be shown in admin portal
    
    
    // Sunday - Saturday : 0 - 6
    // let day = date.getDay();
    // let dayofmonth = date.getDate()
    // let year = date.getFullYear();
    

    let date=new Date();
    let hours = date.getHours()
    let mins = date.getMinutes()
    let seconds = date.getSeconds()
    var query = new Query();
    query.email = req.body.email;
    query.queryDate = date;
    query.message = req.body.message
    await query.save();
    let gooddate = date.toDateString();
    req.flash('success','your message is sent , you will get a reply on your provided email.');
    res.redirect('/posts/'+req.params.subject+"?page="+req.params.page);

})

module.exports = router;