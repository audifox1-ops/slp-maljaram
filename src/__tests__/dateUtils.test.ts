import { describe, it, expect } from 'vitest';
import { parseDateString, filterDatesByYearMonth, calculateStudentAge } from '../services/dateUtils';

describe('parseDateString', () => {
  it('should parse YYYY-MM-DD format', () => {
    const result = parseDateString('2026-04-16');
    expect(result).toEqual({ year: '2026', month: 4, day: 16 });
  });

  it('should parse YYYY.MM.DD format', () => {
    const result = parseDateString('2026. 04. 16');
    expect(result).toEqual({ year: '2026', month: 4, day: 16 });
  });

  it('should parse YY.MM.DD format', () => {
    const result = parseDateString('13.01.10');
    expect(result).toEqual({ year: '13', month: 1, day: 10 });
  });

  it('should parse YYYY/MM/DD format', () => {
    const result = parseDateString('2026/04/16');
    expect(result).toEqual({ year: '2026', month: 4, day: 16 });
  });

  it('should parse YYYYMMDD format without separators', () => {
    const result = parseDateString('20260416');
    expect(result).toEqual({ year: '2026', month: 4, day: 16 });
  });

  it('should parse YYMMDD format without separators', () => {
    const result = parseDateString('260416');
    expect(result).toEqual({ year: '26', month: 4, day: 16 });
  });

  it('should return null for empty string', () => {
    const result = parseDateString('');
    expect(result).toBeNull();
  });

  it('should return null for invalid format', () => {
    const result = parseDateString('invalid');
    expect(result).toBeNull();
  });
});

describe('filterDatesByYearMonth', () => {
  const dates = [
    '2026-03-15',
    '2026-04-10',
    '2026-04-20',
    '2026-05-05',
    '13.01.10',
    '13.02.15',
  ];

  it('should filter dates by year and month', () => {
    const result = filterDatesByYearMonth(dates, 2026, 4);
    expect(result).toEqual(['2026-04-10', '2026-04-20']);
  });

  it('should handle 2-digit year format', () => {
    const result = filterDatesByYearMonth(dates, 2013, 1);
    expect(result).toEqual(['13.01.10']);
  });

  it('should return empty array for no matches', () => {
    const result = filterDatesByYearMonth(dates, 2026, 6);
    expect(result).toEqual([]);
  });

  it('should handle empty dates array', () => {
    const result = filterDatesByYearMonth([], 2026, 4);
    expect(result).toEqual([]);
  });
});

describe('calculateStudentAge', () => {
  it('should calculate age correctly', () => {
    const result = calculateStudentAge('13.01.10');
    expect(result.manAge).toBeGreaterThanOrEqual(12);
    expect(result.manAge).toBeLessThanOrEqual(14);
  });

  it('should return school stage for school-age student', () => {
    const result = calculateStudentAge('13.01.10');
    expect(result.schoolStage).toMatch(/학생/);
  });

  it('should return school stage for pre-school student', () => {
    const result = calculateStudentAge('20.01.10');
    expect(result.schoolStage).toBe('미취학');
  });

  it('should handle invalid birth date', () => {
    const result = calculateStudentAge('invalid');
    expect(result.manAge).toBe(0);
    expect(result.schoolStage).toBe('정보 없음');
  });
});
