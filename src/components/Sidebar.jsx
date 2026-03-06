import { Upload, Eye, Info, Sparkles, BarChart3, LayoutDashboard, Wrench, Download, ChevronLeft, ChevronRight, Zap } from 'lucide-react';

const NAV_ITEMS = [
    { id: 'upload', label: 'Upload', icon: Upload },
    { id: 'preview', label: 'Preview', icon: Eye },
    { id: 'info', label: 'Dataset Info', icon: Info },
    { id: 'cleaning', label: 'Cleaning', icon: Sparkles },
    { id: 'eda', label: 'EDA', icon: BarChart3 },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transform', label: 'Transform', icon: Wrench },
    { id: 'export', label: 'Export', icon: Download },
];

export default function Sidebar({ activePanel, setActivePanel, hasData, collapsed, setCollapsed }) {
    return (
        <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
            <div className="sidebar-header">
                {!collapsed && (
                    <div className="sidebar-brand">
                        <div className="brand-icon">
                            <Zap size={20} />
                        </div>
                        <span className="brand-text">ADST</span>
                    </div>
                )}
                <button className="btn btn-ghost sidebar-toggle" onClick={() => setCollapsed(!collapsed)} aria-label="Toggle sidebar">
                    {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                </button>
            </div>

            <nav className="sidebar-nav">
                {NAV_ITEMS.map((item) => {
                    const Icon = item.icon;
                    const disabled = item.id !== 'upload' && !hasData;
                    return (
                        <button
                            key={item.id}
                            className={`sidebar-item ${activePanel === item.id ? 'active' : ''} ${disabled ? 'disabled' : ''}`}
                            onClick={() => !disabled && setActivePanel(item.id)}
                            disabled={disabled}
                            title={collapsed ? item.label : undefined}
                            id={`nav-${item.id}`}
                        >
                            <Icon size={18} />
                            {!collapsed && <span>{item.label}</span>}
                            {activePanel === item.id && <div className="active-indicator" />}
                        </button>
                    );
                })}
            </nav>

            {!collapsed && (
                <div className="sidebar-footer">
                    <p>Auto Data Science Toolkit</p>
                    <p className="version">v1.0.0</p>
                </div>
            )}
        </aside>
    );
}
