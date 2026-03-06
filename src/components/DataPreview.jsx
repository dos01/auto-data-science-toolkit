import { Table, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { getTypeBadge } from '../utils/typeDetection';

export default function DataPreview({ data, types }) {
    const [page, setPage] = useState(0);
    const pageSize = 10;
    const totalPages = Math.ceil(data.rows.length / pageSize);
    const startRow = page * pageSize;
    const visibleRows = data.rows.slice(startRow, startRow + pageSize);

    return (
        <div className="data-preview animate-fade-in">
            <div className="section-header">
                <div className="icon"><Table size={18} /></div>
                <h2>Dataset Preview</h2>
                <span className="badge badge-cyan" style={{ marginLeft: 'auto' }}>
                    Showing {startRow + 1}–{Math.min(startRow + pageSize, data.rows.length)} of {data.rows.length}
                </span>
            </div>

            <div className="table-wrapper card" style={{ padding: 0, overflow: 'hidden' }}>
                <div className="table-scroll">
                    <table className="data-table" id="preview-table">
                        <thead>
                            <tr>
                                <th style={{ width: '50px' }}>#</th>
                                {data.columns.map((col) => (
                                    <th key={col}>
                                        <div className="th-content">
                                            <span>{col}</span>
                                            {types[col] && (
                                                <span className={`badge ${getTypeBadge(types[col].detected).className}`} style={{ marginLeft: 6, fontSize: '0.6rem' }}>
                                                    {getTypeBadge(types[col].detected).label}
                                                </span>
                                            )}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {visibleRows.map((row, idx) => (
                                <tr key={idx}>
                                    <td style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>{startRow + idx + 1}</td>
                                    {data.columns.map((col) => (
                                        <td key={col}>
                                            {row[col] === null || row[col] === undefined ? (
                                                <span style={{ color: 'var(--accent-tertiary)', fontStyle: 'italic', opacity: 0.6 }}>null</span>
                                            ) : (
                                                String(row[col]).length > 50
                                                    ? String(row[col]).substring(0, 50) + '…'
                                                    : String(row[col])
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {totalPages > 1 && (
                <div className="table-pagination">
                    <button className="btn btn-ghost btn-sm" disabled={page === 0} onClick={() => setPage(page - 1)}>
                        <ChevronLeft size={16} /> Previous
                    </button>
                    <span className="page-info">Page {page + 1} of {totalPages}</span>
                    <button className="btn btn-ghost btn-sm" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>
                        Next <ChevronRight size={16} />
                    </button>
                </div>
            )}
        </div>
    );
}
