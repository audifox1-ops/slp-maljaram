import { describe, it, expect } from 'vitest';
import { generateMockSessions, generateFallbackAnnualPlan } from '../services/mockDataService';

describe('mockDataService', () => {
  describe('generateMockSessions', () => {
    it('returns correct number of sessions', () => {
      const dates = ['2026-03-04', '2026-03-11', '2026-03-18', '2026-03-25'];
      const sessions = generateMockSessions(dates, '언어치료');
      expect(sessions).toHaveLength(4);
    });

    it('assigns correct dates to sessions', () => {
      const dates = ['2026-03-04', '2026-03-11'];
      const sessions = generateMockSessions(dates, '언어치료');
      expect(sessions[0].date).toBe('2026-03-04');
      expect(sessions[1].date).toBe('2026-03-11');
    });

    it('uses 언어치료 content for 언어치료 area', () => {
      const sessions = generateMockSessions(['2026-03-04'], '언어치료');
      expect(sessions[0].content).toBeTruthy();
      expect(sessions[0].reaction).toBeTruthy();
    });

    it('uses 미술치료 content for 미술치료 area', () => {
      const sessions = generateMockSessions(['2026-03-04'], '미술치료');
      expect(sessions[0].content).toBeTruthy();
      expect(sessions[0].reaction).toBeTruthy();
    });

    it('uses default content for unknown area', () => {
      const sessions = generateMockSessions(['2026-03-04'], '감각통합');
      expect(sessions[0].content).toBeTruthy();
    });

    it('prepends monthly goal to content when provided', () => {
      const goal = '조음 능력 향상';
      const sessions = generateMockSessions(['2026-03-04'], '언어치료', goal);
      expect(sessions[0].content).toContain('조음 능력 향상');
    });

    it('does not prepend goal when it is the default placeholder', () => {
      const goal = '연간계획서에 목표가 설정되지 않았습니다.';
      const sessions = generateMockSessions(['2026-03-04'], '언어치료', goal);
      expect(sessions[0].content).not.toContain('연간계획서에 목표가');
    });

    it('includes consultation text in every session', () => {
      const sessions = generateMockSessions(['2026-03-04', '2026-03-11'], '언어치료');
      sessions.forEach(s => {
        expect(s.consultation).toBeTruthy();
      });
    });

    it('handles empty dates array', () => {
      const sessions = generateMockSessions([], '언어치료');
      expect(sessions).toHaveLength(0);
    });

    it('cycles through content when more dates than templates', () => {
      const dates = Array.from({ length: 10 }, (_, i) => `2026-03-${String(i + 1).padStart(2, '0')}`);
      const sessions = generateMockSessions(dates, '언어치료');
      expect(sessions).toHaveLength(10);
      // Should have repeated content patterns
      expect(sessions[0].content).toBeTruthy();
      expect(sessions[6].content).toBeTruthy();
    });
  });

  describe('generateFallbackAnnualPlan', () => {
    it('returns valid annual plan structure', () => {
      const plan = generateFallbackAnnualPlan();
      expect(plan.currentLevel).toBeInstanceOf(Array);
      expect(plan.longTermGoals).toBeInstanceOf(Array);
      expect(plan.monthlyGoals).toBeInstanceOf(Array);
    });

    it('has 12 monthly goals', () => {
      const plan = generateFallbackAnnualPlan();
      expect(plan.monthlyGoals).toHaveLength(12);
    });

    it('monthly goals cover months 3-12, 1, 2', () => {
      const plan = generateFallbackAnnualPlan();
      const months = plan.monthlyGoals.map(g => g.month);
      expect(months).toEqual([3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2]);
    });

    it('each monthly goal has required fields', () => {
      const plan = generateFallbackAnnualPlan();
      plan.monthlyGoals.forEach(goal => {
        expect(typeof goal.month).toBe('number');
        expect(typeof goal.goal).toBe('string');
        expect(typeof goal.content).toBe('string');
      });
    });
  });
});
