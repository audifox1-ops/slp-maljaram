/**
 * AppFooter 컴포넌트
 * 하단 푸터 영역
 */
import React from 'react';
import { FileText } from 'lucide-react';

export const AppFooter: React.FC = () => {
  return (
    <footer className="py-8 text-center text-text-muted text-xs no-print border-t border-border-theme bg-white">
      <div className="flex items-center justify-center gap-2 mb-2 font-bold text-slate-400">
        <FileText className="w-4 h-4" />
        <span>SLP.Docs Professional</span>
      </div>
      <p>© 2026 치료 서류 자동 생성 시스템. All rights reserved.</p>
    </footer>
  );
};
