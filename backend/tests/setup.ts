/// <reference types="jest" />
process.env.JWT_SECRET = process.env.JWT_SECRET || "test-jwt-secret";
process.env.GEMINI_API_KEY = process.env.GEMINI_API_KEY || "test-gemini-key";

import {
  clearTestDatabase,
  connectTestDatabase,
  disconnectTestDatabase,
} from "./helpers/testDatabase";

beforeAll(async () => {
  await connectTestDatabase();
});

afterEach(async () => {
  jest.restoreAllMocks();
  jest.clearAllMocks();
  await clearTestDatabase();
});

afterAll(async () => {
  await disconnectTestDatabase();
});
