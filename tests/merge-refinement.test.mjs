import test from 'node:test';
import assert from 'node:assert/strict';
import {mergeLine,moveBoard,tilePaths,boardGeometry,createMerge} from '../dist/games/merge.js';
import {environment} from './game-harness.mjs';
import {readFile} from 'node:fs/promises';

test('2048 paths preserve all source values and exactly match authoritative destinations',()=>{
  assert.deepEqual(mergeLine([2,2,2,2]),{line:[4,4,0,0],gained:8});
  assert.deepEqual(mergeLine([2,2,4,0]),{line:[4,4,0,0],gained:4});
  for(let n=0;n<256;n++){
    const row=Array.from({length:4},(_,i)=>[0,2,4,8][(n>>(i*2))&3]);
    const board=[row,[2,2,4,4],[0,8,8,16],[1024,1024,0,2]];
    for(const d of ['left','right','up','down']){
      const output=Array.from({length:4},()=>[0,0,0,0]);
      for(const p of tilePaths(board,d).paths){assert.equal(p.value,board[p.from[0]][p.from[1]]);output[p.to[0]][p.to[1]]+=p.value;}
      assert.deepEqual(output,moveBoard(board,d).board);
    }
  }
});
test('2048 board maximizes square occupancy inside the usable field',()=>{
  for(const [w,h,scale] of [[284,340,.8],[354,620,.975],[800,160,.54]]){
    const f={x:18,y:100,w,h},g=boardGeometry(f,scale);
    assert.equal(g.size,Math.min(w,h));assert.equal(g.cell*4+g.gap*3,g.size);
    assert.equal(g.x+g.size/2,f.x+w/2);assert.equal(g.y+g.size/2,f.y+h/2);
  }
});
function fixture(reduced=false){
  const env=environment();window.matchMedia=()=>({matches:reduced});
  const original=Math.random;let draws=0;
  Math.random=()=>{draws++;return 0;};
  const game=createMerge(env.mount,env.api);game.start();
  return {...env,game,draws:()=>draws,close(){game.destroy();Math.random=original;env.checkCleanup();}};
}
function advance(g,n=10){for(let i=0;i<n;i++)g.tick(.04);}
test('2048 blocked swipe never spawns; a merge scores and spawns exactly once',()=>{
  const f=fixture();try{
    f.game.direction('up');assert.equal(f.draws(),4);
    f.game.direction('left');assert.equal(f.draws(),6);
    assert.deepEqual(f.calls.filter(c=>c[0]==='score'),[['score',0],['score',4]]);
    advance(f.game);assert.equal(f.draws(),6);
  }finally{f.close();}
});
test('2048 latest direction buffer is bounded, frozen at zero dt and cleared on cancel',()=>{
  const f=fixture();try{
    f.game.direction('left');for(let i=0;i<100;i++)f.game.direction(i%2?'down':'right');
    for(let i=0;i<10;i++)f.game.tick(0);assert.equal(f.draws(),6);
    advance(f.game,20);assert.equal(f.draws(),8);
    f.game.direction('left');f.game.direction('right');const before=f.draws();
    f.game.cancel();advance(f.game);assert.equal(f.draws(),before);
  }finally{f.close();}
});
test('2048 pointer cancellation, resize, restart and destroy retire pending work',()=>{
  const f=fixture();try{
    f.game.pointerDown({x:100,y:100});f.game.cancel();f.game.pointerUp({x:0,y:100});assert.equal(f.draws(),4);
    f.game.pointerDown({x:100,y:100});f.game.pointerUp({x:0,y:100});assert.equal(f.draws(),6);
    f.game.direction('down');f.resize(320,568);f.game.tick(.04);f.resize(844,390);f.game.tick(.04);
    f.game.start();const before=f.draws();advance(f.game);assert.equal(f.draws(),before);
    f.game.destroy();const events=f.calls.length;f.game.direction('left');f.game.tick(.04);f.game.present(.04);f.game.start();assert.equal(f.calls.length,events);
  }finally{f.close();}
});
test('2048 reduced motion resolves immediately with identical rules and random draws',()=>{
  const f=fixture(true);try{
    f.game.direction('left');f.game.direction('down');assert.equal(f.draws(),8);
    assert.deepEqual(f.calls.filter(c=>c[0]==='score').map(c=>c[1]),[0,4,4]);
  }finally{f.close();}
});

// Test-only fixture injection: no board setter or debug control ships in dist.
test('2048 terminal merge is readable before reveal and never finishes twice',async()=>{
  const source=await readFile(new URL('../dist/games/merge.js',import.meta.url),'utf8');
  for(const win of [false,true]){
    const board=[[win?1024:2,win?1024:2,8,16],[8,16,32,64],[16,32,64,128],[32,64,128,256]];
    const injected=source.replace("'./shared.js'",JSON.stringify(new URL('../dist/games/shared.js',import.meta.url).href))
      .replace('if(!preview){spawn();spawn()}',`if(!preview){board=${JSON.stringify(board)}}`);
    const {createMerge:factory}=await import('data:text/javascript;base64,'+Buffer.from(injected).toString('base64'));
    const env=environment(),original=Math.random;Math.random=()=>0;
    const g=factory(env.mount,env.api);
    try{
      g.start();g.direction('left');
      const finishes=()=>env.calls.filter(c=>c[0]==='finish');assert.equal(finishes().length,1);
      assert.match(finishes()[0][1],win?/2048/:/Out of room/);
      assert.ok(finishes()[0][5].duration>=.28);
      env.texts.length=0;g.present(0);assert.ok(env.texts.some(t=>t.value===String(win?1024:2)));
      for(let i=0;i<12;i++)g.present(.04);
      assert.ok(env.texts.some(t=>t.value===String(win?2048:4)));
      g.direction('right');g.tick(.04);assert.equal(finishes().length,1);
      g.cancelPresentation();g.start();assert.equal(finishes().length,1);
    }finally{g.destroy();Math.random=original;env.checkCleanup();}
  }
});
