/**
 * Dashboard 컴포넌트
 * 통계, 차트, 활동 내역을 표시하는 대시보드
 */
import React, { useMemo } from 'react';
import { 
  Users, FileText, Calendar, AlertTriangle, 
  TrendingUp, Activity, Clock, CheckCircle,
  BarChart3, PieChart, ArrowRight
} from 'lucide-react';
import { motion } from 'motion/react';
import { StudentInfo, PaymentRecord } from '../../types';
import { 
  calculateDashboardStats, 
  formatNumber, 
  formatAmount,
  DashboardStats 
} from '../../services/dashboardService';

interface DashboardProps {
  studentInfos: StudentInfo[];
  paymentRecords: PaymentRecord[];
  onNavigateToStudents: () => void;
  onNavigateToDocs: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  studentInfos,
  paymentRecords,
  onNavigateToStudents,
  onNavigateToDocs,
}) => {
  const stats = useMemo(
    () => calculateDashboardStats(studentInfos, paymentRecords),
    [studentInfos, paymentRecords]
  );

  // 최대값 계산 (차트 스케일링용)
  const maxMonthlyCount = useMemo(
    () => Math.max(...stats.monthlyPayments.map((m) => m.count), 1),
    [stats.monthlyPayments]
  );

  return (
    <div className="min-h-screen bg-bg-theme p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-text-main tracking-tight">대시보드</h1>
          <p className="text-text-muted mt-1">치료 현황 및 학생 관리 요약</p>
        </div>

        {/* 주요 통계 카드 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-5 border border-border-theme shadow-sm"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-xs font-bold text-text-muted uppercase">전체 학생</span>
            </div>
            <p className="text-3xl font-black text-text-main">{formatNumber(stats.totalStudents)}</p>
            <p className="text-xs text-text-muted mt-1">등록된 학생 수</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-5 border border-border-theme shadow-sm"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-xs font-bold text-text-muted uppercase">결제 내역</span>
            </div>
            <p className="text-3xl font-black text-text-main">{formatNumber(stats.totalPayments)}</p>
            <p className="text-xs text-text-muted mt-1">등록된 결제 건수</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl p-5 border border-border-theme shadow-sm"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
              </div>
              <span className="text-xs font-bold text-text-muted uppercase">일정 설정 완료</span>
            </div>
            <p className="text-3xl font-black text-emerald-600">{formatNumber(stats.scheduleComplete)}</p>
            <p className="text-xs text-text-muted mt-1">치료 일정 입력 완료</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl p-5 border border-border-theme shadow-sm"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <span className="text-xs font-bold text-text-muted uppercase">일정 미입력</span>
            </div>
            <p className="text-3xl font-black text-amber-600">{formatNumber(stats.scheduleIncomplete)}</p>
            <p className="text-xs text-text-muted mt-1">치료 일정 입력 필요</p>
          </motion.div>
        </div>

        {/* 차트 영역 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* 월별 결제 추이 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-2xl p-6 border border-border-theme shadow-sm"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-text-main">월별 결제 추이</h3>
              </div>
              <span className="text-xs text-text-muted">최근 6개월</span>
            </div>
            
            <div className="flex items-end justify-between h-40 gap-2">
              {stats.monthlyPayments.map((month, index) => (
                <div key={month.month} className="flex-1 flex flex-col items-center">
                  <div className="w-full bg-slate-100 rounded-t-lg relative" style={{ height: '120px' }}>
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${(month.count / maxMonthlyCount) * 100}%` }}
                      transition={{ delay: 0.6 + index * 0.1, duration: 0.5 }}
                      className="absolute bottom-0 w-full bg-gradient-to-t from-primary to-primary-light rounded-t-lg"
                    />
                  </div>
                  <span className="text-xs font-bold text-text-muted mt-2">{month.month}</span>
                  <span className="text-xs text-text-main">{month.count}건</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* 치료 영역 분포 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-2xl p-6 border border-border-theme shadow-sm"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <PieChart className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-text-main">치료 영역 분포</h3>
              </div>
            </div>
            
            <div className="space-y-3">
              {stats.treatmentAreas.slice(0, 5).map((area, index) => {
                const percentage = (area.count / stats.totalStudents) * 100;
                const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-amber-500', 'bg-rose-500'];
                return (
                  <div key={area.area} className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${colors[index % colors.length]}`} />
                    <span className="text-sm font-medium text-text-main flex-1">{area.area}</span>
                    <span className="text-sm font-bold text-text-main">{area.count}명</span>
                    <span className="text-xs text-text-muted w-12 text-right">{percentage.toFixed(0)}%</span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* 하단 영역 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 장애 유형 분포 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white rounded-2xl p-6 border border-border-theme shadow-sm"
          >
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-text-main">장애 유형 분포</h3>
            </div>
            
            <div className="space-y-2">
              {stats.disabilityTypes.slice(0, 6).map((type) => (
                <div key={type.type} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                  <span className="text-sm text-text-main">{type.type}</span>
                  <span className="text-sm font-bold text-primary">{type.count}명</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* 담당 치료사별 현황 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-white rounded-2xl p-6 border border-border-theme shadow-sm"
          >
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-text-main">담당 치료사별 현황</h3>
            </div>
            
            <div className="space-y-2">
              {stats.topTherapists.map((therapist) => (
                <div key={therapist.name} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                  <span className="text-sm text-text-main">{therapist.name}</span>
                  <span className="text-sm font-bold text-primary">{therapist.count}명</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* 빠른 이동 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="bg-white rounded-2xl p-6 border border-border-theme shadow-sm"
          >
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-text-main">빠른 이동</h3>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={onNavigateToStudents}
                className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-text-main">학생 정보 관리</span>
                </div>
                <ArrowRight className="w-4 h-4 text-text-muted" />
              </button>
              
              <button
                onClick={onNavigateToDocs}
                className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-sm font-medium text-text-main">서류 생성</span>
                </div>
                <ArrowRight className="w-4 h-4 text-text-muted" />
              </button>

              <button
                onClick={() => {
                  const incompleteStudents = studentInfos.filter(
                    (s) => !s.schedule?.day || !s.schedule?.time
                  );
                  if (incompleteStudents.length > 0) {
                    onNavigateToStudents();
                  }
                }}
                className="w-full flex items-center justify-between p-3 bg-amber-50 hover:bg-amber-100 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-text-main block">일정 미입력 학생</span>
                    <span className="text-xs text-amber-600">{stats.scheduleIncomplete}명</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-amber-500" />
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
