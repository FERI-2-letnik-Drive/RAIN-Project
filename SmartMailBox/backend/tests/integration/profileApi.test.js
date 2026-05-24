const request = require("supertest");

const {
    setupIntegrationTest,
    clearDatabase,
    teardownIntegrationTest
} = require("../setup/integrationSetup");

let app;

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

async function registerAndLogin(username, email, password = "password123") {
    // agent so we keep credentials (cookies, sessions)
    const agent = request.agent(app);

    await agent
        .post("/users/register")
        .send({
            username,
            email,
            password
        });

    await agent
        .post("/users/login")
        .send({
            username,
            password
        });

    return agent;
}

describe("Profile API", () => {
    test("does not return profile when user is not logged in", async () => {
        const res = await request(app).get("/users/profile");

        expect(res.statusCode).toBe(401);
    });

    test("returns profile for logged-in user", async () => {
        const agent = await registerAndLogin("marcel", "marcel@test.com");

        const res = await agent.get("/users/profile");

        expect(res.statusCode).toBe(200);
        expect(res.body.username).toBe("marcel");
        expect(res.body.email).toBe("marcel@test.com");
        expect(res.body.password).toBeUndefined();
    });

    test("updates profile for logged-in user", async () => {
        const agent = await registerAndLogin("marcel", "marcel@test.com");

        const res = await agent
            .put("/users/profile")
            .send({
                username: "newmarcel",
                email: "newmarcel@test.com"
            });

        expect(res.statusCode).toBe(200);
        expect(res.body.username).toBe("newmarcel");
        expect(res.body.email).toBe("newmarcel@test.com");
        expect(res.body.password).toBeUndefined();
    });

    test("does not update profile when user is not logged in", async () => {
        const res = await request(app)
            .put("/users/profile")
            .send({
                username: "newmarcel",
                email: "newmarcel@test.com"
            });

        expect(res.statusCode).toBe(401);
    });

    test("does not update profile with empty username", async () => {
        const agent = await registerAndLogin("marcel", "marcel@test.com");

        const res = await agent
            .put("/users/profile")
            .send({
                username: "",
                email: "newmarcel@test.com"
            });

        expect(res.statusCode).toBe(400);
    });

    test("does not update profile with empty email", async () => {
        const agent = await registerAndLogin("marcel", "marcel@test.com");

        const res = await agent
            .put("/users/profile")
            .send({
                username: "newmarcel",
                email: ""
            });

        expect(res.statusCode).toBe(400);
    });
});