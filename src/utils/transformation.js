import * as ss from 'simple-statistics';

export function normalize(rows, column) {
    const values = rows
        .map((r) => r[column])
        .filter((v) => v !== null && v !== undefined && !isNaN(Number(v)))
        .map(Number);

    if (values.length === 0) return rows;

    const min = ss.min(values);
    const max = ss.max(values);
    const range = max - min;

    if (range === 0) return rows;

    return rows.map((row) => {
        const newRow = { ...row };
        const val = Number(row[column]);
        if (!isNaN(val)) {
            newRow[column] = Math.round(((val - min) / range) * 10000) / 10000;
        }
        return newRow;
    });
}

export function standardize(rows, column) {
    const values = rows
        .map((r) => r[column])
        .filter((v) => v !== null && v !== undefined && !isNaN(Number(v)))
        .map(Number);

    if (values.length === 0) return rows;

    const mean = ss.mean(values);
    const std = ss.standardDeviation(values);

    if (std === 0) return rows;

    return rows.map((row) => {
        const newRow = { ...row };
        const val = Number(row[column]);
        if (!isNaN(val)) {
            newRow[column] = Math.round(((val - mean) / std) * 10000) / 10000;
        }
        return newRow;
    });
}

export function logTransform(rows, column) {
    return rows.map((row) => {
        const newRow = { ...row };
        const val = Number(row[column]);
        if (!isNaN(val)) {
            newRow[column] = Math.round(Math.log1p(Math.abs(val)) * 10000) / 10000;
        }
        return newRow;
    });
}

export function filterColumns(rows, columns, selectedColumns) {
    const filtered = rows.map((row) => {
        const newRow = {};
        selectedColumns.forEach((col) => {
            newRow[col] = row[col];
        });
        return newRow;
    });
    return { data: filtered, columns: selectedColumns };
}

export function renameColumn(rows, columns, oldName, newName) {
    if (!newName || newName === oldName) return { data: rows, columns };
    if (columns.includes(newName)) return { data: rows, columns };

    const newColumns = columns.map((c) => (c === oldName ? newName : c));
    const newRows = rows.map((row) => {
        const newRow = {};
        Object.keys(row).forEach((key) => {
            newRow[key === oldName ? newName : key] = row[key];
        });
        return newRow;
    });

    return { data: newRows, columns: newColumns };
}
