import React, { useState, useEffect } from 'react';
import { Edit2, Save, X } from 'lucide-react';
import { Student, AnnualPlanData } from '../types';

interface Props {
  student: Student;
  data: AnnualPlanData;
  year: number;
  onSave?: (newData: AnnualPlanData) => void;
}

export const AnnualPlan: React.FC<Props> = ({ student, data, year, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<AnnualPlanData>(data);

  useEffect(() => {
    setEditedData(data);
  }, [data]);

  const handleSave = () => {
    if (onSave) {
      onSave(editedData);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedData(data);
    setIsEditing(false);
  };

  const updateGoal = (index: number, field: 'goal' | 'content', value: string) => {
    const newMonthlyGoals = [...editedData.monthlyGoals];
    newMonthlyGoals[index] = { ...newMonthlyGoals[index], [field]: value };
    setEditedData({ ...editedData, monthlyGoals: newMonthlyGoals });
  };

  const updateList = (field: 'currentLevel' | 'longTermGoals', index: number, value: string) => {
    const newList = [...editedData[field]];
    newList[index] = value;
    setEditedData({ ...editedData, [field]: newList });
  };

  return (
    <div className="bg-white w-full max-w-[210mm] mx-auto font-sans text-black p-4 sm:p-[10mm] md:p-[15mm] box-border document-container print:p-0 relative group">
      {/* Action Buttons */}
      <div className="absolute top-4 right-4 no-print flex gap-2">
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors text-sm font-bold"
          >
            <Edit2 className="w-3.5 h-3.5" />
            편집 시작
          </button>
        ) : (
          <>
            <button
              onClick={handleSave}
              className="flex items-center gap-1 px-3 py-1.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm font-bold shadow-sm"
            >
              <Save className="w-3.5 h-3.5" />
              저장
            </button>
            <button
              onClick={handleCancel}
              className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors text-sm font-bold"
            >
              <X className="w-3.5 h-3.5" />
              취소
            </button>
          </>
        )}
      </div>

      {/* Header Section */}
      <div className="flex justify-between items-start mb-6 pt-4">
        <div className="flex-1 text-center pt-6">
          <h2 className="text-2xl font-bold tracking-[1px]">{year}. 교육청 치료지원 대상 연간 계획서</h2>
        </div>
        <table className="border-collapse border border-black text-[0.7rem] w-32">
          <tbody>
            <tr>
              <td rowSpan={2} className="border border-black p-1 text-center bg-slate-50 w-6">결<br/>재</td>
              <td className="border border-black p-1 text-center bg-slate-50">기관장</td>
              <td className="border border-black p-1 text-center bg-slate-50">치료사</td>
            </tr>
            <tr>
              <td className="border border-black h-12"></td>
              <td className="border border-black h-12"></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Basic Info Table */}
      <table className="w-full border-collapse border border-black text-[0.8rem] mb-8">
        <thead>
          <tr className="bg-slate-100">
            <th className="border border-black p-2 w-[12%]">학생명</th>
            <th className="border border-black p-2 w-[15%]">생년월일</th>
            <th className="border border-black p-2 w-[18%]">소속 학교<br/>(유치원)</th>
            <th className="border border-black p-2 w-[18%]">장애 유형</th>
            <th className="border border-black p-2 w-[15%]">치료 영역</th>
            <th className="border border-black p-2 w-[22%]">치료 일정</th>
          </tr>
        </thead>
        <tbody>
          <tr className="h-24">
            <td className="border border-black p-2 text-center font-bold">{student.name}</td>
            <td className="border border-black p-2 text-center">{student.birthDate}</td>
            <td className="border border-black p-2 text-center">{student.school}</td>
            <td className="border border-black p-2 text-center">
              {student.disabilityType || '-'}
            </td>
            <td className="border border-black p-2 text-center">
              <div className="font-bold mb-2">{student.treatmentArea}</div>
              <div className="bg-slate-100 p-1 text-[0.65rem] border-t border-black">
                복지부 바우처<br/>이용 영역
              </div>
            </td>
            <td className="border border-black p-0">
              <table className="w-full h-full border-collapse">
                <tbody className="text-[0.7rem]">
                  <tr>
                    <td className="p-1 border-b border-r border-black bg-slate-50 w-16">치료 기간</td>
                    <td className="p-1 border-b border-black font-bold">{year}.3.~</td>
                  </tr>
                  <tr>
                    <td className="p-1 border-b border-r border-black bg-slate-50">치료사</td>
                    <td className="p-1 border-b border-black font-bold">{student.therapistName}</td>
                  </tr>
                  <tr>
                    <td className="p-1 border-b border-r border-black bg-slate-50">요일</td>
                    <td className="p-1 border-b border-black font-bold">{student.schedule.day}</td>
                  </tr>
                  <tr>
                    <td className="p-1 border-b border-r border-black bg-slate-50">시간</td>
                    <td className="p-1 border-b border-black font-bold">{student.schedule.time}</td>
                  </tr>
                  <tr>
                    <td className="p-1 border-r border-black bg-slate-50">횟수</td>
                    <td className="p-1 font-bold">주 {student.schedule.frequency} 회</td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>

      {/* 현행 수준 */}
      <div className="mb-6 border border-black">
        <div className="bg-slate-50 p-2 font-bold border-b border-black text-[0.85rem]">**[현행 수준]**</div>
        <div className="p-3 text-[0.85rem] leading-relaxed min-h-[80px]">
          <ul className="list-disc list-inside space-y-1">
            {editedData.currentLevel.map((item, idx) => (
              <li key={idx}>
                {isEditing ? (
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => updateList('currentLevel', idx, e.target.value)}
                    className="w-[90%] border-b border-slate-300 focus:border-primary outline-none px-1"
                  />
                ) : (
                  item
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 장기 목표 */}
      <div className="mb-6 border border-black">
        <div className="bg-slate-50 p-2 font-bold border-b border-black text-[0.85rem]">**[장기 치료 목표]**</div>
        <div className="p-3 text-[0.85rem] leading-relaxed min-h-[80px]">
          <ul className="list-disc list-inside space-y-1">
            {editedData.longTermGoals.map((item, idx) => (
              <li key={idx}>
                {isEditing ? (
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => updateList('longTermGoals', idx, e.target.value)}
                    className="w-[90%] border-b border-slate-300 focus:border-primary outline-none px-1"
                  />
                ) : (
                  item
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 연간 계획 */}
      <div className="border border-black">
        <div className="bg-slate-50 p-2 font-bold border-b border-black text-[0.85rem]">**[연간 치료 계획]**</div>
        <table className="w-full border-collapse text-[0.8rem]">
          <thead>
            <tr className="bg-slate-50">
              <th className="border-b border-r border-black p-2 w-12 text-center">월</th>
              <th className="border-b border-r border-black p-2 text-center">단기 목표(월 목표)</th>
              <th className="border-b border-r border-black p-2 text-center">치료 내용</th>
              <th className="border-b border-black p-2 w-16 text-center">비고</th>
            </tr>
          </thead>
          <tbody>
            {editedData.monthlyGoals.map((goal, idx) => (
              <tr key={idx} className="h-10">
                <td className="border-b border-r border-black p-2 text-center font-bold">{goal.month}월</td>
                <td className="border-b border-r border-black p-2">
                  {isEditing ? (
                    <textarea
                      value={goal.goal}
                      onChange={(e) => updateGoal(idx, 'goal', e.target.value)}
                      className="w-full resize-none border-none focus:ring-1 focus:ring-primary h-12 p-1"
                    />
                  ) : (
                    goal.goal
                  )}
                </td>
                <td className="border-b border-r border-black p-2">
                  {isEditing ? (
                    <textarea
                      value={goal.content}
                      onChange={(e) => updateGoal(idx, 'content', e.target.value)}
                      className="w-full resize-none border-none focus:ring-1 focus:ring-primary h-12 p-1"
                    />
                  ) : (
                    goal.content
                  )}
                </td>
                <td className="border-b border-black p-2"></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
