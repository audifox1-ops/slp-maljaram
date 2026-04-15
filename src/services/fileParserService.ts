/**
 * CSV/XLSX 파일 파싱 서비스
 * App.tsx의 processFile 관련 로직을 분리합니다.
 */
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { RawRecord } from '../types';

// 학생 이름 컬럼으로 인식하는 키 목록
const NAME_KEYS = ['학생이름', '학생 이름', '이름', '성명', '성함', '대상자', '대상자명'];
// 거래 날짜 컬럼으로 인식하는 키 목록
const DATE_KEYS = ['거래일자', '거래 일자', '날짜', '결제일', '결제 일자', '일자', 'Date', '거래일'];

/**
 * 데이터 행의 키/값을 trim하여 정규화합니다.
 */
function normalizeData(data: any[]): any[] {
  return data.map((row) => {
    const normalized: any = {};
    Object.keys(row).forEach((key) => {
      const trimmedKey = key.trim();
      normalized[trimmedKey] =
        typeof row[key] === 'string' ? row[key].trim() : row[key];
    });
    return normalized;
  });
}

/**
 * 헤더 행이 아닌 "데이터 상단에 메타 행"이 있는 파일에서
 * 실제 헤더 행을 자동으로 찾고, 데이터를 파싱합니다.
 */
function findHeaderAndParse(rows: any[][]): any[] | null {
  let headerRowIndex = -1;
  for (let i = 0; i < Math.min(rows.length, 10); i++) {
    const row = rows[i];
    if (!row || !Array.isArray(row)) continue;
    const hasName = row.some((cell) =>
      NAME_KEYS.includes(String(cell || '').trim())
    );
    const hasDate = row.some((cell) =>
      DATE_KEYS.includes(String(cell || '').trim())
    );
    if (hasName && hasDate) {
      headerRowIndex = i;
      break;
    }
  }

  if (headerRowIndex === -1) return null;

  const headers = rows[headerRowIndex].map((h) => String(h || '').trim());
  const dataRows = rows.slice(headerRowIndex + 1);

  return dataRows
    .filter((row) =>
      row.some(
        (cell) => cell !== null && cell !== undefined && cell !== ''
      )
    )
    .map((row) => {
      const obj: any = {};
      headers.forEach((header, idx) => {
        if (header) obj[header] = row[idx];
      });
      return obj;
    });
}

/**
 * 파싱된 데이터에 필수 컬럼(학생이름, 거래일자)이 있는지 검증합니다.
 */
function validateData(
  data: any[]
): { valid: true } | { valid: false; message: string } {
  if (!data || data.length === 0) {
    return { valid: false, message: '파일에 데이터가 없습니다.' };
  }

  const firstRow = data[0];
  const keys = Object.keys(firstRow);

  const hasName = keys.some((k) => NAME_KEYS.includes(k));
  const hasDate = keys.some((k) => DATE_KEYS.includes(k));

  if (!hasName) {
    return {
      valid: false,
      message:
        "필수 항목인 '학생이름' 컬럼을 찾을 수 없습니다. (학생이름, 이름, 성명 등)",
    };
  }
  if (!hasDate) {
    return {
      valid: false,
      message:
        "필수 항목인 '거래일자' 컬럼을 찾을 수 없습니다. (거래일자, 날짜, 결제일 등)",
    };
  }

  return { valid: true };
}

export interface ParseResult {
  success: true;
  records: RawRecord[];
}

export interface ParseError {
  success: false;
  message: string;
}

export type FileParseResult = ParseResult | ParseError;

/**
 * CSV 파일을 파싱합니다.
 */
export function parseCsvFile(file: File): Promise<FileParseResult> {
  return new Promise((resolve) => {
    Papa.parse(file, {
      header: false,
      skipEmptyLines: true,
      complete: (results) => {
        const parsedData = findHeaderAndParse(results.data as any[][]);
        if (!parsedData) {
          resolve({
            success: false,
            message:
              '필수 컬럼(학생이름, 거래일자)을 찾을 수 없습니다. 파일 형식을 확인해 주세요.',
          });
          return;
        }

        const processed = normalizeData(parsedData) as RawRecord[];
        const validation = validateData(processed);

        if (validation.valid === false) {
          resolve({ success: false, message: validation.message });
          return;
        }

        resolve({ success: true, records: processed });
      },
      error: () => {
        resolve({
          success: false,
          message: 'CSV 파싱 중 오류가 발생했습니다.',
        });
      },
    });
  });
}

/**
 * XLSX/XLS 파일을 파싱합니다.
 */
export function parseExcelFile(file: File): Promise<FileParseResult> {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rows = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
        }) as any[][];

        const parsedData = findHeaderAndParse(rows);
        if (!parsedData) {
          resolve({
            success: false,
            message:
              '필수 컬럼(학생이름, 거래일자)을 찾을 수 없습니다. 파일 형식을 확인해 주세요.',
          });
          return;
        }

        const processed = normalizeData(parsedData) as RawRecord[];
        const validation = validateData(processed);

        if (validation.valid === false) {
          resolve({ success: false, message: validation.message });
          return;
        }

        resolve({ success: true, records: processed });
      } catch {
        resolve({
          success: false,
          message: '엑셀 파싱 중 오류가 발생했습니다.',
        });
      }
    };

    reader.readAsArrayBuffer(file);
  });
}

/**
 * 파일 확장자에 따라 적절한 파서를 호출합니다.
 */
export function parseFile(file: File): Promise<FileParseResult> {
  const extension = file.name.split('.').pop()?.toLowerCase();

  if (extension === 'csv') {
    return parseCsvFile(file);
  } else if (extension === 'xlsx' || extension === 'xls') {
    return parseExcelFile(file);
  }

  return Promise.resolve({
    success: false,
    message:
      '지원하지 않는 파일 형식입니다. CSV 또는 XLSX 파일을 업로드해 주세요.',
  });
}

/**
 * Raw Record에서 학생 이름을 추출하는 헬퍼입니다.
 */
export function extractStudentName(record: RawRecord): string {
  return String(
    record['학생이름'] ||
      record['학생 이름'] ||
      record['이름'] ||
      record['성명'] ||
      record['성함'] ||
      record['대상자'] ||
      record['대상자명'] ||
      ''
  ).trim();
}

/**
 * Raw Record에서 거래 날짜를 추출하는 헬퍼입니다.
 */
export function extractTransactionDate(record: RawRecord): string {
  return String(
    record['거래일자'] ||
      record['거래 일자'] ||
      record['날짜'] ||
      record['결제일'] ||
      record['결제 일자'] ||
      record['일자'] ||
      record['Date'] ||
      record['거래일'] ||
      ''
  ).trim();
}

/**
 * Raw Record에서 치료 영역을 추출하는 헬퍼입니다.
 */
export function extractTreatmentArea(record: RawRecord): string {
  return String(
    record['지원영역'] ||
      record['지원 영역'] ||
      record['치료영역'] ||
      record['영역'] ||
      record['서비스'] ||
      '언어치료'
  ).trim();
}
