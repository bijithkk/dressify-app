import crypto from "crypto";
import jwt from "jsonwebtoken";

import userModel from "../models/userModel.js";
import { sendEmail } from "../utils/email.js";

const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET);
};

const restrictTo = (...roles) => {
  return async (req, res, next) => {
    // roles ['admin','user']
    const user = await userModel.findById(req.body.userId);
    if (!roles.includes(user.role)) {
      return res.json({
        success: false,
        message: "You do not have permission to perform this action",
      });
    }

    next();
  };
};

const forgotPassword = async (req, res, next) => {
  //1) Get user based on POSTed email
  const user = await userModel.findOne({ email: req.body.email });
  if (!user) {
    return res.json({
      success: false,
      message: "There is no user with email address",
    });
  }

  //2) Generate the random reset token
  const resetToken = user.createPasswordReserToken();
  await user.save();

  //3) Send it to users email
  const resetURL = `${process.env.FRONTEND_URL}/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forgot your password, please ignore this email!`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Your password reset token (valid for 10 min)",
      message,
    });

    res.json({
      success: true,
      message: "Token send to email!",
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    return res.json({
      success: false,
      message: "There was an error sending the email. Try again later!",
    });
  }
};

const resetPassword = async (req, res, next) => {
  //1) Get user based on the token
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.id)
    .digest("hex");

  const user = await userModel.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return res.json({
      success: false,
      message: "Token is invalid or has expired",
    });
  }
  if (req.body.password !== req.body.passwordConfirm) {
    return res.json({
      success: false,
      message: "Passwords do not match",
    });
  }
  //2) if the token has not expired, and there is user,set the new password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  //3) update changedPasswordAt property for the user

  //4) log the user in, send JWT
  const token = createToken(user._id);

  res.json({
    success: true,
    token,
  });
};

const updatePassword = async (req,res,next) => {
  //1) get user
  const user = await userModel.findById(req.body.userId);

  //2) check if POSTed current password is correct
  if(!(await user.correctPassword(req.body.passwordCurrent,user.password))) {
    return res.json({
      success: false,
      message: "Current Password is wrong..!"
    })
  }
  if(req.body.password !== req.body.passwordConfirm) {
    return res.json({
      success: false,
      message: "Password are not same..!"
    })
  }

  //3) if so, update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  //4) Log user in, send JWT
  const token = createToken(user._id);

  res.json({
    success: true,
    token,
    message: "Password Changed..!!"
  });
}

export { restrictTo, forgotPassword, resetPassword,updatePassword };
