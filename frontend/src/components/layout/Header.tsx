import React, { useState, useEffect } from 'react';
import { useStudio } from '../../context/StudioContext';
import { BarChart2, Search, Wifi, WifiOff, HelpCircle } from 'lucide-react';

export const Header: React.FC = () => {
  const [backendStatus, setBackendStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');
  const [searchValue, setSearchValue] = useState('');

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const res = await fetch('/api/v1/datasets/samples', { method: 'GET', signal: AbortSignal.timeout(3000) });
        setBackendStatus(res.ok ? 'connected' : 'disconnected');
      } catch {
        setBackendStatus('disconnected');
      }
    };
    checkBackend();
    const id = setInterval(checkBackend, 30000);
    return () => clearInterval(id);
  }, []);

  return (
    <header
      className="shrink-0 z-40 border-b"
      style={{
        background: '#FFFFFF',
        borderColor: '#E2E8F0',
        height: '68px',
      }}
    >
      <div className="h-full px-6 flex items-center justify-between gap-4">
        {/* Left: Logo + Brand */}
        <div className="flex items-center gap-3 shrink-0">
          <div
            className="flex items-center justify-center rounded-xl"
            style={{ width: 36, height: 36, background: '#2563EB' }}
          >
            <BarChart2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-bold text-sm leading-tight" style={{ color: '#111827' }}>
              ML Cornerstone
            </div>
            <div className="text-xs leading-tight" style={{ color: '#8290A5' }}>
              Model Evaluation & Explainability Studio
            </div>
          </div>
        </div>

        {/* Center: Search */}
        <div className="flex-1 max-w-md">
          <div
            className="flex items-center gap-2.5 px-3.5 rounded-xl border"
            style={{
              background: '#F6F8FB',
              borderColor: '#E2E8F0',
              height: 38,
            }}
          >
            <Search className="w-4 h-4 shrink-0" style={{ color: '#8290A5' }} />
            <input
              type="text"
              placeholder="Search workflows, datasets, or results…"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-[#8290A5]"
              style={{ color: '#111827', fontSize: 13 }}
            />
            <kbd
              className="hidden sm:flex items-center text-[10px] px-1.5 py-0.5 rounded border font-mono"
              style={{ background: '#F1F5F9', borderColor: '#E2E8F0', color: '#8290A5' }}
            >
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Right: Status + Help */}
        <div className="flex items-center gap-4 shrink-0">
          {/* Backend status */}
          <div className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{
                background: backendStatus === 'connected' ? '#15803D' : backendStatus === 'disconnected' ? '#DC2626' : '#B45309',
              }}
            />
            <span
              className="text-xs font-medium"
              style={{
                color: backendStatus === 'connected' ? '#15803D' : backendStatus === 'disconnected' ? '#DC2626' : '#B45309',
              }}
            >
              {backendStatus === 'connected' ? 'Backend Connected' : backendStatus === 'disconnected' ? 'Backend Offline' : 'Checking…'}
            </span>
          </div>

          {/* Divider */}
          <div className="w-px h-5" style={{ background: '#E2E8F0' }} />

          {/* Help */}
          <button
            type="button"
            title="Help"
            className="flex items-center justify-center rounded-lg w-8 h-8 hover:bg-slate-100"
            style={{ color: '#8290A5' }}
          >
            <HelpCircle className="w-4.5 h-4.5" />
          </button>

          {/* User avatar placeholder */}
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
            style={{ background: '#2563EB' }}
          >
            ML
          </div>
        </div>
      </div>
    </header>
  );
};
