/**
 * Word 문서 내보내기 서비스
 * App.tsx의 handleDownloadWord 로직(~200줄)을 분리합니다.
 */
import { Student, AnnualPlanData, MonthlyJournalData } from '../types';

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
  } = await import('docx');
  const { saveAs } = await import('file-saver');

  const createBorder = () => ({
    style: BorderStyle.SINGLE,
    size: 1,
    color: '000000',
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
                size: 32,
              }),
            ],
            spacing: { after: 400 },
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
                        new Paragraph({ text, alignment: AlignmentType.CENTER }),
                      ],
                      shading: { fill: 'F1F5F9' },
                      borders,
                    })
                ),
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ text: student.name, bold: true }),
                        ],
                        alignment: AlignmentType.CENTER,
                      }),
                    ],
                    borders,
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        text: student.birthDate,
                        alignment: AlignmentType.CENTER,
                      }),
                    ],
                    borders,
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        text: student.school,
                        alignment: AlignmentType.CENTER,
                      }),
                    ],
                    borders,
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        text: student.disabilityType,
                        alignment: AlignmentType.CENTER,
                      }),
                    ],
                    borders,
                  }),
                   new TableCell({
                     children: [
                       new Paragraph({
                         children: [
                           new TextRun({
                             text: student.treatmentArea,
                             bold: true,
                           }),
                         ],
                         alignment: AlignmentType.CENTER,
                       }),
                     ],
                     borders,
                   }),
                   new TableCell({
                     children: [
                       new Paragraph({
                         text: student.therapistName,
                         alignment: AlignmentType.CENTER,
                       }),
                     ],
                     borders,
                   }),
                   new TableCell({
                     children: [
                       new Paragraph({
                         text: `요일: ${student.schedule.day}`,
                       }),
                       new Paragraph({
                         text: `시간: ${student.schedule.time}`,
                       }),
                       new Paragraph({ text: `시작: ${year}. 03.` }),
                     ],
                     borders,
                   }),
                ],
              }),
            ],
          }),
          new Paragraph({ text: '', spacing: { before: 200 } }),
          new Paragraph({
            children: [
              new TextRun({ text: '[현행 수준 및 특성]', bold: true }),
            ],
          }),
          ...data.currentLevel.map(
            (text) =>
              new Paragraph({ text: `• ${text}`, indent: { left: 240 } })
          ),
          new Paragraph({ text: '', spacing: { before: 200 } }),
          new Paragraph({
            children: [
              new TextRun({ text: '[장기 치료 목표]', bold: true }),
            ],
          }),
          ...data.longTermGoals.map(
            (text) =>
              new Paragraph({ text: `• ${text}`, indent: { left: 240 } })
          ),
          new Paragraph({ text: '', spacing: { before: 200 } }),
          new Paragraph({
            children: [
              new TextRun({ text: '[연간 치료 계획]', bold: true }),
            ],
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: ['월', '단기 목표', '치료 내용'].map(
                  (text) =>
                    new TableCell({
                      children: [
                        new Paragraph({ text, alignment: AlignmentType.CENTER }),
                      ],
                      shading: { fill: 'F1F5F9' },
                      borders,
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
                            text: `${goal.month}월`,
                            alignment: AlignmentType.CENTER,
                          }),
                        ],
                        borders,
                      }),
                      new TableCell({
                        children: [new Paragraph({ text: goal.goal })],
                        borders,
                      }),
                      new TableCell({
                        children: [new Paragraph({ text: goal.content })],
                        borders,
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
  } = await import('docx');
  const { saveAs } = await import('file-saver');

  const createBorder = () => ({
    style: BorderStyle.SINGLE,
    size: 1,
    color: '000000',
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
                size: 32,
              }),
            ],
            spacing: { after: 400 },
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
                        new Paragraph({ text, alignment: AlignmentType.CENTER }),
                      ],
                      shading: { fill: 'F1F5F9' },
                      borders,
                    })
                ),
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ text: student.name, bold: true }),
                        ],
                        alignment: AlignmentType.CENTER,
                      }),
                    ],
                    borders,
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        text: student.birthDate,
                        alignment: AlignmentType.CENTER,
                      }),
                    ],
                    borders,
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        text: student.school,
                        alignment: AlignmentType.CENTER,
                      }),
                    ],
                    borders,
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        text: student.disabilityType,
                        alignment: AlignmentType.CENTER,
                      }),
                    ],
                    borders,
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: student.treatmentArea,
                            bold: true,
                          }),
                        ],
                        alignment: AlignmentType.CENTER,
                      }),
                    ],
                    borders,
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        text: `요일: ${student.schedule.day}`,
                      }),
                      new Paragraph({
                        text: `시간: ${student.schedule.time}`,
                      }),
                    ],
                    borders,
                  }),
                ],
              }),
            ],
          }),
          new Paragraph({ text: '', spacing: { before: 200 } }),
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
                          new TextRun({ text: '현행 수준', bold: true }),
                        ],
                      }),
                    ],
                    shading: { fill: 'F1F5F9' },
                    borders,
                    width: { size: 20, type: WidthType.PERCENTAGE },
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({ text: data.currentLevel }),
                    ],
                    borders,
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ text: '치료 목표', bold: true }),
                        ],
                      }),
                    ],
                    shading: { fill: 'F1F5F9' },
                    borders,
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({ text: data.monthlyGoal }),
                    ],
                    borders,
                  }),
                ],
              }),
            ],
          }),
          new Paragraph({ text: '', spacing: { before: 200 } }),
          // 회기별 테이블
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: ['날짜', '치료 내용', '아동 반응', '비고'].map(
                  (text) =>
                    new TableCell({
                      children: [
                        new Paragraph({ text, alignment: AlignmentType.CENTER }),
                      ],
                      shading: { fill: 'F1F5F9' },
                      borders,
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
                            text: session.date,
                            alignment: AlignmentType.CENTER,
                          }),
                        ],
                        borders,
                      }),
                      new TableCell({
                        children: [new Paragraph({ text: session.content })],
                        borders,
                      }),
                      new TableCell({
                        children: [new Paragraph({ text: session.reaction })],
                        borders,
                      }),
                      new TableCell({
                        children: [
                          new Paragraph({ text: session.consultation }),
                        ],
                        borders,
                      }),
                    ],
                  })
              ),
            ],
          }),
          new Paragraph({ text: '', spacing: { before: 200 } }),
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
                          new TextRun({ text: '치료 결과', bold: true }),
                        ],
                      }),
                    ],
                    shading: { fill: 'F1F5F9' },
                    borders,
                    width: { size: 20, type: WidthType.PERCENTAGE },
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: data.result })],
                    borders,
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
