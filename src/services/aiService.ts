import { Student, AnnualPlanData, MonthlyJournalData } from "../types";
import { GoogleGenAI } from "@google/genai";
import { calculateStudentAge } from "./dateUtils";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn("Warning: GEMINI_API_KEY is not set. AI features might fail.");
}
const ai = new GoogleGenAI({ apiKey: apiKey || '' });

const TIMEOUT_MS = 30000;

function executeWithTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`AI Request Timeout: ${timeoutMs}ms exceeded`)), timeoutMs)
    ),
  ]);
}
function safeJsonParse(text: string) {
  try {
    // Attempt direct parse
    return JSON.parse(text);
  } catch (e) {
    // If it fails, try to extract JSON from markdown blocks
    const jsonMatch = text.match(/```json\s?([\s\S]*?)\s?```/) || text.match(/```\s?([\s\S]*?)\s?```/);
    if (jsonMatch && jsonMatch[1]) {
      try {
        return JSON.parse(jsonMatch[1].trim());
      } catch (innerE) {
        throw new Error(`Failed to parse extracted JSON: ${innerE}`);
      }
    }
    
    // If no markdown blocks, try to find the first '{' and last '}'
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
      try {
        return JSON.parse(text.substring(firstBrace, lastBrace + 1));
      } catch (innerE) {
        throw new Error(`Failed to parse braced JSON: ${innerE}`);
      }
    }
    
    throw e;
  }
}

export async function generateAnnualPlan(student: Student): Promise<AnnualPlanData> {
  try {
    const { manAge, schoolStage } = calculateStudentAge(student.birthDate);
    const prompt = `
      너는 10년 차 1급 전문 언어재활사 및 미술치료사이다. 다음       [학생 정보]
      - 이름: ${student.name}
      - 나이: 만 ${manAge}세 (${schoolStage})
      - 장애 유형: ${student.disabilityType}
      - 치료 영역: ${student.treatmentArea}
      - 주요 관찰 및 특이사항: ${student.observations || '없음'}
      
      [시스템 지침]
      1. 핵심 임무: 학생의 정보를 바탕으로 공식 문서에 들어갈 '현행 수준', '장기 목표', '월별 치료 목표 및 내용'을 창작한다.
      2. 특이사항 최우선 반영 (CRITICAL): 학생 정보의 '주요 관찰 및 특이사항'에 적힌 내용은 반드시 '현행 수준'과 '장기 목표'의 첫 번째 항목으로 구체적으로 다루어져야 한다.
      3. 맞춤형 난이도 조절: 
         - 이 학생은 만 ${manAge}세의 ${student.disabilityType} 아동이며, 진행할 치료 영역은 ${student.treatmentArea}이다. 
         - 서류의 치료 목표와 프로그램 내용은 반드시 이 나이대 아동의 정상 발달 수준과 ${student.treatmentArea}의 임상적 특성에 완벽하게 부합하도록 구성하라.
      4. 문체 및 어조: 객관적이고 임상적인 행동 관찰 위주로 서술하며, 모든 문장은 "-함", "-보임", "-관찰됨" 등 명사형으로 끝맺는다.
      5. 전문성: 10년 차 이상의 전문가가 작성한 것처럼 전문 용어를 적절히 사용한다.
      
      [응답 구조]
      {
        "currentLevel": ["구체적인 현행 수준 1", "구체적인 현행 수준 2", "구체적인 현행 수준 3"],
        "longTermGoals": ["장기 목표 1", "장기 목표 2"],
        "monthlyGoals": [
          { "month": 3, "goal": "3월 목표", "content": "3월 치료 내용 및 활동" },
          ... (3월부터 차년도 2월까지 12개월분)
        ]
      }
    `;

    const response = await executeWithTimeout(ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        maxOutputTokens: 8192
      }
    }), TIMEOUT_MS);

    if (!response.text) throw new Error('Empty response from AI');
    return safeJsonParse(response.text);
  } catch (error) {
    console.error("AI Error:", error);
    throw error;
  }
}

export async function generateMonthlyJournal(student: Student, month: number, monthlyGoal?: string): Promise<MonthlyJournalData> {
  if (!apiKey) throw new Error('API Key is missing');
  const effectiveGoal = monthlyGoal || "연간계획서에 목표가 설정되지 않았습니다.";
  
  try {
    const { manAge, schoolStage } = calculateStudentAge(student.birthDate);
    const prompt = `
      너는 10년 차 1급 전문 언어재활사 및 미술치료사이다. 전달받은 '월 치료 목표'를 바탕으로 아래의 [모방 샘플]과 완벽하게 동일한 문장 구조, 어조, 명사형 종결어미를 사용하여 치료 내용과 아동 반응을 창작해라.
      
      [학생 정보]
      - 이름: ${student.name}
      - 나이: 만 ${manAge}세 (${schoolStage})
      - 장애 유형: ${student.disabilityType}
      - 치료 영역: ${student.treatmentArea}
      - 주요 관찰 및 특이사항: ${student.observations || '없음'}
      - 결제 일자(세션 날짜): ${student.paymentDates.join(", ")}
      - 이번 달 치료 목표: ${effectiveGoal}
      
      [시스템 지침]
      1. 구체성 (필수): 단순한 활동 나열이 아니라, 어떤 매체를 가지고 어떤 상호작용을 했는지 구체적으로 기술해라.
      2. 특이사항 반영: 학생의 '주요 관찰 및 특이사항'을 참고하여, 해당 학생만의 고유한 특성(예: 소리에 민감함, 눈맞춤이 짧음 등)이 치료 상황과 아동 반응에 반드시 녹아나게 하라.
      3. 명사형 종결어미: 모든 문장은 -함., -보임., -관찰됨., -표현함. 등으로 끝내야 한다.
      4. 회기별 차별화: 각 회기(세션)의 내용은 목표를 달성해가는 과정으로 구성하며, 매번 다른 활동과 반응을 보여주어야 한다.
      
      [차윤우 2025년 월간일지 완벽 모방 샘플]
      - 치료 내용: "내 마음의 날씨 그리기 활동을 통해 현재 기분을 시각화하고, 감정 카드 게임을 실시하여 상황에 따른 감정 명칭 변별 및 명명 훈련함."
      - 아동 반응: "기분이 '맑음'이라고 말하며 해를 크게 그리는 모습보임. 상황 카드 제시 시 '슬퍼요', '화나요' 등 기본 감정 어휘 정반응률이 80% 이상으로 향상됨."
      - 가정 내 연계: "가정에서도 아동의 기분을 수시로 물어봐 주시고, 대답할 때 감정 어휘를 모델링해 주시길 안내함."
      
      [응답 구조]
      {
        "currentLevel": "현행 수준 및 이번 달 초기 상태 요약",
        "monthlyGoal": "${effectiveGoal}",
        "sessions": [
          { 
            "date": "YYYY-MM-DD", 
            "content": "구체적인 치료 활동 내용", 
            "reaction": "활동에 대한 아동의 구체적 반응 및 수행도", 
            "consultation": "가정 내 연계 활동 안내함." 
          }
        ],
        "result": "${month}월 치료 결과 종합 요약"
      }
    `;

    const response = await executeWithTimeout(ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        maxOutputTokens: 8192
      }
    }), TIMEOUT_MS);

    if (!response.text) throw new Error('Empty response from AI');
    return safeJsonParse(response.text);
  } catch (error) {
    console.error("AI Error:", error);
    throw error;
  }
}
