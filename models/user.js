var mongoose = require('mongoose');
var passportLocalMongoose = require("passport-local-mongoose");
var uniqueValidator = require('mongoose-unique-validator');
var userSchema = new mongoose.Schema({
  bb_id: { type: Number },
  google_id: String,
  fb_id: String,
  username: {type: String, lowercase: true, unique: true, index: true,  sparse:true, required: [true, "can't be blank"], match: [/^[a-zA-Z0-9]+$/, 'is invalid']},
  email: {type: String, lowercase: true, unique: true, index: true ,sparse:true, required: [true, "can't be blank"], match: [/\S+@\S+\.\S+/, 'is invalid']},
  number_of_followers: Number,
  is_prime_member: Boolean,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  newsletterAccess: Boolean,
  profession: String,
  phoneNumber: String,
  fullName: String,
  dob: Date, 
  add_info: {
    type: Boolean,
    default: false
  },

  fb_token: {
    type: String,
    
  },
  role:{
    type: String,
    default: "user",
    required: true,
    enum: ["user", "author", "admin", "auditor"]
  } ,
  posts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post"
    }
  ],

  saved_for_later: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post"
    }
  ],

  liked_posts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post"
    }
  ], 

  auditors_checklist : [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post"
    }
  ],

  viewed_posts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Viewed"
    }
  ],

  shared_posts: [
    {
      postid: String,
      count: {type: Number, default: 0}
    }
  ]

});
userSchema.plugin(passportLocalMongoose);
userSchema.plugin(uniqueValidator, {message: 'is already taken.'});
var User = mongoose.model("User",userSchema);
module.exports = User;


