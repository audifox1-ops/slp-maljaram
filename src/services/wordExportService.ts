import { Student, AnnualPlanData, MonthlyJournalData } from '../types';
import { TemplateSettings, loadTemplateSettings } from './templateService';

function makeBorders(BorderStyle: any) {
  const b = { style: BorderStyle.SINGLE, size: 2, color: '334155' };
  return { top: b, bottom: b, left: b, right: b };
}

function ml(TextRun: any, text: string, options?: any) {
  if (!text) return [new TextRun({ text: '', ...options })];
  return text.replace(/\r\n/g, '\n').split('\n').map((line, i) =>
    new TextRun({ text: line, break: i > 0 ? 1 : 0, ...options })
  );
}

function font(settings?: TemplateSettings) {
  return settings?.fontName || '맑은 고딕';
}

function headerShade(settings?: TemplateSettings) {
  if (settings?.headerColor) {
    return { fill: settings.headerColor.replace('#', '').substring(0, 6) };
  }
  return { fill: 'F8FAFC' };
}

function orgHeader(settings: TemplateSettings, TextRun: any, AlignmentType: any) {
  const parts: any[] = [];
  if (settings.showLogo && settings.logoUrl) {
    // Note: docx library doesn't support images inline easily; skip for now
  }
  if (settings.organizationName) {
    parts.push({ text: `${settings.organizationName}\n`, bold: true, font: font(settings), size: 20, color: settings.headerColor?.replace('#', '') });
  }
  return parts;
}

