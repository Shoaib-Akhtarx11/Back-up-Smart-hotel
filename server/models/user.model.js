import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      match: [/^[a-zA-Z\s]+$/, 'Name must contain only letters and spaces'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Please provide a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [8, 'Password must be at least 8 characters long'],
      select: false, // Don't return password by default
    },
    role: {
      type: String,
      enum: ['guest', 'manager', 'admin'],
      default: 'guest',
    },
    age: {
      type: Number,
      required: [true, 'Please provide an age'],
      min: [18, 'Age must be at least 18'],
      max: [100, 'Age must be at most 100'],
    },
    phoneNo: {
      type: String,
      required: [true, 'Please provide a phone number'],
      match: [/^\d{10}$/, 'Phone number must be 10 digits'],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Hash password before saving
// using async function without next callback to avoid Mongoose confusion
UserSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare password
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', UserSchema);

export default User;
