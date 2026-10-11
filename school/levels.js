/* Levels measure unique heading exposure. They do not assess retained knowledge. */
(() => {
  const names=['Uncharted','First bearings','Finding the shape','Connecting topics','Seeing the layers','Exploring nuance','Going deeper','Broad familiarity','Mapping the edges','Almost mapped','Map explored'];
  function headingIds(node) {return [node.id,...node.children.flatMap(headingIds)];}
  function progress(ids,viewed) {
    const unique=[...new Set(ids)],total=unique.length,seen=unique.filter(id=>viewed.has(id)).length;
    const level=seen===0?0:seen===total?10:1+Math.floor((seen-1)*9/Math.max(1,total-1));
    let next=seen;
    while(next<total) {next++;const at=next===total?10:1+Math.floor((next-1)*9/Math.max(1,total-1));if(at>level)break;}
    return {seen,total,level,name:names[level],percent:total?Math.round(seen/total*100):0,toNext:level===10?0:next-seen};
  }
  const api={headingIds,progress};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  else window.SchoolLevels=api;
})();
