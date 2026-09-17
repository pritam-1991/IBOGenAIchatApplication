import { test } from '@playwright/test';

import fs from 'fs';

import { LoginPage } from '../pages/LoginPage';

import { QuestionsPage } from '../pages/QuestionsPage';

import { questions } from '../test-data/questions';


// =====================================================
// TEST TIMEOUTt
// =====================================================

// 100 questions can take a long time.
// Give the complete test enough time.

test.setTimeout(30 * 60 * 1000);


// =====================================================
// REPORT FILE
// =====================================================

const reportPath =
    'reports/question-response-report.json';


// =====================================================
// CREATE REPORT FOLDER
// =====================================================

if (!fs.existsSync('reports')) {

    fs.mkdirSync(
        'reports',
        {
            recursive: true
        }
    );
}


// =====================================================
// START FRESH REPORT
// =====================================================

fs.writeFileSync(
    reportPath,
    JSON.stringify(
        [],
        null,
        4
    )
);


// =====================================================
// MAIN TEST
// =====================================================

test(
    'Ask all questions',
    async ({ page }) => {


        // =============================================
        // STEP 1 - LOGIN
        // =============================================

        const loginPage =
            new LoginPage(page);


        await loginPage.login();


        console.log(
            'Login successful'
        );


        // =============================================
        // STEP 2 - QUESTIONS PAGE
        // =============================================

        const questionsPage =
            new QuestionsPage(page);


        // =============================================
        // STEP 3 - LOOP THROUGH QUESTIONS
        // =============================================

        for (
            const question of questions
        ) {


            console.log('');
            console.log(
                '############################################'
            );

            console.log(
                `RUNNING QUESTION ${question.id}`
            );

            console.log(
                '############################################'
            );


            let response = '';

            let responseCompleted =
                false;


            // =========================================
            // RUN QUESTION
            // =========================================

            try {

                response =
                    await questionsPage.askQuestion(
                        question
                    );


                responseCompleted =
                    true;


            } catch (error) {

                console.log(
                    `Question ${question.id} failed`
                );

                console.log(
                    error.message
                );
            }


            // =========================================
            // CREATE REPORT RECORD
            // =========================================

            const reportData = {

                id:
                    question.id,

                programme:
                    question.programme,

                language:
                    question.language,

                question:
                    question.question,

                response:
                    response,

                responseCompleted:
                    responseCompleted,

                //validation:
                   // 'NOT_VALIDATED',

                timestamp:
                    new Date().toISOString()
            };


            // =========================================
            // READ EXISTING REPORT
            // =========================================

            let reports = [];


            if (
                fs.existsSync(
                    reportPath
                )
            ) {

                try {

                    reports =
                        JSON.parse(
                            fs.readFileSync(
                                reportPath,
                                'utf-8'
                            )
                        );

                } catch (error) {

                    reports = [];
                }
            }


            // =========================================
            // ADD CURRENT QUESTION
            // =========================================

            reports.push(
                reportData
            );


            // =========================================
            // WRITE JSON
            // =========================================

            fs.writeFileSync(
                reportPath,
                JSON.stringify(
                    reports,
                    null,
                    4
                )
            );


            console.log('');
            console.log(
                `Report saved for Question ${question.id}`
            );

            console.log(
                `Response length: ${response.length}`
            );


            // =========================================
            // SMALL WAIT BEFORE NEXT QUESTION
            // =========================================

            await page.waitForTimeout(
                2000
            );
        }


        // =============================================
        // ALL QUESTIONS COMPLETED
        // =============================================

        console.log('');
        console.log(
            '============================================'
        );

        console.log(
            'ALL QUESTIONS COMPLETED'
        );

        console.log(
            `Report: ${reportPath}`
        );

        console.log(
            '============================================'
        );


        // Keep browser open for checking
        await page.pause();
    }
);