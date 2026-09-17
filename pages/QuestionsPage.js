import { expect } from '@playwright/test';

export class QuestionsPage {

    constructor(page) {

        this.page = page;

        // =====================================================
        // PROGRAMME FILTERS
        // =====================================================

        this.allProgrammeButton = page.getByRole('button', {
            name: /All programmes/
        });

        this.pypButton = page.getByRole('button', {
            name: /^PYP$/
        });

        this.mypButton = page.getByRole('button', {
            name: /^MYP$/
        });

        this.dpButton = page.getByRole('button', {
            name: /^DP$/
        });

        this.cpButton = page.getByRole('button', {
            name: /^CP$/
        });


        // =====================================================
        // LANGUAGE FILTER
        // =====================================================

        this.languageButton = page.getByRole('button', {
            name: /Edit$/
        });


        // =====================================================
        // APPLY FILTER
        // =====================================================

        this.applyFilterButton = page.getByRole('button', {
            name: 'Apply filter'
        });


        // =====================================================
        // QUESTION BOX
        // =====================================================

        this.questionBox = page.getByPlaceholder(
            'Ask anything...'
        );


        // =====================================================
        // SEND BUTTON
        // =====================================================

        this.sendButton = page.locator(
            'img[alt="Send button"]'
        );


        // =====================================================
        // RESPONSE COMPLETED
        // =====================================================

        this.responseCompletedText = page.getByText(
            'How was this answer?',
            {
                exact: false
            }
        );
    }


    // =====================================================
    // SELECT PROGRAMME
    // =====================================================

    async selectProgramme(programme) {

        console.log(`Selecting programme: ${programme}`);

        let programmeButton;

        switch (programme) {

            case 'All':
                programmeButton = this.allProgrammeButton;
                break;

            case 'PYP':
                programmeButton = this.pypButton;
                break;

            case 'MYP':
                programmeButton = this.mypButton;
                break;

            case 'DP':
                programmeButton = this.dpButton;
                break;

            case 'CP':
                programmeButton = this.cpButton;
                break;

            default:
                throw new Error(
                    `Unsupported programme: ${programme}`
                );
        }

        await programmeButton.waitFor({
            state: 'visible',
            timeout: 30000
        });

        await programmeButton.click();

        console.log(
            `Programme selected: ${programme}`
        );
    }


    // =====================================================
    // LANGUAGE MAP
    // =====================================================

    getLanguageOption(language) {

        const languageMap = {

            'All': 'All languages',

            'English': 'English (English)',

            'French': 'Français (French)',

            'Spanish': 'Español (Spanish)',

            'German': 'Deutsch (German)',

            'Bahasa': 'Bahasa Indonesia (Bahasa)',

            'Arabic': 'العربية (Arabic)',

            'Chinese': '中文 (Chinese)',

            'Japanese': '日本語 (Japanese)',

            'Korean': '한국어 (Korean)',

            'Portuguese': 'Português (Portuguese)'
        };

        const optionText =
            languageMap[language];

        if (!optionText) {

            throw new Error(
                `Unsupported language: ${language}`
            );
        }

        return this.page.getByText(
            optionText,
            {
                exact: true
            }
        );
    }


    // =====================================================
    // SELECT LANGUAGE
    // =====================================================

    async selectLanguage(language) {

        console.log(
            `Selecting language: ${language}`
        );


        // -------------------------------------------------
        // ALL LANGUAGE
        // -------------------------------------------------

        if (language === 'All') {

            console.log(
                'Language = All'
            );

            console.log(
                'Keeping default All languages filter'
            );

            return;
        }


        // -------------------------------------------------
        // OPEN LANGUAGE FILTER
        // -------------------------------------------------

        const languageButton =
            this.page.getByRole('button', {
                name: /Edit$/
            });

        await languageButton.waitFor({
            state: 'visible',
            timeout: 30000
        });

        await languageButton.click();

        console.log(
            'Language popup opened'
        );


        // -------------------------------------------------
        // SELECT LANGUAGE
        // -------------------------------------------------

        const languageOption =
            this.getLanguageOption(language);

        await languageOption.waitFor({
            state: 'visible',
            timeout: 30000
        });

        await languageOption.click();

        console.log(
            `Language selected: ${language}`
        );


        // -------------------------------------------------
        // APPLY
        // -------------------------------------------------

        await this.applyFilterButton.waitFor({
            state: 'visible',
            timeout: 30000
        });

        await this.applyFilterButton.click();

        console.log(
            `Language filter applied: ${language}`
        );
    }


