import { expect, test } from "@playwright/test";
import {
  createAuthenticatedPage,
  resetE2EState,
  uniqueId,
} from "./utils/e2eApi";

test.describe("Editor flows", () => {
  test.beforeEach(async () => {
    await resetE2EState();
  });

  test("bootstraps a default chapter, saves edits, and manages chapter list state", async ({
    browser,
  }) => {
    const { context, page, session } = await createAuthenticatedPage(browser, {
      books: [
        {
          title: `Outline ${uniqueId("draft")}`,
          subtitle: "Starts blank",
          chapters: [],
        },
      ],
    });

    try {
      const book = session.books[0];
      await page.goto(`/editor/${book._id}`);

      await expect(page.getByTestId("editor-chapter-title-input")).toHaveValue(
        "Chapter 1"
      );
      await expect(page.getByTestId("editor-chapter-item-0")).toBeVisible();

      await page
        .getByTestId("editor-chapter-title-input")
        .fill("Opening Chapter");
      await page
        .getByTestId("editor-chapter-description-input")
        .fill("Introduces the book");
      await page
        .locator('[data-testid="chapter-content-editor"] textarea')
        .fill("This chapter was saved from Playwright.");
      await page.getByTestId("editor-save-button").click();

      await expect(page.getByText("Book saved successfully!")).toBeVisible();

      await page.reload();
      await expect(page.getByTestId("editor-chapter-title-input")).toHaveValue(
        "Opening Chapter"
      );
      await expect(
        page.getByTestId("editor-chapter-description-input")
      ).toHaveValue("Introduces the book");
      await expect(
        page.locator('[data-testid="chapter-content-editor"] textarea')
      ).toHaveValue("This chapter was saved from Playwright.");

      await page.getByTestId("editor-add-chapter-button").click();
      await expect(page.getByTestId("editor-chapter-item-1")).toBeVisible();

      page.once("dialog", (dialog) => dialog.accept());
      await page.getByTestId("editor-delete-chapter-1").click();
      await expect(page.getByTestId("editor-chapter-item-1")).toHaveCount(0);
      await expect(page.getByTestId(/editor-delete-chapter-\d+/)).toHaveCount(0);
    } finally {
      await context.close();
    }
  });

  test("runs AI actions and toggles publish state", async ({ browser }) => {
    const { context, page, session } = await createAuthenticatedPage(browser, {
      books: [
        {
          title: `AI ${uniqueId("book")}`,
          chapters: [
            {
              title: "AI Chapter",
              description: "Needs help",
              content: "Original content",
            },
          ],
        },
      ],
    });

    try {
      const book = session.books[0];
      await page.goto(`/editor/${book._id}`);

      await page.getByTestId("editor-ai-button").click();
      await page.getByTestId("ai-generate-content-button").click();
      await expect(
        page.locator('[data-testid="chapter-content-editor"] textarea')
      ).toContainText("# AI Chapter");

      await page.getByTestId("editor-ai-button").click();
      await page.getByTestId("ai-improve-grammar-button").click();
      await expect(
        page.locator('[data-testid="chapter-content-editor"] textarea')
      ).toContainText("[grammar]");

      await expect(page.getByTestId("editor-publish-button")).toContainText(
        "Publish"
      );
      await page.getByTestId("editor-publish-button").click();
      await expect(page.getByText("Book published successfully!")).toBeVisible();
      await expect(page.getByTestId("editor-publish-button")).toContainText(
        "Unpublish"
      );
    } finally {
      await context.close();
    }
  });

  test("uploads a cover image and exports PDF, DOCX, and Markdown files", async ({
    browser,
  }) => {
    const { context, page, session } = await createAuthenticatedPage(browser, {
      books: [
        {
          title: "Export Ready Book",
          author: "Playwright",
          chapters: [
            {
              title: "Export Chapter",
              description: "Prepared for export",
              content: "Exportable content",
            },
          ],
        },
      ],
    });

    try {
      const book = session.books[0];
      await page.goto(`/editor/${book._id}`);

      await page.getByTestId("editor-cover-input").setInputFiles({
        name: "cover.png",
        mimeType: "image/png",
        buffer: Buffer.from("fake-png-content"),
      });

      await expect(page.getByText("Cover image updated!")).toBeVisible();
      await expect(page.getByTestId("editor-cover-image")).toHaveAttribute(
        "src",
        /\/uploads\//
      );

      await page.goto("/dashboard");
      await expect(
        page.locator(`[data-testid="book-card-${book._id}"] img`)
      ).toHaveAttribute("src", /\/uploads\//);

      await page.goto(`/editor/${book._id}`);

      const exportCases = [
        {
          button: "export-pdf-button",
          filename: "Export_Ready_Book.pdf",
          contentType: /application\/pdf/,
          path: /\/api\/export\/pdf\//,
        },
        {
          button: "export-docx-button",
          filename: "Export_Ready_Book.docx",
          contentType:
            /application\/vnd\.openxmlformats-officedocument\.wordprocessingml\.document/,
          path: /\/api\/export\/docx\//,
        },
        {
          button: "export-markdown-button",
          filename: "Export_Ready_Book.md",
          contentType: /text\/markdown/,
          path: /\/api\/export\/markdown\//,
        },
      ] as const;

      for (const exportCase of exportCases) {
        await page.getByTestId("editor-export-button").click();

        const downloadPromise = page.waitForEvent("download");
        const responsePromise = page.waitForResponse((response) =>
          exportCase.path.test(response.url())
        );

        await page.getByTestId(exportCase.button).click();

        const [download, response] = await Promise.all([
          downloadPromise,
          responsePromise,
        ]);

        expect(download.suggestedFilename()).toBe(exportCase.filename);
        expect(response.headers()["content-type"]).toMatch(exportCase.contentType);
      }
    } finally {
      await context.close();
    }
  });
});
