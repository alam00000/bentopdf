import { describe, it, expect, beforeEach } from 'vitest';
import {
  getRotationState,
  updateRotationState,
  resetRotationState,
  initializeRotationState,
} from '../js/utils/rotation-state';

describe('rotation-state', () => {
  beforeEach(() => {
    resetRotationState();
  });

  describe('initializeRotationState', () => {
    it('should create array of zeros for given page count', () => {
      initializeRotationState(5);
      expect(getRotationState()).toEqual([0, 0, 0, 0, 0]);
    });

    it('should handle single page', () => {
      initializeRotationState(1);
      expect(getRotationState()).toEqual([0]);
    });

    it('should handle zero pages', () => {
      initializeRotationState(0);
      expect(getRotationState()).toEqual([]);
    });

    it('should reset previous state on re-initialization', () => {
      initializeRotationState(3);
      updateRotationState(0, 90);
      initializeRotationState(5);
      expect(getRotationState()).toEqual([0, 0, 0, 0, 0]);
    });
  });

  describe('getRotationState', () => {
    it('should return empty array before initialization', () => {
      expect(getRotationState()).toEqual([]);
    });

    it('should return readonly array', () => {
      initializeRotationState(3);
      const state = getRotationState();
      expect(Array.isArray(state)).toBe(true);
    });

    it('should reflect current state after updates', () => {
      initializeRotationState(3);
      updateRotationState(1, 180);
      expect(getRotationState()[1]).toBe(180);
    });
  });

  describe('updateRotationState', () => {
    it('should update rotation at valid index', () => {
      initializeRotationState(3);
      updateRotationState(0, 90);
      expect(getRotationState()[0]).toBe(90);
    });

    it('should update to any rotation value', () => {
      initializeRotationState(3);
      updateRotationState(0, 90);
      updateRotationState(1, 180);
      updateRotationState(2, 270);
      expect(getRotationState()).toEqual([90, 180, 270]);
    });

    it('should handle negative rotation', () => {
      initializeRotationState(2);
      updateRotationState(0, -90);
      expect(getRotationState()[0]).toBe(-90);
    });

    it('should ignore negative index', () => {
      initializeRotationState(3);
      updateRotationState(-1, 90);
      expect(getRotationState()).toEqual([0, 0, 0]);
    });

    it('should ignore out-of-bounds index', () => {
      initializeRotationState(3);
      updateRotationState(5, 90);
      expect(getRotationState()).toEqual([0, 0, 0]);
    });

    it('should ignore update on empty state', () => {
      updateRotationState(0, 90);
      expect(getRotationState()).toEqual([]);
    });

    it('should allow overwriting a previously set rotation', () => {
      initializeRotationState(2);
      updateRotationState(0, 90);
      updateRotationState(0, 180);
      expect(getRotationState()[0]).toBe(180);
    });
  });

  describe('resetRotationState', () => {
    it('should clear all state', () => {
      initializeRotationState(5);
      updateRotationState(2, 270);
      resetRotationState();
      expect(getRotationState()).toEqual([]);
    });

    it('should be safe to call on empty state', () => {
      resetRotationState();
      expect(getRotationState()).toEqual([]);
    });

    it('should allow re-initialization after reset', () => {
      initializeRotationState(3);
      resetRotationState();
      initializeRotationState(2);
      expect(getRotationState()).toEqual([0, 0]);
    });
  });
});
