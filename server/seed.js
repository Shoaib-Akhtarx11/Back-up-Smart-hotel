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

    const roomsData = JSON.parse(
      fs.readFileSync(
        path.join(__dirname, '../client/src/data/rooms.json'),
        'utf-8'
      )
    );

    // Clear and recreate users with proper hashed passwords
    // First delete existing admin and manager users
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
    console.log('Created default manager user (password will be hashed by pre-save hook)');

    // Create a default admin user
    const admin = await User.create({
      Name: 'Admin User',
      Email: 'admin@hotel.com',
      email: 'admin@hotel.com',
      Password: 'admin123',
      Role: 'admin',
      ContactNumber: '1234567890',
    });
    console.log('Created default admin user (password will be hashed by pre-save hook)');

    // Map old hotel format to new schema format and insert
    const hotelIdMap = {}; // Map old IDs to new ones
    
    // Sample hotel images (free stock images)
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
    
    const newHotels = await Promise.all(
      hotelsData.map(async (hotel, index) => {
        // Normalize rating to max 5 (convert 9.8 -> ~5)
        const normalizedRating = Math.min(hotel.rating / 2, 5);
        const newHotel = await Hotel.create({
          Name: hotel.name,
          Location: hotel.location,
          ManagerID: manager._id,
          Amenities: hotel.amenities || [],
          Rating: normalizedRating || 0,
          Image: hotelImages[index % hotelImages.length], // Assign images cyclically
        });
        // Store mapping of old ID to new ID
        hotelIdMap[hotel.id] = newHotel._id;
        return newHotel;
      })
    );

    console.log(`Seeded ${newHotels.length} hotels`);

    // Map rooms to new hotels and insert
    const roomImages = [
        'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800',
        'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800',
        'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800',
        'https://images.unsplash.com/photo-1584132915807-fd1f5fbc078f?w=800',
        'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800'
    ];
    
    const newRooms = await Promise.all(
      roomsData.map(async (room, index) => {
        const hotelId = hotelIdMap[room.hotelId];
        if (hotelId) {
          return await Room.create({
            HotelID: hotelId,
            Type: room.type,
            Price: room.price,
            Availability: room.availability !== false,
            Features: room.features || [],
            Image: roomImages[index % roomImages.length], // Assign images cyclically
          });
        }
      })
    );

    console.log(`Seeded ${newRooms.filter(Boolean).length} rooms`);

    console.log('Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedDatabase();
