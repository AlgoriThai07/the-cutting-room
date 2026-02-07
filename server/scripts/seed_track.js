const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Track = require('../models/Track');
const Node = require('../models/Node');
const User = require('../models/User');
const Item = require('../models/Item');

// Helper to get current ISO week ID (e.g., "2024-W06")
const getCurrentWeekId = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const day = start.getDay() || 7; // Main adjusts
    start.setDate(start.getDate() + 4 - day);
    const diff = now - start;
    const week = Math.ceil((((diff / 86400000) + 1) / 7)) + 1; // Approx
    return `${now.getFullYear()}-W${week.toString().padStart(2, '0')}`;
};

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Find the first user or create one
        let user = await User.findOne();
        if (!user) {
            console.log('No users found. Creating a test user...');
            user = await User.create({
                username: 'TestUser',
                email: 'test@example.com',
                password: 'password123', // This won't be hashed properly but works for ID reference
                displayName: 'Test User',
                avatar: 'https://picsum.photos/seed/testuser/200/200',
                provider: 'local'
            });
            console.log('✅ Created Test User');
        }
        console.log(`Seeding data for user: ${user.username}`);

        const currentWeekId = getCurrentWeekId();
        console.log(`Seeding for Week: ${currentWeekId}`);

        // Create a Mock Item (Content)
        const item = await Item.create({
            user_id: user._id,
            content_type: 'image',
            content_url: 'https://picsum.photos/seed/story1/400/600',
            caption: 'A test moment for the active story',
        });

        // Create a Mock Node (Active story beat)
        const node = await Node.create({
            user_id: user._id,
            user_item_id: item._id,
            recap_sentence: "This is a seed node for the ACTIVE Story Page.",
            week_id: currentWeekId,
            created_at: new Date()
        });

        // Create a Track (Active)
        const track = await Track.create({
            user_id: user._id,
            node_ids: [node._id],
            story: "Your active story is being written. This seeded text should appear in the right panel of the Story Page.",
            week_id: currentWeekId,
            status: 'active', 
            concluded: false 
        });

        console.log('✅ Active Track created:', track._id);
        console.log('Go to "Story" page to see it!');

    } catch (error) {
        console.error('Seeding error:', error);
    } finally {
        await mongoose.disconnect();
    }
};

seedData();
