import { describe, it, expect } from 'vitest';
import {
  singlePdfLoadTools,
  simpleTools,
  multiFileTools,
} from '@/js/config/pdf-tools';

describe('Tool Configuration Arrays', () => {
  // --- Tests for singlePdfLoadTools ---
  describe('singlePdfLoadTools', () => {
    it('should be an array of non-empty strings', () => {
      expect(Array.isArray(singlePdfLoadTools)).toBe(true);
      expect(singlePdfLoadTools.length).toBeGreaterThan(0);
      for (const tool of singlePdfLoadTools) {
        expect(typeof tool).toBe('string');
        expect(tool.length).toBeGreaterThan(0);
      }
    });

    it('should have the correct number of tools', () => {
      // This acts as a snapshot test to catch unexpected additions/removals.
      expect(singlePdfLoadTools).toHaveLength(42);
    });

    it('should not contain any duplicate tools', () => {
      const uniqueTools = new Set(singlePdfLoadTools);
      expect(uniqueTools.size).toBe(singlePdfLoadTools.length);
    });
  });

  // --- Tests for simpleTools ---
  describe('simpleTools', () => {
    it('should be an array of non-empty strings', () => {
      expect(Array.isArray(simpleTools)).toBe(true);
      expect(simpleTools.length).toBeGreaterThan(0);
      simpleTools.forEach((tool) => {
        expect(typeof tool).toBe('string');
        expect(tool.length).toBeGreaterThan(0);
      });
    });

    it('should have the correct number of tools', () => {
      expect(simpleTools).toHaveLength(5);
    });

    it('should not contain any duplicate tools', () => {
      const uniqueTools = new Set(simpleTools);
      expect(uniqueTools.size).toBe(simpleTools.length);
    });
  });

  // --- Tests for multiFileTools ---
  describe('multiFileTools', () => {
    it('should be an array of non-empty strings', () => {
      expect(Array.isArray(multiFileTools)).toBe(true);
      expect(multiFileTools.length).toBeGreaterThan(0);
      multiFileTools.forEach((tool) => {
        expect(typeof tool).toBe('string');
        expect(tool.length).toBeGreaterThan(0);
      });
    });

    it('should have the correct number of tools', () => {
      expect(multiFileTools).toHaveLength(18);
    });

    it('should not contain any duplicate tools', () => {
      const uniqueTools = new Set(multiFileTools);
      expect(uniqueTools.size).toBe(multiFileTools.length);
    });
  });

  // --- Cross-Category Uniqueness Test ---
  describe('Uniqueness Across All Tool Categories', () => {
    it('should ensure no tool exists in more than one category', () => {
      const allTools = [
        ...singlePdfLoadTools,
        ...simpleTools,
        ...multiFileTools,
      ];
      const uniqueTools = new Set(allTools);

      // If the size of the Set is different from the length of the combined array,
      // it means there was at least one duplicate tool across the categories.
      expect(uniqueTools.size).toBe(allTools.length);
    });
  });
});
