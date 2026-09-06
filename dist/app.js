import {GameAudio} from './audio/engine.js';
import {bindAudioControls} from './audio/controls.js';
import {games} from './registry.js';
import {GameFeed} from './feed.js';
import {point} from './games/shared.js';
import {gestureOwner,navigationIntent,isTap,centroid} from './gestures.js';
const $=id=>document.getElementById(id),arcade=$('arcade'),scene=$('scene'),arena=$('arena'),mount=$('game-mount');
const audio=new GameAudio();
const feed=new GameFeed(games.length),bests=new Map(),pointers=new Map();
const hudObserver=new ResizeObserver(()=>{arcade.style.setProperty('--field-top',`${$('top-hud').offsetHeight+8}px`);arcade.style.setProperty('--field-bottom',`${$('bottom-hud').offsetHeight+8}px`);});
hudObserver.observe($('top-hud'));hudObserver.observe($('bottom-hud'));
let game,phase='ready',score=0,lastFrame=0,gesture=null,holdTimer=null,tapTimer=null,lastTap=0,lastNav=0,result=null;
const directions={ArrowLeft:'left',ArrowRight:'right',ArrowUp:'up',ArrowDown:'down',a:'left',d:'right',w:'up',s:'down'};
const current=()=>games[feed.current],modalOpen=()=>!!document.querySelector('dialog[open]');
const announce=value=>{$('announcement').textContent=value;};
function title(value){const dot=document.createElement('span');dot.textContent='.';$('overlay-title').replaceChildren(document.createTextNode(value.replace(/\.$/,'')),dot);}
function showScore(value){if(phase==='playing'&&current().audio?.autoScore&&value>score&&!current().lowerIsBetter)audio.play('score');score=value;$('score').textContent=value.toLocaleString(undefined,{minimumIntegerDigits:2});if(!current().lowerIsBetter&&value>0)bests.set(current().id,Math.max(value,bests.get(current().id)||0));$('best').textContent=bests.has(current().id)?bests.get(current().id).toLocaleString():'—';}
function setState(){
 audio.setPlaying(phase==='playing'&&!modalOpen());
 arcade.dataset.phase=phase;mount.inert=phase!=='playing';
 const meta=current(),ready=phase==='ready';
 $('gesture-hint').innerHTML=phase==='playing'?'Hold to pause <span>·</span> Edge swipe to switch':phase==='paused'?'Double-tap to restart <span>·</span> Swipe right for all games':'Swipe up to explore <span>·</span> Swipe right for all games';
 $('overlay-eyebrow').textContent=ready?meta.eyebrow:phase==='paused'?'TAKE YOUR TIME':'ONE MORE ROUND?';
 title(ready?meta.title:phase==='paused'?'Catch your breath':result?.title||meta.title);
 $('overlay-subtitle').textContent=ready?meta.intro:phase==='paused'?'Your game is right here.':result?.subtitle||'';
 $('tap-label').textContent=ready?'Tap anywhere to play':phase==='paused'?'Tap to resume':'Tap anywhere to play again';
 $('browse-hint').textContent=phase==='paused'?'Double-tap to restart · Swipe up for next':'Swipe up for the next game';
 arena.setAttribute('aria-label',`${meta.title}. ${meta.instructions} ${phase==='playing'?'Hold to pause. Swipe at the right edge to change games.':'Press Space to play. Swipe up for next game.'}`);
 $('accessible-previous').disabled=feed.cursor===0;
 $('accessible-pause').disabled=phase!=='playing';
}
function finish(message,subtitle,finalScore,cue='finish'){if(phase!=='playing')return;if(current().lowerIsBetter&&finalScore)bests.set(current().id,Math.min(finalScore,bests.get(current().id)||Infinity));result={title:message,subtitle};phase='finished';clearTimeout(holdTimer);$('hold-feedback').classList.remove('visible');showScore(score);setState();audio.play(cue);announce(`${message} ${subtitle}`);}
function start(){void audio.unlock();if(phase==='paused'){resume();return;}if(phase==='playing')return;clearTimeout(tapTimer);phase='playing';setState();game.start();audio.play('start');arena.focus({preventScroll:true});lastFrame=performance.now();announce(`${current().title} started.`);}
function pause(){if(phase!=='playing')return;game.pause?.();game.cancel?.();phase='paused';setState();announce('Paused. Tap to resume, double-tap to restart, or swipe to browse.');}
function resume(){if(phase!=='paused')return;void audio.unlock();phase='playing';setState();lastFrame=performance.now();arena.focus({preventScroll:true});announce('Game resumed.');}
function renderGame(direction='next'){
 clearTimeout(tapTimer);lastTap=0;game?.destroy();mount.replaceChildren();phase='ready';result=null;score=0;
 const meta=current();arcade.style.setProperty('--accent',meta.accent);arcade.style.setProperty('--bg',meta.bg);arcade.style.setProperty('--glow',meta.glow);document.querySelector('meta[name="theme-color"]').content=meta.bg;
 $('game-title').textContent=meta.title;$('category').textContent=meta.category.toUpperCase();$('game-instruction').textContent=meta.hint;$('score-label').textContent=meta.scoreLabel;
 $('feed-count').textContent=`${String(feed.current+1).padStart(2,'0')} / ${String(games.length).padStart(2,'0')}`;
 $('feed-dots').replaceChildren(...games.map((_,i)=>{const dot=document.createElement('span');dot.classList.toggle('active',i===feed.current);return dot;}));
 const gameAudio=audio.activate(meta.audio);
 game=meta.create(mount,{score:showScore,finish,audio:gameAudio});showScore(0);setState();updateHelpSheet();
 document.querySelectorAll('[data-game]').forEach(button=>{const active=Number(button.dataset.game)===feed.current;button.classList.toggle('active',active);if(active)button.setAttribute('aria-current','true');else button.removeAttribute('aria-current');});
 scene.classList.remove('enter-next','enter-prev','settle');scene.style.transform='';scene.style.opacity='';void scene.offsetWidth;scene.classList.add(direction==='prev'?'enter-prev':'enter-next');
 announce(`${meta.title}. ${meta.hint} Tap to start.`);
}
function navigate(direction){if(modalOpen())return;clearTimeout(tapTimer);lastNav=performance.now();if(direction==='prev'){if(feed.cursor===0)return;feed.previous();}else feed.next();renderGame(direction);}
function updateHelpSheet(){
  const meta=current();if(!meta)return;
  $('help-glyph').textContent=meta.glyph;
  $('help-glyph').style.setProperty('--tile-bg',meta.tint);
  $('help-glyph').style.setProperty('--tile-ink',meta.ink);
  $('help-game-title').textContent=meta.title;
  $('help-game-category').textContent=meta.category.toUpperCase();
  $('help-game-desc').textContent=meta.description;
  $('help-game-instructions').textContent=meta.instructions;
  $('help-game-chips').replaceChildren(...(meta.chips||[]).map(c=>{const s=document.createElement('span');s.className='help-chip';s.textContent=c;return s;}));
 }
