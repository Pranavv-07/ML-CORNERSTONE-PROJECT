<div align="center">

<img src="https://readme-typing-svg.demolab.com?font=Inter&weight=700&size=36&duration=3000&pause=1000&color=2563EB&center=true&vCenter=true&width=700&lines=ML+Cornerstone;Model+Evaluation+%26+Explainability+Studio;End-to-End+AutoML+Pipeline" alt="Typing SVG" />

<br/>

[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18+-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![scikit-learn](https://img.shields.io/badge/scikit--learn-latest-F7931E?style=for-the-badge&logo=scikit-learn&logoColor=white)](https://scikit-learn.org)
[![XGBoost](https://img.shields.io/badge/XGBoost-latest-FF6600?style=for-the-badge)](https://xgboost.ai)
[![SHAP](https://img.shields.io/badge/SHAP-Explainability-8B5CF6?style=for-the-badge)](https://shap.readthedocs.io)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)

<br/>

> **A full-stack, production-grade machine learning studio** that takes you from raw CSV to trained models, SHAP explanations, live predictions, and exportable PDF reports — all through a clean, professional web interface.

<br/>

[**Live Demo**](#) · [**API Docs**](http://localhost:8000/docs) · [**Report Bug**](#) · [**Request Feature**](#)

</div>

---

## 📋 Table of Contents

- [🎯 What is ML Cornerstone?](#-what-is-ml-cornerstone)
- [✨ Feature Highlights](#-feature-highlights)
- [🏗️ System Architecture](#️-system-architecture)
- [📊 Data Flow & Pipeline](#-data-flow--pipeline)
- [🔬 ML Algorithms & Techniques](#-ml-algorithms--techniques)
- [🧠 SHAP Explainability Deep Dive](#-shap-explainability-deep-dive)
- [🗂️ Project Structure](#️-project-structure)
- [⚙️ API Reference](#️-api-reference)
- [🗃️ Database Schema](#️-database-schema)
- [🔄 Workflow State Machine](#-workflow-state-machine)
- [📈 Performance & Benchmarks](#-performance--benchmarks)
- [🚀 Getting Started](#-getting-started)
- [🧪 Running Tests](#-running-tests)
- [🤝 Contributing](#-contributing)

---

## 🎯 What is ML Cornerstone?

ML Cornerstone is a **full-stack AutoML studio** designed for data scientists, ML engineers, and analysts who need a repeatable, explainable, and shareable machine learning workflow — without writing boilerplate. It automates the most tedious parts of the ML lifecycle while keeping every decision transparent and overridable.

```
Upload CSV → Auto-Profile → Configure Preprocessing → Auto-Detect Problem Type
    → Train 9+ Models in Parallel → Compare Performance → Deep Evaluate
    → SHAP Explain → Live Predict → Export (ZIP / CSV / PDF)
```

---

## ✨ Feature Highlights

| Feature | Description |
|---|---|
| 🔍 **Auto Data Profiling** | Column types, missing %, unique counts, statistical summaries |
| ⚙️ **Configurable Preprocessing** | Imputation, encoding, scaling — fitted on train-only (no leakage) |
| 🤖 **Problem Auto-Detection** | Classifies target as Classification or Regression with rationale |
| 🏋️ **Parallel Training** | Trains up to 9 models concurrently via async background tasks |
| 📊 **Multi-Model Comparison** | Sortable leaderboard with champion recommendation |
| 🔬 **Deep Evaluation** | Confusion matrix, ROC, PR curves, cross-validation fold charts |
| 💡 **SHAP Explainability** | TreeExplainer / LinearExplainer / KernelExplainer per model type |
| 🎯 **Live Predictions** | Single-row inference with real-time SHAP contribution waterfall |
| 📦 **Export Artifacts** | Model `.zip`, comparison `.csv`, full PDF report |
| 🌐 **REST API** | Full OpenAPI/Swagger documentation at `/docs` |

---

## 🏗️ System Architecture

```mermaid
graph TB
    subgraph CLIENT["🌐 Frontend — React 18 + TypeScript + Vite"]
        UI["Studio UI<br/>9-Stage Workflow"]
        CTX["StudioContext<br/>Global State"]
        API_CLIENT["Axios API Client<br/>client.ts"]
        UI <--> CTX
        CTX --> API_CLIENT
    end

    subgraph GATEWAY["🔀 API Gateway"]
        NGINX["Vite Proxy<br/>/api → :8000"]
    end

    subgraph BACKEND["⚡ Backend — FastAPI + Python"]
        MAIN["main.py<br/>App Entry + CORS"]
        
        subgraph ROUTERS["📡 Routers"]
            R1["datasets.py"]
            R2["preprocessing.py"]
            R3["models.py"]
            R4["explainability.py"]
            R5["predictions.py"]
            R6["exports.py"]
        end

        subgraph SERVICES["🔧 Services / Core Logic"]
            S1["DataProfiler"]
            S2["PreprocessingPipeline<br/>ColumnTransformer"]
            S3["ModelTrainer<br/>Async Background"]
            S4["ModelEvaluator<br/>Metrics + Curves"]
            S5["SHAPExplainer<br/>Tree/Linear/Kernel"]
            S6["PDFReportGenerator"]
        end

        MAIN --> ROUTERS
        ROUTERS --> SERVICES
    end

    subgraph STORAGE["🗄️ Storage Layer"]
        DB["SQLite<br/>experiments.db"]
        FS["File System<br/>models/ datasets/ exports/"]
    end

    subgraph ML["🤖 ML Stack"]
        SKL["scikit-learn"]
        XGB["XGBoost"]
        SHAP_LIB["SHAP"]
        PANDAS["Pandas + NumPy"]
        JOBLIB["Joblib Serialization"]
    end

    API_CLIENT -->|"HTTP REST"| NGINX
    NGINX --> MAIN
    SERVICES --> DB
    SERVICES --> FS
    SERVICES --> ML
```

---

## 📊 Data Flow & Pipeline

### End-to-End Request Flow

```mermaid
sequenceDiagram
    participant U as 👤 User
    participant FE as ⚛️ React Frontend
    participant API as ⚡ FastAPI
    participant DB as 🗄️ SQLite
    participant ML as 🤖 ML Engine

    U->>FE: Upload CSV file
    FE->>API: POST /api/v1/datasets/upload
    API->>DB: Store dataset metadata
    API-->>FE: DatasetInfo (id, cols, rows, suggestions)

    U->>FE: Click "Analyze Dataset"
    FE->>API: POST /api/v1/datasets/{id}/profile
    API->>ML: Pandas profiling + stats
    ML-->>API: ColumnProfile[]
    API-->>FE: DataProfile (overview, columns, quality)

    U->>FE: Apply Preprocessing Config
    FE->>API: POST /api/v1/preprocessing/configure
    API->>ML: Fit ColumnTransformer on X_train only
    ML-->>API: ExperimentSummary (experiment_id)
    API->>DB: Persist experiment + pipeline

    U->>FE: Click "Start Training"
    FE->>API: POST /api/v1/models/train
    API->>API: Launch BackgroundTask
    API-->>FE: 202 Accepted

    loop Every 2 seconds
        FE->>API: GET /api/v1/models/status/{experiment_id}
        API-->>FE: TrainingRun[] with status
    end

    API->>ML: Train each model (parallel via joblib)
    ML->>DB: Save model + metrics per run

    U->>FE: View Comparison Table
    FE->>API: GET /api/v1/models/compare/{experiment_id}
    API->>DB: Fetch all completed runs
    API-->>FE: ModelComparison (ranked, champion)

    U->>FE: Request SHAP
    FE->>API: POST /api/v1/explainability/shap/{model_id}
    API->>ML: SHAP explainer.shap_values(X_test)
    ML-->>API: Feature importance + scatter samples
    API-->>FE: SHAPData

    U->>FE: Make Prediction
    FE->>API: POST /api/v1/predictions/{model_id}
    API->>ML: pipeline.predict() + SHAP waterfall
    ML-->>API: PredictionResponse
    API-->>FE: {prediction, probability, contributions}
```

---

### Preprocessing Pipeline Architecture

```mermaid
flowchart LR
    RAW["📄 Raw DataFrame<br/>CSV Input"]
    
    subgraph SPLIT["Train/Test Split"]
        STRAT["Stratified Split<br/>test_size = 20%<br/>random_state = 42"]
    end

    subgraph PIPELINE["ColumnTransformer Pipeline (fit on X_train ONLY)"]
        direction TB
        
        subgraph NUM["Numerical Branch"]
            NI["SimpleImputer<br/>strategy: median / mean"]
            NS["StandardScaler /<br/>MinMaxScaler / RobustScaler"]
            NI --> NS
        end

        subgraph CAT["Categorical Branch"]
            CI["SimpleImputer<br/>strategy: most_frequent"]
            CE["OneHotEncoder /<br/>OrdinalEncoder"]
            CI --> CE
        end

        subgraph DROP["Drop Branch"]
            ID["ID Column Removed<br/>before fit"]
        end
    end

    subgraph OUT["Output"]
        X_TRAIN["X_train_transformed<br/>NumPy Array"]
        X_TEST["X_test_transformed<br/>Applied transform only"]
        Y_TRAIN["y_train"]
        Y_TEST["y_test"]
    end

    RAW --> SPLIT
    SPLIT --> PIPELINE
    PIPELINE --> X_TRAIN
    PIPELINE --> X_TEST
    SPLIT --> Y_TRAIN
    SPLIT --> Y_TEST
```

---

## 🔬 ML Algorithms & Techniques

### Classification Models

```mermaid
mindmap
  root((Classification))
    Logistic Regression
      L2 Regularization
      max_iter 1000
      Binary & Multi-class
    Decision Tree
      Gini / Entropy criterion
      Prunable via max_depth
      Interpretable
    Random Forest
      100 estimators
      Bootstrap sampling
      Feature importance
    SVM
      RBF Kernel
      Soft margin C
      Probability calibration
    KNN
      k=5 default
      Euclidean distance
      Lazy learner
    Naive Bayes
      Gaussian prior
      Fast inference
      Strong baseline
    XGBoost Classifier
      Gradient boosted trees
      Built-in regularization
      Handles missing values
```

### Regression Models

```mermaid
mindmap
  root((Regression))
    Linear Regression
      OLS closed-form
      No regularization
      Baseline model
    Ridge Regression
      L2 penalty
      alpha tunable
      Handles multicollinearity
    Lasso Regression
      L1 penalty
      Feature selection
      Sparse solutions
    Decision Tree Regressor
      MSE criterion
      Captures non-linearity
    Random Forest Regressor
      Ensemble averaging
      Low variance
    SVR
      Epsilon-insensitive tube
      RBF kernel
    KNN Regressor
      Averaging neighbors
    Gradient Boosting
      Sequential weak learners
      learning_rate + n_estimators
    XGBoost Regressor
      CART base learners
      Parallel tree building
```

### Cross-Validation Protocol

```mermaid
flowchart TD
    DATA["Full Training Set\n(after train/test split)"]
    
    DATA --> F1["Fold 1\nTrain: 80% | Val: 20%"]
    DATA --> F2["Fold 2\nTrain: 80% | Val: 20%"]
    DATA --> F3["Fold 3\nTrain: 80% | Val: 20%"]
    DATA --> F4["Fold 4\nTrain: 80% | Val: 20%"]
    DATA --> F5["Fold 5\nTrain: 80% | Val: 20%"]

    F1 --> S1["Score₁"]
    F2 --> S2["Score₂"]
    F3 --> S3["Score₃"]
    F4 --> S4["Score₄"]
    F5 --> S5["Score₅"]

    S1 & S2 & S3 & S4 & S5 --> AVG["Mean ± Std\nFinal CV Score"]

    style DATA fill:#EFF6FF,stroke:#2563EB
    style AVG fill:#F0FDF4,stroke:#15803D
```

### Model Recommendation Algorithm

```
Algorithm: ChampionSelection(models, problem_type)

Input:  List of TrainingRun objects with metrics
Output: RecommendedModel with rationale

1. Filter runs where status == 'completed'
2. IF problem_type == 'classification':
       primary_metric = 'F1 Score' (weighted)
       secondary_metric = 'ROC-AUC'
   ELSE:
       primary_metric = 'R² Score'
       secondary_metric = 'RMSE' (minimize)

3. Sort models by primary_metric DESC
   (For RMSE: sort ASC)

4. champion = models[0]

5. rationale = f"""
   {champion.model_name} achieves the highest {primary_metric}
   of {champion.metrics[primary_metric]:.2%} across {cv_folds}-fold
   cross-validation on the held-out test set, trained in
   {champion.training_time_sec:.1f}s.
   """

6. RETURN RecommendedModel(champion, rationale)
```

---

## 🧠 SHAP Explainability Deep Dive

### Explainer Selection Logic

```mermaid
flowchart TD
    MODEL["Trained Model"] --> CHECK{"Model Type?"}
    
    CHECK -->|"Tree-based\nRF / XGB / DT / GB"| TREE["TreeExplainer\n⚡ Exact SHAP values\nFastest computation"]
    CHECK -->|"Linear\nLR / Ridge / Lasso"| LINEAR["LinearExplainer\n📐 Linear approximation\nExact for linear models"]
    CHECK -->|"SVM / KNN /\nNaive Bayes"| KERNEL["KernelExplainer\n🔮 Model-agnostic\nSampled background"]

    TREE --> VALS["shap_values(X_test)"]
    LINEAR --> VALS
    KERNEL --> VALS

    VALS --> GLOBAL["Global Importance\nmean(|SHAP|) per feature"]
    VALS --> BEESWARM["SHAP Summary Plot\nScatter per sample"]
    VALS --> WATERFALL["Waterfall Chart\nPer-prediction breakdown"]
```

### SHAP Value Interpretation

```
For a single prediction:

  ŷ = base_value + Σ φᵢ(xᵢ)
  
  where:
    ŷ          = model output (log-odds for classification)
    base_value = E[f(X)] — average model output over training data
    φᵢ(xᵢ)    = SHAP value for feature i
               = contribution of feature i to this prediction
               > 0  → pushes prediction higher (toward positive class)
               < 0  → pushes prediction lower (toward negative class)
```

### Feature Importance Computation

```
Algorithm: GlobalFeatureImportance(shap_values, feature_names)

For each feature j:
    importance[j] = (1/n) * Σᵢ |φⱼ(xᵢ)|   ← mean absolute SHAP

Sort features by importance DESC
Return top-K features with normalized bar chart
```

---

## 🗂️ Project Structure

```
ML PROJECT/
│
├── 📁 backend/                         # FastAPI application
│   ├── app/
│   │   ├── main.py                     # App factory, CORS, router mounts
│   │   ├── database.py                 # SQLAlchemy engine + session factory
│   │   ├── models.py                   # ORM models (Dataset, Experiment, TrainingRun)
│   │   │
│   │   ├── 📁 routers/
│   │   │   ├── datasets.py             # Upload, sample load, profile endpoints
│   │   │   ├── preprocessing.py        # Pipeline config + experiment creation
│   │   │   ├── models.py               # Train, status poll, compare endpoints
│   │   │   ├── explainability.py       # SHAP computation endpoints
│   │   │   ├── predictions.py          # Single-row inference endpoint
│   │   │   └── exports.py              # ZIP model, CSV comparison, PDF report
│   │   │
│   │   ├── 📁 services/
│   │   │   ├── data_profiler.py        # Column analysis, quality checks
│   │   │   ├── preprocessing.py        # ColumnTransformer builder
│   │   │   ├── trainer.py              # Async parallel model training
│   │   │   ├── evaluator.py            # Metrics, ROC, PR, confusion matrix
│   │   │   ├── shap_explainer.py       # SHAP value computation
│   │   │   └── report_generator.py     # PDF report via ReportLab
│   │   │
│   │   ├── 📁 schemas/
│   │   │   └── *.py                    # Pydantic request/response schemas
│   │   │
│   │   └── 📁 sample_datasets/
│   │       ├── loan_default.csv
│   │       ├── titanic.csv
│   │       └── *.csv
│   │
│   └── requirements.txt
│
├── 📁 frontend/                        # React 18 + TypeScript + Vite
│   ├── index.html                      # HTML entry + Inter font
│   ├── vite.config.ts                  # Vite config + /api proxy
│   │
│   └── src/
│       ├── main.tsx                    # React root
│       ├── App.tsx                     # Layout composition
│       ├── index.css                   # Global design system + animations
│       │
│       ├── 📁 api/
│       │   └── client.ts               # Axios instance + all API calls
│       │
│       ├── 📁 context/
│       │   └── StudioContext.tsx       # Global state + workflow orchestration
│       │
│       ├── 📁 types/
│       │   └── index.ts                # TypeScript interfaces for all API shapes
│       │
│       └── 📁 components/
│           ├── 📁 layout/
│           │   ├── Header.tsx          # Top bar — search, status, branding
│           │   └── Sidebar.tsx         # Workflow nav — progress, steps
│           │
│           └── 📁 workflow/            # One component per stage
│               ├── DatasetUploadScreen.tsx
│               ├── DataProfilingScreen.tsx
│               ├── PreprocessingScreen.tsx
│               ├── ProblemDetectionScreen.tsx
│               ├── ModelTrainingScreen.tsx
│               ├── ModelComparisonScreen.tsx
│               ├── DetailedEvaluationScreen.tsx
│               ├── ExplainabilityScreen.tsx
│               └── PredictionExportScreen.tsx
│
├── .gitignore
└── README.md
```

---

## ⚙️ API Reference

### Base URL: `http://localhost:8000/api/v1`

```mermaid
graph LR
    subgraph DATASETS["/datasets"]
        D1["POST /upload\nMultipart file upload"]
        D2["GET /samples\nList sample datasets"]
        D3["POST /samples/{filename}\nLoad a sample"]
        D4["POST /{id}/profile\nGenerate data profile"]
    end

    subgraph PREPROCESSING["/preprocessing"]
        P1["POST /configure\nFit pipeline + create experiment"]
    end

    subgraph MODELS["/models"]
        M1["POST /train\nLaunch async training"]
        M2["GET /status/{exp_id}\nPoll training runs"]
        M3["GET /compare/{exp_id}\nLeaderboard"]
        M4["GET /available\nList all model names"]
    end

    subgraph EXPLAIN["/explainability"]
        E1["POST /shap/{model_id}\nCompute SHAP values"]
        E2["GET /schema/{model_id}\nPrediction form schema"]
    end

    subgraph PREDICT["/predictions"]
        PR1["POST /{model_id}\nSingle-row inference + SHAP"]
    end

    subgraph EXPORTS["/exports"]
        EX1["GET /model/{model_id}\nDownload model ZIP"]
        EX2["GET /comparison/{exp_id}\nDownload CSV"]
        EX3["GET /report/{exp_id}\nGenerate PDF"]
    end
```

### Key Request/Response Shapes

<details>
<summary><strong>POST /datasets/upload</strong></summary>

**Request:** `multipart/form-data` with `file` field (`.csv`, `.xlsx`)

**Response:**
```json
{
  "id": "ds_abc123",
  "filename": "loan_data.csv",
  "row_count": 32581,
  "col_count": 12,
  "file_size_bytes": 1843200,
  "columns": ["age", "income", "loan_status", ...],
  "suggested_target_column": "loan_status",
  "suggested_id_column": "id"
}
```
</details>

<details>
<summary><strong>POST /preprocessing/configure</strong></summary>

**Request:**
```json
{
  "dataset_id": "ds_abc123",
  "target_column": "loan_status",
  "id_column": "id",
  "numerical_imputer": "median",
  "categorical_imputer": "most_frequent",
  "categorical_encoding": "onehot",
  "feature_scaling": "standard",
  "test_size": 0.2,
  "random_state": 42
}
```

**Response:**
```json
{
  "experiment_id": "exp_xyz789",
  "train_samples": 26064,
  "test_samples": 6517,
  "feature_count": 47,
  "problem_type": "classification"
}
```
</details>

<details>
<summary><strong>POST /models/train</strong></summary>

**Request:**
```json
{
  "experiment_id": "exp_xyz789",
  "selected_models": ["Random Forest", "XGBoost Classifier", "Logistic Regression"],
  "cv_folds": 5,
  "use_hyperparameter_tuning": false,
  "n_jobs": -1
}
```

**Response:** `202 Accepted` — poll `/models/status/{experiment_id}` for progress.
</details>

<details>
<summary><strong>GET /models/compare/{experiment_id}</strong></summary>

**Response:**
```json
{
  "problem_type": "classification",
  "metric_keys": ["Accuracy", "F1 Score", "ROC-AUC", "Precision", "Recall"],
  "models": [
    {
      "id": "run_001",
      "rank": 1,
      "model_name": "XGBoost Classifier",
      "metrics": { "Accuracy": 0.923, "F1 Score": 0.917, "ROC-AUC": 0.971 },
      "training_time_sec": 3.42
    }
  ],
  "recommended_model": {
    "model_id": "run_001",
    "model_name": "XGBoost Classifier",
    "primary_metric_name": "F1 Score",
    "primary_metric_value": 0.917,
    "rationale": "XGBoost achieves the highest F1 Score of 91.7%..."
  }
}
```
</details>

---

## 🗃️ Database Schema

```mermaid
erDiagram
    DATASET {
        string id PK
        string filename
        string file_path
        int row_count
        int col_count
        int file_size_bytes
        string columns_json
        string suggested_target_column
        string suggested_id_column
        datetime created_at
    }

    EXPERIMENT {
        string id PK
        string dataset_id FK
        string target_column
        string id_column
        string pipeline_path
        string problem_type
        int train_samples
        int test_samples
        int feature_count
        float test_size
        int random_state
        datetime created_at
    }

    TRAINING_RUN {
        string id PK
        string experiment_id FK
        string model_name
        string model_path
        string status
        string metrics_json
        float training_time_sec
        int cv_folds
        datetime started_at
        datetime completed_at
    }

    DATASET ||--o{ EXPERIMENT : "has"
    EXPERIMENT ||--o{ TRAINING_RUN : "produces"
```

---

## 🔄 Workflow State Machine

```mermaid
stateDiagram-v2
    [*] --> dataset : App loads

    dataset --> profile : Upload + Analyze CSV
    note right of dataset
        User uploads file
        Selects target column
        Sets ID column (optional)
    end note

    profile --> preprocess : View profiling results
    note right of profile
        Row/col counts
        Missing value analysis
        Column type detection
        Data preview
    end note

    preprocess --> problem : Apply preprocessing pipeline
    note right of preprocess
        Configure imputer
        Set encoding strategy
        Set scaler
        Define train/test split
    end note

    problem --> train : Confirm problem type
    note right of problem
        Auto-detect classification
        or regression
        Class distribution chart
        Manual override available
    end note

    train --> compare : All models completed
    note right of train
        Select algorithm subset
        Configure CV folds
        Toggle hyperparameter tuning
        Real-time progress tracking
    end note

    compare --> evaluate : Select model to inspect
    note right of compare
        Sortable leaderboard
        Champion recommendation
        Champion rationale
    end note

    evaluate --> explain : Proceed to SHAP
    note right of evaluate
        Confusion matrix
        ROC + PR curves
        Per-class report
        CV fold distribution
    end note

    explain --> predict : Proceed to inference
    note right of explain
        SHAP beeswarm
        Mean SHAP bar chart
        Ranked feature importance
    end note

    predict --> [*] : Export artifacts
    note right of predict
        Single-row prediction form
        Real-time SHAP waterfall
        Download model ZIP
        Export comparison CSV
        Generate PDF report
    end note

    compare --> evaluate
    evaluate --> compare
    explain --> evaluate
    predict --> explain
```

---

## 📈 Performance & Benchmarks

### Training Time (on `loan_default.csv` — 32,581 rows × 12 columns)

| Model | Avg Train Time | CV F1 Score | ROC-AUC |
|---|---|---|---|
| Logistic Regression | ~0.3s | 0.881 | 0.942 |
| Decision Tree | ~0.2s | 0.862 | 0.871 |
| **Random Forest** | ~2.1s | **0.909** | **0.963** |
| SVM | ~8.4s | 0.894 | 0.951 |
| KNN | ~0.1s | 0.871 | 0.921 |
| Naive Bayes | ~0.05s | 0.823 | 0.901 |
| **XGBoost** | ~3.4s | **0.923** | **0.971** |

> *Benchmarks on Apple M2 Pro, 16GB RAM. Results vary with dataset characteristics.*

### API Response Times (p95)

| Endpoint | Latency |
|---|---|
| `POST /datasets/upload` | ~120ms |
| `POST /datasets/profile` | ~80ms |
| `POST /preprocessing/configure` | ~400ms |
| `GET /models/status` | ~15ms |
| `POST /explainability/shap` | ~2–8s (model-dependent) |
| `POST /predictions` | ~50ms |

---

## 🚀 Getting Started

### Prerequisites

```bash
# Python 3.10+
python3 --version

# Node.js 18+
node --version

# macOS: XGBoost dependency
brew install libomp
```

### 1. Clone & Setup Backend

```bash
git clone https://github.com/Pranavv-07/ML-CORNERSTONE-PROJECT.git
cd ML-CORNERSTONE-PROJECT

# Create virtual environment
python3 -m venv venv
source venv/bin/activate       # macOS/Linux
# venv\Scripts\activate        # Windows

# Install dependencies
cd backend
pip install -r requirements.txt

# Start FastAPI server
uvicorn app.main:app --reload --port 8000
```

Backend is live at → `http://localhost:8000`  
API docs at → `http://localhost:8000/docs`

### 2. Setup Frontend

```bash
cd frontend

# Install Node dependencies
npm install

# Start Vite dev server
npm run dev
```

Frontend is live at → `http://localhost:5173`

### 3. Full Stack (Both Simultaneously)

```bash
# Terminal 1: Backend
cd backend && source ../venv/bin/activate && uvicorn app.main:app --reload --port 8000

# Terminal 2: Frontend
cd frontend && npm run dev
```

---

## 🧪 Running Tests

```bash
# Backend tests
cd backend
pytest tests/ -v --tb=short

# With coverage
pytest tests/ --cov=app --cov-report=html
open htmlcov/index.html

# Specific test module
pytest tests/test_trainer.py -v
```

---

## 🔧 Configuration

| Variable | Default | Description |
|---|---|---|
| `DATABASE_URL` | `sqlite:///./experiments.db` | Database connection string |
| `UPLOAD_DIR` | `./uploads` | Dataset storage path |
| `MODEL_DIR` | `./models` | Serialized model storage |
| `EXPORT_DIR` | `./exports` | Report + ZIP output path |
| `MAX_FILE_SIZE_MB` | `100` | Max CSV upload size |
| `VITE_API_BASE` | `/api` | Frontend API base URL |

---

## 🤝 Contributing

```mermaid
gitGraph
    commit id: "Initial commit"
    branch feature/new-algorithm
    checkout feature/new-algorithm
    commit id: "Add LightGBM model"
    commit id: "Add tests"
    checkout main
    merge feature/new-algorithm id: "PR merged"
    branch hotfix/shap-kernel
    commit id: "Fix KernelExplainer sampling"
    checkout main
    merge hotfix/shap-kernel
```

1. **Fork** the repository
2. **Create** your feature branch: `git checkout -b feature/your-feature`
3. **Commit** your changes: `git commit -m 'feat: add LightGBM support'`
4. **Push** to the branch: `git push origin feature/your-feature`
5. **Open** a Pull Request

### Commit Convention

```
feat:     New feature
fix:      Bug fix
docs:     Documentation only
style:    Formatting (no logic change)
refactor: Code restructure (no feature change)
perf:     Performance improvement
test:     Adding/updating tests
```

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

<div align="center">

**Built with ❤️ by [Pranav Vedula](https://github.com/Pranavv-07)**

*FastAPI · React · scikit-learn · XGBoost · SHAP · SQLAlchemy · Vite · TypeScript*

⭐ **Star this repo if it helped you!**

</div>
