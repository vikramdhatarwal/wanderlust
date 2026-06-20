const mongoose = require('mongoose');
const initData=require('./data.js');
const listing = require('../models/listing.js');

const MONGO_URL="mongodb://127.0.0.1:27017/wanderlust";
main().catch((err)=>{
    console.error("Error initializing database:", err);
});

async function main(){
    try {
        await mongoose.connect(MONGO_URL);
        console.log("Connected to MongoDB");

        await listing.deleteMany({});
        console.log("Existing listings deleted.");
        await listing.insertMany(initData.data);
        console.log("New listings inserted.");
    } catch (err) {
        throw err;
    } finally {
        await mongoose.connection.close();
        console.log("Database initialization complete.");
    }
}