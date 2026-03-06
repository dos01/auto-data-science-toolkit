import * as ss from 'simple-statistics';

export function computeSummaryStats(rows, columns, types) {
    const stats = {};

    columns.forEach((col) => {
        const type = types[col]?.detected;

        if (type === 'integer' || type === 'float') {
            const values = rows
                .map((r) => r[col])
                .filter((v) => v !== null && v !== undefined && !isNaN(Number(v)))
                .map(Number);

            if (values.length === 0) {
                stats[col] = { type, count: 0, missing: rows.length };
                return;
            }

            const sorted = [...values].sort((a, b) => a - b);
            stats[col] = {
                type,
                count: values.length,
                missing: rows.length - values.length,
                missingPct: ((rows.length - values.length) / rows.length) * 100,
                mean: ss.mean(values),
                median: ss.median(sorted),
                stddev: values.length > 1 ? ss.standardDeviation(values) : 0,
                variance: values.length > 1 ? ss.variance(values) : 0,
                min: ss.min(values),
                max: ss.max(values),
                q1: ss.quantile(sorted, 0.25),
                q3: ss.quantile(sorted, 0.75),
                iqr: ss.quantile(sorted, 0.75) - ss.quantile(sorted, 0.25),
                skewness: values.length > 2 ? ss.sampleSkewness(values) : 0,
                kurtosis: values.length > 3 ? computeKurtosis(values) : 0,
                sum: ss.sum(values),
                range: ss.max(values) - ss.min(values),
            };
        } else if (type === 'categorical' || type === 'boolean') {
            const values = rows.map((r) => r[col]).filter((v) => v !== null && v !== undefined && v !== '');
            const freqMap = {};
            values.forEach((v) => {
                const key = String(v);
                freqMap[key] = (freqMap[key] || 0) + 1;
            });

            const sortedFreq = Object.entries(freqMap).sort((a, b) => b[1] - a[1]);
            stats[col] = {
                type,
                count: values.length,
                missing: rows.length - values.length,
                missingPct: ((rows.length - values.length) / rows.length) * 100,
                uniqueCount: Object.keys(freqMap).length,
                mode: sortedFreq.length > 0 ? sortedFreq[0][0] : null,
                modeFrequency: sortedFreq.length > 0 ? sortedFreq[0][1] : 0,
                frequencies: Object.fromEntries(sortedFreq.slice(0, 20)),
                topValues: sortedFreq.slice(0, 10),
            };
        } else {
            const values = rows.map((r) => r[col]).filter((v) => v !== null && v !== undefined && v !== '');
            stats[col] = {
                type: type || 'unknown',
                count: values.length,
                missing: rows.length - values.length,
                missingPct: ((rows.length - values.length) / rows.length) * 100,
            };
        }
    });

    return stats;
}

function computeKurtosis(values) {
    const n = values.length;
    if (n < 4) return 0;
    const mean = ss.mean(values);
    const std = ss.standardDeviation(values);
    if (std === 0) return 0;
    const m4 = values.reduce((acc, v) => acc + Math.pow((v - mean) / std, 4), 0) / n;
    return m4 - 3;
}

export function computeCorrelationMatrix(rows, columns, types) {
    const numericCols = columns.filter(
        (col) => types[col]?.detected === 'integer' || types[col]?.detected === 'float'
    );

    if (numericCols.length < 2) return { columns: numericCols, matrix: [] };

    const colValues = {};
    numericCols.forEach((col) => {
        colValues[col] = rows
            .map((r) => r[col])
            .map((v) => (v !== null && v !== undefined && !isNaN(Number(v)) ? Number(v) : null));
    });

    const matrix = [];
    for (let i = 0; i < numericCols.length; i++) {
        const row = [];
        for (let j = 0; j < numericCols.length; j++) {
            if (i === j) {
                row.push(1);
            } else {
                const pairs = [];
                for (let k = 0; k < rows.length; k++) {
                    const a = colValues[numericCols[i]][k];
                    const b = colValues[numericCols[j]][k];
                    if (a !== null && b !== null) {
                        pairs.push([a, b]);
                    }
                }
                if (pairs.length > 2) {
                    const xs = pairs.map((p) => p[0]);
                    const ys = pairs.map((p) => p[1]);
                    const stdX = ss.standardDeviation(xs);
                    const stdY = ss.standardDeviation(ys);
                    if (stdX === 0 || stdY === 0) {
                        row.push(0);
                    } else {
                        row.push(ss.sampleCorrelation(xs, ys));
                    }
                } else {
                    row.push(0);
                }
            }
        }
        matrix.push(row);
    }

    return { columns: numericCols, matrix };
}

export function getFrequencyDistribution(rows, column) {
    const freqMap = {};
    rows.forEach((row) => {
        const val = row[column];
        if (val !== null && val !== undefined && val !== '') {
            const key = String(val);
            freqMap[key] = (freqMap[key] || 0) + 1;
        }
    });

    return Object.entries(freqMap)
        .sort((a, b) => b[1] - a[1])
        .map(([value, count]) => ({ value, count, percentage: (count / rows.length) * 100 }));
}
