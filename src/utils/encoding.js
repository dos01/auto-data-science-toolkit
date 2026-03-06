export function labelEncode(rows, column) {
    const uniqueValues = [...new Set(rows.map((r) => r[column]).filter((v) => v !== null && v !== undefined && v !== ''))];
    uniqueValues.sort();

    const mapping = {};
    uniqueValues.forEach((val, idx) => {
        mapping[String(val)] = idx;
    });

    const encodedRows = rows.map((row) => {
        const newRow = { ...row };
        const val = row[column];
        if (val !== null && val !== undefined && val !== '') {
            newRow[column] = mapping[String(val)];
        }
        return newRow;
    });

    return { data: encodedRows, mapping, column };
}

export function oneHotEncode(rows, column, columns) {
    const uniqueValues = [...new Set(rows.map((r) => r[column]).filter((v) => v !== null && v !== undefined && v !== ''))];
    uniqueValues.sort();

    const newColumns = uniqueValues.map((val) => `${column}_${val}`);

    const encodedRows = rows.map((row) => {
        const newRow = { ...row };
        uniqueValues.forEach((val) => {
            newRow[`${column}_${val}`] = String(row[column]) === String(val) ? 1 : 0;
        });
        delete newRow[column];
        return newRow;
    });

    const updatedColumns = columns.filter((c) => c !== column).concat(newColumns);

    return { data: encodedRows, columns: updatedColumns, newColumns, removedColumn: column };
}
