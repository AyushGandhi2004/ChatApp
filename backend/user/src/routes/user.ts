import express from 'express';
import { loginUser, verifyUser, myProfile, getAllUsers, getUserById, updateName } from '../controllers/user.js';
import { isAuth } from '../middleware/authMiddleware.js';


const router = express.Router();

router.post('/login', loginUser);
router.post('/verify', verifyUser);
router.get('/me', isAuth, myProfile);
router.get('/users', isAuth, getAllUsers);
router.get('/users/:id', isAuth, getUserById);
router.patch('/users/:id', isAuth, updateName);

export default router;
