/**
 * OnboardingModal 컴포넌트
 * 첫 사용자를 위한 단계별 가이드 모달
 */
import React, { useState } from 'react';
import { X, ChevronRight, ChevronLeft, Sparkles, Upload, Users, FileText, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ONBOARDING_STEPS, OnboardingStep } from '../../services/onboardingService';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  onComplete,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const step = ONBOARDING_STEPS[currentStep];
  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
        >
          {/* 헤더 */}
          <div className="relative h-48 bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center text-white"
            >
              {getStepIcon(step.id)}
              <h2 className="text-2xl font-black mt-4">{step.title}</h2>
            </motion.div>
            
            {/* 닫기 버튼 */}
            <button
              onClick={handleSkip}
              className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>

            {/* 진행 표시기 */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {ONBOARDING_STEPS.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentStep
                      ? 'bg-white w-6'
                      : index < currentStep
                      ? 'bg-white/60'
                      : 'bg-white/30'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* 본문 */}
          <div className="p-8">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <p className="text-text-main text-center leading-relaxed">
                {step.description}
              </p>
            </motion.div>

            {/* 단계별 기능 미리보기 */}
            <div className="mt-6 p-4 bg-slate-50 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  {getStepMiniIcon(step.id)}
                </div>
                <div>
                  <p className="text-sm font-bold text-text-main">{step.title}</p>
                  <p className="text-xs text-text-muted">
                    {getStepHint(step.id)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 푸터 */}
          <div className="p-6 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={handleSkip}
              className="text-sm font-medium text-text-muted hover:text-text-main transition-colors"
            >
              건너뛰기
            </button>

            <div className="flex items-center gap-3">
              {currentStep > 0 && (
                <button
                  onClick={handlePrev}
                  className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-text-muted" />
                </button>
              )}
              
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-all shadow-lg shadow-primary/20"
              >
                {isLastStep ? (
                  <>
                    <Check className="w-5 h-5" />
                    시작하기
                  </>
                ) : (
                  <>
                    다음
                    <ChevronRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

function getStepIcon(stepId: string) {
  switch (stepId) {
    case 'welcome':
      return <Sparkles className="w-12 h-12" />;
    case 'upload':
      return <Upload className="w-12 h-12" />;
    case 'students':
      return <Users className="w-12 h-12" />;
    case 'generate':
      return <FileText className="w-12 h-12" />;
    case 'complete':
      return <Check className="w-12 h-12" />;
    default:
      return <Sparkles className="w-12 h-12" />;
  }
}

function getStepMiniIcon(stepId: string) {
  switch (stepId) {
    case 'welcome':
      return <Sparkles className="w-5 h-5 text-primary" />;
    case 'upload':
      return <Upload className="w-5 h-5 text-primary" />;
    case 'students':
      return <Users className="w-5 h-5 text-primary" />;
    case 'generate':
      return <FileText className="w-5 h-5 text-primary" />;
    case 'complete':
      return <Check className="w-5 h-5 text-primary" />;
    default:
      return <Sparkles className="w-5 h-5 text-primary" />;
  }
}

function getStepHint(stepId: string) {
  switch (stepId) {
    case 'welcome':
      return '치료 서류 작성을 시작하세요';
    case 'upload':
      return 'CSV 또는 Excel 파일을 드래그하거나 클릭하세요';
    case 'students':
      return '좌측 목록에서 학생을 선택하세요';
    case 'generate':
      return 'AI가 자동으로 서류를 작성합니다';
    case 'complete':
      return '준비 완료!';
    default:
      return '';
  }
}
