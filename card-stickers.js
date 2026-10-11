// Sparse oversized cutouts matched to the root post; thread parts share its artwork.
const CardStickers = (() => {
  const treatments = new Map([
    ["https://x.com/OpenAI/status/2107894997538525580", ['openai-knot', 'corner']],
    ["https://x.com/PrimeIntellect/status/2108672479007047952", ['prime-swarm', 'swarm']],
    ["https://x.com/GoogleLabs/status/2107800195748737042", ['playground-edge', 'landscape']],
    ["https://x.com/0xJarvi/status/2107968657858994180", ['voxel-titan', 'character']],
    ["https://x.com/trq212/status/2108301668828004396", ['glasswing-peek', 'top-left']],
    ["https://x.com/googlecloud/status/2108252402075734172", ['gemini-cloud-peek', 'top-right']],
    ["https://x.com/im_gusye/status/2108224948049530947", ['voice-wave-edge', 'bottom-left']],
    ["https://x.com/capydotai/status/2108625987219206241", ['ideogram-edit-peek', 'edge-right']],
    ["https://x.com/SemiAnalysis_/status/2108604228440658369", ['rubin-chip-peek', 'bottom-right']],
    ["https://x.com/akshay_pachaar/status/2108497955049345102", ['qwen-dragon-peek', 'edge-left']],
    ["https://x.com/Cloudflare/status/2108696873510850758", ['cloudflare-edge', 'top-right']],
    ["https://x.com/thsottiaux/status/2108773703064657936", ['opendots-orbit', 'bottom-spread']],
    ["https://x.com/Luofei_Chen/status/2107504364168597863", ['muse-gadget-peek', 'bottom-left']],
    ["https://x.com/carloAI/status/2108226291107602580", ['interface-dial-peek', 'edge-right']],
    ["https://x.com/lydiahallie/status/2108624109538291901", ['compact-paper-peek', 'top-right']],
    ["https://x.com/siddhantmohan1/status/2107645119130440006", ['review-scanner-edge', 'bottom-right']],
    ["https://x.com/matthew_d_green/status/2108671160158163037", ['mantis-security-peek', 'edge-left']],
    ["https://x.com/scale_AI/status/2107527847216869724", ['harness-loop-edge', 'top-left']],
    ["https://x.com/elliotarledge/status/2107902321950888335", ['cuda-weave-edge', 'bottom-right']],
    ["https://x.com/pmpcurvo/status/2107441435020575049", ['loop-flow-peek', 'bottom-left']],
    ["https://x.com/WevolverApp/status/2107831134151217315", ['edge-robot-peek', 'edge-right']],
    ["https://x.com/CollinearAI/status/2108592923554304163", ['physics-orbit-edge', 'bottom-spread']],
    ["https://x.com/PrimeIntellect/status/2108645812591092114", ['memory-garden-edge', 'bottom-left']],
    ["https://x.com/workersio/status/2107923334134710653", ['testing-robot-peek', 'top-left']],
  ]);
  function markup(post) {
    const treatment = treatments.get(post.url);
    if (!treatment) return '';
    const [asset, placement] = treatment;
    return `<div class="post-edge-art art-${placement}" aria-hidden="true"><img src="assets/card-stickers/${asset}.png" alt="" decoding="async" loading="lazy" draggable="false"></div>`;
  }
  return {markup};
})();
