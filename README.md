# 🔬 Auto Data Science Toolkit

> A powerful, fully client-side web application that automatically performs **data cleaning**, **exploratory data analysis (EDA)**, and **statistical analysis** when you upload a dataset — no AI, no backend, no data leaves your machine.

![Auto Data Science Toolkit](https://img.shields.io/badge/version-1.0.0-blue?style=flat-square)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=flat-square&logo=vite)
![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)

---

## ✨ Features

### 📁 Dataset Upload
- Drag-and-drop or click-to-browse file upload
- Supports **CSV**, **Excel (.xlsx)**, and **JSON** formats
- Instant dataset preview (first 10 rows) with column type badges
- Dataset info card: row count, column count, size, type distribution

### 🧹 Automatic Data Cleaning (Rule-Based)
- **Missing Values** — Detected per column with % missing shown as a progress bar; automatically filled using median (numeric) or mode (categorical)
- **Duplicate Rows** — Exact duplicates are detected and removed
- **Outlier Detection** — Using IQR (interquartile range) and Z-score methods with three configurable strategies:
  - **Cap** — Clamp values to the IQR boundary (Winsorization)
  - **Remove** — Drop rows containing outliers
  - **Flag** — Add a boolean column marking outliers
- **Data Type Correction** — Auto-detects and coerces columns to their most likely type (numeric, categorical, datetime, boolean)

### 📊 Exploratory Data Analysis (EDA)
- **Summary Statistics Table** — Count, Mean, Median, Std Dev, Min, Q1, Q3, Max, Skewness for all numeric columns
- **Categorical Summary** — Count, Unique values, Mode, Mode Frequency, Missing for all categorical columns
- **Pearson Correlation Heatmap** — Interactive heatmap of all numeric column correlations
- **Distribution Histograms** — Per-column frequency histograms
- **Bar Charts** — Top-10 category value counts for categorical columns

### 📈 Visualization Dashboard
- Summary tiles (rows, columns, numeric/categorical count)
- Interactive Plotly.js charts:
  - Correlation Heatmap
  - Box Plots (all numeric columns)
  - Density / KDE Plots (bin-based approximation)
  - Scatter Plots for the top correlated column pairs

### 🔧 Data Transformation
- **Normalize** — Min-Max scaling to [0, 1]
- **Standardize** — Z-score normalization (mean=0, std=1)
- **Log Transform** — Natural log (with +1 offset for zeros)
- **Label Encoding** — Map categories to integers
- **One-Hot Encoding** — Expand a categorical column into binary columns
- **Rename Columns** — Rename any column inline
- **Filter Columns** — Drop columns you don't need
- Transformation history tracker

### 📤 Export Options
| Export | Format | Description |
|--------|--------|-------------|
| Cleaned Dataset | `.csv` | The processed, cleaned data |
| Statistical Report | `.csv` | Full summary statistics |
| Data Quality Report | `.txt` | Cleaning log and quality metrics |
| Visualization Report | `.pdf` | Dashboard charts exported to PDF |

---

## 🖥️ Screenshots

| Upload | Cleaning | EDA |
|--------|----------|-----|
| Drag-and-drop with format badges | Missing value bars, outlier strategy, one-click pipeline | Stats table + correlation heatmap |

| Dashboard | Export |
|-----------|--------|
| Interactive Plotly charts | CSV, PDF, TXT download cards |

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) v18 or higher
- npm v9 or higher

### Installation

```bash
# Clone the repository
git clone https://github.com/dos01/auto-data-science-toolkit.git
cd auto-data-science-toolkit

# Install dependencies
npm install

# Start the development server
npm run dev
```

Then open your browser and navigate to **http://localhost:5173/**

### Build for Production

```bash
npm run build
# Output will be in the /dist directory
```

---

## 📂 Project Structure

```
auto-data-science-toolkit/
├── public/
│   └── sample_data.csv          # Sample test dataset
├── src/
│   ├── components/
│   │   ├── FileUpload.jsx        # Drag-and-drop upload zone
│   │   ├── DataPreview.jsx       # Paginated data table
│   │   ├── DatasetInfo.jsx       # Summary cards & type distribution
│   │   ├── CleaningPanel.jsx     # Rule-based cleaning UI
│   │   ├── EDAPanel.jsx          # Statistics & correlation heatmap
│   │   ├── VisualizationDashboard.jsx  # Interactive chart dashboard
│   │   ├── TransformPanel.jsx    # Transform tools & history
│   │   ├── ExportPanel.jsx       # Download options
│   │   ├── Sidebar.jsx           # Navigation
│   │   └── Header.jsx            # App header
│   ├── utils/
│   │   ├── parser.js             # CSV / XLSX / JSON parsing
│   │   ├── typeDetection.js      # Auto column type detection
│   │   ├── statistics.js         # Summary stats, correlation matrix
│   │   ├── cleaning.js           # Missing values, duplicates, outliers
│   │   ├── encoding.js           # Label & one-hot encoding
│   │   ├── transformation.js     # Normalize, standardize, log transform
│   │   └── export.js             # CSV, TXT, PDF export
│   ├── App.jsx                   # Root component & state management
│   ├── App.css                   # Layout & component styles
│   └── index.css                 # Design system (dark theme, tokens)
├── index.html
├── package.json
└── vite.config.js
```

---

## 🛠️ Tech Stack

| Library | Purpose |
|---------|---------|
| [Vite](https://vitejs.dev/) + [React 18](https://react.dev/) | Frontend framework & build tool |
| [PapaParse](https://www.papaparse.com/) | CSV parsing |
| [SheetJS (xlsx)](https://sheetjs.com/) | Excel file parsing |
| [Plotly.js](https://plotly.com/javascript/) via `react-plotly.js` | Interactive charts |
| [simple-statistics](https://simplestatistics.org/) | Statistical computations |
| [jsPDF](https://github.com/parallax/jsPDF) + [html2canvas](https://html2canvas.hertzen.com/) | PDF export |
| [lucide-react](https://lucide.dev/) | Icons |

---

## 🔒 Privacy & Security

- ✅ **100% client-side** — all processing happens in your browser
- ✅ **No backend** — no server receives your data
- ✅ **No API keys or secrets** — zero external service dependencies
- ✅ **No storage** — data is cleared when you close or refresh the tab

Your datasets never leave your machine.

---

## 🤖 No AI / ML

All processing is implemented using **deterministic algorithms and rule-based logic only**:
- Statistical methods (IQR, Z-score, Pearson correlation, skewness)
- Rule-based imputation (median/mode fill)
- Deterministic encoding (label mapping, binary expansion)

No machine learning models or generative AI are used anywhere in this application.

---

## 📋 Sample Dataset

A sample CSV is included at `public/sample_data.csv` to test all features immediately after setup. It contains intentional missing values, a duplicate row, and an outlier for demonstration purposes.

---

## 📄 License

MIT License — feel free to use, modify, and distribute.
