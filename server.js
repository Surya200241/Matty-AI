import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
import designRoutes from './routes/designRoutes.js';
import authRoutes from './routes/authRoutes.js';

// Load .env file
dotenv.config();
console.log("🔑 Loaded ENV Variables:", {
  PORT: process.env.PORT,
  MONGO_URI: process.env.MONGO_URI,
  NODE_ENV: process.env.NODE_ENV
});

const app = express();
app.use(express.json());

// ✅ Setup CORS
if (process.env.NODE_ENV === 'local') {
  app.use(cors({
    origin: 'http://localhost:5173', // Vite dev server
    credentials: true
  }));
} else {
  app.use(cors({
    origin: '*',  // allow all in production
    credentials: true
  }));
}
app.use('/api', designRoutes);
app.use('/api', authRoutes);

// ✅ Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  const frontendPath = path.join(__dirname, 'frontend', 'dist');
  app.get('*', (_, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
}

// ✅ Database connection
const dbConnect = async () => {
  try {
    const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/mern-canva";
    console.log("📌 Mongo URI being used:", uri); // Debug
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Database connected successfully!');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
};

dbConnect();

// ✅ Port setup
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server is running on port ${PORT}..`));