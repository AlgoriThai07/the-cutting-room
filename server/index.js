const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
// path already declared above
const passport = require('passport');
require('./config/passport');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files (demo UI)
app.use(express.static(path.join(__dirname, 'public')));

// Routes Placeholder
app.get('/', (req, res) => {
    res.send('The Cutting Room API is running...');
});

// Import Routes
const authRoutes = require('./routes/authRoutes');
const nodeRoutes = require('./routes/nodeRoutes');
const trackRoutes = require('./routes/trackRoutes');
const userRoutes = require('./routes/userRoutes');
const itemRoutes = require('./routes/itemRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
// const demoRoutes = require('./routes/demoRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/nodes', nodeRoutes);
app.use('/api/tracks', trackRoutes);
app.use('/api/users', userRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/notifications', notificationRoutes);
// app.use('/api/demo', demoRoutes);  // Demo — no auth required

// Serve React App (Production)
app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


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
