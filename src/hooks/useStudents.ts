/**
 * useStudents 커스텀 훅
 * Firestore 'students' 컬렉션 구독 및 CRUD 연산을 캡슐화합니다.
 */
import { useState, useEffect } from 'react';
import { StudentInfo, RawRecord } from '../types';
import { useToast } from './useToast';
import { db, OperationType, handleFirestoreError } from '../firebase';
import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  deleteDoc,
} from 'firebase/firestore';

interface UseStudentsReturn {
  studentInfos: StudentInfo[];
  addStudent: (info: StudentInfo) => Promise<void>;
  updateStudent: (oldName: string, info: StudentInfo) => Promise<void>;
  deleteStudent: (name: string) => Promise<void>;
  autoRegister: (name: string, rawRecords: RawRecord[]) => Promise<void>;
}

export function useStudents(): UseStudentsReturn {
  const { showToast } = useToast();
  const [studentInfos, setStudentInfos] = useState<StudentInfo[]>([]);

  // Firestore 실시간 구독
  useEffect(() => {
    const q = collection(db, 'students');
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const infos = snapshot.docs.map((d) => d.data() as StudentInfo);
        setStudentInfos(infos);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'students')
    );
    return () => unsub();
  }, []);

  const addStudent = async (info: StudentInfo) => {
    if (studentInfos.some((s) => s.name === info.name)) {
      showToast({
        type: 'error',
        message: '이미 등록된 학생 이름입니다.',
      });
      return;
    }
    try {
      await setDoc(doc(db, 'students', info.name), info);
      showToast({
        type: 'success',
        message: '학생 정보가 등록되었습니다.',
      });
    } catch (err) {
      showToast({ type: 'error', message: '학생 정보 등록에 실패했습니다.' });
      handleFirestoreError(err, OperationType.CREATE, 'students');
    }
  };

  const updateStudent = async (oldName: string, info: StudentInfo) => {
    try {
      if (oldName !== info.name) {
        await deleteDoc(doc(db, 'students', oldName));
        await setDoc(doc(db, 'students', info.name), info);
      } else {
        await setDoc(doc(db, 'students', info.name), info);
      }
      showToast({
        type: 'success',
        message: '학생 정보가 수정되었습니다.',
      });
    } catch (err) {
      showToast({ type: 'error', message: '학생 정보 수정에 실패했습니다.' });
      handleFirestoreError(err, OperationType.UPDATE, 'students');
    }
  };

  const deleteStudent = async (name: string) => {
    if (window.confirm(`${name} 학생의 정보를 삭제하시겠습니까?`)) {
      try {
        await deleteDoc(doc(db, 'students', name));
        showToast({
          type: 'success',
          message: '학생 정보가 삭제되었습니다.',
        });
      } catch (err) {
        showToast({ type: 'error', message: '학생 정보 삭제에 실패했습니다.' });
        handleFirestoreError(err, OperationType.DELETE, 'students');
      }
    }
  };

  const autoRegister = async (name: string, rawRecords: RawRecord[]) => {
    if (studentInfos.some((s) => s.name === name)) {
      showToast({
        type: 'error',
        message: '이미 등록된 학생입니다.',
      });
      return;
    }

    const studentRecords = rawRecords.filter((r) => {
      const rName = String(
        r['학생이름'] ||
          r['학생 이름'] ||
          r['이름'] ||
          r['성명'] ||
          r['성함'] ||
          r['대상자'] ||
          r['대상자명'] ||
          ''
      ).trim();
      return rName === name;
    });

    if (studentRecords.length > 0) {
      const first = studentRecords[0];
      const newInfo: StudentInfo = {
        name,
        birthDate: String(
          first['생년월일'] ||
            first['생년 월일'] ||
            first['생년'] ||
            first['생일'] ||
            ''
        ),
        school: String(
          first['소속 학교'] ||
            first['소속학교'] ||
            first['학교'] ||
            first['소속'] ||
            first['기관'] ||
            ''
        ),
        disabilityType: String(
          first['장애유형'] ||
            first['장애 유형'] ||
            first['장애'] ||
            first['진단명'] ||
            ''
        ),
        treatmentArea: String(
          first['지원영역'] ||
            first['지원 영역'] ||
            first['치료영역'] ||
            first['영역'] ||
            first['서비스'] ||
            '언어치료'
        ),
        therapistName: String(
          first['치료사명'] ||
            first['치료사'] ||
            first['담당자'] ||
            first['재활사'] ||
            ''
        ),
      };

      try {
        await setDoc(doc(db, 'students', name), newInfo);
        showToast({
          type: 'success',
          message: '학생 정보가 등록되었습니다. [학생 정보 관리] 탭에서 나머지 정보를 수정해 주세요.',
        }, 5000);
      } catch (err) {
        showToast({ type: 'error', message: '학생 자동 등록에 실패했습니다.' }, 5000);
        handleFirestoreError(err, OperationType.CREATE, 'students');
      }
    }
  };

  return {
    studentInfos,
    addStudent,
    updateStudent,
    deleteStudent,
    autoRegister,
  };
}
