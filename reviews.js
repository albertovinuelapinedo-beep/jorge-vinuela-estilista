(() => {
  const section = document.querySelector('#opiniones-google');
  const track = document.querySelector('#reviews-track');
  const dots = document.querySelector('#reviews-dots');
  const summary = document.querySelector('#reviews-summary');
  if (!section || !track || !dots || !summary) return;

  const mapsUrl = 'https://www.google.com/maps/search/?api=1&query=Jorge+Vi%C3%B1uela+Estilista+Calle+Benlliure+12+Sant+Vicent+del+Raspeig';
  const previous = section.querySelector('[data-review-direction="-1"]');
  const next = section.querySelector('[data-review-direction="1"]');
  const carousel = section.querySelector('.reviews-carousel');
  let reviews = [];
  let index = 0;
  let timer = null;
  let pauseAuto = false;
  let lastReviewId = null;

  const make = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = text;
    return node;
  };

  const formatDate = (value) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' }).format(date);
  };

  const render = (data) => {
    reviews = data.reviews;
    if (!reviews.length) {
      section.hidden = true;
      return;
    }
    index = Math.max(0, reviews.findIndex((review) => review.id === lastReviewId));
    if (index < 0) index = 0;
    section.hidden = false;
    track.replaceChildren();
    dots.replaceChildren();

    reviews.forEach((review, reviewIndex) => {
      const card = make('article', 'review-card');
      card.setAttribute('role', 'group');
      card.setAttribute('aria-roledescription', 'reseña');
      card.setAttribute('aria-label', 'Reseña ' + (reviewIndex + 1) + ' de ' + reviews.length);

      const top = make('div', 'review-card-top');
      const source = make('span', 'review-card-source', 'Reseña publicada en Google');
      const stars = make('span', 'review-card-stars', '★★★★★');
      stars.setAttribute('role', 'img');
      stars.setAttribute('aria-label', '5 de 5 estrellas');
      top.append(source, stars);

      const comment = make('blockquote', 'review-card-comment', review.comment);
      const author = make('div', 'review-card-author');
      const mark = make('span', 'review-card-author-mark', 'G');
      mark.setAttribute('aria-hidden', 'true');
      const authorText = make('span', '', review.authorName);
      author.append(mark, authorText);
      const date = formatDate(review.createTime);
      if (date) {
        const dateNode = make('span', 'review-card-date', ' · ' + date);
        authorText.append(dateNode);
      }
      card.append(top, comment, author);
      track.append(card);

      const dot = make('button', 'reviews-dot');
      dot.type = 'button';
      dot.setAttribute('aria-label', 'Mostrar reseña ' + (reviewIndex + 1));
      dot.addEventListener('click', () => show(reviewIndex));
      dots.append(dot);
    });

    const rating = typeof data.averageRating === 'number' ? data.averageRating.toLocaleString('es-ES', { maximumFractionDigits: 1 }) : '';
    summary.replaceChildren();
    summary.append(
      make('span', 'reviews-summary-label', 'Valoración general en Google'),
      make('span', 'reviews-summary-rating', rating ? rating + ' / 5' : 'Google'),
      make('span', 'reviews-summary-stars', '★★★★★'),
      make('span', 'reviews-summary-count', Number(data.totalReviewCount || 0).toLocaleString('es-ES') + ' opiniones')
    );
    lastReviewId = reviews[index] ? reviews[index].id : null;
    show(index);
    startAuto();
  };

  const show = (nextIndex) => {
    if (!reviews.length) return;
    index = (nextIndex + reviews.length) % reviews.length;
    lastReviewId = reviews[index].id;
    track.style.transform = 'translateX(-' + (index * 100) + '%)';
    [...dots.children].forEach((dot, dotIndex) => {
      if (dotIndex === index) dot.setAttribute('aria-current', 'true');
      else dot.removeAttribute('aria-current');
    });
  };

  const startAuto = () => {
    if (timer) clearInterval(timer);
    if (reviews.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    timer = setInterval(() => {
      if (!pauseAuto && document.visibilityState === 'visible') show(index + 1);
    }, 8000);
  };

  previous?.addEventListener('click', () => show(index - 1));
  next?.addEventListener('click', () => show(index + 1));
  carousel?.addEventListener('mouseenter', () => { pauseAuto = true; });
  carousel?.addEventListener('mouseleave', () => { pauseAuto = false; });
  carousel?.addEventListener('focusin', () => { pauseAuto = true; });
  carousel?.addEventListener('focusout', (event) => {
    if (!carousel.contains(event.relatedTarget)) pauseAuto = false;
  });

  const load = async () => {
    try {
      const response = await fetch('/api/reviews', {
        method: 'GET',
        headers: { Accept: 'application/json' },
        cache: 'no-store'
      });
      if (!response.ok) throw new Error('Google reviews unavailable');
      const data = await response.json();
      if (!Array.isArray(data.reviews)) throw new Error('Invalid reviews payload');
      // Extra client-side guard: never render ratings below five or comments without text.
      data.reviews = data.reviews.filter((review) =>
        review.rating === 5 && typeof review.comment === 'string' && review.comment.trim().length > 0
      );
      render(data);
    } catch (error) {
      // Keep the section hidden when credentials/API approval are not configured.
      section.hidden = true;
      console.info('Google review carousel is waiting for the official API connection.');
    }
  };

  load();
  // The endpoint caches its Google response for 15 minutes; this refreshes a long-open page too.
  window.setInterval(load, 15 * 60 * 1000);
})();
