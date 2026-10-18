import React, { useState, useRef, useEffect } from 'react';
import { useStudio } from '../../context/StudioContext';
import { apiClient } from '../../api/client';
import {
  UploadCloud,
  FileSpreadsheet,
  X,
  ArrowRight,
  Loader2,
  Database,
  CheckCircle2,
  AlertCircle,
  FileText,
} from 'lucide-react';

const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const StepBadge: React.FC<{ step: number; total: number }> = ({ step, total }) => (
  <span
    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
    style={{ background: '#EFF6FF', color: '#2563EB', border: '1px solid #BFDBFE' }}
  >
    Step {step} of {total}
  </span>
);

export const DatasetUploadScreen: React.FC = () => {
  const {
    dataset,
    setDataset,
    targetColumn,
    setTargetColumn,
    idColumn,
    setIdColumn,
    loadDatasetProfile,
    runProblemDetection,
    setActiveStage,
    markStageCompleted,
  } = useStudio();

  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [samples, setSamples] = useState<{ filename: string; size_bytes: number; description: string }[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [activeTab, setActiveTab] = useState<'upload' | 'sample'>('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    apiClient.listSampleDatasets().then(setSamples).catch(console.error);
  }, []);

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    setErrorMsg(null);
    try {
      const res = await apiClient.uploadDataset(file);
      setDataset(res);
      if (res.suggested_target_column) setTargetColumn(res.suggested_target_column);
      if (res.suggested_id_column) setIdColumn(res.suggested_id_column);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'Failed to upload dataset.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleLoadSample = async (filename: string) => {
    setIsUploading(true);
    setErrorMsg(null);
    try {
      const res = await apiClient.loadSampleDataset(filename);
      setDataset(res);
      if (res.suggested_target_column) setTargetColumn(res.suggested_target_column);
      if (res.suggested_id_column) setIdColumn(res.suggested_id_column);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'Failed to load sample dataset.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!dataset || !targetColumn) return;
    setIsUploading(true);
    setErrorMsg(null);
    try {
      await loadDatasetProfile(targetColumn, idColumn === 'None' ? undefined : idColumn);
      await runProblemDetection(targetColumn);
      markStageCompleted('dataset');
      markStageCompleted('profile');
      setActiveStage('profile');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'Failed to analyze dataset.');
    } finally {
      setIsUploading(false);
    }
  };

  const fileExt = dataset?.filename?.split('.').pop()?.toUpperCase() || 'CSV';

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <StepBadge step={1} total={9} />
          <h1 className="text-3xl font-bold leading-tight" style={{ color: '#111827' }}>
            Upload Your{' '}
            <span style={{ color: '#2563EB' }}>Dataset</span>
          </h1>
          <p className="text-sm" style={{ color: '#526078', maxWidth: 480 }}>
            Start your machine learning workflow by uploading a structured dataset or exploring one of the sample datasets below.
          </p>
        </div>

        {/* Small decorative stat block */}
        {dataset && (
          <div
            className="hidden lg:flex items-center gap-4 px-5 py-3 rounded-2xl border"
            style={{ background: '#FFFFFF', borderColor: '#E2E8F0' }}
          >
            <div className="text-center">
              <div className="text-lg font-bold" style={{ color: '#111827' }}>{dataset.row_count.toLocaleString()}</div>
              <div className="text-[10px] uppercase tracking-wide" style={{ color: '#8290A5' }}>Rows</div>
            </div>
            <div className="w-px h-8" style={{ background: '#E2E8F0' }} />
            <div className="text-center">
              <div className="text-lg font-bold" style={{ color: '#111827' }}>{dataset.col_count}</div>
              <div className="text-[10px] uppercase tracking-wide" style={{ color: '#8290A5' }}>Columns</div>
            </div>
            <div className="w-px h-8" style={{ background: '#E2E8F0' }} />
            <div className="text-center">
              <div className="text-lg font-bold" style={{ color: '#111827' }}>{formatBytes(dataset.file_size_bytes)}</div>
              <div className="text-[10px] uppercase tracking-wide" style={{ color: '#8290A5' }}>Size</div>
            </div>
          </div>
        )}
      </div>

      {/* Error */}
      {errorMsg && (
        <div
          className="flex items-start gap-3 p-4 rounded-xl text-sm"
          style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626' }}
        >
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main upload card */}
      <div
        className="rounded-2xl border overflow-hidden"
        style={{ background: '#FFFFFF', borderColor: '#E2E8F0' }}
      >
        {/* Tabs */}
        <div className="flex border-b" style={{ borderColor: '#E2E8F0' }}>
          {(['upload', 'sample'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className="px-6 py-3.5 text-sm font-medium relative"
              style={{
                color: activeTab === tab ? '#2563EB' : '#526078',
                borderBottom: activeTab === tab ? '2px solid #2563EB' : '2px solid transparent',
                background: 'transparent',
              }}
            >
              {tab === 'upload' ? 'Upload File' : 'Use Sample Dataset'}
            </button>
          ))}
        </div>

        {/* Upload tab */}
        {activeTab === 'upload' && (
          <div className="p-6 space-y-5">
            {/* Drop zone */}
            {!dataset ? (
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  if (e.dataTransfer.files?.[0]) handleFileUpload(e.dataTransfer.files[0]);
                }}
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center text-center rounded-2xl cursor-pointer"
                style={{
                  border: `2px dashed ${isDragging ? '#2563EB' : '#CBD5E1'}`,
                  background: isDragging ? '#EFF6FF' : '#F8FAFC',
                  padding: '56px 32px',
                  transition: 'border-color 200ms, background 200ms',
                }}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => { if (e.target.files?.[0]) handleFileUpload(e.target.files[0]); }}
                  accept=".csv,.xlsx,.xls"
                  className="hidden"
                />

                {isUploading ? (
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-10 h-10 animate-spin" style={{ color: '#2563EB' }} />
                    <p className="text-sm font-medium" style={{ color: '#526078' }}>Uploading dataset…</p>
                  </div>
                ) : (
                  <>
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
                      style={{ background: '#EFF6FF' }}
                    >
                      <UploadCloud className="w-8 h-8" style={{ color: '#2563EB' }} />
                    </div>

                    <h3 className="text-base font-semibold mb-1.5" style={{ color: '#111827' }}>
                      Drag and drop your dataset here
                    </h3>
                    <p className="text-sm mb-4" style={{ color: '#8290A5' }}>or</p>

                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                      className="px-5 py-2 rounded-lg text-sm font-semibold text-white"
                      style={{ background: '#2563EB' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#1D4ED8')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = '#2563EB')}
                    >
                      Browse Files
                    </button>

                    <div className="flex items-center gap-3 mt-5">
                      {['.csv', '.xlsx', '.xls'].map((fmt) => (
                        <span
                          key={fmt}
                          className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold"
                          style={{ background: '#F1F5F9', color: '#526078', border: '1px solid #E2E8F0' }}
                        >
                          {fmt}
                        </span>
                      ))}
                      <span className="text-[11px]" style={{ color: '#8290A5' }}>supported</span>
                    </div>
                  </>
                )}
              </div>
            ) : (
              /* Uploaded file summary */
              <div
                className="flex items-center justify-between p-4 rounded-xl"
                style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold"
                    style={{ background: '#15803D', color: '#FFFFFF' }}
                  >
                    {fileExt}
                  </div>
                  <div>
                    <div className="text-sm font-semibold" style={{ color: '#111827' }}>{dataset.filename}</div>
                    <div className="text-xs mt-0.5" style={{ color: '#526078' }}>
                      {formatBytes(dataset.file_size_bytes)} · {dataset.row_count.toLocaleString()} rows · {dataset.col_count} columns
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5" style={{ color: '#15803D' }} />
                  <button
                    type="button"
                    onClick={() => setDataset(null)}
                    className="p-1 rounded hover:bg-white/50"
                    style={{ color: '#526078' }}
                    title="Replace file"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Sample datasets tab */}
        {activeTab === 'sample' && (
          <div className="p-6 space-y-4">
            <div>
              <h3 className="text-base font-semibold mb-1" style={{ color: '#111827' }}>Explore Sample Datasets</h3>
              <p className="text-sm" style={{ color: '#526078' }}>
                Load a pre-built dataset to explore the full ML workflow without uploading your own file.
              </p>
            </div>

            {samples.length === 0 ? (
              <div className="flex flex-col items-center py-10 gap-2">
                <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#8290A5' }} />
                <span className="text-sm" style={{ color: '#8290A5' }}>Loading sample datasets…</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {samples.map((s) => {
                  const isLoaded = dataset?.filename === s.filename || dataset?.filename?.includes(s.filename.replace('.csv', ''));
                  return (
                    <button
                      key={s.filename}
                      type="button"
                      onClick={() => handleLoadSample(s.filename)}
                      disabled={isUploading}
                      className="flex items-start gap-4 p-4 rounded-xl border text-left group"
                      style={{
                        background: isLoaded ? '#F0FDF4' : '#FFFFFF',
                        borderColor: isLoaded ? '#BBF7D0' : '#E2E8F0',
                        transition: 'border-color 150ms, background 150ms',
                      }}
                      onMouseEnter={(e) => {
                        if (!isLoaded) {
                          (e.currentTarget as HTMLButtonElement).style.borderColor = '#BFDBFE';
                          (e.currentTarget as HTMLButtonElement).style.background = '#F8FAFF';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isLoaded) {
                          (e.currentTarget as HTMLButtonElement).style.borderColor = '#E2E8F0';
                          (e.currentTarget as HTMLButtonElement).style.background = '#FFFFFF';
                        }
                      }}
                    >
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: isLoaded ? '#DCFCE7' : '#F1F5F9' }}
                      >
                        <FileSpreadsheet className="w-4.5 h-4.5" style={{ color: isLoaded ? '#15803D' : '#2563EB' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold" style={{ color: '#111827' }}>{s.filename}</div>
                        <div className="text-xs mt-0.5 line-clamp-2" style={{ color: '#526078' }}>{s.description}</div>
                        <div className="mt-2 flex items-center gap-2">
                          <span
                            className="text-xs px-2 py-0.5 rounded-full font-medium"
                            style={{ background: '#EFF6FF', color: '#2563EB' }}
                          >
                            {formatBytes(s.size_bytes)}
                          </span>
                          {isLoaded && (
                            <span
                              className="text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1"
                              style={{ background: '#DCFCE7', color: '#15803D' }}
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              Loaded
                            </span>
                          )}
                        </div>
                      </div>
                      {!isLoaded && (
                        <span
                          className="shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg"
                          style={{ background: '#EFF6FF', color: '#2563EB' }}
                        >
                          Load
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Dataset Configuration — only shown after upload */}
      {dataset && (
        <div
          className="rounded-2xl border p-6 space-y-5"
          style={{ background: '#FFFFFF', borderColor: '#E2E8F0' }}
        >
          <div>
            <h2 className="text-base font-semibold" style={{ color: '#111827' }}>Configure Dataset</h2>
            <p className="text-sm mt-0.5" style={{ color: '#526078' }}>
              Select the target column for prediction and optionally specify an identifier column to exclude from training.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Target Column */}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold" style={{ color: '#111827' }}>
                Target Column{' '}
                <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <select
                value={targetColumn}
                onChange={(e) => setTargetColumn(e.target.value)}
                className="w-full rounded-xl px-3 py-2.5 text-sm font-medium outline-none"
                style={{
                  background: '#F6F8FB',
                  border: `1px solid ${targetColumn ? '#2563EB' : '#E2E8F0'}`,
                  color: targetColumn ? '#111827' : '#8290A5',
                  transition: 'border-color 150ms',
                }}
              >
                <option value="">— Choose Target Column —</option>
                {dataset.columns.map((col) => (
                  <option key={col} value={col}>
                    {col}{col === dataset.suggested_target_column ? ' (Auto-suggested)' : ''}
                  </option>
                ))}
              </select>
              <p className="text-xs" style={{ color: '#8290A5' }}>
                The column the model will learn to predict.
              </p>
            </div>

            {/* ID Column */}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold" style={{ color: '#111827' }}>
                ID Column{' '}
                <span className="font-normal text-xs" style={{ color: '#8290A5' }}>(Optional)</span>
              </label>
              <select
                value={idColumn}
                onChange={(e) => setIdColumn(e.target.value)}
                className="w-full rounded-xl px-3 py-2.5 text-sm font-medium outline-none"
                style={{
                  background: '#F6F8FB',
                  border: '1px solid #E2E8F0',
                  color: '#111827',
                }}
              >
                <option value="None">None</option>
                {dataset.columns
                  .filter((c) => c !== targetColumn)
                  .map((col) => (
                    <option key={col} value={col}>
                      {col}{col === dataset.suggested_id_column ? ' (Auto-detected)' : ''}
                    </option>
                  ))}
              </select>
              <p className="text-xs" style={{ color: '#8290A5' }}>
                Unique row identifier; excluded from model training.
              </p>
            </div>
          </div>

          {/* Analyze button */}
          <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: '#F1F5F9' }}>
            <p className="text-xs" style={{ color: '#8290A5' }}>
              {targetColumn
                ? `Ready to analyze with "${targetColumn}" as target`
                : 'Select a target column to continue'}
            </p>
            <button
              type="button"
              disabled={!targetColumn || isUploading}
              onClick={handleAnalyze}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white"
              style={{
                background: !targetColumn || isUploading ? '#93C5FD' : '#2563EB',
                cursor: !targetColumn || isUploading ? 'not-allowed' : 'pointer',
                transition: 'background 150ms',
              }}
              onMouseEnter={(e) => {
                if (targetColumn && !isUploading) (e.currentTarget.style.background = '#1D4ED8');
              }}
              onMouseLeave={(e) => {
                if (targetColumn && !isUploading) (e.currentTarget.style.background = '#2563EB');
              }}
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing…
                </>
              ) : (
                <>
                  Analyze Dataset
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
