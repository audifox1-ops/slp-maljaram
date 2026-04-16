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
    <aside className="w-80 border-r border-border-theme bg-white/40 backdrop-blur-xl flex flex-col no-print">
      <div className="p-6 border-b border-border-theme/50 bg-white/20">
        <div className="relative group">
          <input
            type="text"
            placeholder="학생 이름 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-border-theme rounded-2xl focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all text-sm font-bold shadow-sm group-hover:border-primary/30"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted/60 group-focus-within:text-primary w-4 h-4 transition-colors" />
        </div>
        <div className="mt-5 flex items-center justify-between text-[11px] font-black text-text-muted/60 uppercase tracking-[0.1em] px-1">
          <span>Student Directory</span>
          <span className="bg-primary/5 text-primary px-3 py-1 rounded-full border border-primary/10">
            {filteredStudents.length} Profiles
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-3 space-y-1.5 custom-scrollbar">
        <AnimatePresence mode="popLayout">
          {filteredStudents.length > 0 ? (
            filteredStudents.map((name, index) => (
              <motion.div
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
                onClick={() => onStudentSelect(name)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    onStudentSelect(name);
                  }
                }}
                className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-[1.25rem] transition-all text-left group cursor-pointer border ${
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
                  <span className="text-[10px] text-text-muted font-medium">언어재활 세션</span>
                </div>

                <div className="ml-auto flex items-center gap-2">
                  {!studentInfos.some((s) => s.name === name) && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onAutoRegister(name);
                      }}
                      className="px-2.5 py-1 bg-accent/10 text-accent text-[9px] font-black rounded-lg hover:bg-accent hover:text-white transition-all uppercase tracking-wider"
                    >
                      New
                    </motion.button>
                  )}
                  {selectedStudent?.name === name && (
                    <motion.div
                      layoutId="active-indicator"
                      className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_10px_rgba(79,70,229,0.5)]"
                    />
                  )}
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-16 text-center"
            >
              <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                <Search className="w-5 h-5 text-slate-300" />
              </div>
              <p className="text-xs font-bold text-slate-400">학생을 찾을 수 없습니다</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="p-5 border-t border-border-theme/50 bg-white/20">
        <button
          onClick={onResetAllData}
          className="w-full flex items-center justify-center gap-2 py-3 text-[11px] font-black text-slate-400 hover:text-red-500 hover:bg-red-50/50 rounded-xl transition-all border border-transparent hover:border-red-100/50"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Clear All Data
        </button>
      </div>
    </aside>
  );
};
