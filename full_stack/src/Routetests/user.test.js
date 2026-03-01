import mongoose from "mongoose";
import request from "supertest";
import app from "../app.js";
import { User } from "../models/user.model.js";
import path from "path";

// Use path.resolve to ensure the test finds the file within your project structure
const testImagePath = path.resolve("public/bbcc9dd12f8853ddd37922e1003d913d.jpg");

describe("User Routes - Full Integration Test", () => {
    let accessToken = "";
    let testUserId = "";

    beforeAll(async () => {
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(`${process.env.MONGODB_URI}/videotube_test`);
        }
        // Clean up any existing test user
        await User.deleteOne({ email: "abhishek.test@example.com" });
    }, 30000);

    afterAll(async () => {
        await mongoose.connection.close();
    });

    // 1. REGISTER - Testing this route specifically first
    it("POST /register - Minimalist Test", async () => {
        const res = await request(app)
            .post("/api/v1/users/register")
            .field("username", "abhishek_test")
            .field("email", "abhishek.test@example.com")
            .field("password", "Abhi@123")
            .field("fullname", "Abhishek Maurya") // Matches your lowercase 'n' preference
            .attach("avatar", testImagePath)
            .attach("coverImage", testImagePath);

        // If this still gives 500, check the 'REGISTRATION ERROR' log in your console
        console.log("SERVER RESPONSE:", res.body);
        expect(res.statusCode).toBe(201);
    }, 60000); 
});