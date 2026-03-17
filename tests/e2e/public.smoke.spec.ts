import { expect, test } from "@playwright/test";
import { resetE2EState, seedSession, uniqueId } from "./utils/e2eApi";

test.describe("Public routing", () => {
  test.beforeEach(async () => {
    await resetE2EState();
  });

  test("@smoke renders public routes and redirects protected pages to login", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: "Create Beautiful eBooks" })
    ).toBeVisible();

    await page.getByTestId("landing-hero-signup").click();
    await expect(page).toHaveURL(/\/signup$/);

    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login$/);
    await expect(
      page.getByRole("heading", { name: "Welcome Back" })
    ).toBeVisible();
  });

  test("@smoke shows published books and sends unauthenticated readers to login", async ({
    page,
  }) => {
    const seeded = await seedSession({
      books: [
        {
          title: `Public Book ${uniqueId("public")}`,
          status: "published",
          chapters: [
            {
              title: "Public Chapter",
              description: "A public chapter",
              content: "Readable public content",
            },
          ],
        },
      ],
    });

    const [book] = seeded.books;

    await page.goto("/");
    await expect(
      page.getByTestId(`public-book-title-${book._id}`)
    ).toHaveText(book.title);

    page.once("dialog", (dialog) => dialog.accept());
    await page.getByTestId(`public-book-card-${book._id}`).click();

    await expect(page).toHaveURL(/\/login$/);
  });
});
