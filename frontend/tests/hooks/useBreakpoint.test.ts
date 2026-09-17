import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useBreakpoint } from '../../src/hooks/useBreakpoint';

describe('useBreakpoint Hook - Phase 0 Widened Breakpoints', () => {
  const originalInnerWidth = window.innerWidth;

  const setWindowWidth = (width: number) => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: width,
    });
  };

  beforeEach(() => {
    setWindowWidth(1200);
  });

  afterEach(() => {
    setWindowWidth(originalInnerWidth);
  });

  it('classifies small mobile (375px) as isMobile: true, isTablet: false', () => {
    setWindowWidth(375);
    const { result } = renderHook(() => useBreakpoint());
    expect(result.current.width).toBe(375);
    expect(result.current.isMobile).toBe(true);
    expect(result.current.isTablet).toBe(false);
  });

  it('classifies standard mobile (414px) as isMobile: true, isTablet: false', () => {
    setWindowWidth(414);
    const { result } = renderHook(() => useBreakpoint());
    expect(result.current.width).toBe(414);
    expect(result.current.isMobile).toBe(true);
    expect(result.current.isTablet).toBe(false);
  });

  it('classifies mobile cutoff boundary (600px) as isMobile: true, isTablet: false', () => {
    setWindowWidth(600);
    const { result } = renderHook(() => useBreakpoint());
    expect(result.current.width).toBe(600);
    expect(result.current.isMobile).toBe(true);
    expect(result.current.isTablet).toBe(false);
  });

  it('classifies 601px as isMobile: false, isTablet: true', () => {
    setWindowWidth(601);
    const { result } = renderHook(() => useBreakpoint());
    expect(result.current.width).toBe(601);
    expect(result.current.isMobile).toBe(false);
    expect(result.current.isTablet).toBe(true);
  });

  it('classifies tablet 800px as isMobile: false, isTablet: true', () => {
    setWindowWidth(800);
    const { result } = renderHook(() => useBreakpoint());
    expect(result.current.width).toBe(800);
    expect(result.current.isMobile).toBe(false);
    expect(result.current.isTablet).toBe(true);
  });

  it('classifies tablet 900px as isMobile: false, isTablet: true', () => {
    setWindowWidth(900);
    const { result } = renderHook(() => useBreakpoint());
    expect(result.current.width).toBe(900);
    expect(result.current.isMobile).toBe(false);
    expect(result.current.isTablet).toBe(true);
  });

  it('classifies tablet boundary 1024px as isMobile: false, isTablet: true', () => {
    setWindowWidth(1024);
    const { result } = renderHook(() => useBreakpoint());
    expect(result.current.width).toBe(1024);
    expect(result.current.isMobile).toBe(false);
    expect(result.current.isTablet).toBe(true);
  });

  it('classifies desktop boundary 1025px as isMobile: false, isTablet: false', () => {
    setWindowWidth(1025);
    const { result } = renderHook(() => useBreakpoint());
    expect(result.current.width).toBe(1025);
    expect(result.current.isMobile).toBe(false);
    expect(result.current.isTablet).toBe(false);
  });

  it('classifies full desktop 1440px as isMobile: false, isTablet: false', () => {
    setWindowWidth(1440);
    const { result } = renderHook(() => useBreakpoint());
    expect(result.current.width).toBe(1440);
    expect(result.current.isMobile).toBe(false);
    expect(result.current.isTablet).toBe(false);
  });
});
