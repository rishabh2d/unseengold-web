/* Daily collections and the reading experiments for new batches only. */
(function(global){
 'use strict';
 const archivedDay='2026-09-25';
 const today=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'America/Los_Angeles',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
 const addedDay=post=>post.xAddedDate||(post.xCollection==='additional-30-2026-10-09'?'2026-10-09':archivedDay);
 const enabled=post=>post?.xReadingVersion===2||post?.xCollection==='additional-30-2026-10-09'||/^\d{4}-\d{2}-\d{2}$/.test(post?.xAddedDate||'')&&post.xAddedDate>='2026-10-09';
 const details=entry=>Array.isArray(entry?.answerDetails)?entry.answerDetails.filter(x=>typeof x==='string'&&x.trim()):[];
 const api={today,addedDay,enabled,details,archivedDay};
 global.DailyReading=api;
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
