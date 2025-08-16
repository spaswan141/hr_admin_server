const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const Schema = mongoose.Schema;

// =======================
// Security Config
// =======================
const SALT_WORK_FACTOR = 12;
const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME = 2 * 60 * 60 * 1000; // 2 hours in ms

// =======================
// Schema Definition
// =======================
const UserSchema = new Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      minlength: [2, "Full name must be at least 2 characters long"],
      maxlength: [100, "Full name cannot exceed 100 characters"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email address",
      ],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters long"],
      select: false, // don't return password by default
    },

    loginAttempts: {
      type: Number,
      default: 0,
    },

    lockUntil: {
      type: Date,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

// =======================
// Virtuals
// =======================
UserSchema.virtual("isLocked").get(function () {
  return Boolean(this.lockUntil && this.lockUntil > Date.now());
});

// =======================
// Hooks
// =======================
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(SALT_WORK_FACTOR);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// =======================
// Instance Methods
// =======================
UserSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

UserSchema.methods.incrementLoginAttempts = function () {
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 },
    });
  }

  const update = { $inc: { loginAttempts: 1 } };

  if (this.loginAttempts + 1 >= MAX_LOGIN_ATTEMPTS && !this.isLocked) {
    update.$set = { lockUntil: Date.now() + LOCK_TIME };
  }

  return this.updateOne(update);
};

UserSchema.methods.resetLoginAttempts = function () {
  return this.updateOne({
    $set: { loginAttempts: 0 },
    $unset: { lockUntil: 1 },
  });
};

// =======================
// Static Methods
// =======================
UserSchema.statics.authenticate = async function (email, password) {
  const user = await this.findOne({ email, isActive: true }).select("+password");

  if (!user) {
    return { success: false, reason: "NOT_FOUND", message: "Invalid email or password" };
  }

  if (user.isLocked) {
    await user.incrementLoginAttempts();
    return { success: false, reason: "MAX_ATTEMPTS", message: "Account temporarily locked" };
  }

  const isMatch = await user.comparePassword(password);

  if (isMatch) {
    if (user.loginAttempts > 0) await user.resetLoginAttempts();
    user.lastLogin = new Date();
    await user.save();

    return { success: true, user, message: "Login successful" };
  }

  await user.incrementLoginAttempts();
  return { success: false, reason: "PASSWORD_INCORRECT", message: "Invalid email or password" };
};

UserSchema.statics.unlockAccount = async function (email) {
  const user = await this.findOne({ email });
  if (!user) throw new Error("User not found");
  await user.resetLoginAttempts();
  return { success: true, message: "Account unlocked successfully" };
};

// =======================
// Model Export
// =======================
module.exports = mongoose.model("User", UserSchema);
