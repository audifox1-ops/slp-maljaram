/**
 * AppHeader 컴포넌트
 * 상단 네비게이션 바: 로고, 탭 전환(서류 생성/학생 정보 관리), 새 파일 업로드 버튼
 */
import React, { useState, useEffect } from 'react';
import { FileText, Upload, Calendar } from 'lucide-react';

interface AppHeaderProps {
  currentView: 'docs' | 'students';
  setCurrentView: (view: 'docs' | 'students') => void;
  isDataLoaded: boolean;
  onNewUpload: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  currentView,
  setCurrentView,
  isDataLoaded,
  onNewUpload,
}) => {
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    const today = new Date();
    setCurrentDate(today.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short'
    }));
  }, []);

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-border-theme h-[72px] px-6 md:px-10 flex items-center justify-between no-print sticky top-0 z-40 flex-shrink-0">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 font-extrabold text-xl text-primary tracking-tight">
          <div className="bg-primary p-1.5 rounded-lg">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <span>SLP.Docs</span>
        </div>
        
        {currentDate && (
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-md text-sm font-medium text-slate-600 border border-slate-200 shadow-sm ml-2">
            <Calendar className="w-4 h-4 text-primary" />
            {currentDate}
          </div>
        )}
      </div>

      <nav className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-xl no-print">
        <button
          onClick={() => setCurrentView('docs')}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
            currentView === 'docs'
              ? 'bg-white text-primary shadow-sm'
              : 'text-text-muted hover:text-text-main'
          }`}
        >
          서류 생성
        </button>
        <button
          onClick={() => setCurrentView('students')}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
            currentView === 'students'
              ? 'bg-white text-primary shadow-sm'
              : 'text-text-muted hover:text-text-main'
          }`}
        >
          학생 정보 관리
        </button>
      </nav>

      <div className="flex items-center gap-4">
        {isDataLoaded && (
          <button
            onClick={onNewUpload}
            className="text-sm font-semibold text-text-muted hover:text-primary transition-colors flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-primary-light"
          >
            <Upload className="w-4 h-4" />
            새 파일 업로드
          </button>
        )}
      </div>
    </header>
  );
};
