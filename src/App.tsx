/**
 * App.tsx — 오케스트레이터 컴포넌트
 * 
 * 비즈니스 로직은 커스텀 훅(useStudents, usePayments, useFileUpload, useDocumentGenerator)으로,
 * UI 렌더링은 분리된 컴포넌트(AppHeader, StudentSidebar, DocumentToolbar 등)로 위임합니다.
 * 이 파일은 이들을 조합하는 역할만 수행합니다.
 */
import React, { useState, useEffect, useMemo, useCallback, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, Users, FileText, Sparkles, Settings, LayoutDashboard } from 'lucide-react';
import { Student, StudentInfo } from './types';
import { validatePaymentDates } from './services/scheduleValidationService';
import { filterDatesByYearMonth } from './services/dateUtils';
import { TemplateSettings, loadTemplateSettings } from './services/templateService';

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

// 문서 화면 컴포넌트 (무거운 컴포넌트는 동적 임포트)
import { StudentSidebar } from './components/docs/StudentSidebar';
import { DocumentToolbar } from './components/docs/DocumentToolbar';
import { ScheduleValidationPanel } from './components/docs/ScheduleValidationPanel';

// 동적 임포트로 코드 스플리팅
const DocumentPreview = lazy(() => import('./components/docs/DocumentPreview').then(m => ({ default: m.DocumentPreview })));
const BatchGenerationModal = lazy(() => import('./components/docs/BatchGenerationModal').then(m => ({ default: m.BatchGenerationModal })));
const StudentManagement = lazy(() => import('./components/StudentManagement').then(m => ({ default: m.StudentManagement })));
const TemplateSettingsModal = lazy(() => import('./components/docs/TemplateSettingsModal').then(m => ({ default: m.TemplateSettingsModal })));
const Dashboard = lazy(() => import('./components/dashboard/Dashboard').then(m => ({ default: m.Dashboard })));

// 내보내기 서비스 동적 임포트
const wordExportService = () => import('./services/wordExportService');
const hwpxExportService = () => import('./services/hwpxExportService');
const pdfExportService = () => import('./services/pdfExportService');

