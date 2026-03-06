import Papa from 'papaparse';
import * as XLSX from 'xlsx';

export function parseFile(file) {
    return new Promise((resolve, reject) => {
        const ext = file.name.split('.').pop().toLowerCase();

        if (ext === 'csv') {
            parseCSV(file).then(resolve).catch(reject);
        } else if (ext === 'xlsx' || ext === 'xls') {
            parseExcel(file).then(resolve).catch(reject);
        } else if (ext === 'json') {
            parseJSON(file).then(resolve).catch(reject);
        } else {
            reject(new Error(`Unsupported file format: .${ext}`));
        }
    });
}

function parseCSV(file) {
    return new Promise((resolve, reject) => {
        Papa.parse(file, {
            header: true,
            dynamicTyping: true,
            skipEmptyLines: true,
            complete: (results) => {
                if (results.errors.length > 0 && results.data.length === 0) {
                    reject(new Error('Failed to parse CSV: ' + results.errors[0].message));
                    return;
                }
                const columns = results.meta.fields || [];
                resolve({
                    columns,
                    rows: results.data,
                    fileName: file.name,
                    fileSize: file.size,
                    rowCount: results.data.length,
                    columnCount: columns.length,
                });
            },
            error: (err) => reject(new Error('CSV parsing error: ' + err.message)),
        });
    });
}

function parseExcel(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const workbook = XLSX.read(e.target.result, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: null });
                const columns = jsonData.length > 0 ? Object.keys(jsonData[0]) : [];
                resolve({
                    columns,
                    rows: jsonData,
                    fileName: file.name,
                    fileSize: file.size,
                    rowCount: jsonData.length,
                    columnCount: columns.length,
                });
            } catch (err) {
                reject(new Error('Excel parsing error: ' + err.message));
            }
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsArrayBuffer(file);
    });
}

function parseJSON(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                let data = JSON.parse(e.target.result);
                if (!Array.isArray(data)) {
                    if (typeof data === 'object' && data !== null) {
                        const keys = Object.keys(data);
                        const arrayKey = keys.find((k) => Array.isArray(data[k]));
                        if (arrayKey) {
                            data = data[arrayKey];
                        } else {
                            data = [data];
                        }
                    } else {
                        throw new Error('JSON must contain an array of objects');
                    }
                }

                if (data.length === 0) {
                    throw new Error('JSON array is empty');
                }

                const columns = [...new Set(data.flatMap((row) => Object.keys(row)))];
                const rows = data.map((row) => {
                    const normalized = {};
                    columns.forEach((col) => {
                        normalized[col] = row[col] !== undefined ? row[col] : null;
                    });
                    return normalized;
                });

                resolve({
                    columns,
                    rows,
                    fileName: file.name,
                    fileSize: file.size,
                    rowCount: rows.length,
                    columnCount: columns.length,
                });
            } catch (err) {
                reject(new Error('JSON parsing error: ' + err.message));
            }
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsText(file);
    });
}
