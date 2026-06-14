/**
 * StudentSidebar 컴포넌트
 * 좌측 학생 목록 사이드바: 검색, 리스트, 자동 등록 버튼, 초기화 버튼
 */
import React from 'react';
import { Search, Trash2, AlertTriangle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Student, StudentInfo } from '../../types';
import { countInvalidDates } from '../../services/scheduleValidationService';

interface StudentSidebarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filteredStudents: string[];
  selectedStudent: Student | null;
  studentInfos: StudentInfo[];
  onStudentSelect: (name: string) => void;
  onAutoRegister: (name: string) => void;
  onResetAllData: () => void;
  paymentDatesByStudent: Map<string, string[]>;
  isOpen?: boolean;
  onClose?: () => void;
}

export const StudentSidebar: React.FC<StudentSidebarProps> = ({
  searchTerm,
  setSearchTerm,
  filteredStudents,
  selectedStudent,
  studentInfos,
  onStudentSelect,
  onAutoRegister,
  onResetAllData,
  paymentDatesByStudent,
  isOpen,
  onClose,
}) => {
  return (
    <>
      {/* 모바일 오버레이 */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 md:hidden"
          onClick={onClose}
        />
      )}
      <aside className={`w-80 border-r border-border-theme bg-white/40 backdrop-blur-xl flex flex-col no-print fixed md:relative inset-y-0 left-0 z-50 md:z-auto transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`} aria-label="학생 목록">
        <div className="p-6 border-b border-border-theme/50 bg-white/20 flex items-center justify-between">
          <div className="relative group flex-1">
            <label htmlFor="student-search" className="sr-only">학생 이름 검색</label>
            <input
              id="student-search"
              type="text"
              placeholder="학생 이름 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-describedby="student-count"
              className="w-full pl-11 pr-4 py-3 bg-white border border-border-theme rounded-2xl focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all text-sm font-bold shadow-sm group-hover:border-primary/30"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted/60 group-focus-within:text-primary w-4 h-4 transition-colors" aria-hidden="true" />
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="ml-2 p-2 hover:bg-slate-100 rounded-xl transition-colors md:hidden"
              aria-label="사이드바 닫기"
            >
              <X className="w-5 h-5 text-text-muted" />
            </button>
          )}
        </div>
        <div id="student-count" className="mt-5 flex items-center justify-between text-[11px] font-black text-text-muted/60 uppercase tracking-[0.1em] px-1">
          <span>학생 목록</span>
          <span className="bg-primary/5 text-primary px-3 py-1 rounded-full border border-primary/10" aria-live="polite">
            {filteredStudents.length}명
          </span>
        </div>

      <nav className="flex-1 overflow-auto p-3 space-y-1.5 custom-scrollbar" aria-label="학생 목록">
        <ul role="listbox" aria-label="학생 선택">
          <AnimatePresence mode="popLayout">
            {filteredStudents.length > 0 ? (
              filteredStudents.map((name, index) => (
                <motion.li
                  key={name}
                  layout
                  initial={{ opacity: 0, x: -10, y: 10 }}
                  animate={{ opacity: 1, x: 0, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ 
                    duration: 0.4, 
                    delay: index * 0.05,
                    ease: [0.16, 1, 0.3, 1]
                  }}
                  role="option"
                  aria-selected={selectedStudent?.name === name}
                  onClick={() => onStudentSelect(name)}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onStudentSelect(name);
                    }
                  }}
                  className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-[1.25rem] transition-all text-left group cursor-pointer border list-none ${
                    selectedStudent?.name === name
                    ? 'bg-white text-primary shadow-xl shadow-primary/5 border-primary/20 scale-[1.02] z-10'
                    : 'hover:bg-white/60 text-text-main border-transparent hover:border-white/40'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs transition-all duration-300 ${
                    selectedStudent?.name === name
                      ? 'bg-primary text-white shadow-lg shadow-primary/30 rotate-3'
                      : 'bg-slate-100 text-slate-400 group-hover:bg-white group-hover:text-primary group-hover:rotate-6'
                  }`}
                >
                  {name.charAt(0)}
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-sm tracking-tight">{name}</span>
                  <span className="text-[10px] text-text-muted font-medium">
                    {studentInfos.find((s) => s.name === name)?.treatmentArea || '언어재활 세션'}
                  </span>
                </div>

                <div className="ml-auto flex items-center gap-2">
                  {/* 요일 불일치 경고 뱃지 */}
                  {(() => {
                    const info = studentInfos.find((s) => s.name === name);
                    const dates = paymentDatesByStudent.get(name) || [];
                    const scheduleDay = info?.schedule?.day || '';
                    const invalidCount = info ? countInvalidDates(dates, scheduleDay) : 0;
                    return invalidCount > 0 ? (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-[9px] font-black rounded-full border border-amber-200"
                        title={`결제 날짜 불일치 ${invalidCount}건`}
                      >
                        <AlertTriangle className="w-2.5 h-2.5" />
                        {invalidCount}
                      </motion.div>
                    ) : null;
                  })()}

                  {!studentInfos.some((s) => s.name === name) && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onAutoRegister(name);
                      }}
                      className="px-2.5 py-1 bg-accent/10 text-accent text-[9px] font-black rounded-lg hover:bg-accent hover:text-white transition-all"
                    >
                      신규
                    </motion.button>
                  )}
                  {selectedStudent?.name === name && (
                    <motion.div
                      layoutId="active-indicator"
                      className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_10px_rgba(79,70,229,0.5)]"
                    />
                  )}
                </div>
              </motion.li>
            ))
          ) : (
            <motion.li 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-16 text-center list-none"
            >
              <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                <Search className="w-5 h-5 text-slate-300" aria-hidden="true" />
              </div>
              <p className="text-xs font-bold text-slate-400">
                {searchTerm ? '검색 결과가 없습니다' : '등록된 학생이 없습니다'}
              </p>
              <p className="text-[10px] text-slate-300 mt-1">
                {searchTerm ? '다른 검색어를 시도해 보세요' : '상단의 "새 파일 업로드" 버튼으로 데이터를 등록해 주세요'}
              </p>
            </motion.li>
          )}
        </AnimatePresence>
        </ul>
      </nav>

      <div className="p-5 border-t border-border-theme/50 bg-white/20">
        <button
          onClick={onResetAllData}
          aria-label="모든 데이터 삭제"
          className="w-full flex items-center justify-center gap-2 py-3 text-[11px] font-black text-slate-400 hover:text-red-500 hover:bg-red-50/50 rounded-xl transition-all border border-transparent hover:border-red-100/50"
        >
          <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
          모든 데이터 삭제
        </button>
      </div>
    </aside>
    </>
  );
};
