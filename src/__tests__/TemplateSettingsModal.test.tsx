import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TemplateSettingsModal } from '../components/docs/TemplateSettingsModal';
import * as templateService from '../services/templateService';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('TemplateSettingsModal', () => {
  const mockOnClose = vi.fn();
  const mockOnSave = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  it('모달이 닫혀있을 때 렌더링되지 않음', () => {
    render(
      <TemplateSettingsModal
        isOpen={false}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );
    
    expect(screen.queryByText('템플릿 설정')).not.toBeInTheDocument();
  });

  it('모달이 열려있을 때 렌더링됨', () => {
    render(
      <TemplateSettingsModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );
    
    expect(screen.getByText('템플릿 설정')).toBeInTheDocument();
    expect(screen.getByText('기관 정보')).toBeInTheDocument();
    expect(screen.getByText('문서 설정')).toBeInTheDocument();
    expect(screen.getByText('서체 설정')).toBeInTheDocument();
  });

  it('닫기 버튼 클릭 시 onClose 호출', () => {
    render(
      <TemplateSettingsModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );
    
    // X 아이콘을 가진 버튼 찾기
    const closeButton = screen.getAllByRole('button').find(
      button => button.querySelector('svg') !== null && !button.textContent?.trim()
    );
    fireEvent.click(closeButton!);
    
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('저장 버튼 클릭 시 onSave 호출', () => {
    render(
      <TemplateSettingsModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );
    
    // 변경사항 만들기
    const orgNameInput = screen.getByPlaceholderText('치료 기관명 입력');
    fireEvent.change(orgNameInput, { target: { value: '테스트 기관' } });
    
    // 저장 버튼 클릭
    const saveButton = screen.getByText('저장');
    fireEvent.click(saveButton);
    
    expect(mockOnSave).toHaveBeenCalled();
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('초기화 버튼 클릭 시 확인 대화상자 표시', () => {
    window.confirm = vi.fn(() => true);
    
    render(
      <TemplateSettingsModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );
    
    const resetButton = screen.getByText('초기화');
    fireEvent.click(resetButton);
    
    expect(window.confirm).toHaveBeenCalled();
  });

  it('기본값으로 초기화 시 폼 필드 초기화', () => {
    window.confirm = vi.fn(() => true);
    
    render(
      <TemplateSettingsModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );
    
    // 기관명 입력
    const orgNameInput = screen.getByPlaceholderText('치료 기관명 입력');
    fireEvent.change(orgNameInput, { target: { value: '변경된 기관' } });
    
    // 초기화 버튼 클릭
    const resetButton = screen.getByText('초기화');
    fireEvent.click(resetButton);
    
    // 폼이 초기화되었는지 확인 (기본값은 빈 문자열)
    expect(orgNameInput).toHaveValue('');
  });
});
