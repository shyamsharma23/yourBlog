const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
    description: {type: String},
    author : {type: String}
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;