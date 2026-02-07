const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes Placeholder
app.get('/', (req, res) => {
    res.send('The Cutting Room API is running...');
});

// Import Routes
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);


// Database Connection
const connectDB = require('./config/db');

// Start Server
const startServer = async () => {
    try {
        if (process.env.MONGODB_URI) {
            await connectDB();
        } else {
            console.warn('MONGODB_URI is not defined. Skipping DB connection for now.');
        }
        
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Server failed to start:', error);
        process.exit(1);
    }
};

startServer();
