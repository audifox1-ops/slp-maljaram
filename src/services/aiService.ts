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
      너는 10년 차 1급 전문 언어재활사 및 미술치료사이다. 다음 학생의 정보를 바탕으로 교육청 제출용 '연간 계획서'를 작성해라.
      
      [학생 정보]
      - 이름: ${student.name}
      - 나이: 만 ${manAge}세 (${schoolStage})
      - 장애 유형: ${student.disabilityType}
      - 치료 영역: ${student.treatmentArea}
      - 주요 관찰 내용: ${student.observations || '없음'}
      
      [시스템 지침]
      1. 핵심 임무: 학생의 정보를 바탕으로 공식 문서에 들어갈 '현행 수준', '장기 목표', '월별 치료 목표 및 내용'을 창작한다.
      2. 맞춤형 난이도 조절 (필수): 
         - 이 학생은 만 ${manAge}세의 ${student.disabilityType} 아동이며, 진행할 치료 영역은 ${student.treatmentArea}이다. 
         - 서류의 치료 목표와 프로그램 내용은 반드시 이 나이대 아동의 정상 발달 수준과 ${student.treatmentArea}의 임상적 특성에 완벽하게 부합하도록 구성하라.
         - 예: 7세 아동의 미술치료라면 '감정표현과 소근육 발달' 위주로, 13세 아동의 언어치료라면 '상황에 맞는 화용 언어 및 복잡한 어휘 구사' 위주로 난이도를 자동 조정할 것.
      3. 문체 및 어조: 객관적이고 임상적인 행동 관찰 위주로 서술하며, 모든 문장은 "-함", "-보임", "-관찰됨" 등 명사형으로 끝맺는다.
      4. 전문성: 전문가 수준의 단어와 문장 구조를 사용한다.
      
      [응답 구조]
      {
        "currentLevel": ["현행 수준 1", "현행 수준 2"],
        "longTermGoals": ["장기 목표 1", "장기 목표 2"],
        "monthlyGoals": [
          { "month": 3, "goal": "3월 목표", "content": "3월 치료 내용" },
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
      너는 10년 차 1급 전문 언어재활사 및 미술치료사이다. 전달받은 '월 치료 목표'를 바탕으로 아래의 [차윤우 월간일지 샘플]과 완벽하게 동일한 문장 구조, 어조, 명사형 종결어미를 사용하여 치료 내용과 아동 반응을 창작해라.
      
      [학생 정보]
      - 이름: ${student.name}
      - 나이: 만 ${manAge}세 (${schoolStage})
      - 장애 유형: ${student.disabilityType}
      - 치료 영역: ${student.treatmentArea}
      - 주요 관찰 내용: ${student.observations || '없음'}
      - 결제 일자(세션 날짜): ${student.paymentDates.join(", ")}
      - 이번 달 치료 목표: ${effectiveGoal}
      
      [시스템 지침]
      1. 핵심 임무: 학생의 정보를 바탕으로 공식 문서에 들어갈 '치료 내용', '아동 반응', '월 치료 목표'를 창작한다.
      2. 맞춤형 난이도 조절 (필수): 
         - 이 학생은 만 ${manAge}세의 ${student.disabilityType} 아동이며, 진행할 치료 영역은 ${student.treatmentArea}이다. 
         - 모든 치료 내용과 반응은 반드시 이 나이대 아동의 정상 발달 수준과 ${student.treatmentArea}의 임상적 특성에 완벽하게 부합하도록 구성하라.
         - 연령별 발달 과업에 맞춰 활동의 구체성과 난이도를 자동 조정할 것.
      3. 컨텍스트 매핑 및 다양성: 
         - 반드시 '이번 달 치료 목표(${effectiveGoal})'를 직접적으로 지원하는 임상적으로 타당한 중재 활동을 작성해라.
         - 매 회기마다 단순 반복적인 표현을 피하고, 치료 단계별 변화를 구체적 기법(Scaffolding, Modeling 등)과 함께 묘사해라.
      4. 전문성 및 어조: 10년 차 전문가의 식견이 드러나는 명사형 종결어미(-표현함., -관찰됨. 등)를 사용한다.
      
      [논리적 일치 예시 (Few-shot)]
      - 목표가 "정서 표현의 다양화"인 경우:
        * 치료내용: "오늘 내 마음의 날씨 그리기, 감정 카드 게임을 통한 감정 변별 활동 실시함"
        * 아동반응: "다양한 감정 어휘 사용 빈도가 향상됨, 자신의 기분을 날씨에 비유하여 적절히 표현함"
      - 목표가 "'ㅅ' 조음 개선"인 경우:
        * 치료내용: "'ㅅ' 음소 산출을 위한 설단 거상 및 기류 조절 연습, 단어 수준에서의 'ㅅ' 산출 훈련함"
        * 아동반응: "단어 초성에서의 'ㅅ' 정조음률이 70% 이상으로 향상됨, 설단의 위치가 점차 안정화되는 모습보임"
      
      [차윤우 2025년 월간일지 완벽 모방 샘플 (Few-Shot)]
      - (월 치료목표 예시): 가족관계 이해, 다양한 미술 매체를 활용하여 감정과 생각을 시각적으로 표현할 수 있도록 돕는다. 자기와 가족에 대한 관심을 바탕으로 자기인식과 자기표현을 확장한다.
      - (치료 내용 예시): "가족 이름 쓰기 + 가족 놀이 상황 표현", "가족의 하루 그리기", "가족에게 하고 싶은 말 말풍선 만들기", "가족 상징 만들기 (문장, 문양, 색 등으로)"
      - (아동 반응 예시): "가족 이름을 하나하나 부르며 놀이 장면 구성해서 표현해봄. 할머니와 장난감 놀이 장면 그리며 웃음 표현함.", "아침부터 저녁까지 가족의 하루 일과를 장면별로 표현해봄. '아빠는 아침에 출근해요' 등 문장 표현 시도하려고 함.", "'엄마 사랑해요' 말풍선 직접 쓰는 모습보임."
      - (월 치료결과 예시): "가족에 대한 자기 표현이 크게 나타나고 있음."
      
      [응답 구조]
      {
        "currentLevel": "현행 수준 요약",
        "monthlyGoal": "${effectiveGoal}",
        "sessions": [
          { "date": "YYYY-MM-DD", "content": "치료 내용", "reaction": "아동 반응", "consultation": "가정 내 연계 활동 및 지도 방법 안내함." }
        ],
        "result": "${month}월 치료 결과 요약"
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
