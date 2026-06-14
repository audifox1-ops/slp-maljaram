/**
 * TemplateSettingsModal 컴포넌트
 * 문서 템플릿 커스터마이징 설정 모달
 */
import React, { useState, useEffect } from 'react';
import { X, Save, RotateCcw, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TemplateSettings, 
  loadTemplateSettings, 
  saveTemplateSettings, 
  resetTemplateSettings 
} from '../../services/templateService';
import { useConfirm } from '../../hooks/useConfirm';

interface TemplateSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: TemplateSettings) => void;
}

export const TemplateSettingsModal: React.FC<TemplateSettingsModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [settings, setSettings] = useState<TemplateSettings>(loadTemplateSettings());
  const [hasChanges, setHasChanges] = useState(false);
  const { confirm } = useConfirm();

  useEffect(() => {
    if (isOpen) {
      setSettings(loadTemplateSettings());
      setHasChanges(false);
    }
  }, [isOpen]);

  const handleChange = (field: keyof TemplateSettings, value: string | number | boolean) => {
    setSettings(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    saveTemplateSettings(settings);
    onSave(settings);
    setHasChanges(false);
    onClose();
  };

  const handleReset = async () => {
    const ok = await confirm({
      title: '설정 초기화',
      message: '템플릿 설정을 기본값으로 초기화하시겠습니까?',
      confirmText: '초기화',
      variant: 'warning',
    });
    if (ok) {
      const defaultSettings = resetTemplateSettings();
      setSettings(defaultSettings);
      setHasChanges(true);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-text-main/40 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
        >
          {/* 헤더 */}
          <div className="p-6 border-b border-border-theme flex justify-between items-center bg-bg-theme/30">
            <div className="flex items-center gap-3">
              <div className="bg-primary p-2 rounded-xl">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-text-main">템플릿 설정</h3>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors">
              <X className="w-6 h-6 text-text-muted" />
            </button>
          </div>

          {/* 본문 */}
          <div className="p-6 space-y-6">
            {/* 기관 정보 */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-text-muted uppercase tracking-wider">기관 정보</h4>
              
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-muted ml-1">기관명</label>
                <input
                  type="text"
                  value={settings.organizationName}
                  onChange={(e) => handleChange('organizationName', e.target.value)}
                  placeholder="치료 기관명 입력"
                  className="w-full px-4 py-3 bg-bg-theme border border-border-theme rounded-2xl focus:border-primary outline-none transition-all font-medium"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-text-muted ml-1">주소</label>
                <input
                  type="text"
                  value={settings.organizationAddress}
                  onChange={(e) => handleChange('organizationAddress', e.target.value)}
                  placeholder="기관 주소 입력"
                  className="w-full px-4 py-3 bg-bg-theme border border-border-theme rounded-2xl focus:border-primary outline-none transition-all font-medium"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-text-muted ml-1">전화번호</label>
                <input
                  type="text"
                  value={settings.organizationPhone}
                  onChange={(e) => handleChange('organizationPhone', e.target.value)}
                  placeholder="051-123-4567"
                  className="w-full px-4 py-3 bg-bg-theme border border-border-theme rounded-2xl focus:border-primary outline-none transition-all font-medium"
                />
              </div>
            </div>

            {/* 문서 설정 */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-text-muted uppercase tracking-wider">문서 설정</h4>
              
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-muted ml-1">기본 문서 제목</label>
                <input
                  type="text"
                  value={settings.documentTitle}
                  onChange={(e) => handleChange('documentTitle', e.target.value)}
                  placeholder="교육청 치료지원 대상"
                  className="w-full px-4 py-3 bg-bg-theme border border-border-theme rounded-2xl focus:border-primary outline-none transition-all font-medium"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-text-muted ml-1">푸터 텍스트</label>
                <input
                  type="text"
                  value={settings.footerText}
                  onChange={(e) => handleChange('footerText', e.target.value)}
                  placeholder="© 2026 치료 서류 자동 생성 시스템"
                  className="w-full px-4 py-3 bg-bg-theme border border-border-theme rounded-2xl focus:border-primary outline-none transition-all font-medium"
                />
              </div>
            </div>

            {/* 서체 설정 */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-text-muted uppercase tracking-wider">서체 설정</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-muted ml-1">글꼴</label>
                  <select
                    value={settings.fontName}
                    onChange={(e) => handleChange('fontName', e.target.value)}
                    className="w-full px-4 py-3 bg-bg-theme border border-border-theme rounded-2xl focus:border-primary outline-none transition-all font-medium cursor-pointer"
                  >
                    <option value="맑은 고딕">맑은 고딕</option>
                    <option value="나눔고딕">나눔고딕</option>
                    <option value="malgun-gothic">Malgun Gothic</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-muted ml-1">크기 (pt)</label>
                  <select
                    value={settings.fontSize}
                    onChange={(e) => handleChange('fontSize', parseInt(e.target.value))}
                    className="w-full px-4 py-3 bg-bg-theme border border-border-theme rounded-2xl focus:border-primary outline-none transition-all font-medium cursor-pointer"
                  >
                    {[8, 9, 10, 11, 12, 14, 16].map(size => (
                      <option key={size} value={size}>{size}pt</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* 색상 설정 */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-text-muted uppercase tracking-wider">색상 설정</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-muted ml-1">헤더 색상</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={settings.headerColor}
                      onChange={(e) => handleChange('headerColor', e.target.value)}
                      className="w-12 h-12 rounded-xl border border-border-theme cursor-pointer"
                    />
                    <input
                      type="text"
                      value={settings.headerColor}
                      onChange={(e) => handleChange('headerColor', e.target.value)}
                      className="flex-1 px-3 py-2 bg-bg-theme border border-border-theme rounded-xl focus:border-primary outline-none transition-all font-medium text-sm"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-muted ml-1">강조 색상</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={settings.accentColor}
                      onChange={(e) => handleChange('accentColor', e.target.value)}
                      className="w-12 h-12 rounded-xl border border-border-theme cursor-pointer"
                    />
                    <input
                      type="text"
                      value={settings.accentColor}
                      onChange={(e) => handleChange('accentColor', e.target.value)}
                      className="flex-1 px-3 py-2 bg-bg-theme border border-border-theme rounded-xl focus:border-primary outline-none transition-all font-medium text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 로고 설정 */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-text-muted uppercase tracking-wider">로고 설정</h4>
              
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.showLogo}
                    onChange={(e) => handleChange('showLogo', e.target.checked)}
                    className="w-5 h-5 rounded border-border-theme text-primary focus:ring-primary"
                  />
                  <span className="text-sm font-medium">문서에 로고 표시</span>
                </label>
              </div>

              {settings.showLogo && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-muted ml-1">로고 URL</label>
                  <input
                    type="url"
                    value={settings.logoUrl}
                    onChange={(e) => handleChange('logoUrl', e.target.value)}
                    placeholder="https://example.com/logo.png"
                    className="w-full px-4 py-3 bg-bg-theme border border-border-theme rounded-2xl focus:border-primary outline-none transition-all font-medium"
                  />
                </div>
              )}
            </div>
          </div>

          {/* 푸터 */}
          <div className="p-6 border-t border-border-theme bg-bg-theme/30 flex gap-3">
            <button
              onClick={handleReset}
              className="flex-1 py-3 rounded-2xl font-bold text-text-muted hover:bg-white transition-all border border-border-theme flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              초기화
            </button>
            <button
              onClick={handleSave}
              disabled={!hasChanges}
              className={`flex-1 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all ${
                hasChanges 
                  ? 'bg-primary text-white hover:bg-primary-dark shadow-lg shadow-primary/20' 
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Save className="w-4 h-4" />
              저장
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
