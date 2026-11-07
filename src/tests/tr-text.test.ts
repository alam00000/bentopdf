import { describe, it, expect } from 'vitest';
import { trHtml, trText } from '../js/i18n/i18n';
import { fillPlaceholders } from '../js/i18n/placeholders';

describe('Arabic text resources', () => {
  it('fills Arabic display placeholders', () => {
    expect(trText('الصفحة {{n}}', { n: 3 })).toBe('الصفحة 3');
  });
  it('uses the bundled Arabic translation even before initialization', () => {
    expect(
      trText('Adding {{insertCount}} blank pages...', { insertCount: 3 })
    ).toBe('جارٍ إضافة 3 صفحات فارغة...');
  });
  it('finds complete message keys containing punctuation', () => {
    expect(trText('Incorrect password. Please try again.')).toBe(
      'كلمة المرور غير صحيحة. يرجى المحاولة مرة أخرى.'
    );
  });
  it('preserves already Arabic text and technical data', () => {
    expect(trText('نص مخصص {{x}}', { x: 'جديد' })).toBe('نص مخصص جديد');
    expect(trText('PDF/A-2b')).toBe('PDF/A-2b');
  });
  it('keeps unknown placeholders visible', () => {
    expect(trText('مرحبًا {{name}}', { other: 1 })).toBe('مرحبًا {{name}}');
  });
});

describe('HTML escaping and placeholder safety', () => {
  it('escapes both the message and interpolated data', () => {
    expect(
      trHtml('تسمية "{{name}}" <b>', { name: '<img src=x onerror=1>' })
    ).toBe('تسمية &quot;&lt;img src=x onerror=1&gt;&quot; &lt;b&gt;');
  });
  it('does not interpolate inherited object properties', () => {
    expect(fillPlaceholders('{{constructor}} {{n}}', { n: 2 })).toBe(
      '{{constructor}} 2'
    );
  });
});
