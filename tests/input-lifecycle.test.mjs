import test from 'node:test';
import assert from 'node:assert/strict';
import {viewport} from '../dist/games/shared.js';

/*
 * Shell-level input dispatch tests for R01 (input timing and gesture ownership).
 *
 * These drive dist/app.js end to end through a minimal DOM/window double so the
 * acceptance scenarios are verified at the dispatch layer games actually receive:
 * held Golf aims, exactly-once press timing, feed ownership, and stale-gesture
 * cleanup across cancel/pause/second-finger/background/restart/resize.
 *
 * This is not a browser: no layout, no rendering, no real pointer capture, and
 * audio never leaves its locked state. Visual, real-device, and listening
 * evidence stay separate gates (refinement/sidequest-refinement/references/qa-protocol.md).
 */

const canvasTexts=[];
const createdElements=[];

function element(tag='div'){
  const listeners=new Map();
  const el={
    tagName:String(tag).toUpperCase(),children:[],dataset:{},attributes:{},textContent:'',innerHTML:'',value:'',checked:false,disabled:false,inert:false,scrollTop:0,
    clientWidth:390,clientHeight:844,offsetHeight:0,offsetWidth:0,
    style:{setProperty(){},transform:'',opacity:'',left:'',top:'',animation:''},
    classList:{set:new Set(),add(...names){names.forEach(name=>this.set.add(name));},remove(...names){names.forEach(name=>this.set.delete(name));},toggle(name,force){if(force===undefined){this.set.has(name)?this.set.delete(name):this.set.add(name);}else if(force){this.set.add(name);}else{this.set.delete(name);}},contains(name){return this.set.has(name);}},
    append(...nodes){el.children.push(...nodes);},
    appendChild(node){el.children.push(node);return node;},
    replaceChildren(...nodes){el.children.length=0;el.children.push(...nodes);},
    setAttribute(name,value){el.attributes[name]=String(value);},
    removeAttribute(name){delete el.attributes[name];},
    getAttribute(name){return el.attributes[name];},
    addEventListener(type,fn){listeners.set(type,[...(listeners.get(type)||[]),fn]);},
    removeEventListener(){},
    setPointerCapture(){},releasePointerCapture(){},
    focus(){},showModal(){el.attributes.open='';},close(){delete el.attributes.open;},remove(){},
    getBoundingClientRect(){return {left:0,top:0,width:390,height:844};},
    closest(){return null;},
    dispatch(type,event={}){const detail={type,target:el,currentTarget:el,preventDefault(){},stopPropagation(){},...event};for(const fn of listeners.get(type)||[])fn(detail);},
  };
  if(tag!=='canvas')createdElements.push(el);
  return el;
}

function canvasElement(){
  const gradient={addColorStop(){}};
  const ctx={canvas:null,font:'',fillStyle:'',strokeStyle:'',lineWidth:1,textAlign:'',textBaseline:'',globalAlpha:1,
    measureText:value=>({width:String(value).length*7}),createLinearGradient:()=>gradient,createRadialGradient:()=>gradient,
    save(){},restore(){},
    fillText(value){canvasTexts.push(String(value));if(canvasTexts.length>4000)canvasTexts.splice(0,2000);}};
  for(const name of ['fillRect','clearRect','strokeRect','moveTo','lineTo','translate','scale','rotate','setTransform','arc','roundRect','ellipse','quadraticCurveTo','bezierCurveTo','clip','beginPath','closePath','fill','stroke','setLineDash'])ctx[name]=()=>{};
  const el={width:0,height:0,setAttribute(){},getContext:()=>ctx,remove(){},style:{setProperty(){}}};
  ctx.canvas=el;
  return el;
}

