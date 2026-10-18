import React, { useState, useEffect } from 'react';
import { useStudio } from '../../context/StudioContext';
import { apiClient } from '../../api/client';
import { CheckCircle2, AlertCircle, Loader2, ArrowRight } from 'lucide-react';

export const ModelTrainingScreen: React.FC = () => {
  const {
    experimentSummary, problemDetection, trainingRuns, isTraining,
    pollTrainingStatus, setActiveStage, markStageCompleted,
  } = useStudio();

  const isClassification = problemDetection?.detected_problem_type !== 'regression';
  const [activeTab, setActiveTab] = useState<'classification' | 'regression'>(isClassification ? 'classification' : 'regression');
  const [availableModels, setAvailableModels] = useState<{ classification: string[]; regression: string[] }>({
    classification: ['Logistic Regression','Decision Tree','Random Forest','Support Vector Machine (SVM)','K-Nearest Neighbors (KNN)','Naive Bayes','XGBoost Classifier'],
    regression: ['Linear Regression','Ridge Regression','Lasso Regression','Decision Tree Regressor','Random Forest Regressor','Support Vector Regressor','KNN Regressor','Gradient Boosting Regressor','XGBoost Regressor'],
  });
  const [selectedModels, setSelectedModels] = useState<string[]>(
    isClassification
      ? ['Logistic Regression','Decision Tree','Random Forest','Support Vector Machine (SVM)','K-Nearest Neighbors (KNN)','Naive Bayes','XGBoost Classifier']
      : ['Linear Regression','Ridge Regression','Decision Tree Regressor','Random Forest Regressor','Gradient Boosting Regressor','XGBoost Regressor']
  );
  const [cvFolds, setCvFolds] = useState(5);
  const [useTuning, setUseTuning] = useState(false);
  const [nJobs, setNJobs] = useState(-1);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    apiClient.getAvailableModels().then(setAvailableModels).catch(console.error);
  }, []);

  const currentModelsList = activeTab === 'classification' ? availableModels.classification : availableModels.regression;

  const toggleModel = (name: string) => {
    setSelectedModels(prev => prev.includes(name) ? prev.filter(m => m !== name) : [...prev, name]);
  };

  const handleStartTraining = async () => {
    if (!experimentSummary || selectedModels.length === 0) return;
    setErrorMsg(null);
    try {
      await apiClient.trainModels({ experiment_id: experimentSummary.experiment_id, selected_models: selectedModels, cv_folds: cvFolds, use_hyperparameter_tuning: useTuning, n_jobs: nJobs });
      pollTrainingStatus(experimentSummary.experiment_id);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'Failed to start training.');
    }
  };

  const allCompleted = trainingRuns.length > 0 && trainingRuns.every((r) => r.status === 'completed' || r.status === 'failed');

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-start justify-between">
        <div>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold mb-2" style={{ background: '#EFF6FF', color: '#2563EB', border: '1px solid #BFDBFE' }}>
            Step 5 of 9
          </span>
          <h1 className="text-2xl font-bold" style={{ color: '#111827' }}>Model Training</h1>
          <p className="text-sm mt-1" style={{ color: '#526078' }}>Train multiple ML algorithms with consistent cross-validation.</p>
        </div>
        {allCompleted && (
          <button onClick={() => { markStageCompleted('compare'); setActiveStage('compare'); }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white shrink-0"
            style={{ background: '#2563EB' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#1D4ED8')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#2563EB')}
          >
            View Comparison <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {errorMsg && (
        <div className="flex items-start gap-3 p-4 rounded-xl text-sm" style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626' }}>
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /><span>{errorMsg}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b" style={{ borderColor: '#E2E8F0' }}>
        {(['classification', 'regression'] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className="px-5 py-3 text-sm font-medium"
            style={{ color: activeTab === tab ? '#2563EB' : '#526078', borderBottom: activeTab === tab ? '2px solid #2563EB' : '2px solid transparent' }}
          >
            {tab === 'classification' ? 'Classification Models' : 'Regression Models'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Model checklist */}
        <div className="lg:col-span-2 rounded-2xl border p-6 space-y-4" style={{ background: '#FFFFFF', borderColor: '#E2E8F0' }}>
          <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: '#F1F5F9' }}>
            <h3 className="text-sm font-semibold" style={{ color: '#111827' }}>
              Select Models ({selectedModels.length} selected)
            </h3>
            <div className="flex gap-3 text-xs">
              <button onClick={() => setSelectedModels(currentModelsList)} className="font-semibold" style={{ color: '#2563EB' }}>Select All</button>
              <span style={{ color: '#E2E8F0' }}>|</span>
              <button onClick={() => setSelectedModels([])} className="font-medium" style={{ color: '#8290A5' }}>Clear</button>
            </div>
          </div>
          <div className="space-y-2">
            {currentModelsList.map((modelName) => {
              const isChecked = selectedModels.includes(modelName);
              return (
                <label key={modelName}
                  className="flex items-center gap-3 p-3 rounded-xl border cursor-pointer"
                  style={{
                    background: isChecked ? '#EFF6FF' : '#F6F8FB',
                    borderColor: isChecked ? '#BFDBFE' : '#E2E8F0',
                    transition: 'background 150ms, border-color 150ms',
                  }}
                >
                  <input type="checkbox" checked={isChecked} onChange={() => toggleModel(modelName)}
                    className="w-4 h-4 rounded" style={{ accentColor: '#2563EB' }} />
                  <span className="text-sm font-medium" style={{ color: isChecked ? '#1E40AF' : '#526078' }}>{modelName}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Config card */}
        <div className="rounded-2xl border p-5 space-y-5 h-fit" style={{ background: '#FFFFFF', borderColor: '#E2E8F0' }}>
          <h3 className="text-xs font-bold uppercase tracking-widest pb-3 border-b" style={{ color: '#8290A5', borderColor: '#F1F5F9' }}>
            Training Configuration
          </h3>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold" style={{ color: '#111827' }}>CV Folds</label>
            <input type="number" min="2" max="10" value={cvFolds} onChange={(e) => setCvFolds(parseInt(e.target.value) || 5)}
              className="w-full rounded-xl px-3 py-2 text-sm outline-none"
              style={{ background: '#F6F8FB', border: '1px solid #E2E8F0', color: '#111827' }} />
            <p className="text-[11px]" style={{ color: '#8290A5' }}>5 folds recommended</p>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-semibold" style={{ color: '#111827' }}>Hyperparameter Tuning</label>
              <input type="checkbox" checked={useTuning} onChange={(e) => setUseTuning(e.target.checked)}
                className="w-4 h-4 rounded" style={{ accentColor: '#2563EB' }} />
            </div>
            <p className="text-[11px]" style={{ color: '#8290A5' }}>GridSearchCV optimization</p>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold" style={{ color: '#111827' }}>Parallel Jobs</label>
            <select value={nJobs} onChange={(e) => setNJobs(parseInt(e.target.value))}
              className="w-full rounded-xl px-3 py-2 text-sm outline-none"
              style={{ background: '#F6F8FB', border: '1px solid #E2E8F0', color: '#111827' }}
            >
              <option value="-1">-1 (All cores)</option>
              <option value="2">2 threads</option>
              <option value="4">4 threads</option>
              <option value="1">1 (Single)</option>
            </select>
          </div>
          <button
            type="button"
            disabled={isTraining || selectedModels.length === 0}
            onClick={handleStartTraining}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white"
            style={{ background: isTraining || selectedModels.length === 0 ? '#93C5FD' : '#2563EB', cursor: isTraining || selectedModels.length === 0 ? 'not-allowed' : 'pointer' }}
            onMouseEnter={(e) => { if (!isTraining && selectedModels.length > 0) (e.currentTarget.style.background = '#1D4ED8'); }}
            onMouseLeave={(e) => { if (!isTraining && selectedModels.length > 0) (e.currentTarget.style.background = '#2563EB'); }}
          >
            {isTraining ? <><Loader2 className="w-4 h-4 animate-spin" /> Training…</> : <>Start Training <ArrowRight className="w-4 h-4" /></>}
          </button>
        </div>
      </div>

      {/* Training progress */}
      {trainingRuns.length > 0 && (
        <div className="rounded-2xl border p-6 space-y-4" style={{ background: '#FFFFFF', borderColor: '#E2E8F0' }}>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold" style={{ color: '#111827' }}>Training Progress</h3>
            {isTraining && (
              <span className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: '#2563EB' }}>
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Running asynchronously…
              </span>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {trainingRuns.map((r) => {
              const isDone = r.status === 'completed';
              const isRunning = r.status === 'training';
              const isFailed = r.status === 'failed';
              return (
                <div key={r.id} className="flex items-center justify-between p-3.5 rounded-xl border"
                  style={{ background: '#F6F8FB', borderColor: '#E2E8F0' }}>
                  <div>
                    <div className="text-sm font-semibold" style={{ color: '#111827' }}>{r.model_name}</div>
                    <div className="text-[11px] mt-0.5" style={{ color: '#8290A5' }}>
                      {isDone && r.training_time_sec ? `${r.training_time_sec.toFixed(1)}s` : r.status}
                    </div>
                  </div>
                  {isDone && <span className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold" style={{ background: '#F0FDF4', color: '#15803D' }}><CheckCircle2 className="w-3 h-3" /> Done</span>}
                  {isRunning && <span className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold" style={{ background: '#EFF6FF', color: '#2563EB' }}><Loader2 className="w-3 h-3 animate-spin" /> Training</span>}
                  {isFailed && <span className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold" style={{ background: '#FEF2F2', color: '#DC2626' }}><AlertCircle className="w-3 h-3" /> Failed</span>}
                  {r.status === 'queued' && <span className="px-2 py-1 rounded-full text-[10px] font-bold" style={{ background: '#F1F5F9', color: '#526078' }}>Queued</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
