(() => {
  const section = document.querySelector('#opiniones-google');
  const track = document.querySelector('#reviews-track');
  const dots = document.querySelector('#reviews-dots');
  const summary = document.querySelector('#reviews-summary');
  if (!section || !track || !dots || !summary) return;

  const reviews = [
    {
      authorName: "Alexandra Fdez",
      dateLabel: "Hace 6 meses",
      comment: "Me ha gustado mucho el trato y la profesionalidad que se nota que tiene, me ha dejado estupenda y juraría que puede peinarte hasta con los ojos cerrados jeje, ¡un acierto!!!"
    },
    {
      authorName: "Mayte Golf",
      dateLabel: "Hace 6 meses",
      comment: "Contentísima, me dejé aconsejar por Jorge y todo un acierto... mi pelo ha vuelto a la vida y voy a seguir yendo a él porque es todo un profesional, nada de venderte productos y tratamientos que no necesitas, él te recomienda en base a lo que tu pelo necesita, sin excesos... un 10!!!!"
    },
    {
      authorName: "Maria Almendros",
      dateLabel: "Hace 7 meses",
      comment: "Mi peluquería de confianza. Recomiendo a Jorge por ser un gran profesional, sincero y porque siempre acabo contenta con los resultados 😍…"
    },
    {
      authorName: "Patricia Fuster Bosch",
      dateLabel: "Hace un año",
      comment: "Recomendable 100x100 en todos los aspectos, te asesora lo mejor para tu estilo en corte, tinte, peinado... Buenas manos y productos."
    },
    {
      authorName: "Javier Mateo",
      dateLabel: "Hace un año",
      comment: "Encantado con Jorge. Sin colas, no te hace esperar, servicio rápido y muy bueno. Ya me ha cambiado el look un par de veces... Y las que quedan."
    }
  ];

  const make = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = text;
    return node;
  };

  const previous = section.querySelector('[data-review-direction="-1"]');
  const next = section.querySelector('[data-review-direction="1"]');
  const carousel = section.querySelector('.reviews-carousel');
  let index = 0;
  let timer = null;
  let pauseAuto = false;

  const show = (nextIndex) => {
    index = (nextIndex + reviews.length) % reviews.length;
    track.style.transform = 'translateX(-' + (index * 100) + '%)';
    [...dots.children].forEach((dot, dotIndex) => {
      if (dotIndex === index) dot.setAttribute('aria-current', 'true');
      else dot.removeAttribute('aria-current');
    });
  };

  const render = () => {
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
      const authorName = make('span', '', review.authorName);
      const dateNode = make('span', 'review-card-date', ' · ' + review.dateLabel);
      authorName.append(dateNode);
      author.append(mark, authorName);
      card.append(top, comment, author);
      track.append(card);

      const dot = make('button', 'reviews-dot');
      dot.type = 'button';
      dot.setAttribute('aria-label', 'Mostrar reseña ' + (reviewIndex + 1));
      dot.addEventListener('click', () => show(reviewIndex));
      dots.append(dot);
    });

    summary.replaceChildren(
      make('span', 'reviews-summary-label', 'Opiniones seleccionadas'),
      make('span', 'reviews-summary-rating', '5 reseñas'),
      make('span', 'reviews-summary-stars', '★★★★★'),
      make('span', 'reviews-summary-count', 'Todas de cinco estrellas')
    );
    show(0);
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

  render();
  startAuto();
})();