const ids=new Map(),docListeners=new Map(),windowListeners=new Map(),dialogElements=[];
for(const id of ['lineup-dialog','help-dialog','audio-dialog']){
  const dialog=element('dialog');dialog.id=id;
  const grip=element('div'),closeButton=element('button');
  dialog.querySelector=selector=>selector==='[data-sheet-drag]'?grip:selector==='.dialog-close'?closeButton:null;
  dialogElements.push(dialog);ids.set(id,dialog);
}
const metaTheme=element('meta');
const documentStub={
  hidden:false,
  createElement(tag){return tag==='canvas'?canvasElement():element(tag);},
  createTextNode(text){return {textContent:String(text)};},
  getElementById(id){if(!ids.has(id))ids.set(id,element('div'));return ids.get(id);},
  querySelector(selector){
    if(selector==='dialog[open]')return dialogElements.find(dialog=>'open' in dialog.attributes)||null;
    if(selector==='meta[name="theme-color"]')return metaTheme;
    return null;
  },
  querySelectorAll(selector){
    if(selector==='dialog')return dialogElements;
    if(selector==='[data-game]')return createdElements.filter(el=>'game' in el.dataset);
    return [];
  },
  addEventListener(type,fn){docListeners.set(type,[...(docListeners.get(type)||[]),fn]);},
  removeEventListener(){},
  hasFocus(){return true;},
};
const windowStub={innerWidth:390,innerHeight:844,devicePixelRatio:2,
  addEventListener(type,fn){windowListeners.set(type,[...(windowListeners.get(type)||[]),fn]);},
  removeEventListener(){}};

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
function frames(count,ms=16){for(let i=0;i<count;i++)frame(ms);}
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
function pointer(type,id,x,y){arcade.dispatch(type,{pointerId:id,clientX:x,clientY:y,button:0,target:arena});}
function down(id=1,x=195,y=400){pointer('pointerdown',id,x,y);}
function move(id=1,x,y){pointer('pointermove',id,x,y);}
function up(id=1,x=195,y=400){pointer('pointerup',id,x,y);}
function tapAt(x=195,y=400){down(1,x,y);up(1,x,y);}
function docDispatch(type,event={}){const detail={type,target:bodyStub,currentTarget:documentStub,preventDefault(){},stopPropagation(){},...event};for(const fn of docListeners.get(type)||[])fn(detail);}
function windowDispatch(type,event={}){const detail={type,target:windowStub,currentTarget:windowStub,preventDefault(){},stopPropagation(){},...event};for(const fn of windowListeners.get(type)||[])fn(detail);}
function key(name,repeat=false){docDispatch('keydown',{key:name,repeat,target:bodyStub});docDispatch('keyup',{key:name,target:bodyStub});}
const phase=()=>arcade.dataset.phase;
function latestText(pattern){for(let i=canvasTexts.length-1;i>=0;i--)if(pattern.test(canvasTexts[i]))return canvasTexts[i];return null;}
function recentText(pattern,lookback=240){return canvasTexts.slice(-lookback).some(value=>pattern.test(value));}
function gameButton(title){
  for(const button of byId('game-list').children){
    const copy=button.children[1];
    if(copy&&copy.children[0]&&copy.children[0].textContent===title)return button;
  }
  throw new Error(`lineup button not found: ${title}`);
}
function openLineup(){down(1,195,400);move(1,295,400);up(1,295,400);}
async function openGame(title){
  // Neutralize whatever state an earlier scenario left behind, including timers.
  documentStub.hidden=true;docDispatch('visibilitychange');documentStub.hidden=false;
  openLineup();
  gameButton(title).dispatch('click'); // selects the game, or resumes it if already current
  key('r'); // either way, restart into a guaranteed-fresh instance
  tapAt(); // skip the countdown
  frames(3);
  assert.equal(phase(),'playing',`${title} did not reach the playing state`);
}
function clientPoint(localX,localY,height=480){
  const field=viewport(390,844,0,0,118,123).field;
  const k=Math.min(field.w/360,field.h/height),scale=Math.min(390/400,844/720);
  return {x:(field.x+(field.w-360*k)/2+localX*k)*scale,y:(field.y+(field.h-height*k)/2+localY*k)*scale};
}
function freshGolfAim(){
  down(1,195,400);move(1,95,400);up(1,95,400); // pull left: a putt away from the cup
  frames(4);
}

