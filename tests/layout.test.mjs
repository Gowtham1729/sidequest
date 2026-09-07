import test from 'node:test';
import assert from 'node:assert/strict';
import {viewport, surface, point} from '../dist/games/shared.js';
import {cabinet} from '../dist/games/cabinet.js';
import {surface as artSurface} from '../dist/games/art.js';
import {gestureOwner} from '../dist/gestures.js';
import {games} from '../dist/registry.js';

/*
 * R02 layout-contract tests: stable HUD geometry across phases, compact
 * pause/browse controls, feed-rail ownership that follows the rendered rail,
 * explicit layout families with backward-compatible defaults, and pointer
 * mapping that survives the scene entry animation.
 *
 * This drives dist/app.js through a minimal DOM double (same pattern as the
 * R01 lifecycle tests). It cannot see CSS: phase-stable rendered heights are
 * verified separately in a real browser (refinement/evidence/r02-browser/).
 */

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
const windowStub={innerWidth:390,innerHeight:844,devicePixelRatio:2,addEventListener(t,f){windowListeners.set(t,[...(windowListeners.get(t)||[]),f]);},removeEventListener(){}};
globalThis.document=documentStub;
globalThis.window=windowStub;
globalThis.getComputedStyle=()=>({getPropertyValue:()=>0});
globalThis.ResizeObserver=class{constructor(fn){this.fn=fn;}observe(){}disconnect(){}};
let rafQueue=[];
globalThis.requestAnimationFrame=cb=>{rafQueue.push(cb);return rafQueue.length;};

await import('../dist/app.js');

const byId=id=>documentStub.getElementById(id);
const arcade=byId('arcade'),arena=byId('arena'),bodyStub=element('body');
byId('top-hud').offsetHeight=110;
byId('bottom-hud').offsetHeight=115;
let simTime=performance.now();
function frame(ms=16){simTime=Math.max(simTime+ms,performance.now());const cb=rafQueue.shift();assert.ok(cb,'no animation frame scheduled');cb(simTime);}
function frames(n){for(let i=0;i<n;i++)frame();}
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const phase=()=>arcade.dataset.phase;
function tapAt(x=195,y=400){arcade.dispatch('pointerdown',{pointerId:1,clientX:x,clientY:y,button:0,target:arena});arcade.dispatch('pointerup',{pointerId:1,clientX:x,clientY:y,button:0,target:arena});}
async function startPlaying(){
  documentStub.hidden=true;for(const f of docListeners.get('visibilitychange')||[])f({type:'visibilitychange',target:documentStub});documentStub.hidden=false;
  tapAt();tapAt(); // start, then skip the countdown
  frames(3);
  assert.equal(phase(),'playing','did not reach the playing state');
}

