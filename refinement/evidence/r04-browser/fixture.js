// Test-only matched Stack captures. No production controls or deterministic RNG.
import {games} from '/dist/registry.js';
import {createStack as baseline} from './stack-baseline.js';
import {createStack as candidate} from '/dist/games/stack.js';
import {GameAudio} from '/dist/audio/engine.js';
const e=window.r04={baseline:new URLSearchParams(location.search).has('baseline'),cues:[],outcomes:[]};
GameAudio.prototype.play=function(cue){e.cues.push(cue);};
let frame;
window.requestAnimationFrame=callback=>{frame=callback;return 1;};
const factory=e.baseline?baseline:candidate;
games[0]={...games[0],create(mount,api){e.game=factory(mount,{...api,get reducedMotion(){return api.reducedMotion;},finish(...args){e.outcomes.push(args);api.finish(...args);}});return e.game;}};
await import('/dist/app.js');
e.begin=()=>{document.querySelector('#accessible-restart').click();document.querySelector('#accessible-play').click();e.cues=[];e.outcomes=[];};
e.advance=seconds=>{while(seconds>.02){e.game.tick(.02);seconds-=.02;}if(seconds>0)e.game.tick(seconds);};
e.tap=()=>{const arena=document.querySelector('#arena');for(const type of ['pointerdown','pointerup'])arena.dispatchEvent(new PointerEvent(type,{bubbles:true,pointerId:1,clientX:innerWidth/2,clientY:innerHeight/2,button:0}));};
e.state=()=>({baseline:e.baseline,viewport:[innerWidth,innerHeight],phase:document.querySelector('#arcade').dataset.phase,score:document.querySelector('#score').textContent,cues:e.cues,outcomes:e.outcomes});
