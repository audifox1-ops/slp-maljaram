/**
 * App.tsx — 오케스트레이터 컴포넌트
 * 
 * 비즈니스 로직은 커스텀 훅(useStudents, usePayments, useFileUpload, useDocumentGenerator)으로,
 * UI 렌더링은 분리된 컴포넌트(AppHeader, StudentSidebar, DocumentToolbar 등)로 위임합니다.
 * 이 파일은 이들을 조합하는 역할만 수행합니다.
 */
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Student, StudentInfo } from './types';
import {
  downloadAnnualPlanAsWord,
  downloadMonthlyJournalAsWord,
} from './services/wordExportService';
import {
  downloadAnnualPlanAsHWPX,
  downloadMonthlyJournalAsHWPX,
} from './services/hwpxExportService';

// 커스텀 훅
import { useStudents } from './hooks/useStudents';
import { usePayments } from './hooks/usePayments';
import { useFileUpload } from './hooks/useFileUpload';
import { useDocumentGenerator } from './hooks/useDocumentGenerator';
import { useToast } from './hooks/useToast';

// 레이아웃 컴포넌트
import { AppHeader } from './components/layout/AppHeader';
import { AppFooter } from './components/layout/AppFooter';

// 홈 화면 컴포넌트
import { HeroSection } from './components/home/HeroSection';
import { FileUploadCard } from './components/home/FileUploadCard';
import { FeatureGrid } from './components/home/FeatureGrid';

// 문서 화면 컴포넌트
import { StudentSidebar } from './components/docs/StudentSidebar';
import { DocumentToolbar } from './components/docs/DocumentToolbar';
import { DocumentPreview } from './components/docs/DocumentPreview';
import { BatchGenerationModal } from './components/docs/BatchGenerationModal';


// 기존 컴포넌트
import { StudentManagement } from './components/StudentManagement';

