//? ===================================================== User Controller =====================================================


// ===================== Importing necessary modules/files =====================
import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';
import Appointment from '../models/appointmentModel.js'
import OTPVerification from '../models/otpModel.js'
import generateUserToken from '../utils/jwtConfig/userJwtConfig/generateUserToken.js';
import bcrypt from "bcryptjs";
import destroyUserToken from '../utils/jwtConfig/userJwtConfig/destroyUserToken.js';
import nodemailer from 'nodemailer'



//OTP Generation & mailing

let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: "adforad1331@gmail.com",
        pass: "ggch tfuf ekjm xknk"
    }
})

const sendOtpVerification = asyncHandler(async ({ email }, res) => {
    try {
        const otp = `${Math.floor(1000 + Math.random() * 9000)}`;

        // mail options
        const mailOptions = {
            from: process.env.AUTH_EMAIL,
            to: email,
            subject: "Verify Your Email",
            html: `<p>Your OTP is <b>${otp}</b></p><p>This code <b>expires in one minute</b></p>`
        };
        const UserOtpVerificationRecords = await OTPVerification.find({ email: email })
        if (UserOtpVerificationRecords) {
            await OTPVerification.deleteMany({ email: email })

        }

        const saltRounds = 10;
        const hashedOTP = await bcrypt.hash(otp, saltRounds);
        const newOtpVerification = new OTPVerification({
            email: email,
            otp: hashedOTP,
            createdAt: Date.now()
        });

        // save otp record
        await newOtpVerification.save();

        transporter.sendMail(mailOptions, (err) => {
            if (err) {
                console.log("error sending mail", err);
            } else {
                console.log("email has send");
            }
        });

    } catch (error) {
        res.json({
            status: "Failed",
            message: error.message
        });
    }
});


const sendLoginOTP = asyncHandler(async (req, res) => {

      /*
     # Desc: Send OTP For Login
     # Route: POST /api/sendLoginOTP
     # Access: PUBLIC
    */

    const { email } = req.body
    const user = await User.findOne({ email: email });


    if (user) {
        sendOtpVerification(user, res)
        res.status(201).json("Otp sent : check your mail");
    }
})

const authUser = asyncHandler(async (req, res) => {

    /*
     # Desc: Auth user/set token
     # Route: POST /api/login
     # Access: PUBLIC
    */

    const { email, otp } = req.body;
    if (!email || !otp) {

        // If email or password is empty, return error

        res.status(401);

        throw new Error('Email or otp is missing in the request, User authentication failed.');

    }

    // Find the user in Db with the email and password
    const user = await User.findOne({ email: email });

    let otpValid = false;

    if (user) {
        const UserOtpVerificationRecords = await OTPVerification.find({ email: email })
        if (UserOtpVerificationRecords.length <= 0) {
            throw new Error("OTP Record not found")
        } else {
            const hashedOTP = UserOtpVerificationRecords[0].otp
            const otpValid = await bcrypt.compare(otp, hashedOTP)
            if (!otpValid) {
                res.status(401);
                throw new Error("Invalid OTP. Check your inbox.")
            } else {

                // If user is created, send response back with jwt token

                generateUserToken(res, user._id); // Middleware to Generate token and send it back in response object

                let registeredUserData = {
                    user: user
                }



                res.status(201).json(registeredUserData);

            }
        }
    }else{
        res.status(401);

        throw new Error('Invalid Email or Password, User authentication failed.');
    }

    


});

