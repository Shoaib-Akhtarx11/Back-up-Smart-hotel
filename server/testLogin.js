import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/user.model.js';
import bcrypt from 'bcryptjs';

dotenv.config();

const testLogin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log('Connected to MongoDB');

    // Check all users
    const users = await User.find({}).limit(10);
    console.log('\n=== Users in Database ===');
    users.forEach((user, i) => {
      console.log(`${i+1}. Email: ${user.Email}, Role: ${user.Role}, HasPassword: ${!!user.Password}`);
      if (user.Password) {
        console.log(`   Password (first 20 chars): ${user.Password.substring(0, 20)}...`);
      }
    });

    // Check admin user
    const admin = await User.findOne({ Role: 'admin' });
    if (admin) {
      console.log('\n=== Admin User Found ===');
      console.log('Email:', admin.Email);
      console.log('Password exists:', !!admin.Password);
      console.log('Password value:', admin.Password);
    } else {
      console.log('\nNo admin user found');
    }

    // Check manager user
    const manager = await User.findOne({ Role: 'manager' });
    if (manager) {
      console.log('\n=== Manager User Found ===');
      console.log('Email:', manager.Email);
      console.log('Password exists:', !!manager.Password);
      console.log('Password value:', manager.Password);
    }

    // Test creating a user to verify hashing works
    console.log('\n=== Testing Password Hashing ===');
    const testUser = new User({
      Name: 'Test User',
      Email: 'test' + Date.now() + '@test.com',
      Password: 'test123',
      Role: 'guest',
      ContactNumber: '1234567890'
    });
    await testUser.save();
    console.log('Created test user with hashed password');
    console.log('Hashed password:', testUser.Password.substring(0, 30) + '...');
    
    // Test password match
    const isMatch = await testUser.matchPassword('test123');
    console.log('Password match test:', isMatch);
    
    // Clean up
    await User.deleteOne({ _id: testUser._id });
    console.log('Test user deleted');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

testLogin();

