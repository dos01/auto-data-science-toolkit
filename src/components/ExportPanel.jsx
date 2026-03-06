import { useRef } from 'react';
import { Download, FileText, BarChart3, Shield, FileDown } from 'lucide-react';
import { exportCSV, exportStatisticalReport, exportDataQualityReport, exportVisualizationPDF } from '../utils/export';

export default function ExportPanel({ data, stats, cleaningReport, columns, vizRef }) {
    const exports = [
        {
            icon: <FileDown size={22} />, title: 'Cleaned Dataset', desc: 'Download cleaned data as CSV',
            color: 'var(--accent-primary)', badge: 'CSV',
            action: () => exportCSV(data.rows, data.columns, 'cleaned_dataset.csv'),
            available: true,
        },
        {
            icon: <BarChart3 size={22} />, title: 'Statistical Report', desc: 'Summary statistics for all columns',
            color: 'var(--accent-secondary)', badge: 'CSV',
            action: () => exportStatisticalReport(stats, columns, 'statistical_report.csv'),
            available: !!stats,
        },
        {
            icon: <FileText size={22} />, title: 'Visualization Report', desc: 'Export dashboard as PDF',
            color: 'var(--accent-success)', badge: 'PDF',
            action: () => { if (vizRef?.current) exportVisualizationPDF(vizRef.current, 'visualization_report.pdf'); },
            available: !!vizRef?.current,
        },
        {
            icon: <Shield size={22} />, title: 'Data Quality Report', desc: 'Cleaning details and quality metrics',
            color: 'var(--accent-warning)', badge: 'TXT',
            action: () => exportDataQualityReport(cleaningReport, stats, columns, 'data_quality_report.txt'),
            available: !!cleaningReport,
        },
    ];

    return (
        <div className="export-panel animate-fade-in">
            <div className="section-header">
                <div className="icon"><Download size={18} /></div>
                <h2>Export Options</h2>
            </div>

            <div className="grid-2">
                {exports.map((exp, idx) => (
                    <div key={idx} className={`card export-card ${!exp.available ? 'disabled' : ''}`}
                        style={{ padding: 'var(--space-lg)', cursor: exp.available ? 'pointer' : 'not-allowed', opacity: exp.available ? 1 : 0.4 }}
                        onClick={exp.available ? exp.action : undefined}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                            <div style={{
                                width: 48, height: 48, borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                background: `${exp.color}20`, color: exp.color, flexShrink: 0
                            }}>
                                {exp.icon}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                    <h3 style={{ fontSize: '0.95rem', fontWeight: 600 }}>{exp.title}</h3>
                                    <span className="badge badge-cyan">{exp.badge}</span>
                                </div>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>{exp.desc}</p>
                                {!exp.available && <p style={{ fontSize: '0.75rem', color: 'var(--accent-tertiary)', marginTop: 4 }}>Run the corresponding analysis first</p>}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
