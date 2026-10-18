import React from 'react';
import { useStudio, WorkflowStage } from '../../context/StudioContext';
import {
  Upload,
  BarChart3,
  SlidersHorizontal,
  Compass,
  Cpu,
  GitCompare,
  LineChart,
  Sparkles,
  PlayCircle,
  CheckCircle2,
} from 'lucide-react';

interface NavItem {
  id: WorkflowStage;
  label: string;
  subtitle: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  {
    id: 'dataset',
    label: 'Upload Dataset',
    subtitle: 'CSV / Excel file',
    icon: <Upload className="w-4 h-4" />,
  },
  {
    id: 'profile',
    label: 'Data Profiling',
    subtitle: 'Dataset info & types',
    icon: <BarChart3 className="w-4 h-4" />,
  },
  {
    id: 'preprocess',
    label: 'Preprocessing',
    subtitle: 'Clean, encode, scale',
    icon: <SlidersHorizontal className="w-4 h-4" />,
  },
  {
    id: 'problem',
    label: 'Problem Detection',
    subtitle: 'Classification / Regression',
    icon: <Compass className="w-4 h-4" />,
  },
  {
    id: 'train',
    label: 'Model Training',
    subtitle: 'Multiple ML algorithms',
    icon: <Cpu className="w-4 h-4" />,
  },
  {
    id: 'compare',
    label: 'Model Comparison',
    subtitle: 'Metrics & ranking',
    icon: <GitCompare className="w-4 h-4" />,
  },
  {
    id: 'evaluate',
    label: 'Detailed Evaluation',
    subtitle: 'ROC, confusion matrix',
    icon: <LineChart className="w-4 h-4" />,
  },
  {
    id: 'explain',
    label: 'Explainability',
    subtitle: 'SHAP & feature impact',
    icon: <Sparkles className="w-4 h-4" />,
  },
  {
    id: 'predict',
    label: 'Predictions & Export',
    subtitle: 'Inference & PDF report',
    icon: <PlayCircle className="w-4 h-4" />,
  },
];

const STAGE_ORDER: WorkflowStage[] = [
  'dataset', 'profile', 'preprocess', 'problem', 'train', 'compare', 'evaluate', 'explain', 'predict'
];

export const Sidebar: React.FC = () => {
  const { activeStage, setActiveStage, completedStages } = useStudio();

  const completedCount = completedStages.size;
  const totalStages = navItems.length;
  const progressPct = Math.round((completedCount / totalStages) * 100);

  const activeIdx = STAGE_ORDER.indexOf(activeStage);

  return (
    <aside
      className="shrink-0 flex flex-col border-r"
      style={{
        width: 272,
        background: '#FFFFFF',
        borderColor: '#E2E8F0',
        minHeight: 'calc(100vh - 68px)',
      }}
    >
      {/* Nav section label */}
      <div className="px-5 pt-5 pb-2">
        <span
          className="text-[10px] font-bold uppercase tracking-widest"
          style={{ color: '#8290A5', letterSpacing: '0.1em' }}
        >
          Workflow Stages
        </span>
      </div>

      {/* Nav list */}
      <nav className="flex-1 px-3 pb-4 space-y-0.5">
        {navItems.map((item, idx) => {
          const isActive = activeStage === item.id;
          const isCompleted = completedStages.has(item.id);
          const isClickable = isCompleted || isActive || idx <= activeIdx;

          return (
            <button
              key={item.id}
              type="button"
              disabled={!isClickable}
              onClick={() => isClickable && setActiveStage(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left group ${
                isClickable ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
              }`}
              style={{
                background: isActive ? '#EFF6FF' : 'transparent',
                borderLeft: isActive ? '3px solid #2563EB' : '3px solid transparent',
                transition: 'background 150ms, border-color 150ms',
              }}
              onMouseEnter={(e) => {
                if (!isActive && isClickable) {
                  (e.currentTarget as HTMLButtonElement).style.background = '#F6F8FB';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                }
              }}
            >
              {/* Step number / completed indicator */}
              <div
                className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
                style={{
                  background: isActive ? '#2563EB' : isCompleted ? '#F0FDF4' : '#F6F8FB',
                  color: isActive ? '#FFFFFF' : isCompleted ? '#15803D' : '#8290A5',
                  border: isCompleted && !isActive ? '1px solid #BBF7D0' : 'none',
                }}
              >
                {isCompleted && !isActive ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : (
                  <span>{idx + 1}</span>
                )}
              </div>

              {/* Icon + label */}
              <div className="flex items-center gap-2.5 flex-1 min-w-0">
                <span
                  style={{
                    color: isActive ? '#2563EB' : isCompleted ? '#526078' : '#8290A5',
                  }}
                >
                  {item.icon}
                </span>
                <div className="min-w-0">
                  <div
                    className="text-sm leading-tight font-medium truncate"
                    style={{
                      color: isActive ? '#111827' : isCompleted ? '#111827' : '#526078',
                      fontWeight: isActive ? 600 : 500,
                    }}
                  >
                    {item.label}
                  </div>
                  <div
                    className="text-[11px] leading-tight truncate mt-0.5"
                    style={{ color: '#8290A5' }}
                  >
                    {item.subtitle}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Progress footer */}
      <div
        className="mx-3 mb-4 rounded-xl p-4 border"
        style={{ background: '#F6F8FB', borderColor: '#E2E8F0' }}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold" style={{ color: '#526078' }}>
            Workflow Progress
          </span>
          <span className="text-xs font-bold" style={{ color: '#2563EB' }}>
            {completedCount}/{totalStages}
          </span>
        </div>
        <div
          className="w-full rounded-full overflow-hidden"
          style={{ height: 6, background: '#E2E8F0' }}
        >
          <div
            className="h-full rounded-full"
            style={{
              width: `${progressPct}%`,
              background: '#2563EB',
              transition: 'width 400ms ease-in-out',
            }}
          />
        </div>
        <div className="mt-1.5 text-[10px]" style={{ color: '#8290A5' }}>
          {progressPct}% completed
        </div>
      </div>
    </aside>
  );
};
