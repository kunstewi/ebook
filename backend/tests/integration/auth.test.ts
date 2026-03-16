/// <reference types="jest" />
import jwt from "jsonwebtoken";
import { Types } from "mongoose";
import request from "supertest";
import app from "../../src/app";
import User from "../../src/models/User";
import { authHeader, createTokenForUserId, createUserAndToken } from "../helpers/auth";

describe("Auth API integration", () => {
  describe("POST /api/auth/register", () => {
    it("registers a user and returns a token", async () => {
      const response = await request(app).post("/api/auth/register").send({
        name: "Ada Lovelace",
        email: "ada@example.com",
        password: "Password123!",
      });

      const createdUser = await User.findOne({ email: "ada@example.com" }).select(
        "+password"
      );

      expect(response.status).toBe(201);
      expect(response.body.message).toBe("User registered successfully");
      expect(response.body.token).toEqual(expect.any(String));
      expect(createdUser).toBeTruthy();
      expect(createdUser?.password).not.toBe("Password123!");
    });

    it("returns 400 when required fields are missing", async () => {
      const response = await request(app).post("/api/auth/register").send({
        email: "ada@example.com",
        password: "Password123!",
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Please fill all fields");
    });

    it("returns 400 when the email already exists", async () => {
      await createUserAndToken({ email: "duplicate@example.com" });

      const response = await request(app).post("/api/auth/register").send({
        name: "Existing User",
        email: "duplicate@example.com",
        password: "Password123!",
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("User already exists");
    });

    it("returns 500 when the database lookup fails", async () => {
      jest.spyOn(User, "findOne").mockRejectedValueOnce(new Error("db exploded"));

      const response = await request(app).post("/api/auth/register").send({
        name: "Failure Case",
        email: "failure@example.com",
        password: "Password123!",
      });

      expect(response.status).toBe(500);
      expect(response.body.message).toBe("Server error");
    });
  });

  describe("POST /api/auth/login", () => {
    it("logs in successfully and returns token plus user payload", async () => {
      const { password } = await createUserAndToken({
        email: "login@example.com",
        name: "Login User",
      });

      const response = await request(app).post("/api/auth/login").send({
        email: "login@example.com",
        password,
      });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Login successful");
      expect(response.body.token).toEqual(expect.any(String));
      expect(response.body.user).toMatchObject({
        name: "Login User",
        email: "login@example.com",
      });
      expect(response.body.user.password).toBeUndefined();
    });

    it("returns 400 when email or password is missing", async () => {
      const response = await request(app).post("/api/auth/login").send({
        email: "login@example.com",
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Please provide email and password");
    });

    it("returns 401 when the email does not exist", async () => {
      const response = await request(app).post("/api/auth/login").send({
        email: "missing@example.com",
        password: "Password123!",
      });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Invalid credentials");
    });

    it("returns 401 when the password is wrong", async () => {
      await createUserAndToken({ email: "wrong-pass@example.com" });

      const response = await request(app).post("/api/auth/login").send({
        email: "wrong-pass@example.com",
        password: "totally-wrong",
      });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Invalid credentials");
    });

    it("returns 500 when user lookup fails", async () => {
      jest.spyOn(User, "findOne").mockImplementationOnce(() => {
        throw new Error("db exploded");
      });

      const response = await request(app).post("/api/auth/login").send({
        email: "error@example.com",
        password: "Password123!",
      });

      expect(response.status).toBe(500);
      expect(response.body.message).toBe("Server error");
    });
  });

  describe("GET /api/auth/profile", () => {
    it("returns the authenticated user profile", async () => {
      const { token, user } = await createUserAndToken({
        name: "Profile User",
        email: "profile@example.com",
        avatar: "https://example.com/avatar.png",
      });

      const response = await request(app)
        .get("/api/auth/profile")
        .set(authHeader(token));

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        id: String(user._id),
        name: "Profile User",
        email: "profile@example.com",
        avatar: "https://example.com/avatar.png",
        isPro: false,
      });
    });

    it("returns 401 when no token is provided", async () => {
      const response = await request(app).get("/api/auth/profile");

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Not authorized, no token");
    });

    it("returns 401 when the token is malformed", async () => {
      const response = await request(app)
        .get("/api/auth/profile")
        .set(authHeader("not-a-real-jwt"));

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Not authorized, token failed");
    });

    it("returns 401 when the token is expired", async () => {
      const expiredToken = jwt.sign(
        { id: new Types.ObjectId() },
        process.env.JWT_SECRET as string,
        { expiresIn: "0s" }
      );

      const response = await request(app)
        .get("/api/auth/profile")
        .set(authHeader(expiredToken));

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Not authorized, token failed");
    });

    it("returns 404 when the user no longer exists", async () => {
      const token = createTokenForUserId(new Types.ObjectId());

      const response = await request(app)
        .get("/api/auth/profile")
        .set(authHeader(token));

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("User not found");
    });

    it("returns 500 when fetching the profile fails", async () => {
      const { token, user } = await createUserAndToken();
      const select = jest.fn().mockResolvedValue({
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        isPro: user.isPro,
      });

      jest
        .spyOn(User, "findById")
        .mockReturnValueOnce({ select } as never)
        .mockRejectedValueOnce(new Error("db exploded"));

      const response = await request(app)
        .get("/api/auth/profile")
        .set(authHeader(token));

      expect(response.status).toBe(500);
      expect(response.body.message).toBe("Server error");
    });
  });

  describe("PUT /api/auth/profile", () => {
    it("updates the authenticated user's name and avatar", async () => {
      const { token, user } = await createUserAndToken({
        name: "Before Update",
      });

      const response = await request(app)
        .put("/api/auth/profile")
        .set(authHeader(token))
        .send({
          name: "After Update",
          avatar: "https://example.com/new-avatar.png",
        });

      const updatedUser = await User.findById(user._id);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Profile updated successfully");
      expect(response.body.user).toMatchObject({
        id: String(user._id),
        name: "After Update",
        email: user.email,
        avatar: "https://example.com/new-avatar.png",
      });
      expect(updatedUser?.name).toBe("After Update");
      expect(updatedUser?.avatar).toBe("https://example.com/new-avatar.png");
    });

    it("updates the password and allows login with the new password", async () => {
      const { token, user } = await createUserAndToken({
        email: "password-reset@example.com",
        password: "OldPassword123!",
      });

      const updateResponse = await request(app)
        .put("/api/auth/profile")
        .set(authHeader(token))
        .send({
          password: "NewPassword123!",
        });

      const oldLoginResponse = await request(app).post("/api/auth/login").send({
        email: user.email,
        password: "OldPassword123!",
      });

      const newLoginResponse = await request(app).post("/api/auth/login").send({
        email: user.email,
        password: "NewPassword123!",
      });

      expect(updateResponse.status).toBe(200);
      expect(oldLoginResponse.status).toBe(401);
      expect(newLoginResponse.status).toBe(200);
      expect(newLoginResponse.body.message).toBe("Login successful");
    });

    it("returns 401 when no token is provided", async () => {
      const response = await request(app).put("/api/auth/profile").send({
        name: "Unauthorized",
      });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Not authorized, no token");
    });

    it("returns 404 when the user no longer exists", async () => {
      const token = createTokenForUserId(new Types.ObjectId());

      const response = await request(app)
        .put("/api/auth/profile")
        .set(authHeader(token))
        .send({
          name: "Ghost User",
        });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("User not found");
    });

    it("returns 500 when saving the updated profile fails", async () => {
      const { token } = await createUserAndToken();

      jest
        .spyOn(User.prototype, "save")
        .mockRejectedValueOnce(new Error("save exploded"));

      const response = await request(app)
        .put("/api/auth/profile")
        .set(authHeader(token))
        .send({
          name: "This will fail",
        });

      expect(response.status).toBe(500);
      expect(response.body.message).toBe("Server error");
    });
  });
});
