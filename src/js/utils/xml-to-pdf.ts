import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface XmlToPdfOptions {
    onProgress?: (percent: number, message: string) => void;
}

interface jsPDFWithAutoTable extends jsPDF {
    lastAutoTable?: { finalY: number };
}

export async function convertXmlToPdf(
    file: File,
    options?: XmlToPdfOptions
): Promise<Blob> {
    const { onProgress } = options || {};

    onProgress?.(10, 'Reading XML file...');
    const xmlText = await file.text();

    onProgress?.(30, 'Parsing XML structure...');
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

    const parseError = xmlDoc.querySelector('parsererror');
    if (parseError) {
        throw new Error('Invalid XML: ' + parseError.textContent);
    }

    onProgress?.(50, 'Analyzing data structure...');

    const doc: jsPDFWithAutoTable = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    let yPosition = 20;

    const root = xmlDoc.documentElement;
    const rootName = formatTitle(root.tagName);

    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(rootName, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    onProgress?.(60, 'Generating formatted content...');

    const children = Array.from(root.children);

    if (children.length > 0) {
        const groups = groupByTagName(children);

        for (const [groupName, elements] of Object.entries(groups)) {
            const { headers, rows } = extractTableData(elements);

            if (headers.length > 0 && rows.length > 0) {
                if (Object.keys(groups).length > 1) {
                    doc.setFontSize(14);
                    doc.setFont('helvetica', 'bold');
                    doc.text(formatTitle(groupName), 14, yPosition);
                    yPosition += 8;
                }

                autoTable(doc, {
                    head: [headers.map(h => formatTitle(h))],
                    body: rows,
                    startY: yPosition,
                    styles: {
                        fontSize: 9,
                        cellPadding: 4,
                        overflow: 'linebreak',
                    },
                    headStyles: {
                        fillColor: [79, 70, 229],
                        textColor: 255,
                        fontStyle: 'bold',
                    },
                    alternateRowStyles: {
                        fillColor: [243, 244, 246],
                    },
                    margin: { top: 20, left: 14, right: 14 },
                    theme: 'striped',
                    didDrawPage: (data) => {
                        yPosition = (data.cursor?.y || yPosition) + 10;
                    }
                });

                yPosition = (doc.lastAutoTable?.finalY || yPosition) + 15;
            }
        }
    } else {
        const kvPairs = extractKeyValuePairs(root);
        if (kvPairs.length > 0) {
            autoTable(doc, {
                head: [['Property', 'Value']],
                body: kvPairs,
                startY: yPosition,
                styles: {
                    fontSize: 10,
                    cellPadding: 5,
                },
                headStyles: {
                    fillColor: [79, 70, 229],
                    textColor: 255,
                    fontStyle: 'bold',
                },
                columnStyles: {
                    0: { fontStyle: 'bold', cellWidth: 60 },
                    1: { cellWidth: 'auto' },
                },
                margin: { left: 14, right: 14 },
                theme: 'striped',
            });
        }
    }

    onProgress?.(90, 'Finalizing PDF...');

    const pdfBlob = doc.output('blob');

    onProgress?.(100, 'Complete!');
    return pdfBlob;
}


function groupByTagName(elements: Element[]): Record<string, Element[]> {
    const groups: Record<string, Element[]> = {};

    for (const element of elements) {
        const tagName = element.tagName;
        if (!groups[tagName]) {
            groups[tagName] = [];
        }
        groups[tagName].push(element);
    }

    return groups;
}

function extractTableData(elements: Element[]): { headers: string[], rows: string[][] } {
    if (elements.length === 0) {
        return { headers: [], rows: [] };
    }

    const headerSet = new Set<string>();
    for (const element of elements) {
        for (const child of Array.from(element.children)) {
            headerSet.add(child.tagName);
        }
    }
    const headers = Array.from(headerSet);

    const rows: string[][] = [];
    for (const element of elements) {
        const row: string[] = [];
        for (const header of headers) {
            const child = element.querySelector(header);
            row.push(child?.textContent?.trim() || '');
        }
        rows.push(row);
    }

    return { headers, rows };
}


function extractKeyValuePairs(element: Element): string[][] {
    const pairs: string[][] = [];

    for (const child of Array.from(element.children)) {
        const key = child.tagName;
        const value = child.textContent?.trim() || '';
        if (value) {
            pairs.push([formatTitle(key), value]);
        }
    }

    for (const attr of Array.from(element.attributes)) {
        pairs.push([formatTitle(attr.name), attr.value]);
    }

    return pairs;
}


function formatTitle(tagName: string): string {
    return tagName
        .replace(/[_-]/g, ' ')
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}
