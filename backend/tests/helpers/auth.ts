import jwt, { SignOptions } from "jsonwebtoken";
import { Types } from "mongoose";
import User from "../../src/models/User";

let userCounter = 0;

type CreateUserOverrides = Partial<{
  name: string;
  email: string;
  password: string;
  avatar: string;
  isPro: boolean;
}>;

const nextEmail = (): string => {
  userCounter += 1;
  return `test-user-${Date.now()}-${userCounter}@example.com`;
};

export const createTokenForUserId = (
  userId: Types.ObjectId | string,
  expiresIn: SignOptions["expiresIn"] = "7d"
): string =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET as string, {
    expiresIn,
  });

export const createUserAndToken = async (overrides: CreateUserOverrides = {}) => {
  const password = overrides.password || "Password123!";
  const user = await User.create({
    name: overrides.name || "Test User",
    email: overrides.email || nextEmail(),
    password,
    avatar: overrides.avatar || "",
    isPro: overrides.isPro ?? false,
  });

  return {
    user,
    token: createTokenForUserId(user._id as Types.ObjectId),
    password,
  };
};

export const authHeader = (token: string) => ({
  Authorization: `Bearer ${token}`,
});
