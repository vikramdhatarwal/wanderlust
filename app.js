const express=require("express");
const app=express();
const mongoose=require("mongoose");
const path=require("path");
const ejs=require("ejs");
app.listen(3000,()=>{
    console.log("server is running on port 3000");
});

app.get("/",(req,res)=>{
    res.send("Hi,I am root");
});