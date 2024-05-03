import mongoose from 'mongoose';

const otpSchema = mongoose.Schema({
    email: String,
    otp: String,
    createdAt: Date,
});

const OTPVerification = mongoose.model('OTPVerification', otpSchema);

export default OTPVerification;