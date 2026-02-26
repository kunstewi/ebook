import jwt from "jsonwebtoken";
import User from "../models/User";
import { Request, Response, NextFunction } from "express";

export const protect = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);

      // Get user from token
      req.user = await User.findById(decoded.id).select("-password");

      next();
    } catch (error) {
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};

// Export handled by inline export const
