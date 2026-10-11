/* Only verified same-author reply chains become navigable threads. */
(function(global){
 'use strict';
 const id=post=>post?.url?.match(/^https:\/\/x\.com\/[^/]+\/status\/(\d+)$/)?.[1];
 function parts(root){
  const thread=root?.xThread;
  if(!id(root)||!/^[A-Za-z0-9_]{1,15}$/.test(root?.xUsername||'')||!thread?.verified||thread.rootURL!==root.url||!Array.isArray(thread.parts)||!thread.parts.length)return [root];
  const result=[root],seen=new Set([id(root)]);
  for(const part of thread.parts){
   const status=id(part),parent=id(result.at(-1));
   if(!status||seen.has(status)||part.xUsername?.toLowerCase()!==root.xUsername?.toLowerCase()||part.xReplyTo!==parent)return [root];
   seen.add(status);result.push(part);
  }
  return result;
 }
 // These signals request source review; they never prove a thread exists.
 function candidate(post){
  const text=String(post?.xText||'');
  const numbered=text.match(/(?:\(|\b)(\d{1,3})\s*\/\s*(\d{1,3})(?:\)|\b)/);
  if(numbered&&Number(numbered[2])>1&&Number(numbered[1])<=Number(numbered[2]))return {reason:'numbered thread',position:Number(numbered[1]),expected:Number(numbered[2])};
  if(/🧵|\bthread\b|\b(?:we explain|read more|more details|continued)\s+(?:below|in the replies)\b/i.test(text))return {reason:'possible continuation'};
  if(/\b(?:links?|resources?|videos?|courses?|repos?|repositories|papers?|details?)\s+(?:are\s+|is\s+)?(?:below|attached|in\s+(?:the\s+)?(?:comments|replies|thread))\b|\b(?:see|check|read|watch|find)\s+(?:it\s+|more\s+|the\s+)?(?:below|in\s+(?:the\s+)?(?:comments|replies|thread))\b/i.test(text))return {reason:'possible attached resource'};
  return null;
 }
 const positions=new Map();
 const index=root=>Math.min(positions.get(root?.url)||0,parts(root).length-1);
 const current=root=>root?parts(root)[index(root)]:root;
 function move(root,step){
  const list=parts(root),next=Math.max(0,Math.min(list.length-1,index(root)+step));
  positions.set(root.url,next);return list[next];
 }
 const api={parts,candidate,index,current,move};
 global.ThreadReading=api;
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
