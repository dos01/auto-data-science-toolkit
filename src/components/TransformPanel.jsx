import { useState } from 'react';
import { Wrench, ArrowRightLeft, Type, Filter, Columns3 } from 'lucide-react';
import { normalize, standardize, logTransform, filterColumns, renameColumn } from '../utils/transformation';
import { labelEncode, oneHotEncode } from '../utils/encoding';

export default function TransformPanel({ data, types, onTransformComplete }) {
    const [selectedCol, setSelectedCol] = useState('');
    const [transformType, setTransformType] = useState('normalize');
    const [newColName, setNewColName] = useState('');
    const [selectedCols, setSelectedCols] = useState(new Set(data.columns));
    const [encodeType, setEncodeType] = useState('label');
    const [history, setHistory] = useState([]);

    const numericCols = data.columns.filter(c => types[c]?.detected === 'integer' || types[c]?.detected === 'float');
    const catCols = data.columns.filter(c => types[c]?.detected === 'categorical');

    const applyTransform = () => {
        if (!selectedCol) return;
        let result;
        const label = `${transformType} → ${selectedCol}`;

        switch (transformType) {
            case 'normalize': result = normalize(data.rows, selectedCol); break;
            case 'standardize': result = standardize(data.rows, selectedCol); break;
            case 'log': result = logTransform(data.rows, selectedCol); break;
            default: return;
        }

        setHistory(h => [...h, label]);
        onTransformComplete({ ...data, rows: result });
    };

    const applyEncoding = () => {
        if (!selectedCol) return;
        let result;
        if (encodeType === 'label') {
            result = labelEncode(data.rows, selectedCol);
            setHistory(h => [...h, `Label Encode → ${selectedCol}`]);
            onTransformComplete({ ...data, rows: result.data });
        } else {
            result = oneHotEncode(data.rows, selectedCol, data.columns);
            setHistory(h => [...h, `One-Hot Encode → ${selectedCol}`]);
            onTransformComplete({ ...data, rows: result.data, columns: result.columns, columnCount: result.columns.length });
        }
    };

    const applyRename = () => {
        if (!selectedCol || !newColName) return;
        const result = renameColumn(data.rows, data.columns, selectedCol, newColName);
        setHistory(h => [...h, `Rename: ${selectedCol} → ${newColName}`]);
        onTransformComplete({ ...data, rows: result.data, columns: result.columns });
        setNewColName('');
    };

    const applyFilter = () => {
        const cols = [...selectedCols];
        if (cols.length === 0) return;
        const result = filterColumns(data.rows, data.columns, cols);
        setHistory(h => [...h, `Filter: kept ${cols.length} of ${data.columns.length} columns`]);
        onTransformComplete({ ...data, rows: result.data, columns: result.columns, columnCount: result.columns.length });
    };

    const toggleCol = (col) => {
        const next = new Set(selectedCols);
        if (next.has(col)) next.delete(col); else next.add(col);
        setSelectedCols(next);
    };

    return (
        <div className="transform-panel animate-fade-in">
            <div className="section-header">
                <div className="icon"><Wrench size={18} /></div>
                <h2>Data Transformation Tools</h2>
            </div>

            {/* Numeric Transforms */}
            <div className="card" style={{ padding: 'var(--space-lg)', marginBottom: 'var(--space-lg)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                    <ArrowRightLeft size={18} style={{ color: 'var(--accent-primary)' }} />
                    <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Numeric Transformations</h3>
                </div>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
                    <div style={{ flex: 1, minWidth: 180 }}>
                        <label className="form-label">Column</label>
                        <select className="form-select" value={selectedCol} onChange={e => setSelectedCol(e.target.value)} id="transform-col-select">
                            <option value="">Select column...</option>
                            {numericCols.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div style={{ flex: 1, minWidth: 180 }}>
                        <label className="form-label">Transform</label>
                        <div className="toggle-group">
                            {[['normalize', 'Min-Max'], ['standardize', 'Z-Score'], ['log', 'Log']].map(([v, l]) => (
                                <button key={v} className={`toggle-btn ${transformType === v ? 'active' : ''}`} onClick={() => setTransformType(v)}>{l}</button>
                            ))}
                        </div>
                    </div>
                </div>
                <button className="btn btn-primary" onClick={applyTransform} disabled={!selectedCol} id="apply-transform-btn">Apply Transform</button>
            </div>

            {/* Categorical Encoding */}
            <div className="card" style={{ padding: 'var(--space-lg)', marginBottom: 'var(--space-lg)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                    <Type size={18} style={{ color: 'var(--accent-secondary)' }} />
                    <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Categorical Encoding</h3>
                </div>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
                    <div style={{ flex: 1, minWidth: 180 }}>
                        <label className="form-label">Column</label>
                        <select className="form-select" value={selectedCol} onChange={e => setSelectedCol(e.target.value)}>
                            <option value="">Select column...</option>
                            {catCols.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div style={{ flex: 1, minWidth: 180 }}>
                        <label className="form-label">Method</label>
                        <div className="toggle-group">
                            <button className={`toggle-btn ${encodeType === 'label' ? 'active' : ''}`} onClick={() => setEncodeType('label')}>Label</button>
                            <button className={`toggle-btn ${encodeType === 'onehot' ? 'active' : ''}`} onClick={() => setEncodeType('onehot')}>One-Hot</button>
                        </div>
                    </div>
                </div>
                <button className="btn btn-secondary" onClick={applyEncoding} disabled={!selectedCol}>Encode Column</button>
            </div>

            {/* Column Rename */}
            <div className="card" style={{ padding: 'var(--space-lg)', marginBottom: 'var(--space-lg)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                    <Type size={18} style={{ color: 'var(--accent-success)' }} />
                    <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Column Rename</h3>
                </div>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
                    <div style={{ flex: 1, minWidth: 180 }}>
                        <label className="form-label">Column</label>
                        <select className="form-select" value={selectedCol} onChange={e => setSelectedCol(e.target.value)}>
                            <option value="">Select column...</option>
                            {data.columns.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div style={{ flex: 1, minWidth: 180 }}>
                        <label className="form-label">New Name</label>
                        <input className="form-input" value={newColName} onChange={e => setNewColName(e.target.value)} placeholder="Enter new name..." />
                    </div>
                </div>
                <button className="btn btn-secondary" onClick={applyRename} disabled={!selectedCol || !newColName}>Rename</button>
            </div>

            {/* Column Filter */}
            <div className="card" style={{ padding: 'var(--space-lg)', marginBottom: 'var(--space-lg)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                    <Filter size={18} style={{ color: 'var(--accent-warning)' }} />
                    <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Column Filter</h3>
                </div>
                <div className="columns-grid" style={{ marginBottom: 16 }}>
                    {data.columns.map(col => (
                        <label key={col} className={`column-check ${selectedCols.has(col) ? 'checked' : ''}`}>
                            <input type="checkbox" checked={selectedCols.has(col)} onChange={() => toggleCol(col)} />
                            <span>{col}</span>
                        </label>
                    ))}
                </div>
                <button className="btn btn-secondary" onClick={applyFilter}>Apply Filter ({selectedCols.size} columns)</button>
            </div>

            {/* History */}
            {history.length > 0 && (
                <div className="card" style={{ padding: 'var(--space-lg)' }}>
                    <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 12, color: 'var(--text-secondary)' }}>Transform History</h3>
                    {history.map((h, i) => (
                        <div key={i} style={{ padding: '6px 0', fontSize: '0.8rem', color: 'var(--text-tertiary)', borderBottom: '1px solid var(--border-secondary)' }}>
                            <span className="badge badge-cyan" style={{ marginRight: 8 }}>{i + 1}</span>{h}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
