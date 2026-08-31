/**
 * Touch feedback. Native apps answer every tap - iOS with a subtle haptic,
 * Android with a short vibration - and its absence is one of the loudest
 * "this is a web page" tells.
 */
import { hasPlugin } from './platform.js';

type ImpactWeight = 'light' | 'medium';

const impact = async (weight: ImpactWeight): Promise<void> => {
  if (!hasPlugin('Haptics')) return;
  try {
    const { Haptics, ImpactStyle } = await import('@capacitor/haptics');
    await Haptics.impact({
      style: weight === 'medium' ? ImpactStyle.Medium : ImpactStyle.Light,
    });
  } catch {
    // Haptics are a nicety - never let them break an interaction.
  }
};

export const tapFeedback = (): void => void impact('light');
export const confirmFeedback = (): void => void impact('medium');

/** Elements that represent a real action and therefore deserve a tick. */
const FEEDBACK_SELECTOR = [
  'button',
  '[role="button"]',
  'a[href]',
  '.tool-card',
  '.native-tab',
  'input[type="checkbox"]',
  'input[type="radio"]',
  'label[for]',
].join(',');

export const initTouchFeedback = (): void => {
  document.addEventListener(
    'pointerdown',
    (event) => {
      if (event.pointerType !== 'touch') return;
      const target = (event.target as Element | null)?.closest?.(
        FEEDBACK_SELECTOR
      );
      if (!target || target.hasAttribute('disabled')) return;
      tapFeedback();
    },
    { passive: true, capture: true }
  );
};
