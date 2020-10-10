var express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const keys = require('../config/keys');
var passport =  require('passport');
const nodemailer = require("nodemailer");

//Load User Model
const User = require('../models/user');

var transporter;
//Prepare mailer
async function mailerMain(){
    try{
        transporter = await nodemailer.createTransport({
            service: "gmail",
            auth: {
            user: "hardworkinghawks@gmail.com",
            pass: "Hawks654321", 
            },
        });
    }catch(err){
        console.log(err)
    }
}
mailerMain();

// @route POST api/users/register
// @desc Register a User
// @access Public
router.post('/register', async (req, res)=>{
    try{
        const {firstName, lastName, email, password} = req.body;
        const prevUser = await User.findOne({email:email})
        if(prevUser){
            return res.status(400).json("Account already registered with this email");
        }
        newUser = new User( {firstName:firstName, lastName:lastName, email:email, password:password, subscriptions:[]});
        const salt= await new Promise ((resolve, reject)=>{
            bcrypt.genSalt(10, (err, salt)=>{
            if(err) return resolve(err)
            resolve(salt)
        })})
        const hashedPassword = await new Promise((resolve, reject) => {
            bcrypt.hash(""+newUser.password, salt, function(err, hash) {
              if (err) throw (err) 
              resolve(hash)
            });
        })

        newUser.password = hashedPassword.toString();
        newUser.save()
        await transporter.sendMail({
            from: '"Hardworking Hawks" hardworkinghawks@gmail.com', // sender address
            to: `${email}`, // list of receivers
            subject: "Your Account is Registered!", // Subject line
            html: `<p>Thank you for registering for an account with us!</p>`, // html body
        });

        return res.json(newUser)
    }catch(error){
        throw error
    }
})

// @route POST users/login
// @desc Logs in a User
// @access Public
router.post('/login', async(req, res)=>{
    try{
        const {email, password} = req.body;
        const user = await User.findOne({email})
        if(!user){
            return res.status(404).json("Account not found");
        }
        const rel = await bcrypt.compare(password, user.password)

        if(!rel){
            return res.status(400).json({password: 'Email or Password is Incorrect'})
        }

        //User Matched
        const userInfo= {
            id: user._id, 
            email: user.email, 
            firstName: user.firstName, 
            lastName: user.lastName, 
            subscriptions: user.subscriptions, 
        }

        //Sign Token 
        let token = await jwt.sign(userInfo, keys.secretOrKey, { expiresIn: 7200 });
        token = 'Bearer '+ token;

        const payload = {token, userInfo}

        return res.status(200).json(payload);
    }catch(error){
        throw error
    }
})

// @route GET api/users/current
// @desc Authenticates Current User
// @access Public
router.get('/authenticate', passport.authenticate('jwt', {session:false}), async(req, res)=> {
    try{
        res.json({msg: 'success'})
    }catch(err) {throw err}
})

router.get('/:id', passport.authenticate('jwt', { session: false }),
    async(req, res) => {
        try{
            const errors = {};
            const profile = await User.findById(req.params.id)
            if(!profile){
                errors.noprofile = 'There is no profile for this user';
                return res.status(404).json(errors);
            }
            return res.status(200).json(profile)
        }catch(err){
            res.status(404).json(err)
        }
    }
);

// @route post users/add-subscription
// @desc add job to applied
// @access Private
router.post('/add-subscription', async(req, res)=>{
    try{
        const {id, subData} = req.body;
        const user = await User.findOne({_id: id})
        await user.subscriptions.unshift(subData)
        const userInfo= {
            id: user._id, 
            email: user.email, 
            firstName: user.firstName, 
            lastName: user.lastName, 
            subscriptions: user.subscriptions
        }
        await User.updateOne({_id: id}, { $set: {subscriptions: user.subscriptions}})
        console.log("info " + userInfo.subscriptions);
        return res.status(200).json(userInfo)
        // keeping this for next time
        // await transporter.sendMail({
        //     from: '"Hardworking Hawks" hardworkinghawks@gmail.com', // sender address
        //     to: `${email}`, // list of receivers
        //     subject: "New Subscription has been added", // Subject line
        //     html: `<p>You have registered ${subData.title} to Subtrack!</p>`, // html body
        // });
    }catch(err){
        res.status(404).json(err)
    }
})

// @route delete users/delete-subscription
// @desc delete subscription from list of subscriptions
// @access Private
router.post('/delete-subscription', async(req, res)=>{
    try{
        const {id, i} = req.body;
        const user = await User.findOne({_id:id})
        await user.subscriptions.splice(i,1)
        await User.updateOne({_id: id}, { $set: {subscriptions: user.subscriptions}})
        console.log(user)
        return res.status(200).json(user)
    }catch(err){
        res.status(404).json(err)
    }
})

// @route update users/update-subscription
// @desc update a subscription
// @access Private
router.post('/update-subscription', async(req, res)=>{
    try{
        const {id, subData, i} = req.body;
        const user = await User.findOne({_id: id})
        user.subscriptions[i] = subData;
        const userInfo= {
            id: user._id, 
            email: user.email, 
            firstName: user.firstName, 
            lastName: user.lastName, 
            subscriptions: user.subscriptions
        }
        await User.updateOne({_id: id}, { $set: {subscriptions: user.subscriptions}})
        return res.status(200).json(userInfo)
    }catch(err){
        res.status(404).json(err)
    }
})

// @route get users/get-applied-jobs/:id
// @desc returns user by id
// @access Private
router.get('/subscriptions/:id', async(req, res)=>{
    try{
        const id = req.params.id;
        const user = await User.findOne({_id:id})
        const result = user.subscriptions;
        return res.send(result)
    }catch(err){
        throw err
    }
});


module.exports = router;
