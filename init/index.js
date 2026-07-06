const mongoose = require('mongoose');
const initData=require('./data.js');
const listing = require('../models/listing.js');
const User = require('../models/user.js');

const MONGO_URL = process.env.ATLASDB_URL || "mongodb://127.0.0.1:27017/wanderlust";

async function seedDatabase(){
    await mongoose.connect(MONGO_URL);

    try {
        await Promise.all([
            listing.deleteMany({}),
            User.deleteMany({})
        ]);

        const seedOwner = await User.register(
            new User({ username: "seedowner", email: "seedowner@example.com" }),
            "SeedOwner123!"
        );

        const testUsername = process.env.TEST_USERNAME || "demo";
        const testPassword = process.env.TEST_PASSWORD || "1234";
        const testEmail = process.env.TEST_EMAIL || `${testUsername}@example.com`;

        await User.register(
            new User({ username: testUsername, email: testEmail }),
            testPassword
        );

        initData.data = initData.data.map((obj) => ({...obj, owner: seedOwner._id}));
        await listing.insertMany(initData.data);
    } finally {
        await mongoose.connection.close();
    }
}

if (require.main === module) {
    seedDatabase().then(() => {
        console.log("Database initialization complete.");
    }).catch((err)=>{
        console.error("Error initializing database:", err);
        process.exitCode = 1;
    });
}

module.exports = { seedDatabase };