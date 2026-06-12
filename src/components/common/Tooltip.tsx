/**
 * Tooltip 컴포넌트
 * 요소에 마우스를 올렸을 때 도움말 표시
 */
import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TooltipProps {
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  children?: React.ReactNode;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  position = 'top',
  children,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children || (
        <button className="p-1 text-text-muted hover:text-text-main transition-colors">
          <HelpCircle className="w-4 h-4" />
        </button>
      )}
      
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`absolute z-50 ${positionClasses[position]} pointer-events-none`}
          >
            <div className="bg-text-main text-white text-xs font-medium px-3 py-2 rounded-lg shadow-lg whitespace-nowrap max-w-xs">
              {content}
              <div
                className={`absolute w-2 h-2 bg-text-main transform rotate-45 ${
                  position === 'top'
                    ? 'bottom-full left-1/2 -translate-x-1/2 -mb-1'
                    : position === 'bottom'
                    ? 'top-full left-1/2 -translate-x-1/2 -mt-1'
                    : position === 'left'
                    ? 'right-full top-1/2 -translate-y-1/2 -mr-1'
                    : 'left-full top-1/2 -translate-y-1/2 -ml-1'
                }`}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/**
 * 도움말 아이콘과 툴팁을 결합한 컴포넌트
 */
export const HelpTooltip: React.FC<{ content: string }> = ({ content }) => (
  <Tooltip content={content}>
    <button className="p-1 text-text-muted hover:text-text-main transition-colors" type="button">
      <HelpCircle className="w-4 h-4" />
    </button>
  </Tooltip>
);
