import { describe, it, expect } from 'vitest';
import { calculateDashboardStats, formatNumber, formatAmount } from '../services/dashboardService';
import { StudentInfo, PaymentRecord } from '../types';

function makeStudent(overrides: Partial<StudentInfo> = {}): StudentInfo {
  return {
    name: '테스트',
    birthDate: '15.03.10',
    school: '테스트학교',
    disabilityType: '지적장애',
    treatmentArea: '언어치료',
    therapistName: '김치료사',
    schedule: { day: '화', time: '14:00', frequency: '1' },
    ...overrides,
  };
}

function makePayment(overrides: Partial<PaymentRecord> = {}): PaymentRecord {
  return {
    id: '1',
    studentName: '테스트',
    transactionDate: '2026-03-04',
    amount: 100000,
    treatmentArea: '언어치료',
    ...overrides,
  };
}

describe('dashboardService', () => {
  describe('calculateDashboardStats', () => {
    it('returns zero stats for empty arrays', () => {
      const stats = calculateDashboardStats([], []);
      expect(stats.totalStudents).toBe(0);
      expect(stats.totalPayments).toBe(0);
      expect(stats.scheduleComplete).toBe(0);
      expect(stats.scheduleIncomplete).toBe(0);
    });

    it('counts total students', () => {
      const students = [makeStudent({ name: 'A' }), makeStudent({ name: 'B' })];
      const stats = calculateDashboardStats(students, []);
      expect(stats.totalStudents).toBe(2);
    });

    it('counts total payments', () => {
      const payments = [makePayment({ id: '1' }), makePayment({ id: '2' })];
      const stats = calculateDashboardStats([], payments);
      expect(stats.totalPayments).toBe(2);
    });

    it('counts schedule complete vs incomplete', () => {
      const students = [
        makeStudent({ name: 'A', schedule: { day: '화', time: '14:00', frequency: '1' } }),
        makeStudent({ name: 'B', schedule: undefined }),
      ];
      const stats = calculateDashboardStats(students, []);
      expect(stats.scheduleComplete).toBe(1);
      expect(stats.scheduleIncomplete).toBe(1);
    });

    it('groups treatment areas correctly', () => {
      const students = [
        makeStudent({ name: 'A', treatmentArea: '언어치료' }),
        makeStudent({ name: 'B', treatmentArea: '언어치료' }),
        makeStudent({ name: 'C', treatmentArea: '미술치료' }),
      ];
      const stats = calculateDashboardStats(students, []);
      expect(stats.treatmentAreas).toHaveLength(2);
      expect(stats.treatmentAreas[0].area).toBe('언어치료');
      expect(stats.treatmentAreas[0].count).toBe(2);
    });

    it('groups disability types correctly', () => {
      const students = [
        makeStudent({ name: 'A', disabilityType: '지적장애' }),
        makeStudent({ name: 'B', disabilityType: '자폐성장애' }),
      ];
      const stats = calculateDashboardStats(students, []);
      expect(stats.disabilityTypes).toHaveLength(2);
    });

    it('returns monthly payments for 6 months', () => {
      const stats = calculateDashboardStats([], []);
      expect(stats.monthlyPayments).toHaveLength(6);
    });

    it('counts recent students (up to 5)', () => {
      const students = Array.from({ length: 8 }, (_, i) => makeStudent({ name: `학생${i}` }));
      const stats = calculateDashboardStats(students, []);
      expect(stats.recentStudents.length).toBeLessThanOrEqual(5);
    });

    it('groups therapists correctly', () => {
      const students = [
        makeStudent({ name: 'A', therapistName: '김치료사' }),
        makeStudent({ name: 'B', therapistName: '김치료사' }),
        makeStudent({ name: 'C', therapistName: '이치료사' }),
      ];
      const stats = calculateDashboardStats(students, []);
      expect(stats.topTherapists[0].name).toBe('김치료사');
      expect(stats.topTherapists[0].count).toBe(2);
    });
  });

  describe('formatNumber', () => {
    it('formats numbers with locale', () => {
      expect(formatNumber(1234)).toBe('1,234');
      expect(formatNumber(0)).toBe('0');
      expect(formatNumber(100000)).toBe('100,000');
    });
  });

  describe('formatAmount', () => {
    it('formats amounts under 10000', () => {
      expect(formatAmount(5000)).toBe('5,000원');
    });

    it('formats amounts 10000 and above in manwon', () => {
      expect(formatAmount(10000)).toBe('1.0만원');
      expect(formatAmount(50000)).toBe('5.0만원');
      expect(formatAmount(150000)).toBe('15.0만원');
    });
  });
});
