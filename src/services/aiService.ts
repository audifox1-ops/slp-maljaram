import { Student, AnnualPlanData, MonthlyJournalData } from "../types";
import { GoogleGenAI } from "@google/genai";
import { calculateStudentAge } from "./dateUtils";

const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY;
if (!apiKey) {
  // Suppress intrusive warnings in production if possible, keep it subtle
  console.log("%c[AI Service] GEMINI_API_KEY is not set. Using fallback mock data.", "color: #6366f1; font-weight: bold;");
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

async function executeWithRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelayMs: number = 2000
): Promise<T> {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      return await operation();
    } catch (error: any) {
      attempt++;
      // 503 (Service Unavailable) or 429 (Too Many Requests) are retryable
      const isRetryable = error?.status === 503 || error?.status === 429 || 
                          error?.message?.includes('503') || error?.message?.includes('429') ||
                          error?.message?.includes('fetch failed') || error?.message?.includes('Timeout');
      
      if (!isRetryable || attempt >= maxRetries) {
        throw error;
      }
      
      // Exponential backoff with jitter
      const delay = baseDelayMs * Math.pow(2, attempt - 1) + Math.random() * 1000;
      console.warn(`[AI Service] API request failed (Attempt ${attempt}/${maxRetries}). Retrying in ${Math.round(delay)}ms...`, error?.message || error);
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error("Max retries reached");
}
function safeJsonParse(text: string) {
  try {
    return JSON.parse(text);
  } catch (e) {
    const jsonMatch = text.match(/```json\s?([\s\S]*?)\s?```/) || text.match(/```\s?([\s\S]*?)\s?```/);
    if (jsonMatch && jsonMatch[1]) {
      try {
        return JSON.parse(jsonMatch[1].trim());
      } catch (innerE) {
        throw new Error(`Failed to parse extracted JSON: ${innerE}`);
      }
    }
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

function validateAnnualPlan(data: any): AnnualPlanData {
  if (!data || typeof data !== 'object') throw new Error('AI 응답이 올바른 형식이 아닙니다.');
  if (!Array.isArray(data.currentLevel) || data.currentLevel.length === 0)
    throw new Error('AI 응답에서 "currentLevel" 배열을 찾을 수 없습니다.');
  if (!Array.isArray(data.longTermGoals) || data.longTermGoals.length === 0)
    throw new Error('AI 응답에서 "longTermGoals" 배열을 찾을 수 없습니다.');
  if (!Array.isArray(data.monthlyGoals) || data.monthlyGoals.length === 0)
    throw new Error('AI 응답에서 "monthlyGoals" 배열을 찾을 수 없습니다.');
  for (const g of data.monthlyGoals) {
    if (typeof g.month !== 'number' || typeof g.goal !== 'string' || typeof g.content !== 'string')
      throw new Error('월별 목표 데이터 형식이 올바르지 않습니다.');
  }
  return data as AnnualPlanData;
}

function validateMonthlyJournal(data: any): MonthlyJournalData {
  if (!data || typeof data !== 'object') throw new Error('AI 응답이 올바른 형식이 아닙니다.');
  if (typeof data.currentLevel !== 'string' || !data.currentLevel)
    throw new Error('AI 응답에서 "currentLevel"을 찾을 수 없습니다.');
  if (typeof data.monthlyGoal !== 'string')
    throw new Error('AI 응답에서 "monthlyGoal"을 찾을 수 없습니다.');
  if (!Array.isArray(data.sessions))
    throw new Error('AI 응답에서 "sessions" 배열을 찾을 수 없습니다.');
  if (typeof data.result !== 'string')
    throw new Error('AI 응답에서 "result"를 찾을 수 없습니다.');
  return data as MonthlyJournalData;
}

export async function generateAnnualPlan(student: Student): Promise<AnnualPlanData> {
  if (!apiKey) throw new Error('API_KEY_MISSING');
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
      4. 자연스러운 임상 기록 (CRITICAL): AI가 생성한 기계적인 느낌(지나치게 정형화된 패턴 반복, 불필요한 미사여구, 어색한 접속사)을 완벽히 제거하라. 실제 치료사가 바쁜 현장에서 작성하듯 핵심을 짚되, 매우 자연스럽고 생생한 관찰 내용을 담아라.
      5. 문체 및 어조: 객관적이고 임상적인 행동 관찰 위주로 서술하며, 모든 문장은 "-함", "-보임", "-관찰됨", "-수준임" 등 명사형으로 끝맺되 문장 길이를 다채롭게 구성하라. ('본 치료사는' 등의 어색한 주어 절대 사용 금지)
      6. 전문성: 10년 차 이상의 전문가가 작성한 것처럼 전문 용어를 적절히 혼용한다.
      
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

    const response = await executeWithRetry(() => executeWithTimeout(ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        maxOutputTokens: 8192
      }
    }), TIMEOUT_MS));

    if (!response.text) throw new Error('Empty response from AI');
    return validateAnnualPlan(safeJsonParse(response.text));
  } catch (error) {
    if (apiKey) console.error("AI Error:", error);
    throw error;
  }
}

