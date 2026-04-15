/**
 * useFileUpload 커스텀 훅
 * 파일 업로드 상태 관리 및 fileParserService 호출을 캡슐화합니다.
 */
import React, { useState, useRef, useCallback } from 'react';
import { RawRecord } from '../types';
import { useToast } from './useToast';
import { parseFile } from '../services/fileParserService';

interface UseFileUploadReturn {
  rawRecords: RawRecord[];
  isDataLoaded: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  processFile: (file: File) => Promise<void>;
  resetUpload: () => void;
}

export function useFileUpload(
  onRecordsParsed: (records: RawRecord[]) => Promise<void>
): UseFileUploadReturn {
  const { showToast } = useToast();
  const [rawRecords, setRawRecords] = useState<RawRecord[]>([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(
    async (file: File) => {
      const result = await parseFile(file);

      if (result.success === false) {
        showToast({ type: 'error', message: result.message }, 5000);
        return;
      }

      // Firebase 저장 (중복 체크 포함)
      await onRecordsParsed(result.records);

      setRawRecords(result.records);
      setIsDataLoaded(true);
      showToast({
        type: 'success',
        message: '데이터가 성공적으로 로드되었습니다. 잠시 후 목록이 업데이트됩니다.',
      });
    },
    [onRecordsParsed, showToast]
  );

  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      processFile(file);
    },
    [processFile]
  );

  const resetUpload = useCallback(() => {
    setIsDataLoaded(false);
    setRawRecords([]);
  }, []);

  return {
    rawRecords,
    isDataLoaded,
    fileInputRef,
    handleFileUpload,
    processFile,
    resetUpload,
  };
}
