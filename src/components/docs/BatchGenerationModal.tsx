import React, { useState } from 'react';
import { Calendar, Play, X, AlertCircle } from 'lucide-react';

interface BatchGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (startMonth: number, endMonth: number) => void;
  currentYear: number;
}

export const BatchGenerationModal: React.FC<BatchGenerationModalProps> = ({
  isOpen,
  onClose,
  onGenerate,
  currentYear,
}) => {
  const [startMonth, setStartMonth] = useState(3); // 학기 시작(3월) 기본값
  const [endMonth, setEndMonth] = useState(12);

  if (!isOpen) return null;

  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  const handleGenerate = () => {
    onGenerate(startMonth, endMonth);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-slate-50 px-6 py-4 flex justify-between items-center border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-2 rounded-lg text-primary">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">기간별 일지 일괄 생성</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          <p className="text-sm text-slate-500 leading-relaxed">
            선택하신 기간 동안 결제 내역을 분석하여 자동으로 일지 초안을 생성합니다. 
            이미 생성된 데이터가 있는 달은 건너뜁니다.
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">시작 월</label>
              <select
                value={startMonth}
                onChange={(e) => setStartMonth(Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
              >
                {months.map(m => (
                  <option key={`start-${m}`} value={m}>{m}월</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">종료 월</label>
              <select
                value={endMonth}
                onChange={(e) => setEndMonth(Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
              >
                {months.map(m => (
                  <option key={`end-${m}`} value={m}>{m}월</option>
                ))}
              </select>
            </div>
          </div>

          {startMonth > endMonth && (
            <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-xl text-amber-700 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <p>시작 월이 종료 월보다 늦습니다. 이 경우 12월까지 생성 후 다음 해 1월로 이어집니다. (일부 연관 데이터에 유의하세요)</p>
            </div>
          )}

          <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex items-center justify-between">
            <div className="text-sm">
              <span className="text-slate-500">대상 연도: </span>
              <span className="font-bold text-blue-700">{currentYear}년</span>
            </div>
            <div className="text-sm">
              <span className="text-slate-500">생성 범위: </span>
              <span className="font-bold text-blue-700">{startMonth}월 ~ {endMonth}월</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-white transition-all font-bold"
          >
            취소
          </button>
          <button
            onClick={handleGenerate}
            className="flex-1 px-4 py-2.5 bg-primary text-white rounded-xl hover:bg-primary-dark shadow-lg shadow-primary/20 transition-all font-bold flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4 fill-current" />
            생성 시작
          </button>
        </div>
      </div>
    </div>
  );
};
