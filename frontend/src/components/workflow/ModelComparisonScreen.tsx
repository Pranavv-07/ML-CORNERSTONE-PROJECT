import React, { useState } from 'react';
import { useStudio } from '../../context/StudioContext';
import { apiClient } from '../../api/client';
import { Trophy, ArrowRight, Sparkles } from 'lucide-react';

export const ModelComparisonScreen: React.FC = () => {
  const { comparison, setComparison, experimentSummary, selectedModelId, setSelectedModelId, setActiveStage, markStageCompleted } = useStudio();
  const [sortMetric, setSortMetric] = useState<string>('F1 Score');

  if (!comparison || comparison.models.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <p className="text-sm font-medium" style={{ color: '#526078' }}>No completed models yet. Please train models first.</p>
      </div>
    );
  }

  const { problem_type, models, recommended_model, metric_keys } = comparison;

  const handleSortChange = async (metric: string) => {
    setSortMetric(metric);
    if (experimentSummary) {
      const updated = await apiClient.compareModels(experimentSummary.experiment_id, metric);
      setComparison(updated);
    }
  };

  const handleProceedToEvaluation = () => {
    markStageCompleted('evaluate');
    setActiveStage('evaluate');
  };

  const fmt = (val: any, mk: string) => {
    if (typeof val !== 'number') return '—';
    return problem_type === 'classification' && val <= 1.0 ? `${(val * 100).toFixed(1)}%` : val.toFixed(mk.includes('R²') ? 4 : 2);
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-start justify-between">
        <div>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold mb-2" style={{ background: '#EFF6FF', color: '#2563EB', border: '1px solid #BFDBFE' }}>
            Step 6 of 9
          </span>
          <h1 className="text-2xl font-bold" style={{ color: '#111827' }}>
            Model Comparison{' '}
            <span className="text-base font-normal" style={{ color: '#8290A5' }}>
              ({problem_type === 'classification' ? 'Classification' : 'Regression'})
            </span>
          </h1>
          <p className="text-sm mt-1" style={{ color: '#526078' }}>Consistent evaluation across all trained algorithms on identical test folds.</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium" style={{ color: '#526078' }}>Rank by:</span>
            <select value={sortMetric} onChange={(e) => handleSortChange(e.target.value)}
              className="rounded-lg px-2.5 py-1.5 text-xs font-semibold outline-none"
              style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', color: '#111827' }}
            >
              {metric_keys.map((k) => <option key={k} value={k}>{k}</option>)}
            </select>
          </div>
          <button onClick={handleProceedToEvaluation}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
            style={{ background: '#2563EB' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#1D4ED8')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#2563EB')}
          >
            Detailed Results <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Recommended model banner */}
      {recommended_model && (
        <div className="flex items-center gap-4 p-5 rounded-2xl border" style={{ background: '#FFFBEB', borderColor: '#FDE68A' }}>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#FEF3C7', border: '1px solid #FDE68A' }}>
            <Trophy className="w-7 h-7" style={{ color: '#B45309' }} />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-widest flex items-center gap-1.5 mb-0.5" style={{ color: '#92400E' }}>
              <Sparkles className="w-3.5 h-3.5" /> Recommended Champion
            </div>
            <div className="text-lg font-bold" style={{ color: '#111827' }}>{recommended_model.model_name}</div>
            <p className="text-xs mt-0.5" style={{ color: '#526078' }}>{recommended_model.rationale}</p>
          </div>
          <div className="ml-auto text-right">
            <div className="text-xs font-medium" style={{ color: '#8290A5' }}>{recommended_model.primary_metric_name}</div>
            <div className="text-xl font-bold" style={{ color: '#2563EB' }}>
              {problem_type === 'classification' ? `${(recommended_model.primary_metric_value * 100).toFixed(1)}%` : recommended_model.primary_metric_value.toFixed(4)}
            </div>
          </div>
        </div>
      )}

      {/* Comparison table */}
      <div className="rounded-2xl border overflow-hidden" style={{ background: '#FFFFFF', borderColor: '#E2E8F0' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
              <tr>
                <th className="px-4 py-3 font-bold text-center w-12 text-[10px] uppercase tracking-wider" style={{ color: '#8290A5' }}>#</th>
                <th className="px-4 py-3 font-bold text-[10px] uppercase tracking-wider" style={{ color: '#8290A5' }}>Model</th>
                {metric_keys.map((mk) => (
                  <th key={mk} className="px-4 py-3 font-bold text-center text-[10px] uppercase tracking-wider" style={{ color: '#8290A5' }}>{mk}</th>
                ))}
                <th className="px-4 py-3 font-bold text-center text-[10px] uppercase tracking-wider" style={{ color: '#8290A5' }}>Train Time</th>
                <th className="px-4 py-3 font-bold text-center text-[10px] uppercase tracking-wider" style={{ color: '#8290A5' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {models.map((m) => {
                const isSelected = m.id === selectedModelId;
                const isChampion = m.id === recommended_model?.model_id;
                return (
                  <tr key={m.id} onClick={() => setSelectedModelId(m.id)}
                    className="cursor-pointer"
                    style={{
                      background: isSelected ? '#EFF6FF' : 'transparent',
                      borderBottom: '1px solid #F1F5F9',
                      transition: 'background 150ms',
                    }}
                    onMouseEnter={(e) => { if (!isSelected) (e.currentTarget as HTMLTableRowElement).style.background = '#F8FAFC'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = isSelected ? '#EFF6FF' : 'transparent'; }}
                  >
                    <td className="px-4 py-3 text-center">
                      {isChampion ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold" style={{ background: '#FEF3C7', color: '#B45309' }}>1</span>
                      ) : (
                        <span style={{ color: '#8290A5' }}>{m.rank}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold" style={{ color: '#111827' }}>{m.model_name}</span>
                        {isChampion && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase" style={{ background: '#FEF3C7', color: '#B45309' }}>Champion</span>
                        )}
                      </div>
                    </td>
                    {metric_keys.map((mk) => (
                      <td key={mk} className="px-4 py-3 text-center font-mono" style={{ color: '#374151' }}>{fmt(m.metrics[mk], mk)}</td>
                    ))}
                    <td className="px-4 py-3 text-center">
                      <span className="px-2 py-0.5 rounded text-[11px] font-mono font-medium" style={{ background: '#F0FDF4', color: '#15803D' }}>
                        {m.training_time_sec.toFixed(1)}s
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button type="button"
                        onClick={(e) => { e.stopPropagation(); setSelectedModelId(m.id); handleProceedToEvaluation(); }}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                        style={{ background: isSelected ? '#2563EB' : '#F1F5F9', color: isSelected ? '#FFFFFF' : '#526078' }}
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
