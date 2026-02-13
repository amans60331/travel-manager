const mongoose = require('mongoose');

const destinationSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    type: { type: String, enum: ['beach', 'mountains', 'culture', 'mix', 'adventure'], required: true },
    state: { type: String, required: true },
    avgDailyCost: { type: Number, required: true },
    bestSeasons: [String],
    reachableFrom: [{
        city: String,
        busAvg: Number,
        trainAvg: Number,
        flightAvg: Number,
        busDuration: String,
        trainDuration: String
    }],
    highlights: [String],
    description: String,
    localData: {
        scootyCostPerDay: Number,
        taxiCostPerDay: Number,
        avgMealCost: Number,
        topRestaurants: [{
            name: String,
            cuisine: String,
            avgCost: Number,
            rating: Number
        }],
        sightseeing: [{
            name: String,
            entryCost: Number,
            timeNeeded: String,
            description: String
        }]
    }
});

module.exports = mongoose.model('Destination', destinationSchema);
