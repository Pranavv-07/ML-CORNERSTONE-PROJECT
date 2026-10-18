import React, { useState } from 'react';
import { useStudio } from '../../context/StudioContext';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { ArrowRight } from 'lucide-react';

const Tab: React.FC<{ label: string; active: boolean; onClick: () => void }> = ({ label, active, onClick }) => (
  <button onClick={onClick} className="px-5 py-3 text-sm font-medium whitespace-nowrap"
    style={{ color: active ? '#2563EB' : '#526078', borderBottom: active ? '2px solid #2563EB' : '2px solid transparent' }}
  >
    {label}
  </button>
);

export const ExplainabilityScreen: React.FC = () => {
  const { shapData, selectedModelName, selectedModelId, comparison, setSelectedModelId, setActiveStage, markStageCompleted } = useStudio();
  const [activeTab, setActiveTab] = useState<'shap_summary' | 'shap_bar' | 'feature_importance'>('shap_summary');

  if (!shapData) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <p className="text-sm font-medium" style={{ color: '#526078' }}>Loading SHAP explainability data…</p>
      </div>
    );
  }

  const { explainer_type, feature_importance, shap_bar_data, scatter_samples, base_value } = shapData;
  const top10Features = feature_importance.slice(0, 10).map((f) => f.feature);

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold mb-2" style={{ background: '#EFF6FF', color: '#2563EB', border: '1px solid #BFDBFE' }}>
            Step 8 of 9
          </span>
          <h1 className="text-2xl font-bold" style={{ color: '#111827' }}>Explainability — {selectedModelName}</h1>
          <p className="text-sm mt-1" style={{ color: '#526078' }}>
            Explainer: <span className="font-semibold" style={{ color: '#2563EB' }}>{explainer_type}</span> · Base value: {base_value}
          </p>
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
          <button onClick={() => { markStageCompleted('predict'); setActiveStage('predict'); }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
            style={{ background: '#2563EB' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#1D4ED8')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#2563EB')}
          >
            Predict & Export <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b overflow-x-auto" style={{ borderColor: '#E2E8F0' }}>
        <Tab label="SHAP Summary Plot" active={activeTab === 'shap_summary'} onClick={() => setActiveTab('shap_summary')} />
        <Tab label="SHAP Bar Plot" active={activeTab === 'shap_bar'} onClick={() => setActiveTab('shap_bar')} />
        <Tab label="Feature Importance" active={activeTab === 'feature_importance'} onClick={() => setActiveTab('feature_importance')} />
      </div>

      {/* SHAP Summary (Beeswarm) */}
      {activeTab === 'shap_summary' && (
        <div className="rounded-2xl border p-6 space-y-5" style={{ background: '#FFFFFF', borderColor: '#E2E8F0' }}>
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: '#8290A5' }}>SHAP Summary — Feature Impact</h3>
              <p className="text-xs mt-1" style={{ color: '#8290A5' }}>Horizontal spread shows SHAP value impact. Color = feature value magnitude.</p>
            </div>
            <div className="flex items-center gap-2 text-xs shrink-0">
              <span className="font-bold" style={{ color: '#2563EB' }}>Low</span>
              <div className="w-20 h-2.5 rounded-full" style={{ background: 'linear-gradient(to right, #3B82F6, #8B5CF6, #EF4444)' }} />
              <span className="font-bold" style={{ color: '#EF4444' }}>High</span>
            </div>
          </div>
          <div className="space-y-2.5">
            {top10Features.map((feat) => {
              const points = scatter_samples.filter((p) => p.feature === feat);
              return (
                <div key={feat} className="flex items-center gap-4">
                  <div className="w-36 text-right text-xs font-medium truncate" style={{ color: '#526078' }} title={feat}>{feat}</div>
                  <div className="flex-1 relative rounded-lg overflow-hidden" style={{ height: 32, background: '#F6F8FB', border: '1px solid #E2E8F0' }}>
                    <div className="absolute left-1/2 top-0 bottom-0 w-px" style={{ background: '#CBD5E1', zIndex: 1 }} />
                    {points.map((pt, pIdx) => {
                      const leftPct = Math.max(5, Math.min(95, 50 + pt.shap_value * 30));
                      const r = Math.round(59 + Math.max(0, Math.min(1, pt.feature_value)) * 180);
                      const g = Math.round(130 - Math.max(0, Math.min(1, pt.feature_value)) * 90);
                      const b = Math.round(246 - Math.max(0, Math.min(1, pt.feature_value)) * 180);
                      return (
                        <div key={pIdx}
                          title={`${feat}: SHAP=${pt.shap_value.toFixed(3)}`}
                          className="absolute w-2 h-2 rounded-full"
                          style={{ left: `${leftPct}%`, top: `${20 + (pIdx % 3) * 18}%`, backgroundColor: `rgb(${r},${g},${b})`, opacity: 0.75 }}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}
            <div className="flex justify-between text-[10px] pt-1 ml-40" style={{ color: '#8290A5' }}>
              <span>← Decreases prediction</span>
              <span>No impact</span>
              <span>Increases prediction →</span>
            </div>
          </div>
        </div>
      )}

      {/* SHAP Bar */}
      {activeTab === 'shap_bar' && (
        <div className="rounded-2xl border p-6" style={{ background: '#FFFFFF', borderColor: '#E2E8F0' }}>
          <h3 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#8290A5' }}>Mean |SHAP Value| — Average Impact</h3>
          <div style={{ height: 400 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={shap_bar_data} layout="vertical" margin={{ top: 5, right: 30, left: 120, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="feature" type="category" tick={{ fontSize: 11 }} />
                <Tooltip formatter={(val: any) => [`${val}`, 'Mean |SHAP|']} />
                <Bar dataKey="importance" fill="#2563EB" radius={[0, 6, 6, 0]} name="Impact" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Feature Importance */}
      {activeTab === 'feature_importance' && (
        <div className="rounded-2xl border p-6" style={{ background: '#FFFFFF', borderColor: '#E2E8F0' }}>
          <h3 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#8290A5' }}>Ranked Feature Importance</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {feature_importance.map((f, i) => {
              const maxImp = feature_importance[0]?.importance || 1;
              const pct = (f.importance / maxImp) * 100;
              return (
                <div key={f.feature} className="p-3.5 rounded-xl border space-y-2" style={{ background: '#F6F8FB', borderColor: '#E2E8F0' }}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium flex items-center gap-2" style={{ color: '#111827' }}>
                      <span className="text-[10px] font-mono w-5 text-right shrink-0" style={{ color: '#8290A5' }}>{i + 1}.</span>
                      <span className="truncate">{f.feature}</span>
                    </span>
                    <span className="font-bold font-mono shrink-0" style={{ color: '#2563EB' }}>{f.importance}</span>
                  </div>
                  <div className="w-full rounded-full overflow-hidden" style={{ height: 4, background: '#E2E8F0' }}>
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: '#2563EB', transition: 'width 600ms ease-out' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
