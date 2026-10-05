(function(root){
  const core={
    viewIndex(slot,total){if(!Number.isInteger(total)||total<1)throw Error('At least one video is required');return ((Math.trunc(Number(slot)||0)%total)+total)%total;},
    layout(total,screens){return Array.from({length:Math.max(1,Math.trunc(screens))},(_,slot)=>core.viewIndex(slot,total));},
    audible(state,key){return state.mode==='manual'?state.manual[key]===true:state.owner===key;},
    audio(state,event){
      if(event.type==='focus')return state.mode==='follow'?{...state,owner:event.key}:state;
      if(event.type==='follow')return {mode:'follow',owner:event.key,manual:{}};
      if(event.type==='toggle'){
        const manual=state.mode==='manual'?{...state.manual}:state.owner?{[state.owner]:true}:{};
        manual[event.key]=!core.audible(state,event.key);
        return {mode:'manual',owner:state.owner,manual};
      }
      if(event.type==='mute-all')return {mode:'manual',owner:null,manual:{}};
      return state;
    }
  };
  if(typeof module!=='undefined')module.exports=core;else root.ParallelCore=core;
})(typeof window==='undefined'?globalThis:window);
