import React, { useState, useEffect } from 'react';
import { useStudio } from '../../context/StudioContext';
import { apiClient } from '../../api/client';
import { CheckCircle2, AlertCircle, Download, FileSpreadsheet, FileText, Play, Loader2 } from 'lucide-react';
import { PredictionResponse } from '../../types';

export const PredictionExportScreen: React.FC = () => {
  const { selectedModelId, selectedModelName, experimentSummary, predictionSchema, comparison, setSelectedModelId } = useStudio();

  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [predictionResult, setPredictionResult] = useState<PredictionResponse | null>(null);
  const [isPredicting, setIsPredicting] = useState(false);
  const [predictError, setPredictError] = useState<string | null>(null);

  useEffect(() => {
    if (predictionSchema?.fields) {
      const initial: Record<string, any> = {};
      predictionSchema.fields.forEach((f) => { initial[f.name] = f.default_value !== undefined ? f.default_value : ''; });
      setFormValues(initial);
    }
  }, [predictionSchema]);

  const handleInputChange = (field: string, value: any) => setFormValues((prev) => ({ ...prev, [field]: value }));

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedModelId) return;
    setIsPredicting(true);
    setPredictError(null);
    try {
      const res = await apiClient.makePrediction(selectedModelId, formValues);
      setPredictionResult(res);
    } catch (err: any) {
      setPredictError(err.response?.data?.detail || 'Failed to make prediction.');
    } finally {
      setIsPredicting(false);
    }
  };

  const cardStyle = { background: '#FFFFFF', borderColor: '#E2E8F0' };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold mb-2" style={{ background: '#EFF6FF', color: '#2563EB', border: '1px solid #BFDBFE' }}>
            Step 9 of 9
          </span>
          <h1 className="text-2xl font-bold" style={{ color: '#111827' }}>Predictions & Export</h1>
          <p className="text-sm mt-1" style={{ color: '#526078' }}>Test single inputs, inspect SHAP contributions, and export model artifacts.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium" style={{ color: '#526078' }}>Active model:</span>
          <select value={selectedModelId || ''} onChange={(e) => setSelectedModelId(e.target.value)}
            className="rounded-xl px-3 py-1.5 text-xs font-semibold outline-none"
            style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', color: '#111827' }}
          >
            {comparison?.models.map((m) => <option key={m.id} value={m.id}>{m.model_name}</option>)}
          </select>
        </div>
      </div>

      {/* Prediction form + result */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="rounded-2xl border p-6 space-y-4" style={cardStyle}>
          <h3 className="flex items-center gap-2 text-sm font-semibold pb-3 border-b" style={{ color: '#111827', borderColor: '#F1F5F9' }}>
            <Play className="w-4 h-4" style={{ color: '#2563EB' }} /> Make a Prediction
          </h3>

          {predictError && (
            <div className="flex items-start gap-2 p-3 rounded-xl text-xs" style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626' }}>
              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />{predictError}
            </div>
          )}

          <form onSubmit={handlePredict} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
              {predictionSchema?.fields.map((field) => (
                <div key={field.name}>
                  <label className="block text-xs font-semibold mb-1" style={{ color: '#111827' }}>{field.label}</label>
                  {field.data_type === 'categorical' && field.options ? (
                    <select value={formValues[field.name] ?? ''} onChange={(e) => handleInputChange(field.name, e.target.value)}
                      className="w-full rounded-xl px-3 py-2 text-sm outline-none"
                      style={{ background: '#F6F8FB', border: '1px solid #E2E8F0', color: '#111827' }}
                    >
                      {field.options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  ) : (
                    <input type="number" step={field.step || 1}
                      value={formValues[field.name] ?? ''}
                      onChange={(e) => handleInputChange(field.name, parseFloat(e.target.value) || 0)}
                      className="w-full rounded-xl px-3 py-2 text-sm outline-none"
                      style={{ background: '#F6F8FB', border: '1px solid #E2E8F0', color: '#111827' }}
                    />
                  )}
                </div>
              ))}
            </div>
            <button type="submit" disabled={isPredicting || !selectedModelId}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white"
              style={{ background: isPredicting || !selectedModelId ? '#93C5FD' : '#2563EB', cursor: isPredicting || !selectedModelId ? 'not-allowed' : 'pointer' }}
              onMouseEnter={(e) => { if (!isPredicting && selectedModelId) (e.currentTarget.style.background = '#1D4ED8'); }}
              onMouseLeave={(e) => { if (!isPredicting && selectedModelId) (e.currentTarget.style.background = '#2563EB'); }}
            >
              {isPredicting ? <><Loader2 className="w-4 h-4 animate-spin" /> Calculating…</> : 'Predict'}
            </button>
          </form>
        </div>

        {/* Result */}
        <div className="rounded-2xl border p-6 space-y-5" style={cardStyle}>
          <h3 className="flex items-center gap-2 text-sm font-semibold pb-3 border-b" style={{ color: '#111827', borderColor: '#F1F5F9' }}>
            <CheckCircle2 className="w-4 h-4" style={{ color: '#15803D' }} /> Prediction Result
          </h3>

          {predictionResult ? (
            <div className="space-y-5">
              <div className="flex items-center gap-4 p-4 rounded-xl" style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#15803D' }}>
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{ color: '#15803D' }}>Model Output</div>
                  <div className="text-xl font-bold" style={{ color: '#111827' }}>{String(predictionResult.prediction)}</div>
                  {predictionResult.probability != null && (
                    <div className="text-xs font-semibold mt-0.5" style={{ color: '#15803D' }}>
                      Confidence: {(predictionResult.probability * 100).toFixed(1)}%
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest mb-2.5" style={{ color: '#8290A5' }}>Feature Contributions (SHAP)</h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {predictionResult.feature_contributions.map((fc) => {
                    const isPos = fc.contribution >= 0;
                    return (
                      <div key={fc.feature} className="flex items-center justify-between p-2.5 rounded-xl border" style={{ background: '#F6F8FB', borderColor: '#E2E8F0' }}>
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-sm font-medium truncate" style={{ color: '#111827' }}>{fc.feature}</span>
                          {fc.value !== undefined && fc.value !== '' && (
                            <span className="text-[10px] shrink-0" style={{ color: '#8290A5' }}>({String(fc.value)})</span>
                          )}
                        </div>
                        <span className="font-mono font-bold text-xs px-2 py-0.5 rounded-lg shrink-0 ml-2"
                          style={{ background: isPos ? '#F0FDF4' : '#FEF2F2', color: isPos ? '#15803D' : '#DC2626' }}
                        >
                          {isPos ? `+${fc.contribution.toFixed(3)}` : fc.contribution.toFixed(3)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 rounded-xl border border-dashed text-center" style={{ borderColor: '#E2E8F0' }}>
              <Play className="w-8 h-8 mb-3" style={{ color: '#CBD5E1' }} />
              <p className="text-sm" style={{ color: '#8290A5' }}>Fill in features and click Predict</p>
              <p className="text-xs mt-1" style={{ color: '#CBD5E1' }}>Real-time SHAP contributions will appear here</p>
            </div>
          )}
        </div>
      </div>

      {/* Export section */}
      <div className="rounded-2xl border p-6 space-y-4" style={cardStyle}>
        <div className="pb-3 border-b" style={{ borderColor: '#F1F5F9' }}>
          <h3 className="text-sm font-semibold" style={{ color: '#111827' }}>Export Results & Artifacts</h3>
          <p className="text-xs mt-0.5" style={{ color: '#8290A5' }}>Download trained model packages, comparison reports, and PDF summaries.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <a
            href={selectedModelId ? apiClient.getModelExportUrl(selectedModelId) : '#'}
            target="_blank" rel="noreferrer"
            className="flex items-center justify-center gap-2.5 p-4 rounded-xl text-sm font-bold text-white"
            style={{ background: '#2563EB' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#1D4ED8')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#2563EB')}
          >
            <Download className="w-4 h-4" /> Download Model (.zip)
          </a>
          <a
            href={experimentSummary ? apiClient.getComparisonCsvUrl(experimentSummary.experiment_id) : '#'}
            target="_blank" rel="noreferrer"
            className="flex items-center justify-center gap-2.5 p-4 rounded-xl text-sm font-bold text-white"
            style={{ background: '#15803D' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#166534')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#15803D')}
          >
            <FileSpreadsheet className="w-4 h-4" /> Comparison (.csv)
          </a>
          <a
            href={experimentSummary ? apiClient.getPdfReportUrl(experimentSummary.experiment_id) : '#'}
            target="_blank" rel="noreferrer"
            className="flex items-center justify-center gap-2.5 p-4 rounded-xl text-sm font-bold text-white"
            style={{ background: '#DC2626' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#B91C1C')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#DC2626')}
          >
            <FileText className="w-4 h-4" /> PDF Report
          </a>
        </div>
      </div>
    </div>
  );
};
