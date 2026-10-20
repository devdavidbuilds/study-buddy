const mongoose = require("mongoose");

const connectDB = async () => {
    // MONGODB_URI is the documented name; MONGO_URI is accepted as an alias.
    const uri = (process.env.MONGODB_URI || process.env.MONGO_URI || "").trim();

    if (!uri) {
        console.error("❌ MongoDB Connection Failed");
        console.error(
            "MONGODB_URI is not set. Add it to Backend/.env locally, or in your host's environment settings (Render: Service → Environment)."
        );
        process.exit(1);
    }

    // Render sets RENDER=true; a localhost database can never be reached from there.
    if (process.env.RENDER && /\/\/(localhost|127\.0\.0\.1)(:|\/)/.test(uri)) {
        console.error("❌ MongoDB Connection Failed");
        console.error(
            "MONGODB_URI points to localhost, which is not reachable from Render. Use a MongoDB Atlas connection string (mongodb+srv://...)."
        );
        process.exit(1);
    }

    // A URI without a database path makes the driver fall back to "test";
    // use the project database instead. A database named in the URI still wins.
    const hasDbName = /^mongodb(\+srv)?:\/\/[^/]+\/[^/?]+/.test(uri);
    const options = hasDbName ? {} : { dbName: "studybuddy" };

    try {
        await mongoose.connect(uri, options);

        console.log(`✅ MongoDB Connected Successfully (database: ${mongoose.connection.name})`);
    } catch (error) {
        console.error("❌ MongoDB Connection Failed");
        // The driver's message never includes the password from the URI.
        console.error(error.message);
        process.exit(1);
    }
};

module.exports = connectDB;
