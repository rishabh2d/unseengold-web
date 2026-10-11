window.PostExplorations = (() => {
  const records = new Map((window.PostExplorationData || []).map(item => [item.id, item]));
  const text = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const url = value => { try { const parsed = new URL(value); return parsed.protocol === 'https:' ? text(parsed.href) : ''; } catch { return ''; } };
  function lookup(post) {
    if (records.has(post?.url)) return records.get(post.url);
    if (typeof posts !== 'undefined' && typeof ThreadReading !== 'undefined') {
      const root = posts.find(candidate => records.has(candidate.url) && ThreadReading.parts(candidate).some(part => part.url === post?.url));
      if (root) return records.get(root.url);
    }
    return null;
  }
  function overview(post) {
    const item = lookup(post);
    const summary = item?.overview || post?.xSummary;
    return `<div class="discussion-content-toolbar questions-toolbar exploration-overview"><h2 class="questions-section-heading">${text(summary || 'Overview')}</h2></div>`;
  }
  function question(entry, index) {
    const sources = (entry.sources || []).filter(source => url(source.url));
    return `<details class="exploration-question" data-qa-index="${index}"><summary>${text(entry.question)}<span aria-hidden="true">+</span></summary><div class="exploration-answer"><p>${text(entry.answer)}</p>${sources.length ? `<nav class="exploration-sources" aria-label="Sources for this answer">${sources.map(source => `<a href="${url(source.url)}" target="_blank" rel="noopener noreferrer">${text(source.title)} ↗</a>`).join('')}</nav>` : ''}</div></details>`;
  }
  function questions(post, showHeading = true) {
    const item = lookup(post);
    const entries = item?.questions || (post?.xQuestions || []).map(entry => ({...entry, answer: [entry.answer, ...(typeof DailyReading !== 'undefined' ? DailyReading.details(entry) : [])].filter(Boolean).join('\n\n')}));
    const group = (perspective, title) => `<section class="exploration-question-column" aria-label="${title}">${item ? `<h3>${title}</h3>` : ''}${entries.map((entry, index) => ({entry,index})).filter(({entry}) => !item || (entry.perspective || 'post') === perspective).map(({entry,index}) => question(entry,index)).join('')}</section>`;
    return `<section class="discussion-content-section exploration-questions">${showHeading ? overview(post) : ''}<div class="exploration-question-grid${item ? '' : ' exploration-question-grid--single'}">${entries.length ? group('post','This post') + (item ? group('context','Bigger picture') : '') : '<p>No questions for this post yet.</p>'}</div></section>`;
  }
  function videos(post, showHeading = true) {
    const items = (lookup(post)?.videos || []).filter(item => /(?:youtube\.com\/watch\?v=|youtu\.be\/)[\w-]{11}/.test(item.url));
    if (!items.length) return '';
    return `<section class="exploration-videos" aria-label="Watch and explore">${showHeading ? '<h2>Watch and explore</h2><div class="attachment-rule"></div>' : ''}${items.map(item => {
      const parsed = new URL(item.url), id = parsed.hostname === 'youtu.be' ? parsed.pathname.slice(1) : parsed.searchParams.get('v');
      return `<article data-youtube-video="${text(id)}">${YouTubeReading.toolbar(item.url,item.title)}<div class="youtube-autoplay-stage"><iframe loading="lazy" src="${text(YouTubeReading.frameURL('https://www.youtube-nocookie.com/embed/'+id))}" title="${text(item.title)}" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe></div><h3>${text(item.title)}</h3><p>${text(item.description)}</p><a href="${url(item.url)}" target="_blank" rel="noopener noreferrer">View on YouTube ↗</a></article>`;
    }).join('')}</section>`;
  }
  function resources(post, showHeading = true) {
    const item = lookup(post);
    if (!item?.resources?.length) return '';
    const preview = item.resources.find(resource => resource.url === item.previewURL);
    return `<section class="exploration-resources" aria-label="Products and further exploration">${showHeading ? '<h2>Explore it yourself</h2><div class="attachment-rule"></div>' : ''}<div class="exploration-resource-grid">${item.resources.filter(resource => url(resource.url)).map(resource => `<a class="exploration-resource" href="${url(resource.url)}" target="_blank" rel="noopener noreferrer"><span class="exploration-eyebrow">${text(resource.kind)} <span aria-hidden="true">↗</span></span><h3>${text(resource.title)}</h3>${resource.price ? `<strong class="exploration-price">${text(resource.price)}</strong>` : ''}<p>${text(resource.description)}</p><span class="exploration-domain">${text(new URL(resource.url).hostname.replace(/^www\./,''))}</span></a>`).join('')}</div>${preview ? `<div class="exploration-live-preview"><div class="exploration-preview-head"><strong>${text(preview.title)}</strong><a href="${url(preview.url)}" target="_blank" rel="noopener noreferrer">Open ↗</a></div><iframe src="${url(preview.url)}" loading="lazy" title="Live preview: ${text(preview.title)}" sandbox="allow-scripts allow-same-origin allow-forms allow-popups" referrerpolicy="strict-origin-when-cross-origin"></iframe><p>If the preview is unavailable, <a href="${url(preview.url)}" target="_blank" rel="noopener noreferrer">open the website ↗</a></p></div>` : ''}</section>`;
  }
  function targetIndex(post, index) { return records.get(post?.url)?.annotationTargets?.[index] ?? index; }
  return {lookup,overview,questions,videos,resources,targetIndex};
})();
