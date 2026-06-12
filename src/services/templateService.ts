/**
 * 템플릿 설정 서비스
 * 문서 템플릿 커스터마이징 설정을 관리합니다.
 */

export interface TemplateSettings {
  // 기본 정보
  organizationName: string;
  organizationAddress: string;
  organizationPhone: string;
  
  // 문서 설정
  documentTitle: string;
  footerText: string;
  
  // 서체 설정
  fontName: string;
  fontSize: number;
  
  // 색상 설정
  headerColor: string;
  accentColor: string;
  
  // 로고
  logoUrl: string;
  showLogo: boolean;
}

const DEFAULT_SETTINGS: TemplateSettings = {
  organizationName: '',
  organizationAddress: '',
  organizationPhone: '',
  documentTitle: '',
  footerText: '',
  fontName: '맑은 고딕',
  fontSize: 10,
  headerColor: '#1e293b',
  accentColor: '#6366f1',
  logoUrl: '',
  showLogo: false,
};

const STORAGE_KEY = 'slp-docs-template-settings';

/**
 * 템플릿 설정을 로컬 스토리지에서 불러옵니다.
 */
export function loadTemplateSettings(): TemplateSettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    }
  } catch (e) {
    console.error('Failed to load template settings:', e);
  }
  return DEFAULT_SETTINGS;
}

/**
 * 템플릿 설정을 로컬 스토리지에 저장합니다.
 */
export function saveTemplateSettings(settings: TemplateSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save template settings:', e);
  }
}

/**
 * 템플릿 설정을 기본값으로 초기화합니다.
 */
export function resetTemplateSettings(): TemplateSettings {
  localStorage.removeItem(STORAGE_KEY);
  return DEFAULT_SETTINGS;
}

/**
 * 설정이 유효한지 검증합니다.
 */
export function validateTemplateSettings(settings: TemplateSettings): boolean {
  if (!settings.fontName || settings.fontName.trim() === '') return false;
  if (settings.fontSize < 8 || settings.fontSize > 16) return false;
  return true;
}
