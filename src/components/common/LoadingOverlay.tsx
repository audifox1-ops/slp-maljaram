/**
 * LoadingOverlay 컴포넌트
 * AI 서류 작성 중 표시되는 로딩 오버레이입니다.
 */
import React from 'react';
import { Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

export const LoadingOverlay: React.FC = () => {
  return (
    <motion.div
      key="loader"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm z-10"
    >
      <div className="relative">
        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <Sparkles className="w-6 h-6 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
      </div>
      <p className="text-text-main font-bold mt-6 text-lg tracking-tight">
        AI가 전문적인 서류를 작성 중입니다...
      </p>
      <p className="text-text-muted text-sm mt-2">잠시만 기다려 주세요.</p>
    </motion.div>
  );
};
