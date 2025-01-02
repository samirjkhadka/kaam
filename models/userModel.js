import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";
import JWT from "jsonwebtoken";

// User Schema
const userSchema = new mongoose.Schema(
  {
    // User Details
    firstName: {
      type: String,
      required: [true, "Please enter your first name"],
      trim: true,
      minLength: [3, "First name must be at least 3 characters long"],
      maxLength: [35, "First name must be less than 20 characters long"],
    },
    middleName: {
      type: String, // optional
      trim: true,
      minLength: [1, "First name must be at least 3 characters long"],
      maxLength: [35, "First name must be less than 20 characters long"],
    },
    lastName: {
      type: String,
      required: [true, "Please enter your last name"],
      trim: true,
      minLength: [3, "Last name must be at least 3 characters long"],
      maxLength: [35, "Last name must be less than 20 characters long"],
    },
    email: {
      type: String,
      required: [true, " Email is Required!"],
      unique: true,
      validate: [validator.isEmail, "Please enter a valid email"],
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is Required!"],
      minLength: [8, "Password must be at least 6 characters long"],
      maxLength: [32, "Password must be less than 32 characters long"],
      select: false,
      trim: true,
    },
    role: {
      type: String,
      default: "user",
      required: true,
      enum: {
        values: ["Seeker", "Employer", "Admin"],
        message: "Role can only be 'seeker', 'user' or 'admin'",
      },
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Please enter your phone number"],
      trim: true,
    },
    address: {
      type: String,
      required: [true, "Please enter your address"],
      trim: true,
    },
    niches: {
      firstNiche: {
        type: String,
        // required: [true, "Please enter your first niche"],
      },
      secondNiche: {
        type: String,
        // required: [true, "Please enter your second niche"],
      },
      thirdNiche: {
        type: String,
        // required: [true, "Please enter your third niche"],
      },
    },
    profileImage: {
      public_id: String,
      url: String,
    },
    coverLetter: {
      type: String,
    },
    resume: {
      public_id: String,
      url: String,
    },
    createdAt: {
      // Date
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    verifyOtp: {
      // OTP
      type: String,

      default: "",
    },
    verifyOtpExpiredAt: {
      type: Number,
      default: "0",
    },
    isAccountVerified: {
      type: Boolean,
      default: false,
    },
    resetOtp: {
      type: String,

      default: "",
    },
    resetOtpExpiredAt: {
      type: Number,
      default: "0",
    },
  },
  { timestamps: true } // Add createdAt and updatedAt fields
);

// JWT
userSchema.methods.getJWTToken = function () {
  return JWT.sign({ id: this._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};


// Password
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  this.password = await bcrypt.hash(this.password, 10);
});

// Compare Password
userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// User Model
export default mongoose.model("UserModel", userSchema); // Export
