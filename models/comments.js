const mongoose = require('mongoose');
var commentSchema = new mongoose.Schema({
    creation_time: String,
    content: String,
    writer: String
});

const Comment = mongoose.model("Comment", commentSchema);
module.exports = Comment;   