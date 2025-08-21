import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

// Routes
import designRoutes from './routes/designRoutes.js';
import authRoutes from './routes/authRoutes.js';

// Resolve __dirname in ESM
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load environment variables
dotenv.config();
console.log("🔑 Loaded ENV Variables:", {
  PORT: process.env.PORT,
  MONGO_URI: process.env.MONGO_URI,
  NODE_ENV: process.env.NODE_ENV
});

const app = express();

// Parse JSON requests
app.use(express.json());

// ✅ CORS setup
if (process.env.NODE_ENV === 'local') {
  app.use(cors({
    origin: 'http://localhost:5173', // Vite dev server
    credentials: true
  }));
} else {
  app.use(cors({
    origin: '*', // Allow all origins in production
    credentials: true
  }));
}

// ✅ API Routes
app.use('/api', designRoutes);
app.use('/api', authRoutes);

// ✅ Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  const frontendPath = path.join(__dirname, 'frontend', 'dist');

  // Serve static files
  app.use(express.static(frontendPath));

  // Serve React app for all other routes
  app.get('*', (_, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
}

// ✅ Database connection
const dbConnect = async () => {
  try {
    const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/mern-canva";
    console.log("📌 Mongo URI being used:", uri);
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

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}..`));
