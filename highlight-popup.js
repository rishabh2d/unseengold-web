/* Local explanations for highlighted post text, rendered as plain text. */
(function (global) {
  'use strict';

  let popup = null, anchor = null, positionFrame = null;
  let restoringFocus = false, answerKey = '';

  function clampPosition(rect, popupWidth, popupHeight, viewportWidth, viewportHeight) {
    const margin = 12, gap = 0;
    const left = Math.max(margin, Math.min(rect.left, viewportWidth - popupWidth - margin));
    const preferredTop = rect.bottom + gap + popupHeight <= viewportHeight - margin
      ? rect.bottom + gap : rect.top - gap - popupHeight;
    const top = Math.max(margin, Math.min(preferredTop, viewportHeight - popupHeight - margin));
    return {left, top};
  }

  function closeNow({restoreFocus = false} = {}) {
    const previousAnchor = anchor;
    previousAnchor?.classList.remove('is-explaining');
    if (popup) popup.hidden = true;
    anchor = null;
    if (restoreFocus && previousAnchor?.isConnected) {
      restoringFocus = true;
      previousAnchor.focus({preventScroll: true});
      restoringFocus = false;
    }
  }

  function hide({immediate = false, relatedTarget = null} = {}) {
    if (!immediate && relatedTarget && (popup?.contains(relatedTarget) || anchor?.contains(relatedTarget))) return;
    closeNow();
  }

  function position() {
    if (!popup || popup.hidden) return;
    if (!anchor?.isConnected) { closeNow(); return; }
    const rect = anchor.getBoundingClientRect();
    const width = global.innerWidth, height = global.innerHeight;
    popup.style.maxWidth = `${Math.max(0, width - 24)}px`;
    popup.style.maxHeight = `${Math.max(0, height - 24)}px`;
    const bounds = popup.getBoundingClientRect();
    const placed = clampPosition(rect, bounds.width, bounds.height, width, height);
    popup.style.left = `${placed.left}px`;
    popup.style.top = `${placed.top}px`;
  }

  function schedulePosition() {
    if (positionFrame !== null) return;
    positionFrame = global.requestAnimationFrame(() => {positionFrame = null; position();});
  }

  function ensurePopup() {
    if (popup?.isConnected) return popup;
    const document = global.document;
    popup = document.getElementById('post-highlight-popup') || document.createElement('section');
    popup.id = 'post-highlight-popup';
    popup.className = 'post-highlight-popup';
    popup.hidden = true;
    popup.setAttribute('role', 'region');
    popup.setAttribute('aria-label', 'Highlighted text explanation');
    popup.innerHTML = '<header><strong class="post-highlight-popup-question"></strong></header><div class="post-highlight-popup-answer"></div>';
    document.body.append(popup);
    popup.addEventListener('pointerleave', event => hide({relatedTarget: event.relatedTarget}));
    popup.addEventListener('focusout', event => hide({relatedTarget: event.relatedTarget}));
    document.addEventListener('keydown', event => {
      if (event.key !== 'Escape' || popup.hidden) return;
      event.preventDefault();
      event.stopPropagation();
      closeNow({restoreFocus: popup.contains(document.activeElement)});
    });
    document.addEventListener('scroll', schedulePosition, {capture: true, passive: true});
    global.addEventListener('resize', schedulePosition);
    return popup;
  }

  function show({anchor: nextAnchor, question = '', answer = '', showHeading = true} = {}) {
    if (restoringFocus) return;
    if (!nextAnchor?.isConnected || typeof nextAnchor.getBoundingClientRect !== 'function') return;
    const panel = ensurePopup();
    panel.classList.toggle('post-highlight-popup--content-only', !showHeading);
    panel.querySelector('header').hidden = !showHeading;
    panel.setAttribute('aria-label', showHeading ? 'Highlighted text explanation' : String(question || 'Post context'));
    const same = anchor === nextAnchor && panel.querySelector('.post-highlight-popup-question').textContent === String(question ?? '')
      && answerKey === JSON.stringify(answer ?? '');
    if (anchor !== nextAnchor) anchor?.classList.remove('is-explaining');
    anchor = nextAnchor;
    anchor.classList.add('is-explaining');
    if (!same) {
        panel.querySelector('.post-highlight-popup-question').textContent = String(question ?? '');
      answerKey = JSON.stringify(answer ?? '');
      const answerNode = panel.querySelector('.post-highlight-popup-answer');
      answerNode.replaceChildren();
      if (Array.isArray(answer)) {
        const list = global.document.createElement('ul');
        for (const point of answer) {const item = global.document.createElement('li'); item.textContent = String(point); list.append(item);}
        answerNode.append(list);
      } else answerNode.textContent = String(answer ?? '');
      panel.querySelector('.post-highlight-popup-answer').scrollTop = 0;
    }
    panel.hidden = false;
    position();
  }

  const controller = {show, hide, helpers: {clampPosition}};
  global.PostHighlightPopup = controller;
  if (typeof module !== 'undefined' && module.exports) module.exports = controller;
})(typeof window !== 'undefined' ? window : globalThis);