function openSheet(id){cancelGesture();pause();audio.setPlaying(false);if(id==='help-dialog')updateHelpSheet();$(id).showModal();}
function restart(){renderGame();start();}
function tap(){if(phase==='paused'){const now=performance.now();if(now-lastTap<280){clearTimeout(tapTimer);lastTap=0;restart();}else{lastTap=now;tapTimer=setTimeout(()=>{if(phase==='paused'&&!gesture&&!modalOpen())resume();},280);}}else start();}
function clearHold(){clearTimeout(holdTimer);$('hold-feedback').classList.remove('visible');}
function resetDrag(){arcade.classList.remove('dragging');$('nav-feedback').classList.remove('visible','armed');scene.classList.add('settle');scene.style.transform='';scene.style.opacity='';}
function cancelGesture(){clearHold();game?.cancel?.();gesture=null;pointers.clear();resetDrag();}
function updateDrag(g){
 if(g.mode!=='feed'||Math.hypot(g.dx,g.dy)<12)return;
 const vertical=Math.abs(g.dy)>Math.abs(g.dx),intent=navigationIntent(g.dx,g.dy);
 arcade.classList.add('dragging');scene.classList.remove('enter-next','enter-prev','settle');
 scene.style.transform=vertical?`translateY(${Math.max(-180,Math.min(180,g.dy*.63))}px)`:`translateX(${Math.max(-90,Math.min(90,g.dx*.3))}px)`;
 scene.style.opacity=String(Math.max(.6,1-Math.hypot(g.dx,g.dy)/1800));
 const feedback=$('nav-feedback');feedback.classList.toggle('visible',vertical);feedback.classList.toggle('previous',g.dy>0);feedback.classList.toggle('armed',!!intent);
 const next=g.dy<0?games[feed.peek()]:feed.cursor>0?games[feed.items[feed.cursor-1]]:null;
 $('nav-arrow').textContent=g.dy<0?'↑':'↓';$('nav-title').textContent=next?.title||'You’re at the beginning';$('nav-detail').textContent=next?(intent?'Release to play':'Keep swiping'):'';
}
arcade.addEventListener('pointerdown',event=>{
 if(modalOpen()||event.target.closest('.accessible-controls, [data-audio-control]')||event.button>0)return;
 void audio.unlock();event.preventDefault();arcade.setPointerCapture(event.pointerId);
 pointers.set(event.pointerId,{x:event.clientX,y:event.clientY});
 if(pointers.size>1){clearHold();game.cancel?.();const c=centroid([...pointers.values()]);if(gesture){Object.assign(gesture,{mode:'feed',multi:true,startX:c.x,startY:c.y,dx:0,dy:0,moved:true});}return;}
 clearTimeout(tapTimer);
 const mode=gestureOwner({phase,x:event.clientX,width:arcade.clientWidth,zone:!!event.target.closest('[data-feed-zone]')});
 gesture={mode,startX:event.clientX,startY:event.clientY,dx:0,dy:0,time:performance.now(),phase,target:event.target,held:false,multi:false,moved:false};
 if(mode==='game')game.pointerDown?.(point(event,arena));
 if(phase==='playing'){
   const tracked=gesture;const feedback=$('hold-feedback');feedback.style.left=`${event.clientX}px`;feedback.style.top=`${event.clientY}px`;feedback.classList.add('visible');
   holdTimer=setTimeout(()=>{if(gesture===tracked&&pointers.size===1&&!tracked.moved){tracked.held=true;clearHold();pause();}},550);
 }
});
arcade.addEventListener('pointermove',event=>{
 if(!gesture||!pointers.has(event.pointerId)||gesture.ending)return;
 pointers.set(event.pointerId,{x:event.clientX,y:event.clientY});const c=centroid([...pointers.values()]),g=gesture;g.dx=c.x-g.startX;g.dy=c.y-g.startY;
 if(Math.hypot(g.dx,g.dy)>10){g.moved=true;clearHold();}
 if(g.held)return;
 if(g.mode==='feed')updateDrag(g);else if(phase==='playing')game.pointerMove?.(point(event,arena));
});
arcade.addEventListener('pointerup',event=>{
 if(!gesture||!pointers.has(event.pointerId))return;
 const g=gesture;if(!g.ending){pointers.set(event.pointerId,{x:event.clientX,y:event.clientY});const c=centroid([...pointers.values()]);g.dx=c.x-g.startX;g.dy=c.y-g.startY;}
 pointers.delete(event.pointerId);clearHold();
 if(pointers.size){g.ending=true;return;}gesture=null;resetDrag();
 if(g.held)return;
 if(g.mode==='feed'){
   const intent=navigationIntent(g.dx,g.dy,{allowHorizontal:!g.multi});
   if(intent==='next'||intent==='prev')navigate(intent);else if(intent==='lineup')openSheet('lineup-dialog');else if(intent==='help')openSheet('help-dialog');else if(!g.multi&&g.phase!=='playing'&&isTap(g.dx,g.dy,performance.now()-g.time))tap();
 }else if(g.phase==='playing'&&phase==='playing'){
   game.pointerUp?.(point(event,arena));if(isTap(g.dx,g.dy,performance.now()-g.time))game.tap?.(point(event,arena),g.target);
 }
});
arcade.addEventListener('pointercancel',cancelGesture);
arcade.addEventListener('contextmenu',event=>event.preventDefault());
let wheelSum=0,wheelTime=0;
arcade.addEventListener('wheel',event=>{
 if(event.ctrlKey)return;event.preventDefault();if(modalOpen()||gesture||phase==='playing')return;
 const now=performance.now();if(now-lastNav<650)return;if(now-wheelTime>180)wheelSum=0;wheelTime=now;wheelSum+=event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?400:1);
 if(Math.abs(wheelSum)>65){navigate(wheelSum>0?'next':'prev');wheelSum=0;}
},{passive:false});
for(const [id,action] of Object.entries({'accessible-play':start,'accessible-pause':pause,'accessible-restart':restart,'accessible-next':()=>navigate('next'),'accessible-previous':()=>navigate('prev'),'accessible-lineup':()=>openSheet('lineup-dialog'),'accessible-help':()=>openSheet('help-dialog')}))$(id).addEventListener('click',action);
for(const [index,meta] of games.entries()){
 const button=document.createElement('button');button.className='game-link';button.dataset.game=index;const glyph=document.createElement('span');glyph.className='game-glyph';glyph.textContent=meta.glyph;glyph.style.setProperty('--tile-bg',meta.tint);glyph.style.setProperty('--tile-ink',meta.ink);glyph.setAttribute('aria-hidden','true');const copy=document.createElement('span');copy.className='game-link-copy';const label=document.createElement('strong');label.textContent=meta.title;const hint=document.createElement('span');hint.textContent=meta.category;copy.append(label,hint);button.append(glyph,copy);button.addEventListener('click',()=>{$('lineup-dialog').close();if(index!==feed.current){feed.select(index);renderGame();}else if(phase==='paused')resume();});$('game-list').append(button);
}
for(const dialog of document.querySelectorAll('dialog')){
 let drag=null;
 dialog.addEventListener('pointerdown',e=>{if(e.target.closest('button,input,label'))return;drag={x:e.clientX,y:e.clientY,eligible:dialog.scrollTop<=0};});
 dialog.addEventListener('pointerup',e=>{if(drag&&drag.eligible&&e.clientY-drag.y>70&&Math.abs(e.clientY-drag.y)>Math.abs(e.clientX-drag.x)*1.3)dialog.close();drag=null;});
 dialog.addEventListener('pointercancel',()=>drag=null);
 const grip=dialog.querySelector('[data-sheet-drag]');grip.addEventListener('pointerdown',e=>{grip.setPointerCapture(e.pointerId);});
 dialog.querySelector('.dialog-close').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('click',e=>{if(e.target!==dialog)return;const r=dialog.getBoundingClientRect();if(e.clientY<r.top||e.clientX<r.left||e.clientX>r.right)dialog.close();});
}
document.addEventListener('keydown',event=>{
 if(modalOpen()||event.ctrlKey||event.metaKey||event.altKey)return;const key=event.key.length===1?event.key.toLowerCase():event.key;
 if(event.target.closest('input,select,textarea,[contenteditable=true]'))return;
 void audio.unlock();
 const commands={m:()=>audio.update({muted:!audio.preferences.muted}),n:()=>navigate('next'),b:()=>navigate('prev'),p:()=>phase==='paused'?resume():pause(),Escape:()=>phase==='paused'?resume():pause(),r:restart,g:()=>openSheet('lineup-dialog'),'?':()=>openSheet('help-dialog')};
 if(commands[key]){if(!event.repeat){event.preventDefault();cancelGesture();commands[key]();}return;}
 if(directions[key]&&phase==='playing'&&(game.keyDown||game.direction)){event.preventDefault();if(game.keyDown)game.keyDown(directions[key]);else game.direction(directions[key]);return;}
 if(event.target.closest('button'))return;
 if(key===' '){event.preventDefault();if(event.repeat)return;if(phase==='playing')game.action?.();else start();}
});
document.addEventListener('keyup',event=>{const d=directions[event.key.length===1?event.key.toLowerCase():event.key];if(d)game?.keyUp?.(d);});
function backgroundPause(){audio.setForeground(false);cancelGesture();clearTimeout(tapTimer);pause();}
document.addEventListener('visibilitychange',()=>{if(document.hidden)backgroundPause();else audio.setForeground(document.hasFocus());});window.addEventListener('blur',backgroundPause);window.addEventListener('focus',()=>audio.setForeground(!document.hidden));window.addEventListener('pagehide',backgroundPause);
let viewportWidth=window.innerWidth;
window.addEventListener('resize',()=>{if(gesture)cancelGesture();if(Math.abs(window.innerWidth-viewportWidth)>80)pause();viewportWidth=window.innerWidth;});
function frame(now){const dt=lastFrame?Math.min((now-lastFrame)/1000,.035):0;lastFrame=now;audio.setPlaying(phase==='playing'&&!modalOpen()&&gesture?.mode!=='feed');if(!document.hidden)game?.tick(((phase==='playing'&&!modalOpen()&&gesture?.mode!=='feed')||phase==='ready')?dt:0);requestAnimationFrame(frame);}
bindAudioControls(audio,{open:()=>openSheet('audio-dialog'),current:()=>current()});
audio.setForeground(!document.hidden);
renderGame();requestAnimationFrame(frame);
