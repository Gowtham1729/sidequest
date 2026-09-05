import {games} from './registry.js';
import {GameFeed} from './feed.js';
import {point} from './games/shared.js';

const $=id=>document.getElementById(id);
const feed=new GameFeed(games.length),bests=new Map();
let game,phase='ready',score=0,activePointer=null,lastFrame=0,swipeStart=null,lastNav=0;
const arena=$('arena'),mount=$('game-mount'),overlay=$('game-overlay');
const directions={ArrowLeft:'left',ArrowRight:'right',ArrowUp:'up',ArrowDown:'down',a:'left',d:'right',w:'up',s:'down'};
const current=()=>games[feed.current];
const modalOpen=()=>!!document.querySelector('dialog[open]');
const announce=value=>{$('announcement').textContent=value;};
$('lineup-count').textContent=String(games.length).padStart(2,'0');
$('game-total').textContent=`/ ${String(games.length).padStart(2,'0')}`;
$('lineup-button').lastChild.textContent=` All ${games.length} games`;
$('footer-count').textContent=`${games.length} games & counting`;

function glyph(el,meta){el.textContent=meta.glyph;el.style.setProperty('--tint',meta.tint);el.style.setProperty('--glyph',meta.ink);el.dataset.kind=meta.id;}
function showScore(value){
  score=value;$('score').textContent=value.toLocaleString(undefined,{minimumIntegerDigits:2});
  if(!current().lowerIsBetter&&value>0){bests.set(current().id,Math.max(value,bests.get(current().id)||0));}
  $('best').textContent=bests.has(current().id)?bests.get(current().id).toLocaleString():'—';
}
function finish(title,subtitle,finalScore){
  if(phase!=='playing')return;
  if(current().lowerIsBetter&&finalScore){bests.set(current().id,Math.min(finalScore,bests.get(current().id)||Infinity));}
  phase='finished';showScore(score);setState();
  $('overlay-title').textContent=title;$('overlay-subtitle').textContent=subtitle;
  $('play-label').textContent='Play again';$('start-hint').textContent='Or swipe below for something new';
  announce(`${title} ${subtitle}`);
}
function setState(){
  const playing=phase==='playing',paused=phase==='paused',ready=phase==='ready';
  overlay.hidden=playing;overlay.classList.toggle('result',!ready);
  $('overlay-copy').hidden=ready;
  mount.inert=!playing;
  $('pause-button').disabled=!playing&&!paused;
  $('pause-button').textContent=paused?'▷':'Ⅱ';
  $('pause-button').setAttribute('aria-label',paused?'Resume game':'Pause game');
  $('status-label').textContent=playing?'IN THE ZONE':paused?'TAKE YOUR TIME':ready?'READY WHEN YOU ARE':'ONE MORE ROUND?';
  arena.setAttribute('aria-label',`${current().title} game area. ${current().instructions} ${ready?'Press Space to start.':''}`);
  document.querySelectorAll('#dpad button').forEach(b=>b.disabled=!playing);
  if(paused){$('overlay-title').textContent='Take a breather.';$('overlay-subtitle').textContent='Your game will be right here.';$('play-label').textContent='Resume game';$('start-hint').textContent='Tap resume or press P';}
  if(ready){$('play-label').textContent=`Play ${current().title}`;$('start-hint').textContent='Tap to play · Space on keyboard';}
}
function start(){if(phase==='paused'){resume();return;}if(phase==='playing')return;phase='playing';setState();game.start();arena.focus({preventScroll:true});lastFrame=performance.now();announce(`${current().title} started.`);}
function pause(){if(phase!=='playing')return;game.pause?.();activePointer=null;phase='paused';setState();announce('Game paused.');}
function resume(){if(phase!=='paused')return;phase='playing';setState();lastFrame=performance.now();arena.focus({preventScroll:true});announce('Game resumed.');}
function renderGame(direction='next'){
  game?.destroy();mount.replaceChildren();activePointer=null;phase='ready';score=0;
  const meta=current();$('game-card').style.setProperty('--game-accent',meta.accent);
  $('game-title').textContent=meta.title;$('game-description').textContent=meta.description;
  $('game-category').textContent=meta.category.toUpperCase();$('game-number').textContent=String(feed.current+1).padStart(2,'0');
  $('game-length').textContent=meta.id==='2048'||meta.id==='memory'?'TAKE YOUR TIME':'QUICK PLAY';
  $('score-label').textContent=meta.scoreLabel;$('game-instructions').textContent=meta.instructions;
  $('control-hint').innerHTML=meta.hint;
  $('input-chips').replaceChildren(...meta.chips.map(chip=>{const el=document.createElement('span');el.textContent=chip;return el;}));
  $('dpad').hidden=!meta.dpad;$('game-controls').classList.toggle('has-dpad',!!meta.dpad);
  game=meta.create(mount,{score:showScore,finish});showScore(0);setState();
  const upcoming=games[feed.peek()];glyph($('next-glyph'),upcoming);$('next-title').textContent=upcoming.title;$('next-category').textContent=upcoming.category;$('next-preview').setAttribute('aria-label',`Next game: ${upcoming.title}`);
  $('previous-button').disabled=feed.cursor===0;
  document.querySelectorAll('[data-game]').forEach(button=>{const active=Number(button.dataset.game)===feed.current;button.classList.toggle('active',active);if(active)button.setAttribute('aria-current','true');else button.removeAttribute('aria-current');});
  const card=$('game-card');card.classList.remove('enter-next','enter-prev');void card.offsetWidth;card.classList.add(direction==='prev'?'enter-prev':'enter-next');
  announce(`${meta.title}. ${meta.instructions}`);
}
function navigate(direction){if(modalOpen())return;lastNav=performance.now();if(direction==='prev'){if(feed.cursor===0)return;feed.previous();}else feed.next();renderGame(direction);}
function selectGame(index){$('lineup-dialog').close();if(index===feed.current)return;feed.select(index);renderGame();}

