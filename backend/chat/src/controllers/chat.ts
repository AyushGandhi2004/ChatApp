import { setCommentRange } from "typescript";
import TryCatch from "../config/trycatch.js";
import type { AuthenticatedRequest } from "../middleware/isAuth.js";
import {Chat} from "../models/Chat.js";
import {Message} from "../models/Mesages.js";
import axios from "axios";

export const createNewChat = TryCatch(async (req : AuthenticatedRequest, res) => {
    const userId = req.user?._id;
    const { otherUserId } = req.body;

    if(!otherUserId) {
        res.status(400).json({message : "otherUserId is required"});
        return;
    }

    const existingChat = await Chat.findOne({
        users : { $all : [userId, otherUserId], $size : 2 }
    })

    if(existingChat){
        res.json({
            message : "Chat already exists",
            chatId : existingChat._id
        });
        return;
    }

    const newChat = await Chat.create({
        users : [userId, otherUserId],
    })

    res.status(201).json({
        message : "New Chat created",
        chatId : newChat._id
    });
    return;

})

export const getAllChats = TryCatch(async (req : AuthenticatedRequest, res) => {
    const userId = req.user?._id;
    const authHeader = req.headers.authorization;
    if(!userId){
        res.status(400).json({
            message : "User not found"
        });
        return;
    }

    const chats = await Chat.find({users : userId}).sort({updatedAt : -1});
    const chatWithUserData = await Promise.all(
        chats.map(async(chat)=>{
            const otherUserId = chat.users.find(id=> id!==userId);

            const unseenCount = await Message.countDocuments({
                chatId : chat._id,
                sender : { $ne : userId},
                seen : false
            });

            try{
                const data = await axios.get(`${process.env.USER_SERVICE}/api/v1/users/${otherUserId}`, {
                    headers: {
                        Authorization: authHeader || ""
                    }
                });
                return {
                    user : data.data,
                    chat : {
                        ...chat.toObject(),
                        latestMessage : chat.latestMessage || null,
                        unseenCount : unseenCount
                    }
                }
            }catch(err){
                console.error(`Error fetching user data for userId: ${otherUserId}`, err);
                return {
                    user : {
                        _id : otherUserId,
                        name : "Unknown User",
                    },
                    chat : {
                        ...chat.toObject(),
                        latestMessage : chat.latestMessage || null,
                        unseenCount : unseenCount
                    }
                }
            }
        })
    )
    res.json({
        chats : chatWithUserData
    });

});


export const sendMessage = TryCatch(async (req : AuthenticatedRequest, res) => {
    const senderId = req.user?._id;
    if(!senderId){
        res.status(401).json({message : "Unauthorized"});
        return;
    }
    const { chatId, text } = req.body;
    if(!chatId){
        res.status(400).json({message : "chatId is required"});
        return;
    }
    const image = req.file;
    if(!text && !image){
        res.status(400).json({message : "Either text or image is required"});
        return;
    }

    const chat = await Chat.findById(chatId);
    if(!chat){
        res.status(404).json({message : "Chat not found"});
        return;
    }

    const isUserInChat = chat.users.some(userId => userId.toString() === senderId.toString());
    if(!isUserInChat){
        res.status(403).json({message : "You are not a participant of this chat"});
        return;
    }

    const receiverId = chat.users.find(userId => userId.toString() !== senderId.toString());
    if(!receiverId){
        res.status(401).json({message : "Receiver not found"});
        return;
    }

    //socket setup later

    let messageData : any = {
        chatId : chatId,
        sender : senderId,
        seen : false,
        seenAt : null,
    };

    if(image){
        messageData.image = {
            url : image.path,
            public_id : image.filename
        };
        messageData.messageType = "image";
        messageData.text = text || "";
    }else{
        messageData.messageType = "text";
        messageData.text = text;
    }

    const message = new Message(messageData);
    const savedMessage = await message.save();
    const latestMessage = image ? "📷 Image" : text

    await Chat.findByIdAndUpdate(chatId, {
        latestMessage : {
            text : latestMessage,
            sender : senderId,
        },
        updatedAt : new Date()

    }, {new : true})

    //emit to sockets

    res.status(201).json({
        message : savedMessage,
        sender : senderId,
    })
})


export const getMessagesByChat = TryCatch(async (req:AuthenticatedRequest, res)=>{
    const userId = req.user?._id;
    const authHeader = req.headers.authorization;
    if(!userId){
        res.status(401).json({message : "Unauthorized"});
        return;
    }
    const { chatId } = req.params;
    if(!chatId){
        res.status(400).json({message : "chatId is required"});
        return;
    }

    const chat = await Chat.findById(chatId);
    if(!chat){
        res.status(404).json({message : "Chat not found"});
        return;
    }

    const isUserInChat = chat.users.some(userId => userId.toString() === userId.toString());
    if(!isUserInChat){
        res.status(403).json({message : "You are not a participant of this chat"});
        return;
    }

    const messagesMarkAsSeen = await Message.find({
        chatId : chatId,
        sender : { $ne : userId },
        seen : false
    });

    await Message.updateMany({
        chatId : chatId,
        sender : { $ne : userId },
        seen : false
    },{
        seen : true,
        seenAt : new Date()
    });

    const messages = await Message.find({chatId : chatId}).sort({createdAt : 1});

    const otherUserId = chat.users.find(id => id !== userId);
    if(!otherUserId){
        res.status(404).json({message : "Other user not found"});
        return;
    }

    try{
        const user_service_url = process.env.USER_SERVICE;
        if(!user_service_url){
            res.status(500).json({message : "User service URL not configured"});
            return;
        }
        const data = await axios.get(
            `${user_service_url}/api/v1/users/${otherUserId}`,
            {
                headers: {
                    Authorization: authHeader || "",
                },
            }
        );
        if(!data){
            res.status(404).json({message : "User not found"});
            return;
        }

        //socket work later

        res.json({
            messages,
            user : data.data
        });
    }catch(err){
        console.log(`Error fetching user data for userId: ${otherUserId}`, err);
        res.json({
            messages,
            user : {
                _id : otherUserId,
                name : "Unknown User"
            }
        })
    }


})