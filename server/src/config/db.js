const mongoose = require('mongoose');
const dns = require('dns');

/**
 * MongoDB Connection with automatic SRV-to-Standard fallback.
 * Fixes querySrv ECONNREFUSED issues on local machines/restricted networks.
 */

if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder('ipv4first');
}

const connectDB = async () => {
    let uri = process.env.MONGODB_URI;

    if (!uri || uri === 'your_mongodb_uri_here') {
        console.log('⚠️ MONGODB_URI not set. Running in memory mode.');
        return;
    }

    uri = uri.trim().replace(/^["'](.+)["']$/, '$1');

    try {
        console.log('🔄 Attempting MongoDB connection...');
        await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            family: 4,
        });
        console.log('✅ Connected to MongoDB Atlas');
    } catch (error) {
        console.error('❌ MongoDB Connection Error:', error.message);

        // Fallback: If srv fails, try the standard connection format manually
        if (uri.startsWith('mongodb+srv://') && (error.message.includes('ECONNREFUSED') || error.message.includes('ENOTFOUND'))) {
            console.log('🔄 Srv failed. Trying standard connection fallback...');

            // Extract credentials and host
            const match = uri.match(/mongodb\+srv:\/\/([^:]+):([^@]+)@([^/?]+)/);
            if (match) {
                const [_, user, pass, host] = match;
                // Standard Atlas nodes usually follow this pattern
                const standardUri = `mongodb://${user}:${pass}@ac-z9sbcu5-shard-00-00.jfgijwd.mongodb.net:27017,ac-z9sbcu5-shard-00-01.jfgijwd.mongodb.net:27017,ac-z9sbcu5-shard-00-02.jfgijwd.mongodb.net:27017/travel-manager?ssl=true&replicaSet=atlas-z9sbcu5-shard-0&authSource=admin&retryWrites=true`;

                try {
                    await mongoose.connect(standardUri, {
                        serverSelectionTimeoutMS: 5000,
                        socketTimeoutMS: 45000,
                        family: 4,
                    });
                    console.log('✅ Connected to MongoDB Atlas (via Standard Fallback URI)');
                    return;
                } catch (err2) {
                    console.error('❌ Standard Fallback also failed:', err2.message);
                }
            }
        }

        console.log('⚠️ Running in memory-only mode.');
    }
};

module.exports = connectDB;
