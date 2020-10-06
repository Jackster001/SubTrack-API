const fs = require('fs');
const jwt = require('jsonwebtoken');
const secret = 'mysecretsshhh';
const User = require('../models/user');
module.exports = (app) =>{
    //registers a user
    app.post('/register', function(req, res) {
        const { firstName, lastName, email, password } = req.body;

        if(!firstName || !lastName || !email || !password){
            res.end({
                success:false,
                message: "Please fill out all fields"
            })
        }

        User.find({email:email}), (err, previousUsers)=>{
            if(err){
                res.status(500)
                .send("Error registering new user please try again.");
            }else if(previousUsers.length>1){
                res.status(500)
                .send("Error registering new user please try again.");
            }
        }

        const user = new User({ firstName, lastName, email, password });

        user.save(function(err) {
          if (err) {
            res.status(500)
              .send("Error registering new user please try again.");
          } else {
            res.send('Registered!')
          }
        });
    });
    //login a user
    app.post('/login', function(req, res) {
        const { email, password } = req.body;
        User.findOne({ email }, function(err, user) {
          if (err) {
            console.error(err);
            res.status(500)
              .json({
              error: 'Internal error please try again'
            });
          } else if (!user) {
            res.status(401)
              .json({
                error: 'Incorrect email or password'
              });
          } else {
            user.isCorrectPassword(password, function(err, same) {
              if (err) {
                res.status(500)
                  .json({
                    error: 'Internal error please try again'
                });
              } else if (!same) {
                res.status(401)
                  .json({
                    error: 'Incorrect email or password'
                });
              } else {
                // Issue token
                const payload = { email };
                const token = jwt.sign(payload, secret, {
                  expiresIn: '1h'
                });
                res.cookie('token', token, { httpOnly: true })
                  .sendStatus(200);
              }
            });
          }
        });
    });
};