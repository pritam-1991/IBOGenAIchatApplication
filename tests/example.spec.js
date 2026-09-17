import { test, expect } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

test('GenAI Application - Login', async ({ page }) => {

    // Step 1: Open GenAI application
await page.goto('https://genai-assistant-sit.ibo.org/home');

// Step 2: Wait for SSO username field
await page.locator('#username').waitFor({
    timeout: 30000
});

// Step 3: Enter username
await page.locator('#username').fill(
    process.env.PLAYWRIGHT_USERNAME
);
    // Step 4: Click Next
    await page.getByRole('link', { name: 'Submit' }).click();

    // Step 2.1: Wait for Microsoft username field again
await page.locator('input[name="loginfmt"]').waitFor({
    timeout: 30000
});
//Step 3.1: Enter username again
await page.locator('input[name="loginfmt"]').fill(
    process.env.PLAYWRIGHT_USERNAME
);

// Step 4: Click Next again
await page.getByRole('button', { name: 'Next' }).click();

    // Step 5: Wait for password field
    await page.locator('input[name="passwd"]').waitFor({
        timeout: 30000
    });

    // Step 6: Enter password
    await page.locator('input[name="passwd"]').fill(
        process.env.PLAYWRIGHT_PASSWORD
    );

    // Step 7: Click Sign in
    await page.getByRole('button', { name: 'Sign in' }).click();

    /// Step 11: Stay signed in -> Click Yes
    await page.locator('#idSIButton9').waitFor({
        state: 'visible',
        timeout: 10000
    });

    await expect(
        page.locator('#idSIButton9')
    ).toHaveValue('Yes');

    await page.locator('#idSIButton9').click();

    console.log('Clicked Stay signed in - Yes');

    // Step 12: Wait for GenAI application
    await page.waitForURL(
        'https://genai-assistant-sit.ibo.org/',
        {
            timeout: 60000
        }
    );

    // Step 13: Verify application URL
    await expect(page).toHaveURL(
        'https://genai-assistant-sit.ibo.org/'
    );

    // Step 14: Verify home page
    await expect(
        page.getByText('Hey there, how can I help you?')
    ).toBeVisible();

    console.log('Login successful');

    // Step 15: Keep browser open
   // await new Promise(() => {});
// Step 16: Locate Ask Anything textbox
const questionBox = page.locator('#askAnythingTextarea');

await expect(questionBox).toBeVisible({
    timeout: 30000
});

console.log('Question textbox is visible');
    

    // Step 17: Enter Question 1
await questionBox.fill(
    'Quels sont les niveaux de compétences linguistiques attendus for the PEI ?'
);

console.log('Question entered successfully');

// Step 18: Locate Send button
const sendButton = page.locator('img[alt="Send button"]');

await expect(sendButton).toBeVisible({
    timeout: 30000
});

console.log('Send button is visible');
// Step 19: Click Send button
await sendButton.click();

console.log('Question submitted successfully');
 //Step 15: Keep browser open
    await page.pause();
});
