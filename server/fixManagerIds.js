/**
 * Database Fix Script - Fixes misaligned Manager IDs
 * 
 * The correct data model:
 * - User collection: has users with Role='manager'
 * - Manager collection: ManagerID should equal User._id
 * - Hotel collection: ManagerID should equal User._id (the same ID)
 * 
 * Run with: node server/fixManagerIds.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/user.model.js';
import Manager from './models/manager.model.js';
import Hotel from './models/hotel.model.js';

dotenv.config();

const fixManagerIds = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/smart_hotel_booking');
    console.log('✅ Connected to MongoDB');

    // Step 1: Get all users with manager role
    const managerUsers = await User.find({ Role: 'manager' }).select('_id Name Email');
    console.log(`📋 Found ${managerUsers.length} users with manager role`);

    if (managerUsers.length === 0) {
      console.log('❌ No manager users found');
      process.exit(0);
    }

    console.log('\n--- Manager Users ---');
    managerUsers.forEach(u => {
      console.log(`  - ${u.Name} (${u.Email}): ${u._id}`);
    });

    // Step 2: Check current state
    console.log('\n--- Current State ---');
    const existingManagers = await Manager.find();
    console.log(`Manager documents: ${existingManagers.length}`);
    
    const hotels = await Hotel.find();
    console.log(`Hotels: ${hotels.length}`);
    
    for (const h of hotels) {
      console.log(`  Hotel: ${h.Name} - ManagerID: ${h.ManagerID}`);
    }

    // Step 3: Fix alignment
    console.log('\n--- Fixing Alignment ---');
    
    let fixedCount = 0;
    
    // For each manager user, find their hotel and fix IDs
    for (const user of managerUsers) {
      console.log(`\nProcessing: ${user.Name} (${user._id})`);
      
      // Find hotels that might belong to this manager by name matching
      const userNameLower = user.Name.toLowerCase();
      const nameParts = userNameLower.split(' ');
      
      const userHotels = hotels.filter(h => {
        // Already has correct ManagerID
        if (h.ManagerID && h.ManagerID.toString() === user._id.toString()) {
          return true;
        }
        // Name match
        const hotelNameLower = h.Name.toLowerCase();
        return nameParts.some(part => part.length > 2 && hotelNameLower.includes(part));
      });

      if (userHotels.length > 0) {
        for (const hotel of userHotels) {
          // Fix Hotel.ManagerID = User._id
          if (!hotel.ManagerID || hotel.ManagerID.toString() !== user._id.toString()) {
            console.log(`  🔧 Fixing Hotel "${hotel.Name}": ManagerID -> ${user._id}`);
            hotel.ManagerID = user._id;
            await hotel.save();
            fixedCount++;
          }
          
          // Fix or create Manager document: ManagerID = User._id
          let managerDoc = await Manager.findOne({ HotelID: hotel._id });
          
          if (!managerDoc) {
            console.log(`  ➕ Creating Manager doc: ManagerID=${user._id}, HotelID=${hotel._id}`);
            managerDoc = await Manager.create({
              ManagerID: user._id,
              HotelID: hotel._id,
              DateAssigned: Date.now(),
              Status: 'active'
            });
            fixedCount++;
          } else if (managerDoc.ManagerID.toString() !== user._id.toString()) {
            console.log(`  🔧 Fixing Manager doc: ManagerID ${managerDoc.ManagerID} -> ${user._id}`);
            managerDoc.ManagerID = user._id;
            await managerDoc.save();
            fixedCount++;
          }
        }
      } else {
        console.log(`  ⚠️  No hotels found for this manager`);
      }
    }

    // Step 4: Summary
    console.log('\n--- Final State ---');
    
    const finalManagers = await Manager.find().populate('ManagerID', 'Name Email');
    console.log(`Manager documents: ${finalManagers.length}`);
    
    for (const m of finalManagers) {
      const hotel = hotels.find(h => h._id.toString() === m.HotelID?.toString());
      console.log(`  ${m.ManagerID?.Name || 'Unknown'}: ManagerID=${m.ManagerID?._id} -> Hotel=${hotel?.Name || 'Unknown'}`);
    }

    const finalHotels = await Hotel.find({ ManagerID: { $ne: null } });
    console.log(`\nHotels with ManagerID: ${finalHotels.length}`);
    
    console.log(`\n✅ Fixed ${fixedCount} records!`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

fixManagerIds();

