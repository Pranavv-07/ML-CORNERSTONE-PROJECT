import React, { useState } from 'react';
import { useStudio } from '../../context/StudioContext';
import { CheckCircle2, Info, ArrowRight, BarChart } from 'lucide-react';
import { ResponsiveContainer, BarChart as RechartsBarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';

export const ProblemDetectionScreen: React.FC = () => {
  const { problemDetection, targetColumn, setActiveStage, markStageCompleted } = useStudio();
  const [overrideType, setOverrideType] = useState<string>(
    problemDetection?.detected_problem_type || 'classification'
  );

  if (!problemDetection) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <p className="text-sm font-medium" style={{ color: '#526078' }}>Please configure preprocessing first.</p>
      </div>
    );
  }

  const { detected_problem_type, reason, classes_count, class_distribution, target_stats } = problemDetection;

  const handleNext = () => {
    markStageCompleted('problem');
    markStageCompleted('train');
    setActiveStage('train');
  };

  const chartColors = ['#2563EB', '#7C3AED', '#15803D', '#B45309', '#DC2626'];

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold mb-2" style={{ background: '#EFF6FF', color: '#2563EB', border: '1px solid #BFDBFE' }}>
          Step 4 of 9
        </span>
        <h1 className="text-2xl font-bold" style={{ color: '#111827' }}>Problem Detection</h1>
        <p className="text-sm mt-1" style={{ color: '#526078' }}>Automatic problem type detection derived from target column characteristics.</p>
      </div>

      <div className="rounded-2xl border p-6 space-y-6" style={{ background: '#FFFFFF', borderColor: '#E2E8F0' }}>
        {/* Detection banner */}
        <div className="flex items-start gap-4 p-5 rounded-xl" style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
          <div className="w-11 h-11 rounded-full flex items-center justify-center shrink-0" style={{ background: '#15803D' }}>
            <CheckCircle2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-widest mb-0.5" style={{ color: '#15803D' }}>Auto-Detected</div>
            <h2 className="text-2xl font-bold capitalize" style={{ color: '#111827' }}>{detected_problem_type}</h2>
            <p className="text-sm mt-1" style={{ color: '#526078' }}>{reason}</p>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl" style={{ background: '#F6F8FB', border: '1px solid #E2E8F0' }}>
            <div className="text-xs font-medium mb-1" style={{ color: '#8290A5' }}>Target Column</div>
            <div className="text-sm font-bold font-mono" style={{ color: '#111827' }}>{targetColumn}</div>
          </div>
          {detected_problem_type === 'classification' && (
            <div className="p-4 rounded-xl" style={{ background: '#F6F8FB', border: '1px solid #E2E8F0' }}>
              <div className="text-xs font-medium mb-1" style={{ color: '#8290A5' }}>Classes</div>
              <div className="text-sm font-bold" style={{ color: '#111827' }}>{classes_count} distinct classes</div>
            </div>
          )}
          {detected_problem_type === 'regression' && target_stats && (
            <div className="p-4 rounded-xl" style={{ background: '#F6F8FB', border: '1px solid #E2E8F0' }}>
              <div className="text-xs font-medium mb-1" style={{ color: '#8290A5' }}>Target Mean ± Std</div>
              <div className="text-sm font-bold font-mono" style={{ color: '#111827' }}>
                {target_stats.mean.toFixed(2)} ± {target_stats.std.toFixed(2)}
              </div>
            </div>
          )}
          <div className="p-4 rounded-xl" style={{ background: '#F6F8FB', border: '1px solid #E2E8F0' }}>
            <div className="text-xs font-medium mb-1" style={{ color: '#8290A5' }}>Recommended Metrics</div>
            <div className="text-sm font-semibold" style={{ color: '#2563EB' }}>
              {problemDetection.recommended_metrics.slice(0, 3).join(', ')}
            </div>
          </div>
        </div>

        {/* Class distribution chart */}
        {detected_problem_type === 'classification' && class_distribution && (
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#8290A5' }}>Class Distribution</h3>
            <div className="rounded-xl p-4" style={{ background: '#F6F8FB', border: '1px solid #E2E8F0', height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={class_distribution} margin={{ top: 5, right: 20, left: 0, bottom: 20 }}>
                  <XAxis dataKey="category" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} unit="%" />
                  <Tooltip formatter={(val: any, _: any, item: any) => [`${val}% (${item.payload.count} samples)`, 'Percentage']} />
                  <Bar dataKey="percentage" radius={[6, 6, 0, 0]}>
                    {class_distribution.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                    ))}
                  </Bar>
                </RechartsBarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Override */}
        <div className="p-4 rounded-xl" style={{ background: '#EFF6FF', border: '1px solid #BFDBFE' }}>
          <div className="flex items-center gap-2 mb-2">
            <Info className="w-4 h-4" style={{ color: '#2563EB' }} />
            <span className="text-sm font-semibold" style={{ color: '#1E40AF' }}>Manual Override</span>
          </div>
          <p className="text-xs mb-3" style={{ color: '#526078' }}>Override the detected problem type if needed.</p>
          <select
            value={overrideType}
            onChange={(e) => setOverrideType(e.target.value)}
            className="w-48 rounded-xl px-3 py-2 text-sm font-medium outline-none"
            style={{ background: '#FFFFFF', border: '1px solid #BFDBFE', color: '#111827' }}
          >
            <option value="classification">Classification {detected_problem_type === 'classification' ? '(Auto)' : ''}</option>
            <option value="regression">Regression {detected_problem_type === 'regression' ? '(Auto)' : ''}</option>
          </select>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white"
            style={{ background: '#2563EB' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#1D4ED8')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#2563EB')}
          >
            Select Models to Train <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
