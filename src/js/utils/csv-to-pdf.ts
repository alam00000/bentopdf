import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import Papa from 'papaparse';

export interface CsvToPdfOptions {
    onProgress?: (percent: number, message: string) => void;
}

/**
 * Convert a CSV file to PDF using jsPDF and autotable
 */
export async function convertCsvToPdf(
    file: File,
    options?: CsvToPdfOptions
): Promise<Blob> {
    const { onProgress } = options || {};

    return new Promise((resolve, reject) => {
        onProgress?.(10, 'Reading CSV file...');

        Papa.parse(file, {
            complete: (results) => {
                try {
                    onProgress?.(50, 'Generating PDF...');

                    const data = results.data as string[][];

                    // Filter out empty rows
                    const filteredData = data.filter(row =>
                        row.some(cell => cell && cell.trim() !== '')
                    );

                    if (filteredData.length === 0) {
                        reject(new Error('CSV file is empty'));
                        return;
                    }

                    // Create PDF document
                    const doc = new jsPDF({
                        orientation: 'landscape', // Better for wide tables
                        unit: 'mm',
                        format: 'a4'
                    });

                    // Extract headers (first row) and data
                    const headers = filteredData[0];
                    const rows = filteredData.slice(1);

                    onProgress?.(70, 'Creating table...');

                    // Generate table
                    autoTable(doc, {
                        head: [headers],
                        body: rows,
                        startY: 20,
                        styles: {
                            fontSize: 9,
                            cellPadding: 3,
                            overflow: 'linebreak',
                            cellWidth: 'wrap',
                        },
                        headStyles: {
                            fillColor: [41, 128, 185], // Nice blue header
                            textColor: 255,
                            fontStyle: 'bold',
                        },
                        alternateRowStyles: {
                            fillColor: [245, 245, 245], // Light gray for alternate rows
                        },
                        margin: { top: 20, left: 10, right: 10 },
                        theme: 'striped',
                    });

                    onProgress?.(90, 'Finalizing PDF...');

                    // Get PDF as blob
                    const pdfBlob = doc.output('blob');

                    onProgress?.(100, 'Complete!');
                    resolve(pdfBlob);
                } catch (error) {
                    reject(error);
                }
            },
            error: (error) => {
                reject(new Error(`Failed to parse CSV: ${error.message}`));
            },
        });
    });
}
