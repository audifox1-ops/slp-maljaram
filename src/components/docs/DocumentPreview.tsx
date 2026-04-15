/**
 * DocumentPreview 컴포넌트
 * 서류 미리보기 영역: 로딩 오버레이 + AnnualPlan/MonthlyJournal 렌더링
 */
import React from 'react';
import { FileText, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Student, AnnualPlanData, MonthlyJournalData } from '../../types';
import { AnnualPlan } from '../AnnualPlan';
import { MonthlyJournal } from '../MonthlyJournal';
import { LoadingOverlay } from '../common/LoadingOverlay';

interface DocumentPreviewProps {
  selectedStudent: Student | null;
  activeTab: 'annual' | 'monthly';
  annualData: AnnualPlanData | null;
  monthlyData: MonthlyJournalData | null;
  isLoading: boolean;
  selectedYear: number;
  selectedMonth: number;
  onSaveAnnual?: (data: AnnualPlanData) => void;
  onSaveMonthly?: (data: MonthlyJournalData) => void;
}

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({
  selectedStudent,
  activeTab,
  annualData,
  monthlyData,
  isLoading,
  selectedYear,
  selectedMonth,
  onSaveAnnual,
  onSaveMonthly,
}) => {
  // 학생 미선택 상태
  if (!selectedStudent) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-text-muted p-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-sm"
        >
          <div className="bg-white p-8 rounded-[2.5rem] mb-6 shadow-xl shadow-slate-200/50 border border-border-theme inline-block">
            <Sparkles className="w-12 h-12 text-primary/30" />
          </div>
          <h3 className="text-xl font-bold text-text-main mb-2">
            학생을 선택해 주세요
          </h3>
          <p className="text-sm leading-relaxed">
            좌측 목록에서 학생의 이름을 클릭하면
            <br />
            AI가 자동으로 서류를 생성합니다.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-white flex-1 rounded-3xl shadow-2xl shadow-slate-200/50 border border-border-theme p-6 md:p-12 overflow-auto relative print:p-0 print:shadow-none print:border-none print:overflow-visible">
      <AnimatePresence mode="wait">
        {isLoading ? (
          <LoadingOverlay />
        ) : (
          <motion.div
            key={activeTab + (selectedStudent?.id || '')}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="document-container min-h-full"
          >
            {activeTab === 'annual' &&
            annualData &&
            annualData.currentLevel ? (
              <AnnualPlan
                student={selectedStudent}
                data={annualData}
                year={selectedYear}
                onSave={onSaveAnnual}
              />
            ) : activeTab === 'monthly' &&
              monthlyData &&
              monthlyData.sessions ? (
              <MonthlyJournal
                student={selectedStudent}
                data={monthlyData}
                month={selectedMonth}
                year={selectedYear}
                onSave={onSaveMonthly}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-20 text-text-muted opacity-50">
                <FileText className="w-16 h-16 mb-4" />
                <p className="text-lg font-bold">
                  {monthlyData && monthlyData.sessions.length === 0
                    ? '해당 월의 치료 내역이 없습니다.'
                    : '서류 데이터를 생성할 수 없습니다.'}
                </p>
                <p className="text-sm">
                  데이터 형식이 올바른지 확인해 주세요.
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
