export function detectColumnTypes(rows, columns) {
    const types = {};

    columns.forEach((col) => {
        const values = rows
            .map((r) => r[col])
            .filter((v) => v !== null && v !== undefined && v !== '');

        if (values.length === 0) {
            types[col] = { detected: 'unknown', confidence: 0 };
            return;
        }

        const numericCount = values.filter((v) => !isNaN(Number(v)) && typeof v !== 'boolean').length;
        const dateCount = values.filter((v) => isDateLike(v)).length;
        const boolCount = values.filter((v) => isBooleanLike(v)).length;

        const total = values.length;
        const numRatio = numericCount / total;
        const dateRatio = dateCount / total;
        const boolRatio = boolCount / total;

        if (boolRatio > 0.8) {
            types[col] = { detected: 'boolean', confidence: boolRatio };
        } else if (numRatio > 0.8) {
            const hasDecimals = values.some((v) => {
                const n = Number(v);
                return !isNaN(n) && n % 1 !== 0;
            });
            types[col] = {
                detected: hasDecimals ? 'float' : 'integer',
                confidence: numRatio,
            };
        } else if (dateRatio > 0.6) {
            types[col] = { detected: 'datetime', confidence: dateRatio };
        } else {
            const uniqueValues = new Set(values.map(String));
            const uniqueRatio = uniqueValues.size / total;
            types[col] = {
                detected: 'categorical',
                confidence: 1,
                cardinality: uniqueValues.size,
                isHighCardinality: uniqueRatio > 0.5,
            };
        }
    });

    return types;
}

function isDateLike(value) {
    if (typeof value === 'number') return false;
    const str = String(value);
    const datePatterns = [
        /^\d{4}[-/]\d{1,2}[-/]\d{1,2}/,
        /^\d{1,2}[-/]\d{1,2}[-/]\d{2,4}/,
        /^\d{1,2}\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i,
        /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2}/i,
    ];
    if (datePatterns.some((p) => p.test(str))) return true;
    const d = new Date(str);
    return !isNaN(d.getTime()) && str.length > 4;
}

function isBooleanLike(value) {
    const str = String(value).toLowerCase().trim();
    return ['true', 'false', 'yes', 'no', '0', '1', 't', 'f', 'y', 'n'].includes(str);
}

export function correctDataTypes(rows, columns, types) {
    return rows.map((row) => {
        const newRow = { ...row };
        columns.forEach((col) => {
            const type = types[col];
            if (!type) return;

            const val = newRow[col];
            if (val === null || val === undefined || val === '') return;

            switch (type.detected) {
                case 'integer':
                    newRow[col] = parseInt(Number(val), 10);
                    if (isNaN(newRow[col])) newRow[col] = null;
                    break;
                case 'float':
                    newRow[col] = parseFloat(val);
                    if (isNaN(newRow[col])) newRow[col] = null;
                    break;
                case 'boolean': {
                    const s = String(val).toLowerCase().trim();
                    newRow[col] = ['true', 'yes', '1', 't', 'y'].includes(s);
                    break;
                }
                case 'datetime':
                    newRow[col] = new Date(val).toISOString();
                    break;
                case 'categorical':
                    newRow[col] = String(val);
                    break;
                default:
                    break;
            }
        });
        return newRow;
    });
}

export function getTypeBadge(type) {
    switch (type) {
        case 'integer':
        case 'float':
            return { label: type === 'integer' ? 'INT' : 'FLOAT', className: 'badge-cyan' };
        case 'categorical':
            return { label: 'CAT', className: 'badge-purple' };
        case 'datetime':
            return { label: 'DATE', className: 'badge-yellow' };
        case 'boolean':
            return { label: 'BOOL', className: 'badge-green' };
        default:
            return { label: 'UNK', className: 'badge-red' };
    }
}
