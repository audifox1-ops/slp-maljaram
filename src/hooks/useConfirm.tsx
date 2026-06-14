import React, { useState, useCallback, useRef, useEffect } from 'react';
import { AlertTriangle, Info, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

interface ConfirmState extends ConfirmOptions {
  isOpen: boolean;
  resolve: ((value: boolean) => void) | null;
}

const variantConfig = {
  danger: {
    icon: Trash2,
    iconBg: 'bg-red-100',
    iconColor: 'text-red-500',
    confirmBg: 'bg-red-500 hover:bg-red-600',
  },
  warning: {
    icon: AlertTriangle,
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-500',
    confirmBg: 'bg-amber-500 hover:bg-amber-600',
  },
  info: {
    icon: Info,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-500',
    confirmBg: 'bg-primary hover:bg-primary-dark',
  },
};

export function useConfirm() {
  const [state, setState] = useState<ConfirmState>({
    isOpen: false,
    message: '',
    resolve: null,
  });

  const resolveRef = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      resolveRef.current = resolve;
      setState({
        isOpen: true,
        ...options,
        resolve,
      });
    });
  }, []);

  const handleConfirm = useCallback(() => {
    resolveRef.current?.(true);
    setState((prev) => ({ ...prev, isOpen: false, resolve: null }));
    resolveRef.current = null;
  }, []);

  const handleCancel = useCallback(() => {
    resolveRef.current?.(false);
    setState((prev) => ({ ...prev, isOpen: false, resolve: null }));
    resolveRef.current = null;
  }, []);

  const ConfirmDialog = useCallback(() => {
    if (!state.isOpen) return null;

    const variant = state.variant || 'warning';
    const config = variantConfig[variant];
    const Icon = config.icon;

    return (
      <AnimatePresence>
        {state.isOpen && (
          <div className="fixed inset-0 z-[250] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCancel}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-8 text-center">
                <div className={`w-16 h-16 ${config.iconBg} rounded-2xl flex items-center justify-center mx-auto mb-6`}>
                  <Icon className={`w-8 h-8 ${config.iconColor}`} />
                </div>
                {state.title && (
                  <h3 className="text-xl font-bold text-text-main mb-3">{state.title}</h3>
                )}
                <p className="text-text-muted text-sm leading-relaxed">{state.message}</p>
              </div>
              <div className="p-6 border-t border-slate-100 flex gap-3">
                <button
                  onClick={handleCancel}
                  className="flex-1 py-3.5 rounded-2xl font-bold text-text-muted hover:bg-slate-100 transition-all border border-border-theme"
                >
                  {state.cancelText || '취소'}
                </button>
                <button
                  onClick={handleConfirm}
                  className={`flex-1 py-3.5 rounded-2xl font-bold text-white transition-all shadow-lg ${config.confirmBg}`}
                >
                  {state.confirmText || '확인'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    );
  }, [state, handleConfirm, handleCancel]);

  return { confirm, ConfirmDialog };
}
