/* Light connectors link highlighted phrases to their always-visible notes. */
(function (global) {
  'use strict';
  function noteColumns(centers, width) {
    const columns = centers.map(x => x < width * (centers.length === 1 ? .4 : .5) ? 0 : 1);
    if (centers.length > 1 && (centers.length === 2 || columns.every(c => c === columns[0]))) {
      const sorted = centers.map((x, index) => ({x, index})).sort((a, b) => a.x - b.x);
      sorted.forEach((item, position) => {columns[item.index] = position < Math.ceil(sorted.length / 2) ? 0 : 1;});
    }
    return columns;
  }
  const clamp = (value, low, high) => Math.max(low, Math.min(value, high));
  function connectorGeometry(rects, note, options = {}) {
    if (!rects.length || !note.width || !note.height) return null;
    const middle = note.left + note.width / 2;
    let lean = options.lean ?? (options.width && middle > options.width / 2 ? -1 : 1);
    const angle = options.crowded ? clamp(note.height * .7, 10, 18) : clamp(note.height * 1.6, 24, 40);
    // Attach near the note, including the left-hand words of a wide highlight.
    const rect = rects.reduce((best, item) => {
      const distance = r => Math.max(0, note.left + note.width * .22 - r.left - r.width, r.left - note.left - note.width * .78) + Math.abs(note.top - r.top - r.height) * .35;
      return distance(item) < distance(best) ? item : best;
    });
    const below = note.top >= rect.top + rect.height - 2;
    let start, end;
    if (below) {
      const inset = Math.min(12, rect.width * .12);
      if (options.aligned && rect.width > note.width * 1.25) lean = 0;
      start = {x: clamp(middle - lean * angle, rect.left + inset, rect.left + rect.width - inset), y: rect.top + rect.height};
      // Land within the middle of the note's first line, inside the reading panel.
      end = {x: clamp(start.x + lean * angle, note.left + note.width * .22, note.left + note.width * .78), y: note.top - 6};
      if (options.leftAligned) {
        // The left note is already under the phrase: attach within their shared
        // horizontal space and drop down with only a small inward bend.
        const landingLeft = note.left + Math.min(8, note.width * .08);
        const landingRight = note.left + note.width * .85;
        const overlapLeft = Math.max(rect.left + inset, landingLeft);
        const overlapRight = Math.min(rect.left + rect.width - inset, landingRight);
        if (overlapLeft <= overlapRight) {
          start.x = clamp(rect.left + rect.width / 2, overlapLeft, overlapRight);
          end.x = clamp(start.x - (lean === 0 ? 0 : Math.min(8, angle * .25)), landingLeft, landingRight);
        } else {
          start.x = clamp(landingRight, rect.left + inset, rect.left + rect.width - inset);
          end.x = clamp(start.x, landingLeft, landingRight);
        }
      }
    } else {
      const right = middle > rect.left + rect.width / 2;
      start = {x: right ? rect.left + rect.width : rect.left, y: rect.top + rect.height / 2};
      end = {x: right ? note.left - 6 : note.left + note.width + 6, y: note.top + note.height / 2};
    }
    const dx = end.x - start.x, dy = end.y - start.y;
    // One quadratic arc: no vertical lead-in, S-turn, or final hook.
    const control = {x: start.x + dx * .22, y: start.y + dy * .62};
    return {start, end, control, direction: dx < -1 ? 'left' : dx > 1 ? 'right' : 'down', path: `M ${start.x} ${start.y} Q ${control.x} ${control.y} ${end.x} ${end.y}`};
  }
  function draw(root) {
    for (const line of root.querySelectorAll('.scribble-line')) {
      const svg = line.querySelector('.scribble-arrows');
      if (!svg) continue;
      const initialBox = line.getBoundingClientRect();
      const pairs = Array.from(line.querySelectorAll('.scribble-ring'), ring => ({ring, note: line.querySelector(`.scribble-note[data-note-key="${ring.dataset.noteKey}"]`)})).filter(pair => pair.note);
      const centers = pairs.map(({ring}) => {const widest = Array.from(ring.getClientRects()).reduce((best,r) => !best || r.width > best.width ? r : best, null); return widest ? widest.left + widest.width / 2 - initialBox.left : 0;});
      const columns = noteColumns(centers, initialBox.width);
      // A phrase spanning almost the whole row still belongs to a left note;
      // its mathematical midpoint must not push the explanation across the panel.
      if (pairs.length === 1 && Array.from(pairs[0].ring.getClientRects()).some(r => r.width > initialBox.width * .75 && r.left - initialBox.left < initialBox.width * .1)) columns[0] = 0;
      pairs.forEach(({note}, index) => {
        const destination = line.querySelector(columns[index] ? '.scribble-right' : '.scribble-left');
        if (destination && note.parentElement !== destination) {destination.append(note);}
      });
      const box = line.getBoundingClientRect();
      if (!box.width || !box.height) continue;
      svg.setAttribute('viewBox', `0 0 ${box.width} ${box.height}`);
      const paths = [];
      const spatialOrder = pairs.map((pair, index) => ({pair, index, x:centers[index]})).sort((a,b) => a.x - b.x);
      for (const [index, {ring}] of pairs.entries()) {
        const note = line.querySelector(`.scribble-note[data-note-key="${ring.dataset.noteKey}"] .scribble-note-copy`);
        const first = note?.getClientRects()[0];
        if (!first) continue;
        const rects = Array.from(ring.getClientRects(), r => ({left: r.left - box.left, top: r.top - box.top, width: r.width, height: r.height}));
        const rank = spatialOrder.findIndex(item => item.index === index);
        const lean = pairs.length > 1 ? (rank < pairs.length / 2 ? -1 : 1) : (centers[index] < box.width * .65 ? 1 : -1);
        const connection = connectorGeometry(rects, {left:first.left-box.left, top:first.top-box.top, width:first.width, height:first.height}, {lean, width:box.width, aligned:pairs.length === 1, leftAligned:pairs.length === 1 && columns[index] === 0, crowded:pairs.length > 2});
        if (connection) paths.push(`<path d="${connection.path}"/><circle cx="${connection.end.x}" cy="${connection.end.y}" r="2.3"/>`);
      }
      svg.innerHTML = paths.join('');
    }
  }
  global.ReadingArrows = {draw, helpers: {connectorGeometry, noteColumns}};
  if (typeof module !== 'undefined' && module.exports) module.exports = global.ReadingArrows;
  if (global.document) {
    let frame;
    const schedule = () => {global.cancelAnimationFrame(frame); frame = global.requestAnimationFrame(() => draw(global.document));};
    new MutationObserver(schedule).observe(global.document.getElementById('feed'), {childList: true, subtree: false});
    const observer = new ResizeObserver(schedule);
    observer.observe(global.document.getElementById('feed'));
    observer.observe(global.document.getElementById('compact-feed'));
    global.document.fonts?.ready.then(schedule);
  }
})(typeof window !== 'undefined' ? window : globalThis);
