/**
 * 대시보드 데이터 서비스
 * 통계 및 분석 데이터를 계산합니다.
 */
import { StudentInfo, PaymentRecord } from '../types';

export interface DashboardStats {
  totalStudents: number;
  totalPayments: number;
  scheduleComplete: number;
  scheduleIncomplete: number;
  treatmentAreas: { area: string; count: number }[];
  disabilityTypes: { type: string; count: number }[];
  monthlyPayments: { month: string; count: number; amount: number }[];
  recentStudents: { name: string; area: string; date: string }[];
  topTherapists: { name: string; count: number }[];
}

/**
 * 대시보드 통계를 계산합니다.
 */
export function calculateDashboardStats(
  studentInfos: StudentInfo[],
  paymentRecords: PaymentRecord[]
): DashboardStats {
  // 전체 학생 수
  const totalStudents = studentInfos.length;

  // 전체 결제 수
  const totalPayments = paymentRecords.length;

  // 치료 일정 완료/미완료
  const scheduleComplete = studentInfos.filter(
    (s) => s.schedule?.day && s.schedule?.time
  ).length;
  const scheduleIncomplete = totalStudents - scheduleComplete;

  // 치료 영역별 분포
  const areaCount: Record<string, number> = {};
  studentInfos.forEach((s) => {
    const area = s.treatmentArea || '미정';
    areaCount[area] = (areaCount[area] || 0) + 1;
  });
  const treatmentAreas = Object.entries(areaCount)
    .map(([area, count]) => ({ area, count }))
    .sort((a, b) => b.count - a.count);

  // 장애 유형별 분포
  const disabilityCount: Record<string, number> = {};
  studentInfos.forEach((s) => {
    const types = (s.disabilityType || '미정').split(',').map((t) => t.trim());
    types.forEach((type) => {
      if (type) {
        disabilityCount[type] = (disabilityCount[type] || 0) + 1;
      }
    });
  });
  const disabilityTypes = Object.entries(disabilityCount)
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count);

  // 월별 결제 추이 (최근 6개월)
  const monthlyPayments: { month: string; count: number; amount: number }[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const monthLabel = `${date.getMonth() + 1}월`;
    
    const monthRecords = paymentRecords.filter((r) => {
      const recordDate = r.transactionDate || '';
      return recordDate.startsWith(monthStr);
    });
    
    const totalAmount = monthRecords.reduce((sum, r) => {
      const amount = typeof r.amount === 'string' ? parseInt(r.amount.replace(/,/g, ''), 10) || 0 : r.amount || 0;
      return sum + amount;
    }, 0);

    monthlyPayments.push({
      month: monthLabel,
      count: monthRecords.length,
      amount: totalAmount,
    });
  }

  // 최근 등록 학생 (상위 5명)
  const recentStudents = studentInfos
    .slice(-5)
    .reverse()
    .map((s) => ({
      name: s.name,
      area: s.treatmentArea || '미정',
      date: s.birthDate || '미정',
    }));

  // 담당 치료사별 학생 수
  const therapistCount: Record<string, number> = {};
  studentInfos.forEach((s) => {
    const therapist = s.therapistName || '미정';
    therapistCount[therapist] = (therapistCount[therapist] || 0) + 1;
  });
  const topTherapists = Object.entries(therapistCount)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    totalStudents,
    totalPayments,
    scheduleComplete,
    scheduleIncomplete,
    treatmentAreas,
    disabilityTypes,
    monthlyPayments,
    recentStudents,
    topTherapists,
  };
}

/**
 * 숫자를 포맷합니다.
 */
export function formatNumber(num: number): string {
  return num.toLocaleString('ko-KR');
}

/**
 * 금액을 포맷합니다.
 */
export function formatAmount(amount: number): string {
  if (amount >= 10000) {
    return `${(amount / 10000).toFixed(1)}만원`;
  }
  return `${amount.toLocaleString('ko-KR')}원`;
}
