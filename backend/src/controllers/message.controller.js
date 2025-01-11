import cloudinary from "../lib/cloudinary.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import { io,getRecevierSocketId } from "../lib/socket.js";

const getUserForSidebar = async(req,res)=>{
    try {
        const loggedInUser = req.user._id;
        const filterUsers = await User.find({_id:{$ne: loggedInUser}}).select("-password");

        res.status(200).json(filterUsers);

    } catch (error) {
        console.log("Error in getUsersForSideBar:",error.message);
        res.status(500).json({message:"Internal serval error"});
        
    }
}

const getMessages = async(req,res)=>{
    try {
        const {id:userToChatId} = req.params
        const myId = req.user._id;

        const messages = await Message.find({
            $or:[
                {senderId:myId , receiverId:userToChatId},
                {senderId:userToChatId, receiverId:myId}
            ]
        })

        res.status(200).json(messages)
    } catch (error) {
        console.log("Error in getMessages controller:",error.message);
        res.status(500).json({error:"Internal server error"});
        
    }
}

const sendMessage = async(req,res)=>{
    try {
        const {text,image} = req.body;
        const {id:receiverId} = req.params
        const senderId = req.user._id;
    
        let imageUrl;
        if(image){
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }
    
        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image:imageUrl,
        });
    
        await newMessage.save();

        //todo: realtime functionality goes here => soket.io
        const receiverSocketId = getRecevierSocketId(receiverId); 
        if(receiverSocketId){
            console.log(receiverSocketId);
            
            io.to(receiverSocketId).emit("newMessage",newMessage); //only we send to receiver id not to all [one-one chat]
        }
        
        res.status(201).json(newMessage)
    } catch (error) {
        console.log("Error in sendMessage controller: ",error.message);
        res.status(500).json({error:"Internal server error"});
        
    }
}
export {getUserForSidebar,getMessages,sendMessage}