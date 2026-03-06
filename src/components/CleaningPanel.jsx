import { useState } from 'react';
import { Sparkles, CheckCircle, AlertTriangle, Trash2, Shield, Zap } from 'lucide-react';
import { cleanDataset, getMissingValueSummary } from '../utils/cleaning';

export default function CleaningPanel({ data, types, onCleaningComplete }) {
    const [outlierStrategy, setOutlierStrategy] = useState('cap');
    const [cleaningReport, setCleaningReport] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [showDetails, setShowDetails] = useState(null);

    const missingSummary = getMissingValueSummary(data.rows, data.columns);
    const totalMissing = Object.values(missingSummary).reduce((sum, v) => sum + v.count, 0);
    const columnsWithMissing = Object.entries(missingSummary).filter(([, v]) => v.count > 0);

    const handleClean = () => {
        setIsProcessing(true);
        setTimeout(() => {
            const result = cleanDataset(data.rows, data.columns, types, { outlierStrategy });
            setCleaningReport(result.report);
            onCleaningComplete({
                ...data,
                rows: result.data,
                rowCount: result.data.length,
            }, result.report);
            setIsProcessing(false);
        }, 500);
    };

    return (
        <div className="cleaning-panel animate-fade-in">
            <div className="section-header">
                <div className="icon"><Sparkles size={18} /></div>
                <h2>Automatic Data Cleaning</h2>
            </div>

            {/* Pre-cleaning overview */}
            <div className="grid-3" style={{ marginBottom: 'var(--space-lg)' }}>
                <div className="card stat-card">
                    <AlertTriangle size={22} style={{ color: 'var(--accent-warning)', marginBottom: 8 }} />
                    <div className="stat-value">{totalMissing.toLocaleString()}</div>
                    <div className="stat-label">Missing Values</div>
                </div>
                <div className="card stat-card">
                    <Trash2 size={22} style={{ color: 'var(--accent-tertiary)', marginBottom: 8 }} />
                    <div className="stat-value">{columnsWithMissing.length}</div>
                    <div className="stat-label">Affected Columns</div>
                </div>
                <div className="card stat-card">
                    <Shield size={22} style={{ color: 'var(--accent-primary)', marginBottom: 8 }} />
                    <div className="stat-value">{data.rowCount.toLocaleString()}</div>
                    <div className="stat-label">Total Rows</div>
                </div>
            </div>

            {/* Missing values detail */}
            {columnsWithMissing.length > 0 && (
                <div className="card" style={{ padding: 'var(--space-lg)', marginBottom: 'var(--space-lg)' }}>
                    <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 'var(--space-md)', color: 'var(--text-secondary)' }}>
                        Missing Values by Column
                    </h3>
                    <div className="missing-bars">
                        {columnsWithMissing.map(([col, info]) => (
                            <div key={col} className="missing-bar-row">
                                <span className="col-name">{col}</span>
                                <div className="progress-bar" style={{ flex: 1, margin: '0 12px' }}>
                                    <div
                                        className="progress-fill"
                                        style={{
                                            width: `${info.percentage}%`,
                                            background: info.percentage > 50 ? 'var(--accent-danger)' : info.percentage > 20 ? 'var(--accent-warning)' : 'var(--accent-primary)',
                                        }}
                                    />
                                </div>
                                <span className="missing-pct">{info.percentage.toFixed(1)}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Outlier strategy */}
            <div className="card" style={{ padding: 'var(--space-lg)', marginBottom: 'var(--space-lg)' }}>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 'var(--space-md)', color: 'var(--text-secondary)' }}>
                    Outlier Handling Strategy
                </h3>
                <div className="toggle-group">
                    {['cap', 'remove', 'flag'].map((strategy) => (
                        <button
                            key={strategy}
                            className={`toggle-btn ${outlierStrategy === strategy ? 'active' : ''}`}
                            onClick={() => setOutlierStrategy(strategy)}
                        >
                            {strategy === 'cap' ? '🔒 Cap' : strategy === 'remove' ? '🗑️ Remove' : '🚩 Flag'}
                        </button>
                    ))}
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginTop: 'var(--space-sm)' }}>
                    {outlierStrategy === 'cap' && 'Values beyond IQR bounds will be capped to the nearest bound.'}
                    {outlierStrategy === 'remove' && 'Rows containing outlier values will be removed from the dataset.'}
                    {outlierStrategy === 'flag' && 'Outliers will be detected and reported but values remain unchanged.'}
                </p>
            </div>

            {/* Run button */}
            <button
                className="btn btn-primary btn-lg"
                style={{ width: '100%', justifyContent: 'center', marginBottom: 'var(--space-lg)' }}
                onClick={handleClean}
                disabled={isProcessing}
                id="run-cleaning-btn"
            >
                {isProcessing ? (
                    <>
                        <div className="spinner" style={{ width: 18, height: 18 }} />
                        Processing...
                    </>
                ) : (
                    <>
                        <Zap size={18} />
                        Run Auto Cleaning Pipeline
                    </>
                )}
            </button>

            {/* Cleaning results */}
            {cleaningReport && (
                <div className="cleaning-results animate-bounce-in">
                    <div className="card" style={{ padding: 'var(--space-lg)', borderColor: 'rgba(16, 185, 129, 0.3)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-lg)' }}>
                            <CheckCircle size={22} style={{ color: 'var(--accent-success)' }} />
                            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--accent-success)' }}>Cleaning Complete</h3>
                        </div>

                        <div className="grid-3" style={{ marginBottom: 'var(--space-lg)' }}>
                            <div className="result-metric">
                                <span className="metric-label">Original Rows</span>
                                <span className="metric-value">{cleaningReport.originalRowCount.toLocaleString()}</span>
                            </div>
                            <div className="result-metric">
                                <span className="metric-label">Cleaned Rows</span>
                                <span className="metric-value" style={{ color: 'var(--accent-success)' }}>{cleaningReport.cleanedRowCount.toLocaleString()}</span>
                            </div>
                            <div className="result-metric">
                                <span className="metric-label">Rows Removed</span>
                                <span className="metric-value" style={{ color: 'var(--accent-tertiary)' }}>{cleaningReport.rowsRemoved.toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="cleaning-steps">
                            {cleaningReport.steps.map((step, idx) => (
                                <div key={idx} className="step-item" onClick={() => setShowDetails(showDetails === idx ? null : idx)}>
                                    <div className="step-header">
                                        <div className="step-number">{idx + 1}</div>
                                        <div className="step-info">
                                            <strong>{step.name}</strong>
                                            <p>{step.description}</p>
                                        </div>
                                        <CheckCircle size={18} style={{ color: 'var(--accent-success)' }} />
                                    </div>
                                    {showDetails === idx && (
                                        <div className="step-details animate-fade-in">
                                            <pre>{JSON.stringify(step.details, null, 2)}</pre>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
