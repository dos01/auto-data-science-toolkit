import { useMemo, forwardRef } from 'react';
import Plot from 'react-plotly.js';
import { LayoutDashboard, AlertTriangle } from 'lucide-react';
import { computeSummaryStats, computeCorrelationMatrix } from '../utils/statistics';
import { getMissingValueSummary } from '../utils/cleaning';

const PLOT_LAYOUT = {
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(17,24,39,0.5)',
    font: { family: 'Inter, sans-serif', color: '#94a3b8', size: 11 },
    margin: { t: 40, b: 50, l: 60, r: 20 },
    xaxis: { gridcolor: 'rgba(148,163,184,0.08)', zerolinecolor: 'rgba(148,163,184,0.1)' },
    yaxis: { gridcolor: 'rgba(148,163,184,0.08)', zerolinecolor: 'rgba(148,163,184,0.1)' },
};
const PLOT_CFG = { displayModeBar: true, responsive: true, displaylogo: false };
const PLOT_CFG_SMALL = { ...PLOT_CFG, displayModeBar: false };

function getNumericValues(rows, col) {
    return rows.map(r => r[col]).filter(v => v !== null && v !== undefined && !isNaN(Number(v))).map(Number);
}

function getTopPairs(corr) {
    const pairs = [];
    for (let i = 0; i < corr.columns.length; i++)
        for (let j = i + 1; j < corr.columns.length; j++)
            pairs.push({ col1: corr.columns[i], col2: corr.columns[j], value: corr.matrix[i][j], abs: Math.abs(corr.matrix[i][j]) });
    return pairs.sort((a, b) => b.abs - a.abs);
}

