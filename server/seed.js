import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Hotel from './models/hotel.model.js';
import Room from './models/room.model.js';
import User from './models/user.model.js';
import Manager from './models/manager.model.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const seedDatabase = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URL);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Hotel.deleteMany({});
    await Room.deleteMany({});
    await Manager.deleteMany({});
    await User.deleteMany({ Role: { $in: ['admin', 'manager'] } });
    console.log('🗑️ Cleared Hotels, Rooms, Managers, and Admin/Manager Users');

    // Read sample hotel data
    const hotelsData = JSON.parse(
      fs.readFileSync(
        path.join(__dirname, '../client/src/data/hotels.json'),
        'utf-8'
      )
    );
    console.log(`📂 Loaded ${hotelsData.length} hotels from JSON`);

    // Indian names for managers
    const indianNames = [
      'Raj Patel', 'Amit Sharma', 'Vikram Singh', 'Arjun Nair', 'Karthik Menon',
      'Sanjay Gupta', 'Prakash Verma', 'Deepak Kumar', 'Anil Joshi', 'Ravi Krishna',
      'Suresh Iyer', 'Mahesh Chandra', 'Gopal Das', 'Harish Rao', 'Vijay Malhotra',
      'Rajesh Khanna', 'Sunil Kapoor', 'Ajay Bhatia', 'Shah Rukh', 'Salman Ahmed',
      'Aamir Khan', 'Ranbir Singh', 'Hrithik Roshan', 'Akshay Kumar', 'Saif Ali',
      'Madhav Nair', 'Kamal Haasan', 'Rajinikanth', 'Mithun Chakraborty', 'Shankar',
      'Anil Kapoor', 'Jackie Shroff', 'Sunny Deol', 'Bobby Deol', 'Govinda',
      'Paresh Rawal', 'Om Puri', 'Anupam Kher', 'Naseeruddin Shah', 'Irrfan Khan'
    ];

    // Hotel images
    const hotelImages = [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
      'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800',
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800',
      'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800',
      'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800',
      'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800',
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800',
      'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800'
    ];

    // Room images
    const roomImages = [
      'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800',
      'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800',
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800',
      'https://images.unsplash.com/photo-1584132915807-fd1f5fbc078f?w=800',
      'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800'
    ];

    // Room types
    const roomTypes = [
      { type: 'Standard Room', priceMultiplier: 1, features: ['Free WiFi', 'TV', 'Air Conditioning'] },
      { type: 'Deluxe Room', priceMultiplier: 1.5, features: ['Free WiFi', 'Breakfast included', 'City View', 'Mini Bar'] },
      { type: 'Suite', priceMultiplier: 2.5, features: ['Free WiFi', 'Breakfast included', 'Ocean View', 'King Bed', 'Spa Access'] },
      { type: 'Premium Suite', priceMultiplier: 3.5, features: ['Free WiFi', 'Breakfast included', 'Ocean View', 'King Bed', 'Spa Access', 'Private Balcony'] },
      { type: 'Executive Room', priceMultiplier: 2, features: ['Free WiFi', 'Work Desk', 'Coffee Maker', 'City View'] }
    ];

    // Create admin user
    const admin = await User.create({
      Name: 'Admin',
      Email: 'admin@hotel.com',
      Password: 'admin123',
      Role: 'admin',
      ContactNumber: '1234567890',
    });
    console.log('👑 Created Admin User');

    // Process each hotel
    for (let i = 0; i < hotelsData.length; i++) {
      const hotelData = hotelsData[i];
      const nameIndex = i % indianNames.length;

      // 1. Create manager user
      const manager = await User.create({
        Name: indianNames[nameIndex],
        Email: `manager${i + 1}@hotel.com`,
        Password: 'manager123',
        Role: 'manager',
        ContactNumber: '9999999999',
      });
      console.log(`👔 Created Manager: ${indianNames[nameIndex]} (${manager.Email})`);

      // 2. Create hotel with manager reference
      const normalizedRating = Math.min(hotelData.rating / 2, 5);
      const hotel = await Hotel.create({
        Name: hotelData.name,
        Location: hotelData.location,
        ManagerID: manager._id,
        Amenities: hotelData.amenities || [],
        Rating: normalizedRating || 0,
        Image: hotelImages[i % hotelImages.length],
      });
      console.log(`🏨 Created Hotel: ${hotelData.name}`);

      // 3. Create manager profile linking user to hotel
      await Manager.create({
        ManagerID: manager._id,
        HotelID: hotel._id,
        DateAssigned: Date.now(),
        Status: 'active'
      });
      console.log(`🔗 Linked Manager to Hotel: ${hotelData.name}`);

      // 4. Create 2 rooms per hotel
      const basePrice = 200 + (hotel.Rating * 100);
      for (let r = 0; r < 2; r++) {
        const roomTypeIndex = (i + r) % roomTypes.length;
        const roomType = roomTypes[roomTypeIndex];

        await Room.create({
          HotelID: hotel._id,
          Type: roomType.type,
          Price: Math.round(basePrice * roomType.priceMultiplier),
          Availability: r === 0 || Math.random() > 0.2, // First room always available
          Features: roomType.features,
          Image: roomImages[r % roomImages.length],
        });
        console.log(`🛏️ Created Room: ${roomType.type} for ${hotelData.name}`);
      }
    }

    console.log('\n=== ✅ Database Seeding Completed Successfully! ===');
    console.log(`Total Hotels: ${hotelsData.length}`);
    console.log(`Total Managers: ${hotelsData.length}`);
    console.log(`Total Rooms: ${hotelsData.length * 2}`);
    console.log('\n👔 Manager Login Details:');
    console.log('Emails: manager1@hotel.com → manager' + hotelsData.length + '@hotel.com');
    console.log('Password: manager123');
    console.log('\n👑 Admin Login:');
    console.log('Email: admin@hotel.com');
    console.log('Password: admin123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

seedDatabase();
