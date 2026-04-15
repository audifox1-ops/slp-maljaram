/**
 * HeroSection 컴포넌트
 * 랜딩 페이지 상단 히어로 영역
 */
import React from 'react';
import { motion } from 'motion/react';

export const HeroSection: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center mb-12 max-w-3xl"
    >
      <h1 className="text-4xl md:text-5xl font-black text-text-main mb-6 tracking-tight leading-tight">
        복잡한 교육청 서류,
        <br />
        <span className="text-primary">단 10초 만에</span> 완성하세요.
      </h1>
      <p className="text-lg md:text-xl text-text-muted leading-relaxed">
        엑셀 데이터 업로드 한 번으로 연간계획서와 월별일지를
        <br className="hidden md:block" />
        자동 생성하고 즉시 출력합니다.
      </p>
    </motion.div>
  );
};