export async function generateMonthlyJournal(student: Student, month: number, monthlyGoal?: string): Promise<MonthlyJournalData> {
  if (!apiKey) throw new Error('API_KEY_MISSING');
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
      2. 아동 반응 상세화 (CRITICAL): 아동 반응 항목은 단순히 잘했다/못했다가 아닌, 활동 중 아동의 실제 발화, 구체적 행동, 정서적 반응, 목표 수행 수준의 변화 등을 포함하여 **반드시 최소 3~4줄 분량으로 매우 상세하게** 작성하라.
      3. 연간계획서와의 완벽한 일관성 (CRITICAL): 제공된 '이번 달 치료 목표'는 연간계획서의 내용이다. 월간일지의 '현행 수준', '치료 내용', '아동 반응', '치료 결과'는 연간계획서의 목표 및 흐름과 완벽하게 일치해야 하며, 절대로 어긋나거나 모순되는 내용이 포함되어서는 안 된다.
      4. 특이사항 반영: 학생의 '주요 관찰 및 특이사항'을 참고하여, 해당 학생만의 고유한 특성이 치료 상황과 아동 반응에 반드시 녹아나게 하라.
      5. 자연스러운 임상 기록 (CRITICAL): AI가 생성한 기계적인 느낌(지나치게 정형화된 문장 구조 반복, 불필요한 형용사/부사, 작위적인 표현)을 완벽히 제거하라. 실제 치료사가 바쁜 현장에서 직접 타자 쳐서 기록하듯 핵심을 짚되, 매우 자연스럽고 사람 냄새가 나는 생생한 기록이어야 한다.
      6. 문체 및 어조: 모든 문장은 -함., -보임., -관찰됨., -표현함. 등으로 끝내되, 문장 길이를 다양하게 구성하고 어색한 번역투나 주어('본 치료사는', '해당 아동은' 등)를 생략하라.
      7. 회기별 차별화: 각 회기(세션)의 내용은 목표를 달성해가는 과정으로 구성하며, 매번 다른 활동과 반응을 보여주어야 한다.
      
      [차윤우 2025년 월간일지 완벽 모방 샘플]
      - 치료 내용: "내 마음의 날씨 그리기 활동을 통해 현재 기분을 시각화하고, 감정 카드 게임을 실시하여 상황에 따른 감정 명칭 변별 및 명명 훈련함."
      - 아동 반응 (아래 샘플처럼 반드시 3~4문장 이상으로 길고 구체적으로 작성): "기분이 '맑음'이라고 말하며 도화지에 해를 크게 그리는 모습보임. 상황 카드 제시 시 '슬퍼요', '화나요' 등 기본 감정 어휘 정반응률이 80% 이상으로 향상됨. 또한, 자신이 어린이집에서 화났던 경험을 자발적으로 2~3어절 문장으로 길게 표현하는 긍정적인 변화가 관찰됨. 세션 내내 이탈 없이 착석을 유지하며 치료사와 눈맞춤을 길게 유지하고 적극적으로 상호작용을 시도함."
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

    const response = await executeWithRetry(() => executeWithTimeout(ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        maxOutputTokens: 8192
      }
    }), TIMEOUT_MS));

    if (!response.text) throw new Error('Empty response from AI');
    return validateMonthlyJournal(safeJsonParse(response.text));
  } catch (error) {
    if (apiKey) console.error("AI Error:", error);
    throw error;
  }
}
