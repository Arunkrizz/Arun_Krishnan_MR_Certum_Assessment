//? ===================================================== User Routes =====================================================

// ===================== Importing necessary modules/files =====================
import express from 'express';
import authenticateUser from '../middlewares/userAuthMiddleware.js';



// ===================== Configuring Express Router =====================
const router = express.Router();

import {
    authUser,
    registerUser,
    verifyMail,
    sendLoginOTP,
    createAppointment,
    getAllAppointments,
    logoutUser,
    getAllDoctorsWithAppointment
} from '../controllers/userController.js';




//? =============================== Routes ===============================


//* ==================== Authentication Routes ====================

router.post('/signup', registerUser);

router.post('/verifyMail', verifyMail);

router.post('/sendLoginOTP',sendLoginOTP)

router.post('/login', authUser);

router.post('/logout', logoutUser);

router.route('/appointments').get( authenticateUser, getAllAppointments ).post( authenticateUser, createAppointment);
// In the above line, the route is same, above line will use the specified controller according to the type of the request

router.get('/doctors/appointments',authenticateUser,getAllDoctorsWithAppointment)







export default router;