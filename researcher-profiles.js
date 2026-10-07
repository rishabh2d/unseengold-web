// Profiles for authors whose names are annotated inside the local VL-LN paper viewer.
// Keep these editorial notes conservative and link to the researcher's own page when available.
const ugResearchers = {
  'wensi-huang': {name:'Wensi Huang', current:'PhD student, USTC · OpenRobotLab', history:['2024 · Co-authored GRUtopia, a simulated environment for embodied agents.','2025 · Co-authored VL-LN Bench on navigation with active dialogue.','Now · Studies robotics and embodied AI at USTC and OpenRobotLab.'], source:'https://github.com/0309hws'},
  'shaohao-zhu': {name:'Shaohao Zhu', current:'PhD student, Zhejiang University · Shanghai AI Laboratory', image:'https://jinmingxu.github.io/grouppics/shaohao_zhu.jpeg', history:['2022 · Began PhD research in multi-agent reinforcement learning and robot exploration.','2024 · Worked on MAexp, a multi-agent exploration system.','2025 · Co-authored VL-LN Bench.'], source:'https://jinmingxu.github.io/group.html'},
  'meng-wei': {name:'Meng Wei', current:'PhD student, University of Hong Kong', history:['2014–2021 · Studied at Wuhan University and Tsinghua University.','2021–2023 · Research roles at NUS and OpenRobotLab.','Now · Researches embodied AI, robot learning, and navigation at HKU.'], source:'https://ece.hku.hk/events/20260529-1/'},
  'jinming-xu': {name:'Jinming Xu', current:'Professor, Zhejiang University', image:'https://jinmingxu.github.io/jimmy_pic.jpg', history:['Earlier · Completed doctoral research at Nanyang Technological University.','Later · Worked on networked systems and intelligent robotics.','Now · Leads research and advises students at Zhejiang University.'], source:'https://jinmingxu.github.io/'},
  'xihui-liu': {name:'Xihui Liu', current:'Assistant Professor, University of Hong Kong', image:'https://xh-liu.github.io/files/XihuiLiu-photo.jpeg', history:['Earlier · Studied at Tsinghua University and completed a PhD at CUHK.','Then · Conducted postdoctoral research at UC Berkeley.','Now · Works on computer vision and generative AI at HKU.'], source:'https://ece.hku.hk/people/xihui-liu/'},
  'hanqing-wang': {name:'Hanqing Wang', current:'Research scientist, Shanghai AI Laboratory', image:'https://hanqingwangai.github.io/assets/img/profile.png', history:['2021–2023 · Visiting researcher at ETH Zurich.','2024 · Completed a PhD at Beijing Institute of Technology and worked on GRUtopia.','Now · Leads digital modeling and simulation work in Shanghai AI Lab’s Embodied AI Center.'], source:'https://hanqingwangai.github.io/'},
  'tai-wang': {name:'Tai Wang', current:'Research scientist, Shanghai AI Laboratory', image:'https://avatars.githubusercontent.com/u/30491025?v=4', history:['Earlier · Contributed to open-source 3D detection research, including MMDetection3D.','Later · Worked on embodied perception projects such as EmbodiedScan.','Now · Leads a spatial intelligence team at Shanghai AI Lab.'], source:'https://taiwang.me/'},
  'feng-zhao': {name:'Feng Zhao', current:'Professor, University of Science and Technology of China', image:'https://auto.ustc.edu.cn/_upload/article/images/7c/e2/543adfd94baa8202d3cfed46a9df/01df63d4-e12e-4198-8f36-d15593e735c4.jpg', history:['2000–2006 · Studied engineering at USTC and computer vision at CUHK.','2006–2018 · Held research appointments in Hong Kong, Singapore, and the UK.','Since 2019 · Professor at USTC.'], source:'https://auto.ustc.edu.cn/2021/0510/c25976a484874/page.htm'},
  'jiangmiao-pang': {name:'Jiangmiao Pang', current:'Head of Embodied AI Center, Shanghai AI Laboratory', image:'https://oceanpang.github.io/images/myself.png', history:['Earlier · Worked on open-source computer vision tools including MMDetection and MMTracking.','Later · Expanded into 3D perception and embodied AI.','Now · Leads the Embodied AI Center at Shanghai AI Lab.'], source:'https://oceanpang.github.io/'}
};

