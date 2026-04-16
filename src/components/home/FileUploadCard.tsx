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
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -5, transition: { duration: 0.3 } }}
      className="w-full max-w-2xl glass-card rounded-[2.5rem] p-1 shadow-2xl shadow-primary/10 mb-20 relative overflow-hidden group"
    >
      <div className="bg-white/40 rounded-[2.4rem] p-8 md:p-12 border border-white/60">
        <div
          className="flex flex-col items-center text-center cursor-pointer"
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
          <motion.div 
            whileHover={{ rotate: [0, -5, 5, 0], scale: 1.1 }}
            className="bg-primary/5 p-8 rounded-[2rem] mb-8 relative"
          >
            <div className="absolute inset-0 bg-primary/10 rounded-[2rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <FileSpreadsheet className="w-16 h-16 text-primary relative z-10" />
            
            {/* Pulsing Dot */}
            <div className="absolute top-2 right-2 w-3 h-3 bg-accent rounded-full animate-ping" />
            <div className="absolute top-2 right-2 w-3 h-3 bg-accent rounded-full" />
          </motion.div>

          <h2 className="text-3xl font-black text-text-main mb-4 tracking-tight">
            데이터 시작하기
          </h2>
          
          <p className="text-text-muted mb-8 leading-relaxed font-medium">
            학생들의 결제 내역(CSV/Excel)을 드래그하거나
            <br />
            클릭하여 분석을 시작하세요.
          </p>

          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {['학생이름', '거래일자', '지원영역', '소속 학교'].map((tag) => (
              <span
                key={tag}
                className="bg-white/80 px-4 py-1.5 rounded-xl border border-primary/10 text-[10px] font-black text-primary/60 tracking-wider uppercase"
              >
                {tag}
              </span>
            ))}
          </div>

          <button className="btn-primary group/btn">
            <span>파일 업로드</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={onFileUpload}
            accept=".csv, .xlsx, .xls"
            className="hidden"
          />
        </div>
      </div>
    </motion.div>
  );
};
