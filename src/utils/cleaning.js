import * as ss from 'simple-statistics';

export function cleanDataset(rows, columns, types, options = {}) {
    const report = {
        originalRowCount: rows.length,
        steps: [],
        missingValues: {},
        duplicates: { count: 0 },
        outliers: {},
        typeCorrections: 0,
    };

    let data = rows.map((r) => ({ ...r }));

    // Step 1: Handle Missing Values
    const missingStep = handleMissingValues(data, columns, types);
    data = missingStep.data;
    report.missingValues = missingStep.report;
    report.steps.push({
        name: 'Missing Value Handling',
        description: 'Detected and filled missing values',
        details: missingStep.report,
    });

    // Step 2: Remove Duplicates
    const dedupStep = removeDuplicates(data, columns);
    data = dedupStep.data;
    report.duplicates = dedupStep.report;
    report.steps.push({
        name: 'Duplicate Removal',
        description: `Found and removed ${dedupStep.report.count} duplicate rows`,
        details: dedupStep.report,
    });

    // Step 3: Outlier Detection & Handling
    const outlierStrategy = options.outlierStrategy || 'cap';
    const outlierStep = handleOutliers(data, columns, types, outlierStrategy);
    data = outlierStep.data;
    report.outliers = outlierStep.report;
    report.steps.push({
        name: 'Outlier Handling',
        description: `Detected outliers using IQR and Z-score methods (${outlierStrategy})`,
        details: outlierStep.report,
    });

    report.cleanedRowCount = data.length;
    report.rowsRemoved = report.originalRowCount - data.length;

    return { data, report };
}

function handleMissingValues(rows, columns, types) {
    const report = {};
    const data = rows.map((r) => ({ ...r }));

    columns.forEach((col) => {
        const missingIndices = [];
        data.forEach((row, idx) => {
            if (row[col] === null || row[col] === undefined || row[col] === '' || (typeof row[col] === 'number' && isNaN(row[col]))) {
                missingIndices.push(idx);
            }
        });

        const missingCount = missingIndices.length;
        const missingPct = (missingCount / data.length) * 100;

        report[col] = {
            missingCount,
            missingPct: Math.round(missingPct * 100) / 100,
            strategy: 'none',
        };

        if (missingCount === 0) return;

        const type = types[col]?.detected;
        if (type === 'integer' || type === 'float') {
            const validValues = data
                .filter((_, i) => !missingIndices.includes(i))
                .map((r) => Number(r[col]))
                .filter((v) => !isNaN(v));

            if (validValues.length > 0) {
                const fillValue = ss.median(validValues);
                missingIndices.forEach((idx) => {
                    data[idx][col] = Math.round(fillValue * 1000) / 1000;
                });
                report[col].strategy = 'median';
                report[col].fillValue = fillValue;
            }
        } else if (type === 'categorical' || type === 'boolean') {
            const freqMap = {};
            data.forEach((row, idx) => {
                if (!missingIndices.includes(idx) && row[col] !== null && row[col] !== undefined && row[col] !== '') {
                    const key = String(row[col]);
                    freqMap[key] = (freqMap[key] || 0) + 1;
                }
            });

            const entries = Object.entries(freqMap);
            if (entries.length > 0) {
                const mode = entries.sort((a, b) => b[1] - a[1])[0][0];
                missingIndices.forEach((idx) => {
                    data[idx][col] = mode;
                });
                report[col].strategy = 'mode';
                report[col].fillValue = mode;
            }
        }
    });

    return { data, report };
}

function removeDuplicates(rows, columns) {
    const seen = new Set();
    const unique = [];
    let dupeCount = 0;

    rows.forEach((row) => {
        const key = columns.map((c) => JSON.stringify(row[c])).join('|');
        if (!seen.has(key)) {
            seen.add(key);
            unique.push(row);
        } else {
            dupeCount++;
        }
    });

    return {
        data: unique,
        report: { count: dupeCount, originalCount: rows.length, cleanedCount: unique.length },
    };
}

function handleOutliers(rows, columns, types, strategy) {
    const report = {};
    let data = rows.map((r) => ({ ...r }));

    columns.forEach((col) => {
        const type = types[col]?.detected;
        if (type !== 'integer' && type !== 'float') return;

        const values = data
            .map((r) => r[col])
            .filter((v) => v !== null && v !== undefined && !isNaN(Number(v)))
            .map(Number);

        if (values.length < 4) return;

        const sorted = [...values].sort((a, b) => a - b);
        const q1 = ss.quantile(sorted, 0.25);
        const q3 = ss.quantile(sorted, 0.75);
        const iqr = q3 - q1;
        const lowerBound = q1 - 1.5 * iqr;
        const upperBound = q3 + 1.5 * iqr;

        const mean = ss.mean(values);
        const std = ss.standardDeviation(values);

        let outlierCount = 0;
        data.forEach((row) => {
            const val = Number(row[col]);
            if (isNaN(val)) return;

            const isIQROutlier = val < lowerBound || val > upperBound;
            const zScore = std !== 0 ? Math.abs((val - mean) / std) : 0;
            const isZScoreOutlier = zScore > 3;

            if (isIQROutlier || isZScoreOutlier) {
                outlierCount++;
                if (strategy === 'cap') {
                    row[col] = Math.max(lowerBound, Math.min(upperBound, val));
                } else if (strategy === 'remove') {
                    row[col] = null;
                }
                // strategy === 'flag' does nothing to the value
            }
        });

        if (strategy === 'remove') {
            data = data.filter((row) => row[col] !== null);
        }

        report[col] = {
            outlierCount,
            method: 'IQR + Z-score',
            strategy,
            bounds: { lower: Math.round(lowerBound * 100) / 100, upper: Math.round(upperBound * 100) / 100 },
            iqr: Math.round(iqr * 100) / 100,
        };
    });

    return { data, report };
}

export function getMissingValueSummary(rows, columns) {
    const summary = {};
    columns.forEach((col) => {
        const missing = rows.filter(
            (r) => r[col] === null || r[col] === undefined || r[col] === '' || (typeof r[col] === 'number' && isNaN(r[col]))
        ).length;
        summary[col] = {
            count: missing,
            percentage: Math.round((missing / rows.length) * 10000) / 100,
        };
    });
    return summary;
}
