/// <reference types="jest" />
import fs from "fs";
import path from "path";
import request from "supertest";
import mongoose from "mongoose";
import app from "../../src/app";

describe("App integration", () => {
  it("connects to the in-memory MongoDB database", () => {
    expect(mongoose.connection.readyState).toBe(1);
  });

  it("returns 404 for an unknown API route", async () => {
    const response = await request(app).get("/api/this-route-does-not-exist");

    expect(response.status).toBe(404);
  });

  it("handles CORS preflight with the expected headers", async () => {
    const response = await request(app)
      .options("/api/auth/login")
      .set("Origin", "http://example.com")
      .set("Access-Control-Request-Method", "POST")
      .set("Access-Control-Request-Headers", "Authorization, Content-Type");

    expect([200, 204]).toContain(response.status);
    expect(response.headers["access-control-allow-origin"]).toBe("*");
    expect(response.headers["access-control-allow-methods"]).toContain("POST");
    expect(response.headers["access-control-allow-headers"]).toContain(
      "Authorization"
    );
  });

  it("serves files from the uploads directory", async () => {
    const uploadsDir = path.join(__dirname, "../../uploads");
    const filename = `test-static-${Date.now()}.txt`;
    const filePath = path.join(uploadsDir, filename);
    const fileContents = "served by express static";

    fs.writeFileSync(filePath, fileContents);

    try {
      const response = await request(app).get(`/uploads/${filename}`);

      expect(response.status).toBe(200);
      expect(response.text).toBe(fileContents);
    } finally {
      fs.unlinkSync(filePath);
    }
  });

  it("returns 404 when an uploaded file does not exist", async () => {
    const response = await request(app).get("/uploads/does-not-exist.txt");

    expect(response.status).toBe(404);
  });
});
