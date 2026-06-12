import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DocumentPreview } from '../components/docs/DocumentPreview';

// Mock child components
vi.mock('../components/AnnualPlan', () => ({
  AnnualPlan: () => <div data-testid="annual-plan">Annual Plan</div>,
}));

vi.mock('../components/MonthlyJournal', () => ({
  MonthlyJournal: () => <div data-testid="monthly-journal">Monthly Journal</div>,
}));

vi.mock('../components/common/LoadingOverlay', () => ({
  LoadingOverlay: () => <div data-testid="loading-overlay">Loading...</div>,
}));

describe('DocumentPreview', () => {
  const mockStudent = {
    id: '1',
    name: '홍길동',
    birthDate: '13.01.10',
    school: '서울초등학교',
    disabilityType: '언어장애',
    treatmentArea: '언어치료',
    schedule: { day: '화, 목', time: '14:00-14:50', frequency: '2' },
    startDate: '2026.03',
    therapistName: '김치료사',
    paymentDates: ['2026-04-01', '2026-04-08'],
  };

  const mockAnnualData = {
    currentLevel: ['현행 수준 1', '현행 수준 2'],
    longTermGoals: ['장기 목표 1'],
    monthlyGoals: [{ month: 4, goal: '4월 목표', content: '4월 치료 내용' }],
  };

  const mockMonthlyData = {
    currentLevel: '현행 수준',
    monthlyGoal: '월별 목표',
    sessions: [
      { date: '2026-04-01', content: '치료 내용', reaction: '아동 반응', consultation: '가정 연계' },
    ],
    result: '치료 결과',
  };

  it('학생 미선택 시 안내 메시지 표시', () => {
    render(
      <DocumentPreview
        selectedStudent={null}
        activeTab="annual"
        annualData={null}
        monthlyData={null}
        isLoading={false}
        selectedYear={2026}
        selectedMonth={4}
      />
    );
    
    expect(screen.getByText('학생을 선택해 주세요')).toBeInTheDocument();
  });

  it('로딩 중일 때 로딩 오버레이 표시', () => {
    render(
      <DocumentPreview
        selectedStudent={mockStudent}
        activeTab="annual"
        annualData={null}
        monthlyData={null}
        isLoading={true}
        selectedYear={2026}
        selectedMonth={4}
      />
    );
    
    expect(screen.getByTestId('loading-overlay')).toBeInTheDocument();
  });

  it('연간계획서 탭에서 AnnualPlan 컴포넌트 표시', () => {
    render(
      <DocumentPreview
        selectedStudent={mockStudent}
        activeTab="annual"
        annualData={mockAnnualData}
        monthlyData={null}
        isLoading={false}
        selectedYear={2026}
        selectedMonth={4}
      />
    );
    
    expect(screen.getByTestId('annual-plan')).toBeInTheDocument();
  });

  it('월별일지 탭에서 MonthlyJournal 컴포넌트 표시', () => {
    render(
      <DocumentPreview
        selectedStudent={mockStudent}
        activeTab="monthly"
        annualData={null}
        monthlyData={mockMonthlyData}
        isLoading={false}
        selectedYear={2026}
        selectedMonth={4}
      />
    );
    
    expect(screen.getByTestId('monthly-journal')).toBeInTheDocument();
  });

  it('데이터 없음 시 안내 메시지 표시', () => {
    render(
      <DocumentPreview
        selectedStudent={mockStudent}
        activeTab="annual"
        annualData={null}
        monthlyData={null}
        isLoading={false}
        selectedYear={2026}
        selectedMonth={4}
      />
    );
    
    expect(screen.getByText('서류 데이터를 생성할 수 없습니다.')).toBeInTheDocument();
  });
});
