import { useMemo } from 'react';
import Plot from 'react-plotly.js';
import { BarChart3, TrendingUp } from 'lucide-react';
import { computeSummaryStats, computeCorrelationMatrix } from '../utils/statistics';

export default function EDAPanel({ data, types }) {
    const stats = useMemo(() => computeSummaryStats(data.rows, data.columns, types), [data, types]);
    const correlation = useMemo(() => computeCorrelationMatrix(data.rows, data.columns, types), [data, types]);

    const numericCols = data.columns.filter(
        (c) => types[c]?.detected === 'integer' || types[c]?.detected === 'float'
    );
    const catCols = data.columns.filter((c) => types[c]?.detected === 'categorical');

    const plotLayout = {
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(17,24,39,0.5)',
        font: { family: 'Inter, sans-serif', color: '#94a3b8', size: 11 },
        margin: { t: 40, b: 50, l: 60, r: 20 },
        xaxis: { gridcolor: 'rgba(148,163,184,0.08)', zerolinecolor: 'rgba(148,163,184,0.1)' },
        yaxis: { gridcolor: 'rgba(148,163,184,0.08)', zerolinecolor: 'rgba(148,163,184,0.1)' },
    };

    const plotConfig = { displayModeBar: true, responsive: true, displaylogo: false };

    return (
        <div className="eda-panel animate-fade-in">
            <div className="section-header">
                <div className="icon"><BarChart3 size={18} /></div>
                <h2>Exploratory Data Analysis</h2>
            </div>

            {/* Summary Statistics Table */}
            <div className="card" style={{ padding: 'var(--space-lg)', marginBottom: 'var(--space-lg)' }}>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 'var(--space-md)', color: 'var(--text-secondary)' }}>
                    Summary Statistics (Numeric Columns)
                </h3>
                <div className="table-scroll">
                    <table className="data-table" id="stats-table">
                        <thead>
                            <tr>
                                <th>Column</th>
                                <th>Count</th>
                                <th>Mean</th>
                                <th>Median</th>
                                <th>Std Dev</th>
                                <th>Min</th>
                                <th>Q1</th>
                                <th>Q3</th>
                                <th>Max</th>
                                <th>Skewness</th>
                            </tr>
                        </thead>
                        <tbody>
                            {numericCols.map((col) => {
                                const s = stats[col];
                                if (!s || s.mean === undefined) return null;
                                return (
                                    <tr key={col}>
                                        <td style={{ fontFamily: 'var(--font-sans)', fontWeight: 500 }}>{col}</td>
                                        <td>{s.count}</td>
                                        <td>{s.mean.toFixed(2)}</td>
                                        <td>{s.median.toFixed(2)}</td>
                                        <td>{s.stddev.toFixed(2)}</td>
                                        <td>{s.min.toFixed(2)}</td>
                                        <td>{s.q1.toFixed(2)}</td>
                                        <td>{s.q3.toFixed(2)}</td>
                                        <td>{s.max.toFixed(2)}</td>
                                        <td>{s.skewness.toFixed(3)}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Categorical Summary */}
            {catCols.length > 0 && (
                <div className="card" style={{ padding: 'var(--space-lg)', marginBottom: 'var(--space-lg)' }}>
                    <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 'var(--space-md)', color: 'var(--text-secondary)' }}>
                        Categorical Column Summary
                    </h3>
                    <div className="table-scroll">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Column</th>
                                    <th>Count</th>
                                    <th>Unique</th>
                                    <th>Mode</th>
                                    <th>Mode Freq.</th>
                                    <th>Missing</th>
                                </tr>
                            </thead>
                            <tbody>
                                {catCols.map((col) => {
                                    const s = stats[col];
                                    if (!s) return null;
                                    return (
                                        <tr key={col}>
                                            <td style={{ fontFamily: 'var(--font-sans)', fontWeight: 500 }}>{col}</td>
                                            <td>{s.count}</td>
                                            <td>{s.uniqueCount}</td>
                                            <td>{s.mode || '—'}</td>
                                            <td>{s.modeFrequency}</td>
                                            <td>{s.missing}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Correlation Heatmap */}
            {correlation.columns.length >= 2 && (
                <div className="card" style={{ padding: 'var(--space-lg)', marginBottom: 'var(--space-lg)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)' }}>
                        <TrendingUp size={18} style={{ color: 'var(--accent-secondary)' }} />
                        <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Correlation Matrix</h3>
                    </div>
                    <Plot
                        data={[{
                            z: correlation.matrix.map(row => row.map(v => Math.round(v * 100) / 100)),
                            x: correlation.columns,
                            y: correlation.columns,
                            type: 'heatmap',
                            colorscale: [
                                [0, '#8b5cf6'],
                                [0.5, '#0a0e1a'],
                                [1, '#06b6d4'],
                            ],
                            zmin: -1,
                            zmax: 1,
                            text: correlation.matrix.map(row => row.map(v => v.toFixed(2))),
                            texttemplate: '%{text}',
                            textfont: { color: '#f1f5f9', size: 11 },
                            hovertemplate: '%{x} × %{y}: %{z:.3f}<extra></extra>',
                        }]}
                        layout={{
                            ...plotLayout,
                            title: { text: 'Pearson Correlation Heatmap', font: { size: 14, color: '#94a3b8' } },
                            height: Math.max(400, correlation.columns.length * 45 + 100),
                            xaxis: { ...plotLayout.xaxis, tickangle: -45 },
                            yaxis: { ...plotLayout.yaxis, autorange: 'reversed' },
                        }}
                        config={plotConfig}
                        style={{ width: '100%' }}
                        id="correlation-heatmap"
                    />
                </div>
            )}

            {/* Distribution Plots */}
            {numericCols.length > 0 && (
                <div className="card" style={{ padding: 'var(--space-lg)', marginBottom: 'var(--space-lg)' }}>
                    <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 'var(--space-md)', color: 'var(--text-secondary)' }}>
                        Distribution Analysis
                    </h3>
                    <div className="chart-grid">
                        {numericCols.slice(0, 12).map((col) => {
                            const values = data.rows
                                .map((r) => r[col])
                                .filter((v) => v !== null && v !== undefined && !isNaN(Number(v)))
                                .map(Number);

                            return (
                                <div key={col} className="chart-item">
                                    <Plot
                                        data={[{
                                            x: values,
                                            type: 'histogram',
                                            marker: {
                                                color: 'rgba(6, 182, 212, 0.6)',
                                                line: { color: 'rgba(6, 182, 212, 0.9)', width: 1 },
                                            },
                                            nbinsx: 30,
                                            hovertemplate: 'Range: %{x}<br>Count: %{y}<extra></extra>',
                                        }]}
                                        layout={{
                                            ...plotLayout,
                                            title: { text: col, font: { size: 12, color: '#f1f5f9' } },
                                            height: 250,
                                            margin: { t: 35, b: 35, l: 45, r: 10 },
                                            bargap: 0.05,
                                        }}
                                        config={{ ...plotConfig, displayModeBar: false }}
                                        style={{ width: '100%' }}
                                    />
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Categorical Bar Charts */}
            {catCols.length > 0 && (
                <div className="card" style={{ padding: 'var(--space-lg)' }}>
                    <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 'var(--space-md)', color: 'var(--text-secondary)' }}>
                        Categorical Analysis
                    </h3>
                    <div className="chart-grid">
                        {catCols.slice(0, 8).map((col) => {
                            const s = stats[col];
                            if (!s || !s.topValues) return null;
                            const topVals = s.topValues.slice(0, 10);
                            return (
                                <div key={col} className="chart-item">
                                    <Plot
                                        data={[{
                                            x: topVals.map((v) => v[0]),
                                            y: topVals.map((v) => v[1]),
                                            type: 'bar',
                                            marker: {
                                                color: topVals.map((_, i) =>
                                                    `hsl(${180 + i * 20}, 70%, 55%)`
                                                ),
                                                line: { width: 0 },
                                            },
                                            hovertemplate: '%{x}: %{y}<extra></extra>',
                                        }]}
                                        layout={{
                                            ...plotLayout,
                                            title: { text: col, font: { size: 12, color: '#f1f5f9' } },
                                            height: 250,
                                            margin: { t: 35, b: 60, l: 45, r: 10 },
                                            xaxis: { ...plotLayout.xaxis, tickangle: -30 },
                                        }}
                                        config={{ ...plotConfig, displayModeBar: false }}
                                        style={{ width: '100%' }}
                                    />
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
