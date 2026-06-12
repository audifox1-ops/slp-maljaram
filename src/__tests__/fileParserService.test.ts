import { describe, it, expect } from 'vitest';
import { 
  extractStudentName, 
  extractTransactionDate, 
  extractTreatmentArea 
} from '../services/fileParserService';

describe('extractStudentName', () => {
  it('should extract name from 학생이름 field', () => {
    const record = { '학생이름': '홍길동', '거래일자': '2026-04-16' } as any;
    expect(extractStudentName(record)).toBe('홍길동');
  });

  it('should extract name from 이름 field', () => {
    const record = { '이름': '김철수', '거래일자': '2026-04-16' } as any;
    expect(extractStudentName(record)).toBe('김철수');
  });

  it('should extract name from 성명 field', () => {
    const record = { '성명': '이영희', '거래일자': '2026-04-16' } as any;
    expect(extractStudentName(record)).toBe('이영희');
  });

  it('should return empty string if no name field', () => {
    const record = { '거래일자': '2026-04-16' } as any;
    expect(extractStudentName(record)).toBe('');
  });

  it('should trim whitespace from name', () => {
    const record = { '학생이름': '  홍길동  ', '거래일자': '2026-04-16' } as any;
    expect(extractStudentName(record)).toBe('홍길동');
  });
});

describe('extractTransactionDate', () => {
  it('should extract date from 거래일자 field', () => {
    const record = { '학생이름': '홍길동', '거래일자': '2026-04-16' } as any;
    expect(extractTransactionDate(record)).toBe('2026-04-16');
  });

  it('should extract date from 날짜 field', () => {
    const record = { '학생이름': '홍길동', '날짜': '2026-04-16' } as any;
    expect(extractTransactionDate(record)).toBe('2026-04-16');
  });

  it('should extract date from 결제일 field', () => {
    const record = { '학생이름': '홍길동', '결제일': '2026-04-16' } as any;
    expect(extractTransactionDate(record)).toBe('2026-04-16');
  });

  it('should return empty string if no date field', () => {
    const record = { '학생이름': '홍길동' } as any;
    expect(extractTransactionDate(record)).toBe('');
  });
});

describe('extractTreatmentArea', () => {
  it('should extract area from 지원영역 field', () => {
    const record = { '학생이름': '홍길동', '지원영역': '언어치료' } as any;
    expect(extractTreatmentArea(record)).toBe('언어치료');
  });

  it('should extract area from 치료영역 field', () => {
    const record = { '학생이름': '홍길동', '치료영역': '미술치료' } as any;
    expect(extractTreatmentArea(record)).toBe('미술치료');
  });

  it('should return default value if no area field', () => {
    const record = { '학생이름': '홍길동' } as any;
    expect(extractTreatmentArea(record)).toBe('언어치료');
  });

  it('should trim whitespace from area', () => {
    const record = { '학생이름': '홍길동', '지원영역': '  미술치료  ' } as any;
    expect(extractTreatmentArea(record)).toBe('미술치료');
  });
});
