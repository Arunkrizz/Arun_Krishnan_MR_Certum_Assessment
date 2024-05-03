import mongoose from "mongoose";

const userSchema = mongoose.Schema({

    firstName:{
        type:String,
        required:true
    },
    lastName:{
        type:String,
        required:true
    },
    DOB:{
        type:String,
        required:true
    },
    gender:{
        type:String,
        required:true
    },
    userType:{
        type:String,
        enum: ['user','doctor'],
        default:"user"
    },
    province:{
        type:String,
        required:true
    },
    abhaAddress:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    verification:{
        type:Boolean,
        default:false  
    },
    appointments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment'  
    }],

},{

    timestamps: true // This will automatically add timestamps for any operations done.

});





const User = mongoose.model('User', userSchema);

export default User;


