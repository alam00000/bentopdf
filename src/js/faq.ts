// Simple FAQ accordion handler for standalone pages
window.addEventListener('load', () => {
    const faqAccordion = document.getElementById('faq-accordion');
    if (faqAccordion) {
        faqAccordion.addEventListener('click', (e) => {
            const questionButton = (e.target as HTMLElement).closest('.faq-question');
            if (!questionButton) return;

            const faqItem = questionButton.parentElement;
            const answer = faqItem?.querySelector('.faq-answer') as HTMLElement;

            if (!faqItem || !answer) return;

            faqItem.classList.toggle('open');

            if (faqItem.classList.contains('open')) {
                answer.style.maxHeight = answer.scrollHeight + 'px';
            } else {
                answer.style.maxHeight = '0px';
            }
        });
    }
});
