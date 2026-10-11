/* Compact rows share the existing post and source renderers. No content is rewritten. */
(function (global) {
  'use strict';

  const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character]);

  function rowText(post) {
    return String(post?.xText || post?.summary || post?.title || 'Open post').replace(/\s+/g, ' ').trim();
  }

  function postKey(post, index) {
    return post?.url || `compact-post-${index}`;
  }

  function likesText(post, format = String) {
    const value = post?.xLikes;
    return value == null || typeof value === 'boolean' || (typeof value === 'string' && !value.trim()) || !Number.isFinite(Number(value)) || Number(value) < 0
      ? '—' : format(Number(value));
  }

  function httpURL(value) {
    try {
      const url = new URL(String(value || ''));
      return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
    } catch { return ''; }
  }

  function collectAttachments(post, sources = []) {
    const links = (Array.isArray(sources) ? sources : []).flatMap((source, index) => {
      const url = httpURL(typeof source === 'string' ? source : source?.url);
      return url ? [{type: 'source', index, url, title: source?.title || `Source ${index + 1}`}]: [];
    });
    const media = (Array.isArray(post?.xMedia) ? post.xMedia : []).flatMap((item, index) => {
      if (!item || !['photo', 'video', 'animated_gif'].includes(item.type)) return [];
      const url = httpURL(item.url), poster = httpURL(item.previewImageURL);
      if (!url && !poster) return [];
      const type = item.type === 'photo' ? 'image' : 'video';
      return [{type, index, url: url || poster, mediaURL: url, poster,
        title: item.altText || `${type === 'image' ? 'Image' : 'Video'} ${index + 1}`}];
    });
    return [...links, ...media];
  }

  function clampPreviewSize(width, height) {
    return {width: Math.max(0, width - 48), height: Math.max(0, height - 48)};
  }

  const glyphs = {
    source: '<path d="m9 15 6-6M7 17H6a4 4 0 0 1-3-7l4-4a4 4 0 0 1 6 0m-2 12a4 4 0 0 0 6 0l4-4a4 4 0 0 0-3-7h-1"/>',
    image: '<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8" cy="8" r="1.5"/><path d="m3 17 5-5 4 4 4-7 5 8"/>',
    video: '<rect x="3" y="4" width="18" height="16" rx="3"/><path d="m10 8 6 4-6 4Z"/>'
  };
  const icon = type => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true">${glyphs[type]}</svg>`;

  let expanded = null, options = null, preview = null, previewTrigger = null;
  let previewAttachment = null, closeTimer = null, triggerHovered = false, popupHovered = false;
  let suppressFocus = false;

  function documentForFeed() { return global.document; }

  function closePreview({restoreFocus = false} = {}) {
    clearTimeout(closeTimer);
    const trigger = previewTrigger;
    if (preview) {
      preview.querySelectorAll('video').forEach(video => video.pause());
      preview.hidden = true;
      preview.querySelector('.compact-preview-body').replaceChildren();
    }
    previewTrigger = null;
    previewAttachment = null;
    triggerHovered = popupHovered = false;
    if (restoreFocus && trigger?.isConnected) {
      suppressFocus = true;
      trigger.focus({preventScroll: true});
      suppressFocus = false;
    }
  }

  function scheduleClose() {
    clearTimeout(closeTimer);
    closeTimer = setTimeout(() => {
      const focused = documentForFeed()?.activeElement;
      if (!triggerHovered && !popupHovered && focused !== previewTrigger && !preview?.contains(focused)) closePreview();
    }, 220);
  }

  function resizePreview() {
    if (!preview) return;
    const size = clampPreviewSize(global.innerWidth, global.innerHeight);
    preview.style.maxWidth = `${size.width}px`;
    preview.style.maxHeight = `${size.height}px`;
  }

  function ensurePreview() {
    if (preview?.isConnected) return preview;
    const document = documentForFeed();
    preview = document.getElementById('compact-preview') || document.createElement('section');
    preview.id = 'compact-preview';
    preview.className = 'compact-preview';
    preview.hidden = true;
    preview.setAttribute('role', 'region');
    preview.setAttribute('aria-label', 'Attachment preview');
    preview.innerHTML = '<header class="compact-preview-head"><strong></strong><a class="compact-preview-open" target="_blank" rel="noopener noreferrer">Open original ↗</a><button type="button" class="compact-preview-close" aria-label="Close attachment preview">×</button></header><div class="compact-preview-body"></div>';
    document.body.append(preview);
    preview.addEventListener('pointerenter', () => {popupHovered = true; clearTimeout(closeTimer);});
    preview.addEventListener('pointerleave', () => {popupHovered = false; scheduleClose();});
    preview.addEventListener('focusin', () => clearTimeout(closeTimer));
    preview.addEventListener('focusout', scheduleClose);
    preview.querySelector('.compact-preview-close').onclick = () => closePreview({restoreFocus: true});
    preview.addEventListener('click', event => {
      const tab = event.target.closest('[data-source-index]');
      if (!tab || !previewAttachment || previewAttachment.type !== 'source') return;
      const index = Number(tab.dataset.sourceIndex);
      const source = collectAttachments(previewAttachment.post, options.sourceLinks?.(previewAttachment.post))
        .find(item => item.type === 'source' && item.index === index);
      if (!source) return;
      event.preventDefault();
      showPreview(previewTrigger, source, previewAttachment.post);
    });
    document.addEventListener('keydown', event => {
      if (event.key !== 'Escape' || preview.hidden) return;
      event.preventDefault();
      closePreview({restoreFocus: preview.contains(document.activeElement)});
    });
    global.addEventListener('resize', resizePreview);
    return preview;
  }

  function showPreview(trigger, attachment, post) {
    if (!options || !trigger) return;
    clearTimeout(closeTimer);
    const panel = ensurePreview();
    if (!panel.hidden && previewTrigger === trigger && previewAttachment?.index === attachment.index && previewAttachment?.type === attachment.type) return;
    previewTrigger = trigger;
    previewAttachment = {...attachment, post};
    panel.className = `compact-preview compact-preview--${attachment.type}`;
    panel.querySelector('.compact-preview-head strong').textContent = attachment.title;
    panel.querySelector('.compact-preview-open').href = attachment.url;
    const body = panel.querySelector('.compact-preview-body');
    panel.querySelectorAll('video').forEach(video => video.pause());
    body.replaceChildren();
    if (attachment.type === 'source') {
      // This renderer is trusted application markup. Frames are created only here, on hover/focus.
      body.innerHTML = options.sourceMarkup?.(post, attachment.index) ||
        `<p><a href="${options.safe(attachment.url)}" target="_blank" rel="noopener noreferrer">${options.escape(attachment.title)} ↗</a></p>`;
      body.querySelectorAll('iframe').forEach(frame => {frame.removeAttribute('allow'); frame.loading = 'eager';});
    } else if (attachment.type === 'video' && attachment.mediaURL) {
      const video = documentForFeed().createElement('video');
      video.controls = true;
      video.muted = true;
      video.playsInline = true;
      video.preload = 'metadata';
      video.src = attachment.mediaURL;
      if (attachment.poster) video.poster = attachment.poster;
      video.setAttribute('aria-label', attachment.title);
      body.append(video);
    } else {
      const image = documentForFeed().createElement('img');
      image.src = attachment.type === 'image' ? attachment.mediaURL || attachment.url : attachment.poster || attachment.url;
      image.alt = attachment.title;
      body.append(image);
    }
    panel.hidden = false;
    resizePreview();
  }

  function setExpanded(value) { expanded = value == null ? null : String(value); }
  function getExpanded() { return expanded; }

  function render(nextOptions) {
    const document = documentForFeed();
    if (!document) throw new Error('CompactFeed.render requires a browser document.');
    options = {escape: escapeHTML, safe: value => escapeHTML(httpURL(value)), number: String, ...nextOptions};
    const posts = Array.isArray(options.posts) ? options.posts : [];
    const mount = document.getElementById('compact-feed');
    if (!mount) throw new Error('CompactFeed.render requires #compact-feed.');
    const expandedIndex = posts.findIndex((post, index) => postKey(post, index) === expanded);
    if (expandedIndex < 0) expanded = null;
    closePreview();
    const previousDetail = mount.querySelector('.compact-detail');
    const previousScroll = previousDetail ? {
      key: previousDetail.dataset.postUrl,
      detail: previousDetail.scrollTop,
      post: previousDetail.querySelector('.compact-post-full')?.scrollTop || 0,
      insights: previousDetail.querySelector('#insights')?.scrollTop || 0
    } : null;
    // Preserve the live discussion node when replacing the surrounding expanded row.
    const insights = mount.querySelector('#insights');
    if (insights) (document.getElementById('viewer') || document.body).append(insights);
    const focusedIndex = mount.contains(document.activeElement) && document.activeElement.matches('.compact-toggle')
      ? document.activeElement.closest('[data-feed-index]')?.dataset.feedIndex : null;
    const attachments = posts.map(post => collectAttachments(post, options.sourceLinks?.(post)));
    const grid = options.layout === 'grid';
    mount.innerHTML = `<div class="compact-list${grid ? ' compact-grid' : ''}" role="list">${posts.map((post, index) => {
      const open = index === expandedIndex, detailID = `compact-detail-${index}`;
      const likes = likesText(post, options.number);
      const name = String(post.xAuthorName || post.author || post.xUsername || 'X post');
      const avatarURL = httpURL(post.xAvatarURL);
      const avatar = avatarURL ? `<img src="${options.safe(avatarURL)}" alt="" loading="lazy">` : options.escape(name[0]);
      const buttonContent = grid
        ? `<span class="related-post-header"><span class="related-post-avatar">${avatar}</span><span class="related-post-identity"><strong>${options.escape(name)}</strong><span>${post.xUsername ? '@' + options.escape(post.xUsername) : ''}</span></span></span><span class="related-post-body compact-excerpt">${options.escape(rowText(post))}</span>`
        : `<span class="compact-chevron" aria-hidden="true">${open ? '⌄' : '›'}</span><span class="compact-author">${options.escape(name)}</span><span class="compact-excerpt">${options.escape(rowText(post))}</span>`;
      const attachmentControls = `<nav class="compact-attachments" aria-label="Post attachments">${attachments[index].map((attachment, attachmentIndex) => `<a class="compact-attachment compact-attachment--${attachment.type}" data-attachment-index="${attachmentIndex}" href="${options.safe(attachment.url)}" target="_blank" rel="noopener noreferrer" aria-label="${options.escape(attachment.title)} (opens original; focus for preview)" title="${options.escape(attachment.title)}">${icon(attachment.type)}</a>`).join('')}</nav><span class="compact-likes" aria-label="${options.escape(likes)} likes">${options.escape(likes)}</span>`;
      return `<div class="compact-item${grid ? ' compact-grid-item' : ''}${open ? ' is-expanded' : ''}" role="listitem" data-feed-index="${index}" data-left-view="${options.escape(options.leftView?.(post) || 'original')}"${post === options.activePost ? ' aria-current="true"' : ''}>
        <div class="compact-row"><button type="button" class="compact-toggle${grid ? ' compact-grid-card related-post' : ''}" aria-expanded="${open}"${open ? ` aria-controls="${detailID}"` : ''}>${buttonContent}</button>${grid ? `<div class="compact-grid-footer">${attachmentControls}</div>` : attachmentControls}</div>
        ${open ? `<div class="compact-detail" id="${detailID}" data-post-url="${options.escape(postKey(post, index))}"><div class="compact-post-full">${grid ? '<button type="button" class="grid-post-back" aria-label="Back to grid">← Back</button>' : ''}${options.card(post)}</div><div class="compact-insights-slot"></div></div>` : ''}</div>`;
    }).join('')}</div>`;
    mount.querySelectorAll('.compact-item').forEach((item, index) => {
      function toggle() {
        setExpanded(expanded === postKey(posts[index], index) ? null : postKey(posts[index], index));
        if (typeof options.onSelect === 'function') options.onSelect(index);
        else render(options);
      }
      item.querySelector('.compact-toggle').onclick = event => {event.stopPropagation(); toggle();};
      item.querySelector('.compact-row').onclick = event => {if (!event.target.closest('a,button,input')) toggle();};
      const back = item.querySelector('.grid-post-back');
      if (back) back.onclick = event => {
        event.stopPropagation();
        setExpanded(null);
        if (typeof options.onSelect === 'function') options.onSelect(index);
        else render(options);
        const card = mount.querySelector(`[data-feed-index="${index}"] .compact-toggle`);
        card?.focus({preventScroll: true});
        card?.scrollIntoView({block: 'nearest', inline: 'nearest'});
      };
      item.querySelectorAll('.compact-attachment').forEach(trigger => {
        const attachment = attachments[index][Number(trigger.dataset.attachmentIndex)];
        trigger.addEventListener('click', event => event.stopPropagation());
        trigger.addEventListener('pointerenter', () => {triggerHovered = true; showPreview(trigger, attachment, posts[index]);});
        trigger.addEventListener('pointerleave', () => {triggerHovered = false; scheduleClose();});
        trigger.addEventListener('focusin', () => {if (!suppressFocus) showPreview(trigger, attachment, posts[index]);});
        trigger.addEventListener('focusout', scheduleClose);
      });
    });
    if (focusedIndex !== null) {
      const focusTarget = grid && Number(focusedIndex) === expandedIndex
        ? mount.querySelector('.grid-post-back')
        : mount.querySelector(`[data-feed-index="${focusedIndex}"] .compact-toggle`);
      focusTarget?.focus({preventScroll: true});
    }
    const detail = mount.querySelector('.compact-detail');
    const samePost = detail && previousScroll?.key === detail.dataset.postUrl;
    const restoreScroll = () => {
      if (!samePost || !detail.isConnected || detail.dataset.postUrl !== expanded) return;
      detail.scrollTop = previousScroll.detail;
      const post = detail.querySelector('.compact-post-full');
      if (post) post.scrollTop = previousScroll.post;
      const panel = detail.querySelector('#insights');
      if (panel) panel.scrollTop = previousScroll.insights;
    };
    restoreScroll();
    return {expandedIndex, detail, insightsSlot: mount.querySelector('.compact-insights-slot'), restoreScroll};
  }

  const controller = {render, setExpanded, getExpanded, closePreview,
    refresh: () => options ? render(options) : null,
    helpers: {rowText, postKey, collectAttachments, clampPreviewSize, likesText, escapeHTML, httpURL}};
  global.CompactFeed = controller;
  if (typeof module !== 'undefined' && module.exports) module.exports = controller;
})(typeof window !== 'undefined' ? window : globalThis);
