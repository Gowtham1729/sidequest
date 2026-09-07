import test from 'node:test';
import assert from 'node:assert/strict';
import {createMotion,endingDuration} from '../dist/games/motion.js';
import {surface} from '../dist/games/shared.js';
import {cabinet} from '../dist/games/cabinet.js';
import {games} from '../dist/registry.js';
import {GameAudio} from '../dist/audio/engine.js';

// Deterministic shell fixture; DOM double, no browser/touch/audio claims.
const createdElements=[];
function element(tag='div'){
  const listeners=new Map();
  const el={
    tagName:String(tag).toUpperCase(),children:[],dataset:{},attributes:{},textContent:'',innerHTML:'',value:'',checked:false,disabled:false,inert:false,scrollTop:0,
    clientWidth:390,clientHeight:844,offsetHeight:0,offsetWidth:0,
    style:{setProperty(){},transform:'',opacity:'',left:'',top:'',animation:''},
    classList:{set:new Set(),add(...n){n.forEach(c=>this.set.add(c));},remove(...n){n.forEach(c=>this.set.delete(c));},toggle(n,f){if(f===undefined){this.set.has(n)?this.set.delete(n):this.set.add(n);}else if(f){this.set.add(n);}else{this.set.delete(n);}},contains(n){return this.set.has(n);}},
    append(...n){el.children.push(...n);},
    appendChild(n){el.children.push(n);return n;},
    replaceChildren(...n){el.children.length=0;el.children.push(...n);},
    setAttribute(n,v){el.attributes[n]=String(v);},
    removeAttribute(n){delete el.attributes[n];},
    getAttribute(n){return el.attributes[n];},
    addEventListener(t,f){listeners.set(t,[...(listeners.get(t)||[]),f]);},
    removeEventListener(){},
    setPointerCapture(){},releasePointerCapture(){},
    focus(){},showModal(){el.attributes.open='';},close(){delete el.attributes.open;},remove(){},
    getBoundingClientRect(){return {left:0,top:0,width:390,height:844};},
    closest(){return null;},
    dispatch(t,e={}){const d={type:t,target:el,currentTarget:el,preventDefault(){},stopPropagation(){},...e};for(const f of listeners.get(t)||[])f(d);},
  };
  if(tag!=='canvas')createdElements.push(el);
  return el;
}
function canvasElement(){
  const gradient={addColorStop(){}};
  const ctx={canvas:null,font:'',fillStyle:'',strokeStyle:'',lineWidth:1,textAlign:'',textBaseline:'',globalAlpha:1,measureText:v=>({width:String(v).length*7}),createLinearGradient:()=>gradient,createRadialGradient:()=>gradient,save(){},restore(){},fillText(){}};
  for(const name of ['fillRect','clearRect','strokeRect','moveTo','lineTo','translate','scale','rotate','setTransform','arc','roundRect','ellipse','quadraticCurveTo','bezierCurveTo','clip','beginPath','closePath','fill','stroke','setLineDash'])ctx[name]=()=>{};
  const el={width:0,height:0,setAttribute(){},getContext:()=>ctx,remove(){},style:{setProperty(){}}};
  ctx.canvas=el;return el;
}
const ids=new Map(),docListeners=new Map(),windowListeners=new Map(),dialogElements=[];
for(const id of ['lineup-dialog','help-dialog','audio-dialog']){
  const d=element('dialog');d.id=id;
  const grip=element('div'),closeButton=element('button');
  d.querySelector=s=>s==='[data-sheet-drag]'?grip:s==='.dialog-close'?closeButton:null;
  dialogElements.push(d);ids.set(id,d);
}
const metaTheme=element('meta');metaTheme.content='';
const metaDescription=element('meta');metaDescription.content='';
const documentStub={
  hidden:false,
  createElement(t){return t==='canvas'?canvasElement():element(t);},
  createTextNode(t){return {textContent:String(t)};},
  getElementById(id){if(!ids.has(id))ids.set(id,element('div'));return ids.get(id);},
  querySelector(s){
    if(s==='dialog[open]')return dialogElements.find(d=>'open' in d.attributes)||null;
    if(s==='meta[name="theme-color"]')return metaTheme;
    if(s==='meta[name="description"]')return metaDescription;
    return null;
  },
  querySelectorAll(s){
    if(s==='dialog')return dialogElements;
    if(s==='[data-game]')return createdElements.filter(el=>'game' in el.dataset);
    return [];
  },
  addEventListener(t,f){docListeners.set(t,[...(docListeners.get(t)||[]),f]);},
  removeEventListener(){},
  hasFocus(){return true;},
};
const preference={matches:false};
const windowStub={matchMedia:()=>preference,innerWidth:390,innerHeight:844,devicePixelRatio:2,addEventListener(t,f){windowListeners.set(t,[...(windowListeners.get(t)||[]),f]);},removeEventListener(){}};
globalThis.document=documentStub;
globalThis.window=windowStub;
globalThis.getComputedStyle=()=>({getPropertyValue:()=>0});
globalThis.ResizeObserver=class{constructor(fn){this.fn=fn;}observe(){}disconnect(){}};
let rafQueue=[];
globalThis.requestAnimationFrame=cb=>{rafQueue.push(cb);return rafQueue.length;};


