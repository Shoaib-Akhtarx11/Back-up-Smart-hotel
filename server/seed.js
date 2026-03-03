import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Hotel from './models/hotel.model.js';
import Room from './models/room.model.js';
import User from './models/user.model.js';
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
    console.log('Connected to MongoDB');

    // Clear existing data
    await Hotel.deleteMany({});
    await Room.deleteMany({});
    console.log('Cleared existing hotel and room data');

    // Read sample data
    const hotelsData = JSON.parse(
      fs.readFileSync(
        path.join(__dirname, '../client/src/data/hotels.json'),
        'utf-8'
      )
    );

    // Clear and recreate users with proper hashed passwords
    await User.deleteMany({ Role: { $in: ['admin', 'manager'] } });
    console.log('Cleared existing admin and manager users');

    // Create a default manager user
    const manager = await User.create({
      Name: 'Default Manager',
      Email: 'manager@hotel.com',
      email: 'manager@hotel.com',
      Password: 'password123',
      Role: 'manager',
      ContactNumber: '9999999999',
    });
    console.log('Created default manager user');

    // Create a default admin user
    const admin = await User.create({
      Name: 'Admin User',
      Email: 'admin@hotel.com',
      email: 'admin@hotel.com',
      Password: 'admin123',
      Role: 'admin',
      ContactNumber: '1234567890',
    });
    console.log('Created default admin user');

    // Sample hotel images
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

    // Create hotels first
    const newHotels = await Promise.all(
      hotelsData.map(async (hotel, index) => {
        const normalizedRating = Math.min(hotel.rating / 2, 5);
        return await Hotel.create({
          Name: hotel.name,
          Location: hotel.location,
          ManagerID: manager._id,
          Amenities: hotel.amenities || [],
          Rating: normalizedRating || 0,
          Image: hotelImages[index % hotelImages.length],
        });
      })
    );

    console.log(`Seeded ${newHotels.length} hotels`);

    // Create 2 rooms for each hotel using aggregation-like logic
    const roomTypes = [
      { type: 'Standard Room', priceMultiplier: 1, features: ['Free WiFi', 'TV', 'Air Conditioning'] },
      { type: 'Deluxe Room', priceMultiplier: 1.5, features: ['Free WiFi', 'Breakfast included', 'City View', 'Mini Bar'] },
      { type: 'Suite', priceMultiplier: 2.5, features: ['Free WiFi', 'Breakfast included', 'Ocean View', 'King Bed', 'Spa Access'] },
      { type: 'Premium Suite', priceMultiplier: 3.5, features: ['Free WiFi', 'Breakfast included', 'Ocean View', 'King Bed', 'Spa Access', 'Private Balcony'] },
      { type: 'Executive Room', priceMultiplier: 2, features: ['Free WiFi', 'Work Desk', 'Coffee Maker', 'City View'] }
    ];

    const allRooms = [];
    
    // For each hotel, create 2 rooms
    for (let i = 0; i < newHotels.length; i++) {
      const hotel = newHotels[i];
      
      // Determine base price based on hotel rating (higher rated = more expensive)
      const basePrice = 3000 + (hotel.Rating * 1000);
      
      // Select 2 different room types for this hotel
      const roomTypeIndex1 = i % roomTypes.length;
      let roomTypeIndex2 = (i + 1) % roomTypes.length;
      // Make sure we pick different room types
      if (roomTypeIndex2 === roomTypeIndex1) {
        roomTypeIndex2 = (roomTypeIndex1 + 1) % roomTypes.length;
      }
      
      const roomType1 = roomTypes[roomTypeIndex1];
      const roomType2 = roomTypes[roomTypeIndex2];
      
      // Create first room
      const room1 = await Room.create({
        HotelID: hotel._id,
        Type: roomType1.type,
        Price: Math.round(basePrice * roomType1.priceMultiplier),
        Availability: true,
        Features: roomType1.features,
        Image: roomImages[i % roomImages.length],
      });
      allRooms.push(room1);
      
      // Create second room
      const room2 = await Room.create({
        HotelID: hotel._id,
        Type: roomType2.type,
        Price: Math.round(basePrice * roomType2.priceMultiplier),
        Availability: Math.random() > 0.2, // 80% chance available
        Features: roomType2.features,
        Image: roomImages[(i + 1) % roomImages.length],
      });
      allRooms.push(room2);
    }

    console.log(`Seeded ${allRooms.length} rooms (2 rooms per hotel)`);
    console.log('Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedDatabase();

