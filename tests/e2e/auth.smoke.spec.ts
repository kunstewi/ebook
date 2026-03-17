import { expect, test } from "@playwright/test";
import { resetE2EState, seedSession, uniqueEmail } from "./utils/e2eApi";

test.describe("Authentication flow", () => {
  test.beforeEach(async () => {
    await resetE2EState();
  });

  test("@smoke signs up, logs out, and logs back in", async ({ page }) => {
    const email = uniqueEmail("signup");
    const password = "Password123!";

    await page.goto("/signup");
    await page.getByTestId("signup-name-input").fill("Smoke User");
    await page.getByTestId("signup-email-input").fill(email);
    await page.getByTestId("signup-password-input").fill(password);
    await page.getByTestId("signup-confirm-password-input").fill(password);
    await page.getByTestId("signup-submit-button").click();

    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByRole("heading", { name: "My Books" })).toBeVisible();

    await page.getByTestId("navbar-logout-button").click();
    await expect(page).toHaveURL(/\/login$/);

    await page.goto("/login");
    await page.getByTestId("login-email-input").fill(email);
    await page.getByTestId("login-password-input").fill(password);
    await page.getByTestId("login-submit-button").click();

    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByTestId("navbar-logout-button")).toBeVisible();
  });

  test("@smoke shows auth validation and invalid-login feedback", async ({
    page,
  }) => {
    const existingUser = await seedSession({
      user: {
        email: uniqueEmail("login"),
        password: "Password123!",
        name: "Existing User",
      },
    });

    await page.goto("/signup");
    await page.getByTestId("signup-name-input").fill("Validation User");
    await page.getByTestId("signup-email-input").fill(uniqueEmail("mismatch"));
    await page.getByTestId("signup-password-input").fill("Password123!");
    await page
      .getByTestId("signup-confirm-password-input")
      .fill("Different123!");
    await page.getByTestId("signup-submit-button").click();

    await expect(page.getByText("Passwords do not match")).toBeVisible();
    await expect(page).toHaveURL(/\/signup$/);

    await page.goto("/login");
    await page.getByTestId("login-email-input").fill(existingUser.user.email);
    await page.getByTestId("login-password-input").fill("WrongPassword!");
    await page.getByTestId("login-submit-button").click();

    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByTestId("login-submit-button")).toBeVisible();
  });
});
