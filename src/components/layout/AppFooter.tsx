/**
 * AppFooter 컴포넌트
 * 하단 푸터 영역
 */
import React from 'react';
import { FileText } from 'lucide-react';

export const AppFooter: React.FC = () => {
  return (
    <footer className="py-12 mt-auto text-center no-print border-t border-border-theme/40 bg-white/40 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm animate-float">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <FileText className="w-4 h-4 text-primary" />
            </div>
            <span className="font-black text-sm text-slate-500 tracking-tight">SLP.Docs <span className="text-primary italic">Pro</span></span>
          </div>
          
          <div className="space-y-1">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">언어재활 전문가를 위한 지능형 문서 보조 시스템</p>
            <p className="text-[10px] text-slate-300 font-medium tracking-tight">© 2026 치료 서류 자동 생성 시스템. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};
