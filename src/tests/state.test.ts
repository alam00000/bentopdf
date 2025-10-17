import { state, resetState } from '@/js/state';
import { describe, it, expect, beforeEach } from 'vitest';

describe('State Management', () => {
  // Test the initial state on import
  describe('Initial State', () => {
    it('should have the correct initial values', () => {
      expect(state.activeTool).toBeNull();
      expect(state.files).toEqual([]); // Use toEqual for arrays/objects
      expect(state.pdfDoc).toBeNull();
      expect(state.pdfPages).toEqual([]);
      expect(state.currentPdfUrl).toBeNull();
    });
  });

  // Test the resetState function
  describe('resetState function', () => {
    // Before each test in this block, we'll "dirty" the state
    // to ensure the reset function is actually doing something.
    beforeEach(() => {
      // 1. Modify the state properties to non-default values
      state.activeTool = 'merge';
      state.files = [{ name: 'dummy.pdf', size: 1234 } as File];
      state.pdfDoc = { numPages: 5 }; // Mock PDF document object
      state.pdfPages = [{}, {}]; // Mock page objects
      state.currentPdfUrl = 'blob:http://localhost/some-uuid';

      // 2. Create the DOM element that the function interacts with
      //    The setup.ts file will clean this up automatically after each test.
      document.body.innerHTML =
        '<div id="tool-content">Some old tool content</div>';
    });

    it('should reset all state properties to their initial values', () => {
      // Call the function to test
      resetState();

      // Assert that all properties are back to their default state
      expect(state.activeTool).toBeNull();
      expect(state.files).toEqual([]);
      expect(state.pdfDoc).toBeNull();
      expect(state.pdfPages).toEqual([]);
      expect(state.currentPdfUrl).toBeNull();
    });

    it('should clear the innerHTML of the #tool-content element', () => {
      const toolContentElement = document.getElementById('tool-content');

      // Sanity check: ensure the content exists before resetting
      expect(toolContentElement?.innerHTML).toBe('Some old tool content');

      // Call the function to test
      resetState();

      // Assert that the element's content has been cleared
      expect(toolContentElement?.innerHTML).toBe('');
    });
  });
});
