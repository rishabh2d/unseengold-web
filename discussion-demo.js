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
/* Sample Grok prompts for the next ten real cached posts. Answers are fictional UI copy. */
const morePostQuestions=[
 [
 ['Is the GTA 6 claim from official footage or a rating description?','Check the linked source and distinguish a rating-board description from a developer demonstration. The cached post alone does not prove the final interaction.'],
 ['What part of this claim is actually confirmed?','The post attributes the claim to another source. Verification needs that source and its exact wording.'],
 ['Does this affect the game rating?','A drug-use depiction may be relevant to a rating, but the exact classification requires the rating-board listing.'],
 ['Is the linked clip genuine gameplay?','The demo cannot authenticate the linked media. A real answer should compare it with an official release.']
 ],[
 ['What are these trophies awarded for?','The image shows awards, but the precise category and date need the chart organization’s original record.'],
 ['Is this a new record or a photo from an earlier ceremony?','Compare the image and award titles with a dated official announcement before calling it a new record.'],
 ['What does the chart result measure?','Chart awards may reflect sales, streams or a combined measure. The specific chart methodology should be linked.'],
 ['Where can I see the original photo and caption?','Follow the source post and then its credited photographer or chart organization when available.']
 ],[
 ['Why is October 3rd a pop-culture reference?','The date is commonly connected with a scene in Mean Girls. The attached image may add context, so inspect it before assuming that is the only reference.'],
 ['What does the image add to this short post?','A one-line post can depend almost entirely on its media. A real assistant should describe the image only after checking it.'],
 ['Is this an annual meme or a current announcement?','Check the date and the media. A recurring date reference is different from a new event.'],
 ['What is the original source of the image?','An attribution trail should lead to the source work or credited creator.']
 ],[
 ['Is this clip from a released finale or a preview?','Check the network’s official channel and release date. “First clip” does not by itself say whether the episode is available.'],
 ['What happens before this scene?','A responsible recap would use the released episode or official synopsis and label spoilers.'],
 ['Who published the clip first?','Trace the video to an official publisher before presenting it as studio material.'],
 ['Can I watch the full episode?','Availability depends on service and region; the demo has no current streaming data.']
 ],[
 ['How was the sea arch collapse confirmed?','Look for the park service’s dated notice and any official images or field report.'],
 ['Did the storm cause the collapse?','The reported dates overlap a closure during the storm, but timing alone does not establish the physical cause.'],
 ['Where was the arch and can visitors still reach the area?','The location can be mapped, but access rules must come from current park guidance.'],
 ['Was anyone hurt?','The post does not say. A real answer should check an official incident update rather than infer.']
 ],[
 ['Is this the same GTA 6 claim in another post?','It appears related to the earlier GTA 6 item. A plaque could group them and show each source’s wording.'],
 ['What exactly does PEGI say?','Quote the relevant rating description with a link before interpreting its implications.'],
 ['Does the inventory detail come from PEGI or the post?','Compare the post’s phrasing with the cited listing; avoid treating a paraphrase as the original.'],
 ['Is this confirmed for the shipped game?','Pre-release descriptors can change. Confirmation needs official game material or the final release.']
 ],[
 ['Are these figures official products or concept renders?','Check the manufacturer’s product page and release information.'],
 ['Do the figures reveal anything about the film plot?','Merchandise can suggest a visual design, but it is weak evidence for story events.'],
 ['What scale and materials are listed?','Those product details need the official listing; the photo alone is insufficient.'],
 ['Who created the first-look images?','Preserve image credit and link to the original reveal.']
 ],[
 ['Is this scene from the latest released episode?','Verify the episode title and air date from the show’s official guide.'],
 ['Is the portrayal meant as satire?','That is an interpretation. A useful answer separates what happens on screen from the intended meaning.'],
 ['What context does the episode give this scene?','A recap needs the episode itself and should warn about spoilers.'],
 ['Who is credited with the performance?','Use the episode credits, since the social post may simplify a role or cameo.']
 ],[
 ['Who observes National Boyfriend Day and where?','The post names a social observance. Its origins and reach vary; it is not a government holiday.'],
 ['Is this date official anywhere?','An official designation would need a named authority and source; the post does not provide one.'],
 ['What is the origin of the day?','Popular observances often have disputed origins. A real answer should show evidence and uncertainty.'],
 ['What are people posting about it today?','That requires live public posts; this design preview does not fetch them.']
 ],[
 ['Where did Willem Dafoe tell this story?','The post credits NPR. Find the original interview and timestamp for the full context.'],
 ['Is the quote exact?','Compare the cached quotation with NPR’s transcript or recording before treating punctuation as verbatim.'],
 ['What was the larger conversation about?','A short animal anecdote can lose the surrounding interview topic; follow the primary source.'],
 ['Can I see the animals he mentions?','Only link photos or video that the owner or publisher made available with appropriate rights.']
 ]
];
const additionalDiscussionSeeds=morePostQuestions.map((set,index)=>set.map(([question,answer])=>[question,'AI questions',index===4?'Evidence':'Context',answer]));
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
 const seed=index<2?discussionSeeds[index]:additionalDiscussionSeeds[index-2]||additionalDiscussionSeeds[0];
 const rows=seed.map((r,i)=>({title:r[0],kind:r[1],topic:r[2],answer:r[3],i})).filter(r=>discussionTab==='All'||r.kind===discussionTab);
 const counts=kind=>kind==='All'?seed.length:seed.filter(r=>r[1]===kind).length;
 return `<section class="discussion"><nav class="discussion-tabs" aria-label="Discussion categories">${['All','AI questions','Human replies','Disagreements'].map(t=>`<button data-discussion-tab="${t}" aria-pressed="${t===discussionTab}">${t}<span>${counts(t)}</span></button>`).join('')}</nav><nav class="view-tabs" aria-label="Discussion view"><button data-discussion-view="list" aria-pressed="${discussionView==='list'}">List</button><button data-discussion-view="grid" aria-pressed="${discussionView==='grid'}">Grid</button></nav><div class="threads ${discussionView}">${rows.map(r=>{
  const turns=threadTurns(r,index),key=`${index}:${r.i}`,step=Math.min(discussionSteps.get(key)||0,turns.length-1),turn=turns[step];
  const revealed=discussionRevealed.has(key),suppressed=discussionSuppressed.has(key);
  return `<article class="thread ${revealed?'revealed':''} ${suppressed?'hover-suppressed':''}" data-thread-key="${key}" aria-label="Conversation ${r.i+1}, turn ${step+1} of ${turns.length}"><div class="thread-top"><h2 class="thread-question"><button type="button" class="question-trigger" data-reveal="${r.i}" aria-expanded="${revealed}" aria-controls="thread-answer-${index}-${r.i}">${escape(turn.question)}</button></h2><div class="thread-icons">${metadataIcon('◉','Person and date',`${demoNames[r.i%8]} · October 4, 2026 · ${r.i+2} minutes ago`)}${metadataIcon('⌗','Topic and type',`${r.topic} · ${r.kind==='AI questions'?'Question':r.kind==='Disagreements'?'Disagreement':'Human reply'}`)}</div></div><div class="thread-answer" id="thread-answer-${index}-${r.i}"><span class="answer-by">${r.kind==='AI questions'?'Grok':'Community'} <span>· sample response</span></span><p>${escape(turn.answer)}</p></div><div class="thread-navigation"><span class="turn-counter">${String(step+1).padStart(2,'0')} / ${String(turns.length).padStart(2,'0')}</span><span class="turn-controls"><button type="button" data-turn="${r.i}" data-direction="-1" aria-label="Previous question in this thread" ${step===0?'disabled':''}>↑</button><button type="button" data-turn="${r.i}" data-direction="1" aria-label="Next question in this thread" ${step===turns.length-1?'disabled':''}>↓</button></span></div></article>`;
 }).join('')}</div><div class="discussion-bottom"><span>DESIGN PREVIEW · ${seed.length} SAMPLE GROK QUESTIONS · NO LIVE AI</span></div></section>`;
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
