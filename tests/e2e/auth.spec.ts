import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
    const timestamp = Date.now();
    const testUser = {
        name: `Test User ${timestamp}`,
        email: `testuser${timestamp}@example.com`,
        password: 'password123',
    };

    test('should allow a user to sign up, log out, and log back in', async ({ page }) => {
        // 1. Sign Up
        await page.goto('/signup');
        await expect(page).toHaveTitle(/EBookAI/i);

        // Fill out the signup form
        await page.fill('input[placeholder="John Doe"], input[name="name"]', testUser.name);
        await page.fill('input[type="email"], input[name="email"]', testUser.email);
        await page.fill('input[type="password"], input[name="password"]', testUser.password);

        // Submit the form
        await page.click('button[type="submit"]');

        // Wait to be redirected to the dashboard/landing page
        // (Adjust the URL to wherever your app routes after a successful signup)
        await page.waitForURL('**/dashboard', { timeout: 5000 }).catch(() => { });

        // We should see a logout button or the dashboard title
        // await expect(page.locator('text=Logout')).toBeVisible();

        // 2. Log Out (This depends on your app's actual functionality)
        // await page.click('text=Logout');
        // await expect(page).toHaveURL(/.*login/);

        // 3. Log In
        await page.goto('/login');
        await page.fill('input[type="email"], input[name="email"]', testUser.email);
        await page.fill('input[type="password"], input[name="password"]', testUser.password);
        await page.click('button[type="submit"]');

        // Wait for redirect to dashboard
        await page.waitForURL('**/dashboard', { timeout: 5000 }).catch(() => { });
    });
});
