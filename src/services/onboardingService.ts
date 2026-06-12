/**
 * 온보딩 서비스
 * 첫 사용자 온보딩 상태를 관리합니다.
 */

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  target?: string; // 하이라이트할 요소 선택자
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    title: '환영합니다!',
    description: 'SLP.Docs는 언어재활사/미술치료사를 위한 치료 일지 자동 생성 도구입니다. 3단계만 거치면 전문적인 서류를 만들 수 있습니다.',
  },
  {
    id: 'upload',
    title: '1단계: 데이터 업로드',
    description: 'CSV 또는 Excel 파일로 결제 내역을 업로드하세요. 학생 이름, 날짜, 금액이 자동으로 추출됩니다.',
    target: '[data-onboarding="upload"]',
    position: 'bottom',
  },
  {
    id: 'students',
    title: '2단계: 학생 선택',
    description: '좌측 학생 목록에서 서류를 작성할 학생을 선택하세요. 치료 일정을 입력하면 더 정확한 서류가 생성됩니다.',
    target: '[data-onboarding="students"]',
    position: 'right',
  },
  {
    id: 'generate',
    title: '3단계: AI 자동 생성',
    description: '학생을 선택하면 AI가 연간계획서와 월별일지를 자동으로 작성합니다. 검토 후 다운로드하세요!',
    target: '[data-onboarding="generate"]',
    position: 'left',
  },
  {
    id: 'complete',
    title: '준비 완료!',
    description: '이제 치료 서류 작성을 시작할 수 있습니다. 도움이 필요하면 언제든 문의해 주세요.',
  },
];

const STORAGE_KEY = 'slp-docs-onboarding-completed';

/**
 * 온보딩이 완료되었는지 확인합니다.
 */
export function isOnboardingCompleted(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

/**
 * 온보딩 완료 상태를 저장합니다.
 */
export function completeOnboarding(): void {
  try {
    localStorage.setItem(STORAGE_KEY, 'true');
  } catch (e) {
    console.error('Failed to save onboarding state:', e);
  }
}

/**
 * 온보딩 상태를 초기화합니다.
 */
export function resetOnboarding(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('Failed to reset onboarding state:', e);
  }
}

/**
 * 샘플 학생 데이터를 생성합니다.
 */
export function generateSampleStudents() {
  return [
    {
      name: '김민준',
      birthDate: '18.03.15',
      school: '서울초등학교',
      disabilityType: '언어장애',
      treatmentArea: '언어치료',
      therapistName: '김치료사',
      schedule: { day: '화, 목', time: '14:00~14:50', frequency: '2' },
      observations: '조음 및 유창성 영역에서 치료 필요. 자발화 확보 목표.',
    },
    {
      name: '이서연',
      birthDate: '19.07.22',
      school: '서울유치원',
      disabilityType: '발달장애',
      treatmentArea: '미술치료',
      therapistName: '김치료사',
      schedule: { day: '월, 수', time: '10:00~10:50', frequency: '2' },
      observations: '사회성 기술 향상 필요. 또래 상호작용 능력 강화.',
    },
    {
      name: '박준호',
      birthDate: '17.11.08',
      school: '서울중학교',
      disabilityType: '자폐성장애',
      treatmentArea: '인지치료',
      therapistName: '김치료사',
      schedule: { day: '매주 금', time: '15:00~15:50', frequency: '1' },
      observations: '집행기능 및 문제 해결 능력 강화 필요.',
    },
  ];
}

/**
 * 샘플 결제 데이터를 생성합니다.
 */
export function generateSamplePayments() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  
  return [
    { '학생이름': '김민준', '거래일자': `${year}-${String(month).padStart(2, '0')}-03`, '금액': 50000, '지원영역': '언어치료' },
    { '학생이름': '김민준', '거래일자': `${year}-${String(month).padStart(2, '0')}-10`, '금액': 50000, '지원영역': '언어치료' },
    { '학생이름': '이서연', '거래일자': `${year}-${String(month).padStart(2, '0')}-05`, '금액': 50000, '지원영역': '미술치료' },
    { '학생이름': '이서연', '거래일자': `${year}-${String(month).padStart(2, '0')}-12`, '금액': 50000, '지원영역': '미술치료' },
    { '학생이름': '박준호', '거래일자': `${year}-${String(month).padStart(2, '0')}-07`, '금액': 60000, '지원영역': '인지치료' },
  ];
}