test('default-policy games keep release taps and hold-to-pause (Four in a Row)',async()=>{
  await openGame('Four in a Row');
  assert.match(byId('gesture-hint').innerHTML,/Hold to pause/);
  down(1,195,400);
  frames(2);
  assert.ok(recentText(/YOUR TURN/),'a press must not place a disc for a default-policy game');
  up(1,195,400); // quick release: the tap is judged here
  frames(2);
  assert.ok(recentText(/THINKING…/),'the release tap should drop the player disc');
  // The hold path still pauses games that do not own the pointer.
  down(1,195,400);
  await sleep(300);
  assert.equal(byId('hold-feedback').classList.contains('visible'),true,'hold feedback should be armed for default-policy games');
  await sleep(400);
  assert.equal(phase(),'paused','hold-to-pause should still work for default-policy games');
  up(1,195,400);
  assert.equal(byId('hold-feedback').classList.contains('visible'),false);
});

test('a held Pocket Golf aim neither pauses nor fires for one second',async()=>{
  await openGame('Pocket Golf');
  assert.doesNotMatch(byId('gesture-hint').innerHTML,/Hold to pause/);
  assert.match(byId('gesture-hint').innerHTML,/Two-finger swipe to browse/);
  down(1,195,400); // the aim starts on press
  for(let i=0;i<60;i++){await sleep(16);frame(16);} // ~1s hold with live frames
  assert.equal(phase(),'playing','a held golf aim must not invoke pause');
  assert.equal(byId('hold-feedback').classList.contains('visible'),false,'hold feedback must not arm during a golf aim');
  assert.equal(latestText(/STROKES LEFT/),'20 STROKES LEFT','a held golf aim must not fire a putt');
  assert.ok(latestText(/POWER \d+% · release to putt/),'the aim should remain active while holding');
  move(1,95,400); // pull back to set direction and power
  up(1,95,400); // release to putt
  frames(4);
  assert.equal(latestText(/STROKES LEFT/),'19 STROKES LEFT','release should fire exactly one putt');
  frames(40);
  assert.equal(latestText(/STROKES LEFT/),'19 STROKES LEFT','one release must not create extra strokes');
  assert.equal(phase(),'playing');
});

test('press-timing games judge the action once, at press (Stack)',async()=>{
  await openGame('Stack');
  assert.match(byId('gesture-hint').innerHTML,/Hold to pause/);
  assert.equal(byId('score').textContent,'00');
  // Stack slides the block at 105+height*7 px/s with a ±6px perfect window around x=70.
  // This schedule walks the block into that window before every press so each drop
  // is a perfect placement and the tower never narrows into a miss.
  const presses=[36,33,35,30,31,27,28]; // frames of travel before each press
  for(const travel of presses){
    frames(travel);
    const before=Number(byId('score').textContent);
    down(1,195,400);
    assert.equal(byId('score').textContent,String(before+1).padStart(2,'0'),'the timing action should fire on press');
    up(1,195,400);
    assert.equal(byId('score').textContent,String(before+1).padStart(2,'0'),'the release must not repeat the press action');
  }
  assert.equal(byId('score').textContent,'07','rapid presses each drop exactly one block');
  key(' ');
  assert.equal(byId('score').textContent,'08','keyboard Space remains an equivalent single action');
  key(' ',true); // an auto-repeated key must not re-fire
  assert.equal(byId('score').textContent,'08');
  frames(28); // align the next block before the hold
  down(1,195,400);
  const heldScore=byId('score').textContent;
  await sleep(650);
  assert.equal(phase(),'paused','hold-to-pause still applies after a press action');
  assert.equal(byId('score').textContent,heldScore,'holding must not drop another block');
  up(1,195,400);
});

