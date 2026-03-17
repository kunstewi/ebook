# Playwright E2E Tests

This workspace contains the end-to-end suite for the eBook project.

## Current Status

- `19` Playwright tests are implemented and passing.
- Chromium runs the full product coverage.
- Firefox and WebKit run smoke coverage tagged with `@smoke`.

## How It Runs

- The suite starts a dedicated e2e backend with `npm run test:e2e` in [`/Users/kanai/Projects/ebook/backend`](/Users/kanai/Projects/ebook/backend).
- That backend is an in-memory Express server built specifically for deterministic browser tests.
- The frontend dev server is started with `VITE_API_BASE_URL=http://127.0.0.1:8000/api`.
- `globalSetup` resets the e2e state before the test run.

## Commands

```bash
# from this directory
npm run test:e2e

# full chromium coverage
npm run test:e2e -- --project=chromium

# all configured projects (chromium full + firefox/webkit smoke)
npm run test:e2e -- --reporter=line

# show the discovered test list
npm run test:e2e -- --list
```

## Test Structure

- `e2e/auth.smoke.spec.ts`
  - signup, login, invalid auth flows
- `e2e/public.smoke.spec.ts`
  - public landing-page and protected-route smoke coverage
- `e2e/dashboard.spec.ts`
  - dashboard and book lifecycle
- `e2e/editor.spec.ts`
  - editor, AI, upload, and export flows
- `e2e/reader-profile.spec.ts`
  - reader and profile settings flows
- `e2e/utils/e2eApi.ts`
  - seed/reset helpers, auth-state helpers, storage-state creation

## Data and Fixtures

- Tests use `/api/test/reset` before each spec to keep runs order-independent.
- Seed data is created through `/api/test/seed`.
- Authenticated flows use helper-created local storage or storage state instead of UI login setup when that keeps tests faster and more deterministic.
- Cover upload tests use an in-memory file payload rather than a checked-in fixture image.

## Browser Strategy

- `chromium`
  - full suite, required target
- `firefox`
  - smoke only
- `webkit`
  - smoke only

## Notes

- The e2e backend intentionally mocks AI and export behavior just enough to validate browser flows without external dependencies.
- If you want CI to exercise the real backend stack, keep the test shapes and swap the backend startup strategy rather than rewriting the specs.