const cues=[];
GameAudio.prototype.play=function(event){cues.push(event);};
const instances=[];
let duration=.4;
games[0]={...games[0],create(mount,api){
  const state={api,sim:0,ticks:0,actions:0,presentation:0,progress:0,cancels:[],destroyed:false};
  instances.push(state);
  return {
    start(){state.sim=0;api.score(7);},
    tick(dt){state.ticks++;state.sim+=dt;},
    action(){state.actions++;api.finish('Done','Fixture ending',7,'win',{duration});},
    present(dt,progress){state.presentation+=dt;state.progress=progress;},
    cancelPresentation(reason){state.cancels.push(reason);},
    destroy(){state.destroyed=true;}
  };
}};
await import('../dist/app.js');
const el=id=>documentStub.getElementById(id);
const phase=()=>el('arcade').dataset.phase;
let now=performance.now();
function frame(ms=20){now=Math.max(now+ms,performance.now());const cb=rafQueue.shift();assert.ok(cb);cb(now);}
function frames(n){for(let i=0;i<n;i++)frame();}
function key(key){for(const f of docListeners.get('keydown')||[])f({key,repeat:false,target:el('arena'),preventDefault(){}});}
function begin(){
  documentStub.hidden=false;preference.matches=false;
  for(const d of dialogElements)d.close();
  const button=createdElements.find(e=>e.dataset.game==='0'||e.dataset.game===0);button.dispatch('click');
  key('r');el('accessible-play').dispatch('click');
  assert.equal(phase(),'playing');frames(2);cues.length=0;
  return instances.at(-1);
}
function end(){key(' ');assert.equal(phase(),'finishing');}

