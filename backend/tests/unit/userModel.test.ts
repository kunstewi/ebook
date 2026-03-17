/// <reference types="jest" />
import bcrypt from "bcrypt";
import User from "../../src/models/User";

describe("User model", () => {
  it("hashes the password on save", async () => {
    const user = await User.create({
      name: "Hash User",
      email: "hash-user@example.com",
      password: "Password123!",
    });

    expect(user.password).not.toBe("Password123!");
    expect(await bcrypt.compare("Password123!", user.password)).toBe(true);
  });

  it("does not rehash the password when it is unchanged", async () => {
    const user = await User.create({
      name: "Stable Hash",
      email: "stable-hash@example.com",
      password: "Password123!",
    });
    const originalHash = user.password;

    user.name = "Updated Name";
    await user.save();

    expect(user.password).toBe(originalHash);
  });

  it("matches the correct password and rejects an incorrect one", async () => {
    const user = await User.create({
      name: "Compare User",
      email: "compare-user@example.com",
      password: "Password123!",
    });

    await expect(user.matchPassword("Password123!")).resolves.toBe(true);
    await expect(user.matchPassword("WrongPassword123!")).resolves.toBe(false);
  });

  it("enforces unique email addresses", async () => {
    await User.init();
    await User.create({
      name: "Original User",
      email: "unique-user@example.com",
      password: "Password123!",
    });

    await expect(
      User.create({
        name: "Duplicate User",
        email: "unique-user@example.com",
        password: "Password123!",
      })
    ).rejects.toMatchObject({ code: 11000 });
  });
});