function MissingChart({ missingData }) {
    const cols = Object.entries(missingData).filter(([, v]) => v.count > 0);
    if (!cols.length) return null;
    return (
        <div className="card" style={{ padding: 'var(--space-lg)', marginBottom: 'var(--space-lg)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <AlertTriangle size={18} style={{ color: 'var(--accent-warning)' }} />
                <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Missing Values</h3>
            </div>
            <Plot data={[{
                x: cols.map(c => c[0]), y: cols.map(c => c[1].percentage), type: 'bar',
                marker: { color: cols.map(c => c[1].percentage > 50 ? '#ef4444' : c[1].percentage > 20 ? '#f59e0b' : '#06b6d4') },
                text: cols.map(c => c[1].percentage.toFixed(1) + '%'), textposition: 'outside',
                textfont: { color: '#94a3b8', size: 10 }, hovertemplate: '%{x}: %{y:.1f}%<extra></extra>'
            }]}
                layout={{
                    ...PLOT_LAYOUT, height: 350, title: { text: 'Missing Values (%)', font: { size: 13, color: '#94a3b8' } },
                    yaxis: { ...PLOT_LAYOUT.yaxis, title: 'Missing %' }, xaxis: { ...PLOT_LAYOUT.xaxis, tickangle: -30 }
                }}
                config={PLOT_CFG} style={{ width: '100%' }} id="missing-values-chart" />
        </div>
    );
}

function HeatmapChart({ correlation }) {
    if (correlation.columns.length < 2) return null;
    return (
        <div className="card" style={{ padding: 'var(--space-lg)', marginBottom: 'var(--space-lg)' }}>
            <Plot data={[{
                z: correlation.matrix.map(r => r.map(v => +v.toFixed(2))), x: correlation.columns, y: correlation.columns,
                type: 'heatmap', colorscale: [[0, '#8b5cf6'], [0.5, '#111827'], [1, '#06b6d4']], zmin: -1, zmax: 1,
                text: correlation.matrix.map(r => r.map(v => v.toFixed(2))), texttemplate: '%{text}',
                textfont: { color: '#f1f5f9', size: 11 }, hovertemplate: '%{x} × %{y}: %{z:.3f}<extra></extra>'
            }]}
                layout={{
                    ...PLOT_LAYOUT, title: { text: 'Correlation Heatmap', font: { size: 13, color: '#94a3b8' } },
                    height: Math.max(400, correlation.columns.length * 40 + 120),
                    xaxis: { ...PLOT_LAYOUT.xaxis, tickangle: -45 }, yaxis: { ...PLOT_LAYOUT.yaxis, autorange: 'reversed' }
                }}
                config={PLOT_CFG} style={{ width: '100%' }} id="viz-correlation-heatmap" />
        </div>
    );
}

function BoxPlots({ numericCols, rows }) {
    if (!numericCols.length) return null;
    return (
        <div className="card" style={{ padding: 'var(--space-lg)', marginBottom: 'var(--space-lg)' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 16, color: 'var(--text-secondary)' }}>Box Plots</h3>
            <div className="chart-grid">
                {numericCols.slice(0, 12).map(col => (
                    <div key={col} className="chart-item">
                        <Plot data={[{
                            y: getNumericValues(rows, col), type: 'box', name: col,
                            marker: { color: '#06b6d4', outliercolor: '#f43f5e' }, line: { color: '#22d3ee' },
                            fillcolor: 'rgba(6,182,212,0.15)', boxmean: true
                        }]}
                            layout={{
                                ...PLOT_LAYOUT, title: { text: col, font: { size: 12, color: '#f1f5f9' } },
                                height: 280, margin: { t: 35, b: 25, l: 50, r: 10 }, showlegend: false
                            }}
                            config={PLOT_CFG_SMALL} style={{ width: '100%' }} />
                    </div>
                ))}
            </div>
        </div>
    );
}

function DensityPlots({ numericCols, rows }) {
    if (!numericCols.length) return null;
    return (
        <div className="card" style={{ padding: 'var(--space-lg)', marginBottom: 'var(--space-lg)' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 16, color: 'var(--text-secondary)' }}>Density Plots</h3>
            <div className="chart-grid">
                {numericCols.slice(0, 8).map(col => (
                    <div key={col} className="chart-item">
                        <Plot data={[{
                            x: getNumericValues(rows, col), type: 'violin', name: col, side: 'positive',
                            line: { color: '#8b5cf6', width: 2 }, fillcolor: 'rgba(139,92,246,0.2)',
                            meanline: { visible: true, color: '#f59e0b' }, hoverinfo: 'x'
                        }]}
                            layout={{
                                ...PLOT_LAYOUT, title: { text: col, font: { size: 12, color: '#f1f5f9' } },
                                height: 250, margin: { t: 35, b: 25, l: 50, r: 10 }, showlegend: false
                            }}
                            config={PLOT_CFG_SMALL} style={{ width: '100%' }} />
                    </div>
                ))}
            </div>
        </div>
    );
}

function ScatterPlots({ correlation, rows }) {
    if (correlation.columns.length < 2) return null;
    const pairs = getTopPairs(correlation).slice(0, 6);
    return (
        <div className="card" style={{ padding: 'var(--space-lg)' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 16, color: 'var(--text-secondary)' }}>Column Relationships</h3>
            <div className="chart-grid">
                {pairs.map(({ col1, col2, value }) => {
                    const x = getNumericValues(rows, col1), y = getNumericValues(rows, col2);
                    const len = Math.min(x.length, y.length);
                    return (
                        <div key={`${col1}-${col2}`} className="chart-item">
                            <Plot data={[{
                                x: x.slice(0, len), y: y.slice(0, len), type: 'scattergl', mode: 'markers',
                                marker: { color: 'rgba(6,182,212,0.4)', size: 4 },
                                hovertemplate: `${col1}: %{x}<br>${col2}: %{y}<extra></extra>`
                            }]}
                                layout={{
                                    ...PLOT_LAYOUT, title: { text: `${col1} vs ${col2} (r=${value.toFixed(2)})`, font: { size: 11, color: '#f1f5f9' } },
                                    height: 280, margin: { t: 35, b: 40, l: 50, r: 10 }
                                }}
                                config={PLOT_CFG_SMALL} style={{ width: '100%' }} />
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

const VisualizationDashboard = forwardRef(function VisualizationDashboard({ data, types }, ref) {
    const stats = useMemo(() => computeSummaryStats(data.rows, data.columns, types), [data, types]);
    const correlation = useMemo(() => computeCorrelationMatrix(data.rows, data.columns, types), [data, types]);
    const missingData = useMemo(() => getMissingValueSummary(data.rows, data.columns), [data]);
    const numericCols = data.columns.filter(c => types[c]?.detected === 'integer' || types[c]?.detected === 'float');

    return (
        <div className="viz-dashboard animate-fade-in" ref={ref}>
            <div className="section-header">
                <div className="icon"><LayoutDashboard size={18} /></div>
                <h2>Visualization Dashboard</h2>
            </div>
            <div className="grid-4" style={{ marginBottom: 'var(--space-lg)' }}>
                {[['Rows', data.rowCount], ['Columns', data.columnCount], ['Numeric', numericCols.length],
                ['Categorical', data.columns.filter(c => types[c]?.detected === 'categorical').length]].map(([l, v]) => (
                    <div key={l} className="card stat-card"><div className="stat-value">{v.toLocaleString()}</div><div className="stat-label">{l}</div></div>
                ))}
            </div>
            <MissingChart missingData={missingData} />
            <HeatmapChart correlation={correlation} />
            <BoxPlots numericCols={numericCols} rows={data.rows} />
            <DensityPlots numericCols={numericCols} rows={data.rows} />
            <ScatterPlots correlation={correlation} rows={data.rows} />
        </div>
    );
});

export default VisualizationDashboard;
