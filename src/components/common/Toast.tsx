/**
 * Toast 알림 컴포넌트
 * 성공/에러 메시지를 표시하는 플로팅 알림과 인쇄 안내 모달을 포함합니다.
 */
import React from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UploadStatus } from '../../types';

interface ToastProps {
  uploadStatus: UploadStatus | null;
  showPrintWarning: boolean;
  onClosePrintWarning: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  uploadStatus,
  showPrintWarning,
  onClosePrintWarning,
}) => {
  return (
    <AnimatePresence>
      {showPrintWarning && (
        <motion.div
          initial={{ opacity: 0, y: -20, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: -20, x: '-50%' }}
          className="fixed top-20 left-1/2 z-[60] flex flex-col gap-2 px-6 py-4 rounded-2xl shadow-2xl border bg-white text-sm border-primary/20 max-w-md"
        >
          <div className="flex items-center gap-3 text-primary font-bold">
            <AlertCircle className="w-5 h-5" />
            <span>인쇄 안내</span>
          </div>
          <p className="text-text-muted leading-relaxed">
            현재 미리보기 화면(iframe)에서는 브라우저 보안 정책으로 인해 인쇄 창이
            뜨지 않을 수 있습니다.
            <br />
            <br />
            상단 메뉴의 <strong>'새 탭에서 열기'</strong> 버튼을 눌러 새 창에서
            인쇄를 진행해 주세요.
          </p>
          <button
            onClick={onClosePrintWarning}
            className="mt-2 bg-primary text-white py-2 rounded-xl font-bold hover:bg-primary-dark transition-all"
          >
            확인했습니다
          </button>
        </motion.div>
      )}
      {uploadStatus && (
        <motion.div
          initial={{ opacity: 0, y: -20, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: -20, x: '-50%' }}
          className={`fixed top-20 left-1/2 z-50 flex items-center gap-3 px-6 py-3 rounded-2xl shadow-xl border text-sm font-semibold backdrop-blur-md ${
            uploadStatus.type === 'success'
              ? 'bg-green-50/90 text-green-700 border-green-100'
              : 'bg-red-50/90 text-red-700 border-red-100'
          }`}
        >
          {uploadStatus.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          {uploadStatus.message}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
