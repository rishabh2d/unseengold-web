// Verified, chronological post sequences. URLs resolve against the Explore library.
const storylineCuration = [{
  id: 'codex-work-28-days',
  title: 'Tibo’s 28 days of Codex and Work improvements',
  days: 28,
  entries: [
    {
      url: 'https://x.com/thsottiaux/status/2106845241357824205',
      day: 0,
      kind: 'Promise',
      title: 'The 28-day commitment',
      note: 'One broadly useful improvement per day, or a full reset.'
    },
    {
      url: 'https://x.com/hiarun02/status/2106960991737311651',
      day: 0,
      kind: 'Reader quote',
      title: 'Arun asks how the reset works',
      note: 'A quote-post reads the promise as a reset on days without a meaningful improvement.'
    },
    {
      url: 'https://x.com/thsottiaux/status/2106967126250791091',
      day: 0,
      kind: 'Tibo’s reply',
      title: 'Tibo confirms: “Facts”',
      note: 'His direct reply confirms Arun’s reading of the pledge.'
    },
    {
      url: 'https://x.com/thsottiaux/status/2107158998495748264',
      day: 1,
      kind: 'Shipped',
      title: 'Day 1: faster default model speed',
      note: 'Tibo says Astra and Sol are about 50% faster for subscription users.'
    },
    {
      url: 'https://x.com/thsottiaux/status/2107159119107146237',
      day: 1,
      kind: 'Tibo’s reply',
      title: 'The throughput detail',
      note: 'A direct reply compares roughly 50 TPS with 30 TPS.'
    },
    {
      url: 'https://x.com/kimmonismus/status/2107159574474064141',
      day: 1,
      kind: 'Positive reaction',
      title: 'Chubby favors the update over a reset',
      note: 'A favorable quote-post repeats the claimed throughput; it is not a benchmark.'
    },
    {
      url: 'https://x.com/DotCSV/status/2107174798556291083',
      day: 1,
      kind: 'Positive reaction',
      title: 'Carlos Santana welcomes the speedup',
      note: 'A Spanish-language quote-post compares it to a fast-mode benefit.'
    }
  ]
}];

if (typeof module !== 'undefined') module.exports = storylineCuration;