test('press timing judges the intended moment, not the release (Beat Drop)',async()=>{
  await openGame('Beat Drop');
  const lane0=clientPoint(45,300); // lane 0, mid-board
  frames(125); // the first note sits at t=2.000s; the clock reaches it within the 85ms perfect window
  down(1,lane0.x,lane0.y);
  assert.equal(byId('score').textContent,'102','a press on the note should be judged perfect immediately');
  frames(8); // keep holding past the perfect window
  up(1,lane0.x,lane0.y);
  assert.equal(byId('score').textContent,'102','the release must not re-judge or downgrade the press');
  frames(20);
  assert.equal(byId('score').textContent,'102');
  assert.equal(phase(),'playing');
});

test('cancel, pause, second finger, background and restart leave no stale golf gesture',async()=>{
  await openGame('Pocket Golf');
  // Keyboard pause mid-aim
  down(1,195,400);
  key('p');
  assert.equal(phase(),'paused');
  up(1,195,400); // the finger that was aiming lifts after the pause
  assert.equal(latestText(/STROKES LEFT/),'20 STROKES LEFT','pause must not fire the putt');
  tapAt(); // a single tap schedules the resume via the 280ms tap timer
  await sleep(400);
  assert.equal(phase(),'playing','a single tap should resume the paused game');
  freshGolfAim();
  assert.equal(latestText(/STROKES LEFT/),'19 STROKES LEFT','a fresh aim must work after resume');
  // A second finger converts the aim into a deliberate feed gesture
  down(1,195,400);
  down(2,250,400);
  move(1,150,300);move(2,200,300);
  up(1,150,300);
  frames(2);
  assert.equal(phase(),'playing');
  assert.equal(latestText(/STROKES LEFT/),'19 STROKES LEFT','a second finger must cancel the aim without firing');
  up(2,200,300);
  assert.notEqual(byId('game-title').textContent,'Pocket Golf','a two-finger swipe should navigate the feed');
  assert.equal(phase(),'ready');
  // Backgrounding mid-aim
  await openGame('Pocket Golf');
  down(1,195,400);
  documentStub.hidden=true;docDispatch('visibilitychange');
  assert.equal(phase(),'paused');
  up(1,195,400);
  assert.equal(latestText(/STROKES LEFT/),'20 STROKES LEFT','backgrounding must not fire the putt');
  documentStub.hidden=false;
  tapAt();
  await sleep(400);
  assert.equal(phase(),'playing');
  freshGolfAim();
  assert.equal(latestText(/STROKES LEFT/),'19 STROKES LEFT');
  // Double-tap restart mid-session leaves a clean fresh game
  key('p');
  assert.equal(phase(),'paused');
  tapAt();tapAt();
  assert.equal(phase(),'countdown');
  tapAt(); // skip the countdown
  assert.equal(phase(),'playing');
  freshGolfAim();
  assert.equal(latestText(/STROKES LEFT/),'19 STROKES LEFT','restart must restore a fresh course and a working aim');
  // Pointer cancellation and window resize during an aim
  frames(220); // let the rolling ball settle
  down(1,195,400);
  arcade.dispatch('pointercancel',{pointerId:1,target:arena,preventDefault(){}});
  up(1,195,400);
  frames(2);
  assert.equal(latestText(/STROKES LEFT/),'19 STROKES LEFT','pointercancel must not leave a putt behind');
  down(1,195,400);
  windowDispatch('resize');
  up(1,195,400);
  frames(2);
  assert.equal(latestText(/STROKES LEFT/),'19 STROKES LEFT','resize must cancel the aim without firing');
  assert.equal(phase(),'playing');
});

test('centre swipes stay in the game while the right edge navigates',async()=>{
  await openGame('Pocket Golf');
  down(1,195,400);move(1,195,150);up(1,195,150); // a full-height centre swipe
  frames(4);
  assert.equal(byId('game-title').textContent,'Pocket Golf','a centre swipe must not navigate during play');
  assert.equal(phase(),'playing');
  assert.equal(latestText(/STROKES LEFT/),'19 STROKES LEFT','the centre swipe became a game putt, not a feed jump');
  down(1,380,400);move(1,380,250);up(1,380,250); // the right edge belongs to the feed
  assert.notEqual(byId('game-title').textContent,'Pocket Golf','an edge swipe should navigate');
  assert.equal(phase(),'ready');
});
