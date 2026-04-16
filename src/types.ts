export interface StudentInfo {
  name: string;
  birthDate: string;
  school: string;
  disabilityType: string;
  treatmentArea: string;
  therapistName: string;
  observations?: string;
}

export interface Student {
  id: string;
  name: string;
  birthDate: string;
  school: string;
  disabilityType: string;
  treatmentArea: string;
  schedule: {
    day: string;
    time: string;
    frequency: string;
  };
  startDate: string;
  therapistName: string;
  voucherArea?: string;
  paymentDates: string[]; // List of dates for the monthly journal
  observations?: string;
}

export interface AnnualPlanData {
  currentLevel: string[];
  longTermGoals: string[];
  monthlyGoals: {
    month: number;
    goal: string;
    content: string;
  }[];
}

export interface MonthlyJournalData {
  currentLevel: string;
  monthlyGoal: string;
  sessions: {
    date: string;
    content: string;
    reaction: string;
    consultation: string;
  }[];
  result: string;
}

export interface RawRecord {
  '학생이름': string;
  '거래일자': string;
  '금액'?: string | number;
  '지원영역'?: string;
  '소속 학교'?: string;
  '생년월일'?: string;
  '장애유형'?: string;
  '치료사명'?: string;
  [key: string]: any;
}

export interface PaymentRecord {
  id: string;
  studentName: string;
  transactionDate: string;
  amount: string | number;
  treatmentArea: string;
  createdAt?: any;
}

export interface UploadStatus {
  type: 'success' | 'error';
  message: string;
}
