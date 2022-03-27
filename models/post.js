const mongoose = require('mongoose');
const Person = require('./person');
const Schema = mongoose.Schema;


const postSchema = new Schema({
    title: {type: String},
    body: {type: String},
    user: {type: Schema.Types.ObjectId, ref:'Person'},
    reviews: [{
        type: Schema.Types.ObjectId, ref:'Review'
    }]
})

const Post = mongoose.model('Post', postSchema);

module.exports = Post;