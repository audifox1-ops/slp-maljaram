/**
 * useDocumentGenerator 커스텀 훅
 * AI 서비스 호출, 날짜 필터링, Mock 폴백, 문서 생성 로직을 캡슐화합니다.
 */
import { useState, useCallback } from 'react';
import { Student, AnnualPlanData, MonthlyJournalData } from '../types';
import { useToast } from './useToast';
import { useDocumentPersistence } from './useDocumentPersistence';
import { generateAnnualPlan, generateMonthlyJournal } from '../services/aiService';
import { filterDatesByYearMonth } from '../services/dateUtils';
import {
  generateMockSessions,
  generateFallbackAnnualPlan,
} from '../services/mockDataService';

interface UseDocumentGeneratorReturn {
  annualData: AnnualPlanData | null;
  monthlyData: MonthlyJournalData | null;
  isLoading: boolean;
  fetchData: (student: Student) => Promise<void>;
  generateDraft: (student: Student) => Promise<void>;
  saveAnnualData: (student: Student, data: AnnualPlanData) => Promise<void>;
  saveMonthlyData: (student: Student, data: MonthlyJournalData) => Promise<void>;
}

export function useDocumentGenerator(
  selectedYear: number,
  selectedMonth: number
): UseDocumentGeneratorReturn {
  const { showToast } = useToast();
  const { 
    getAnnualPlan, 
    getMonthlyJournal, 
    saveAnnualPlan, 
    saveMonthlyJournal 
  } = useDocumentPersistence();
  const [annualData, setAnnualData] = useState<AnnualPlanData | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyJournalData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = useCallback(
    async (student: Student) => {
      setIsLoading(true);
      setAnnualData(null);
      setMonthlyData(null);

      try {
        // 1. 기존 데이터(Firestore) 조회 우선
        const [existingAnnual, existingMonthly] = await Promise.all([
          getAnnualPlan(student.name, selectedYear),
          getMonthlyJournal(student.name, selectedYear, selectedMonth)
        ]);

        let annual: AnnualPlanData | null = existingAnnual;
        let monthly: MonthlyJournalData | null = existingMonthly;

        // 날짜 필터링 (월별 일지 생성/보충용)
        const filteredDates = filterDatesByYearMonth(
          student.paymentDates,
          selectedYear,
          selectedMonth
        );

        // 2. 데이터가 없는 경우만 AI 또는 Mock 생성
        if (!annual || (!monthly && filteredDates.length > 0)) {
          const studentWithFilteredDates = {
            ...student,
            paymentDates: filteredDates,
          };

          try {
            // 연간 계획서가 없으면 AI 생성
            if (!annual) {
              annual = await generateAnnualPlan(student);
            }

            const monthlyGoal =
              annual.monthlyGoals.find((g) => g.month === selectedMonth)?.goal ||
              '연간계획서에 목표가 설정되지 않았습니다.';

            // 월별 일지가 없으면 AI 생성
            if (!monthly) {
              if (filteredDates.length > 0) {
                monthly = await generateMonthlyJournal(
                  studentWithFilteredDates,
                  selectedMonth,
                  monthlyGoal
                );
              } else {
                monthly = {
                  currentLevel: '해당 월의 치료 내역이 없습니다.',
                  monthlyGoal,
                  sessions: [],
                  result: '내역 없음',
                };
              }
            }
          } catch (aiError) {
            console.warn('AI generation failed, using mock data:', aiError);
            showToast({
              type: 'error',
              message: 'AI 생성에 실패하여 기본 양식(Mock)으로 대체되었습니다.',
            }, 4000);
            
            if (!annual) annual = generateFallbackAnnualPlan();

            const monthlyGoal =
              annual.monthlyGoals.find((g) => g.month === selectedMonth)?.goal ||
              '연간계획서에 목표가 설정되지 않았습니다.';

            if (!monthly) {
              monthly = {
                currentLevel: '현재 치료 목표에 따른 활동을 수행 중임.',
                monthlyGoal,
                sessions: generateMockSessions(
                  filteredDates,
                  student.treatmentArea,
                  monthlyGoal
                ),
                result: '긍정적인 변화가 관찰되며 지속적인 지도가 필요함.',
              };
            }
          }
        }

        if (!annual || !monthly) {
          throw new Error('데이터를 생성하거나 불러오지 못했습니다.');
        }

        // 3. AI가 생성한 결과물에 누락된 세션이 있다면 Mock으로 보충 (DB에서 불러온 경우는 보충하지 않음)
        if (!existingMonthly && monthly && monthly.sessions) {
          const monthlyGoal =
            annual.monthlyGoals.find((g) => g.month === selectedMonth)?.goal ||
            '연간계획서에 목표가 설정되지 않았습니다.';
          const sessionDates = new Set(monthly.sessions.map((s) => s.date));
          const missingDates = filteredDates.filter(
            (d) => !sessionDates.has(d)
          );

          if (missingDates.length > 0) {
            const mockMissing = generateMockSessions(
              missingDates,
              student.treatmentArea,
              monthlyGoal
            );
            monthly.sessions = [...monthly.sessions, ...mockMissing].sort(
              (a, b) => a.date.localeCompare(b.date)
            );
          }
        }

        setAnnualData(annual);
        setMonthlyData(monthly);
      } catch (error) {
        console.error('Data loading error:', error);
        showToast({
          type: 'error',
          message: '데이터를 불러오는 중 오류가 발생했습니다.',
        }, 3000);
      } finally {
        setIsLoading(false);
      }
    },
    [selectedYear, selectedMonth, getAnnualPlan, getMonthlyJournal, showToast]
  );

  const generateDraft = useCallback(
    async (student: Student) => {
      setIsLoading(true);
      try {
        // 가상 날짜 4개 생성 (주 1회)
        const virtualDates = [];
        for (let i = 1; i <= 4; i++) {
          const day = 7 * i - 3;
          virtualDates.push(
            `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          );
        }

        const studentWithVirtualDates = {
          ...student,
          paymentDates: virtualDates,
        };

        // 기존 연간 데이터가 없으면 새로 생성
        let currentAnnual = annualData;
        if (!currentAnnual) {
          currentAnnual = await generateAnnualPlan(student);
          setAnnualData(currentAnnual);
        }

        const monthlyGoal =
          currentAnnual.monthlyGoals.find((g) => g.month === selectedMonth)
            ?.goal || '연간계획서에 목표가 설정되지 않았습니다.';

        const monthly = await generateMonthlyJournal(
          studentWithVirtualDates,
          selectedMonth,
          monthlyGoal
        );
        setMonthlyData(monthly);

        showToast({
          type: 'success',
          message:
            '가상 일지가 생성되었습니다. (결제 내역이 없는 경우 임시로 생성됨)',
        });
      } catch (error) {
        console.error('Draft generation failed:', error);
        showToast({
          type: 'error',
          message: '가상 일지 생성 중 오류가 발생했습니다.',
        });
      } finally {
        setIsLoading(false);
      }
    },
    [selectedYear, selectedMonth, annualData, saveMonthlyJournal, showToast]
  );

  const saveAnnualData = useCallback(async (student: Student, data: AnnualPlanData) => {
    try {
      await saveAnnualPlan(student.name, selectedYear, data);
      setAnnualData(data);
      showToast({
        type: 'success',
        message: '연간 계획서가 저장되었습니다.',
      });
    } catch (err) {
      console.error('Failed to save annual plan:', err);
      showToast({
        type: 'error',
        message: '저장 중 오류가 발생했습니다.',
      });
    }
  }, [selectedYear, saveAnnualPlan, showToast]);

  const saveMonthlyData = useCallback(async (student: Student, data: MonthlyJournalData) => {
    try {
      await saveMonthlyJournal(student.name, selectedYear, selectedMonth, data);
      setMonthlyData(data);
      showToast({
        type: 'success',
        message: '월별 일지가 저장되었습니다.',
      });
    } catch (err) {
      console.error('Failed to save monthly journal:', err);
      showToast({
        type: 'error',
        message: '저장 중 오류가 발생했습니다.',
      });
    }
  }, [selectedYear, selectedMonth, saveMonthlyJournal, showToast]);

  return {
    annualData,
    monthlyData,
    isLoading,
    fetchData,
    generateDraft,
    saveAnnualData,
    saveMonthlyData,
  };
}
