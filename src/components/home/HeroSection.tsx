/**
 * HeroSection 컴포넌트
 * 랜딩 페이지 상단 히어로 영역
 */
import React from 'react';
import { motion } from 'motion/react';

export const HeroSection: React.FC = () => {
  return (
    <div className="relative flex flex-col items-center justify-center pt-12 pb-24 px-4 overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-full -z-10">
        <div className="absolute top-[-10%] left-[20%] w-[40%] h-[60%] bg-primary/5 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[10%] right-[20%] w-[30%] h-[50%] bg-accent/5 rounded-full blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="text-center mb-12 max-w-4xl z-10"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="inline-block px-5 py-2 mb-8 text-xs font-black tracking-widest text-primary bg-white shadow-xl shadow-primary/5 rounded-full border border-primary/10 uppercase"
        >
          ✨ AI-Powered SLP Automation
        </motion.div>
        
        <h1 className="text-5xl md:text-7xl font-black text-text-main mb-8 tracking-tight leading-[1.05]">
          언어재활사의 시간을 <br />
          <span className="text-gradient">가장 가치 있게.</span>
        </h1>
        
        <p className="text-lg md:text-xl text-text-muted leading-relaxed max-w-2xl mx-auto font-medium">
          복잡한 서류 작업은 AI에게 맡기고,
          <br className="hidden md:block" />
          선생님은 아이들의 목소리에만 집중하세요.
        </p>
      </motion.div>

      {/* Hero Visual Asset */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.4, duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-5xl aspect-video rounded-[2.5rem] overflow-hidden shadow-2xl shadow-black/10 border border-white/40 mb-20 group"
      >
        <img 
          src="/assets/hero_visual.png" 
          alt="SLP.Docs Dashboard Preview" 
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
        
        {/* Floating Mini Cards (Decorative) */}
        <motion.div 
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-10 -right-4 md:-right-8 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white/50 hidden md:block"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Analysis Status</p>
              <p className="text-sm font-black text-slate-800">100% Completed</p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};