export default function App() {
  // ─── 공유 상태 ───
  const [isLoading, setIsLoading] = useState(false);
  const [currentView, setCurrentView] = useState<'docs' | 'students'>('docs');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [activeTab, setActiveTab] = useState<'annual' | 'monthly'>('annual');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);

  const { showToast } = useToast();

  // ─── 커스텀 훅 ───
  const {
    studentInfos,
    addStudent,
    updateStudent,
    deleteStudent,
    autoRegister,
  } = useStudents();

  const { allPaymentRecords, saveRecords, resetAllData } = usePayments(
    setIsLoading
  );

  const {
    rawRecords,
    isDataLoaded,
    fileInputRef,
    handleFileUpload,
    processFile,
    resetUpload,
  } = useFileUpload(saveRecords);

  const {
    annualData,
    monthlyData,
    isLoading: isDocLoading,
    fetchData,
    generateDraft,
    generateBatchInRange,
    saveAnnualData,
    saveMonthlyData,
  } = useDocumentGenerator(selectedYear, selectedMonth);

  // ─── 학생 목록 (결제 내역 + 등록된 학생 통합) ───
  const filteredStudents = useMemo(() => {
    const allNames = Array.from(
      new Set([
        ...allPaymentRecords.map((r) => r.studentName),
        ...studentInfos.map((s) => s.name),
      ])
    )
      .filter(Boolean)
      .sort();

    const term = searchTerm.toLowerCase();
    return term
      ? allNames.filter((name) => name.toLowerCase().includes(term))
      : allNames;
  }, [searchTerm, allPaymentRecords, studentInfos]);

  // ─── 선택된 학생 데이터 실시간 동기화 ───
  useEffect(() => {
    if (selectedStudent) {
      const updatedInfo = studentInfos.find(
        (s) => s.name === selectedStudent.name
      );
      if (updatedInfo) {
        const paymentDates = allPaymentRecords
          .filter((r) => r.studentName === updatedInfo.name)
          .map((r) => r.transactionDate)
          .filter(Boolean)
          .sort();

        setSelectedStudent((prev) => {
          if (!prev) return null;
          if (
            prev.birthDate === updatedInfo.birthDate &&
            prev.school === updatedInfo.school &&
            prev.disabilityType === updatedInfo.disabilityType &&
            prev.treatmentArea === updatedInfo.treatmentArea &&
            prev.therapistName === updatedInfo.therapistName &&
            JSON.stringify(prev.paymentDates) === JSON.stringify(paymentDates)
          ) {
            return prev;
          }
          return {
            ...prev,
            birthDate: updatedInfo.birthDate,
            school: updatedInfo.school,
            disabilityType: updatedInfo.disabilityType,
            treatmentArea: updatedInfo.treatmentArea,
            therapistName: updatedInfo.therapistName,
            paymentDates,
          };
        });
      }
    }
  }, [studentInfos, allPaymentRecords]);

  // ─── 연도/월 변경 시 데이터 재조회 ───
  useEffect(() => {
    if (selectedStudent) {
      fetchData(selectedStudent);
    }
  }, [selectedMonth, selectedYear]);

  // ─── 학생 선택 핸들러 ───
  const handleStudentSelect = useCallback(
    async (name: string) => {
      setSelectedStudent(null);

      const info = studentInfos.find((s) => s.name === name);
      if (!info) {
        showToast({
          type: 'error',
          message: `'${name}' 학생의 기본 정보가 없습니다. [학생 정보 관리] 메뉴에서 먼저 정보를 등록해 주세요.`,
        }, 5000);
        return;
      }

      const paymentDates = allPaymentRecords
        .filter((r) => r.studentName === name)
        .map((r) => r.transactionDate)
        .filter(Boolean)
        .sort();

      const student: Student = {
        id: name,
        name,
        birthDate: info.birthDate,
        school: info.school,
        disabilityType: info.disabilityType,
        treatmentArea: info.treatmentArea,
        schedule: { day: '정보 없음', time: '정보 없음', frequency: '1' },
        startDate: `${selectedYear}.03`,
        therapistName: info.therapistName,
        paymentDates,
      };

      setSelectedStudent(student);
      await fetchData(student);
    },
    [studentInfos, allPaymentRecords, selectedYear, fetchData, showToast]
  );

  // ─── 자동 등록 핸들러 (rawRecords 전달) ───
  const handleAutoRegister = useCallback(
    (name: string) => autoRegister(name, rawRecords),
    [autoRegister, rawRecords]
  );

  // ─── 인쇄 핸들러 ───
  const handlePrint = useCallback(() => {
    const printContent = document.querySelector('.document-container');
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('팝업 차단이 설정되어 있을 수 있습니다. 팝업을 허용해 주세요.');
      return;
    }

    const styles = Array.from(
      document.querySelectorAll('style, link[rel="stylesheet"]')
    )
      .map((style) => style.outerHTML)
      .join('\n');

    printWindow.document.write(`
      <html>
        <head>
          <title>${selectedStudent?.name || '치료서류'}_인쇄</title>
          ${styles}
          <style>
            @media print {
              body { 
                margin: 0 !important; 
                padding: 0 !important; 
                background: white !important;
              }
              .no-print { display: none !important; }
              .document-container {
                width: 210mm !important;
                min-height: 297mm !important;
                padding: 15mm 12mm !important;
                margin: 0 auto !important;
                box-shadow: none !important;
                border: none !important;
                box-sizing: border-box !important;
                page-break-after: always;
              }
            }
            body {
              background-color: #f1f5f9;
              margin: 0;
              padding: 40px;
              display: flex;
              justify-content: center;
              font-family: Pretendard, sans-serif;
            }
            .print-wrapper {
              width: 210mm;
              background-color: white;
              box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
            }
          </style>
        </head>
        <body>
          <div class="print-wrapper">
            ${printContent.innerHTML}
          </div>
          <script>
            window.onload = () => {
              setTimeout(() => { window.print(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  }, [selectedStudent]);

  // ─── 워드 다운로드 핸들러 ───
  const handleDownloadWord = useCallback(async () => {
    if (!selectedStudent) return;

    try {
      if (activeTab === 'annual' && annualData) {
        await downloadAnnualPlanAsWord(selectedStudent, annualData, selectedYear);
      } else if (activeTab === 'monthly' && monthlyData) {
        await downloadMonthlyJournalAsWord(
          selectedStudent,
          monthlyData,
          selectedMonth,
          selectedYear
        );
      }
    } catch (err) {
      console.error('Word download failed:', err);
      showToast({
        type: 'error',
        message: '워드 파일 생성 중 오류가 발생했습니다.',
      }, 3000);
    }
  }, [
    selectedStudent,
    activeTab,
    annualData,
    monthlyData,
    selectedYear,
    selectedMonth,
    showToast,
  ]);

  // ─── HWPX 다운로드 핸들러 ───
  const handleDownloadHWPX = useCallback(async () => {
    if (!selectedStudent) return;

    setIsLoading(true);
    try {
      if (activeTab === 'annual' && annualData) {
        await downloadAnnualPlanAsHWPX(selectedStudent, annualData, selectedYear);
      } else if (activeTab === 'monthly' && monthlyData) {
        await downloadMonthlyJournalAsHWPX(
          selectedStudent,
          monthlyData,
          selectedMonth,
          selectedYear
        );
      }
      showToast({
        type: 'success',
        message: '한글 문서(HWPX)가 성공적으로 생성되었습니다.',
      }, 3000);
    } catch (err) {
      console.error('HWPX download failed:', err);
      showToast({
        type: 'error',
        message: '한글 문서 생성 중 오류가 발생했습니다. 템플릿 파일 존재 여부를 확인해 주세요.',
      }, 5000);
    } finally {
      setIsLoading(false);
    }
  }, [
    selectedStudent,
    activeTab,
    annualData,
    monthlyData,
    selectedYear,
    selectedMonth,
    showToast,
  ]);

  // ─── 가상 일지 생성 핸들러 ───
  const handleGenerateDraft = useCallback(() => {
    if (selectedStudent) {
      generateDraft(selectedStudent);
    }
  }, [selectedStudent, generateDraft]);

  const handleBatchGenerate = useCallback((startMonth: number, endMonth: number) => {
    if (selectedStudent) {
      generateBatchInRange(selectedStudent, startMonth, endMonth);
    }
  }, [selectedStudent, generateBatchInRange]);

  // ─── 렌더링 ───
  const isAnyLoading = isLoading || isDocLoading;

  return (
    <div className="min-h-screen flex flex-col bg-bg-theme selection:bg-primary/20">
      {/* 글로벌 배경 효과 */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[100px] -translate-x-1/2 translate-y-1/2" />
      </div>

      <AppHeader
        currentView={currentView}
        setCurrentView={setCurrentView}
        isDataLoaded={isDataLoaded || allPaymentRecords.length > 0}
        onNewUpload={resetUpload}
      />

      <AnimatePresence mode="wait">
        {currentView === 'students' ? (
          <motion.main
            key="students"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex-1 p-6 md:p-10 max-w-5xl mx-auto w-full"
          >
            <StudentManagement
              studentInfos={studentInfos}
              onAdd={addStudent}
              onUpdate={updateStudent}
              onDelete={deleteStudent}
            />
          </motion.main>
        ) : !isDataLoaded && allPaymentRecords.length === 0 ? (
          <motion.main
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center p-6 md:p-10"
          >
            <HeroSection />
            <FileUploadCard
              fileInputRef={fileInputRef}
              onFileUpload={handleFileUpload}
              onFileDrop={processFile}
            />
            <FeatureGrid />
          </motion.main>
        ) : (
          <motion.main
            key="docs"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex min-h-0"
          >
            <StudentSidebar
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              filteredStudents={filteredStudents}
              selectedStudent={selectedStudent}
              studentInfos={studentInfos}
              onStudentSelect={handleStudentSelect}
              onAutoRegister={handleAutoRegister}
              onResetAllData={resetAllData}
            />

            <div className="flex-1 flex flex-col p-6 md:p-10 gap-8 overflow-auto">
              <AnimatePresence mode="wait">
                {selectedStudent ? (
                  <motion.div
                    key={selectedStudent.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="flex flex-col gap-8 pb-20"
                  >
                    <DocumentToolbar
                      selectedStudent={selectedStudent}
                      activeTab={activeTab}
                      setActiveTab={setActiveTab}
                      selectedYear={selectedYear}
                      setSelectedYear={setSelectedYear}
                      selectedMonth={selectedMonth}
                      setSelectedMonth={setSelectedMonth}
                      monthlyData={monthlyData}
                      onDownloadWord={handleDownloadWord}
                      onDownloadHWPX={handleDownloadHWPX}
                      onPrint={handlePrint}
                      onGenerateDraft={handleGenerateDraft}
                      onOpenBatchModal={() => setIsBatchModalOpen(true)}
                    />

                    <DocumentPreview
                      selectedStudent={selectedStudent}
                      activeTab={activeTab}
                      annualData={annualData}
                      monthlyData={monthlyData}
                      isLoading={isAnyLoading}
                      selectedYear={selectedYear}
                      selectedMonth={selectedMonth}
                      onSaveAnnual={(data) => selectedStudent && saveAnnualData(selectedStudent, data)}
                      onSaveMonthly={(data) => selectedStudent && saveMonthlyData(selectedStudent, data)}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="no-selection"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex-1 flex flex-col items-center justify-center text-center py-20"
                  >
                    <div className="w-20 h-20 bg-primary/5 rounded-[2rem] flex items-center justify-center mb-6">
                      <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                    </div>
                    <h3 className="text-xl font-black text-text-main mb-2">분석 완료</h3>
                    <p className="text-text-muted font-medium">왼쪽 목록에서 학생을 선택하여 서류를 생성해 보세요.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.main>
        )}
      </AnimatePresence>

      <BatchGenerationModal 
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
        onGenerate={handleBatchGenerate}
        currentYear={selectedYear}
      />

      <AppFooter />
    </div>
  );
}
