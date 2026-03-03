import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema(
  {
    UserID: {
      type: mongoose.Schema.Types.ObjectId,
      default: () => new mongoose.Types.ObjectId(),
    },
    Name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      match: [/^[a-zA-Z\s]+$/, 'Name must contain only letters and spaces'],
    },
    Email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Please provide a valid email address',
      ],
      alias: 'email', // keep lowercase `email` in sync for legacy lookups
    },
    Password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [8, 'Password must be at least 8 characters long'],
      select: false,
    },
    Role: {
      type: String,
      enum: ['guest', 'manager', 'admin'],
      default: 'guest',
    },
    ContactNumber: {
      type: String,
      required: [true, 'Please provide a contact number'],
      match: [/^\d{10}$/, 'Contact number must be 10 digits'],
    },
  },
  { timestamps: true }
);

// Hash password before saving
UserSchema.pre('save', async function () {
  if (!this.isModified('Password')) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.Password = await bcrypt.hash(this.Password, salt);
});

// Method to compare password
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.Password);
};

const User = mongoose.model('User', UserSchema);

export default User;
