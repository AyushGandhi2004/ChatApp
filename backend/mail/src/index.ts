import express from 'express';
import dotenv from 'dotenv';
import { startOtpConsumer } from './consumer.js';

dotenv.config();

startOtpConsumer();

const app = express();
app.use(express.json());

app.listen(process.env.PORT, ()=>{
    console.log(`Mail service listening on port ${process.env.PORT}`);
})