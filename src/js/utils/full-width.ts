// Full-width mode utility
// This script applies the full-width preference from localStorage to page uploaders
import { getStoredItem } from './safe-storage.js';

export function initFullWidthMode() {
  const savedFullWidth = getStoredItem('fullWidthMode') !== 'false';

  if (savedFullWidth) {
    applyFullWidthMode(true);
  }
}

export function applyFullWidthMode(enabled: boolean) {
  // Apply to all page uploaders
  const pageUploaders = document.querySelectorAll(
    '#tool-uploader, #signature-editor'
  );
  pageUploaders.forEach((uploader) => {
    if (enabled) {
      uploader.classList.remove('max-w-2xl', 'max-w-4xl', 'max-w-5xl');
    } else {
      // Restore original max-width if not already present
      if (
        !uploader.classList.contains('max-w-2xl') &&
        !uploader.classList.contains('max-w-4xl') &&
        !uploader.classList.contains('max-w-5xl')
      ) {
        uploader.classList.add('max-w-2xl');
      }
    }
  });
}

// Auto-initialize on DOM load
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFullWidthMode);
  } else {
    initFullWidthMode();
  }
}
