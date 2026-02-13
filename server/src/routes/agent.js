const express = require('express');
const router = express.Router();
const AgentOrchestrator = require('../agent/orchestrator');
const Session = require('../models/Session');
const { v4: uuidv4 } = require('uuid');

const agent = new AgentOrchestrator();

// In-memory store for environments without MongoDB
const inMemorySessions = new Map();

// Helper to get/set session
const getSession = async (sessionId) => {
    if (process.env.MONGODB_URI && process.env.MONGODB_URI !== 'your_mongodb_uri_here') {
        try {
            return await Session.findOne({ sessionId });
        } catch (e) {
            console.error('DB fetch failed, falling back to memory:', e.message);
        }
    }
    return inMemorySessions.get(sessionId);
};

const saveSession = async (session) => {
    if (process.env.MONGODB_URI && process.env.MONGODB_URI !== 'your_mongodb_uri_here' && typeof session.save === 'function') {
        try {
            await session.save();
            return;
        } catch (e) {
            console.error('DB save failed, falling back to memory:', e.message);
        }
    }
    inMemorySessions.set(session.sessionId, session);
};

// Create new session
router.post('/new-session', async (req, res) => {
    const sessionId = uuidv4();
    const welcomeMessage = {
        text: "Hello! 👋 I'm your **AI Travel Manager**.\n\nI'm excited to help you plan your next budget adventure in India! ⛵\n\nTo get started, just let me know:\n1. Where are you starting from?\n2. What's your total budget and for how many people?\n3. What are your travel dates?\n\nor just say **'Hi'** and let's chat!",
        richContent: { type: 'welcome' }
    };

    const sessionData = {
        sessionId,
        state: 'IDLE',
        messages: [{
            role: 'assistant',
            content: welcomeMessage.text,
            richContent: welcomeMessage.richContent,
            timestamp: new Date()
        }],
        collectedInfo: {}
    };

    if (process.env.MONGODB_URI && process.env.MONGODB_URI !== 'your_mongodb_uri_here') {
        try {
            const session = new Session(sessionData);
            await session.save();
        } catch (error) {
            inMemorySessions.set(sessionId, sessionData);
        }
    } else {
        inMemorySessions.set(sessionId, sessionData);
    }

    res.json({ sessionId, welcomeMessage });
});

// Process message
router.post('/message', async (req, res) => {
    const { sessionId, message } = req.body;

    try {
        let session = await getSession(sessionId);

        if (!session) {
            session = {
                sessionId,
                state: 'IDLE',
                messages: [],
                collectedInfo: {}
            };
        }

        const result = await agent.processMessage(session, message);
        await saveSession(session);

        res.json({
            response: result.text,
            richContent: result.richContent,
            state: result.state,
            collectedInfo: result.collectedInfo
        });
    } catch (error) {
        console.error('Route error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
