import { Student, AnnualPlanData, MonthlyJournalData } from '../types';

/**
 * Word 문서 내보내기 서비스
 */

const FONT_NAME = "맑은 고딕";

/**
 * 연간계획서를 Word 문서로 다운로드합니다.
 */
export async function downloadAnnualPlanAsWord(
  student: Student,
  data: AnnualPlanData,
  year: number
): Promise<void> {
  const {
    Document,
    Packer,
    Paragraph,
    TextRun,
    Table,
    TableRow,
    TableCell,
    WidthType,
    AlignmentType,
    BorderStyle,
    VerticalAlign,
  } = await import('docx');
  const { saveAs } = await import('file-saver');

  const createBorder = () => ({
    style: BorderStyle.SINGLE,
    size: 2,
    color: '334155',
  });

  const borders = {
    top: createBorder(),
    bottom: createBorder(),
    left: createBorder(),
    right: createBorder(),
  };

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: `${year}. 교육청 치료지원(마중물) 대상 연간 계획서`,
                bold: true,
                size: 36,
                font: FONT_NAME,
              }),
            ],
            spacing: { after: 600 },
          }),
          // 기본 정보 테이블
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  '학생명',
                  '생년월일',
                  '소속 학교',
                  '장애 유형',
                  '치료 영역',
                  '담당 치료사',
                  '치료 일정',
                ].map(
                  (text) =>
                    new TableCell({
                      children: [
                        new Paragraph({ 
                          children: [new TextRun({ text, font: FONT_NAME, bold: true })],
                          alignment: AlignmentType.CENTER 
                        }),
                      ],
                      shading: { fill: 'F8FAFC' },
                      borders,
                      verticalAlign: VerticalAlign.CENTER,
                    })
                ),
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [new TextRun({ text: student.name, bold: true, font: FONT_NAME })],
                        alignment: AlignmentType.CENTER,
                      }),
                    ],
                    borders,
                    verticalAlign: VerticalAlign.CENTER,
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [new TextRun({ text: student.birthDate, font: FONT_NAME })],
                        alignment: AlignmentType.CENTER,
                      }),
                    ],
                    borders,
                    verticalAlign: VerticalAlign.CENTER,
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [new TextRun({ text: student.school, font: FONT_NAME })],
                        alignment: AlignmentType.CENTER,
                      }),
                    ],
                    borders,
                    verticalAlign: VerticalAlign.CENTER,
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [new TextRun({ text: student.disabilityType, font: FONT_NAME })],
                        alignment: AlignmentType.CENTER,
                      }),
                    ],
                    borders,
                    verticalAlign: VerticalAlign.CENTER,
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: student.treatmentArea,
                            bold: true,
                            font: FONT_NAME,
                          }),
                        ],
                        alignment: AlignmentType.CENTER,
                      }),
                    ],
                    borders,
                    verticalAlign: VerticalAlign.CENTER,
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [new TextRun({ text: student.therapistName, font: FONT_NAME })],
                        alignment: AlignmentType.CENTER,
                      }),
                    ],
                    borders,
                    verticalAlign: VerticalAlign.CENTER,
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [new TextRun({ text: `요일: ${student.schedule.day}`, font: FONT_NAME, size: 18 })],
                      }),
                      new Paragraph({
                        children: [new TextRun({ text: `시간: ${student.schedule.time}`, font: FONT_NAME, size: 18 })],
                      }),
                      new Paragraph({ 
                        children: [new TextRun({ text: `시작: ${year}. 03.`, font: FONT_NAME, size: 18 })],
                      }),
                    ],
                    borders,
                    verticalAlign: VerticalAlign.CENTER,
                  }),
                ],
              }),
            ],
          }),
          new Paragraph({ text: '', spacing: { before: 400 } }),
          new Paragraph({
            children: [
              new TextRun({ text: '▣ 현행 수준 및 특성', bold: true, font: FONT_NAME, size: 24 }),
            ],
            spacing: { after: 200 },
          }),
          ...data.currentLevel.map(
            (text) =>
              new Paragraph({ 
                children: [new TextRun({ text: `• ${text}`, font: FONT_NAME })],
                indent: { left: 440 },
                spacing: { after: 120 },
              })
          ),
          new Paragraph({ text: '', spacing: { before: 400 } }),
          new Paragraph({
            children: [
              new TextRun({ text: '▣ 장기 치료 목표', bold: true, font: FONT_NAME, size: 24 }),
            ],
            spacing: { after: 200 },
          }),
          ...data.longTermGoals.map(
            (text) =>
              new Paragraph({ 
                children: [new TextRun({ text: `• ${text}`, font: FONT_NAME })],
                indent: { left: 440 },
                spacing: { after: 120 },
              })
          ),
          new Paragraph({ text: '', spacing: { before: 400 } }),
          new Paragraph({
            children: [
              new TextRun({ text: '▣ 연간 치료 계획', bold: true, font: FONT_NAME, size: 24 }),
            ],
            spacing: { after: 200 },
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: ['월', '단기 목표', '치료 내용'].map(
                  (text) =>
                    new TableCell({
                      children: [
                        new Paragraph({ 
                          children: [new TextRun({ text, font: FONT_NAME, bold: true })],
                          alignment: AlignmentType.CENTER 
                        }),
                      ],
                      shading: { fill: 'F8FAFC' },
                      borders,
                      verticalAlign: VerticalAlign.CENTER,
                    })
                ),
              }),
              ...data.monthlyGoals.map(
                (goal) =>
                  new TableRow({
                    children: [
                      new TableCell({
                        children: [
                          new Paragraph({
                            children: [new TextRun({ text: `${goal.month}월`, font: FONT_NAME })],
                            alignment: AlignmentType.CENTER,
                          }),
                        ],
                        borders,
                        verticalAlign: VerticalAlign.CENTER,
                      }),
                      new TableCell({
                        children: [new Paragraph({ children: [new TextRun({ text: goal.goal, font: FONT_NAME })] })],
                        borders,
                        verticalAlign: VerticalAlign.CENTER,
                        margins: { left: 100, right: 100 },
                      }),
                      new TableCell({
                        children: [new Paragraph({ children: [new TextRun({ text: goal.content, font: FONT_NAME })] })],
                        borders,
                        verticalAlign: VerticalAlign.CENTER,
                        margins: { left: 100, right: 100 },
                      }),
                    ],
                  })
              ),
            ],
          }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${student.name}_${year}년_연간계획서.docx`);
}

/**
 * 월별일지를 Word 문서로 다운로드합니다.
 */
export async function downloadMonthlyJournalAsWord(
  student: Student,
  data: MonthlyJournalData,
  month: number,
  year: number
): Promise<void> {
  const {
    Document,
    Packer,
    Paragraph,
    TextRun,
    Table,
    TableRow,
    TableCell,
    WidthType,
    AlignmentType,
    BorderStyle,
    VerticalAlign,
  } = await import('docx');
  const { saveAs } = await import('file-saver');

  const createBorder = () => ({
    style: BorderStyle.SINGLE,
    size: 2,
    color: '334155',
  });

  const borders = {
    top: createBorder(),
    bottom: createBorder(),
    left: createBorder(),
    right: createBorder(),
  };

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: `${year}. 교육청 치료지원(마중물) 대상 개별 치료 일지(${month}월)`,
                bold: true,
                size: 36,
                font: FONT_NAME,
              }),
            ],
            spacing: { after: 600 },
          }),
          // 기본 정보 테이블
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  '학생명',
                  '생년월일',
                  '소속학교',
                  '장애 유형',
                  '치료 영역',
                  '치료 일정',
                ].map(
                  (text) =>
                    new TableCell({
                      children: [
                        new Paragraph({ 
                          children: [new TextRun({ text, font: FONT_NAME, bold: true })],
                          alignment: AlignmentType.CENTER 
                        }),
                      ],
                      shading: { fill: 'F8FAFC' },
                      borders,
                      verticalAlign: VerticalAlign.CENTER,
                    })
                ),
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [new TextRun({ text: student.name, bold: true, font: FONT_NAME })],
                        alignment: AlignmentType.CENTER,
                      }),
                    ],
                    borders,
                    verticalAlign: VerticalAlign.CENTER,
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [new TextRun({ text: student.birthDate, font: FONT_NAME })],
                        alignment: AlignmentType.CENTER,
                      }),
                    ],
                    borders,
                    verticalAlign: VerticalAlign.CENTER,
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [new TextRun({ text: student.school, font: FONT_NAME })],
                        alignment: AlignmentType.CENTER,
                      }),
                    ],
                    borders,
                    verticalAlign: VerticalAlign.CENTER,
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [new TextRun({ text: student.disabilityType, font: FONT_NAME })],
                        alignment: AlignmentType.CENTER,
                      }),
                    ],
                    borders,
                    verticalAlign: VerticalAlign.CENTER,
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: student.treatmentArea,
                            bold: true,
                            font: FONT_NAME,
                          }),
                        ],
                        alignment: AlignmentType.CENTER,
                      }),
                    ],
                    borders,
                    verticalAlign: VerticalAlign.CENTER,
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [new TextRun({ text: `요일: ${student.schedule.day}`, font: FONT_NAME, size: 18 })],
                      }),
                      new Paragraph({
                        children: [new TextRun({ text: `시간: ${student.schedule.time}`, font: FONT_NAME, size: 18 })],
                      }),
                    ],
                    borders,
                    verticalAlign: VerticalAlign.CENTER,
                  }),
                ],
              }),
            ],
          }),
          new Paragraph({ text: '', spacing: { before: 400 } }),
          // 현행 수준 + 치료 목표
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ text: '현행 수준', bold: true, font: FONT_NAME }),
                        ],
                        alignment: AlignmentType.CENTER,
                      }),
                    ],
                    shading: { fill: 'F8FAFC' },
                    borders,
                    width: { size: 20, type: WidthType.PERCENTAGE },
                    verticalAlign: VerticalAlign.CENTER,
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({ children: [new TextRun({ text: data.currentLevel, font: FONT_NAME })] }),
                    ],
                    borders,
                    verticalAlign: VerticalAlign.CENTER,
                    margins: { left: 100, top: 100, bottom: 100 },
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ text: '치료 목표', bold: true, font: FONT_NAME }),
                        ],
                        alignment: AlignmentType.CENTER,
                      }),
                    ],
                    shading: { fill: 'F8FAFC' },
                    borders,
                    verticalAlign: VerticalAlign.CENTER,
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({ children: [new TextRun({ text: data.monthlyGoal, font: FONT_NAME })] }),
                    ],
                    borders,
                    verticalAlign: VerticalAlign.CENTER,
                    margins: { left: 100, top: 100, bottom: 100 },
                  }),
                ],
              }),
            ],
          }),
          new Paragraph({ text: '', spacing: { before: 400 } }),
          // 회기별 테이블
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: ['날짜', '치료 내용', '아동 반응', '비고'].map(
                  (text) =>
                    new TableCell({
                      children: [
                        new Paragraph({ 
                          children: [new TextRun({ text, font: FONT_NAME, bold: true })],
                          alignment: AlignmentType.CENTER 
                        }),
                      ],
                      shading: { fill: 'F8FAFC' },
                      borders,
                      verticalAlign: VerticalAlign.CENTER,
                    })
                ),
              }),
              ...data.sessions.map(
                (session) =>
                  new TableRow({
                    children: [
                      new TableCell({
                        children: [
                          new Paragraph({
                            children: [new TextRun({ text: session.date, font: FONT_NAME, size: 18 })],
                            alignment: AlignmentType.CENTER,
                          }),
                        ],
                        borders,
                        verticalAlign: VerticalAlign.CENTER,
                      }),
                      new TableCell({
                        children: [new Paragraph({ children: [new TextRun({ text: session.content, font: FONT_NAME })] })],
                        borders,
                        verticalAlign: VerticalAlign.CENTER,
                        margins: { left: 100, top: 100, bottom: 100 },
                      }),
                      new TableCell({
                        children: [new Paragraph({ children: [new TextRun({ text: session.reaction, font: FONT_NAME })] })],
                        borders,
                        verticalAlign: VerticalAlign.CENTER,
                        margins: { left: 100, top: 100, bottom: 100 },
                      }),
                      new TableCell({
                        children: [
                          new Paragraph({ children: [new TextRun({ text: session.consultation, font: FONT_NAME, size: 18 })] }),
                        ],
                        borders,
                        verticalAlign: VerticalAlign.CENTER,
                        margins: { left: 100, top: 100, bottom: 100 },
                      }),
                    ],
                  })
              ),
            ],
          }),
          new Paragraph({ text: '', spacing: { before: 400 } }),
          // 치료 결과
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ text: '치료 결과', bold: true, font: FONT_NAME }),
                        ],
                        alignment: AlignmentType.CENTER,
                      }),
                    ],
                    shading: { fill: 'F8FAFC' },
                    borders,
                    width: { size: 20, type: WidthType.PERCENTAGE },
                    verticalAlign: VerticalAlign.CENTER,
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: data.result, font: FONT_NAME })] })],
                    borders,
                    verticalAlign: VerticalAlign.CENTER,
                    margins: { left: 100, top: 100, bottom: 100 },
                  }),
                ],
              }),
            ],
          }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(
    blob,
    `${student.name}_${year}년_${month}월_치료서류.docx`
  );
}
