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
    const agent = request.agent(app);

    await agent.post("/users/register").send({
        username,
        email,
        password
    });

    await agent.post("/users/login").send({
        username,
        password
    });

    return agent;
}

describe("Change password API", () => {
    test("requires login", async () => {
        const res = await request(app)
            .put("/users/password")
            .send({
                currentPassword: "oldpassword",
                newPassword: "newpassword",
                confirmPassword: "newpassword"
            });

        expect(res.statusCode).toBe(401);
    });

    test("fails when current password is wrong", async () => {
        const agent = await registerAndLogin("marcel", "marcel@test.com", "oldpassword");

        const res = await agent.put("/users/password").send({
            currentPassword: "wrongpassword",
            newPassword: "newpassword",
            confirmPassword: "newpassword"
        });

        expect(res.statusCode).toBe(400);
    });

    test("fails when new password and confirm password do not match", async () => {
        const agent = await registerAndLogin("marcel", "marcel@test.com", "oldpassword");

        const res = await agent.put("/users/password").send({
            currentPassword: "oldpassword",
            newPassword: "newpassword",
            confirmPassword: "differentpassword"
        });

        expect(res.statusCode).toBe(400);
    });

    test("changes password successfully", async () => {
        const agent = await registerAndLogin("marcel", "marcel@test.com", "oldpassword");

        const changeRes = await agent.put("/users/password").send({
            currentPassword: "oldpassword",
            newPassword: "newpassword",
            confirmPassword: "newpassword"
        });

        expect(changeRes.statusCode).toBe(200);

        const oldLogin = await request(app).post("/users/login").send({
            username: "marcel",
            password: "oldpassword"
        });

        expect(oldLogin.statusCode).toBe(401);

        const newLogin = await request(app).post("/users/login").send({
            username: "marcel",
            password: "newpassword"
        });

        expect(newLogin.statusCode).toBe(200);
    });
});