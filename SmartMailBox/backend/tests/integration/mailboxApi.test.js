const request = require("supertest");
const path = require("path");

const {
    setupIntegrationTest,
    clearDatabase,
    teardownIntegrationTest
} = require("../setup/integrationSetup");

let app;

const testImagePath = path.join(__dirname, "../fixtures/direct4me-pj-arnes.png");

beforeAll(async () => {
    const setup = await setupIntegrationTest();
    app = setup.app;
});

beforeEach(async () => {
    await clearDatabase();
});

afterAll(async () => {
    await teardownIntegrationTest();
});
async function registerAndLogin(username, email) {
    const agent = request.agent(app);

    await agent.post("/users/register").send({
        username,
        email,
        password: "password123"
    });

    await agent.post("/users/login").send({
        username,
        password: "password123"
    });

    return agent;
}

describe("Mailbox API", () => {
    test("create mailbox requires login", async () => {
        const res = await request(app)
            .post("/mailboxes")
            .field("label", "Room 1")
            .attach("image", testImagePath);

        expect(res.statusCode).toBe(401);
    });

    test("create mailbox requires label", async () => {
        const agent = await registerAndLogin("marcel", "marcel@test.com");

        const res = await agent
            .post("/mailboxes")
            .field("label", "")
            .attach("image", testImagePath);

        expect(res.statusCode).toBe(400);
    });

    test("create mailbox requires QR image", async () => {
        const agent = await registerAndLogin("marcel", "marcel@test.com");

        const res = await agent
            .post("/mailboxes")
            .field("label", "Room 1");

        expect(res.statusCode).toBe(400);
    });

    test("creates mailbox successfully", async () => {
        const agent = await registerAndLogin("marcel", "marcel@test.com");

        const res = await agent
            .post("/mailboxes")
            .field("label", "Room 1")
            .field("location", "Office")
            .attach("image", testImagePath);

        expect(res.statusCode).toBe(201);
        expect(res.body.label).toBe("Room 1");
        expect(res.body.location).toBe("Office");
        expect(res.body.path).toContain("res.cloudinary.com");
        expect(res.body.owner).toBeDefined();
    });

    test("lists only logged-in user's mailboxes", async () => {
        const agent1 = await registerAndLogin("user1", "user1@test.com");
        const agent2 = await registerAndLogin("user2", "user2@test.com");

        await agent1
            .post("/mailboxes")
            .field("label", "User1 Mailbox")
            .attach("image", testImagePath);

        await agent2
            .post("/mailboxes")
            .field("label", "User2 Mailbox")
            .attach("image", testImagePath);

        const res = await agent1.get("/mailboxes");

        expect(res.statusCode).toBe(200);
        expect(res.body.length).toBe(1);
        expect(res.body[0].label).toBe("User1 Mailbox");
    });

    test("does not allow duplicate mailbox label for same user", async () => {
        const agent = await registerAndLogin("marcel", "marcel@test.com");

        await agent
            .post("/mailboxes")
            .field("label", "Room 1")
            .attach("image", testImagePath);

        const res = await agent
            .post("/mailboxes")
            .field("label", "Room 1")
            .attach("image", testImagePath);

        expect(res.statusCode).toBe(400);
    });

    test("allows same mailbox label for different users", async () => {
        const agent1 = await registerAndLogin("user1", "user1@test.com");
        const agent2 = await registerAndLogin("user2", "user2@test.com");

        const res1 = await agent1
            .post("/mailboxes")
            .field("label", "Room 1")
            .attach("image", testImagePath);

        const res2 = await agent2
            .post("/mailboxes")
            .field("label", "Room 1")
            .attach("image", testImagePath);

        expect(res1.statusCode).toBe(201);
        expect(res2.statusCode).toBe(201);
    });
});