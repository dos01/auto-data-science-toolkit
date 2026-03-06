import { Database, Clock } from 'lucide-react';

export default function Header({ data }) {
    return (
        <header className="app-header">
            <div className="header-left">
                <h1 className="header-title">
                    <span className="gradient-text">Auto Data Science</span> Toolkit
                </h1>
            </div>
            {data && (
                <div className="header-right">
                    <div className="header-chip">
                        <Database size={14} />
                        <span>{data.fileName}</span>
                    </div>
                    <div className="header-chip">
                        <Clock size={14} />
                        <span>{data.rowCount.toLocaleString()} rows × {data.columnCount} cols</span>
                    </div>
                </div>
            )}
        </header>
    );
}
