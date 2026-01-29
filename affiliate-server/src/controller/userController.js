const {USER_ROLES}= require ("../constants/userConstants");
const bcrypt = require('bcryptjs');
const Users = require("../model/Users");
const send = require("../services/emailService");

const generateTemporaryPassword = ()=>{
    const chars = 'abcdefghijklmnopqrstuvwxyz123456789'
    const res='';
    for(let i=0;i<6;i++){
        res+=chars.charAt(Math.floor(Math.random()*chars.length));
    }
    return res;
};

const userController ={
    create: async(req,res)=>{
        try{
            const{name, email, role}=req.body;

            if(!USER_ROLES.includes(role)){
                return res.status(400).json({message: "Invalid role"});
            }

            const temporaryPassword = generateTemporaryPassword;
            const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

            const user = Users.create({
                email: email,
                password: hashedPassword,
                name: name,
                role: role,
                adminId: req.user.id,
            });

            try{
                await send(email, "affiliate++ temporary password",
                    `Your temporary password is ${temporaryPassword}`
                );
            }catch(err){
                console.log(err);
                console.log(`Error sending password: ${temporaryPassword}`);
            }
            res.json(user);
        }catch(err){
            console.log(err);
            res.status(500).json({
                message: "Internal server error"
            });
        }
    },

    getAll: async(req, res)=>{
        try{
            const users = await Users.find({adminId: req.user.id});
            res.json(users);
        }catch(err){
            console.log(err);
            res.status(500).json({
                message: "Internal Server Error"
            });
        }
    },

    update: async(req, res)=>{
        try{
            const {id} = req.params;
            const {name, role}= req.body;

            if(role && !USER_ROLES.includes(role)){
                return res.status(400).json({
                    message: "Invalid Role"
                });
            }
            
            const user = await Users.find({_id: id, adminId: req.user.id});
            if(!user){
                return res.status(404).json({
                    message: 'Internal Server Error'
                });
            }

            if(name) user.name=name;
            if(role) user.role = role;
            
            await user.save();
            res.json(user);
        }catch(err){
            return res.status(500).json({
                message: 'Internal Server Error'
            })
        }
    },
    
    delete: async(req, res) =>{
        try{
            const {id}=req.params;

            const user = await Users.findByIdAndDelete({
                _id: id,
                adminId: req.user.id,
            });

            if(!user){
                return res.status(404).json({message: "User does not exist"});
            }

            res.json({message: "User deleted"});
        }catch(err){
            console.log(err);
            res.status(500).json({message: "Internal Server Error"});
        }
    },
}

module.exports=userController;