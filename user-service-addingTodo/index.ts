import express from "express";

import amqb from "amqplib";


const app=express();
const port=3000;

const rabitMqConnection=await amqb.connect("amqp://guest:guest@localhost:5672");

const channel=await rabitMqConnection.createChannel();

console.log("Rabit Mq connected");

interface User{
    userId:Number,
    username:String,
    email:String,
    password:String,
}

interface Todo{
    todo_Id:Number,
    title :String,
    description:String,
    completed:Boolean,
    userId:Number,
    user_email:String,
    created_At:Date,
   
}
let Todos:Todo[]=[];

let users:User[]=[];

app.use(express.json());

app.post("/signup", (req, res) => {

    const{username,email,password}=req.body;

    if(!username||!password||!email){
        return res.status(401).json({msg:"username or password required"});
    }

    const user_found=users.some((user)=>user.email===email);

    if(user_found){
        return res.status(401).json({msg:"user already existed"});
    }

    const newUser={
        userId:users.length+1,
        username,
        email,
        password,
    }

    users.push(newUser as any);

    return res.status(200).json({msg:"New user added Succesfully", newUser:newUser,userId:newUser.userId});

})
app.post("/signin", (req, res) => {

    const{username,password}=req.body;
  
     if(!username||!password){
        return res.status(401).json({msg:"username or password required"});
    }
   
    users.map((user)=>{
        if(user.username===username&&user.password===password){
            return res.status(200).json({msg:"user signed in succesfully",userData:user,userId:user.userId });
        }
        
    });

    return res.status(403).json({msg:"user not found or password incorrect"});

});

app.post("/createTodo",async(req,res)=>{
    const {userId,title,description,completed}=req.body;
    
    

    const user=users.find((u)=>{
        u.userId===userId
        return u;
    });
    
        

    if(!user){
        return res.status(400).json({
            msg:"User not found!!"
        })
    }

    const newTodo={
        todo_Id:Todos.length+1,
        title ,
        description,
        completed,
        userId,
        user_email:user.email,
        created_At:new Date(),

    }

    Todos.push(newTodo);
    await channel.assertQueue("todo_queue");
    channel.sendToQueue(
        "todo_queue",
        Buffer.from(JSON.stringify({
            newTodo
        }))
    );

    console.log("Message sent!! to rabit mq");

    return res.status(200).json({
        msg:"Todo added successfully",
        userId,
        newTodo
    });

});

app.get("/getTodo",(req,res)=>{
    const {userId,todo_Id}=req.body;

    const user=users.some((u)=>{
        u.userId===userId
    });
    

    if(!user){
        return res.status(400).json({
            msg:"User not found!!",
        })
    }

    const todo=Todos.find((t)=>{
        t.todo_Id===todo_Id
    });

    if(!todo){

        return res.status(400).json({
            msg:"Todos not found!!"
        });
    }

    return res.status(200).json({
        userId,
        todo
    });
})

app.delete("/deleteTodo",(req,res)=>{

    const {userId,todo_Id}=req.body;

    const user=users.some((u)=>{
        u.userId===userId
    });

    if(!user){
        return res.status(400).json({
            msg:"User not found!!",
        })
    }

    const todo=Todos.find((t)=>{
        t.todo_Id===todo_Id
    });

    if(!todo){

        return res.status(400).json({
            msg:"Todos not found!!"
        });
    }

    Todos.splice(todo_Id-1,1);

    

    return res.status(200).json({
        msg:"Deleted successfully "
    });

})

app.listen(port,()=>{
    console.log(`user backend running on ${port}`);
})