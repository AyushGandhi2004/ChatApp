import express from "express";
import dotenv from "dotenv";
import connectDb from "./config/db.js";
import chatRouter from "./routes/chat.js";
import cors from "cors";
import { app, server } from "./config/socket.js";

dotenv.config();

connectDb();

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use("/api/v1", chatRouter);

const PORT = process.env.PORT;

server.listen(PORT, ()=>{
    console.log(`Server is running on port ${PORT}`);
})