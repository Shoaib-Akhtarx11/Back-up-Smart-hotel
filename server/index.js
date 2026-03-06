import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from 'url';
import { connectDB } from "./config/db.js";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import hotelRouter from "./routes/hotel.routes.js";
import authRouter from "./routes/auth.routes.js";
import roomRouter from "./routes/room.routes.js";
import bookingRouter from "./routes/booking.routes.js";
import paymentRouter from "./routes/payment.routes.js";
import reviewRouter from "./routes/review.routes.js";
import loyaltyRouter from "./routes/loyalty.routes.js";
import redemptionRouter from "./routes/redemption.routes.js";
import managerRouter from "./routes/manager.routes.js";
import adminRouter from "./routes/admin.routes.js";

// Load global .env from project root
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 5600;

// Connect Database 
connectDB();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// security headers
app.use(helmet());

// rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(limiter);

// CORS SET UP
app.use(cors({
    origin: ["http://localhost:5173", "http://192.168.0.115:5173", "http://127.0.0.1:5173"],
    credentials: true
}));

// Cookie parser
import cookieParser from "cookie-parser";
app.use(cookieParser());

// Default route
app.get("/", (req, res) => {
    res.send("Server is running perfectly!!!");
});

// ✅ Mount the auth routes
app.use("/api/auth", authRouter);

// Mount hotel endpoints
app.use("/api/hotels", hotelRouter);

// Mount room endpoints
app.use("/api/rooms", roomRouter);

// Mount booking endpoints
app.use("/api/bookings", bookingRouter);

// Mount payment endpoints
app.use("/api/payments", paymentRouter);

// Mount review endpoints
app.use("/api/reviews", reviewRouter);

// Mount loyalty endpoints
app.use("/api/loyalty", loyaltyRouter);

// Mount redemption endpoints
app.use("/api/redemptions", redemptionRouter);

// Mount manager endpoints
app.use("/api/manager", managerRouter);

// Mount admin endpoints
app.use("/api/admin", adminRouter);

// Global error handler
app.use((err, req, res, next) => {
    console.error("Error:", err);
    if (err && err.stack) console.error(err.stack);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || "Server error"
    });
});

// Running the server
app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
});
