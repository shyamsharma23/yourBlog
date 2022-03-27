const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const personSchema = new Schema({
    firstname : {type: String},
    lastname: {type: String},
    username: {type: String},
    email: {type: String},
    password: {type: String},
    items: [{type: Schema.Types.ObjectId, ref: 'Post'}]

});

const Person = mongoose.model('Person', personSchema);

module.exports = Person;