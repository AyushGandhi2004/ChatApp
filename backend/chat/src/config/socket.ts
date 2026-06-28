import {Server , Socket} from 'socket.io'
import http from 'http'
import express from 'express'

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors : {
        origin : '*',
        methods : ['GET', 'POST', 'PATCH']
    }
})

const userSocketMap: Record<string,string> = {};

export const getReceiverSocketId = (receiverId : string) : string | undefined => {
    return userSocketMap[receiverId];
}

io.on('connection', (socket : Socket)=>{
    console.log('Socket connected : ', socket.id);

    const userId = socket.handshake.query.userId as string | undefined;

    if(userId && userId!=='undefined'){
        userSocketMap[userId] = socket.id;
        console.log('User connected : ', userId, 'Socket ID : ', socket.id);
    }

    io.emit("getOnlineUser",Object.keys(userSocketMap));

    if(userId){
        socket.join(userId);
    }

    socket.on("typing", (data)=>{
        console.log(`${data.userId} is typing in ${data.chatId}`);
        socket.to(data.chatId).emit("userTyping", {
            chatId : data.chatId,
            userId : data.userId
        })
    })

    socket.on("stopTyping", (data)=>{
        console.log(`${data.userId} stopped typing in ${data.chatId}`);
        socket.to(data.chatId).emit("userStopTyping",{
            chatId : data.chatId,
            userId : data.userId
        })
    })

    socket.on("joinChat", (chatId)=>{
        socket.join(chatId);
        console.log(`User ${userId} joined chat ${chatId}`);
    })

    socket.on("leaveChat", (chatId)=>{
        socket.leave(chatId);
        console.log(`User ${userId} left chat ${chatId}`);
    })

    socket.on('disconnect', ()=>{
        console.log('Socket disconnected : ', socket.id);

        if(userId){
            delete userSocketMap[userId]
            console.log(`${userId} removed from online users`)
            io.emit("getOnlineUser", Object.keys(userSocketMap));
        }
    })

    socket.on('connect_error', (err)=>{
        console.log(`connect_error due to ${err}`);
    })
})

export {app,server, io};