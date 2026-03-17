/// <reference types="jest" />
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../../src/models/User";
import { protect } from "../../src/middlewares/authMiddleware";

const createResponse = (): Response =>
  ({
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  } as unknown as Response);

describe("protect middleware", () => {
  it("sets req.user and calls next for a valid bearer token", async () => {
    const req = {
      headers: {
        authorization: "Bearer valid-token",
      },
    } as Request;
    const res = createResponse();
    const next = jest.fn() as NextFunction;
    const select = jest.fn().mockResolvedValue({ _id: "user-1", email: "user@example.com" });

    jest.spyOn(jwt, "verify").mockReturnValue({ id: "user-1" } as never);
    jest.spyOn(User, "findById").mockReturnValue({ select } as never);

    await protect(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith("valid-token", process.env.JWT_SECRET);
    expect(select).toHaveBeenCalledWith("-password");
    expect(req.user).toEqual({ _id: "user-1", email: "user@example.com" });
    expect(next).toHaveBeenCalledTimes(1);
  });

  it("returns 401 when no token is provided", async () => {
    const req = { headers: {} } as Request;
    const res = createResponse();
    const next = jest.fn() as NextFunction;

    await protect(req, res, next);

    expect((res.status as jest.Mock).mock.calls[0][0]).toBe(401);
    expect((res.json as jest.Mock).mock.calls[0][0]).toEqual({
      message: "Not authorized, no token",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 401 when token verification fails", async () => {
    const req = {
      headers: {
        authorization: "Bearer invalid-token",
      },
    } as Request;
    const res = createResponse();
    const next = jest.fn() as NextFunction;

    jest.spyOn(jwt, "verify").mockImplementation(() => {
      throw new Error("invalid token");
    });

    await protect(req, res, next);

    expect((res.status as jest.Mock).mock.calls[0][0]).toBe(401);
    expect((res.json as jest.Mock).mock.calls[0][0]).toEqual({
      message: "Not authorized, token failed",
    });
    expect(next).not.toHaveBeenCalled();
  });
});
