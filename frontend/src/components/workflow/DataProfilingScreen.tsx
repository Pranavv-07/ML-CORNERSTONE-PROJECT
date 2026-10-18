import React from 'react';
import { useStudio } from '../../context/StudioContext';
import {
  FileText,
  Hash,
  AlertTriangle,
  Copy,
  Binary,
  Tag,
  Target,
  KeyRound,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

const SectionLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h3
    className="text-xs font-bold uppercase tracking-widest mb-3"
    style={{ color: '#8290A5', letterSpacing: '0.1em' }}
  >
    {children}
  </h3>
);

export const DataProfilingScreen: React.FC = () => {
  const { profile, targetColumn, setActiveStage, markStageCompleted } = useStudio();

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: '#F1F5F9' }}>
          <FileText className="w-6 h-6" style={{ color: '#8290A5' }} />
        </div>
        <p className="text-sm font-medium" style={{ color: '#526078' }}>No dataset profile available.</p>
        <p className="text-xs" style={{ color: '#8290A5' }}>Please upload a dataset first.</p>
      </div>
    );
  }

  const { overview, columns, quality, data_preview, preview_columns } = profile;

  const handleNext = () => {
    markStageCompleted('profile');
    markStageCompleted('preprocess');
    setActiveStage('preprocess');
  };

  const statCards = [
    { label: 'Total Rows', value: overview.row_count.toLocaleString(), icon: <FileText className="w-4 h-4" />, color: '#2563EB', bg: '#EFF6FF' },
    { label: 'Columns', value: overview.col_count, icon: <Hash className="w-4 h-4" />, color: '#7C3AED', bg: '#F5F3FF' },
    { label: 'Missing Values', value: overview.missing_values_count, icon: <AlertTriangle className="w-4 h-4" />, color: '#B45309', bg: '#FFFBEB' },
    { label: 'Duplicate Rows', value: overview.duplicate_rows_count, icon: <Copy className="w-4 h-4" />, color: '#DC2626', bg: '#FEF2F2' },
    { label: 'Numerical', value: overview.numerical_features_count, icon: <Binary className="w-4 h-4" />, color: '#15803D', bg: '#F0FDF4' },
    { label: 'Categorical', value: overview.categorical_features_count, icon: <Tag className="w-4 h-4" />, color: '#0369A1', bg: '#F0F9FF' },
    { label: 'Target', value: overview.target_column || '—', icon: <Target className="w-4 h-4" />, color: '#2563EB', bg: '#EFF6FF' },
    { label: 'ID Column', value: overview.id_column || '—', icon: <KeyRound className="w-4 h-4" />, color: '#526078', bg: '#F1F5F9' },
  ];

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <span
            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold mb-2"
            style={{ background: '#EFF6FF', color: '#2563EB', border: '1px solid #BFDBFE' }}
          >
            Step 2 of 9
          </span>
          <h1 className="text-2xl font-bold" style={{ color: '#111827' }}>Data Profiling</h1>
          <p className="text-sm mt-1" style={{ color: '#526078' }}>
            Automated structural, statistical, and quality analysis of your dataset.
          </p>
        </div>
        <button
          onClick={handleNext}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white shrink-0"
          style={{ background: '#2563EB' }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#1D4ED8')}
          onMouseLeave={(e) => (e.currentTarget.style.background = '#2563EB')}
        >
          Configure Preprocessing
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Stat cards */}
      <div>
        <SectionLabel>Dataset Overview</SectionLabel>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {statCards.map((card, i) => (
            <div
              key={i}
              className="rounded-xl p-3.5 border text-center"
              style={{ background: '#FFFFFF', borderColor: '#E2E8F0' }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-2"
                style={{ background: card.bg, color: card.color }}
              >
                {card.icon}
              </div>
              <div className="text-base font-bold leading-tight" style={{ color: '#111827' }}>
                {card.value}
              </div>
              <div className="text-[10px] mt-0.5 font-medium truncate" style={{ color: '#8290A5' }}>
                {card.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quality warnings */}
      {quality.warnings.length > 0 && (
        <div
          className="flex gap-3 p-4 rounded-xl"
          style={{ background: '#FFFBEB', border: '1px solid #FDE68A' }}
        >
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#B45309' }} />
          <div>
            <div className="text-sm font-semibold mb-1" style={{ color: '#92400E' }}>Data Quality Insights</div>
            <ul className="space-y-0.5">
              {quality.warnings.map((w, idx) => (
                <li key={idx} className="text-xs" style={{ color: '#B45309' }}>· {w}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Data preview */}
      <div>
        <SectionLabel>Data Preview</SectionLabel>
        <div
          className="rounded-2xl border overflow-hidden"
          style={{ background: '#FFFFFF', borderColor: '#E2E8F0' }}
        >
          <div
            className="flex items-center justify-between px-5 py-3 border-b"
            style={{ borderColor: '#F1F5F9' }}
          >
            <span className="text-sm font-semibold" style={{ color: '#111827' }}>First 10 rows</span>
            <span className="text-xs" style={{ color: '#8290A5' }}>
              Showing sample from {overview.row_count.toLocaleString()} total rows
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                <tr>
                  {preview_columns.map((col) => (
                    <th key={col} className="px-4 py-2.5 font-semibold whitespace-nowrap" style={{ color: '#526078' }}>
                      <div className="flex items-center gap-1.5">
                        <span>{col}</span>
                        {col === targetColumn && (
                          <span
                            className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase"
                            style={{ background: '#EFF6FF', color: '#2563EB' }}
                          >
                            target
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data_preview.map((row, rowIdx) => (
                  <tr
                    key={rowIdx}
                    style={{ borderBottom: '1px solid #F1F5F9' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#F8FAFC')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    {preview_columns.map((col) => {
                      const val = row[col];
                      const isTarget = col === targetColumn;
                      return (
                        <td key={col} className="px-4 py-2 whitespace-nowrap" style={{ color: '#526078' }}>
                          {val === null || val === undefined ? (
                            <span className="italic" style={{ color: '#CBD5E1' }}>null</span>
                          ) : isTarget ? (
                            <span
                              className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold"
                              style={{ background: '#EFF6FF', color: '#2563EB' }}
                            >
                              {String(val)}
                            </span>
                          ) : (
                            <span style={{ color: '#374151' }}>{String(val)}</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Column statistics */}
      <div>
        <SectionLabel>Column Statistics</SectionLabel>
        <div
          className="rounded-2xl border overflow-hidden"
          style={{ background: '#FFFFFF', borderColor: '#E2E8F0' }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                <tr>
                  {['Column', 'Type', 'Missing %', 'Unique', 'Mean', 'Std', 'Min', 'Max'].map((h) => (
                    <th key={h} className="px-4 py-2.5 font-semibold whitespace-nowrap uppercase text-[10px] tracking-wider" style={{ color: '#8290A5' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {columns.map((c, i) => (
                  <tr
                    key={c.name}
                    style={{ borderBottom: '1px solid #F1F5F9' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#F8FAFC')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td className="px-4 py-2.5 font-medium" style={{ color: '#111827' }}>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span>{c.name}</span>
                        {c.name === targetColumn && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase" style={{ background: '#EFF6FF', color: '#2563EB' }}>
                            target
                          </span>
                        )}
                        {c.is_potential_id && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-medium" style={{ background: '#F1F5F9', color: '#526078' }}>
                            id
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2.5 font-mono text-[11px]" style={{ color: '#526078' }}>{c.data_type}</td>
                    <td className="px-4 py-2.5">
                      <span
                        className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold"
                        style={{
                          background: c.missing_percentage > 0 ? '#FFFBEB' : '#F0FDF4',
                          color: c.missing_percentage > 0 ? '#B45309' : '#15803D',
                        }}
                      >
                        {c.missing_percentage}%
                      </span>
                    </td>
                    <td className="px-4 py-2.5" style={{ color: '#526078' }}>{c.unique_count.toLocaleString()}</td>
                    <td className="px-4 py-2.5 font-mono" style={{ color: '#526078' }}>
                      {c.mean != null ? Number(c.mean).toFixed(2) : '—'}
                    </td>
                    <td className="px-4 py-2.5 font-mono" style={{ color: '#526078' }}>
                      {c.std != null ? Number(c.std).toFixed(2) : '—'}
                    </td>
                    <td className="px-4 py-2.5 font-mono" style={{ color: '#526078' }}>
                      {c.min != null ? c.min.toLocaleString() : '—'}
                    </td>
                    <td className="px-4 py-2.5 font-mono" style={{ color: '#526078' }}>
                      {c.max != null ? c.max.toLocaleString() : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="flex justify-end">
        <button
          onClick={handleNext}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white"
          style={{ background: '#2563EB' }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#1D4ED8')}
          onMouseLeave={(e) => (e.currentTarget.style.background = '#2563EB')}
        >
          Configure Preprocessing
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
