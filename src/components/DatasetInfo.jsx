import { Info, Rows3, Columns3, Database, Hash } from 'lucide-react';
import { getTypeBadge } from '../utils/typeDetection';

export default function DatasetInfo({ data, types }) {
    const formatBytes = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / 1048576).toFixed(1) + ' MB';
    };

    const numericCols = data.columns.filter(c => types[c]?.detected === 'integer' || types[c]?.detected === 'float').length;
    const catCols = data.columns.filter(c => types[c]?.detected === 'categorical').length;
    const dateCols = data.columns.filter(c => types[c]?.detected === 'datetime').length;
    const boolCols = data.columns.filter(c => types[c]?.detected === 'boolean').length;

    return (
        <div className="dataset-info animate-fade-in">
            <div className="section-header">
                <div className="icon"><Info size={18} /></div>
                <h2>Dataset Information</h2>
            </div>

            <div className="grid-4">
                <div className="card stat-card">
                    <Rows3 size={22} style={{ color: 'var(--accent-primary)', marginBottom: 8 }} />
                    <div className="stat-value">{data.rowCount.toLocaleString()}</div>
                    <div className="stat-label">Rows</div>
                </div>
                <div className="card stat-card">
                    <Columns3 size={22} style={{ color: 'var(--accent-secondary)', marginBottom: 8 }} />
                    <div className="stat-value">{data.columnCount}</div>
                    <div className="stat-label">Columns</div>
                </div>
                <div className="card stat-card">
                    <Database size={22} style={{ color: 'var(--accent-success)', marginBottom: 8 }} />
                    <div className="stat-value">{formatBytes(data.fileSize)}</div>
                    <div className="stat-label">File Size</div>
                </div>
                <div className="card stat-card">
                    <Hash size={22} style={{ color: 'var(--accent-warning)', marginBottom: 8 }} />
                    <div className="stat-value">{numericCols}</div>
                    <div className="stat-label">Numeric Cols</div>
                </div>
            </div>

            <div className="column-type-summary card" style={{ marginTop: 'var(--space-md)', padding: 'var(--space-lg)' }}>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 'var(--space-md)', color: 'var(--text-secondary)' }}>Column Types Overview</h3>
                <div className="type-bars">
                    {[
                        { label: 'Numeric', count: numericCols, color: 'var(--accent-primary)', className: 'badge-cyan' },
                        { label: 'Categorical', count: catCols, color: 'var(--accent-secondary)', className: 'badge-purple' },
                        { label: 'DateTime', count: dateCols, color: 'var(--accent-warning)', className: 'badge-yellow' },
                        { label: 'Boolean', count: boolCols, color: 'var(--accent-success)', className: 'badge-green' },
                    ].map(t => (
                        <div key={t.label} className="type-bar-row">
                            <span className={`badge ${t.className}`}>{t.label}</span>
                            <div className="progress-bar" style={{ flex: 1, margin: '0 12px' }}>
                                <div className="progress-fill" style={{
                                    width: `${data.columnCount > 0 ? (t.count / data.columnCount) * 100 : 0}%`,
                                    background: t.color
                                }} />
                            </div>
                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontFamily: 'var(--font-mono)', minWidth: 24, textAlign: 'right' }}>{t.count}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="column-list card" style={{ marginTop: 'var(--space-md)', padding: 'var(--space-lg)' }}>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 'var(--space-md)', color: 'var(--text-secondary)' }}>All Columns</h3>
                <div className="columns-grid">
                    {data.columns.map((col) => {
                        const badge = types[col] ? getTypeBadge(types[col].detected) : { label: 'UNK', className: 'badge-red' };
                        return (
                            <div key={col} className="column-chip">
                                <span className="column-name">{col}</span>
                                <span className={`badge ${badge.className}`}>{badge.label}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
