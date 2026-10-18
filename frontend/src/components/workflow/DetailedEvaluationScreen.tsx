import React, { useState } from 'react';
import { useStudio } from '../../context/StudioContext';
import {
  LineChart, ResponsiveContainer, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, ScatterChart, Scatter,
} from 'recharts';
import { ArrowRight } from 'lucide-react';

const Tab: React.FC<{ label: string; active: boolean; onClick: () => void }> = ({ label, active, onClick }) => (
  <button onClick={onClick} className="px-5 py-3 text-sm font-medium whitespace-nowrap"
    style={{ color: active ? '#2563EB' : '#526078', borderBottom: active ? '2px solid #2563EB' : '2px solid transparent' }}
  >
    {label}
  </button>
);

export const DetailedEvaluationScreen: React.FC = () => {
  const { comparison, selectedModelId, setSelectedModelId, selectedModelName, detailedEvaluation, setActiveStage, markStageCompleted } = useStudio();
  const [activeTab, setActiveTab] = useState<'metrics' | 'confusion_matrix' | 'roc_curve' | 'pr_curve' | 'cross_validation' | 'regression_plots'>('metrics');

  if (!detailedEvaluation) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <p className="text-sm font-medium" style={{ color: '#526078' }}>Loading evaluation data…</p>
      </div>
    );
  }

  const { model_name, model_type, metrics, confusion_matrix, classification_report, roc_curve, pr_curve, actual_vs_predicted, residuals, cv_results, training_time_sec } = detailedEvaluation;
  const isClassification = model_type === 'classification';

  const rocData = roc_curve?.fpr.map((fpr, i) => ({ fpr, tpr: roc_curve.tpr[i], baseline: fpr })) || [];
  const prData = pr_curve?.recall.map((rec, i) => ({ recall: rec, precision: pr_curve.precision[i] })) || [];
  const cvData = cv_results?.folds?.map((score: number, idx: number) => ({ fold: `Fold ${idx + 1}`, score })) || [];

  const cardStyle = { background: '#FFFFFF', borderColor: '#E2E8F0' };

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold mb-2" style={{ background: '#EFF6FF', color: '#2563EB', border: '1px solid #BFDBFE' }}>
            Step 7 of 9
          </span>
          <h1 className="text-2xl font-bold" style={{ color: '#111827' }}>{selectedModelName} — Evaluation</h1>
          <p className="text-sm mt-1" style={{ color: '#526078' }}>Diagnostic curves, confusion matrices, and fold distributions.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium" style={{ color: '#526078' }}>Model:</span>
            <select value={selectedModelId || ''} onChange={(e) => setSelectedModelId(e.target.value)}
              className="rounded-xl px-3 py-1.5 text-xs font-semibold outline-none"
              style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', color: '#111827' }}
            >
              {comparison?.models.map((m) => <option key={m.id} value={m.id}>{m.model_name}</option>)}
            </select>
          </div>
          <button onClick={() => { markStageCompleted('explain'); setActiveStage('explain'); }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
            style={{ background: '#2563EB' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#1D4ED8')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#2563EB')}
          >
            SHAP Explainability <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b overflow-x-auto" style={{ borderColor: '#E2E8F0' }}>
        <Tab label="Metrics" active={activeTab === 'metrics'} onClick={() => setActiveTab('metrics')} />
        {isClassification ? (
          <>
            <Tab label="Confusion Matrix" active={activeTab === 'confusion_matrix'} onClick={() => setActiveTab('confusion_matrix')} />
            <Tab label="ROC Curve" active={activeTab === 'roc_curve'} onClick={() => setActiveTab('roc_curve')} />
            <Tab label="Precision-Recall" active={activeTab === 'pr_curve'} onClick={() => setActiveTab('pr_curve')} />
          </>
        ) : (
          <Tab label="Actual vs Predicted" active={activeTab === 'regression_plots'} onClick={() => setActiveTab('regression_plots')} />
        )}
        <Tab label="Cross Validation" active={activeTab === 'cross_validation'} onClick={() => setActiveTab('cross_validation')} />
      </div>

      {/* Metrics Tab */}
      {activeTab === 'metrics' && (
        <div className="rounded-2xl border p-6 space-y-6" style={cardStyle}>
          <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: '#8290A5' }}>Evaluation Metrics</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Object.entries(metrics).map(([k, v]) => (
              <div key={k} className="p-4 rounded-xl border" style={{ background: '#F6F8FB', borderColor: '#E2E8F0' }}>
                <div className="text-[11px] font-medium mb-1" style={{ color: '#8290A5' }}>{k}</div>
                <div className="text-xl font-bold" style={{ color: '#111827' }}>
                  {typeof v === 'number' ? (isClassification && v <= 1.0 ? `${(v * 100).toFixed(1)}%` : v.toFixed(k.includes('R²') ? 4 : 2)) : String(v)}
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 rounded-xl border text-sm space-y-1" style={{ background: '#F6F8FB', borderColor: '#E2E8F0' }}>
            <div style={{ color: '#526078' }}>Training Duration: <strong style={{ color: '#111827' }}>{training_time_sec}s</strong></div>
            <div style={{ color: '#526078' }}>Algorithm: <strong style={{ color: '#111827' }}>{model_name}</strong></div>
          </div>
        </div>
      )}

      {/* Confusion Matrix Tab */}
      {activeTab === 'confusion_matrix' && confusion_matrix && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl border p-6" style={cardStyle}>
            <h3 className="text-xs font-bold uppercase tracking-widest mb-5" style={{ color: '#8290A5' }}>Confusion Matrix</h3>
            <div className="flex flex-col items-center gap-3">
              <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#8290A5' }}>Predicted →</div>
              <div className="flex items-center gap-2">
                <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#8290A5', writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>Actual →</div>
                <div style={{ display: 'grid', gridTemplateColumns: `repeat(${confusion_matrix.labels.length}, 1fr)`, gap: 8 }}>
                  {confusion_matrix.labels.map((rowLabel, rIdx) =>
                    confusion_matrix.labels.map((colLabel, cIdx) => {
                      const count = confusion_matrix.matrix[rIdx]?.[cIdx] ?? 0;
                      const norm = confusion_matrix.normalized?.[rIdx]?.[cIdx] ?? 0;
                      const isCorrect = rIdx === cIdx;
                      return (
                        <div key={`${rIdx}-${cIdx}`}
                          className="w-28 h-24 rounded-xl flex flex-col items-center justify-center border"
                          style={{
                            background: isCorrect ? '#2563EB' : '#F6F8FB',
                            borderColor: isCorrect ? '#1D4ED8' : '#E2E8F0',
                          }}
                        >
                          <span className="text-2xl font-bold font-mono" style={{ color: isCorrect ? '#FFFFFF' : '#111827' }}>{count}</span>
                          <span className="text-[11px]" style={{ color: isCorrect ? '#BFDBFE' : '#8290A5' }}>{(norm * 100).toFixed(1)}%</span>
                          <span className="text-[9px] uppercase tracking-wide mt-0.5" style={{ color: isCorrect ? '#93C5FD' : '#CBD5E1' }}>
                            {rowLabel} / {colLabel}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border p-6" style={cardStyle}>
            <h3 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#8290A5' }}>Classification Report</h3>
            {classification_report && (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead style={{ borderBottom: '1px solid #E2E8F0' }}>
                    <tr>
                      {['Class','Precision','Recall','F1-Score','Support'].map(h => (
                        <th key={h} className="px-3 py-2 font-bold text-[10px] uppercase tracking-wider text-left" style={{ color: '#8290A5' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(classification_report).map(([key, val]: [string, any]) => {
                      if (key === 'accuracy') return (
                        <tr key={key} style={{ borderBottom: '1px solid #F1F5F9', background: '#F6F8FB' }}>
                          <td className="px-3 py-2 font-bold" style={{ color: '#111827' }}>Accuracy</td>
                          <td colSpan={2} className="px-3 py-2 text-center" style={{ color: '#CBD5E1' }}>—</td>
                          <td className="px-3 py-2 text-center font-bold font-mono" style={{ color: '#2563EB' }}>{(val * 100).toFixed(1)}%</td>
                          <td className="px-3 py-2 text-center" style={{ color: '#CBD5E1' }}>—</td>
                        </tr>
                      );
                      return (
                        <tr key={key} style={{ borderBottom: '1px solid #F1F5F9' }}>
                          <td className="px-3 py-2 font-semibold" style={{ color: '#111827' }}>{key}</td>
                          <td className="px-3 py-2 text-center font-mono" style={{ color: '#526078' }}>{val.precision}</td>
                          <td className="px-3 py-2 text-center font-mono" style={{ color: '#526078' }}>{val.recall}</td>
                          <td className="px-3 py-2 text-center font-mono" style={{ color: '#526078' }}>{val.f1_score}</td>
                          <td className="px-3 py-2 text-center" style={{ color: '#8290A5' }}>{val.support}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ROC Curve */}
      {activeTab === 'roc_curve' && (
        <div className="rounded-2xl border p-6" style={cardStyle}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: '#8290A5' }}>ROC Curve</h3>
            {roc_curve && <span className="px-3 py-1 rounded-lg text-xs font-bold" style={{ background: '#EFF6FF', color: '#2563EB' }}>AUC: {(roc_curve.auc * 100).toFixed(2)}%</span>}
          </div>
          <div style={{ height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={rocData} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="fpr" tick={{ fontSize: 11 }} label={{ value: 'False Positive Rate', position: 'insideBottom', offset: -10, style: { fontSize: 11 } }} />
                <YAxis tick={{ fontSize: 11 }} domain={[0, 1]} label={{ value: 'True Positive Rate', angle: -90, position: 'insideLeft', style: { fontSize: 11 } }} />
                <Tooltip />
                <Line type="monotone" dataKey="tpr" stroke="#2563EB" strokeWidth={2.5} name="Model ROC" dot={false} />
                <Line type="linear" dataKey="baseline" stroke="#CBD5E1" strokeDasharray="4 4" name="Random" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* PR Curve */}
      {activeTab === 'pr_curve' && (
        <div className="rounded-2xl border p-6" style={cardStyle}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: '#8290A5' }}>Precision-Recall Curve</h3>
            {pr_curve && <span className="px-3 py-1 rounded-lg text-xs font-bold" style={{ background: '#F5F3FF', color: '#7C3AED' }}>AP: {(pr_curve.avg_precision * 100).toFixed(2)}%</span>}
          </div>
          <div style={{ height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={prData} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="recall" tick={{ fontSize: 11 }} domain={[0, 1]} label={{ value: 'Recall', position: 'insideBottom', offset: -10, style: { fontSize: 11 } }} />
                <YAxis tick={{ fontSize: 11 }} domain={[0, 1]} label={{ value: 'Precision', angle: -90, position: 'insideLeft', style: { fontSize: 11 } }} />
                <Tooltip />
                <Line type="monotone" dataKey="precision" stroke="#7C3AED" strokeWidth={2.5} name="Precision" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* CV Tab */}
      {activeTab === 'cross_validation' && cv_results && (
        <div className="rounded-2xl border p-6" style={cardStyle}>
          <h3 className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#8290A5' }}>Cross-Validation ({cv_results.metric})</h3>
          <p className="text-xs mb-4" style={{ color: '#526078' }}>Mean: <strong style={{ color: '#111827' }}>{cv_results.mean}</strong> ± {cv_results.std} std</p>
          <div style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cvData} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="fold" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 1]} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="score" fill="#2563EB" radius={[6, 6, 0, 0]} name="Score" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Regression plots */}
      {activeTab === 'regression_plots' && actual_vs_predicted && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl border p-6" style={cardStyle}>
            <h3 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#8290A5' }}>Actual vs Predicted</h3>
            <div style={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="actual" name="Actual" label={{ value: 'Actual', position: 'insideBottom', offset: -10, style: { fontSize: 11 } }} />
                  <YAxis dataKey="predicted" name="Predicted" label={{ value: 'Predicted', angle: -90, position: 'insideLeft', style: { fontSize: 11 } }} />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                  <Scatter data={actual_vs_predicted} fill="#2563EB" fillOpacity={0.7} />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="rounded-2xl border p-6" style={cardStyle}>
            <h3 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#8290A5' }}>Residuals Distribution</h3>
            {residuals && (
              <div style={{ height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={residuals.distribution} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis dataKey="bin_center" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#7C3AED" radius={[4, 4, 0, 0]} name="Count" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
