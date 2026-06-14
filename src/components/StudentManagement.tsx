import React, { useState, useMemo } from 'react';
import { Plus, Edit2, Trash2, UserPlus, Save, X, Search, User, AlertCircle, Calendar, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { StudentInfo } from '../types';

interface Props {
  studentInfos: StudentInfo[];
  onAdd: (student: StudentInfo) => void;
  onUpdate: (oldName: string, student: StudentInfo) => void;
  onDelete: (name: string) => void;
}

export const StudentManagement: React.FC<Props> = ({ studentInfos, onAdd, onUpdate, onDelete }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingName, setEditingName] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState<StudentInfo>({
    name: '',
    birthDate: '',
    school: '',
    disabilityType: '',
    treatmentArea: '언어치료',
    therapistName: '',
    schedule: { day: '', time: '', frequency: '1' },
    observations: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = '학생 이름을 입력해 주세요.';
    } else if (formData.name.length > 50) {
      newErrors.name = '이름은 50자 이내로 입력해 주세요.';
    }

    if (!formData.birthDate.trim()) {
      newErrors.birthDate = '생년월일을 입력해 주세요.';
    } else if (!/^\d{2,4}[.\-\/\s년]\d{1,2}[.\-\/\s월]\d{1,2}/.test(formData.birthDate)) {
      newErrors.birthDate = '올바른 형식으로 입력해 주세요. (예: 13.01.10)';
    }

    if (!formData.school.trim()) {
      newErrors.school = '소속 학교를 입력해 주세요.';
    }

    if (!formData.disabilityType) {
      newErrors.disabilityType = '장애 유형을 선택해 주세요.';
    }

    if (!formData.therapistName.trim()) {
      newErrors.therapistName = '담당 치료사 이름을 입력해 주세요.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const filteredInfos = studentInfos.filter(info => 
    info.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 치료 일정이 없는 학생 수 계산
  const studentsWithoutSchedule = useMemo(() => {
    return studentInfos.filter(info => !info.schedule?.day || !info.schedule?.time).length;
  }, [studentInfos]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    if (editingName) {
      onUpdate(editingName, formData);
      setEditingName(null);
    } else {
      onAdd(formData);
      setIsAdding(false);
    }
    
    setFormData({
      name: '',
      birthDate: '',
      school: '',
      disabilityType: '',
      treatmentArea: '언어치료',
      therapistName: '',
      schedule: { day: '', time: '', frequency: '1' },
      observations: ''
    });
    setErrors({});
  };

  const handleEdit = (info: StudentInfo) => {
    setFormData(info);
    setEditingName(info.name);
    setIsAdding(true);
  };

  const cancelEdit = () => {
    setIsAdding(false);
    setEditingName(null);
    setFormData({
      name: '',
      birthDate: '',
      school: '',
      disabilityType: '',
      treatmentArea: '언어치료',
      therapistName: '',
      schedule: { day: '', time: '', frequency: '1' },
      observations: ''
    });
    setErrors({});
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-bg-theme/50 p-6 md:p-10">
      <div className="max-w-5xl mx-auto w-full flex flex-col h-full">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-black text-text-main tracking-tight">학생 정보 관리</h2>
            <p className="text-text-muted mt-1">서류 자동 완성을 위한 학생들의 기본 정보를 관리합니다.</p>
          </div>
          <button
            onClick={() => setIsAdding(true)}
            className="bg-primary text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-primary-dark transition-all shadow-lg shadow-primary/20"
          >
            <Plus className="w-5 h-5" />
            새 학생 등록
          </button>
        </div>

        <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-border-theme flex flex-col overflow-hidden flex-1">
          <div className="p-6 border-b border-border-theme bg-bg-theme/30 flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="relative w-full md:w-96">
              <input
                type="text"
                placeholder="학생 이름으로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-border-theme rounded-2xl focus:border-primary outline-none transition-all text-sm font-medium shadow-sm"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted w-5 h-5" />
            </div>
            <div className="text-sm font-bold text-text-muted">
              총 <span className="text-primary">{filteredInfos.length}</span>명 등록됨
            </div>
          </div>

          <div className="flex-1 overflow-auto p-6">
            {/* 치료 일정 미입력 경고 배너 */}
            {studentsWithoutSchedule > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-4"
              >
                <div className="flex-shrink-0 w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-amber-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-amber-800">
                    치료 일정 미입력 학생: <span className="text-amber-600">{studentsWithoutSchedule}명</span>
                  </p>
                  <p className="text-xs text-amber-600 mt-0.5">
                    치료 일정을 입력하면 스케줄 검증 및 서류 생성이 더 정확해집니다.
                  </p>
                </div>
                <div className="text-xs text-amber-500 flex items-center gap-1">
                  카드의 <Calendar className="w-3 h-3 inline" /> 버튼으로 빠르게 입력하세요
                </div>
              </motion.div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence mode="popLayout">
                {filteredInfos.map((info) => (
                  <motion.div
                    key={info.name}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-white border border-border-theme rounded-2xl p-5 hover:shadow-lg transition-all group relative"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center text-primary font-bold">
                          {info.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-bold text-text-main">{info.name}</h4>
                          <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider">{info.treatmentArea}</p>
                        </div>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleEdit(info)}
                          className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-primary transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => onDelete(info.name)}
                          className="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-text-muted">생년월일</span>
                        <span className="font-semibold">{info.birthDate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-muted">소속</span>
                        <span className="font-semibold">{info.school}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-muted">장애유형</span>
                        <span className="font-semibold">{info.disabilityType}</span>
                      </div>
                      <div className="flex justify-between border-t border-slate-50 pt-2 mt-2">
                        <span className="text-text-muted">담당 치료사</span>
                        <span className="font-bold text-primary">{info.therapistName || '-'}</span>
                      </div>
                      
                      {/* 치료 일정 - 강조 표시 */}
                      <div className={`mt-3 p-3 rounded-xl ${
                        info.schedule?.day && info.schedule?.time 
                          ? 'bg-slate-50 border border-slate-100' 
                          : 'bg-amber-50 border border-amber-200'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Calendar className={`w-4 h-4 ${
                              info.schedule?.day && info.schedule?.time 
                                ? 'text-slate-400' 
                                : 'text-amber-500'
                            }`} />
                            <span className={`text-xs font-bold ${
                              info.schedule?.day && info.schedule?.time 
                                ? 'text-slate-600' 
                                : 'text-amber-700'
                            }`}>
                              치료 일정
                            </span>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(info);
                            }}
                            className={`text-xs font-bold flex items-center gap-1 px-2 py-1 rounded-lg transition-colors ${
                              info.schedule?.day && info.schedule?.time 
                                ? 'text-slate-500 hover:bg-slate-100' 
                                : 'text-amber-600 hover:bg-amber-100'
                            }`}
                          >
                            {info.schedule?.day && info.schedule?.time ? (
                              <>
                                <Edit2 className="w-3 h-3" />
                                수정
                              </>
                            ) : (
                              <>
                                <ChevronRight className="w-3 h-3" />
                                입력하기
                              </>
                            )}
                          </button>
                        </div>
                        {info.schedule?.day && info.schedule?.time ? (
                          <p className="text-sm font-semibold text-text-main mt-1">
                            {info.schedule.day} {info.schedule.time} <span className="text-text-muted">({info.schedule.frequency}회/주)</span>
                          </p>
                        ) : (
                          <p className="text-xs text-amber-600 mt-1">
                            치료 요일과 시간을 입력해 주세요
                          </p>
                        )}
                      </div>
                      {info.observations && (
                        <div className="mt-2 text-[10px] text-text-muted bg-bg-theme/50 p-2 rounded-lg line-clamp-2 italic">
                          "{info.observations}"
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {filteredInfos.length === 0 && !isAdding && (
                <div className="col-span-full py-20 text-center text-text-muted">
                  <User className="w-16 h-16 mx-auto mb-4 opacity-10" />
                  <p className="text-lg font-bold">등록된 학생이 없습니다.</p>
                  <p className="text-sm mt-1">새 학생 등록 버튼을 눌러 정보를 추가해 주세요.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={cancelEdit}
              className="absolute inset-0 bg-text-main/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-border-theme flex justify-between items-center bg-bg-theme/30">
                <div className="flex items-center gap-3">
                  <div className="bg-primary p-2 rounded-xl">
                    <UserPlus className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-text-main">
                    {editingName ? '학생 정보 수정' : '새 학생 등록'}
                  </h3>
                </div>
                <button onClick={cancelEdit} className="p-2 hover:bg-white rounded-full transition-colors">
                  <X className="w-6 h-6 text-text-muted" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-text-muted ml-1 uppercase tracking-wider">학생명</label>
                    <input
                      required
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="이름 입력"
                      className={`w-full px-4 py-3 bg-bg-theme border rounded-2xl focus:border-primary outline-none transition-all font-medium ${
                        errors.name ? 'border-red-500' : 'border-border-theme'
                      }`}
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-text-muted ml-1 uppercase tracking-wider">생년월일</label>
                    <input
                      required
                      type="text"
                      value={formData.birthDate}
                      onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                      placeholder="13.01.10"
                      className={`w-full px-4 py-3 bg-bg-theme border rounded-2xl focus:border-primary outline-none transition-all font-medium ${
                        errors.birthDate ? 'border-red-500' : 'border-border-theme'
                      }`}
                    />
                    {errors.birthDate && <p className="text-red-500 text-xs mt-1">{errors.birthDate}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-muted ml-1 uppercase tracking-wider">소속 학교/유치원</label>
                  <input
                    required
                    type="text"
                    value={formData.school}
                    onChange={(e) => setFormData({ ...formData, school: e.target.value })}
                    placeholder="학교명 입력"
                    className={`w-full px-4 py-3 bg-bg-theme border rounded-2xl focus:border-primary outline-none transition-all font-medium ${
                      errors.school ? 'border-red-500' : 'border-border-theme'
                    }`}
                  />
                  {errors.school && <p className="text-red-500 text-xs mt-1">{errors.school}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-muted ml-1 uppercase tracking-wider">장애 유형</label>
                  <select
                    required
                    value={formData.disabilityType || ""}
                    onChange={(e) => setFormData({ ...formData, disabilityType: e.target.value })}
                    className={`w-full px-4 py-3 bg-bg-theme border rounded-2xl focus:border-primary outline-none transition-all font-medium cursor-pointer ${
                      errors.disabilityType ? 'border-red-500' : 'border-border-theme'
                    }`}
                  >
                    <option value="" disabled>장애 유형 선택</option>
                    <option value="지적장애">지적장애</option>
                    <option value="자폐성장애">자폐성장애</option>
                    <option value="언어장애">언어장애</option>
                    <option value="발달장애">발달장애</option>
                    <option value="경계선지능">경계선지능</option>
                    <option value="기타">기타</option>
                  </select>
                  {errors.disabilityType && <p className="text-red-500 text-xs mt-1">{errors.disabilityType}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-text-muted ml-1 uppercase tracking-wider">치료 영역</label>
                    <select
                      value={formData.treatmentArea}
                      onChange={(e) => setFormData({ ...formData, treatmentArea: e.target.value })}
                      className="w-full px-4 py-3 bg-bg-theme border border-border-theme rounded-2xl focus:border-primary outline-none transition-all font-medium cursor-pointer"
                    >
                      <option value="언어치료">언어치료</option>
                      <option value="미술치료">미술치료</option>
                      <option value="감각통합">감각통합</option>
                      <option value="인지치료">인지치료</option>
                      <option value="기타">기타</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-text-muted ml-1 uppercase tracking-wider">담당 치료사</label>
                    <input
                      required
                      type="text"
                      value={formData.therapistName}
                      onChange={(e) => setFormData({ ...formData, therapistName: e.target.value })}
                      placeholder="치료사 이름"
                      className={`w-full px-4 py-3 bg-bg-theme border rounded-2xl focus:border-primary outline-none transition-all font-medium ${
                        errors.therapistName ? 'border-red-500' : 'border-border-theme'
                      }`}
                    />
                    {errors.therapistName && <p className="text-red-500 text-xs mt-1">{errors.therapistName}</p>}
                  </div>
                </div>

                {/* 치료 일정 */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-muted ml-1 uppercase tracking-wider">치료 일정</label>
                  
                  {/* 빠른 설정 버튼 */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    <button
                      type="button"
                      onClick={() => setFormData({ 
                        ...formData, 
                        schedule: { day: '화, 목', time: '14:00~14:50', frequency: '2' } 
                      })}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-medium rounded-lg transition-colors"
                    >
                      화,목 14:00
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ 
                        ...formData, 
                        schedule: { day: '월, 수', time: '10:00~10:50', frequency: '2' } 
                      })}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-medium rounded-lg transition-colors"
                    >
                      월,수 10:00
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ 
                        ...formData, 
                        schedule: { day: '매주 월', time: '15:00~15:50', frequency: '1' } 
                      })}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-medium rounded-lg transition-colors"
                    >
                      매주 월 15:00
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <p className="text-[10px] text-text-muted ml-1">요일</p>
                      <input
                        type="text"
                        value={formData.schedule?.day || ''}
                        onChange={(e) => setFormData({ ...formData, schedule: { ...(formData.schedule ?? { day: '', time: '', frequency: '1' }), day: e.target.value } })}
                        placeholder="화, 목"
                        className="w-full px-3 py-2.5 bg-bg-theme border border-border-theme rounded-xl focus:border-primary outline-none transition-all font-medium text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-text-muted ml-1">시간</p>
                      <input
                        type="text"
                        value={formData.schedule?.time || ''}
                        onChange={(e) => setFormData({ ...formData, schedule: { ...(formData.schedule ?? { day: '', time: '', frequency: '1' }), time: e.target.value } })}
                        placeholder="14:00~14:50"
                        className="w-full px-3 py-2.5 bg-bg-theme border border-border-theme rounded-xl focus:border-primary outline-none transition-all font-medium text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-text-muted ml-1">주 횟수</p>
                      <select
                        value={formData.schedule?.frequency || '1'}
                        onChange={(e) => setFormData({ ...formData, schedule: { ...(formData.schedule ?? { day: '', time: '', frequency: '1' }), frequency: e.target.value } })}
                        className="w-full px-3 py-2.5 bg-bg-theme border border-border-theme rounded-xl focus:border-primary outline-none transition-all font-medium text-sm cursor-pointer"
                      >
                        {['1','2','3','4','5'].map(n => <option key={n} value={n}>{n}회</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-muted ml-1 uppercase tracking-wider">주요 관찰 내용 및 특이사항 (선택)</label>
                  <textarea
                    value={formData.observations || ''}
                    onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                    placeholder="예: 지시 따르기 양호함, 소근육 발달이 다소 늦음, 상호작용 의도는 있으나 방식이 미숙함 등"
                    className="w-full px-4 py-3 bg-bg-theme border border-border-theme rounded-2xl focus:border-primary outline-none transition-all font-medium min-h-[100px] resize-none"
                  />
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="flex-1 py-4 rounded-2xl font-bold text-text-muted hover:bg-bg-theme transition-all border border-border-theme"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-4 bg-primary text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-primary-dark transition-all shadow-lg shadow-primary/20"
                  >
                    <Save className="w-5 h-5" />
                    저장하기
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
