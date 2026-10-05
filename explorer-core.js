(function(root){
 const count=v=>Number.isFinite(v)&&v>=0?v:null;
 const ratio=p=>count(p.xLikes)>0&&count(p.xBookmarks)!==null?p.xBookmarks/p.xLikes*100:null;
 const defaults=()=>({tab:'explore',category:'All',likes:0,bookmarks:0,ratio:0,sort:'Likes',days:0,metric:'Reposts',minimum:0,page:0});
 const fields={Likes:'xLikes',Bookmarks:'xBookmarks',Reposts:'xReposts',Replies:'xReplies',Quotes:'xQuotes',Views:'xImpressions'};
 function flatten(topics){const seen=new Set();return topics.flatMap(t=>t.pieces.map(p=>({...p,category:t.interest||t.category,collection:t.title}))).filter(p=>{const key=p.url?.match(/\/status\/(\d+)/)?.[1]||p.url;if(seen.has(key))return false;seen.add(key);return true})}
 function filter(posts,s,now=Date.now()){
  const meets=(v,n)=>n===0||(count(v)!==null&&v>=n);
  const score=p=>s.sort==='Ratio'?(ratio(p)??-1):s.sort==='Newest'?(Date.parse(p.date)||-1):(count(p[fields[s.sort]])??-1);
  return posts.filter(p=>!p.xUnavailable&&(s.category==='All'||p.category===s.category)&&meets(p.xLikes,s.likes)&&meets(p.xBookmarks,s.bookmarks)&&meets(ratio(p),s.ratio)&&meets(p[fields[s.metric]],s.minimum)&&(!s.days||(Date.parse(p.date)>=now-s.days*86400000&&Date.parse(p.date)<=now))).sort((a,b)=>score(b)-score(a)||a.url.localeCompare(b.url));
 }
 const api={count,ratio,defaults,flatten,filter};if(typeof module!=='undefined')module.exports=api;else root.GoldExplorer=api;
})(globalThis);
