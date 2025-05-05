import express from 'express';
import { register, login, verify, logout, updateProfile, changePassword } from '../controllers/authController';
import { RequestHandler } from 'express';
const router = express.Router();


router.post('/register', register as RequestHandler<any, any, any, any>);
router.post('/login', login as RequestHandler<any, any, any, any>);
router.get('/verify', verify as RequestHandler<any, any, any, any>);
router.post('/logout', logout as RequestHandler<any, any, any, any>);
router.put('/update-profile', updateProfile as RequestHandler<any, any, any, any>);
router.put('/change-password', changePassword as RequestHandler<any, any, any, any>);

export default router;

