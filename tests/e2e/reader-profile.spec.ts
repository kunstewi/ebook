import { expect, test } from "@playwright/test";
import {
  createAuthenticatedPage,
  resetE2EState,
  uniqueEmail,
  uniqueId,
} from "./utils/e2eApi";

test.describe("Reader and profile flows", () => {
  test.beforeEach(async () => {
    await resetE2EState();
  });

  test("shows the no-content reader state and chapter navigation", async ({
    browser,
  }) => {
    const emptyBookSession = await createAuthenticatedPage(browser, {
      books: [
        {
          title: `Empty ${uniqueId("reader")}`,
          chapters: [],
        },
      ],
    });

    try {
      const emptyBook = emptyBookSession.session.books[0];
      await emptyBookSession.page.goto(`/view-book/${emptyBook._id}`);
      await expect(emptyBookSession.page.getByText("No content yet")).toBeVisible();
    } finally {
      await emptyBookSession.context.close();
    }

    await resetE2EState();

    const fullBookSession = await createAuthenticatedPage(browser, {
      books: [
        {
          title: `Reader ${uniqueId("book")}`,
          chapters: [
            {
              title: "Chapter One",
              description: "First",
              content: "Content one",
            },
            {
              title: "Chapter Two",
              description: "Second",
              content: "Content two",
            },
          ],
        },
      ],
    });

    try {
      const fullBook = fullBookSession.session.books[0];
      await fullBookSession.page.goto(`/view-book/${fullBook._id}`);

      await expect(
        fullBookSession.page.getByRole("heading", { name: "Chapter One" })
      ).toBeVisible();
      await fullBookSession.page.getByTestId("view-book-next-button").click();
      await expect(
        fullBookSession.page.getByRole("heading", { name: "Chapter Two" })
      ).toBeVisible();
      await fullBookSession.page.getByTestId("view-book-previous-button").click();
      await expect(
        fullBookSession.page.getByRole("heading", { name: "Chapter One" })
      ).toBeVisible();
      await fullBookSession.page.getByTestId("view-book-chapter-1").click();
      await expect(
        fullBookSession.page.getByRole("heading", { name: "Chapter Two" })
      ).toBeVisible();
    } finally {
      await fullBookSession.context.close();
    }
  });

  test("updates profile details, validates password confirmation, and logs in with the new password", async ({
    browser,
    page,
  }) => {
    const email = uniqueEmail("profile");
    const originalPassword = "OldPassword123!";
    const newPassword = "NewPassword123!";
    const { context } = await createAuthenticatedPage(browser, {
      user: {
        email,
        password: originalPassword,
        name: "Profile User",
      },
    });

    try {
      const authenticatedPage = await context.newPage();
      await authenticatedPage.goto("/profile");

      await expect(authenticatedPage.getByTestId("profile-email-input")).toHaveValue(
        email
      );

      await authenticatedPage.getByTestId("profile-edit-button").click();
      await authenticatedPage
        .getByTestId("profile-name-input")
        .fill("Profile User Updated");
      await authenticatedPage
        .getByTestId("profile-avatar-input")
        .fill("https://example.com/avatar.png");
      await authenticatedPage
        .getByTestId("profile-password-input")
        .fill(newPassword);
      await authenticatedPage
        .getByTestId("profile-confirm-password-input")
        .fill("Mismatch123!");
      await authenticatedPage.getByTestId("profile-save-button").click();

      await expect(
        authenticatedPage.getByText("Passwords do not match")
      ).toBeVisible();

      await authenticatedPage
        .getByTestId("profile-confirm-password-input")
        .fill(newPassword);
      await authenticatedPage.getByTestId("profile-save-button").click();

      await expect(
        authenticatedPage.getByText("Profile updated successfully!")
      ).toBeVisible();
      await expect(authenticatedPage.getByTestId("profile-edit-button")).toBeVisible();

      await authenticatedPage.getByTestId("navbar-logout-button").click();
      await expect(authenticatedPage).toHaveURL(/\/login$/);
    } finally {
      await context.close();
    }

    await page.goto("/login");
    await page.getByTestId("login-email-input").fill(email);
    await page.getByTestId("login-password-input").fill(originalPassword);
    await page.getByTestId("login-submit-button").click();
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByTestId("login-submit-button")).toBeVisible();

    await page.waitForLoadState("networkidle");
    await page.getByTestId("login-email-input").fill(email);
    await page.getByTestId("login-password-input").fill(newPassword);
    await page.getByTestId("login-submit-button").click();
    await expect(page).toHaveURL(/\/dashboard$/);
  });
});
