// Hand-curated paths through the current 28-post Explore library.
// Each reason explains the useful connection; a shared keyword alone is not enough.
const relatedPostCuration = {
  o_kwasniewski: [
    ['poteto', 'The codebase rules that make agent-built software more reliable.'],
    ['janwilmake', 'A real CI cost tradeoff caused by frequent agent pushes.'],
    ['dani_avila7', 'A security-testing workflow that uses coding agents.']
  ],
  tavus: [
    ['buraktuyan', 'A produced demo of expressive AI voice.'],
    ['karpathy', 'Why custom explainer videos may become a useful AI output.'],
    ['mishig25', 'AI-made visual demos used to teach difficult material.']
  ],
  ideogram_ai: [
    ['tobiadonadon_', 'How to make AI-generated visuals feel less generic.'],
    ['karpathy', 'Other visual formats that can explain an idea better than prose.'],
    ['omer_assa', 'The case for small, personal creative software.']
  ],
  thsottiaux: [
    ['https://x.com/thsottiaux/status/2107158998495748264', 'The first improvement shipped after this 28-day promise.'],
    ['poteto', 'Quality constraints that matter when agents help ship quickly.'],
    ['monokern', 'A more detailed vision of persistent agent workflows.']
  ],
  'https://x.com/thsottiaux/status/2107158998495748264': [
    ['https://x.com/thsottiaux/status/2107159119107146237', 'Tibo’s direct reply gives the throughput figure behind Day 1.'],
    ['janwilmake', 'Another firsthand observation about the cost of active coding agents.'],
    ['simonw', 'A hands-on look at the speed of a capable local model.']
  ],
  'https://x.com/thsottiaux/status/2107159119107146237': [
    ['https://x.com/thsottiaux/status/2107158998495748264', 'The Day 1 release announcement this reply explains.'],
    ['simonw', 'A firsthand comparison of practical model performance.'],
    ['verdacloud', 'The infrastructure side of model serving speed.']
  ],
  hiarun02: [
    ['https://x.com/thsottiaux/status/2106845241357824205', 'The 28-day pledge Arun is interpreting.'],
    ['https://x.com/thsottiaux/status/2106967126250791091', 'Tibo’s direct reply confirming Arun’s reading.'],
    ['https://x.com/thsottiaux/status/2107158998495748264', 'The first improvement shipped the next day.']
  ],
  kimmonismus: [
    ['https://x.com/thsottiaux/status/2107158998495748264', 'The Day 1 announcement this reaction quotes.'],
    ['https://x.com/thsottiaux/status/2107159119107146237', 'Tibo’s follow-up gives the throughput comparison.'],
    ['https://x.com/DotCSV/status/2107174798556291083', 'Another positive reaction to the same speed update.']
  ],
  dotcsv: [
    ['https://x.com/thsottiaux/status/2107158998495748264', 'The Day 1 announcement Carlos is responding to.'],
    ['https://x.com/kimmonismus/status/2107159574474064141', 'Another favorable reading of the update.'],
    ['https://x.com/thsottiaux/status/2106845241357824205', 'The original 28-day pledge behind the reaction.']
  ],
  buraktuyan: [
    ['tavus', 'Live conversational video instead of a prerecorded voice demo.'],
    ['karpathy', 'A practical case for AI-generated explainer videos.'],
    ['mishig25', 'Another use for AI-made audiovisual explanations.']
  ],
  omer_assa: [
    ['natfriedman', 'Custom gadgets built around an open hardware toolkit.'],
    ['tobiadonadon_', 'Giving a personal AI-built app its own visual identity.'],
    ['ataiiam', 'Self-hosted agents for bespoke workflows.']
  ],
  mishig25: [
    ['karpathy', 'Concrete ways to ask AI for diagrams and explainers.'],
    ['buraktuyan', 'AI voice as another ingredient in a custom lesson.']
  ],
  tobiadonadon_: [
    ['ideogram_ai', 'An image-editing model focused on keeping repeated edits clean.'],
    ['karpathy', 'Interactive HTML and diagrams as alternatives to generic screens.'],
    ['omer_assa', 'Why people are making software for their own specific needs.']
  ],
  deronin_: [
    ['tobiadonadon_', 'A distinct visual identity matters beyond the domain name.'],
    ['janwilmake', 'Another concrete founder cost decision to inspect.'],
    ['omer_assa', 'The small-product side of AI-assisted building.']
  ],
  poteto: [
    ['o_kwasniewski', 'A framework mixing fixed tests with agentic tests.'],
    ['janwilmake', 'How one builder changed CI after agent activity raised costs.'],
    ['omarsar0', 'Research on how early agent mistakes can compound.']
  ],
  karpathy: [
    ['mishig25', 'AI-made demonstrations paired with Feynman lectures.'],
    ['tobiadonadon_', 'A visual workflow for improving AI-made interfaces.'],
    ['buraktuyan', 'A short example of AI voice in a produced video.']
  ],
  ataiiam: [
    ['monokern', 'A step-by-step architecture for always-on AI coworkers.'],
    ['lummox_eth', 'Memory projects that could give persistent agents continuity.'],
    ['adithya_s_k', 'Why an agent harness changes what a model can do.']
  ],
  natfriedman: [
    ['omer_assa', 'The appeal of building small tools for yourself.'],
    ['ataiiam', 'Another open toolkit for custom agent workflows.'],
    ['simonw', 'A hands-on look at running capable models locally.']
  ],
  dani_avila7: [
    ['anthropicai', 'A separate effort to find and fix software vulnerabilities.'],
    ['0xsero', 'A builder running a local agent against bug bounties.'],
    ['o_kwasniewski', 'Testing infrastructure for agent-built applications.']
  ],
  janwilmake: [
    ['poteto', 'Why engineering constraints still matter with coding agents.'],
    ['o_kwasniewski', 'A testing framework to weigh against CI frequency.'],
    ['cloudflare', 'Another infrastructure decision shaped by AI traffic.']
  ],
  lummox_eth: [
    ['ataiiam', 'A persistent agent product that could use durable memory.'],
    ['monokern', 'An architecture that places shared memory in a larger workflow.'],
    ['omarsar0', 'Why remembered context alone may not prevent agent drift.']
  ],
  '0xsero': [
    ['dani_avila7', 'A structured agent workflow for security review.'],
    ['anthropicai', 'A partner-focused project for defensive vulnerability discovery.'],
    ['simonw', 'Another firsthand account of a capable local model.']
  ],
  monokern: [
    ['ataiiam', 'The self-hosted agent platform behind the architecture discussion.'],
    ['lummox_eth', 'Concrete open-source choices for an agent memory layer.'],
    ['poteto', 'The codebase constraints needed to make agent work dependable.']
  ],
  patpcj: [
    ['adithya_s_k', 'A different way to train model behavior inside agent harnesses.'],
    ['omarsar0', 'Research on agent failure paths and reliability.']
  ],
  adithya_s_k: [
    ['patpcj', 'Another approach to steering what a model optimizes for.'],
    ['ataiiam', 'A product context where the choice of harness matters.'],
    ['poteto', 'Engineering constraints around agents in real codebases.']
  ],
  omarsar0: [
    ['poteto', 'Practical constraints that can catch weak agent steps.'],
    ['patpcj', 'A study of steering a model away from reward hacking.'],
    ['lummox_eth', 'Memory systems as one part of a reliable agent stack.']
  ],
  nyudatascience: [
    ['jiqizhixin', 'Another navigation study that lets an agent ask for clarification.'],
    ['mishig25', 'Visual demos as a way into a technical research idea.']
  ],
  cloudflare: [
    ['verdacloud', 'Another account of AI workload pressure on infrastructure.'],
    ['janwilmake', 'A firsthand example of agent activity changing a bill.'],
    ['ataiiam', 'Always-on agents are one source of machine-driven web traffic.']
  ],
  nielsrogge: [
    ['simonw', 'A firsthand review of another model people can run locally.'],
    ['verdacloud', 'How serving speed can change a model’s practical use.'],
    ['adithya_s_k', 'Training research for models used inside agent harnesses.']
  ],
  anthropicai: [
    ['dani_avila7', 'A separate coding-agent workflow for security review.'],
    ['0xsero', 'A local-agent approach to finding security bugs.']
  ],
  jiqizhixin: [
    ['nyudatascience', 'A related embodied-navigation problem about planning paths.'],
    ['omarsar0', 'Why agents can drift after an uncertain step.']
  ],
  verdacloud: [
    ['nielsrogge', 'Model guides that make inference and fine-tuning more usable.'],
    ['simonw', 'A local-model review from the user side of inference.'],
    ['cloudflare', 'Another infrastructure problem created by AI workloads.']
  ],
  simonw: [
    ['nielsrogge', 'More hands-on guidance for using an open model.'],
    ['0xsero', 'A local model running inside an always-on agent experiment.'],
    ['verdacloud', 'The serving-speed side of practical model use.']
  ]
};

if (typeof module !== 'undefined') module.exports = relatedPostCuration;
