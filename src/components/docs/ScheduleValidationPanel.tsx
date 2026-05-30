/**
 * ScheduleValidationPanel.tsx
 *
 * 결제 날짜 ↔ 수업 요일 일치 여부를 표시하는 접이식 패널 컴포넌트입니다.
 * DocumentToolbar 아래에 위치하며, 불일치가 있을 때만 경고 헤더를 표시합니다.
 */
import React, { useState, useMemo } from 'react';
import { AlertTriangle, CheckCircle2, ChevronDown, ChevronUp, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ValidationResult } from '../../services/scheduleValidationService';

interface ScheduleValidationPanelProps {
  /** 검증 결과 배열 (validatePaymentDates 반환값) */
  results: ValidationResult[];
  /** 학생의 등록 요일 문자열 (예: "화, 목") */
  scheduleDay: string;
  /** 현재 선택된 연도/월 표시용 */
  selectedYear: number;
  selectedMonth: number;
}

export const ScheduleValidationPanel: React.FC<ScheduleValidationPanelProps> = ({
  results,
  scheduleDay,
  selectedYear,
  selectedMonth,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const invalidResults = useMemo(() => results.filter((r) => !r.isValid), [results]);
  const validResults = useMemo(() => results.filter((r) => r.isValid), [results]);
  const hasErrors = invalidResults.length > 0;
  const noSchedule = !scheduleDay;

  // 등록된 요일이 없으면 패널 비표시
  if (noSchedule || results.length === 0) {
    return null;
  }

  return (
    <div className="no-print rounded-2xl border overflow-hidden transition-all duration-300"
      style={{
        borderColor: hasErrors ? '#fca5a5' : '#bbf7d0',
        backgroundColor: hasErrors ? '#fff7f7' : '#f0fdf4',
      }}
    >
      {/* 헤더 (항상 표시) */}
      <button
        onClick={() => setIsExpanded((prev) => !prev)}
        className="w-full flex items-center justify-between px-5 py-3.5 text-left transition-colors hover:brightness-95"
      >
        <div className="flex items-center gap-3">
          {hasErrors ? (
            <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
          ) : (
            <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
          )}
          <span className={`text-sm font-bold ${hasErrors ? 'text-red-700' : 'text-emerald-700'}`}>
            {selectedYear}년 {selectedMonth}월 결제 일정 검증
          </span>
          <span className={`text-xs font-black px-2.5 py-0.5 rounded-full ${
            hasErrors
              ? 'bg-red-100 text-red-600'
              : 'bg-emerald-100 text-emerald-600'
          }`}>
            {hasErrors
              ? `⚠ 불일치 ${invalidResults.length}건`
              : `✓ 모두 일치 (${validResults.length}건)`}
          </span>
          {!hasErrors && (
            <span className="text-xs text-emerald-600 font-medium">
              등록 요일: {scheduleDay}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {hasErrors && (
            <span className="text-xs text-slate-400 font-medium">
              {isExpanded ? '접기' : '상세 보기'}
            </span>
          )}
          {hasErrors && (
            isExpanded
              ? <ChevronUp className="w-4 h-4 text-slate-400" />
              : <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </div>
      </button>

      {/* 상세 테이블 (불일치 있을 때만 펼침) */}
      <AnimatePresence>
        {hasErrors && isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5">
              <div className="text-xs text-slate-500 font-medium mb-3">
                등록된 치료 요일: <span className="font-bold text-slate-700">{scheduleDay}</span>
                {' '}· 총 {results.length}건 중 <span className="text-red-600 font-bold">{invalidResults.length}건 불일치</span>
              </div>
              <div className="rounded-xl overflow-hidden border border-red-100">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-red-50 text-slate-600">
                      <th className="text-left px-4 py-2.5 font-bold">결제 날짜</th>
                      <th className="text-center px-4 py-2.5 font-bold">결제 요일</th>
                      <th className="text-center px-4 py-2.5 font-bold">등록 요일</th>
                      <th className="text-center px-4 py-2.5 font-bold">상태</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((r, idx) => (
                      <tr
                        key={`${r.date}-${idx}`}
                        className={`border-t border-red-50 transition-colors ${
                          r.isValid ? 'bg-white' : 'bg-red-50/60'
                        }`}
                      >
                        <td className="px-4 py-2.5 font-mono font-semibold text-slate-700">
                          {r.date}
                        </td>
                        <td className="px-4 py-2.5 text-center">
                          <span className={`font-bold px-2 py-0.5 rounded-md ${
                            r.isValid
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {r.dayOfWeek ? `${r.dayOfWeek}요일` : '파싱불가'}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-center text-slate-500 font-medium">
                          {r.expectedDays.join(', ')}요일
                        </td>
                        <td className="px-4 py-2.5 text-center">
                          {r.isValid ? (
                            <span className="flex items-center justify-center gap-1 text-emerald-600">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span className="font-bold">일치</span>
                            </span>
                          ) : (
                            <span className="flex items-center justify-center gap-1 text-red-600">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              <span className="font-bold">불일치</span>
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-[11px] text-slate-400 mt-3 leading-relaxed">
                💡 불일치 내역은 결제 취소 처리, 보강 수업, 또는 데이터 오류일 수 있습니다. 내역을 확인해 주세요.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
