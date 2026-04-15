/**
 * AI 서비스 실패 시 사용하는 Mock 데이터 생성 서비스
 */

/**
 * 역할: 치료 영역별 Mock 세션 데이터를 생성합니다.
 * AI 응답이 실패하거나 특정 날짜의 세션이 누락되었을 때 폴백으로 사용됩니다.
 */

const mockContents: Record<string, string[]> = {
  '언어치료': [
    "조음점 지시법을 활용한 'ㅅ' 음소 산출 유도 및 반복 훈련 실시함.",
    "상황 카드 제시를 통한 화용적 의사소통 전략 모델링 및 역할극 수행함.",
    "언어적 촉구(Prompting)를 활용한 2어조합 문장 산출 유도함.",
    "시각적 비계(Scaffolding)를 제공하여 이야기 순서 나열 및 설명하기 활동함.",
    "자발화에서의 명료도 향상을 위한 피드백 제공 및 수정 발화 유도함.",
    "청각적 변별력 강화를 위한 유사 음소 대조 및 듣기 활동 실시함.",
  ],
  '미술치료': [
    "이완 훈련을 위한 점토 탐색 및 자유로운 형태 만들기 활동함.",
    "내면 감정 표출을 위한 '감정 온도계' 그리기 및 색채 심리 활동함.",
    "자아 정체성 확립을 위한 '나의 강점 나무' 꾸미기 및 콜라주 작업함.",
    "사회성 기술 향상을 위한 협동화 그리기 및 역할 분담 활동 실시함.",
    "정서적 안정을 위한 만다라 채색 및 호흡 조절 연습함.",
    "문제 해결 능력 배양을 위한 입체 구조물 만들기 및 계획 세우기 활동함.",
  ],
  'default': [
    "주의 집중력 유지를 위한 과제 수행 및 정적 강화 제공함.",
    "기초 학습 능력 향상을 위한 인지 자극 활동 및 반복 학습 실시함.",
    "일상생활 적응을 위한 모의 상황 연습 및 모델링 제공함.",
    "정서 조절을 위한 이완 기법 습득 및 자기 진정 활동 수행함.",
    "대인 관계 기술 향상을 위한 그룹 게임 및 규칙 준수 연습함.",
  ],
};

const mockReactions: string[] = [
  "목표 음소 산출 시 조음점 위치를 스스로 수정하려는 시도가 관찰됨.",
  "치료사의 모델링에 주의를 집중하며 자발적인 모방 발화 빈도가 증가함.",
  "과제 수행 중 어려움이 발생했을 때 적절한 도움을 요청하는 모습보임.",
  "자신의 감정을 어휘로 구체화하여 표현하려는 태도 변화가 나타남.",
  "활동에 대한 흥미도가 높으며 과제 완수 후 성취감을 표현함.",
  "비언어적 의사소통(시선 접촉, 미소)이 이전 회기 대비 자연스러워짐.",
  "규칙이 있는 활동에서 순서를 기다리며 자기 조절 능력을 유지함.",
  "새로운 매체 탐색 시 조심스러운 태도를 보였으나 점차 적극적으로 참여함.",
  "학습된 기술을 다른 상황에 적용해 보려는 일반화 시도가 관찰됨.",
];

export interface MockSession {
  date: string;
  content: string;
  reaction: string;
  consultation: string;
}

/**
 * 주어진 날짜 목록에 대해 치료 영역에 맞는 Mock 세션 데이터를 생성합니다.
 */
export function generateMockSessions(
  dates: string[],
  treatmentArea: string,
  monthlyGoal?: string
): MockSession[] {
  const area = mockContents[treatmentArea] ? treatmentArea : 'default';
  const contents = mockContents[area];

  return dates.map((date, i) => {
    const baseContent = contents[i % contents.length];
    const baseReaction = mockReactions[i % mockReactions.length];

    const hasGoal =
      monthlyGoal && monthlyGoal !== '연간계획서에 목표가 설정되지 않았습니다.';

    const content = hasGoal
      ? `${monthlyGoal!.replace(/[함임다.]$/, '')} 목표 달성을 위해 ${baseContent}`
      : baseContent;

    const reaction = hasGoal
      ? `${monthlyGoal!.replace(/[함임다.]$/, '')} 과정에서 ${baseReaction}`
      : baseReaction;

    return {
      date,
      content,
      reaction,
      consultation: '가정 내에서의 연계 활동 및 지도 방법 안내함.',
    };
  });
}

/**
 * AI 실패 시 사용하는 폴백 연간 계획 데이터를 생성합니다.
 */
export function generateFallbackAnnualPlan() {
  return {
    currentLevel: [
      '전문적인 관찰 및 평가가 필요함.',
      '기초적인 의사소통 능력 탐색 중임.',
    ],
    longTermGoals: [
      '전반적인 치료 목표 달성을 위한 기초 다지기.',
      '상호작용 및 표현 능력 향상.',
    ],
    monthlyGoals: Array.from({ length: 12 }).map((_, i) => ({
      month: ((i + 2) % 12) + 1,
      goal: '월간 치료 목표 수립 및 이행',
      content: '영역별 맞춤 치료 프로그램 실시',
    })),
  };
}
