/**
 * FeatureGrid 컴포넌트
 * 3개 기능 소개 카드 그리드
 */
import React from 'react';
import { Zap, Sparkles, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

const features = [
  {
    icon: Zap,
    title: '간편한 엑셀 연동',
    desc: '드래그 앤 드롭으로 결제 내역을 즉시 로드합니다.',
  },
  {
    icon: Sparkles,
    title: 'AI 맞춤형 작성',
    desc: '학생별 치료 영역에 맞춘 목표를 자동 생성합니다.',
  },
  {
    icon: ShieldCheck,
    title: '완벽한 출력 지원',
    desc: 'A4 용지 규격에 최적화된 인쇄 및 PDF 저장을 지원합니다.',
  },
];

export const FeatureGrid: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
      {features.map((feature, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 + i * 0.1 }}
          className="bg-white p-8 rounded-2xl border border-border-theme shadow-sm hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group"
        >
          <div className="bg-primary-light w-12 h-12 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <feature.icon className="w-6 h-6 text-primary" />
          </div>
          <h3 className="text-lg font-bold text-text-main mb-2">
            {feature.title}
          </h3>
          <p className="text-sm text-text-muted leading-relaxed">
            {feature.desc}
          </p>
        </motion.div>
      ))}
    </div>
  );
};
