import test from 'node:test';
import assert from 'node:assert/strict';
import {createStack,overlapBlock} from '../dist/games/stack.js';
import {environment} from './game-harness.mjs';

// Real game factory with a canvas double: lifecycle/rule evidence, not visual QA.
function fixture(reduced=false){
 const env=environment();
 const preference={matches:reduced};window.matchMedia=()=>preference;
 Object.defineProperty(env.api,'reducedMotion',{get:()=>preference.matches});
 let drawing=[];
 for(const [name,fn] of Object.entries(env.ctx))if(typeof fn==='function'&&!name.startsWith('create')&&name!=='measureText'){
  env.ctx[name]=(...args)=>{drawing.push([name,...args]);return fn(...args);};
 }
 const game=createStack(env.mount,env.api);
 const snapshot=fn=>{drawing=[];fn();return drawing;};
 const scores=()=>env.calls.filter(c=>c[0]==='score').map(c=>c[1]);
 const finishes=()=>env.calls.filter(c=>c[0]==='finish');
 game.start();
 return {...env,game,snapshot,scores,finishes,preference};
}
function advance(game,seconds){
 while(seconds>.02){game.tick(.02);seconds-=.02;}
 if(seconds>0)game.tick(seconds);
}
function perfectFirst(game){advance(game,66/105);game.tap();}
function missAfterThree(f){perfectFirst(f.game);f.game.tap();f.game.tap();f.game.tap();}

test('Stack overlap preserves inclusive six-unit tolerance, partial cuts and misses',()=>{
 const top={x:70,w:240};
 for(const x of [64,70,76])assert.deepEqual(overlapBlock(top,{x,w:240}),{x:70,w:240,perfect:true});
 assert.deepEqual(overlapBlock(top,{x:77,w:240}),{x:77,w:233,perfect:false});
 assert.deepEqual(overlapBlock(top,{x:4,w:240}),{x:70,w:174,perfect:false});
 assert.deepEqual(overlapBlock(top,{x:310,w:240}),{x:310,w:0,perfect:false});
 assert.deepEqual(overlapBlock(top,{x:330,w:240}),{x:330,w:0,perfect:false});
});
test('Stack commits perfect placements immediately with alternating motion and original speed curve',()=>{
 const f=fixture();perfectFirst(f.game);
 assert.deepEqual(f.scores(),[0,1]);
 advance(f.game,60/112);f.game.action();
 assert.deepEqual(f.scores(),[0,1,2]);
 advance(f.game,66/119);f.game.tap();
 assert.deepEqual(f.scores(),[0,1,2,3]);
 const perfect=f.calls.filter(c=>c[0]==='sound'&&c[1]==='perfect');
 assert.equal(perfect.length,3);
 const pitches=perfect.map(c=>c[2].pitch);
 assert.ok(pitches.every(Number.isFinite));
 assert.ok(pitches[1]>pitches[0]&&pitches[2]>pitches[1]);
 f.game.destroy();f.checkCleanup();
});
test('Stack partial placement stays responsive during settle and terminal miss occurs once',()=>{
 const f=fixture();missAfterThree(f);
 assert.deepEqual(f.scores(),[0,1,2,3]);
 assert.equal(f.calls.filter(c=>c[0]==='sound'&&c[1]==='place').length,2);
 assert.equal(f.finishes().length,1);
 const ending=f.finishes()[0];
 assert.match(ending[2],/3 blocks/);assert.equal(ending[4],'miss');
 assert.ok(ending[5].duration>0&&ending[5].duration<=.6);
 f.game.tap();f.game.action();f.game.tick(0);f.game.present(.03,.5);f.game.present(.03,1);
 assert.equal(f.finishes().length,1);assert.deepEqual(f.scores(),[0,1,2,3]);
 f.game.destroy();f.checkCleanup();
});
test('Stack pause redraws preserve placement cosmetics without advancing them',()=>{
 const f=fixture();perfectFirst(f.game);f.game.tap();
 const first=f.snapshot(()=>f.game.tick(0));
 const second=f.snapshot(()=>f.game.tick(0));
 assert.ok(first.length>0);assert.deepEqual(second,first);
 const moving=f.snapshot(()=>f.game.tick(.02));
 assert.notDeepEqual(moving,first);
 f.game.destroy();f.checkCleanup();
});
test('Stack reduced-motion ending remains settled while presentation time advances',()=>{
 const f=fixture(true);missAfterThree(f);
 const first=f.snapshot(()=>f.game.present(.01,1));
 const second=f.snapshot(()=>f.game.present(.03,1));
 assert.ok(first.length>0);assert.deepEqual(second,first);
 assert.equal(f.finishes().length,1);assert.deepEqual(f.scores(),[0,1,2,3]);
 f.game.destroy();f.checkCleanup();
});
test('Stack restart clears the old ending and destroy retires input and rendering',()=>{
 const f=fixture();missAfterThree(f);f.game.present(.03,.2);
 f.game.cancelPresentation('replace');f.game.start();
 perfectFirst(f.game);assert.deepEqual(f.scores(),[0,1,2,3,0,1]);
 assert.equal(f.finishes().length,1);
 f.game.destroy();f.checkCleanup();const events=f.calls.length;
 const draws=f.snapshot(()=>{f.game.tick(.02);f.game.present(.02,1);f.game.tap();f.game.action();});
 assert.equal(draws.length,0);assert.equal(f.calls.length,events);
});

test('Stack remains playable beyond retained tower capacity and through resize',()=>{
 const f=fixture();
 for(let height=0;height<100;height++){
  const speed=Math.min(235,105+height*7),distance=height%2===0?66:60;
  f.snapshot(()=>advance(f.game,distance/speed));
  f.game.tap();
  assert.equal(f.scores().at(-1),height+1);
  if(height===40)f.resize(320,568);
  if(height===70)f.resize(844,390);
 }
 assert.equal(f.finishes().length,0);
 assert.equal(f.calls.filter(c=>c[0]==='sound'&&c[1]==='perfect').length,100);
 f.checkStack();f.game.destroy();f.checkCleanup();
});
