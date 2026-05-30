/**
 * pdfExportService.ts
 *
 * html2pdf.js를 사용하여 현재 문서 미리보기를 PDF로 변환·다운로드합니다.
 */

/**
 * .document-container 요소를 찾아 PDF로 다운로드합니다.
 *
 * @param fileName  저장할 파일명 (확장자 제외)
 */
export async function downloadAsPdf(fileName: string): Promise<void> {
  const element = document.querySelector('.document-container') as HTMLElement | null;
  if (!element) {
    throw new Error('문서 미리보기 요소(.document-container)를 찾을 수 없습니다.');
  }

  // html2pdf.js는 ESM 기본 내보내기가 없으므로 동적 임포트 사용
  const html2pdf = (await import('html2pdf.js')).default;

  const options = {
    margin: [10, 12, 10, 12] as [number, number, number, number],
    filename: `${fileName}.pdf`,
    image: { type: 'jpeg' as const, quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      logging: false,
      letterRendering: true,
    },
    jsPDF: {
      unit: 'mm' as const,
      format: 'a4' as const,
      orientation: 'portrait' as const,
    },
    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] as string[] },
  };

  await html2pdf().set(options).from(element).save();
}
