var express = require("express");
var router  = express.Router();
var Post = require('../models/post.js');
var User = require('../models/user.js');
var Query = require('../models/query.js');
const auth = require("../middleware/auth.js");
var middleware = require("../middleware/index");
var deleteObj = require("../controllers/deleteController")


router.post('/submit/home', async (req,res)=>{

    try{


        if(/^\s/.test(req.body.email)){
            throw new Error('Your email must not start with whitespaces')
        }
        if(/\s$/.test(req.body.email)){
            throw new Error('Your email must not end with whitespaces')
        }
        if(!req.body.email) throw new Error('Please mention a email');
        if(!req.body.message) throw new Error('Please mention a message');
    
        if(req.body.message.length > 3000){
            throw new Error('Content must not Exceed 3000 characters');
        }
        if(/^\s/.test(req.body.message)){
            throw new Error('Your message must not start with whitespaces')
        }

        if(/\s$/.test(req.body.message)){
            throw new Error('Your message must not end with whitespaces')
        }
    
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
        res.redirect("/");

    } catch(e){
        console.log("error : ", e.message);
        req.flash('error' , e.message);
        res.redirect('/')
    }

    

})




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