test('terminal outcome is once-only: simulation/input/score stop while visuals advance',()=>{
  const s=begin();end();const sim=s.sim,ticks=s.ticks;
  assert.equal(el('game-mount').inert,true);
  assert.equal(el('game-overlay').hidden,true);
  s.api.score(999);s.api.finish('Duplicate','',999,'lose',{duration:.6});
  frames(5);assert.equal(s.sim,sim);assert.ok(s.presentation>0);assert.ok(s.progress>0&&s.progress<1);
  assert.equal(el('score').textContent,'07');assert.deepEqual(cues,['win']);
  frames(30);assert.equal(phase(),'finished');assert.equal(s.progress,1);
  assert.deepEqual(s.cancels,[]);assert.equal(s.ticks,ticks);assert.equal(el('game-overlay').hidden,false);
  frames(5);assert.deepEqual(cues,['win']);assert.equal(s.sim,sim);assert.equal(s.ticks,ticks);
});
test('pause, sheet, and background freeze ending progress and resume only presentation',()=>{
  const s=begin();end();frames(3);key('p');const elapsed=s.presentation,sim=s.sim;
  frames(20);assert.equal(s.presentation,elapsed);assert.equal(s.sim,sim);
  key('p');assert.equal(phase(),'finishing');frames(2);assert.ok(s.presentation>elapsed);
  el('hud-games').dispatch('click');const sheetTime=s.presentation;frames(5);assert.equal(s.presentation,sheetTime);
  documentStub.querySelector('dialog[open]').close();key('p');
  documentStub.hidden=true;for(const f of docListeners.get('visibilitychange')||[])f({});
  const hiddenTime=s.presentation;frames(20);assert.equal(s.presentation,hiddenTime);
  documentStub.hidden=false;key('p');frames(30);
  assert.equal(phase(),'finished');assert.equal(s.sim,sim);assert.deepEqual(cues,['win']);
});
test('retry during ending cancels it and retired API cannot mutate the new round',()=>{
  const old=begin();end();frames(2);key(' ');
  assert.equal(phase(),'countdown');assert.equal(old.destroyed,true);assert.deepEqual(old.cancels,['replace']);
  el('accessible-play').dispatch('click');assert.equal(phase(),'playing');
  old.api.score(1000);old.api.finish('Late','',1000,'lose',{duration:.5});
  assert.equal(phase(),'playing');assert.equal(el('score').textContent,'07');assert.ok(!cues.includes('lose'));
  const elapsed=old.presentation;frames(30);assert.equal(old.presentation,elapsed);
});
test('completed opt-in round is recreated on replay so old callbacks stay retired',()=>{
  const old=begin();end();frames(35);assert.equal(phase(),'finished');key(' ');
  el('accessible-play').dispatch('click');old.api.finish('Late','',0,'lose');old.api.score(200);
  assert.equal(old.destroyed,true);assert.equal(phase(),'playing');assert.equal(el('score').textContent,'07');
});
test('switching games cancels pending visuals and does not deliver old outcomes',()=>{
  const old=begin();end();key('n');const phaseAfter=phase(),scoreAfter=el('score').textContent;
  old.api.finish('Late','',999,'lose');old.api.score(999);frames(40);
  assert.equal(old.destroyed,true);assert.deepEqual(old.cancels,['replace']);
  assert.equal(phase(),phaseAfter);assert.equal(el('score').textContent,scoreAfter);assert.ok(!cues.includes('lose'));
});
test('reduced motion resolves endings promptly and exposes the live preference to canvas',()=>{
  const s=begin();const canvas=surface({clientWidth:390,clientHeight:844,replaceChildren(){}});
  assert.equal(s.api.reducedMotion,false);assert.equal(canvas.view.reducedMotion,false);
  end();preference.matches=true;assert.equal(s.api.reducedMotion,true);assert.equal(canvas.view.reducedMotion,true);
  frames(5);assert.equal(phase(),'finished');assert.equal(s.progress,1);assert.ok(s.presentation<=.08);
  assert.deepEqual(cues,['win']);canvas.destroy();
  const alreadyReduced=begin();preference.matches=true;end();assert.equal(alreadyReduced.progress,1);
  preference.matches=false;
});
test('unmigrated calls still finish immediately, with no presentation callback',()=>{
  const s=begin();s.api.finish('Legacy','Immediate',7,'finish');
  assert.equal(phase(),'finished');assert.equal(s.presentation,0);assert.deepEqual(cues,['finish']);
});
test('ending duration is bounded and invalid values do not create stuck phases',()=>{
  assert.equal(endingDuration(Infinity),0);assert.equal(endingDuration(NaN),0);
  assert.equal(endingDuration(-1),0);assert.equal(endingDuration(30),.6);
  duration=30;begin();end();frames(40);assert.equal(phase(),'finished');duration=.4;
});
test('named motion freezes at dt=0, settles once under reduced motion, and clears',()=>{
  let reduced=false;const motion=createMotion({reducedMotion:()=>reduced,limit:2});
  motion.to('tile',0,100,.12);motion.tick(.03);const v=motion.value('tile');assert.ok(v>0&&v<100);
  motion.tick(0);assert.equal(motion.value('tile'),v);
  motion.tick(NaN);assert.equal(motion.value('tile'),v);
  reduced=true;assert.equal(motion.value('tile'),100);reduced=false;assert.equal(motion.value('tile'),100);
  motion.to('camera',0,1);motion.to('settle',0,1);assert.equal(motion.size,2);assert.equal(motion.value('tile',-1),-1);
  motion.clear();motion.tick(1);assert.equal(motion.size,0);assert.equal(motion.value('settle',-1),-1);
});
test('cabinet presentation continues after finish without simulation, score or game sounds',()=>{
  const scores=[],sounds=[],outcomes=[];
  const q=cabinet({clientWidth:390,clientHeight:844,replaceChildren(){}},{score:v=>scores.push(v),audio:{play:v=>sounds.push(v)},finish:(...args)=>outcomes.push(args)});
  q.start();let updates=0,draws=0;
  q.frame(.02,()=>updates++,()=>draws++);const elapsed=q.elapsed;
  q.add(3);q.finish('Done','',true,{duration:.4});q.add(5);q.sound('place');
  q.present(.03,()=>draws++);q.frame(.03,()=>updates++,()=>draws++);
  assert.equal(updates,1);assert.equal(q.elapsed,elapsed);assert.deepEqual(scores,[0,3]);assert.deepEqual(sounds,[]);
  assert.equal(outcomes.length,1);assert.deepEqual(outcomes[0].at(-1),{duration:.4});
  q.cancelPresentation();q.destroy();const before=draws;q.present(.03,()=>draws++);assert.equal(draws,before);
});
