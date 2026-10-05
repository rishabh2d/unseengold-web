/* Design fixtures only. Not fetched X replies or actual AI responses. */
const demoNames=['Alex Morgan','Priya Shah','Daniel Kim','Sam Rivera','Nora Ellis','Jamie Park','Theo Brooks','Leah Chen'];
const discussionSeeds=[[
 ['Can a machine make art without experiencing anything?','AI questions','Philosophy','The disagreement depends on whether art is defined by the maker’s experience, the finished work, or the viewer’s response. Those are three different tests.'],
 ['Photography had this argument a century ago. What actually changed?','AI questions','History','A useful comparison is how photography changed the role of technique and selection. The analogy is incomplete: a camera records a scene, while a model generates from learned patterns.'],
 ['Does the person directing the model supply the intention?','AI questions','Authorship','Direction, selection and revision can express human intention. That does not settle whether the system itself has intentions, or how credit should be divided.'],
 ['The real issue is consent from the artists in the training data.','Human replies','Consent','A discussion of creativity can miss the practical question of whose work was used and on what terms. Those questions deserve their own thread.'],
 ['Calling it statistical calculation does not tell us whether the result is meaningful.','Disagreements','Philosophy','A description of a process is not automatically an evaluation of the output. We should examine both rather than substituting one for the other.'],
 ['I make illustrations for a living. The pressure on rates is already the issue.','Human replies','Work','Tools can expand what one person can make while also changing how clients value the work. Both experiences can be true.'],
 ['What would count as evidence of a “spark of humanity”?','AI questions','Evidence','The phrase is a philosophical claim, not an operational measurement. A better question is which observable qualities the author wants to protect.'],
 ['We are mixing up “art” and “good art” in every other comment.','Human replies','Definitions','Separating category membership from quality would make this conversation much clearer. Something can count as art and still be derivative.'],
 ['Human artists also learn from other artists. Why is this different?','Disagreements','Consent','Scale, permission, attribution and economic effects are possible differences. An analogy about learning alone does not resolve those differences.'],
 ['Can you map the strongest arguments without picking a side?','AI questions','Overview','One side emphasizes intention and lived experience. Another emphasizes interpretation and creative control. A third focuses on consent and livelihoods rather than the definition of art.'],
 ['The last sentence sounds like an invitation to collaborate, not a ban.','Human replies','Context','Reading the full statement matters. It makes a claim about human creativity and then proposes an alliance with artists and institutions.'],
 ['Would a human-edited AI image be treated differently?','AI questions','Authorship','There is a spectrum of human involvement. A useful discussion should specify prompting, selection, editing and composition rather than treating every workflow as identical.'],
 ['A beautiful result is enough for me. I do not need the tool to feel.','Disagreements','Philosophy','This is an audience-centered definition of art. It conflicts with definitions that require expressive intention in the maker, but it is internally coherent.'],
 ['Please distinguish a legal copyright question from an aesthetic one.','Human replies','Definitions','They can overlap, but a legal standard does not determine whether a viewer finds a work moving. Keep the questions separate.'],
 ['What should an artist-led licensing system look like?','AI questions','Consent','A proposal could separate permission, compensation, attribution and auditability. The difficult part is making those choices practical for both individual artists and large archives.'],
 ['Could this protect human creativity while still allowing new tools?','AI questions','Work','Yes as a design goal. The discussion then needs concrete choices about disclosure, training permission, labor conditions and how human contributions are credited.']
],[
 ['Was this an official release date or an early placeholder?','AI questions','Timeline','The phrase “once scheduled” is about a previous plan. Establish the original announcement, subsequent changes and current date before treating it as a broken promise.'],
 ['A delay is better than rushing the script.','Human replies','Production','That is a reasonable preference, but extra time does not guarantee a better film. We do not have enough evidence here to infer the quality of the script.'],
 ['How many times has the announced date changed?','AI questions','Timeline','This would need a dated chain of official announcements. A timeline should keep confirmed changes separate from trade reporting and fan speculation.'],
 ['Everyone is blaming the actors without knowing the production schedule.','Disagreements','Evidence','The post does not establish a cause. Attributing the delay to a particular person would go beyond the evidence presented.'],
 ['Can someone separate confirmed news from rumors in this thread?','AI questions','Evidence','A useful grouping would be official statements, attributed reporting and unverified claims. Each item should retain its date and original source.'],
 ['I want the sequel to keep the detective story at the center.','Human replies','Story','The first film’s investigative structure is what made it distinctive to me. A bigger cast is less interesting than a tighter mystery.'],
 ['Does a studio merger actually affect a film already in development?','AI questions','Business','It can, through budgets, leadership and release planning, but that does not demonstrate that it caused a specific delay. We need evidence tied to this production.'],
 ['The problem is announcing dates before the project is ready.','Disagreements','Business','Release dates serve planning and marketing purposes. The tradeoff is between giving audiences a concrete plan and creating expectations that may change.'],
 ['Please stop passing fan posters around as official footage.','Human replies','Evidence','A source label next to every image would help. It is easy for a polished fan edit to lose its context after repeated reposts.'],
 ['What is the latest confirmed information in the post itself?','AI questions','Context','Only that the film previously had this date. The post alone does not establish the current schedule, production stage or reason for a change.'],
 ['A four-year gap does not mean the team worked on it for four years.','Disagreements','Production','Elapsed time and active production time are different. Development, scheduling and other commitments can occupy different parts of the gap.'],
 ['I would rather see a smaller, stranger sequel than another universe setup.','Human replies','Story','A self-contained mystery would give the characters room to develop. That is a creative preference rather than a prediction about the production.'],
 ['What evidence would settle the current release-date question?','AI questions','Evidence','A current official studio calendar or an attributable announcement is stronger than an unsourced social post. Old articles need their publication dates displayed.'],
 ['People are disagreeing about patience, not the same facts.','Human replies','Context','Some are discussing trust in the studio; others are discussing artistic quality. Labeling those as different topics would stop a lot of circular arguments.'],
 ['Is there a useful comparison with other delayed sequels?','AI questions','History','Comparisons should match the production circumstances. A list of successful delayed movies alone would introduce selection bias.'],
 ['Can we have a rumors-free version of this conversation?','AI questions','Evidence','Filter for direct sources and keep unresolved questions visible. The absence of confirmation should remain uncertainty, not become a confident claim.']
]];
/* Follow-up turns are fictional platform conversations, scoped to the two design-preview posts. */
const followUps=[[
 ['If the viewer supplies the meaning, does the maker matter?', 'The maker still shapes what a viewer encounters. The disagreement is whether that contribution must come from lived experience or can be delegated in part to a tool.'],
 ['Would that make a carefully prompted image art?', 'Under a viewer-centered definition, possibly. Under an intention-centered definition, the answer depends on how much creative judgment the person exercised.']
],[
 ['So what should we check before calling this a delay?', 'Start with the date on the original studio announcement, then find a current official schedule. A repost of an old date is not a new confirmation.'],
 ['And if there is no new announcement?', 'Then the current date is unconfirmed from this post alone. Keeping that uncertainty visible is more useful than filling it with a rumor.']
]];
const topicFollowUps={
 Philosophy:['What would change your mind about that distinction?','A clear definition of art, paired with examples that test its edge cases, would make the disagreement easier to evaluate.'],
 History:['Which part of the historical comparison fails?','The technology, scale, and source material differ. The analogy can illuminate a question without proving that the two situations are identical.'],
 Authorship:['Where should the credit go in a mixed workflow?','Credit should describe the human choices accurately: direction, selection, editing, and any source material used.'],
 Consent:['What would meaningful permission look like?','It would require a real choice, understandable terms, and a way for contributors to know how their work is used.'],
 Work:['How would this affect working artists in practice?','Look at pay, client expectations, attribution, and which tasks are replaced or newly created. The impact will vary by field.'],
 Evidence:['What source would make this claim reliable?','An original, dated source with a clear attribution is stronger than an unsourced repost. Separate what it says from what we infer.'],
 Definitions:['Can we define the terms before arguing further?','Yes. State the definition being used, then test whether the disputed example meets it.'],
 Overview:['Can you give the strongest objection to that answer?','The objection is that a tidy map may hide real material stakes. Definitions alone do not resolve questions of consent or livelihood.'],
 Context:['What changes when we read the full post?','The surrounding words can limit or redirect a claim. Quote the relevant passage and keep the original date attached.'],
 Timeline:['What is the first confirmed date in the timeline?','Use the earliest attributable announcement, then list each official change with its date.'],
 Production:['What can we actually infer about production?','Very little from a release-date post alone. Scheduling, development, and filming are distinct phases.'],
 Story:['Would a smaller story be a safer choice?','It might suit the tone you value, but scale by itself does not determine quality. The script and execution matter more.'],
 Business:['Could planning explain the change?','Yes, but that is a possibility rather than an established cause without reporting tied to this project.']
};
let discussionTab='All', discussionView='list';
const discussionSteps=new Map();
const discussionRevealed=new Set(),discussionSuppressed=new Set();
function threadTurns(row,postIndex){
 const featured=followUps[postIndex%2];
 const contextual=topicFollowUps[row.topic]||topicFollowUps.Context;
 const second=row.i===0?featured[0]:contextual;
 const third=row.i===0?featured[1]:[`Can you make that more concrete for this post?`,`For this post, the key is to keep the original statement in view, identify what is known, and label any interpretation as interpretation.`];
 return [{question:row.title,answer:row.answer},...[[second[0],second[1]],[third[0],third[1]]].map(([question,answer])=>({question,answer}))];
}
function metadataIcon(symbol,label,content){return `<span class="meta-control"><button type="button" class="meta-icon" aria-label="${escape(label)}" aria-expanded="false">${symbol}</button><span class="meta-popover" role="tooltip">${escape(content)}</span></span>`}
function discussionMarkup(post,index){
 const seed=discussionSeeds[index%2];
 const rows=seed.map((r,i)=>({title:r[0],kind:r[1],topic:r[2],answer:r[3],i})).filter(r=>discussionTab==='All'||r.kind===discussionTab);
 const counts=kind=>kind==='All'?seed.length:seed.filter(r=>r[1]===kind).length;
 return `<section class="discussion"><nav class="discussion-tabs" aria-label="Discussion categories">${['All','AI questions','Human replies','Disagreements'].map(t=>`<button data-discussion-tab="${t}" aria-pressed="${t===discussionTab}">${t}<span>${counts(t)}</span></button>`).join('')}</nav><nav class="view-tabs" aria-label="Discussion view"><button data-discussion-view="list" aria-pressed="${discussionView==='list'}">List</button><button data-discussion-view="grid" aria-pressed="${discussionView==='grid'}">Grid</button></nav><div class="threads ${discussionView}">${rows.map(r=>{
  const turns=threadTurns(r,index),key=`${index}:${r.i}`,step=Math.min(discussionSteps.get(key)||0,turns.length-1),turn=turns[step];
  const revealed=discussionRevealed.has(key),suppressed=discussionSuppressed.has(key);
  return `<article class="thread ${revealed?'revealed':''} ${suppressed?'hover-suppressed':''}" data-thread-key="${key}" aria-label="Conversation ${r.i+1}, turn ${step+1} of ${turns.length}"><div class="thread-top"><h2 class="thread-question"><button type="button" class="question-trigger" data-reveal="${r.i}" aria-expanded="${revealed}" aria-controls="thread-answer-${index}-${r.i}">${escape(turn.question)}</button></h2><div class="thread-icons">${metadataIcon('◉','Person and date',`${demoNames[r.i%8]} · October 4, 2026 · ${r.i+2} minutes ago`)}${metadataIcon('⌗','Topic and type',`${r.topic} · ${r.kind==='AI questions'?'Question':r.kind==='Disagreements'?'Disagreement':'Human reply'}`)}</div></div><div class="thread-answer" id="thread-answer-${index}-${r.i}"><span class="answer-by">${r.kind==='AI questions'?'Grok':'Community'} <span>· sample response</span></span><p>${escape(turn.answer)}</p></div><div class="thread-navigation"><span class="turn-counter">${String(step+1).padStart(2,'0')} / ${String(turns.length).padStart(2,'0')}</span><span class="turn-controls"><button type="button" data-turn="${r.i}" data-direction="-1" aria-label="Previous question in this thread" ${step===0?'disabled':''}>↑</button><button type="button" data-turn="${r.i}" data-direction="1" aria-label="Next question in this thread" ${step===turns.length-1?'disabled':''}>↓</button></span></div></article>`;
 }).join('')}</div><div class="discussion-bottom"><span>DESIGN PREVIEW · ${seed.length} FICTIONAL PUBLIC THREADS · NO LIVE AI</span></div></section>`;
}
function bindDiscussion(){
 document.querySelectorAll('[data-discussion-tab]').forEach(b=>b.onclick=()=>{discussionTab=b.dataset.discussionTab;renderDiscussionOnly()});
 document.querySelectorAll('[data-discussion-view]').forEach(b=>b.onclick=()=>{discussionView=b.dataset.discussionView;renderDiscussionOnly()});
 document.querySelectorAll('[data-reveal]').forEach(b=>b.onclick=()=>{const key=`${currentDiscussionIndex}:${b.dataset.reveal}`;discussionRevealed.has(key)?discussionRevealed.delete(key):discussionRevealed.add(key);renderDiscussionOnly();document.querySelector(`[data-reveal="${b.dataset.reveal}"]`)?.focus({preventScroll:true})});
 document.querySelectorAll('[data-turn]').forEach(b=>b.onclick=()=>{const key=`${currentDiscussionIndex}:${b.dataset.turn}`;const step=discussionSteps.get(key)||0;discussionSteps.set(key,Math.max(0,Math.min(2,step+Number(b.dataset.direction))));discussionRevealed.delete(key);discussionSuppressed.add(key);renderDiscussionOnly();const next=document.querySelector(`[data-turn="${b.dataset.turn}"][data-direction="${b.dataset.direction}"]`);next?.focus({preventScroll:true})});
 document.querySelectorAll('[data-thread-key]').forEach(card=>card.onpointerleave=()=>{discussionSuppressed.delete(card.dataset.threadKey);card.classList.remove('hover-suppressed')});
 document.querySelectorAll('.meta-icon').forEach(b=>b.onclick=()=>{const active=b.getAttribute('aria-expanded')==='true';document.querySelectorAll('.meta-icon').forEach(icon=>icon.setAttribute('aria-expanded','false'));b.setAttribute('aria-expanded',String(!active))});
}
let currentDiscussionPost=null,currentDiscussionIndex=0;
function renderDiscussionOnly(){const host=document.querySelector('#discussion-host');if(host){const y=document.querySelector('#insights').scrollTop;host.innerHTML=discussionMarkup(currentDiscussionPost,currentDiscussionIndex);bindDiscussion();document.querySelector('#insights').scrollTop=y}}
