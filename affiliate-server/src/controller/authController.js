const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Users = require('../model/Users');
const {OAuth2Client} = require("goole-auth-library");

// https://www.uuidgenerator.net/
const secret = "69f8825c-ae86-4a76-89d5-501a621e772e";

const authController = {
    login: async (request, response) => {
        try {
            // The body contains username and password because of the express.json()
            // middleware configured in the server.js
            const { username, password } = request.body;

            // Call Database to fetch user by the email
            const data = await Users.findOne({ email: username });
            if (!data) {
                return response.status(401).json({ message: 'Invalid credentials ' });
            }

            const isMatch = await bcrypt.compare(password, data.password);
            if (!isMatch) {
                return response.status(401).json({ message: 'Invalid credentials ' });
            }

            const user = {
                id: data._id,
                name: data.name,
                email: data.email
            };

            const token = jwt.sign(user, secret, { expiresIn: '1h' });
            response.cookie('jwtToken', token, {
                httpOnly: true,
                secure: true,
                domain: 'localhost',
                path: '/'
            });
            response.json({ user: user, message: 'User authenticated' });
        } catch (error) {
            console.log(error);
            response.status(500).json({ error: 'Internal server error' });
        }
    },

    logout: (request, response) => {
        response.clearCookie('jwtToken');
        response.json({ message: 'Logout successfull' });
    },

    isUserLoggedIn: (request, response) => {
        const token = request.cookies.jwtToken;

        if (!token) {
            return response.status(401).json({ message: 'Unauthorized access' });
        }

        jwt.verify(token, secret, (error, user) => {
            if (error) {
                return response.status(401).json({ message: 'Unauthorized access' });
            } else {
                response.json({ message: 'User is logged in', user: user });
            }
        });
    },
    register:async(req,res)=>{
        try{
            //extract attributes from the request body
            const {username,password, name}=req.body;

            //first check if User already exist or not
            const data=await Users.findOne({email:username});
            if(data){
                return res.status(401)
                    .json({message: 'Account already exist with given email'});
            }

            //Encrypt the password before saving it to database
            const encryptedPassword= await bcrypt.hash(password,10);

            //Create mongoose model object and set the record values
            const user = new Users({
                email: username,
                password: encryptedPassword,
                name: name
            });

            await user.save();
            res.status(200).json({message: "User registered"});
        }catch(error){
            console.log(error);
            return res.status(500).json({error: "Internal Server Error"});
        }
    },
    googleAuth: async(req, res) =>{
        try{
            const {idToken}=req.body;
            if(!idToken){
                return res.status(401).json({message: "Invalid request"});
            }

            //registering your app on google
            const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

            const googleResponse = await googleClient.verifyIdToken({
                idToken: idToken,
                audience: process.env.GOOGLE_CLIENT_ID
            });

            const payload = googleClient.getPayload();
            const {sub:googleId, name, email}=payload;

            let data = await Users.findOne({email: email});

            if(!data){
                data = new Users({
                    email: email,
                    name: name,
                    isGoogleUser: true,
                    googleId: googleId
                });
                await data.save();
            }

            const user={
                id:data._id?data._id:googleId,
                username:email,
                email:name
            };

            const token = jwt.sign(user, secret,{expiresIn: '1h'});

            res.cookie('jwtToken', token,{
                httpOnly: true,
                secure: true,
                path: "/"
            });
            res.json({user:user, message:'User Authenticated'});
        }catch(err){
            console.log(err);
            return res.status(500).json({message: "Internal server error"});
        }
    }
};

module.exports = authController;