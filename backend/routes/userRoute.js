import express from 'express';
import upload from '../middleware/multer.js';
import {loginUser,registerUser,adminLogin,protect,getUser,deleteUser,updateUser} from './../controllers/userController.js';
import { forgotPassword,resetPassword,updatePassword } from '../controllers/authController.js';
 
const userRouter = express.Router();

userRouter.post('/register',registerUser);
userRouter.post('/login',loginUser);

userRouter.post('/forgotPassword',forgotPassword);
userRouter.patch('/resetPassword/:id',resetPassword);
userRouter.patch('/updatePassword',protect,updatePassword);

userRouter.post('/getuser',protect,getUser);
userRouter.post('/changename',protect,updateUser);
userRouter.post('/deleteuser',protect,deleteUser);
userRouter.patch('/uploadimg', upload.single('photo'), protect, updateUser);

userRouter.post('/admin',adminLogin);

export default userRouter; 