import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../js/i18n/language-switcher.js', () => ({
  createLanguageSwitcher: () => document.createElement('div'),
}));

const section = (key: string, heading: string) =>
  `<section><h2 data-i18n="${key}">${heading}</h2></section>`;

describe('simple mode tool page sections', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubGlobal('__SIMPLE_MODE__', true);
  });

  it('hides How It Works, Related Tools and FAQ on translated pages', async () => {
    document.body.innerHTML =
      section('howItWorks.title', 'Ako to funguje') +
      section('relatedTools.title', 'Súvisiace PDF nástroje') +
      section('faq.sectionTitle', 'Často kladené otázky') +
      section('tools:addPageLabels.relatedToolsTitle', 'Súvisiace nástroje') +
      section('tools:mergePdf.name', 'Spojiť PDF');
    await import('../js/utils/simple-mode-footer');
    const shown = [...document.querySelectorAll('section')]
      .filter((s) => s.style.display !== 'none')
      .map((s) => s.textContent);
    expect(shown).toEqual(['Spojiť PDF']);
  });

  it('still hides the sections by their English heading', async () => {
    document.body.innerHTML =
      '<section><h2>Frequently Asked Questions</h2></section>';
    await import('../js/utils/simple-mode-footer');
    expect(document.querySelector('section')!.style.display).toBe('none');
  });
});
