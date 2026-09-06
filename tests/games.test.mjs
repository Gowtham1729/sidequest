import {test} from 'node:test';
import assert from 'node:assert/strict';
import {environment} from './game-harness.mjs';
import {games} from '../dist/registry.js';
import {clusterAt,COLS,ROWS} from '../dist/games/pop.js';

for(const [width,height] of [[390,844],[320,568],[844,390],[1440,900]]){
 test(`all 14 games render, play, pause and restart at ${width}×${height}`,()=>{
  const random=Math.random;let seed=731;Math.random=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);
  try{for(const meta of games.slice(5)){
   const env=environment(width,height),game=meta.create(env.mount,env.api);game.tick(0);game.start();
   for(let frame=0;frame<240;frame++){
    if(env.calls.some(c=>c[0]==='finish'))break;
    if(frame%30===0){const p={x:200+Math.sin(frame)*60,y:400};game.pointerDown?.(p);game.pointerMove?.({x:p.x+30,y:p.y+45});game.pointerUp?.({x:p.x+30,y:p.y+45});game.action?.();}
    game.tick(frame%17===0?.035:1/60);
   }
   game.pause?.();game.cancel?.();const scores=env.calls.filter(c=>c[0]==='score').length;for(let i=0;i<10;i++)game.tick(0);
   assert.equal(env.calls.filter(c=>c[0]==='score').length,scores,`${meta.id} advanced while paused`);
   assert.ok(env.calls.filter(c=>c[0]==='finish').length<=1,`${meta.id} finished twice`);
   env.resize(height,width);game.tick(0);game.start();assert.equal(env.calls.filter(c=>c[0]==='score').at(-1)[1],0,`${meta.id} reset score`);game.tick(1/60);env.checkStack();game.destroy();env.checkCleanup();
  }}finally{Math.random=random;}
 });
}
test('ZigZag awards no progress for spamming turn without movement',()=>{const env=environment(),g=games.find(g=>g.id==='zigzag').create(env.mount,env.api);g.start();for(let i=0;i<100;i++)g.action();assert.equal(env.calls.filter(c=>c[0]==='score').at(-1)[1],0);g.destroy();});
test('Crossy lets a player wait safely on grass for a full minute',()=>{const env=environment(),g=games.find(g=>g.id==='crossy').create(env.mount,env.api);g.start();for(let i=0;i<1800;i++)g.tick(1/30);assert.equal(env.calls.filter(c=>c[0]==='finish').length,0);g.destroy();});
test('Chroma starts at a safe checkpoint without an instant fall timer',()=>{const env=environment(),g=games.find(g=>g.id==='chroma').create(env.mount,env.api);g.start();for(let i=0;i<300;i++)g.tick(1/30);assert.equal(env.calls.filter(c=>c[0]==='finish').length,0);g.destroy();});
test('Pop flood fill includes connected matching gems only',()=>{const grid=Array.from({length:COLS},(_,c)=>Array.from({length:ROWS},(_,r)=>({id:(c+r)%5})));grid[0][0].id=4;grid[1][0].id=4;grid[1][1].id=4;assert.deepEqual(clusterAt(grid,0,0).map(p=>`${p.c},${p.r}`).sort(),['0,0','1,0','1,1']);assert.deepEqual(clusterAt(grid,-1,0),[]);});
test('Pop ends exactly once at 60 seconds and restarts cleanly',()=>{const env=environment(),g=games.find(g=>g.id==='pop').create(env.mount,env.api);g.start();for(let i=0;i<1900;i++)g.tick(1/30);assert.equal(env.calls.filter(c=>c[0]==='finish').length,1);g.start();g.tick(.1);assert.equal(env.calls.filter(c=>c[0]==='score').at(-1)[1],0);g.destroy();});
test('Target awards an actual bullseye for a centered shot',()=>{const random=Math.random;Math.random=()=>.5;try{const env=environment(),g=games.find(g=>g.id==='target').create(env.mount,env.api);g.start();g.pointerDown({x:200,y:400});g.pointerMove({x:196,y:480});g.pointerUp();for(let i=0;i<180;i++)g.tick(1/120);assert.equal(env.calls.filter(c=>c[0]==='score').at(-1)[1],10);assert.ok(env.calls.some(c=>c[0]==='sound'&&c[1]==='bullseye'));g.destroy();}finally{Math.random=random;}});
test('Crossy traffic can hit a stationary player in the center of a road lane',()=>{const random=Math.random;Math.random=()=>.5;try{const env=environment(),g=games.find(g=>g.id==='crossy').create(env.mount,env.api);g.start();g.action();for(let i=0;i<20;i++)g.tick(1/120);g.action();for(let i=0;i<1400&&!env.calls.some(c=>c[0]==='finish');i++)g.tick(1/120);assert.equal(env.calls.filter(c=>c[0]==='finish').length,1);assert.equal(env.calls.find(c=>c[0]==='finish')[1],'Traffic got you');g.destroy();}finally{Math.random=random;}});
