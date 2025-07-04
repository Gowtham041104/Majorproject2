const mongoose = require("mongoose");
const dotenv = require('dotenv');
const connectDb =async()=>{
    try{
        const conn = await mongoose.connect((process.env.MONGO_URI ||"mongodb://localhost:27017/socialmedia"),{
            useNewUrlParser:true,
            useUnifiedTopology:true
        });
        console.log("DB is connected")
    }
    catch(error){
        console.error("Error oops",error)
        process.exit(1)
    }
}

module.exports=connectDb