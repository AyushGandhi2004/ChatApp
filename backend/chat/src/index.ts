import express from "express";
import dotenv from "dotenv";
import connectDb from "./config/db.js";
import chatRouter from "./routes/chat.js";

dotenv.config();

connectDb();

const app = express();

app.use("/api/v1", chatRouter);

const PORT = process.env.PORT;

app.listen(PORT, ()=>{
    console.log(`Server is running on port ${PORT}`);
})