export default function App() {
  // ─── 공유 상태 ───
  const [isLoading, setIsLoading] = useState(false);
  const [currentView, setCurrentView] = useState<'dashboard' | 'docs' | 'students'>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [activeTab, setActiveTab] = useState<'annual' | 'monthly'>('annual');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [templateSettings, setTemplateSettings] = useState<TemplateSettings>(loadTemplateSettings());

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
    regenerateAnnualData,
    regenerateMonthlyData,
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

  // ─── 학생별 전체 결제 날짜 Map (사이드바 뱃지용) ───
  const paymentDatesByStudent = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const record of allPaymentRecords) {
      const name = record.studentName;
      if (!name) continue;
      const existing = map.get(name) || [];
      if (record.transactionDate) existing.push(record.transactionDate);
      map.set(name, existing);
    }
    return map;
  }, [allPaymentRecords]);

  // ─── 현재 선택 학생·월의 검증 결과 (ScheduleValidationPanel용) ───
  const validationResults = useMemo(() => {
    if (!selectedStudent) return [];
    const info = studentInfos.find((s) => s.name === selectedStudent.name);
    const scheduleDay = info?.schedule?.day || '';
    if (!scheduleDay) return [];
    const monthlyDates = filterDatesByYearMonth(
      selectedStudent.paymentDates,
      selectedYear,
      selectedMonth
    );
    return validatePaymentDates(monthlyDates, scheduleDay);
  }, [selectedStudent, studentInfos, selectedYear, selectedMonth]);

  const selectedStudentScheduleDay = useMemo(() => {
    if (!selectedStudent) return '';
    const info = studentInfos.find((s) => s.name === selectedStudent.name);
    return info?.schedule?.day || '';
  }, [selectedStudent, studentInfos]);

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
  }, [selectedMonth, selectedYear, fetchData]);

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
        schedule: info.schedule
          ? { day: info.schedule.day, time: info.schedule.time, frequency: info.schedule.frequency }
          : { day: '', time: '', frequency: '1' },
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
              @page { margin: 0; }
              body { 
                margin: 0 !important; 
                padding: 15mm 12mm !important; 
                background: white !important;
                -webkit-print-color-adjust: exact;
              }
              .no-print { display: none !important; }
              .document-container {
                width: 100% !important;
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
      const { downloadAnnualPlanAsWord, downloadMonthlyJournalAsWord } = await wordExportService();
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
      const { downloadAnnualPlanAsHWPX, downloadMonthlyJournalAsHWPX } = await hwpxExportService();
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

  // ─── PDF 다운로드 핸들러 ───
  const handleDownloadPdf = useCallback(async () => {
    if (!selectedStudent) return;
    setIsLoading(true);
    try {
      const { downloadAsPdf } = await pdfExportService();
      const tab = activeTab === 'annual' ? '연간계획서' : `${selectedMonth}월일지`;
      const fileName = `${selectedStudent.name}_${selectedYear}_${tab}`;
      await downloadAsPdf(fileName);
      showToast({ type: 'success', message: 'PDF 파일이 저장되었습니다.' }, 3000);
    } catch (err) {
      console.error('PDF download failed:', err);
      showToast({ type: 'error', message: 'PDF 생성 중 오류가 발생했습니다.' }, 3000);
    } finally {
      setIsLoading(false);
    }
  }, [selectedStudent, activeTab, selectedYear, selectedMonth, showToast]);

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

      <div className="flex items-center">
        <AppHeader
          currentView={currentView}
          setCurrentView={setCurrentView}
          isDataLoaded={isDataLoaded || allPaymentRecords.length > 0}
          onNewUpload={resetUpload}
        />
        <button
          onClick={() => setIsTemplateModalOpen(true)}
          className="mr-4 p-2 hover:bg-white/50 rounded-xl transition-colors"
          title="템플릿 설정"
        >
          <Settings className="w-5 h-5 text-text-muted" />
        </button>
      </div>

      <AnimatePresence mode="wait">
        {currentView === 'dashboard' ? (
          <motion.main
            key="dashboard"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex-1"
          >
            <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
              <Dashboard
                studentInfos={studentInfos}
                paymentRecords={allPaymentRecords}
                onNavigateToStudents={() => setCurrentView('students')}
                onNavigateToDocs={() => setCurrentView('docs')}
              />
            </Suspense>
          </motion.main>
        ) : currentView === 'students' ? (
          <motion.main
            key="students"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex-1 p-6 md:p-10 max-w-5xl mx-auto w-full"
          >
            <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
              <StudentManagement
                studentInfos={studentInfos}
                onAdd={addStudent}
                onUpdate={updateStudent}
                onDelete={deleteStudent}
              />
            </Suspense>
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
              paymentDatesByStudent={paymentDatesByStudent}
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
                      onDownloadPdf={handleDownloadPdf}
                      onPrint={handlePrint}
                      onGenerateDraft={handleGenerateDraft}
                      onOpenBatchModal={() => setIsBatchModalOpen(true)}
                    />

                    {/* 결제 날짜 ↔ 수업 요일 검증 패널 */}
                    <ScheduleValidationPanel
                      results={validationResults}
                      scheduleDay={selectedStudentScheduleDay}
                      selectedYear={selectedYear}
                      selectedMonth={selectedMonth}
                    />

                    <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
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
                        onRegenerateAnnual={() => selectedStudent && regenerateAnnualData(selectedStudent)}
                        onRegenerateMonthly={() => selectedStudent && regenerateMonthlyData(selectedStudent)}
                      />
                    </Suspense>
                  </motion.div>
                ) : (
                  <motion.div
                    key="no-selection"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex-1 flex flex-col items-center justify-center py-10 max-w-2xl mx-auto w-full"
                  >
                    <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 md:p-12 w-full">
                      <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary mb-4">
                          <Sparkles className="w-8 h-8" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-800 mb-2">서류 생성을 시작해 볼까요?</h3>
                        <p className="text-slate-500 font-medium">아래 3단계를 따라 AI가 자동으로 서류를 완성하도록 안내합니다.</p>
                      </div>

                      <div className="space-y-6">
                        {/* Step 1 */}
                        <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 transition-colors hover:bg-slate-100/50">
                          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg">
                            1
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-800 mb-1 flex items-center gap-2">
                              <Upload className="w-4 h-4 text-slate-400" />
                              데이터 업로드
                            </h4>
                            <p className="text-sm text-slate-500">우측 상단의 <b>새 파일 업로드</b> 버튼을 눌러 결제 내역(CSV/Excel)을 등록해 주세요.</p>
                          </div>
                        </div>

                        {/* Step 2 */}
                        <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 transition-colors hover:bg-slate-100/50">
                          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg">
                            2
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-800 mb-1 flex items-center gap-2">
                              <Users className="w-4 h-4 text-slate-400" />
                              학생 선택
                            </h4>
                            <p className="text-sm text-slate-500">좌측 학생 목록에서 <b>문서를 작성할 학생</b>을 클릭해 주세요. 필요시 [학생 정보 관리] 탭에서 부족한 정보를 채워주세요.</p>
                          </div>
                        </div>

                        {/* Step 3 */}
                        <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 transition-colors hover:bg-slate-100/50">
                          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg">
                            3
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-800 mb-1 flex items-center gap-2">
                              <FileText className="w-4 h-4 text-slate-400" />
                              AI 자동 생성 및 확인
                            </h4>
                            <p className="text-sm text-slate-500">학생을 선택하는 즉시 <b>AI가 연간계획서와 월별일지를 자동 작성</b>합니다. 검토 후 다운로드 하세요!</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.main>
        )}
      </AnimatePresence>

      <Suspense fallback={null}>
        <BatchGenerationModal 
          isOpen={isBatchModalOpen}
          onClose={() => setIsBatchModalOpen(false)}
          onGenerate={handleBatchGenerate}
          currentYear={selectedYear}
        />
      </Suspense>

      <Suspense fallback={null}>
        <TemplateSettingsModal
          isOpen={isTemplateModalOpen}
          onClose={() => setIsTemplateModalOpen(false)}
          onSave={(settings) => setTemplateSettings(settings)}
        />
      </Suspense>

      <AppFooter />
    </div>
  );
}
