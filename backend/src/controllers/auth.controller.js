import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcryt from "bcryptjs"
import cloudinary from "../lib/cloudinary.js";

const signup = async(req,res)=>{
    const{email,password,fullName} =  req.body;
   
    try {
        if(!fullName || !password || !email){
            return res.status(400).json({message:"All fields are required"})
        }
        if(password.length<6){
            return res.status(400).json({message:"Password must be at least 6 character"})
        }

        const user = await User.findOne({email})
        
        if(user){
            return res.status(400).json({message:"Email already exists"})
        }

        const salt = await bcryt.genSalt(10);
        const hashPassword = await bcryt.hash(password,salt)

        const newUser = new User({
            fullName,
            email,
            password:hashPassword
        })

        
        
        if(newUser){
            //generate JWT token
            generateToken(newUser._id,res)
            console.log(newUser);
            await newUser.save();
        
            
            res.status(201).json({
                _id:newUser._id,
                fullName:newUser.fullName,
                email:newUser.email,
                profilePic:newUser.profilePic

            });
        }else{
            res.status(400).json({message:"Invalid user data"});
        }
    } catch (error) {
        console.log("Error in signup controller : ",error.message);
        res.status(500).json({message:"!@# Internal Server Error"});
    }
};

const login = async(req,res)=>{
    const {email,password} = req.body;

    try {
        if(!email || !password){
           return res.status(400).json({message:"All field are required"})
        }
    
        const user = await User.findOne({email});
        if(!user){
            return res.status(400).json({message:"Invalid credentials"})
        }
    
        if(user && await bcryt.compare(password,user.password)){
            //create JWTtoken
            generateToken(user._id,res);

            res.status(200).json({
                _id:user._id,
                fullName:user.fullName,
                email:user.email,
                profilePic:user.profilePic

            });
        }else{
            res.status(400).json({message:"Invalid user data"});
        }
    } catch (error) {
        console.log("Error in login controller",error.message);
        
        res.status(500).json({message:"Internal server error"});
    }
}

const logout = (req,res)=>{
    try {
        res.cookie("jwt","",{maxAge:0})
        res.status(200).json({message:"Logged out successfully"});
    } catch (error) {
        console.log("error in loout controller",error.message);
        res.status(500).json({message:"Internal server error"})
        
    }
}

const updateProfile = async(req,res)=>{
    try {
        const {profilePic} = req.body

        console.log("PROFILE1211   : ",profilePic);
        
        const userId = req.user._id;

        if(!profilePic){
            return res.status(400).json({message:"profile pic is required"})
        }

        const uploadResponse =  await cloudinary.uploader.upload(profilePic)
        const updateUser = await User.findByIdAndUpdate(
            userId,
            {profilePic:uploadResponse.secure_url},
            {new:true}
        );

        res.status(200).json(updateUser)

    } catch (error) {
        console.log("error in update profile",error);
        res.status(500).json({message:"Internal server error"});
        
    }
}

const checkAuth = (req,res)=>{
    try {
        res.status(200).json(req.user);
    } catch (error) {
        console.log("Error in checkAuth controller",error);;
        res.status(500).json({message:"Internal Server error"});
    }
}

export { signup,login,logout,updateProfile,checkAuth};