const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load environment variables from server root
dotenv.config({ path: path.join(__dirname, '../../.env') });

const Destination = require('../models/Destination');
const connectDB = require('../config/db');

const seedDatabase = async () => {
    try {
        await connectDB();

        // Read destinations.json
        const dataPath = path.join(__dirname, '../data/destinations.json');
        const destinations = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

        console.log(`Read ${destinations.length} destinations from JSON.`);

        // Clear existing data (optional, but good for seeding)
        await Destination.deleteMany({});
        console.log('Cleared existing destinations.');

        // Insert new data
        await Destination.insertMany(destinations);
        console.log('Successfully seeded database with destinations!');

        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase();
