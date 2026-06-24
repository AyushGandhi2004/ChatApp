import amqp from 'amqplib';

let channel: amqp.Channel;

export const connectRabbitMQ = async ()=>{
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
            protocol: 'amqp',
            hostname: hostname,
            port: 5672,
            username: username,
            password: password,
        });

        channel = await connection.createChannel();
        console.log("Connected to RabbitMQ");
    }catch(err){
        console.error(`Failed to connect to RabbitMQ: ${err}`);
    }
}


export const publishToQueue = async (queueName : string, message : any) => {
    if(!channel){
        console.log("RabbitMQ channel is not initialized");
        return;
    }

    await channel.assertQueue(queueName, { durable: true });
    channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)), {
        persistent: true
    });
}