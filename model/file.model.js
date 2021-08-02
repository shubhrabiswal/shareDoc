const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const fileSchema = new Schema({
    filename: {
        type:String,
        required: true
    },
    path: {
        type:String,
        required: true
    },
    size: {
        type:String,
        required: true
    },
    uuid: {     ///to create a unique id e.g.-048cbb54-be6a-4bb3-afb0-7c565ac30b0e
        type:String,
        required: true
    },
    sender: {
        type:String,
        required: false
    },
    receiver: {
        type:String,
        required: false
    }
},{timestamps:true})

module.exports = mongoose.model('File', fileSchema);