import Papa from 'papaparse';
import jsPDF from 'jspdf';

export function exportCSV(data, columns, filename = 'cleaned_data.csv') {
    const csv = Papa.unparse(data, { columns });
    downloadFile(csv, filename, 'text/csv');
}

export function exportStatisticalReport(stats, columns, filename = 'statistical_report.csv') {
    const rows = [];
    rows.push(['Column', 'Type', 'Count', 'Missing', 'Missing%', 'Mean', 'Median', 'StdDev', 'Min', 'Max', 'Q1', 'Q3', 'Skewness', 'Kurtosis']);

    columns.forEach((col) => {
        const s = stats[col];
        if (!s) return;
        rows.push([
            col,
            s.type || '',
            s.count || 0,
            s.missing || 0,
            s.missingPct ? s.missingPct.toFixed(2) : '0.00',
            s.mean !== undefined ? s.mean.toFixed(4) : '',
            s.median !== undefined ? s.median.toFixed(4) : '',
            s.stddev !== undefined ? s.stddev.toFixed(4) : '',
            s.min !== undefined ? s.min.toFixed(4) : '',
            s.max !== undefined ? s.max.toFixed(4) : '',
            s.q1 !== undefined ? s.q1.toFixed(4) : '',
            s.q3 !== undefined ? s.q3.toFixed(4) : '',
            s.skewness !== undefined ? s.skewness.toFixed(4) : '',
            s.kurtosis !== undefined ? s.kurtosis.toFixed(4) : '',
        ]);
    });

    const csv = rows.map((r) => r.join(',')).join('\n');
    downloadFile(csv, filename, 'text/csv');
}

export function exportDataQualityReport(cleaningReport, stats, columns, filename = 'data_quality_report.txt') {
    let report = '═══════════════════════════════════════\n';
    report += '    DATA QUALITY REPORT\n';
    report += '═══════════════════════════════════════\n\n';

    report += `Original Rows: ${cleaningReport.originalRowCount}\n`;
    report += `Cleaned Rows: ${cleaningReport.cleanedRowCount}\n`;
    report += `Rows Removed: ${cleaningReport.rowsRemoved}\n\n`;

    report += '───── CLEANING STEPS ─────\n\n';
    cleaningReport.steps.forEach((step, idx) => {
        report += `${idx + 1}. ${step.name}\n`;
        report += `   ${step.description}\n\n`;
    });

    report += '───── MISSING VALUES ─────\n\n';
    const mv = cleaningReport.missingValues;
    columns.forEach((col) => {
        if (mv[col]) {
            report += `  ${col}: ${mv[col].missingCount} missing (${mv[col].missingPct}%) → ${mv[col].strategy}\n`;
        }
    });

    report += '\n───── DUPLICATES ─────\n\n';
    report += `  Found: ${cleaningReport.duplicates.count} duplicate rows\n`;

    report += '\n───── OUTLIERS ─────\n\n';
    const outliers = cleaningReport.outliers;
    Object.keys(outliers).forEach((col) => {
        const o = outliers[col];
        report += `  ${col}: ${o.outlierCount} outliers (${o.method}, ${o.strategy})\n`;
        report += `    Bounds: [${o.bounds.lower}, ${o.bounds.upper}]\n`;
    });

    report += '\n───── COLUMN STATISTICS ─────\n\n';
    columns.forEach((col) => {
        const s = stats[col];
        if (!s) return;
        report += `  ${col} (${s.type}):\n`;
        if (s.mean !== undefined) {
            report += `    Mean: ${s.mean.toFixed(4)}, Median: ${s.median.toFixed(4)}, Std: ${s.stddev.toFixed(4)}\n`;
            report += `    Range: [${s.min.toFixed(4)}, ${s.max.toFixed(4)}]\n`;
        }
        if (s.uniqueCount !== undefined) {
            report += `    Unique Values: ${s.uniqueCount}, Mode: ${s.mode}\n`;
        }
    });

    downloadFile(report, filename, 'text/plain');
}

export async function exportVisualizationPDF(elementRef, filename = 'visualization_report.pdf') {
    const { default: html2canvas } = await import('html2canvas');

    const canvas = await html2canvas(elementRef, {
        backgroundColor: '#0a0e1a',
        scale: 2,
        useCORS: true,
        logging: false,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('l', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const imgWidth = pageWidth - 20;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let yOffset = 10;
    const remainingHeight = imgHeight;

    if (remainingHeight <= pageHeight - 20) {
        pdf.addImage(imgData, 'PNG', 10, yOffset, imgWidth, imgHeight);
    } else {
        let srcY = 0;
        const pageImgHeight = pageHeight - 20;
        const srcPageHeight = (pageImgHeight / imgWidth) * canvas.width;

        while (srcY < canvas.height) {
            const sliceCanvas = document.createElement('canvas');
            sliceCanvas.width = canvas.width;
            sliceCanvas.height = Math.min(srcPageHeight, canvas.height - srcY);
            const ctx = sliceCanvas.getContext('2d');
            ctx.drawImage(canvas, 0, srcY, canvas.width, sliceCanvas.height, 0, 0, canvas.width, sliceCanvas.height);
            const sliceImg = sliceCanvas.toDataURL('image/png');
            const sliceImgHeight = (sliceCanvas.height * imgWidth) / canvas.width;

            if (srcY > 0) pdf.addPage();
            pdf.addImage(sliceImg, 'PNG', 10, 10, imgWidth, sliceImgHeight);
            srcY += srcPageHeight;
        }
    }

    pdf.save(filename);
}

function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
