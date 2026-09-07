// Local-only R03 lifecycle fixture. Not packaged in dist or registered in production.
import {games} from '/dist/registry.js';
import {surface,clear,rect,text} from '/dist/games/shared.js';
import {GameAudio} from '/dist/audio/engine.js';
const nativeFrame=window.requestAnimationFrame.bind(window);
let callback,clock=performance.now();
const evidence=window.r03={manual:true,instances:[],cues:[],step(ms=20){clock=Math.max(clock+ms,performance.now());callback(clock);},live(){this.manual=false;nativeFrame(callback);}};
window.requestAnimationFrame=fn=>{callback=fn;return evidence.manual?1:nativeFrame(fn);};
GameAudio.prototype.play=function(event){evidence.cues.push(event);}; // cue dispatch only; deliberately no audio output
const media=matchMedia('(prefers-reduced-motion: reduce)');
games[0]={...games[0],title:'Ending fixture',hint:'Tap or Space to finish the fixture',create(mount,api){
 const s=surface(mount),state={simulation:0,presentation:0,progress:0,frames:[],cancelled:[],destroyed:false,api};
 evidence.instances.push(state);
 function draw(progress=0){const f=s.view.field;clear(s.ctx);rect(s.ctx,f.x+30,f.y+f.h*.55,f.w-60,24,'#739e46',3);rect(s.ctx,f.x+45+progress*35,f.y+f.h*.45+progress*100,100,24,'#c9f86a',3);text(s.ctx,'R03 · TEST FIXTURE',s.view.width/2,f.y+30,15,'#edf6e7');text(s.ctx,`Final score: 7 · ${Math.round(progress*100)}%`,s.view.width/2,f.y+60,15,'#edf6e7');}
 const finish=()=>api.finish('Fixture complete','Simulation stopped before this animation.',7,'win',{duration:.6});
 draw();return {start(){api.score(7);draw();},tick(dt){state.simulation+=dt;draw(state.progress);},tap:finish,action:finish,
 present(dt,progress){state.presentation+=dt;state.progress=progress;state.frames.push({dt,progress,simulation:state.simulation,phase:document.querySelector('#arcade').dataset.phase});draw(progress);},
 cancelPresentation(reason){state.cancelled.push(reason);},destroy(){state.destroyed=true;s.destroy();}};
}};
await import('/dist/app.js');
evidence.preference=media;
evidence.begin=()=>{document.querySelector('#accessible-restart').click();document.querySelector('#accessible-play').click();evidence.step();evidence.cues.length=0;};
evidence.end=()=>document.querySelector('#arena').dispatchEvent(new KeyboardEvent('keydown',{key:' ',bubbles:true}));
evidence.snapshot=()=>{const s=evidence.instances.at(-1);return {viewport:[innerWidth,innerHeight],phase:document.querySelector('#arcade').dataset.phase,simulation:s.simulation,presentation:s.presentation,progress:s.progress,score:document.querySelector('#score').textContent,overlayHidden:document.querySelector('#game-overlay').hidden,cues:evidence.cues.slice(),cancelled:s.cancelled.slice(),reducedMotion:s.api.reducedMotion};};