const registerUser = asyncHandler(async (req, res) => {

    /*
     # Desc: Register new user
     # Route: POST /api/signup
     # Access: PUBLIC
    */

    const { firstName, lastName, DOB, gender, userType, abhaAddress, province, email } = req.body;

    // Check if user already exist
    const userExists = await User.findOne({ email: email });

    // If the user already exists, throw an error
    if (userExists) {

        res.status(400);

        throw new Error('User already exists');

    }

    // Store the user data to DB if the user dosen't exist already.

    const user = await User.create({
        firstName: firstName,
        lastName: lastName,
        DOB: DOB,
        gender: gender,
        userType: userType,
        province: province,
        abhaAddress: abhaAddress,
        email: email,
    });


    if (user) {

        // If user is created, send response back with jwt token

        generateUserToken(res, user._id); // Middleware to Generate token and send it back in response object
        sendOtpVerification(user, res)

        const registeredUserData = {
            name: user.name,
            email: user.email
        }

        res.status(201).json(registeredUserData);

    } else {

        // If user was NOT Created, send error back

        res.status(400);

        throw new Error('Invalid user data, User registration failed.');

    }


});



// verify email via OTP after registering 


const verifyMail = asyncHandler(async (req, res) => {


    /*
     # Desc: Verify Email
     # Route: POST /api/verifyMail
     # Access: PUBLIC
    */

    let otp = req.body.otp
    let email = req.body.email
    if (!otp) {
        throw new Error("Empty Otp details are not allowed")
    } else {
        const UserOtpVerificationRecords = await OTPVerification.find({ email: email })
        if (UserOtpVerificationRecords.length <= 0) {
            throw new Error("Account record doesn't exist or has been verified. Please signup or login")
        } else {
            const hashedOTP = UserOtpVerificationRecords[0].otp
            const validOTP = await bcrypt.compare(otp, hashedOTP)

            if (!validOTP) {
                throw new Error("Invalid OTP. Check your inbox.")
            } else {
                await User.updateOne({ email: email }, { verification: true })
                await OTPVerification.deleteMany({ email: email })
                res.status(201).json({ message: "user verified" })
            }
        }
    }
})




const logoutUser = asyncHandler(async (req, res) => {

    /*
     # Desc: Logout user / clear cookie
     # Route: POST /api/users/logout
     # Access: PUBLIC
    */

    destroyUserToken(res);

    res.status(200).json({ message: 'User Logged Out' });

});



const createAppointment = asyncHandler(async(req,res)=>{
        /*
     # Desc: Create new Appointment
     # Route: POST /api/appointments
     # Access: PRIVATE
    */
const {doctor,abhaNumber}=req.body
const user = req.user._id
let slot =0
const doctorExists = await User.findOne({ _id: doctor });
if(doctorExists){
    slot= doctorExists.appointments.length+1
}
const appointment = await Appointment.create({
    doctor: doctor,
    user: user,
    slot: slot,
    abhaNumber:abhaNumber
    
});
if(!appointment){
    throw new Error("Appointment Booking Failed Try Again!!")
}else{
    await User.updateOne({_id:user},{ $push: { appointments: appointment._id } })
    await User.updateOne({_id:doctor},{ $push: { appointments: appointment._id }})
    res.status(200).json({message:"Appointment Booked"})
}


})



const getAllAppointments = asyncHandler(async(req,res)=>{

    /*
     # Desc: fetch all Appointment
     # Route: GET /api/appointments
     # Access: PRIVATE
    */
    
const user= req.user
const userData = await User.findOne({_id:user._id}).populate({
    path: 'appointments',
    populate: [
      { path: 'doctor' }, // Populate the 'doctor' field
      { path: 'user' },   // Populate the 'user' field
    ],
  });
if(!userData){
    throw new Error (" Error fetching user")
}else {
    res.status(200).json({appointments:userData.appointments})
}


})


const getAllDoctorsWithAppointment =asyncHandler(async(req,res)=>{

     /*
     # Desc: fetch all Doctors with Appointment
     # Route: GET /api/doctors/appointments
     # Access: PRIVATE
    */

    const doctorsWithAppointments = await User.find({
        'appointments.0': { $exists: true },
      });

      if(!doctorsWithAppointments){
        res.status(201).json({message:"No Doctors with Appointment found"})
      }else {
        res.status(201).json({doctors:doctorsWithAppointments})
      }
})























export {

    authUser,
    registerUser,
    verifyMail,
    sendLoginOTP,
    createAppointment,
    getAllAppointments,
    logoutUser,
    getAllDoctorsWithAppointment
};