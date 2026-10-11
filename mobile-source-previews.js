/* Mobile web previews use declared embedding metadata and confirmed block rules. */
window.MobileSourcePreviews = (() => {
  const mobile = () => matchMedia('(max-width: 760px)').matches;
  function blocked(source) {
    if (!mobile() || source?.kind === 'VIDEO') return false;
    let url;
    try { url = new URL(source.url); } catch { return false; }
    if (/^(?:www\.)?(?:youtube\.com|youtube-nocookie\.com|youtu\.be)$/.test(url.hostname)) return false;
    if (source.embed === false || source.embeddingStatus === 'blocked' || source.embeddingStatus === 'denied') return true;
    // GitHub/Hugging Face send DENY; this NVIDIA page excludes our origin.
    return /^(?:www\.)?(?:github\.com|huggingface\.co)$/.test(url.hostname)
      || (/^(?:www\.)?nvidia\.com$/.test(url.hostname) && url.pathname === '/en-us/data-center/vera-rubin-nvl72/');
  }
  return {blocked};
})();
