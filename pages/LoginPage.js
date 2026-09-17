import { expect } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

export class LoginPage {
    constructor(page) {
        this.page = page;
    }

    async login() {

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

        await expect(
            this.page.getByText('Hey there, how can I help you?')
        ).toBeVisible({ timeout: 60000 });

        console.log('Login successful');
    }
}