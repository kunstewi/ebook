import { expect, test } from "@playwright/test";
import {
  createAuthenticatedPage,
  resetE2EState,
  uniqueId,
} from "./utils/e2eApi";

test.describe("Dashboard and book lifecycle", () => {
  test.beforeEach(async () => {
    await resetE2EState();
  });

  test("shows the empty state and validates required create-book fields", async ({
    browser,
  }) => {
    const { context, page } = await createAuthenticatedPage(browser);

    try {
      await page.goto("/dashboard");
      await expect(page.getByText("No books yet")).toBeVisible();

      await page.getByTestId("dashboard-empty-create-button").click();
      await page.getByTestId("create-book-title-input").fill("Only title");
      await page.getByTestId("create-book-submit-button").click();

      const authorValid = await page
        .getByTestId("create-book-author-input")
        .evaluate(
          (element) => (element as HTMLInputElement).reportValidity()
        );

      expect(authorValid).toBe(false);
      await expect(page.getByTestId("create-book-modal")).toBeVisible();
    } finally {
      await context.close();
    }
  });

  test("creates, lists, navigates, and deletes books from the dashboard", async ({
    browser,
  }) => {
    const { context, page, session } = await createAuthenticatedPage(browser, {
      books: [
        {
          title: `Seeded ${uniqueId("book")}`,
          subtitle: "Ready to edit",
          chapters: [
            {
              title: "Seed Chapter",
              content: "Seed content",
            },
          ],
        },
      ],
    });

    try {
      await page.goto("/dashboard");
      const seededBookId = session.books[0]._id;
      await expect(page.getByTestId(`book-card-${seededBookId}`)).toBeVisible();

      await page.getByTestId("dashboard-new-book-button").click();
      await page
        .getByTestId("create-book-title-input")
        .fill(`Fresh ${uniqueId("new-book")}`);
      await page
        .getByTestId("create-book-subtitle-input")
        .fill("Created from dashboard");
      await page.getByTestId("create-book-author-input").fill("Dashboard User");
      await page.getByTestId("create-book-submit-button").click();

      await expect(page).toHaveURL(/\/editor\//);
      await page.goto("/dashboard");

      await page.getByTestId(`book-card-view-${seededBookId}`).click();
      await expect(page).toHaveURL(new RegExp(`/view-book/${seededBookId}$`));

      await page.goto("/dashboard");
      await page.getByTestId(`book-card-edit-${seededBookId}`).click();
      await expect(page).toHaveURL(new RegExp(`/editor/${seededBookId}$`));

      await page.goto("/dashboard");

      page.once("dialog", (dialog) => dialog.dismiss());
      await page.getByTestId(`book-card-delete-${seededBookId}`).click();
      await expect(page.getByTestId(`book-card-${seededBookId}`)).toBeVisible();

      page.once("dialog", (dialog) => dialog.accept());
      await page.getByTestId(`book-card-delete-${seededBookId}`).click();
      await expect(page.getByTestId(`book-card-${seededBookId}`)).toHaveCount(0);
    } finally {
      await context.close();
    }
  });
});
