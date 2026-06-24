import express  from "express";
import dotenv from "dotenv";
import connectDb from "./config/db.js";
import { createClient } from "redis";
import userRoutes from "./routes/user.js"
import { connectRabbitMQ } from "./config/rabbitmq.js";
import cors from "cors";

dotenv.config();

connectDb();

connectRabbitMQ();


const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
    throw new Error("REDIS_URL is required");
}

export const redisClient = createClient({
    url: redisUrl,
});

try {
    await redisClient.connect();
    console.log("Connected to Redis");
} catch (err) {
    console.error(`Failed to connect to Redis: ${err}`);
}

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use("/api/v1", userRoutes);



const PORT = process.env.PORT;

app.listen(PORT, ()=>{
    console.log(`Server listening on port ${PORT}`);
})
