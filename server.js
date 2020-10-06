var express = require('express');
var bodyParser = require('body-parser');
var passport =  require('passport');
const cookieParser = require('cookie-parser');
var cors = require('cors');
const mongoose = require('mongoose');
const PORT = process.env.PORT || 5000;

//initialize app with express
var app = express();

//connecting to database
// const mongo_uri = `mongodb://localhost/${PORT}`;

const mongo_uri = "mongodb+srv://step-up-01:xZE7sOF5W1Obw3ou@cluster0.ve3z1.gcp.mongodb.net/Subscription-Management-Tool?retryWrites=true&w=majority";
mongoose.connect(mongo_uri, {autoIndex: false, useNewUrlParser: true, useUnifiedTopology: true}).then(
  ()=> console.log(`Successfully connected to ${mongo_uri}`)
).catch(err=> console.log(err))

app.use(cors());

app.use(cookieParser());
//Passport middleware
app.use(passport.initialize())

// parse middle ware
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

//require models
require('./models/user');

//Passport config
require('./config/passport')(passport);

const users = require('./routes/users');

app.use('/users', users);

app.listen(PORT, ()=>{
  console.log(`server is running on port ${PORT}`)
});
