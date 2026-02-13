const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
    sessionId: { type: String, required: true, unique: true },
    state: {
        type: String,
        enum: ['IDLE', 'COLLECT_REQUIREMENTS', 'VALIDATE_BUDGET', 'PROPOSE_DESTINATIONS', 'DESTINATION_SELECTED', 'BUILD_PLAN', 'GENERATE_LINKS', 'FINAL_ITINERARY'],
        default: 'IDLE'
    },
    messages: [{
        role: { type: String, enum: ['user', 'assistant', 'system'] },
        content: String,
        richContent: mongoose.Schema.Types.Mixed,
        timestamp: { type: Date, default: Date.now }
    }],
    collectedInfo: {
        budget: Number,
        startDate: String,
        endDate: String,
        days: Number,
        origin: String,
        people: Number,
        preference: String,
        transportPreference: String
    },
    selectedDestination: String,
    budgetBreakdown: {
        travel: Number,
        stay: Number,
        food: Number,
        commute: Number,
        buffer: Number,
        total: Number
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

sessionSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});

module.exports = mongoose.model('Session', sessionSchema);
