/**
 * FileUploadCard 컴포넌트
 * 파일 드래그 앤 드롭 업로드 카드
 */
import React from 'react';
import { FileSpreadsheet, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

interface FileUploadCardProps {
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFileDrop: (file: File) => void;
}

export const FileUploadCard: React.FC<FileUploadCardProps> = ({
  fileInputRef,
  onFileUpload,
  onFileDrop,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.1 }}
      className="w-full max-w-2xl bg-white rounded-[2rem] shadow-2xl shadow-primary/5 border border-border-theme p-8 md:p-12 mb-16 relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary to-primary-dark" />

      <div
        className="flex flex-col items-center text-center cursor-pointer group"
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          const file = e.dataTransfer.files?.[0];
          if (file) onFileDrop(file);
        }}
      >
        <div className="bg-primary-light p-8 rounded-3xl mb-8 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
          <FileSpreadsheet className="w-16 h-16 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-text-main mb-4">
          데이터 파일 업로드
        </h2>
        <p className="text-text-muted mb-8 leading-relaxed">
          학생들의 결제 내역이 담긴 CSV 또는 엑셀 파일을
          <br />
          드래그하여 놓거나 클릭하여 선택해 주세요.
        </p>
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {['학생이름', '거래일자', '지원영역', '소속 학교'].map((tag) => (
            <span
              key={tag}
              className="bg-bg-theme px-4 py-1.5 rounded-full border border-border-theme text-xs font-bold text-text-muted"
            >
              {tag}
            </span>
          ))}
        </div>
        <button className="bg-primary text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-primary-dark transition-all shadow-lg shadow-primary/20">
          파일 선택하기
          <ArrowRight className="w-5 h-5" />
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={onFileUpload}
          accept=".csv, .xlsx, .xls"
          className="hidden"
        />
      </div>
    </motion.div>
  );
};
