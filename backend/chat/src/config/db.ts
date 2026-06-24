import mongoose from "mongoose";
import dotenv from "dotenv";
import dns from "dns";

dotenv.config();

// Workaround: force Node's DNS resolver to use a reliable public DNS
// This helps when c-ares-based resolution (used by Node) gets ECONNREFUSED
// from the default local resolver. You can remove this after fixing
// your network/router DNS configuration.
dns.setServers(["8.8.8.8"]);

const connectDb = async () => {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
        throw new Error("MONGO_URI is not defined in environment variables");
    }
    try {
        await mongoose.connect(mongoUri, {
            dbName: "ChatApp",
        });
        console.log("Connected to MongoDB");
    } catch (err) {
        console.error(`Failed to connect to MongoDB: ${err}`);
        process.exit(1);
    }
};

export default connectDb;