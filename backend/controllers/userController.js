import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pkg from 'cloudinary';
const cloudinary = pkg.v2;

import userModel from "./../models/userModel.js";

const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET);
};

// login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email });

    if (!user || !(await user.correctPassword(password, user.password))) {
      return res.json({
        success: false,
        message: "Incorrect email or password",
      });
    }

    const token = createToken(user._id);

    res.json({
      success: true,
      token,
      message: "Login Successfully",
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// register
const registerUser = async (req, res) => {
  try {
    const { name, email, password, passwordConfirm } = req.body;

    // checking user already exists or not
    const exists = await userModel.findOne({ email });

    if (exists) {
      return res.json({
        success: false,
        message: "User already exists",
      });
    }

    // validating email format & strong password
    if (!validator.isEmail(email)) {
      return res.json({
        success: false,
        message: "Please enter a valid email",
      });
    }
    if (password.length < 8) {
      return res.json({
        success: false,
        message: "Please enter a strong password",
      });
    }
    if(password !== passwordConfirm) {
      return res.json({
        success: false,
        message: "Passwords do not match",
      });
    }

    const newUser = new userModel({
      name,
      email,
      password,
      passwordChangedAt: Date.now(),
    });

    const user = await newUser.save();

    const token = createToken(user._id);

    res.json({ success: true, token, message: "Sign Up Successfully..!!"});
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.errors.passwordConfirm });
  }
};

const protect = async (req, res, next) => {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    console.log(token);

    if (!token) {
      return res.json({
        success: false,
        message: "You are not logged in, please login",
      });
    }

    const token_decode = await jwt.verify(token, process.env.JWT_SECRET);
    console.log(token_decode);
    req.body.userId = token_decode.id;
    
    next();
  } catch (error) {
    console.log(error);
    return res.json({
      success:false,
      message: "Invalid token or unauthorized"
    })
  }
};

const getUser = async(req,res) => { 
  try {
    const user = await userModel.findById(req.body.userId);
    
    res.json({
      success: true,
      user,
    })
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
    })
  }
};

const updateUser = async (req,res) => {
  try {
    const {userId,newName} = req.body;
    const photo = req.file;

    const updateFields = {};

    if(newName){
      updateFields.name = newName;
    }
    if(photo){
      const result = await cloudinary.uploader.upload(photo.path, {
        resource_type: 'image',
      });
      updateFields.photo = result.secure_url;
    }

    const updatedUser = await userModel.findByIdAndUpdate(userId,updateFields, {new:true});

    res.json({
      success: true,
      updatedUser,
      message: "User updated successfully"
    })
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "Error updating user."
    });
  }
}

// const changeName = async (req,res) => {
//   try {
//     const user = await userModel.findByIdAndUpdate(req.body.userId,{name: req.body.newName});

//     res.json({
//       success: true,
//       user,
//       message: "Name successfully changed..!!"
//     })
//   } catch (error) {
//     console.log(error);
//     res.json({
//       success: false,
//       message: "error"
//     })
//   }
// };

// const uploadImg = async (req,res) => {
//   try {
//     const photo = req.file;
 
//     if (!photo) {
//       return res.status(400).json({
//         success: false,
//         message: 'No image file uploaded.',
//       });
//     }

//     const result = await cloudinary.uploader.upload(photo.path, {
//       resource_type: 'image',
//     });

//     const updatedUser = await userModel.findByIdAndUpdate(
//       req.body.userId,
//       { photo: result.secure_url },
//       { new: true } 
//     );

//     res.json({
//       success: true,
//       message: "Image Uploaded successfully..!",
//       updatedUser
//     })
    
//   } catch (error) {
//     console.log(error);
//     res.json({
//       success: false,
//       message: "error"
//     })
//   }
// };

const deleteUser = async(req,res) => {
  try {
    const user = await userModel.findById(req.body.userId);

    if(!(await user.correctPassword(req.body.passwordCurrent,user.password))){
      return res.json({
        success: false,
        message: "Password Incorrect..!!"
      })
    }
    

    await userModel.findByIdAndDelete(req.body.userId);

    res.json({
      success: true,
      message: "Account Deleted Successfully..!!"
    })
  } catch (error) {
    console.log(error);
  }
}

// admin login
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      const token = jwt.sign(email + password, process.env.JWT_SECRET);
      res.json({
        success: true,
        token,
      });
    } else {
      return res.json({
        success: false,
        message: "Please enter a valid email",
      });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export { loginUser, registerUser, adminLogin,protect,getUser,deleteUser,updateUser };
