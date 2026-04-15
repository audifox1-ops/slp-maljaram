/**
 * StudentSidebar 컴포넌트
 * 좌측 학생 목록 사이드바: 검색, 리스트, 자동 등록 버튼, 초기화 버튼
 */
import React from 'react';
import { Search, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Student, StudentInfo, RawRecord } from '../../types';

interface StudentSidebarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filteredStudents: string[];
  selectedStudent: Student | null;
  studentInfos: StudentInfo[];
  onStudentSelect: (name: string) => void;
  onAutoRegister: (name: string) => void;
  onResetAllData: () => void;
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
}) => {
  return (
    <aside className="w-80 border-r border-border-theme bg-white flex flex-col no-print">
      <div className="p-4 border-b border-border-theme bg-bg-theme/30">
        <div className="relative">
          <input
            type="text"
            placeholder="학생 이름 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-border-theme rounded-xl focus:border-primary outline-none transition-all text-sm font-medium shadow-sm"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted w-4 h-4" />
        </div>
        <div className="mt-3 flex items-center justify-between text-[10px] font-bold text-text-muted uppercase tracking-wider px-1">
          <span>학생 목록</span>
          <span className="bg-primary-light text-primary px-2 py-0.5 rounded-full">
            {filteredStudents.length}명
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-2 space-y-1">
        <AnimatePresence initial={false}>
          {filteredStudents.length > 0 ? (
            filteredStudents.map((name) => (
              <motion.div
                key={name}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => onStudentSelect(name)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    onStudentSelect(name);
                  }
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left group cursor-pointer ${
                  selectedStudent?.name === name
                    ? 'bg-primary-light text-primary shadow-sm border border-primary/10'
                    : 'hover:bg-bg-theme text-text-main border border-transparent'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs transition-colors ${
                    selectedStudent?.name === name
                      ? 'bg-primary text-white'
                      : 'bg-slate-100 text-slate-400 group-hover:bg-white'
                  }`}
                >
                  {name.charAt(0)}
                </div>
                <span className="font-semibold text-sm">{name}</span>

                <div className="ml-auto flex items-center gap-2">
                  {!studentInfos.some((s) => s.name === name) && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAutoRegister(name);
                      }}
                      className="px-2 py-1 bg-primary/10 text-primary text-[10px] font-bold rounded-md hover:bg-primary hover:text-white transition-all"
                    >
                      정보 등록
                    </button>
                  )}
                  {selectedStudent?.name === name && (
                    <motion.div
                      layoutId="active-indicator"
                      className="w-1.5 h-1.5 rounded-full bg-primary"
                    />
                  )}
                </div>
              </motion.div>
            ))
          ) : (
            <div className="py-12 text-center text-text-muted">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-20" />
              <p className="text-xs">검색 결과가 없습니다.</p>
            </div>
          )}
        </AnimatePresence>
      </div>

      <div className="p-4 border-t border-border-theme bg-bg-theme/10">
        <button
          onClick={onResetAllData}
          className="w-full flex items-center justify-center gap-2 py-2 text-[11px] font-bold text-red-500 hover:bg-red-50 rounded-lg transition-all border border-transparent hover:border-red-100"
        >
          <Trash2 className="w-3.5 h-3.5" />
          저장된 전체 내역 초기화
        </button>
      </div>
    </aside>
  );
};
