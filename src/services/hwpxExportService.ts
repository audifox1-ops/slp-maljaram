import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { Student, AnnualPlanData, MonthlyJournalData } from '../types';

/**
 * HWPX 다운로드 서비스
 */

/**
 * 연간계획서를 HWPX로 다운로드합니다.
 */
export async function downloadAnnualPlanAsHWPX(
  student: Student,
  data: AnnualPlanData,
  year: number
): Promise<void> {
  const templatePath = '/assets/templates/template_annual.hwpx';
  
  try {
    const response = await fetch(templatePath);
    if (!response.ok) throw new Error('템플릿 파일을 찾을 수 없습니다.');
    const blob = await response.blob();
    
    const zip = await JSZip.loadAsync(blob);
    const sectionXmlPath = 'Contents/section0.xml';
    let sectionXml = await zip.file(sectionXmlPath)?.async('string');
    
    if (!sectionXml) throw new Error('HWPX 구조가 올바르지 않습니다 (section0.xml 없음)');

    // 데이터 치환
    const replacements: Record<string, string> = {
      '{{YEAR}}': year.toString(),
      '{{STUDENT_NAME}}': student.name,
      '{{BIRTH_DATE}}': student.birthDate,
      '{{SCHOOL}}': student.school,
      '{{DISABILITY_TYPE}}': student.disabilityType,
      '{{TREATMENT_AREA}}': student.treatmentArea,
      '{{THERAPIST_NAME}}': student.therapistName,
      '{{SCHEDULE}}': `요일: ${student.schedule.day} / 시간: ${student.schedule.time}`,
      '{{CURRENT_LEVEL}}': data.currentLevel.join('\n'),
      '{{LONG_TERM_GOAL}}': data.longTermGoals.join('\n'),
    };

    // 월별 목표 치환 (최대 12개월 가정)
    data.monthlyGoals.forEach((goal, index) => {
      const m = goal.month;
      replacements[`{{M${m}_GOAL}}`] = goal.goal;
      replacements[`{{M${m}_CONTENT}}`] = goal.content;
    });

    // XML 치환 수행
    Object.entries(replacements).forEach(([key, value]) => {
      sectionXml = sectionXml!.split(key).join(escapeXml(value));
    });

    // 수정된 XML을 다시 ZIP에 저장
    zip.file(sectionXmlPath, sectionXml);

    // 새 HWPX 생성 및 다운로드
    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, `${student.name}_${year}년_연간계획서.hwpx`);
  } catch (error) {
    console.error('HWPX export failed:', error);
    throw error;
  }
}

/**
 * 월별일지를 HWPX로 다운로드합니다.
 */
export async function downloadMonthlyJournalAsHWPX(
  student: Student,
  data: MonthlyJournalData,
  month: number,
  year: number
): Promise<void> {
  const templatePath = '/assets/templates/template_monthly.hwpx';

  try {
    const response = await fetch(templatePath);
    if (!response.ok) throw new Error('템플릿 파일을 찾을 수 없습니다.');
    const blob = await response.blob();

    const zip = await JSZip.loadAsync(blob);
    const sectionXmlPath = 'Contents/section0.xml';
    let sectionXml = await zip.file(sectionXmlPath)?.async('string');

    if (!sectionXml) throw new Error('HWPX 구조가 올바르지 않습니다 (section0.xml 없음)');

    // 데이터 치환
    const replacements: Record<string, string> = {
      '{{YEAR}}': year.toString(),
      '{{MONTH}}': month.toString(),
      '{{STUDENT_NAME}}': student.name,
      '{{BIRTH_DATE}}': student.birthDate,
      '{{SCHOOL}}': student.school,
      '{{DISABILITY_TYPE}}': student.disabilityType,
      '{{TREATMENT_AREA}}': student.treatmentArea,
      '{{THERAPIST_NAME}}': student.therapistName,
      '{{SCHEDULE_DAY}}': student.schedule.day,
      '{{SCHEDULE_TIME}}': student.schedule.time,
      '{{CURRENT_LEVEL}}': data.currentLevel,
      '{{MONTHLY_GOAL}}': data.monthlyGoal,
      '{{RESULT}}': data.result,
    };

    // 회기별 데이터 치환 (최대 8회기 가정 또는 템플릿에 따라 조절)
    data.sessions.forEach((session, index) => {
      const sNum = index + 1;
      replacements[`{{S${sNum}_DATE}}`] = session.date;
      replacements[`{{S${sNum}_CONTENT}}`] = session.content;
      replacements[`{{S${sNum}_REACTION}}`] = session.reaction;
      replacements[`{{S${sNum}_NOTE}}`] = session.consultation;
    });

    // XML 치환 수행
    Object.entries(replacements).forEach(([key, value]) => {
      sectionXml = sectionXml!.split(key).join(escapeXml(value));
    });

    // 남은 Placeholder 제거 (선택 사항)
    // sectionXml = sectionXml.replace(/\{\{[^}]+\}\}/g, '');

    zip.file(sectionXmlPath, sectionXml);

    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, `${student.name}_${year}년_${month}월_치료일지.hwpx`);
  } catch (error) {
    console.error('HWPX export failed:', error);
    throw error;
  }
}

/**
 * XML 특수문자 이스케이프
 */
function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&"']/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '"': return '&quot;';
      case "'": return '&apos;';
      default: return c;
    }
  });
}
