import React, { createContext, useState, ReactNode, useCallback, useRef } from 'react';
import { UploadStatus } from '../../types';
import { Toast } from './Toast';

interface ToastContextType {
  toastStatus: UploadStatus | null;
  showToast: (status: UploadStatus | null, duration?: number) => void;
  showPrintWarning: boolean;
  setShowPrintWarning: (show: boolean) => void;
}

export const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toastStatus, setToastStatus] = useState<UploadStatus | null>(null);
  const [showPrintWarning, setShowPrintWarning] = useState(false);
  const timerRef = useRef<number | null>(null);

  const showToast = useCallback((status: UploadStatus | null, duration = 3000) => {
    setToastStatus(status);
    
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
    }
    
    if (status) {
      timerRef.current = window.setTimeout(() => {
        setToastStatus(null);
      }, duration);
    }
  }, []);

  return (
    <ToastContext.Provider value={{ toastStatus, showToast, showPrintWarning, setShowPrintWarning }}>
      {children}
      <Toast
        uploadStatus={toastStatus}
        showPrintWarning={showPrintWarning}
        onClosePrintWarning={() => setShowPrintWarning(false)}
      />
    </ToastContext.Provider>
  );
}
