import React, { useState } from 'react';
import { useStudio } from '../../context/StudioContext';
import { apiClient } from '../../api/client';
import { ArrowRight, Loader2, AlertCircle } from 'lucide-react';

const FormLabel: React.FC<{ children: React.ReactNode; hint?: string }> = ({ children, hint }) => (
  <div className="flex items-center justify-between mb-1.5">
    <label className="text-sm font-semibold" style={{ color: '#111827' }}>{children}</label>
    {hint && <span className="text-[11px]" style={{ color: '#8290A5' }}>{hint}</span>}
  </div>
);

const SelectField: React.FC<{
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
}> = ({ value, onChange, children }) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="w-full rounded-xl px-3 py-2.5 text-sm font-medium outline-none"
    style={{
      background: '#F6F8FB',
      border: '1px solid #E2E8F0',
      color: '#111827',
    }}
  >
    {children}
  </select>
);

export const PreprocessingScreen: React.FC = () => {
  const {
    dataset,
    profile,
    targetColumn,
    idColumn,
    problemDetection,
    setExperimentSummary,
    setActiveStage,
    markStageCompleted,
  } = useStudio();

  const [numImputer, setNumImputer] = useState('median');
  const [catImputer, setCatImputer] = useState('most_frequent');
  const [encoding, setEncoding] = useState('onehot');
  const [scaling, setScaling] = useState('standard');
  const [testSize, setTestSize] = useState(0.2);
  const [randomState, setRandomState] = useState(42);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [isApplying, setIsApplying] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!dataset || !profile) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <p className="text-sm font-medium" style={{ color: '#526078' }}>Please upload and analyze a dataset first.</p>
      </div>
    );
  }

  const numCols = profile.quality.numerical_columns.filter((c) => c !== targetColumn && c !== idColumn);
  const catCols = profile.quality.categorical_columns.filter((c) => c !== targetColumn && c !== idColumn);

  const handleApply = async () => {
    setIsApplying(true);
    setErrorMsg(null);
    try {
      const res = await apiClient.configurePreprocessing({
        dataset_id: dataset.id,
        target_column: targetColumn,
        id_column: idColumn === 'None' ? undefined : idColumn,
        numerical_imputer: numImputer,
        categorical_imputer: catImputer,
        categorical_encoding: encoding,
        feature_scaling: scaling,
        test_size: testSize,
        random_state: randomState,
      });
      setExperimentSummary(res);
      markStageCompleted('preprocess');
      markStageCompleted('problem');
      setActiveStage('problem');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'Failed to apply preprocessing pipeline.');
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Page header */}
      <div>
        <span
          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold mb-2"
          style={{ background: '#EFF6FF', color: '#2563EB', border: '1px solid #BFDBFE' }}
        >
          Step 3 of 9
        </span>
        <h1 className="text-2xl font-bold" style={{ color: '#111827' }}>Preprocessing Configuration</h1>
        <p className="text-sm mt-1" style={{ color: '#526078' }}>
          Configure imputation strategy, categorical encoding, feature scaling, and train/test split protocol.
        </p>
      </div>

      {errorMsg && (
        <div className="flex items-start gap-3 p-4 rounded-xl text-sm" style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626' }}>
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: main config */}
        <div className="lg:col-span-2 rounded-2xl border p-6 space-y-6" style={{ background: '#FFFFFF', borderColor: '#E2E8F0' }}>

          {/* Missing value strategy */}
          <div>
            <FormLabel hint="Adapts to column types">Missing Value Strategy</FormLabel>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium mb-1.5" style={{ color: '#526078' }}>Numerical Features</p>
                <SelectField value={numImputer} onChange={setNumImputer}>
                  <option value="median">Median (robust to outliers)</option>
                  <option value="mean">Mean</option>
                  <option value="most_frequent">Most Frequent</option>
                  <option value="constant">Constant (0.0)</option>
                </SelectField>
              </div>
              <div>
                <p className="text-xs font-medium mb-1.5" style={{ color: '#526078' }}>Categorical Features</p>
                <SelectField value={catImputer} onChange={setCatImputer}>
                  <option value="most_frequent">Most Frequent (mode)</option>
                  <option value="constant">Constant ("Missing")</option>
                </SelectField>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div style={{ borderTop: '1px solid #F1F5F9' }} />

          {/* Categorical encoding */}
          <div>
            <FormLabel>Categorical Encoding</FormLabel>
            <SelectField value={encoding} onChange={setEncoding}>
              <option value="onehot">One Hot Encoding — standard for nominal categories</option>
              <option value="ordinal">Ordinal Encoding — for ordered categories</option>
            </SelectField>
            <p className="text-xs mt-1.5" style={{ color: '#8290A5' }}>
              Encodes categorical variables into numerical form. Unseen categories at inference time are handled gracefully.
            </p>
          </div>

          {/* Feature scaling */}
          <div>
            <FormLabel>Feature Scaling</FormLabel>
            <SelectField value={scaling} onChange={setScaling}>
              <option value="standard">Standard Scaler — zero mean, unit variance</option>
              <option value="minmax">MinMax Scaler — bounded 0 to 1</option>
              <option value="robust">Robust Scaler — median and IQR</option>
              <option value="none">No Scaling</option>
            </SelectField>
            <p className="text-xs mt-1.5" style={{ color: '#8290A5' }}>
              Fitted strictly on training data to prevent data leakage.
            </p>
          </div>

          {/* Test size */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <FormLabel>Test Split Size</FormLabel>
              <span className="text-sm font-bold" style={{ color: '#2563EB' }}>{Math.round(testSize * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="0.5"
              step="0.05"
              value={testSize}
              onChange={(e) => setTestSize(parseFloat(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-[10px] mt-1" style={{ color: '#8290A5' }}>
              <span>10%</span>
              <span>20% (Standard)</span>
              <span>30%</span>
              <span>50%</span>
            </div>
          </div>

          {/* Random state */}
          <div>
            <FormLabel>Random State Seed</FormLabel>
            <input
              type="number"
              value={randomState}
              onChange={(e) => setRandomState(parseInt(e.target.value) || 42)}
              className="w-28 rounded-xl px-3 py-2 text-sm font-mono outline-none"
              style={{ background: '#F6F8FB', border: '1px solid #E2E8F0', color: '#111827' }}
            />
          </div>

          {/* Advanced */}
          <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '16px' }}>
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showAdvanced}
                onChange={(e) => setShowAdvanced(e.target.checked)}
                className="w-4 h-4 rounded"
                style={{ accentColor: '#2563EB' }}
              />
              <span className="text-sm font-medium" style={{ color: '#526078' }}>Show advanced options</span>
            </label>

            {showAdvanced && (
              <div className="mt-3 p-4 rounded-xl text-xs space-y-2" style={{ background: '#F6F8FB', border: '1px solid #E2E8F0' }}>
                <p style={{ color: '#526078' }}>
                  <strong style={{ color: '#111827' }}>Data leakage prevention:</strong> Transformer parameters (means, scales, vocabularies) are calculated purely on <code>X_train</code>.
                </p>
                <p style={{ color: '#526078' }}>
                  Stratified split is applied automatically for classification tasks to preserve class distribution across folds.
                </p>
              </div>
            )}
          </div>

          {/* Apply button */}
          <div className="flex justify-end pt-2">
            <button
              type="button"
              disabled={isApplying}
              onClick={handleApply}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white"
              style={{ background: isApplying ? '#93C5FD' : '#2563EB', cursor: isApplying ? 'not-allowed' : 'pointer' }}
              onMouseEnter={(e) => { if (!isApplying) (e.currentTarget.style.background = '#1D4ED8'); }}
              onMouseLeave={(e) => { if (!isApplying) (e.currentTarget.style.background = '#2563EB'); }}
            >
              {isApplying ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Fitting Pipeline…</>
              ) : (
                <>Apply Preprocessing <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </div>
        </div>

        {/* Right: Detected features summary */}
        <div className="rounded-2xl border p-5 space-y-5 h-fit" style={{ background: '#FFFFFF', borderColor: '#E2E8F0' }}>
          <h3 className="text-xs font-bold uppercase tracking-widest pb-3 border-b" style={{ color: '#8290A5', borderColor: '#F1F5F9' }}>
            Detected Features
          </h3>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold" style={{ color: '#111827' }}>Numerical</span>
              <span
                className="px-2 py-0.5 rounded-full text-[11px] font-bold"
                style={{ background: '#EFF6FF', color: '#2563EB' }}
              >
                {numCols.length}
              </span>
            </div>
            <p className="text-[11px] font-mono leading-relaxed" style={{ color: '#8290A5' }}>
              {numCols.length > 0 ? `${numCols.slice(0, 8).join(', ')}${numCols.length > 8 ? ` +${numCols.length - 8} more` : ''}` : 'None'}
            </p>
          </div>

          <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '16px' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold" style={{ color: '#111827' }}>Categorical</span>
              <span
                className="px-2 py-0.5 rounded-full text-[11px] font-bold"
                style={{ background: '#F5F3FF', color: '#7C3AED' }}
              >
                {catCols.length}
              </span>
            </div>
            <p className="text-[11px] font-mono leading-relaxed" style={{ color: '#8290A5' }}>
              {catCols.length > 0 ? `${catCols.slice(0, 8).join(', ')}${catCols.length > 8 ? ` +${catCols.length - 8} more` : ''}` : 'None'}
            </p>
          </div>

          <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '16px' }}>
            <div className="text-xs font-medium mb-1" style={{ color: '#8290A5' }}>Target Column</div>
            <div className="text-sm font-bold font-mono" style={{ color: '#111827' }}>{targetColumn}</div>
          </div>

          {problemDetection && (
            <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '16px' }}>
              <div className="text-xs font-medium mb-1.5" style={{ color: '#8290A5' }}>Problem Type</div>
              <span
                className="inline-block px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide"
                style={{
                  background: problemDetection.detected_problem_type === 'classification' ? '#F0FDF4' : '#EFF6FF',
                  color: problemDetection.detected_problem_type === 'classification' ? '#15803D' : '#2563EB',
                }}
              >
                {problemDetection.detected_problem_type}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