test('all 34 game IDs are preserved and unique',()=>{
  assert.equal(games.length,34);
  assert.equal(new Set(games.map(g=>g.id)).size,34);
});
test('the catalogue description is derived from the authoritative registry',()=>{
  assert.match(metaDescription.content,/^34 games\./);
});
test('top HUD tap pauses drag games while gameplay and browse stay separate',async()=>{
  const golf=createdElements.find(el=>Number(el.dataset.game)===games.findIndex(g=>g.id==='golf'));
  golf.dispatch('click');
  await startPlaying();
  const header=element();header.closest=s=>s==='#top-hud'||s==='[data-feed-zone]'?header:null;
  arcade.dispatch('pointerdown',{pointerId:1,clientX:195,clientY:40,button:0,target:header});
  arcade.dispatch('pointerup',{pointerId:1,clientX:195,clientY:40,button:0,target:header});
  assert.equal(phase(),'paused','top HUD must pause a drag-policy game');
  byId('accessible-play').dispatch('click');
  assert.equal(phase(),'playing');
  // A footer tap must not pause; it remains a feed zone for swipes.
  const footer=element();footer.closest=s=>s==='[data-feed-zone]'?footer:null;
  arcade.dispatch('pointerdown',{pointerId:1,clientX:195,clientY:780,button:0,target:footer});
  arcade.dispatch('pointerup',{pointerId:1,clientX:195,clientY:780,button:0,target:footer});
  assert.equal(phase(),'playing');
  byId('hud-games').dispatch('click');
  assert.ok(documentStub.querySelector('dialog[open]'));
  assert.equal(phase(),'paused','opening the lineup must pause the game');
  documentStub.querySelector('dialog[open]').close();
});
test('aborted countdown swipe returns to a startable ready screen',()=>{
  byId('accessible-restart').dispatch('click');
  assert.equal(phase(),'countdown');
  arcade.dispatch('pointerdown',{pointerId:1,clientX:195,clientY:400,button:0,target:arena});
  arcade.dispatch('pointermove',{pointerId:1,clientX:195,clientY:420,target:arena});
  arcade.dispatch('pointerup',{pointerId:1,clientX:195,clientY:420,target:arena});
  assert.equal(phase(),'ready','small feed drag must not strand a cancelled countdown');
  tapAt();tapAt();
  assert.equal(phase(),'playing');
});
test('feed ownership follows the rendered rail width',()=>{
  assert.equal(gestureOwner({phase:'playing',x:362,width:390}),'feed','default 28px rail keeps the edge');
  assert.equal(gestureOwner({phase:'playing',x:361,width:390}),'game');
  assert.equal(gestureOwner({phase:'playing',x:355,width:390,rail:38}),'feed','a measured 38px desktop rail owns its full visual width');
  assert.equal(gestureOwner({phase:'playing',x:351,width:390,rail:38}),'game');
});
test('key events without an element target never throw',()=>{
  const before=phase();
  // documentStub has no closest(): a neutral key must be ignored, not crash.
  for(const f of docListeners.get('keydown')||[])f({type:'keydown',key:'x',target:documentStub,currentTarget:documentStub,preventDefault(){}});
  assert.equal(phase(),before,'a neutral key on a non-element target must be ignored cleanly');
});
test('layout families default to current geometry',()=>{
  const env={mount:{clientWidth:390,clientHeight:844,replaceChildren(){}}};
  const realDocument=globalThis.document;
  globalThis.document={...realDocument,getElementById:id=>({offsetHeight:id==='top-hud'?110:115})};
  try{
    const s=surface(env.mount);
    assert.equal(s.view.layout,'scene');
    assert.deepEqual(s.view.field,viewport(390,844,0,0,118,123).field);
    const tagged=surface(env.mount,{layout:'board',maxFieldWidth:520});
    assert.equal(tagged.view.layout,'board');
    s.destroy();tagged.destroy();
  }finally{globalThis.document=realDocument;}
});
test('cabinet and art surfaces declare their layout families',()=>{
  const env={mount:{clientWidth:390,clientHeight:844,replaceChildren(){}}};
  const realDocument=globalThis.document;
  globalThis.document={...realDocument,getElementById:id=>({offsetHeight:id==='top-hud'?110:115})};
  try{
    const api={score(){},finish(){},audio:{play(){}}};
    const current=cabinet(env.mount,api,{}); // existing callers pass accent/height only
    current.destroy();
    const tagged=cabinet(env.mount,api,{layout:'board'});
    tagged.destroy();
    const themed=artSurface(env.mount,'court'); // existing callers pass a theme only
    assert.equal(themed.view.layout,'scene');
    themed.destroy();
    const sceneTagged=artSurface(env.mount,'court',{layout:'board'});
    assert.equal(sceneTagged.view.layout,'board');
    sceneTagged.destroy();
  }finally{globalThis.document=realDocument;}
});
test('pointer mapping ignores the scene entry-animation translation',()=>{
  const realComputed=globalThis.getComputedStyle;
  const arenaStub={getBoundingClientRect:()=>({left:0,top:143,width:390,height:844}),parentElement:null};
  const sceneStub={};
  const settled={getBoundingClientRect:()=>({left:0,top:0,width:390,height:844}),parentElement:null};
  try{
    globalThis.getComputedStyle=()=>({getPropertyValue:()=>0,transform:'none'});
    const plain=point({clientX:195,clientY:400},settled,sceneStub);
    // Same stationary finger during the entry animation: the arena rect has
    // moved with #scene, but the press must map to the settled game point so
    // gestures spanning the 300ms animation keep consistent vectors.
    globalThis.getComputedStyle=()=>({getPropertyValue:()=>0,transform:'matrix(1, 0, 0, 1, 0, 143)'});
    const shifted=point({clientX:195,clientY:400},arenaStub,sceneStub);
    assert.ok(Math.abs(plain.x-shifted.x)<1e-9&&Math.abs(plain.y-shifted.y)<1e-9,'a press during the 300ms entry animation must map to the settled point');
    globalThis.getComputedStyle=()=>{throw new Error('no computed style');};
    const fallback=point({clientX:195,clientY:400},settled,sceneStub);
    assert.ok(Math.abs(fallback.x-plain.x)<1e-9,'an unreadable transform must fall back to the direct mapping');
  }finally{globalThis.getComputedStyle=realComputed;}
});
