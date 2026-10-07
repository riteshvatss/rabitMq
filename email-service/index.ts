import amqb from "amqplib";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const rabitMqConnection=await amqb.connect("amqp://guest:guest@localhost:5672");

const channel=await rabitMqConnection.createChannel();

await channel.assertQueue("todo_queue");

interface Todo{
    todo_Id:number,
    title :string,
    description:string,
    completed:boolean,
    userId:number,
    user_email:string,
    created_At:Date,
   
}


async function sendMail(ToDo:Todo) {
  const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
      user: process.env.user,
      pass: process.env.pass
    }
  });

  const info = await transporter.sendMail({
    from: process.env.user,
    to: ToDo.user_email,
    subject: ToDo.title,
    text: ToDo.description
  });
  return info;
}


channel.consume("todo_queue",async(msg)=>{
    if(msg){
        const newTodo=JSON.parse(msg.content.toString()).newTodo;
       const info=await sendMail(newTodo);
       console.log(info);
       
    }
})