export async function downloadAnnualPlanAsWord(
  student: Student,
  data: AnnualPlanData,
  year: number,
  settings?: TemplateSettings
): Promise<void> {
  const {
    Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
    WidthType, AlignmentType, BorderStyle, VerticalAlign,
  } = await import('docx');
  const { saveAs } = await import('file-saver');

  const s = settings || loadTemplateSettings();
  const f = font(s);
  const borders = makeBorders(BorderStyle);
  const shade = headerShade(s);

  const titleText = s.documentTitle || `${year}. 교육청 치료지원(마중물) 대상 연간 계획서`;

  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        ...orgHeader(s, TextRun, AlignmentType).map(t => new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ ...t, size: t.size || 20, font: f })],
          spacing: { after: 100 },
        })),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: titleText, bold: true, size: 36, font: f })],
          spacing: { after: 600 },
        }),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: ['학생명', '생년월일', '소속 학교', '장애 유형', '치료 영역', '담당 치료사', '치료 일정'].map(
                text => new TableCell({
                  children: [new Paragraph({ children: [new TextRun({ text, font: f, bold: true })], alignment: AlignmentType.CENTER })],
                  shading: shade, borders, verticalAlign: VerticalAlign.CENTER,
                })
              ),
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: student.name, bold: true, font: f })], alignment: AlignmentType.CENTER })], borders, verticalAlign: VerticalAlign.CENTER }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: student.birthDate, font: f })], alignment: AlignmentType.CENTER })], borders, verticalAlign: VerticalAlign.CENTER }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: student.school, font: f })], alignment: AlignmentType.CENTER })], borders, verticalAlign: VerticalAlign.CENTER }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: student.disabilityType, font: f })], alignment: AlignmentType.CENTER })], borders, verticalAlign: VerticalAlign.CENTER }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: student.treatmentArea, bold: true, font: f })], alignment: AlignmentType.CENTER })], borders, verticalAlign: VerticalAlign.CENTER }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: student.therapistName, font: f })], alignment: AlignmentType.CENTER })], borders, verticalAlign: VerticalAlign.CENTER }),
                new TableCell({ children: [
                  new Paragraph({ children: [new TextRun({ text: `요일: ${student.schedule.day}`, font: f, size: 18 })] }),
                  new Paragraph({ children: [new TextRun({ text: `시간: ${student.schedule.time}`, font: f, size: 18 })] }),
                  new Paragraph({ children: [new TextRun({ text: `시작: ${year}. 03.`, font: f, size: 18 })] }),
                ], borders, verticalAlign: VerticalAlign.CENTER }),
              ],
            }),
          ],
        }),
        new Paragraph({ text: '', spacing: { before: 400 } }),
        new Paragraph({ children: [new TextRun({ text: '▣ 현행 수준 및 특성', bold: true, font: f, size: 24 })], spacing: { after: 200 } }),
        ...data.currentLevel.map(text =>
          new Paragraph({ children: [new TextRun({ text: '• ', font: f }), ...ml(TextRun, text, { font: f })], indent: { left: 440 }, spacing: { after: 120 } })
        ),
        new Paragraph({ text: '', spacing: { before: 400 } }),
        new Paragraph({ children: [new TextRun({ text: '▣ 장기 치료 목표', bold: true, font: f, size: 24 })], spacing: { after: 200 } }),
        ...data.longTermGoals.map(text =>
          new Paragraph({ children: [new TextRun({ text: '• ', font: f }), ...ml(TextRun, text, { font: f })], indent: { left: 440 }, spacing: { after: 120 } })
        ),
        new Paragraph({ text: '', spacing: { before: 400 } }),
        new Paragraph({ children: [new TextRun({ text: '▣ 연간 치료 계획', bold: true, font: f, size: 24 })], spacing: { after: 200 } }),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({ children: ['월', '단기 목표', '치료 내용'].map(text =>
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text, font: f, bold: true })], alignment: AlignmentType.CENTER })], shading: shade, borders, verticalAlign: VerticalAlign.CENTER })
            )}),
            ...data.monthlyGoals.map(goal => new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `${goal.month}월`, font: f })], alignment: AlignmentType.CENTER })], borders, verticalAlign: VerticalAlign.CENTER }),
                new TableCell({ children: [new Paragraph({ children: ml(TextRun, goal.goal, { font: f }) })], borders, verticalAlign: VerticalAlign.CENTER, margins: { left: 100, right: 100 } }),
                new TableCell({ children: [new Paragraph({ children: ml(TextRun, goal.content, { font: f }) })], borders, verticalAlign: VerticalAlign.CENTER, margins: { left: 100, right: 100 } }),
              ],
            })),
          ],
        }),
        ...(s.organizationName || s.footerText ? [
          new Paragraph({ text: '', spacing: { before: 400 } }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              ...(s.organizationName ? [new TextRun({ text: `${s.organizationName}\n`, bold: true, font: f, size: 16 })] : []),
              ...(s.organizationAddress ? [new TextRun({ text: `${s.organizationAddress}\n`, font: f, size: 16 })] : []),
              ...(s.organizationPhone ? [new TextRun({ text: `Tel: ${s.organizationPhone}`, font: f, size: 16 })] : []),
            ],
          }),
        ] : []),
      ],
    }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${student.name}_${year}년_연간계획서.docx`);
}

export async function downloadMonthlyJournalAsWord(
  student: Student,
  data: MonthlyJournalData,
  month: number,
  year: number,
  settings?: TemplateSettings
): Promise<void> {
  const {
    Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
    WidthType, AlignmentType, BorderStyle, VerticalAlign,
  } = await import('docx');
  const { saveAs } = await import('file-saver');

  const s = settings || loadTemplateSettings();
  const f = font(s);
  const borders = makeBorders(BorderStyle);
  const shade = headerShade(s);

  const titleText = s.documentTitle || `${year}. 교육청 치료지원(마중물) 대상 개별 치료 일지(${month}월)`;

  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        ...orgHeader(s, TextRun, AlignmentType).map(t => new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ ...t, size: t.size || 20, font: f })],
          spacing: { after: 100 },
        })),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: titleText, bold: true, size: 36, font: f })],
          spacing: { after: 600 },
        }),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({ children: ['학생명', '생년월일', '소속학교', '장애 유형', '치료 영역', '치료 일정'].map(text =>
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text, font: f, bold: true })], alignment: AlignmentType.CENTER })], shading: shade, borders, verticalAlign: VerticalAlign.CENTER })
            )}),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: student.name, bold: true, font: f })], alignment: AlignmentType.CENTER })], borders, verticalAlign: VerticalAlign.CENTER }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: student.birthDate, font: f })], alignment: AlignmentType.CENTER })], borders, verticalAlign: VerticalAlign.CENTER }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: student.school, font: f })], alignment: AlignmentType.CENTER })], borders, verticalAlign: VerticalAlign.CENTER }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: student.disabilityType, font: f })], alignment: AlignmentType.CENTER })], borders, verticalAlign: VerticalAlign.CENTER }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: student.treatmentArea, bold: true, font: f })], alignment: AlignmentType.CENTER })], borders, verticalAlign: VerticalAlign.CENTER }),
                new TableCell({ children: [
                  new Paragraph({ children: [new TextRun({ text: `요일: ${student.schedule.day}`, font: f, size: 18 })] }),
                  new Paragraph({ children: [new TextRun({ text: `시간: ${student.schedule.time}`, font: f, size: 18 })] }),
                ], borders, verticalAlign: VerticalAlign.CENTER }),
              ],
            }),
          ],
        }),
        new Paragraph({ text: '', spacing: { before: 400 } }),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({ children: [
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: '현행 수준', bold: true, font: f })], alignment: AlignmentType.CENTER })], shading: shade, borders, width: { size: 20, type: WidthType.PERCENTAGE }, verticalAlign: VerticalAlign.CENTER }),
              new TableCell({ children: [new Paragraph({ children: ml(TextRun, data.currentLevel, { font: f }) })], borders, verticalAlign: VerticalAlign.CENTER, margins: { left: 100, top: 100, bottom: 100 } }),
            ]}),
            new TableRow({ children: [
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: '치료 목표', bold: true, font: f })], alignment: AlignmentType.CENTER })], shading: shade, borders, verticalAlign: VerticalAlign.CENTER }),
              new TableCell({ children: [new Paragraph({ children: ml(TextRun, data.monthlyGoal, { font: f }) })], borders, verticalAlign: VerticalAlign.CENTER, margins: { left: 100, top: 100, bottom: 100 } }),
            ]}),
          ],
        }),
        new Paragraph({ text: '', spacing: { before: 400 } }),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({ children: ['날짜', '치료 내용', '아동 반응', '비고'].map(text =>
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text, font: f, bold: true })], alignment: AlignmentType.CENTER })], shading: shade, borders, verticalAlign: VerticalAlign.CENTER })
            )}),
            ...data.sessions.map(session => new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: session.date, font: f, size: 18 })], alignment: AlignmentType.CENTER })], borders, verticalAlign: VerticalAlign.CENTER }),
                new TableCell({ children: [new Paragraph({ children: ml(TextRun, session.content, { font: f }) })], borders, verticalAlign: VerticalAlign.CENTER, margins: { left: 100, top: 100, bottom: 100 } }),
                new TableCell({ children: [new Paragraph({ children: ml(TextRun, session.reaction, { font: f }) })], borders, verticalAlign: VerticalAlign.CENTER, margins: { left: 100, top: 100, bottom: 100 } }),
                new TableCell({ children: [new Paragraph({ children: ml(TextRun, session.consultation, { font: f, size: 18 }) })], borders, verticalAlign: VerticalAlign.CENTER, margins: { left: 100, top: 100, bottom: 100 } }),
              ],
            })),
          ],
        }),
        new Paragraph({ text: '', spacing: { before: 400 } }),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({ children: [
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: '치료 결과', bold: true, font: f })], alignment: AlignmentType.CENTER })], shading: shade, borders, width: { size: 20, type: WidthType.PERCENTAGE }, verticalAlign: VerticalAlign.CENTER }),
              new TableCell({ children: [new Paragraph({ children: ml(TextRun, data.result, { font: f }) })], borders, verticalAlign: VerticalAlign.CENTER, margins: { left: 100, top: 100, bottom: 100 } }),
            ]}),
          ],
        }),
        ...(s.organizationName || s.footerText ? [
          new Paragraph({ text: '', spacing: { before: 400 } }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              ...(s.organizationName ? [new TextRun({ text: `${s.organizationName}\n`, bold: true, font: f, size: 16 })] : []),
              ...(s.organizationAddress ? [new TextRun({ text: `${s.organizationAddress}\n`, font: f, size: 16 })] : []),
              ...(s.organizationPhone ? [new TextRun({ text: `Tel: ${s.organizationPhone}`, font: f, size: 16 })] : []),
            ],
          }),
        ] : []),
      ],
    }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${student.name}_${year}년_${month}월_치료서류.docx`);
}
