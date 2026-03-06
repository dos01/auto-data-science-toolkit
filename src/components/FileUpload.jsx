import { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, FileJson, FileText, X, CheckCircle } from 'lucide-react';
import { parseFile } from '../utils/parser';

export default function FileUpload({ onDataLoaded, isLoading, setIsLoading }) {
    const [dragActive, setDragActive] = useState(false);
    const [error, setError] = useState(null);
    const [fileName, setFileName] = useState(null);
    const fileInputRef = useRef(null);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
        else if (e.type === 'dragleave') setDragActive(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        const file = e.dataTransfer.files[0];
        if (file) processFile(file);
    };

    const handleChange = (e) => {
        const file = e.target.files[0];
        if (file) processFile(file);
    };

    const processFile = async (file) => {
        setError(null);
        setIsLoading(true);
        setFileName(file.name);

        try {
            const result = await parseFile(file);
            onDataLoaded(result);
        } catch (err) {
            setError(err.message);
            setFileName(null);
        } finally {
            setIsLoading(false);
        }
    };

    const getFileIcon = (name) => {
        if (!name) return <Upload size={48} />;
        const ext = name.split('.').pop().toLowerCase();
        if (ext === 'csv') return <FileText size={48} />;
        if (ext === 'xlsx' || ext === 'xls') return <FileSpreadsheet size={48} />;
        if (ext === 'json') return <FileJson size={48} />;
        return <Upload size={48} />;
    };

    return (
        <div className="file-upload-container animate-fade-in">
            <div className="upload-hero">
                <div className="upload-hero-icon">
                    <Upload size={32} />
                </div>
                <h1>Auto Data Science Toolkit</h1>
                <p>Upload your dataset to get started with automatic cleaning, analysis, and visualization</p>
            </div>

            <div
                className={`upload-zone ${dragActive ? 'drag-active' : ''} ${fileName ? 'has-file' : ''} ${error ? 'has-error' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.xlsx,.xls,.json"
                    onChange={handleChange}
                    style={{ display: 'none' }}
                    id="file-upload-input"
                />

                {isLoading ? (
                    <div className="upload-loading">
                        <div className="spinner" />
                        <p>Processing <strong>{fileName}</strong>...</p>
                    </div>
                ) : fileName && !error ? (
                    <div className="upload-success">
                        <CheckCircle size={48} className="success-icon" />
                        <p><strong>{fileName}</strong> loaded successfully!</p>
                    </div>
                ) : (
                    <div className="upload-prompt">
                        {getFileIcon(fileName)}
                        <h3>Drag & drop your dataset here</h3>
                        <p>or click to browse files</p>
                        <div className="supported-formats">
                            <span className="badge badge-cyan">CSV</span>
                            <span className="badge badge-purple">XLSX</span>
                            <span className="badge badge-green">JSON</span>
                        </div>
                    </div>
                )}
            </div>

            {error && (
                <div className="upload-error animate-bounce-in">
                    <X size={18} />
                    <span>{error}</span>
                    <button className="btn btn-ghost btn-sm" onClick={() => { setError(null); setFileName(null); }}>
                        Try Again
                    </button>
                </div>
            )}

            <div className="upload-features grid-3">
                <div className="feature-card card">
                    <div className="feature-icon" style={{ background: 'rgba(6, 182, 212, 0.15)' }}>
                        <FileText size={22} color="var(--accent-primary)" />
                    </div>
                    <h4>Auto Cleaning</h4>
                    <p>Missing values, duplicates, outliers handled automatically</p>
                </div>
                <div className="feature-card card">
                    <div className="feature-icon" style={{ background: 'rgba(139, 92, 246, 0.15)' }}>
                        <FileSpreadsheet size={22} color="var(--accent-secondary)" />
                    </div>
                    <h4>Smart EDA</h4>
                    <p>Summary statistics, correlations, and distributions</p>
                </div>
                <div className="feature-card card">
                    <div className="feature-icon" style={{ background: 'rgba(16, 185, 129, 0.15)' }}>
                        <FileJson size={22} color="var(--accent-success)" />
                    </div>
                    <h4>Interactive Charts</h4>
                    <p>Plotly-powered interactive visualization dashboard</p>
                </div>
            </div>
        </div>
    );
}
