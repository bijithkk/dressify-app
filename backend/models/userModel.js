  import mongoose from "mongoose";
  import bcrypt from "bcrypt";
  import validator from "validator";
  import crypto from "crypto";

  const userSchema = new mongoose.Schema(
    {
      name: { type: String, require: true },
      email: { type: String, require: true, unique: true },
      password: { type: String, require: true, minlength: 8 },
      photo: { type: String, default: 'https://res.cloudinary.com/dtqfpv9yl/image/upload/v1733939744/vecteezy_default-profile-account-unknown-icon-black-silhouette_20765399_odafam.jpg'},
      // role: { type: String, enum: ['user','admin'] },
      passwordConfirm: {
        type: String, 
        require: true,
      },
      passwordChangedAt: Date,
      cartData: { type: Object, default: {} },
      passwordResetToken: String,
      passwordResetExpires: Date,
    },
    { minimize: false }
  );

  userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 12);

    this.passwordConfirm = undefined;

    next();
  });

  userSchema.pre('save', function(next){
    if(!this.isModified('password') || this.isNew) return next();

    this.passwordChangedAt = Date.now() - 1000;
    next();
  })

  userSchema.methods.correctPassword = async function (
    candidatePassword,
    userPassword
  ) {
    return await bcrypt.compare(candidatePassword, userPassword);
  };

  userSchema.methods.createPasswordReserToken = function () {
    const resetToken = crypto.randomBytes(32).toString("hex");

    this.passwordResetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    return resetToken;
  };

  const userModel = mongoose.models.user || mongoose.model("user", userSchema);

  export default userModel;
