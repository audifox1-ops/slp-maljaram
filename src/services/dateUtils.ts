/**
 * 날짜 문자열 파싱 및 필터링 유틸리티
 */

interface ParsedDate {
  year: string;
  month: number;
}

/**
 * 다양한 한국어 날짜 형식을 파싱하여 { year, month }를 반환합니다.
 * 지원 형식: "2026-04-16", "2026.04.16", "26년 4월 16일", "2026/04/16" 등
 */
export function parseDateString(dateStr: string): ParsedDate | null {
  const dStr = String(dateStr).trim();

  // YYYY(YY)[-./\s년]MM[-./\s월]DD 패턴
  const match = dStr.match(/(\d{2,4})[-./\s년]+(\d{1,2})[-./\s월]+(\d{1,2})/);
  if (match) {
    return { year: match[1], month: parseInt(match[2], 10) };
  }

  // 구분자 기반 폴백
  const parts = dStr.split(/[-./\s년월일]+/).filter(Boolean);
  if (parts.length >= 2) {
    return { year: parts[0], month: parseInt(parts[1], 10) };
  }

  return null;
}

/**
 * 결제 날짜 배열에서 특정 연도/월에 해당하는 날짜만 필터링합니다.
 */
export function filterDatesByYearMonth(
  dates: string[],
  selectedYear: number,
  selectedMonth: number
): string[] {
  const yearStr = selectedYear.toString();

  return dates.filter((d) => {
    try {
      const parsed = parseDateString(d);
      if (!parsed) return false;

      const yearMatch =
        parsed.year.length === 2
          ? yearStr.endsWith(parsed.year)
          : parsed.year === yearStr;
      const monthMatch = parsed.month === selectedMonth;

      return yearMatch && monthMatch;
    } catch {
      return false;
    }
  });
}
