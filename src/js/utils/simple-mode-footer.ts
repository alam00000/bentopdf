// Handle simple mode adjustments for tool pages
if (__SIMPLE_MODE__) {
  const sectionsToHide = [
    'طريقة الاستخدام',
    'أدوات PDF ذات صلة',
    'أدوات ذات صلة',
    'الأسئلة الشائعة',
  ];

  const keysToHide = [
    'howItWorks.title',
    'relatedTools.title',
    'faq.sectionTitle',
  ];

  document.querySelectorAll('section').forEach((section) => {
    const h2 = section.querySelector('h2');
    if (h2) {
      const heading = h2.textContent?.trim() || '';
      const key = h2.getAttribute('data-i18n') || '';
      if (
        keysToHide.includes(key) ||
        sectionsToHide.some((text) => heading.includes(text))
      ) {
        (section as HTMLElement).style.display = 'none';
      }
    }
  });
}
