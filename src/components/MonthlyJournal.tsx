import React, { useState, useEffect } from 'react';
import { Edit2, Save, X } from 'lucide-react';
import { Student, MonthlyJournalData } from '../types';

interface Props {
  student: Student;
  data: MonthlyJournalData;
  month: number;
  year: number;
  onSave?: (newData: MonthlyJournalData) => void;
}

export const MonthlyJournal: React.FC<Props> = ({ student, data, month, year, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<MonthlyJournalData>(data);

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

  const updateSession = (index: number, field: keyof typeof editedData.sessions[0], value: string) => {
    const newSessions = [...editedData.sessions];
    newSessions[index] = { ...newSessions[index], [field]: value };
    setEditedData({ ...editedData, sessions: newSessions });
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
          <h2 className="text-2xl font-bold tracking-[1px]">{year}. 교육청 치료지원 대상 개별 치료 일지({month.toString().padStart(2, '0')})월</h2>
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
      <table className="w-full border-collapse border border-black text-[0.8rem] mb-6">
        <thead>
          <tr className="bg-slate-100">
            <th className="border border-black p-2 w-[12%]">학생명</th>
            <th className="border border-black p-2 w-[15%]">생년월일</th>
            <th className="border border-black p-2 w-[18%]">소속학교<br/>(유치원)</th>
            <th className="border border-black p-2 w-[18%]">장애 유형</th>
            <th className="border border-black p-2 w-[15%]">치료 영역</th>
            <th className="border border-black p-2 w-[22%]">치료 일정</th>
          </tr>
        </thead>
        <tbody>
          <tr className="h-28">
            <td className="border border-black p-2 text-center font-bold">{student.name}</td>
            <td className="border border-black p-2 text-center">{student.birthDate}</td>
            <td className="border border-black p-2 text-center">{student.school}</td>
            <td className="border border-black p-2 text-center">
              {student.disabilityType}
            </td>
            <td className="border border-black p-2 text-center font-bold">{student.treatmentArea}</td>
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
      <div className="flex border border-black border-b-0">
        <div className="bg-slate-50 p-2 font-bold border-r border-black w-28 flex items-center justify-center text-[0.85rem]">현행 수준</div>
        <div className="p-3 text-[0.85rem] leading-relaxed flex-1 min-h-[60px]">
          {isEditing ? (
            <textarea
              value={editedData.currentLevel}
              onChange={(e) => setEditedData({ ...editedData, currentLevel: e.target.value })}
              className="w-full h-full border-none focus:ring-1 focus:ring-primary p-1 bg-slate-50"
            />
          ) : (
            editedData.currentLevel
          )}
        </div>
      </div>

      {/* 치료 목표 */}
      <div className="flex border border-black mb-6">
        <div className="bg-slate-50 p-2 font-bold border-r border-black w-28 flex items-center justify-center text-[0.85rem]">({month.toString().padStart(2, '0')})월 치료목표</div>
        <div className="p-3 text-[0.85rem] leading-relaxed flex-1 min-h-[60px]">
          {isEditing ? (
            <textarea
              value={editedData.monthlyGoal}
              onChange={(e) => setEditedData({ ...editedData, monthlyGoal: e.target.value })}
              className="w-full h-full border-none focus:ring-1 focus:ring-primary p-1 bg-slate-50"
            />
          ) : (
            editedData.monthlyGoal
          )}
        </div>
      </div>

      {/* 회기별 일지 */}
      <table className="w-full border-collapse border border-black text-[0.8rem] mb-6">
        <thead>
          <tr className="bg-slate-100">
            <th className="border border-black p-2 w-24 text-center">날짜</th>
            <th className="border border-black p-2 text-center">치료 내용</th>
            <th className="border border-black p-2 text-center">아동 반응</th>
            <th className="border border-black p-2 w-32 text-center">비고<br/>(부모 상담)</th>
          </tr>
        </thead>
        <tbody>
          {editedData.sessions.length > 0 ? (
            editedData.sessions.map((session, idx) => (
              <tr key={idx} className="h-20">
                <td className="border border-black p-2 text-center font-bold">{session.date}</td>
                <td className="border border-black p-2 leading-relaxed">
                  {isEditing ? (
                    <textarea
                      value={session.content}
                      onChange={(e) => updateSession(idx, 'content', e.target.value)}
                      className="w-full h-full border-none focus:ring-1 focus:ring-primary p-1 bg-slate-50 text-[0.8rem]"
                    />
                  ) : (
                    session.content
                  )}
                </td>
                <td className="border border-black p-2 leading-relaxed">
                  {isEditing ? (
                    <textarea
                      value={session.reaction}
                      onChange={(e) => updateSession(idx, 'reaction', e.target.value)}
                      className="w-full h-full border-none focus:ring-1 focus:ring-primary p-1 bg-slate-50 text-[0.8rem]"
                    />
                  ) : (
                    session.reaction
                  )}
                </td>
                <td className="border border-black p-2 text-[0.7rem]">
                  {isEditing ? (
                    <textarea
                      value={session.consultation}
                      onChange={(e) => updateSession(idx, 'consultation', e.target.value)}
                      className="w-full h-full border-none focus:ring-1 focus:ring-primary p-1 bg-slate-50 text-[0.7rem]"
                    />
                  ) : (
                    session.consultation
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr className="h-40">
              <td colSpan={4} className="border border-black p-4 text-center text-slate-400 font-bold text-lg">
                해당 월의 치료 내역이 없습니다.
              </td>
            </tr>
          )}
          {/* Fill empty rows if needed to maintain layout consistency */}
          {editedData.sessions.length > 0 && editedData.sessions.length < 4 && Array.from({ length: 4 - editedData.sessions.length }).map((_, i) => (
            <tr key={`empty-${i}`} className="h-20">
              <td className="border border-black p-2"></td>
              <td className="border border-black p-2"></td>
              <td className="border border-black p-2"></td>
              <td className="border border-black p-2"></td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 치료 결과 */}
      <div className="flex border border-black">
        <div className="bg-slate-50 p-2 font-bold border-r border-black w-28 flex items-center justify-center text-[0.85rem]">({month.toString().padStart(2, '0')})월 치료결과</div>
        <div className="p-3 text-[0.85rem] leading-relaxed flex-1 min-h-[80px]">
          {isEditing ? (
            <textarea
              value={editedData.result}
              onChange={(e) => setEditedData({ ...editedData, result: e.target.value })}
              className="w-full h-full border-none focus:ring-1 focus:ring-primary p-1 bg-slate-50"
            />
          ) : (
            editedData.result
          )}
        </div>
      </div>
    </div>
  );
};
