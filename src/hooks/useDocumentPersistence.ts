import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, OperationType, handleFirestoreError } from '../firebase';
import { AnnualPlanData, MonthlyJournalData } from '../types';

export function useDocumentPersistence() {
  const saveAnnualPlan = async (studentName: string, year: number, data: AnnualPlanData) => {
    try {
      const docId = `${studentName}_${year}`;
      await setDoc(doc(db, 'annual_plans', docId), {
        ...data,
        studentName,
        year,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'annual_plans');
    }
  };

  const getAnnualPlan = async (studentName: string, year: number): Promise<AnnualPlanData | null> => {
    try {
      const docId = `${studentName}_${year}`;
      const snap = await getDoc(doc(db, 'annual_plans', docId));
      if (snap.exists()) {
        const { studentName: _, year: __, updatedAt: ___, ...data } = snap.data();
        return data as AnnualPlanData;
      }
      return null;
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, 'annual_plans');
      return null;
    }
  };

  const saveMonthlyJournal = async (
    studentName: string,
    year: number,
    month: number,
    data: MonthlyJournalData
  ) => {
    try {
      const docId = `${studentName}_${year}_${month}`;
      await setDoc(doc(db, 'monthly_journals', docId), {
        ...data,
        studentName,
        year,
        month,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'monthly_journals');
    }
  };

  const getMonthlyJournal = async (
    studentName: string,
    year: number,
    month: number
  ): Promise<MonthlyJournalData | null> => {
    try {
      const docId = `${studentName}_${year}_${month}`;
      const snap = await getDoc(doc(db, 'monthly_journals', docId));
      if (snap.exists()) {
        const { studentName: _, year: __, month: ___, updatedAt: ____, ...data } = snap.data();
        return data as MonthlyJournalData;
      }
      return null;
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, 'monthly_journals');
      return null;
    }
  };

  return {
    saveAnnualPlan,
    getAnnualPlan,
    saveMonthlyJournal,
    getMonthlyJournal
  };
}
