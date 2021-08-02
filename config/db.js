const mongoose = require('mongoose');
require('dotenv').config()
 
function connectDB(){

    mongoose.connect(
        process.env.DBURL,
        {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
            useFindAndModify: true
        })
    const connection = mongoose.connection;
    connection.once('open', () => {
        console.log('Database connected')
    }).catch((err) => {
        console.log('Connection failed due to ', err)
    })
}

module.exports = connectDB;