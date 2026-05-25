 document.getElementById('faqGrid').addEventListener('click', function (e) {
    const btn = e.target.closest('.faq-btn');
    if (!btn) return;

    const item   = btn.closest('.faq-item');
    const col    = btn.closest('.faq-col');   // only close others in the SAME column
    const isOpen = item.classList.contains('open');

    // Close all items in this column only
    col.querySelectorAll('.faq-item').forEach(i => {
      i.classList.remove('open');
      i.querySelector('.faq-btn').setAttribute('aria-expanded', 'false');
    });

    // If it was closed, open it
    if (!isOpen) {
      item.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
    }
  });