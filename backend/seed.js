require('dotenv').config();
const mongoose = require('mongoose');
const MenuItem = require('./models/MenuItem');
const fs = require('fs');
const path = require('path');

const MONGO = process.env.MONGODB_URI || 'mongodb://localhost:27017/hotel_new_kishan';

async function seed() {
    try {
        await mongoose.connect(MONGO);
        console.log('Connected to MongoDB');

        // Remove old items
        await MenuItem.deleteMany();
        console.log('Old menu cleared');

        // Read the hotel menu items
        const menuPath = path.join(__dirname, '..', 'db', 'menu.json');
        if (!fs.existsSync(menuPath)) {
            console.error('menu.json not found. Make sure previous json file still exists.');
            process.exit(1);
        }

        const menuData = JSON.parse(fs.readFileSync(menuPath, 'utf8'));

        // Insert to DB
        await MenuItem.insertMany(menuData);
        console.log(`✅ ${menuData.length} menu items successfully seeded to MERN stack database!`);

        process.exit(0);
    } catch (err) {
        console.error('Error during seeder:', err);
        process.exit(1);
    }
}

seed();
