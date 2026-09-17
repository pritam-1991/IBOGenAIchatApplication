import * as XLSX from 'xlsx';
import fs from 'fs';

export class ExcelHelper {

    static readQuestions(filePath) {

        const workbook =
            XLSX.readFile(filePath);

        const worksheet =
            workbook.Sheets[
                workbook.SheetNames[0]
            ];

        return XLSX.utils.sheet_to_json(
            worksheet,
            {
                defval: ''
            }
        );
    }

    static saveResults(
        filePath,
        results
    ) {

        const workbook =
            XLSX.utils.book_new();

        const worksheet =
            XLSX.utils.json_to_sheet(
                results
            );

        XLSX.utils.book_append_sheet(
            workbook,
            worksheet,
            'Results'
        );

        XLSX.writeFile(
            workbook,
            filePath
        );
    }

    static ensureFolder(folder) {

        if (
            !fs.existsSync(folder)
        ) {

            fs.mkdirSync(
                folder,
                {
                    recursive: true
                }
            );
        }
    }
}