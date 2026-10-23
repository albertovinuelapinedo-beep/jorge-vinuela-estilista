(() => {
  const items = [...document.querySelectorAll('.gallery-item')];
  const dialog = document.querySelector('.gallery-lightbox');
  if (!items.length || !dialog) return;
  const image = dialog.querySelector('figure img');
  const caption = dialog.querySelector('figcaption');
  let current = 0;
  const open = (index) => {
    current = (index + items.length) % items.length;
    const thumb = items[current].querySelector('img');
    image.src = thumb.src;
    image.alt = thumb.alt;
    caption.textContent = items[current].querySelector('strong')?.textContent || thumb.alt;
    if (!dialog.open) dialog.showModal();
  };
  items.forEach((item, index) => item.addEventListener('click', () => open(index)));
  dialog.querySelector('.lightbox-close').addEventListener('click', () => dialog.close());
  dialog.querySelector('.lightbox-prev').addEventListener('click', () => open(current - 1));
  dialog.querySelector('.lightbox-next').addEventListener('click', () => open(current + 1));
  dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') { event.preventDefault(); open(current - 1); }
    if (event.key === 'ArrowRight') { event.preventDefault(); open(current + 1); }
  });
})();