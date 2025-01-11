import mongoose from "mongoose";

const userSchema = mongoose.Schema({
    email:{
        type:String,
        required:[true,"email is required"],
        unique:true
    },
    fullName:{
        type:String,
        required:true,
    },
    password:{
        type:String,
        required:true,
        minlength:6
    },
    profilePic:{
        type:String,
        default:""
    }
},{timestamps:true})

const User = mongoose.model("User",userSchema);

export default User;