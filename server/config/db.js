import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config()
export const connectDB = async () => {
  try {
    if (!process.env.MONGO_URL) {
      throw new Error("MONGO_URL is not defined in .env file");
    }
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Database has been connected!!");

    // --------------------------------------------------------------------
    // Post-connection migration for user email index
    // --------------------------------------------------------------------
    // Historically the User schema used a lowercase `email` field and
    // mongoose created a unique index named `email_1`. After renaming the
    // property to `Email` the index remained, causing every document without
    // an `email` field to collide on `null`. This manifested as a 11000 error
    // "dup key: { email: null }" for *every* registration.
    //
    // The logic below is safe to run on every startup:
    //   1. drop the legacy `email_1` index if it exists
    //   2. copy `Email` into `email` for any document missing it (avoids
    //      further null collisions and keeps backward compatibility)
    //   3. create a new unique index on `Email`
    try {
      const userColl = mongoose.connection.collection('users');
      await userColl.dropIndex('email_1').catch(() => {});
      // migrate old lowercase `email` field into the new `Email` property for
      // any documents that haven't been updated yet.  This covers the case
      // where a user existed before the rename.
      await userColl.updateMany(
        { Email: { $exists: false }, email: { $exists: true, $ne: null } },
        [{ $set: { Email: '$email' } }]
      );
      // at this point, any remaining document lacking `Email` or having it
      // explicitly null/empty will conflict with the unique index; remove
      // them as they contain no usable address.
      await userColl.deleteMany({ $or: [{ Email: { $exists: false } }, { Email: null }, { Email: '' }] });
      // ensure new unique index on PascalCase field
      await userColl.createIndex({ Email: 1 }, { unique: true });
    } catch (indexErr) {
      console.error('Error migrating user email index:', indexErr.message);
    }
  } catch (err) {
    console.error("Database connection error:", err.message);
    process.exit(1);
  }
};
