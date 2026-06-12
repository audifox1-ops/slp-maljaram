import { describe, it, expect } from 'vitest';
import { 
  getKoreanDayOfWeek, 
  parseScheduleDays, 
  validatePaymentDates, 
  countInvalidDates 
} from '../services/scheduleValidationService';

describe('getKoreanDayOfWeek', () => {
  it('should return 월 for Monday', () => {
    // 2026-04-20 is Monday
    expect(getKoreanDayOfWeek('2026-04-20')).toBe('월');
  });

  it('should return 화 for Tuesday', () => {
    // 2026-04-21 is Tuesday
    expect(getKoreanDayOfWeek('2026-04-21')).toBe('화');
  });

  it('should return 수 for Wednesday', () => {
    // 2026-04-22 is Wednesday
    expect(getKoreanDayOfWeek('2026-04-22')).toBe('수');
  });

  it('should return 목 for Thursday', () => {
    // 2026-04-23 is Thursday
    expect(getKoreanDayOfWeek('2026-04-23')).toBe('목');
  });

  it('should return 금 for Friday', () => {
    // 2026-04-24 is Friday
    expect(getKoreanDayOfWeek('2026-04-24')).toBe('금');
  });

  it('should return 토 for Saturday', () => {
    // 2026-04-25 is Saturday
    expect(getKoreanDayOfWeek('2026-04-25')).toBe('토');
  });

  it('should return 일 for Sunday', () => {
    // 2026-04-26 is Sunday
    expect(getKoreanDayOfWeek('2026-04-26')).toBe('일');
  });

  it('should return null for invalid date', () => {
    expect(getKoreanDayOfWeek('invalid')).toBeNull();
  });

  it('should handle 2-digit year', () => {
    // 13.01.10 is Thursday
    expect(getKoreanDayOfWeek('13.01.10')).toBe('목');
  });
});

describe('parseScheduleDays', () => {
  it('should parse "화, 목" to ["화", "목"]', () => {
    expect(parseScheduleDays('화, 목')).toEqual(['화', '목']);
  });

  it('should parse "화목" to ["화", "목"]', () => {
    expect(parseScheduleDays('화목')).toEqual(['화', '목']);
  });

  it('should parse "매주 화요일" correctly (includes 화)', () => {
    const result = parseScheduleDays('매주 화요일');
    expect(result).toContain('화');
  });

  it('should return empty array for empty string', () => {
    expect(parseScheduleDays('')).toEqual([]);
  });

  it('should parse "월,수,금" to ["월", "수", "금"]', () => {
    expect(parseScheduleDays('월,수,금')).toEqual(['월', '수', '금']);
  });
});

describe('validatePaymentDates', () => {
  it('should validate dates against schedule days', () => {
    const paymentDates = ['2026-04-21', '2026-04-23']; // 화, 목
    const scheduleDay = '화, 목';
    
    const results = validatePaymentDates(paymentDates, scheduleDay);
    expect(results).toHaveLength(2);
    expect(results[0].isValid).toBe(true);
    expect(results[1].isValid).toBe(true);
  });

  it('should mark invalid dates', () => {
    const paymentDates = ['2026-04-20', '2026-04-21']; // 월, 화
    const scheduleDay = '화, 목';
    
    const results = validatePaymentDates(paymentDates, scheduleDay);
    expect(results[0].isValid).toBe(false); // 월 is not in [화, 목]
    expect(results[1].isValid).toBe(true);  // 화 is in [화, 목]
  });

  it('should return all valid if no schedule days', () => {
    const paymentDates = ['2026-04-20', '2026-04-21'];
    const scheduleDay = '';
    
    const results = validatePaymentDates(paymentDates, scheduleDay);
    expect(results.every(r => r.isValid)).toBe(true);
  });

  it('should handle empty payment dates', () => {
    const results = validatePaymentDates([], '화, 목');
    expect(results).toHaveLength(0);
  });
});

describe('countInvalidDates', () => {
  it('should count invalid dates', () => {
    const paymentDates = ['2026-04-20', '2026-04-21', '2026-04-22']; // 월, 화, 수
    const scheduleDay = '화, 목';
    
    expect(countInvalidDates(paymentDates, scheduleDay)).toBe(2); // 월, 수 are invalid
  });

  it('should return 0 for empty schedule day', () => {
    const paymentDates = ['2026-04-20', '2026-04-21'];
    expect(countInvalidDates(paymentDates, '')).toBe(0);
  });

  it('should return 0 for empty payment dates', () => {
    expect(countInvalidDates([], '화, 목')).toBe(0);
  });
});
