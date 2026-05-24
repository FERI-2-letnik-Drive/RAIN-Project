const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

let mongoServer;
let app;
let User;
let Mailbox;

async function setupIntegrationTest() {
    mongoServer = await MongoMemoryServer.create();

    process.env.MONGODB_URI = mongoServer.getUri();
    process.env.SESSION_SECRET = "testsecret";
    process.env.NODE_ENV = "test";

    app = require("../../app");
    User = require("../../models/userModel");
    Mailbox = require("../../models/mailboxModel");

    await new Promise((resolve) => {
        mongoose.connection.once("open", resolve);
    });

    return {
        app,
        User,
        Mailbox
    };
}

async function clearDatabase() {
    if (User) {
        await User.deleteMany({});
    }

    if (Mailbox) {
        await Mailbox.deleteMany({});
    }
}

async function teardownIntegrationTest() {
    await mongoose.connection.close();
    await mongoServer.stop();
}

module.exports = {
    setupIntegrationTest,
    clearDatabase,
    teardownIntegrationTest
};