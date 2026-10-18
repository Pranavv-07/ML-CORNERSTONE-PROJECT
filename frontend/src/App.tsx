import React from 'react';
import { StudioProvider, useStudio } from './context/StudioContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { DatasetUploadScreen } from './components/workflow/DatasetUploadScreen';
import { DataProfilingScreen } from './components/workflow/DataProfilingScreen';
import { PreprocessingScreen } from './components/workflow/PreprocessingScreen';
import { ProblemDetectionScreen } from './components/workflow/ProblemDetectionScreen';
import { ModelTrainingScreen } from './components/workflow/ModelTrainingScreen';
import { ModelComparisonScreen } from './components/workflow/ModelComparisonScreen';
import { DetailedEvaluationScreen } from './components/workflow/DetailedEvaluationScreen';
import { ExplainabilityScreen } from './components/workflow/ExplainabilityScreen';
import { PredictionExportScreen } from './components/workflow/PredictionExportScreen';

const MainWorkspace: React.FC = () => {
  const { activeStage } = useStudio();

  return (
    <main
      className="flex-1 overflow-y-auto"
      style={{ background: '#F6F8FB', minHeight: '100vh' }}
    >
      <div className="py-8 px-6 max-w-7xl mx-auto">
        {activeStage === 'dataset' && <DatasetUploadScreen />}
        {activeStage === 'profile' && <DataProfilingScreen />}
        {activeStage === 'preprocess' && <PreprocessingScreen />}
        {activeStage === 'problem' && <ProblemDetectionScreen />}
        {activeStage === 'train' && <ModelTrainingScreen />}
        {activeStage === 'compare' && <ModelComparisonScreen />}
        {activeStage === 'evaluate' && <DetailedEvaluationScreen />}
        {activeStage === 'explain' && <ExplainabilityScreen />}
        {activeStage === 'predict' && <PredictionExportScreen />}
      </div>
    </main>
  );
};

export default function App() {
  return (
    <StudioProvider>
      <div className="flex flex-col min-h-screen" style={{ fontFamily: "'Inter', system-ui, sans-serif", background: '#F6F8FB' }}>
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <MainWorkspace />
        </div>
      </div>
    </StudioProvider>
  );
}
