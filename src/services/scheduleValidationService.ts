/**
 * scheduleValidationService.ts
 *
 * 결제 영수증 날짜 ↔ 학생 치료 요일 일치 여부를 검증하는 유틸리티입니다.
 * parseDateString()은 dateUtils에서 재사용합니다.
 */
import { parseDateString } from './dateUtils';

/** 요일 숫자(0=일, 1=월 ... 6=토) → 한국어 요일 문자 매핑 */
const DAY_INDEX_TO_KR = ['일', '월', '화', '수', '목', '금', '토'] as const;

/**
 * 날짜 문자열에서 한국어 요일 문자(월·화·수·목·금·토·일)를 반환합니다.
 * 파싱 실패 시 null을 반환합니다.
 */
export function getKoreanDayOfWeek(dateStr: string): string | null {
  const parsed = parseDateString(dateStr);
  if (!parsed) return null;

  let year = parseInt(parsed.year, 10);
  // 2자리 연도 보정 (00~30 → 2000년대, 31~ → 1900년대)
  if (parsed.year.length === 2) {
    year += year <= 30 ? 2000 : 1900;
  }

  try {
    const date = new Date(year, parsed.month - 1, parsed.day);
    // 유효하지 않은 날짜 방어
    if (isNaN(date.getTime())) return null;
    return DAY_INDEX_TO_KR[date.getDay()];
  } catch {
    return null;
  }
}

/**
 * 학생 schedule.day 문자열을 개별 요일 배열로 파싱합니다.
 * 예: "화, 목" → ["화", "목"]
 * 예: "화목" → ["화", "목"]
 * 예: "매주 화요일" → ["화"]
 */
export function parseScheduleDays(scheduleDay: string): string[] {
  if (!scheduleDay) return [];

  const krDays = ['월', '화', '수', '목', '금', '토', '일'];
  const found: string[] = [];

  for (const day of krDays) {
    if (scheduleDay.includes(day)) {
      found.push(day);
    }
  }
  return found;
}

/** 개별 결제 날짜 검증 결과 */
export interface ValidationResult {
  /** 원본 결제 날짜 문자열 */
  date: string;
  /** 해당 날짜의 한국어 요일 (파싱 실패 시 null) */
  dayOfWeek: string | null;
  /** 학생의 등록된 치료 요일 목록 */
  expectedDays: string[];
  /** 일치 여부 */
  isValid: boolean;
}

/**
 * 결제 날짜 배열 전체를 검증하여 ValidationResult 배열을 반환합니다.
 *
 * @param paymentDates 결제 날짜 문자열 배열
 * @param scheduleDay  학생의 schedule.day (예: "화, 목")
 */
export function validatePaymentDates(
  paymentDates: string[],
  scheduleDay: string
): ValidationResult[] {
  const expectedDays = parseScheduleDays(scheduleDay);

  return paymentDates.map((date) => {
    const dayOfWeek = getKoreanDayOfWeek(date);

    // 등록된 요일이 없으면 검증 불가 → isValid = true 처리 (경고 없음)
    if (expectedDays.length === 0) {
      return { date, dayOfWeek, expectedDays, isValid: true };
    }

    const isValid = dayOfWeek !== null && expectedDays.includes(dayOfWeek);
    return { date, dayOfWeek, expectedDays, isValid };
  });
}

/**
 * 학생별 불일치 개수만 빠르게 반환합니다.
 * (사이드바 뱃지 표시용)
 */
export function countInvalidDates(
  paymentDates: string[],
  scheduleDay: string
): number {
  if (!scheduleDay) return 0;
  const results = validatePaymentDates(paymentDates, scheduleDay);
  return results.filter((r) => !r.isValid).length;
}
