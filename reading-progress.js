/* Keep reading progress beside the active left-panel card. */
(function () {
  const stage = document.querySelector('.post-stage');
  const panel = document.querySelector('.post-position');
  const feed = document.querySelector('#feed');
  if (!stage || !panel || !feed) return;
  const meter = document.createElement('div');
  meter.className = 'reading-progress-pill';
  meter.hidden = true;
  meter.setAttribute('role', 'progressbar');
  meter.setAttribute('aria-label', 'Post reading progress');
  meter.setAttribute('aria-valuemin', '0');
  meter.setAttribute('aria-valuemax', '100');
  meter.innerHTML = '<span class="reading-progress-fill"></span><span class="reading-progress-marker"><span class="reading-progress-value">0%</span></span>';
  const rail = document.createElement("div");
  rail.className = "reading-progress-rail";
  rail.append(meter);
  stage.append(rail);
  let frame, activeCard = null;
  function update() {
    const card = feed.querySelector('.feed-item[aria-current="true"] .post-reading');
    const content = card?.querySelector('.post-reading-content');
    const likes = card?.querySelector('.post-actions-likes');
    if (!content || document.body.classList.contains('layout-compact')) { meter.hidden = true; return; }
    const view = panel.getBoundingClientRect();
    const item = card.closest('.feed-item');
    const surface = item.getBoundingClientRect();
    const text = content.getBoundingClientRect();
    const article = card.getBoundingClientRect();
    const anchor = (likes || card.querySelector('.post-reading-head')).getBoundingClientRect();
    if (article.bottom <= view.top || article.top >= view.bottom) { meter.hidden = true; return; }
    // Measure the starting view with this card aligned at the panel's top.
    // Scrolling into a long card partway through must not classify it as short.
    const restingTop = surface.top + panel.scrollTop - item.offsetTop;
    const initialProgress = Math.max(0, Math.min(1,
      (view.bottom - (restingTop + text.top - surface.top)) / (text.height + 16)));
    // The final line needs a small breathing gap below it before reaching 100%.
    const progress = Math.max(0, Math.min(1, (view.bottom - text.top) / (text.height + 16)));
    const percent = progress === 1 ? 100 : Math.floor(progress * 100);
    const height = Math.min(64, Math.max(38, view.height * .1)) * 1.25;
    const newPost = card !== activeCard;
    if (newPost) {
      // Never animate from the previous post's reading position.
      meter.classList.add('is-resetting');
      activeCard = card;
    }
    meter.style.setProperty('--reading-progress', progress);
    meter.setAttribute('aria-valuenow', String(percent));
    const label = meter.querySelector('.reading-progress-value');
    if (label.textContent !== percent + '%') label.textContent = percent + '%';
    // Almost entirely visible posts don't need a meter; completed ones hide it.
    if (initialProgress >= .9 || progress === 1) {
      meter.hidden = true;
      meter.classList.remove('is-resetting');
      return;
    }
    meter.hidden = false;
    // Float at the panel's bottom-right rather than travelling with the card.
    rail.style.top = (view.bottom - height - 16) + 'px';
    rail.style.left = Math.min(view.right - meter.offsetWidth - 6, anchor.right - meter.offsetWidth / 2 + 12) + 'px';
    meter.style.height = height + 'px';
    if (newPost) {
      // Commit this post's own value before re-enabling smooth scroll updates.
      void meter.offsetHeight;
      meter.classList.remove('is-resetting');
    }
  }
  function schedule() { cancelAnimationFrame(frame); frame = requestAnimationFrame(update); }
  panel.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule, { passive: true });
  new MutationObserver(schedule).observe(feed, { childList: true, subtree: true, attributes: true, attributeFilter: ['aria-current'] });
  const resize = new ResizeObserver(schedule);
  resize.observe(panel);
  resize.observe(feed);
  feed.addEventListener('load', schedule, true);
  document.fonts?.ready.then(schedule);
  schedule();
})();
