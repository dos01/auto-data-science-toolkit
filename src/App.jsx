import { useState, useRef, useMemo } from 'react';
import './App.css';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import FileUpload from './components/FileUpload';
import DataPreview from './components/DataPreview';
import DatasetInfo from './components/DatasetInfo';
import CleaningPanel from './components/CleaningPanel';
import EDAPanel from './components/EDAPanel';
import VisualizationDashboard from './components/VisualizationDashboard';
import TransformPanel from './components/TransformPanel';
import ExportPanel from './components/ExportPanel';
import { detectColumnTypes } from './utils/typeDetection';
import { computeSummaryStats } from './utils/statistics';

function App() {
  const [data, setData] = useState(null);
  const [types, setTypes] = useState({});
  const [cleanedData, setCleanedData] = useState(null);
  const [cleaningReport, setCleaningReport] = useState(null);
  const [activePanel, setActivePanel] = useState('upload');
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const vizRef = useRef(null);

  const activeData = cleanedData || data;
  const stats = useMemo(() => {
    if (!activeData) return null;
    return computeSummaryStats(activeData.rows, activeData.columns, types);
  }, [activeData, types]);

  const handleDataLoaded = (result) => {
    const detectedTypes = detectColumnTypes(result.rows, result.columns);
    setData(result);
    setTypes(detectedTypes);
    setCleanedData(null);
    setCleaningReport(null);
    setActivePanel('preview');
  };

  const handleCleaningComplete = (cleaned, report) => {
    setCleanedData(cleaned);
    setCleaningReport(report);
    const newTypes = detectColumnTypes(cleaned.rows, cleaned.columns);
    setTypes(newTypes);
  };

  const handleTransformComplete = (transformed) => {
    setCleanedData(transformed);
    const newTypes = detectColumnTypes(transformed.rows, transformed.columns);
    setTypes(newTypes);
  };

  const renderPanel = () => {
    switch (activePanel) {
      case 'upload':
        return <FileUpload onDataLoaded={handleDataLoaded} isLoading={isLoading} setIsLoading={setIsLoading} />;
      case 'preview':
        return activeData ? <DataPreview data={activeData} types={types} /> : null;
      case 'info':
        return activeData ? <DatasetInfo data={activeData} types={types} /> : null;
      case 'cleaning':
        return data ? <CleaningPanel data={cleanedData || data} types={types} onCleaningComplete={handleCleaningComplete} /> : null;
      case 'eda':
        return activeData ? <EDAPanel data={activeData} types={types} /> : null;
      case 'dashboard':
        return activeData ? <VisualizationDashboard data={activeData} types={types} ref={vizRef} /> : null;
      case 'transform':
        return activeData ? <TransformPanel data={activeData} types={types} onTransformComplete={handleTransformComplete} /> : null;
      case 'export':
        return activeData ? (
          <ExportPanel
            data={activeData}
            stats={stats}
            cleaningReport={cleaningReport}
            columns={activeData.columns}
            vizRef={vizRef}
          />
        ) : null;
      default:
        return null;
    }
  };

  return (
    <div className="app-layout">
      <Sidebar
        activePanel={activePanel}
        setActivePanel={setActivePanel}
        hasData={!!data}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      />
      <div className="app-main">
        <Header data={activeData} />
        <main className="app-content">
          {renderPanel()}
        </main>
      </div>
    </div>
  );
}

export default App;
