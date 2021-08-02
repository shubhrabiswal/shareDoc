const express = require('express');
const app = express();
const path = require('path')

require('dotenv').config();
const PORT = process.env.PORT || 3000;
app.use(express.static(__dirname + '/public'));
app.use(express.json()); 
//// to connect the db from db.js
const connectDB = require('./config/db');
connectDB();

//Template engine
app.set('views',path.join(__dirname,'/views'))
app.set('view engine','ejs');

//Routes
app.use('/api/files',require('./routes/files.route'))
app.use('/files',require('./routes/show.route'))
app.use('/files/download',require('./routes/download'))

app.listen(PORT, () => {
    console.log(`listening on port ${PORT}`)
})