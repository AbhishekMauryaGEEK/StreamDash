import request from "supertest";
import app from "../app.js";
import { User } from "../models/user.model.js";

describe("User Routes - Full Integration Test", () => {
    let accessToken = "";
    let testUserId = "";

    // Cleanup and Setup
    beforeAll(async () => {
        await User.deleteOne({ email: "abhishek.test@example.com" });
    });

    // 1. REGISTER
    it("POST /register - Should create user with UUID", async () => {
        const res = await request(app)
            .post("/api/v1/users/register")
            .field("username", "abhishek_dev")
            .field("email", "abhishek.test@example.com")
            .field("password", "Abhi@123")
            .field("fullName", "Abhishek Maurya")
            .attach("avatar", "tests/fixtures/sample-avatar.png");

        expect(res.statusCode).toBe(201);
        expect(res.body.data._id.length).toBe(36); // Verify UUID
        testUserId = res.body.data._id;
    });

    // 2. LOGIN
    it("POST /login - Should return tokens", async () => {
        const res = await request(app)
            .post("/api/v1/users/login")
            .send({ email: "abhishek.test@example.com", password: "Abhi@123" });

        expect(res.statusCode).toBe(200);
        accessToken = res.body.data.accessToken; // Store for private routes
    });

    // 3. GET CURRENT USER
    it("GET /current-user - Should fetch logged-in user profile", async () => {
        const res = await request(app)
            .get("/api/v1/users/current-user")
            .set("Authorization", `Bearer ${accessToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.data.username).toBe("abhishek_dev");
    });

    // 4. UPDATE ACCOUNT DETAILS
    it("PATCH /update-account - Should update name/email", async () => {
        const res = await request(app)
            .patch("/api/v1/users/update-account")
            .set("Authorization", `Bearer ${accessToken}`)
            .send({ fullName: "Abhishek M.", email: "abhishek.new@example.com" });

        expect(res.statusCode).toBe(200);
        expect(res.body.data.fullName).toBe("Abhishek M.");
    });

    // 5. CHANGE PASSWORD
    it("POST /change-password - Should update password", async () => {
        const res = await request(app)
            .post("/api/v1/users/change-password")
            .set("Authorization", `Bearer ${accessToken}`)
            .send({ oldPassword: "Abhi@123", newPassword: "NewSecure@123" });

        expect(res.statusCode).toBe(200);
    });

    // 6. UPDATE AVATAR (File Upload)
    it("PATCH /avatar - Should update profile picture", async () => {
        const res = await request(app)
            .patch("/api/v1/users/avatar")
            .set("Authorization", `Bearer ${accessToken}`)
            .attach("avatar", "tests/fixtures/new-avatar.png");

        expect(res.statusCode).toBe(200);
        expect(res.body.data.avatar).toContain("cloudinary.com"); // Check Cloudinary link
    });

    // 7. GET CHANNEL PROFILE
    it("GET /c/:username - Should fetch public profile", async () => {
        const res = await request(app)
            .get("/api/v1/users/c/abhishek_dev")
            .set("Authorization", `Bearer ${accessToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.data).toHaveProperty("subscribersCount");
    });

    // 8. LOGOUT
    it("POST /logout - Should clear cookies/sessions", async () => {
        const res = await request(app)
            .post("/api/v1/users/logout")
            .set("Authorization", `Bearer ${accessToken}`);

        expect(res.statusCode).toBe(200);
    });
});