let ugPinnedResearcher = null;

function ugResearcherContent(profile, expanded) {
  const section = document.createElement('div');
  section.className = 'ug-researcher-content';
  const portrait = document.createElement('div');
  portrait.className = 'ug-researcher-portrait';
  if (profile.image) {
    const img = document.createElement('img');
    img.src = profile.image;
    img.alt = profile.name;
    img.referrerPolicy = 'no-referrer';
    img.onerror = () => { img.remove(); portrait.textContent = profile.name.split(' ').map(part => part[0]).join(''); };
    portrait.append(img);
  } else portrait.textContent = profile.name.split(' ').map(part => part[0]).join('');
  const body = document.createElement('div');
  body.className = 'ug-researcher-body';
  const eyebrow = document.createElement('span');
  eyebrow.className = 'ug-researcher-eyebrow';
  eyebrow.textContent = 'PROFILE';
  const title = document.createElement('h3');
  title.textContent = profile.name;
  const current = document.createElement('p');
  current.className = 'ug-researcher-current';
  current.textContent = profile.current;
  const history = document.createElement('ol');
  history.className = 'ug-researcher-history';
  profile.history.forEach(item => { const li = document.createElement('li'); li.textContent = item; history.append(li); });
  body.append(eyebrow,title,current,history);
  if (expanded) {
    const source = document.createElement('a');
    source.href = profile.source;
    source.target = '_blank';
    source.rel = 'noopener noreferrer';
    source.textContent = 'Researcher source ↗';
    body.append(source);
  }
  section.append(portrait,body);
  return section;
}

function ugShowResearcherSummary(viewer, profile) {
  const summary = viewer.querySelector('.source-summary');
  if (!summary) return;
  const label = summary.querySelector(':scope > span');
  const text = summary.querySelector(':scope > p');
  let content = summary.querySelector('.ug-researcher-summary');
  if (!content) {
    content = document.createElement('div');
    content.className = 'ug-researcher-summary';
    summary.append(content);
  }
  label.textContent = 'PROFILE';
  text.hidden = true;
  content.replaceChildren(ugResearcherContent(profile,false));
  content.hidden = false;
  summary.classList.add('show-researcher');
}

function ugRestoreSourceSummary(viewer) {
  const summary = viewer.querySelector('.source-summary');
  if (!summary) return;
  summary.querySelector(':scope > span').textContent = 'SUMMARY';
  summary.querySelector(':scope > p').hidden = false;
  const content = summary.querySelector('.ug-researcher-summary');
  if (content) content.hidden = true;
  summary.classList.remove('show-researcher');
}

window.addEventListener('message', event => {
  if (event.origin !== location.origin || event.data?.type !== 'ug-researcher') return;
  const viewer = document.querySelector('#discussion-host .source-viewer[data-source-url="https://0309hws.github.io/VL-LN.github.io/"]');
  const frame = viewer?.querySelector('.source-frame');
  if (!frame || event.source !== frame.contentWindow) return;
  const profile = ugResearchers[event.data.id];
  if (!profile) return;
  if (event.data.action === 'hover') ugShowResearcherSummary(viewer,profile);
  else if (event.data.action === 'leave') {
    if (ugPinnedResearcher) ugShowResearcherSummary(viewer,ugResearchers[ugPinnedResearcher]);
    else ugRestoreSourceSummary(viewer);
  } else if (event.data.action === 'open') {
    ugPinnedResearcher = ugPinnedResearcher === event.data.id ? null : event.data.id;
    if (ugPinnedResearcher) {
      const url = viewer.dataset.sourceUrl;
      sourceActiveHighlight.delete(url);
      const notes = sourceExplainers[url];
      if (notes) viewer.querySelector('.source-summary > p').textContent = notes.summary;
      frame.contentWindow.postMessage({type:'ug-source-selection',index:null},location.origin);
      ugShowResearcherSummary(viewer,profile);
    }
    else ugRestoreSourceSummary(viewer);
  }
});
