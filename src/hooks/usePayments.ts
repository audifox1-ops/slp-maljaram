/**
 * usePayments 커스텀 훅
 * Firestore 'payment_records' 컬렉션 구독 및 저장/초기화 로직을 캡슐화합니다.
 */
import { useState, useEffect, useRef } from 'react';
import { PaymentRecord, RawRecord } from '../types';
import { useToast } from './useToast';
import { db, OperationType, handleFirestoreError } from '../firebase';
import {
  collection,
  onSnapshot,
  doc,
  getDocs,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';
import {
  extractStudentName,
  extractTransactionDate,
  extractTreatmentArea,
} from '../services/fileParserService';

interface UsePaymentsReturn {
  allPaymentRecords: PaymentRecord[];
  saveRecords: (records: RawRecord[]) => Promise<void>;
  resetAllData: () => Promise<void>;
}

export function usePayments(
  setIsLoading: (loading: boolean) => void
): UsePaymentsReturn {
  const { showToast } = useToast();
  const [allPaymentRecords, setAllPaymentRecords] = useState<PaymentRecord[]>([]);
  const hasInitialLoaded = useRef(false);

  // Firestore 실시간 구독
  useEffect(() => {
    const q = collection(db, 'payment_records');
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const records = snapshot.docs.map(
          (d) => ({ id: d.id, ...d.data() } as PaymentRecord)
        );
        setAllPaymentRecords(records);

        // 초기 로드 알림
        if (!hasInitialLoaded.current && records.length > 0) {
          showToast({
            type: 'success',
            message: `기존 치료/결제 내역 ${records.length}건을 불러왔습니다.`,
          }, 4000);
          hasInitialLoaded.current = true;
        } else if (
          !hasInitialLoaded.current &&
          snapshot.metadata.fromCache === false
        ) {
          hasInitialLoaded.current = true;
        }
      },
      (err) => {
        console.error(err);
        showToast({ type: 'error', message: '결제 내역을 불러오는데 실패했습니다.' }, 3000);
      }
    );
    return () => unsub();
  }, []);

  const saveRecords = async (records: RawRecord[]) => {
    setIsLoading(true);
    let addedCount = 0;
    let duplicateCount = 0;

    try {
      let batch = writeBatch(db);
      let currentBatchCount = 0;

      for (const record of records) {
        const name = extractStudentName(record);
        const date = extractTransactionDate(record);
        const amount = record['금액'] || 0;
        const area = extractTreatmentArea(record);

        // 중복 검사
        const isDuplicate = allPaymentRecords.some(
          (r) =>
            r.studentName === name &&
            r.transactionDate === date &&
            String(r.amount) === String(amount) &&
            r.treatmentArea === area
        );

        if (isDuplicate) {
          duplicateCount++;
          continue;
        }

        const newRecordRef = doc(collection(db, 'payment_records'));
        batch.set(newRecordRef, {
          studentName: name,
          transactionDate: date,
          amount,
          treatmentArea: area,
          createdAt: serverTimestamp(),
        });
        addedCount++;
        currentBatchCount++;

        if (currentBatchCount === 500) {
          await batch.commit();
          batch = writeBatch(db);
          currentBatchCount = 0;
        }
      }

      if (currentBatchCount > 0) {
        await batch.commit();
      }

      showToast({
        type: 'success',
        message: `총 ${addedCount}건이 업로드되었으며, ${duplicateCount}건의 중복 데이터는 제외되었습니다.`,
      });
    } catch (err) {
      console.error(err);
      showToast({ type: 'error', message: '결제 내역 저장에 실패했습니다.' });
    } finally {
      setIsLoading(false);
    }
  };

  const resetAllData = async () => {
    if (
      !window.confirm(
        '정말 모든 데이터를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.'
      )
    )
      return;

    setIsLoading(true);
    try {
      const q = collection(db, 'payment_records');
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        showToast({
          type: 'error',
          message: '삭제할 데이터가 없습니다.',
        });
      }

      const batches = [];
      let batch = writeBatch(db);
      let count = 0;

      snapshot.docs.forEach((d) => {
        batch.delete(d.ref);
        count++;
        if (count === 500) {
          batches.push(batch.commit());
          batch = writeBatch(db);
          count = 0;
        }
      });

      if (count > 0) {
        batches.push(batch.commit());
      }
      
      await Promise.all(batches);

      showToast({
        type: 'success',
        message: '모든 데이터가 초기화되었습니다.',
      });
    } catch (err) {
      console.error('Reset failed:', err);
      showToast({
        type: 'error',
        message: '데이터 초기화 중 오류가 발생했습니다.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    allPaymentRecords,
    saveRecords,
    resetAllData,
  };
}
