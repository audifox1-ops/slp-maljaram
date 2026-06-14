import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  loadTemplateSettings,
  saveTemplateSettings,
  resetTemplateSettings,
  validateTemplateSettings,
} from '../services/templateService';

describe('templateService', () => {
  const store: Record<string, string> = {};

  beforeEach(() => {
    Object.keys(store).forEach(k => delete store[k]);

    const mock = {
      getItem: vi.fn((key: string) => store[key] ?? null),
      setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
      removeItem: vi.fn((key: string) => { delete store[key]; }),
      clear: vi.fn(() => { Object.keys(store).forEach(k => delete store[k]); }),
      get length() { return Object.keys(store).length; },
      key: vi.fn((i: number) => Object.keys(store)[i] ?? null),
    };
    Object.defineProperty(window, 'localStorage', { value: mock, writable: true });
  });

  describe('loadTemplateSettings', () => {
    it('returns defaults when localStorage is empty', () => {
      const settings = loadTemplateSettings();
      expect(settings.fontName).toBe('맑은 고딕');
      expect(settings.fontSize).toBe(10);
      expect(settings.organizationName).toBe('');
      expect(settings.showLogo).toBe(false);
    });

    it('loads saved settings from localStorage', () => {
      store['slp-docs-template-settings'] = JSON.stringify({
        organizationName: '테스트기관',
        fontName: '나눔고딕',
        showLogo: true,
      });

      const loaded = loadTemplateSettings();
      expect(loaded.organizationName).toBe('테스트기관');
      expect(loaded.fontName).toBe('나눔고딕');
      expect(loaded.showLogo).toBe(true);
    });

    it('returns defaults when localStorage has invalid JSON', () => {
      store['slp-docs-template-settings'] = 'invalid-json{{{';
      const settings = loadTemplateSettings();
      expect(settings.fontName).toBe('맑은 고딕');
    });
  });

  describe('saveTemplateSettings', () => {
    it('saves settings to localStorage', () => {
      const settings = loadTemplateSettings();
      settings.organizationName = '저장 테스트';
      saveTemplateSettings(settings);

      expect(store['slp-docs-template-settings']).toBeTruthy();
      const stored = JSON.parse(store['slp-docs-template-settings']);
      expect(stored.organizationName).toBe('저장 테스트');
    });
  });

  describe('resetTemplateSettings', () => {
    it('clears localStorage and returns defaults', () => {
      store['slp-docs-template-settings'] = JSON.stringify({ fontName: 'custom' });
      const reset = resetTemplateSettings();
      expect(reset.fontName).toBe('맑은 고딕');
      expect(store['slp-docs-template-settings']).toBeUndefined();
    });
  });

  describe('validateTemplateSettings', () => {
    it('returns true for valid settings', () => {
      expect(validateTemplateSettings(loadTemplateSettings())).toBe(true);
    });

    it('returns false when fontName is empty', () => {
      const s = loadTemplateSettings();
      s.fontName = '';
      expect(validateTemplateSettings(s)).toBe(false);
    });

    it('returns false when fontSize is too small', () => {
      const s = loadTemplateSettings();
      s.fontSize = 5;
      expect(validateTemplateSettings(s)).toBe(false);
    });

    it('returns false when fontSize is too large', () => {
      const s = loadTemplateSettings();
      s.fontSize = 20;
      expect(validateTemplateSettings(s)).toBe(false);
    });

    it.skip('returns true for boundary fontSize values', () => {
      const s = { ...loadTemplateSettings(), fontSize: 8 };
      expect(validateTemplateSettings(s)).toBe(true);
      s.fontSize = 16;
      expect(validateTemplateSettings(s)).toBe(true);
    });
  });
});
