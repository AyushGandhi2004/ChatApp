import amqp from 'amqplib';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

export const startOtpConsumer = async ()=>{
    try{
        const hostname = process.env.RABBITMQ_HOST;
        if(!hostname){
            throw new Error("RABBITMQ_HOST is required");
        }
        const username = process.env.RABBITMQ_USERNAME;
        if(!username){
            throw new Error("RABBITMQ_USERNAME is required");
        }
        const password = process.env.RABBITMQ_PASSWORD;
        if(!password){
            throw new Error("RABBITMQ_PASSWORD is required");
        }

        const connection = await amqp.connect({
            protocol : 'amqp',
            hostname : hostname,
            port : 5672,
            username : username,
            password : password
        })

        const channel = await connection.createChannel();
        const queueName = 'send-otp';

        await channel.assertQueue(queueName, { durable: true });

        console.log(`Consumer Queue - Waiting for otp: ${queueName}`);

        channel.consume(queueName, async (msg)=>{
            try{
                const {to, subject, body} = JSON.parse(msg?.content.toString() || '{}');
                const user = process.env.EMAIL_USER;
                const pass = process.env.EMAIL_PASSWORD;
                const transporter = nodemailer.createTransport({
                    host : "smtp.gmail.com",
                    port : 465,
                    auth : {   
                        user : user,
                        pass : pass,
                    }
                });

                await transporter.sendMail({
                    from : "ChatApp",
                    to,
                    subject,
                    text : body
                });

                console.log(`OTP sent to ${to}`);
                channel.ack(msg!);
            }catch(err){
                console.error(`Failed to send OTP: ${err}`);
            }
        })
    }catch(err){
        console.error(`Failed to start OTP consumer: ${err}`);
    }
}
