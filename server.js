const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

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
        origin: 'http://localhost:5173',
        credentials: true
    }));
} else {
    app.use(cors({
        credentials: true
    }));
}

// ✅ Routes
app.use('/api', require('./routes/designRoutes'));
app.use('/api', require('./routes/authRoutes'));

// ✅ Serve frontend in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, "./frontend/dist")));
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, "./frontend/dist/index.html"));
    });
}

// ✅ Database connection
const dbConnect = async () => {
    try {
        const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/mern-canva";
        console.log("📌 Mongo URI being used:", uri); // Debug: check which URI is picked
        await mongoose.connect(uri);
        console.log('✅ Database connected successfully!');
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
    }
};

dbConnect();

// ✅ Port setup
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`🚀 Server is running on port ${PORT}..`));
