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
    <header className="glass-effect h-[76px] px-6 md:px-10 flex items-center justify-between no-print sticky top-0 z-40 flex-shrink-0">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5 font-extrabold text-2xl text-primary tracking-tight">
          <div className="bg-primary p-2 rounded-xl shadow-lg shadow-primary/20">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <span className="text-gradient">SLP.Docs</span>
        </div>
        
        {currentDate && (
          <div className="hidden lg:flex items-center gap-2 px-4 py-1.5 bg-white/50 rounded-full text-xs font-bold text-slate-500 border border-white/40 shadow-sm ml-4">
            <Calendar className="w-3.5 h-3.5 text-accent" />
            {currentDate}
          </div>
        )}
      </div>

      <nav className="hidden md:flex items-center gap-1.5 bg-slate-100/50 p-1.5 rounded-2xl no-print border border-slate-200/50">
        <button
          onClick={() => setCurrentView('docs')}
          className={`px-5 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${
            currentView === 'docs'
              ? 'bg-white text-primary shadow-md shadow-primary/5'
              : 'text-text-muted hover:text-text-main hover:bg-white/40'
          }`}
        >
          서류 생성
        </button>
        <button
          onClick={() => setCurrentView('students')}
          className={`px-5 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${
            currentView === 'students'
              ? 'bg-white text-primary shadow-md shadow-primary/5'
              : 'text-text-muted hover:text-text-main hover:bg-white/40'
          }`}
        >
          학생 정보 관리
        </button>
      </nav>

      <div className="flex items-center gap-4">
        {isDataLoaded && (
          <button
            onClick={onNewUpload}
            className="text-sm font-bold text-text-muted hover:text-primary transition-all flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-primary-light active:scale-95"
          >
            <Upload className="w-4 h-4" />
            <span>새 파일 업로드</span>
          </button>
        )}
      </div>
    </header>
  );
};
