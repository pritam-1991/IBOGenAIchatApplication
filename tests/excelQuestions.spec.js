import { test } from '@playwright/test';

import { LoginPage } from '../pages/LoginPage';
import { QuestionsPage } from '../pages/QuestionsPage';

import { ExcelHelper } from '../utils/ExcelHelper';

test.setTimeout(
    60 * 60 * 1000
);

const inputExcel =
    'test-data/Book1.xlsx';

const outputExcel =
    'results/chatbot-results.xlsx';

ExcelHelper.ensureFolder(
    'results'
);

test(
    'Excel Driven Chatbot Test',
    async ({ page }) => {

        // ============================
        // LOGIN
        // ============================

        const loginPage =
            new LoginPage(page);

        await loginPage.login();

        console.log(
            'Login successful'
        );

        // ============================
        // QUESTIONS PAGE
        // ============================

        const questionsPage =
            new QuestionsPage(page);

        // ============================
        // READ EXCEL
        // ============================

        const questions =
            ExcelHelper.readQuestions(
                inputExcel
            );

        console.log(
            `Questions loaded: ${questions.length}`
        );

        let results = [];

        // ============================
        // LOOP
        // ============================

        for (
            const row of questions
        ) {

            console.log('');
            console.log(
                '================================='
            );

            console.log(
                `Question ID: ${row.id}`
            );

            console.log(
                row.question
            );

            console.log(
                '================================='
            );

            let response = '';

            let status = 'PASS';

            try {

                response =
                    await questionsPage.askQuestion({

                        id:
                            row.id,

                        programme:
                            row.programme,

                        language:
                            row.language,

                        question:
                            row.question
                    });

            } catch (error) {

                status = 'FAIL';

                response =
                    error.message;

                console.log(
                    error.message
                );
            }

            results.push({

                id:
                    row.id,

                programme:
                    row.programme,

                language:
                    row.language,

                question:
                    row.question,

                response:
                    response,

                status:
                    status,

                timestamp:
                    new Date()
                        .toISOString()
            });

            // ============================
            // SAVE AFTER EVERY QUESTION
            // ============================

            ExcelHelper.saveResults(
                outputExcel,
                results
            );

            console.log(
                'Result saved.'
            );

            await page.waitForTimeout(
                2000
            );
        }

        console.log('');
        console.log(
            'ALL QUESTIONS COMPLETED'
        );

        console.log(
            outputExcel
        );

        await page.pause();
    }
);