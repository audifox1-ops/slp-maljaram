/**
 * 날짜 문자열 파싱 및 필터링 유틸리티
 */

interface ParsedDate {
  year: string;
  month: number;
  day: number;
}

/**
 * 다양한 한국어 날짜 형식을 파싱하여 { year, month, day }를 반환합니다.
 * 지원 형식: "2026-04-16", "2026. 04. 16", "26년 4월 16일", "2026/04/16", "260416" 등
 */
export function parseDateString(dateStr: string): ParsedDate | null {
  const dStr = String(dateStr).trim();
  if (!dStr) return null;

  // 1. 구분자가 있는 패턴 (-, ., /, 공백, 년/월/일 등)
  // 예: "2026-04-16", "2026. 04. 16", "2026년 4월 16일"
  const match = dStr.match(/(\d{2,4})[-./\s년]+(\d{1,2})[-./\s월]+(\d{1,2})/);
  if (match) {
    return { 
      year: match[1], 
      month: parseInt(match[2], 10),
      day: parseInt(match[3], 10)
    };
  }

  // 2. 구분자 없는 패턴 (YYMMDD 또는 YYYYMMDD)
  // 예: "260416", "20260416"
  const noSepMatch = dStr.match(/^(\d{2,4})(\d{2})(\d{2})$/);
  if (noSepMatch) {
    return { 
      year: noSepMatch[1], 
      month: parseInt(noSepMatch[2], 10),
      day: parseInt(noSepMatch[3], 10)
    };
  }

  // 3. 마지막 수단: 숫자만 추출하여 처리
  const numbers = dStr.match(/\d+/g);
  if (numbers && numbers.length >= 2) {
    return { 
      year: numbers[0], 
      month: parseInt(numbers[1], 10),
      day: numbers[2] ? parseInt(numbers[2], 10) : 1
    };
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

      // 연도 비교 (2자리 vs 4자리 대응)
      const yearMatch =
        parsed.year.length === 2
          ? yearStr.endsWith(parsed.year)
          : parsed.year === yearStr;
      
      // 월 비교
      const monthMatch = parsed.month === selectedMonth;

      return yearMatch && monthMatch;
    } catch (e) {
      console.error(`Date filtering error for "${d}":`, e);
      return false;
    }
  });
}

/**
 * 학생의 생년월일(YYMMDD 또는 YY.MM.DD)을 기반으로 만 나이와 학령기 정보를 계산합니다.
 */
export function calculateStudentAge(birthDate: string): {
  manAge: number;
  schoolStage: string;
} {
  const parsed = parseDateString(birthDate);
  if (!parsed) {
    return { manAge: 0, schoolStage: '정보 없음' };
  }

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const currentDay = new Date().getDate();

  // 연도 보정 (2000년대생 가정, 필요시 확장)
  let birthYear = parseInt(parsed.year, 10);
  if (parsed.year.length === 2) {
    birthYear += birthYear <= 30 ? 2000 : 1900;
  }

  // 만 나이 계산
  // 실제 나이는 생년월일 전체가 필요하므로 parseDateString을 보완하여 일(day)까지 추출
  const dateMatch = birthDate.match(/(\d{2,4})[-./\s년]*(\d{1,2})[-./\s월]*(\d{1,2})/);
  const birthDay = dateMatch ? parseInt(dateMatch[3], 10) : 1;
  
  let age = currentYear - birthYear;
  if (currentMonth < parsed.month || (currentMonth === parsed.month && currentDay < birthDay)) {
    age--;
  }

  // 학령기 판단
  let stage = '';
  if (age < 7) stage = '미취학';
  else if (age <= 12) stage = `초등학생(${age - 6}학년)`;
  else if (age <= 15) stage = `중학생(${age - 12}학년)`;
  else if (age <= 18) stage = `고등학생(${age - 15}학년)`;
  else stage = '성인';

  return { manAge: age, schoolStage: stage };
}
