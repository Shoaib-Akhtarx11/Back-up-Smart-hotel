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

    // Create a default manager user if doesn't exist
    let manager = await User.findOne({ Role: 'manager' });
    if (!manager) {
      manager = await User.create({
        Name: 'Default Manager',
        Email: 'manager@hotel.com',
        email: 'manager@hotel.com',
        Password: 'password123',
        Role: 'manager',
        ContactNumber: '9999999999',
      });
      console.log('Created default manager user');
    }

    // Map old hotel format to new schema format and insert
    const hotelIdMap = {}; // Map old IDs to new ones
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
        });
        // Store mapping of old ID to new ID
        hotelIdMap[hotel.id] = newHotel._id;
        return newHotel;
      })
    );

    console.log(`Seeded ${newHotels.length} hotels`);

    // Map rooms to new hotels and insert
    const newRooms = await Promise.all(
      roomsData.map(async (room) => {
        const hotelId = hotelIdMap[room.hotelId];
        if (hotelId) {
          return await Room.create({
            HotelID: hotelId,
            Type: room.type,
            Price: room.price,
            Availability: room.availability !== false,
            Features: room.features || [],
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