    // =====================================================
    // ENTER QUESTION
    // =====================================================

    async enterQuestion(question) {

        await this.questionBox.waitFor({
            state: 'visible',
            timeout: 30000
        });

        await this.questionBox.fill(question);

        console.log(
            `Question entered: ${question}`
        );
    }


    // =====================================================
    // SEND QUESTION
    // =====================================================

    async clickSend() {

        console.log(
            'Waiting for Send button...'
        );

        await this.sendButton.waitFor({
            state: 'visible',
            timeout: 30000
        });

        await expect(this.sendButton).toBeEnabled({
            timeout: 120000
        });

        await this.sendButton.click();

        console.log(
            'Question submitted'
        );
    }


    // =====================================================
    // WAIT FOR RESPONSE
    // =====================================================

    async waitForResponseComplete() {

        console.log(
            'Waiting for chatbot response...'
        );

        const feedbackCountBefore =
            await this.responseCompletedText.count();

        console.log(
            `Existing completed responses: ${feedbackCountBefore}`
        );


        await expect.poll(

            async () => {

                return await this.responseCompletedText.count();

            },

            {
                timeout: 180000,

                intervals: [
                    1000,
                    2000,
                    3000
                ]
            }

        ).toBeGreaterThan(
            feedbackCountBefore
        );


        console.log(
            'Chatbot response completed'
        );
    }


    // =====================================================
    // CLEAN RESPONSE
    // =====================================================

    cleanResponse(response) {

        if (!response) {
            return '';
        }

        return response
            .replace(/\r/g, '')
            .replace(/\n\s*\n+/g, '\n')
            .trim();
    }


    // =====================================================
    // GET RESPONSE FROM PAGE
    // =====================================================

    async extractResponse(question) {

        const bodyText =
            await this.page.locator('body').innerText();


        // -------------------------------------------------
        // IMPORTANT:
        // Find the LAST occurrence of the question.
        // -------------------------------------------------

        const questionIndex =
            bodyText.lastIndexOf(question);


        if (questionIndex === -1) {

            console.log(
                'Question text not found on page'
            );

            return '';
        }


        const responseStart =
            questionIndex + question.length;


        const feedbackText =
            'How was this answer?';


        const responseEnd =
            bodyText.indexOf(
                feedbackText,
                responseStart
            );


        let response;


        if (responseEnd !== -1) {

            response =
                bodyText.substring(
                    responseStart,
                    responseEnd
                );

        } else {

            response =
                bodyText.substring(
                    responseStart
                );
        }


        response =
            this.cleanResponse(response);


        return response;
    }


    // =====================================================
    // GET LATEST RESPONSE
    // =====================================================

    async getLatestResponse(question) {

        console.log(
            'Capturing chatbot response...'
        );


        // =================================================
        // IMPORTANT
        //
        // Sometimes "How was this answer?" appears
        // before the response text has completely rendered.
        //
        // Therefore retry response extraction.
        // =================================================

        const maxAttempts = 15;


        for (
            let attempt = 1;
            attempt <= maxAttempts;
            attempt++
        ) {

            console.log(
                `Response extraction attempt ${attempt}/${maxAttempts}`
            );


            const response =
                await this.extractResponse(
                    question
                );


            if (
                response &&
                response.length > 10
            ) {

                console.log(
                    '=========================================='
                );

                console.log(
                    'RESPONSE CAPTURED'
                );

                console.log(
                    response
                );

                console.log(
                    '=========================================='
                );


                return response;
            }


            console.log(
                'Response is empty or incomplete. Waiting...'
            );


            await this.page.waitForTimeout(
                2000
            );
        }


        // =================================================
        // FINAL ATTEMPT
        // =================================================

        const finalResponse =
            await this.extractResponse(
                question
            );


        if (finalResponse) {

            return finalResponse;
        }


        console.log(
            'WARNING: Response could not be captured.'
        );


        return '';
    }


