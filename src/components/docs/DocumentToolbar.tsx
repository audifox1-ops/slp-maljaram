/**
 * DocumentToolbar 컴포넌트
 * 연간계획서/월별일지 탭, 연도/월 선택, 워드 다운로드, 인쇄, 가상 일지 생성 버튼
 */
import React from 'react';
import { Calendar, Download, Printer, Sparkles } from 'lucide-react';
import { Student, MonthlyJournalData } from '../../types';

interface DocumentToolbarProps {
  selectedStudent: Student;
  activeTab: 'annual' | 'monthly';
  setActiveTab: (tab: 'annual' | 'monthly') => void;
  selectedYear: number;
  setSelectedYear: (year: number) => void;
  selectedMonth: number;
  setSelectedMonth: (month: number) => void;
  monthlyData: MonthlyJournalData | null;
  onDownloadWord: () => void;
  onDownloadHWPX: () => void;
  onPrint: () => void;
  onGenerateDraft: () => void;
}

export const DocumentToolbar: React.FC<DocumentToolbarProps> = ({
  selectedStudent,
  activeTab,
  setActiveTab,
  selectedYear,
  setSelectedYear,
  selectedMonth,
  setSelectedMonth,
  monthlyData,
  onDownloadWord,
  onDownloadHWPX,
  onPrint,
  onGenerateDraft,
}) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 no-print">
      <div>
        <h2 className="text-2xl font-bold text-text-main">
          {selectedStudent.name} 학생
        </h2>
        <p className="text-sm text-text-muted">
          {selectedStudent.treatmentArea} · {selectedStudent.school}
        </p>
      </div>

      <div className="flex flex-wrap gap-3 w-full md:w-auto">
        {/* 탭 전환 */}
        <div className="flex gap-1 bg-slate-200/50 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('annual')}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'annual'
                ? 'bg-white text-primary shadow-md'
                : 'text-text-muted hover:text-text-main'
            }`}
          >
            연간계획서
          </button>
          <button
            onClick={() => setActiveTab('monthly')}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'monthly'
                ? 'bg-white text-primary shadow-md'
                : 'text-text-muted hover:text-text-main'
            }`}
          >
            월별일지
          </button>
        </div>

        {/* 연도/월 선택 */}
        <div className="flex items-center gap-2 px-4 bg-white border border-border-theme rounded-xl h-11 shadow-sm">
          <Calendar className="w-4 h-4 text-text-muted" />
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="bg-transparent text-sm font-bold outline-none cursor-pointer"
          >
            {[2024, 2025, 2026].map((y) => (
              <option key={y} value={y}>
                {y}년
              </option>
            ))}
          </select>
          <div className="w-px h-4 bg-border-theme mx-1" />
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="bg-transparent text-sm font-bold outline-none cursor-pointer"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>
                {m}월
              </option>
            ))}
          </select>
        </div>

        {/* 워드 다운로드 */}
        <button
          onClick={onDownloadWord}
          className="flex items-center gap-2 px-6 py-2.5 bg-white border border-primary text-primary rounded-xl font-bold text-sm hover:bg-primary-light transition-all"
        >
          <Download className="w-4 h-4" />
          Word
        </button>

        {/* HWPX 다운로드 */}
        <button
          onClick={onDownloadHWPX}
          className="flex items-center gap-2 px-6 py-2.5 bg-white border border-primary text-primary rounded-xl font-bold text-sm hover:bg-primary-light transition-all"
        >
          <Download className="w-4 h-4" />
          HWPX
        </button>

        {/* 인쇄 */}
        <button
          onClick={onPrint}
          className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary-dark transition-all shadow-lg shadow-primary/20"
        >
          <Printer className="w-4 h-4" />
          인쇄하기
        </button>

        {/* 가상 일지 생성 (월별일지 탭 + 세션이 없을 때만 표시) */}
        {activeTab === 'monthly' &&
          (!monthlyData || monthlyData.sessions.length === 0) && (
            <button
              onClick={onGenerateDraft}
              className="flex items-center gap-2 px-6 py-2.5 bg-amber-500 text-white rounded-xl font-bold text-sm hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/20"
            >
              <Sparkles className="w-4 h-4" />
              가상 일지 생성
            </button>
          )}
      </div>
    </div>
  );
};
