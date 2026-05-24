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

async function registerUser(username, email, password = "password123") {
    return await request(app)
        .post("/users/register")
        .send({
            username,
            email,
            password
        });
}

describe("User auth API", () => {
    test("registers a new user", async () => {
        const res = await registerUser("marcel", "marcel@test.com");

        expect(res.statusCode).toBe(201);
        expect(res.body.username).toBe("marcel");
        expect(res.body.email).toBe("marcel@test.com");
        expect(res.body.password).toBeUndefined();
    });

    test("logs in existing user", async () => {
        await registerUser("marcel", "marcel@test.com");

        const res = await request(app)
            .post("/users/login")
            .send({
                username: "marcel",
                password: "password123"
            });

        expect(res.statusCode).toBe(200);
        expect(res.body.username).toBe("marcel");
        expect(res.body.email).toBe("marcel@test.com");
    });

    test("does not login with wrong password", async () => {
        await registerUser("marcel", "marcel@test.com");

        const res = await request(app)
            .post("/users/login")
            .send({
                username: "marcel",
                password: "wrongpassword"
            });

        expect(res.statusCode).toBe(401);
    });
});