    // =====================================================
    // CLEAR LANGUAGE FILTER
    // =====================================================

    async clearLanguageFilter(language) {

        if (language === 'All') {

            console.log(
                'Language = All'
            );

            console.log(
                'No language filter to clear'
            );

            return;
        }


        console.log(
            `Clearing language filter: ${language}`
        );


        const selectedLanguageButton =
            this.page.getByRole('button', {
                name: /Edit$/
            });


        await selectedLanguageButton.waitFor({
            state: 'visible',
            timeout: 30000
        });


        await selectedLanguageButton.click();


        console.log(
            'Language popup opened for clearing'
        );


        const selectedLanguageOption =
            this.getLanguageOption(
                language
            );


        await selectedLanguageOption.waitFor({
            state: 'visible',
            timeout: 30000
        });


        await selectedLanguageOption.click();


        console.log(
            `Language selection removed: ${language}`
        );


        await this.applyFilterButton.waitFor({
            state: 'visible',
            timeout: 30000
        });


        await this.applyFilterButton.click();


        console.log(
            'Language filter cleared'
        );
    }


    // =====================================================
    // CLEAR PROGRAMME FILTER
    // =====================================================

    async clearProgrammeFilter(programme) {

        if (programme === 'All') {

            console.log(
                'Programme = All'
            );

            console.log(
                'No programme filter to clear'
            );

            return;
        }


        console.log(
            `Clearing programme filter: ${programme}`
        );


        let programmeButton;


        switch (programme) {

            case 'PYP':
                programmeButton = this.pypButton;
                break;

            case 'MYP':
                programmeButton = this.mypButton;
                break;

            case 'DP':
                programmeButton = this.dpButton;
                break;

            case 'CP':
                programmeButton = this.cpButton;
                break;

            default:
                throw new Error(
                    `Unsupported programme: ${programme}`
                );
        }


        await programmeButton.waitFor({
            state: 'visible',
            timeout: 30000
        });


        await programmeButton.click();


        console.log(
            `Programme filter cleared: ${programme}`
        );
    }


    // =====================================================
    // ASK ONE COMPLETE QUESTION
    // =====================================================

    async askQuestion(questionData) {

        console.log('');
        console.log(
            '============================================'
        );

        console.log(
            `STARTING QUESTION ${questionData.id}`
        );

        console.log(
            '============================================'
        );

        console.log(
            `Programme : ${questionData.programme}`
        );

        console.log(
            `Language  : ${questionData.language}`
        );

        console.log(
            `Question  : ${questionData.question}`
        );


        // =================================================
        // 1. PROGRAMME
        // =================================================

        await this.selectProgramme(
            questionData.programme
        );


        // =================================================
        // 2. LANGUAGE
        // =================================================

        await this.selectLanguage(
            questionData.language
        );


        // =================================================
        // 3. ENTER QUESTION
        // =================================================

        await this.enterQuestion(
            questionData.question
        );


        // =================================================
        // 4. SEND
        // =================================================

        await this.clickSend();


        // =================================================
        // 5. WAIT FOR RESPONSE COMPLETION
        // =================================================

        await this.waitForResponseComplete();


        // =================================================
        // 6. CAPTURE RESPONSE
        // =================================================

        const response =
            await this.getLatestResponse(
                questionData.question
            );


        // =================================================
        // 7. CLEAR LANGUAGE
        // =================================================

        await this.clearLanguageFilter(
            questionData.language
        );


        // =================================================
        // 8. CLEAR PROGRAMME
        // =================================================

        await this.clearProgrammeFilter(
            questionData.programme
        );


        console.log(
            `QUESTION ${questionData.id} COMPLETED`
        );


        return response;
    }
}