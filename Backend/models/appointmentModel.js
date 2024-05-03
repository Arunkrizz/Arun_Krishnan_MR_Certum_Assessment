import mongoose from 'mongoose'

const appointmentSchema=mongoose.Schema({

    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' 
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' 
    },
 
    slot:{
        type:Number, 
    },

    abhaNumber:{
        type:Number,
    }
},{
    timestamps: true
})


const Appointment=mongoose.model('Appointment',appointmentSchema)

export default Appointment