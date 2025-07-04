const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = mongoose.Schema({
    username:{
        type:String,
        required:true,
        unique:true
    },
    email: {
        type:String,
        required:true,
        unique:true,

    },
    password:{
        type:String,
        required:true,
    },
    profilepicture:{
        type:String,
        default:"",
    },
    followers:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
    },],
    following:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",

    },],
    twoFactorAuth:{
        type:Boolean,
        default:false,
    },
    twoFactorAuthSecret:{
        type:String,
    },
},
{
    timestamps:true,
});

userSchema.methods.matchPassword=async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword,this.password)
    
}
userSchema.pre('save',async function(next){
    if(!this.isModified('password')){
        next()
    }
    const salt=await bcrypt.genSalt(10);
    this.password=await bcrypt.hash(this.password,salt)
})
const user = mongoose.model('User',userSchema);

module.exports=user;