for(const listId of ['game-list','mobile-game-list']){
  games.forEach((meta,index)=>{const button=document.createElement('button');button.className='game-link';button.dataset.game=index;button.setAttribute('aria-label',`Play ${meta.title}`);const icon=document.createElement('span');icon.className='game-glyph';icon.setAttribute('aria-hidden','true');glyph(icon,meta);const name=document.createElement('span');name.textContent=meta.title;button.append(icon,name);button.addEventListener('click',()=>selectGame(index));$(listId).append(button);});
}
$('play-button').addEventListener('click',start);
$('pause-button').addEventListener('click',()=>phase==='paused'?resume():pause());
$('restart-button').addEventListener('click',()=>{renderGame();start()});
$('previous-button').addEventListener('click',()=>navigate('prev'));
$('next-button').addEventListener('click',()=>navigate('next'));
$('next-preview').addEventListener('click',()=>navigate('next'));
$('help-button').addEventListener('click',()=>{pause();$('help-dialog').showModal()});
$('lineup-button').addEventListener('click',()=>{pause();$('lineup-dialog').showModal()});
document.querySelectorAll('dialog').forEach(dialog=>{
  dialog.querySelectorAll('.dialog-close,.dialog-done').forEach(button=>button.addEventListener('click',()=>dialog.close()));
  dialog.addEventListener('click',e=>{if(e.target!==dialog)return;const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();});
});
document.querySelectorAll('#dpad button').forEach(button=>button.addEventListener('click',()=>{if(phase==='playing')game.direction?.(button.dataset.dir);}));

// Pointer ownership is fixed at pointer-down. Game gestures never reach feed navigation.
arena.addEventListener('pointerdown',event=>{
  if(phase!=='playing'||event.target.closest('button')||activePointer!==null)return;
  event.preventDefault();activePointer=event.pointerId;arena.setPointerCapture(event.pointerId);arena.focus({preventScroll:true});game.pointerDown?.(point(event,arena));
});
arena.addEventListener('pointermove',event=>{if(event.pointerId===activePointer&&phase==='playing')game.pointerMove?.(point(event,arena));});
arena.addEventListener('pointerup',event=>{if(event.pointerId!==activePointer)return;if(phase==='playing')game.pointerUp?.(point(event,arena));activePointer=null;});
arena.addEventListener('pointercancel',()=>{activePointer=null;});
arena.addEventListener('contextmenu',event=>event.preventDefault());
arena.addEventListener('wheel',event=>{if(!event.ctrlKey)event.preventDefault();},{passive:false});

const strip=$('swipe-zone');
strip.addEventListener('pointerdown',event=>{if(event.target.closest('button'))return;swipeStart={x:event.clientX,y:event.clientY,id:event.pointerId};strip.setPointerCapture(event.pointerId);});
strip.addEventListener('pointerup',event=>{if(!swipeStart||event.pointerId!==swipeStart.id)return;const dx=event.clientX-swipeStart.x,dy=event.clientY-swipeStart.y;swipeStart=null;if(Math.abs(dy)>42&&Math.abs(dy)>Math.abs(dx)*1.3)navigate(dy<0?'next':'prev');});
strip.addEventListener('pointercancel',()=>swipeStart=null);
let wheelSum=0,wheelTime=0;
$('feed').addEventListener('wheel',event=>{
  if(event.ctrlKey||event.target.closest('.arena,.game-controls,dialog')||modalOpen()||phase==='playing'||phase==='paused')return;
  // On compact or zoomed layouts, preserve ordinary document scrolling.
  if(window.matchMedia('(max-width: 670px)').matches||document.documentElement.scrollHeight>window.innerHeight+8)return;
  event.preventDefault();const now=performance.now();if(now-lastNav<650)return;if(now-wheelTime>180)wheelSum=0;wheelTime=now;
  wheelSum+=event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?400:1);
  if(Math.abs(wheelSum)>65){navigate(wheelSum>0?'next':'prev');wheelSum=0;}
},{passive:false});

document.addEventListener('keydown',event=>{
  if(modalOpen()||event.ctrlKey||event.metaKey||event.altKey)return;
  const key=event.key.length===1?event.key.toLowerCase():event.key;
  if(key==='n'&&!event.repeat){event.preventDefault();navigate('next');return;}
  if((key==='p'||key==='Escape')&&!event.repeat){event.preventDefault();phase==='paused'?resume():pause();return;}
  if(directions[key]&&phase==='playing'&&(game.keyDown||game.direction)){event.preventDefault();if(game.keyDown)game.keyDown(directions[key]);else game.direction(directions[key]);return;}
  if(event.target.closest('button,a,input,textarea,select'))return;
  if(key===' '){event.preventDefault();if(event.repeat)return;if(phase==='playing')game.action?.();else start();return;}
});
document.addEventListener('keyup',event=>{const d=directions[event.key.length===1?event.key.toLowerCase():event.key];if(d)game?.keyUp?.(d);});
document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});
window.addEventListener('blur',pause);
function frame(now){const dt=lastFrame?Math.min((now-lastFrame)/1000,.04):0;lastFrame=now;if(phase==='playing')game?.tick(dt);requestAnimationFrame(frame);}
renderGame();requestAnimationFrame(frame);
