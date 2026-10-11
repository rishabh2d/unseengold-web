window.GuidedExploration = (() => {
  const records = new Map((window.GuidedExplorationData || []).map(item => [item.id,item]));
  const escape = value => String(value ?? '').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const safe = value => {try {const parsed = new URL(value);return parsed.protocol==='https:' ? escape(parsed.href) : ''}catch{return ''}};
  function highlighted(text, highlights) {
    const ranges = [];
    for (const [index,highlight] of (highlights || []).entries()) {
      const start = text.indexOf(highlight.phrase);
      if (start < 0 || ranges.some(range=>start<range.end&&start+highlight.phrase.length>range.start)) continue;
      ranges.push({start,end:start+highlight.phrase.length,index});
    }
    ranges.sort((a,b)=>a.start-b.start);
    let markup = '', cursor = 0;
    for (const range of ranges) {
      markup += escape(text.slice(cursor,range.start))+`<button type="button" class="guided-highlight" data-guided-highlight="${range.index}">${escape(text.slice(range.start,range.end))}</button>`;
      cursor = range.end;
    }
    return markup+escape(text.slice(cursor));
  }
  function reading(stop) {
    return `<div class="guided-reader" tabindex="0" role="region" aria-label="Guided reading: ${escape(stop.originalTitle)}"><p class="guided-reader-note">A guided reading of the source · <a href="${safe(stop.url)}" target="_blank" rel="noopener noreferrer">${escape(new URL(stop.url).hostname.replace(/^www\./,''))} ↗</a></p>${stop.sections.map((section,index)=>`<section data-guided-section="${index}"><h3>${escape(section.heading)}</h3>${section.text.split(/\n{2,}/).map(paragraph=>`<p>${highlighted(paragraph,section.highlights)}</p>`).join('')}</section>`).join('')}</div>`;
  }
  function companionNotes(stop) {
    return `<div class="guided-page-notes" aria-label="Notes about this page">${stop.sections.map((section,index)=>`<details><summary>${escape(section.heading)}</summary>${section.text.split(/\n{2,}/).map(paragraph=>`<p>${highlighted(paragraph,section.highlights).replace(/data-guided-highlight="/g,`data-guided-note="${index}" data-guided-highlight="`)}</p>`).join('')}</details>`).join('')}</div>`;
  }
  function frame(stop) {
    if (window.MobileSourcePreviews?.blocked(stop)) return '';
    return `<iframe src="${safe(stop.url)}" loading="lazy" title="${escape(stop.originalTitle)}" sandbox="allow-scripts allow-same-origin allow-forms allow-popups" allow="autoplay; fullscreen" referrerpolicy="strict-origin-when-cross-origin"></iframe>`;
  }
  function markup(post, exploration) {
    const record = records.get(exploration.id);
    if (!record) return '';
    return `<section class="exploration-resources guided-exploration" aria-label="Explore the original sources">${record.stops.map((stop,index)=>{
      const resource = exploration.resources.find(item=>item.url===stop.url);
      const blocked = stop.embeddingStatus==='blocked' || window.MobileSourcePreviews?.blocked(stop);
      const live = !blocked;
      return `<article class="guided-stop" data-guided-post="${escape(exploration.id)}" data-guided-stop="${index}" data-guided-view="${live ? 'live' : 'reader'}"><header class="guided-introduction"><h2>${escape(stop.title)}</h2><p>${escape(stop.intro)}</p>${resource?.price ? `<span class="guided-price">${escape(resource.price)}</span>` : ''}</header><div class="guided-source-bar"><span>${escape(stop.originalTitle)}</span><nav aria-label="View this source">${blocked ? '' : `<button type="button" data-guided-mode="reader" aria-pressed="${!live}">${live ? 'Page unavailable?' : 'Source guide'}</button>`}${blocked ? '' : `<button type="button" data-guided-mode="live" aria-pressed="${live}" ${live ? 'hidden' : ''}>Website</button>`}<a href="${safe(stop.url)}" target="_blank" rel="noopener noreferrer">${blocked ? 'Open original ↗' : 'Open ↗'}</a></nav></div><p class="guided-embed-notice" ${live ? 'hidden' : ''}>${blocked ? escape(stop.embeddingReason || 'This page cannot be displayed here.')+' We’ve prepared a source guide instead.' : 'If the original page will not load, you can read our source guide here.'}</p><div class="guided-layout"><div class="guided-main"><div data-guided-pane="reader" ${live ? 'hidden' : ''}>${reading(stop)}</div><div data-guided-pane="live" class="guided-live" ${live ? '' : 'hidden'}>${live ? frame(stop) : ''}</div></div><aside class="guided-companion" aria-label="Reading companion"><span class="guided-companion-label">Alongside you</span><div class="guided-companion-copy" aria-live="polite"><h3>${escape(live ? stop.guide.title : stop.sections[0].helperTitle)}</h3><p>${escape(live ? stop.guide.text : stop.sections[0].helperText)}</p></div>${companionNotes(stop)}<span class="guided-companion-hint">${live ? 'Read the original page. Open a note here for context.' : 'Scroll the source guide. Hover or tap a highlight for a little more context.'}</span></aside></div><footer class="guided-source-credit">${(stop.sourceURLs || [stop.url]).map((source,i)=>`<a href="${safe(source)}" target="_blank" rel="noopener noreferrer">${i ? 'Supporting source' : 'Original source'} ↗</a>`).join(' · ')}<span>Reviewed Oct 10, 2026</span></footer></article>`;
    }).join('')}</section>`;
  }
  function bind(root) {
    root?.querySelectorAll('[data-guided-stop]').forEach(card => {
      if (card.dataset.guidedBound) return;
      card.dataset.guidedBound='true';
      const stop = records.get(card.dataset.guidedPost)?.stops[Number(card.dataset.guidedStop)];
      if (!stop) return;
      const reader = card.querySelector('.guided-reader'), sections = [...reader.querySelectorAll('[data-guided-section]')];
      const companion = card.querySelector('.guided-companion-copy'), hint = card.querySelector('.guided-companion-hint');
      let mode = stop.embeddingStatus==='blocked' || window.MobileSourcePreviews?.blocked(stop) ? 'reader' : 'live', active = 0, hovered = null, scheduled = false;
      function show(title,text) {companion.querySelector('h3').textContent=title;companion.querySelector('p').textContent=text;}
      function restore() {
        const section = stop.sections[active];
        if (mode==='live') show(stop.guide.title,stop.guide.text);
        else show(section.helperTitle,section.helperText);
      }
      function follow() {
        scheduled=false;
        if (mode!=='reader') return;
        const edge=reader.getBoundingClientRect().top+reader.clientHeight*.3;
        active=0;
        sections.forEach((section,index)=>{if(section.getBoundingClientRect().top<=edge)active=index});
        if(reader.scrollHeight>reader.clientHeight+8 && reader.scrollTop+reader.clientHeight>=reader.scrollHeight-8) active=sections.length-1;
        sections.forEach((section,index)=>section.classList.toggle('is-current',index===active));
        if (!hovered) restore();
      }
      reader.addEventListener('scroll',()=>{if(!scheduled){scheduled=true;requestAnimationFrame(follow)}},{passive:true});
      card.querySelectorAll('[data-guided-mode]').forEach(button=>button.addEventListener('click',()=>{
        mode=button.dataset.guidedMode;
        card.dataset.guidedView=mode;
        card.querySelector('.guided-embed-notice').hidden=mode==='live';
        hovered=null;
        card.querySelectorAll('[data-guided-pane]').forEach(pane=>pane.hidden=pane.dataset.guidedPane!==mode);
        card.querySelectorAll('[data-guided-mode]').forEach(control=>{control.setAttribute('aria-pressed',String(control===button));control.hidden=control.dataset.guidedMode==='live'&&mode==='live';if(control.dataset.guidedMode==='reader')control.textContent=mode==='live'?'Page unavailable?':'Source guide';});
        const live=card.querySelector('[data-guided-pane="live"]');
        if(mode==='live'&&!live.querySelector('iframe'))live.innerHTML=frame(stop);
        hint.textContent=mode==='live'?'Read the original page. Open a note here for context.':'Scroll the source guide. Hover or tap a highlight for a little more context.';
        restore();if(mode==='reader')follow();
      }));
      card.querySelectorAll('[data-guided-highlight]').forEach(button=>{
        const section=stop.sections[Number(button.dataset.guidedNote ?? button.closest('[data-guided-section]').dataset.guidedSection)];
        const highlight=section.highlights[Number(button.dataset.guidedHighlight)];
        const explain=()=>{hovered=button;show(highlight.phrase,highlight.explanation)};
        const leave=()=>{if(hovered===button){hovered=null;restore()}};
        button.addEventListener('pointerenter',explain);button.addEventListener('pointerleave',leave);
        button.addEventListener('focus',explain);button.addEventListener('blur',leave);
        button.addEventListener('click',explain);
      });
      reader.addEventListener('keydown',event=>{if(event.key==='Escape'){hovered=null;restore()}});
      if(mode==='reader')follow();
    });
  }
  return {markup,bind};
})();
