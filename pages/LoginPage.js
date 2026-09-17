import { expect } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

export class LoginPage {
    constructor(page) {
        this.page = page;
    }

    async login() {

        // Strip automation indicators before loading pages
        await this.page.addInitScript(() => {
            Object.defineProperty(navigator, 'webdriver', {
                get: () => undefined,
            });
        });

        await this.page.goto('https://genai-assistant-uat.ibo.org');

        await this.page.locator('#username').fill(
            process.env.PLAYWRIGHT_USERNAME
        );

        await this.page.getByRole('link', { name: 'Submit' }).click();

        await this.page.locator('input[name="loginfmt"]').fill(
            process.env.PLAYWRIGHT_USERNAME
        );

        await this.page.getByRole('button', { name: 'Next' }).click();

        await this.page.locator('input[name="passwd"]').fill(
            process.env.PLAYWRIGHT_PASSWORD
        );

        await this.page.getByRole('button', { name: 'Sign in' }).click();

        await this.page.locator('#idSIButton9').click();

        // Wait for Cloudflare Turnstile to resolve (if present)
        await this.waitForTurnstile();

        await expect(
            this.page.getByText('Hey there, how can I help you?')
        ).toBeVisible({ timeout: 60000 });

        console.log('Login successful');
    }

    async waitForTurnstile(timeout = 120000) {
        const start = Date.now();
        while (Date.now() - start < timeout) {
            const isChallengePage = await this.page
                .getByText('Performing security verification')
                .isVisible()
                .catch(() => false);

            if (!isChallengePage) {
                console.log('Cloudflare challenge cleared (or was not present).');
                return;
            }

            console.log('Waiting for Cloudflare Turnstile to resolve...');

            // Try clicking the Turnstile checkbox iframe if it exists
            const turnstileFrame = this.page.frameLocator(
                'iframe[src*="challenges.cloudflare.com"]'
            );
            try {
                await turnstileFrame
                    .locator('input[type="checkbox"], .cb-lb')
                    .click({ timeout: 3000 });
                console.log('Clicked Turnstile checkbox.');
            } catch {
                // No clickable checkbox — it's likely a non-interactive challenge
            }

            await this.page.waitForTimeout(3000);
        }
        throw new Error('Timed out waiting for Cloudflare Turnstile to clear.');
    }
}