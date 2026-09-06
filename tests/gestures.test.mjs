import test from 'node:test';
import assert from 'node:assert/strict';
import {gestureOwner, navigationIntent} from '../dist/gestures.js';
import {moveBoard} from '../dist/games/merge.js';
import {overlapBlock} from '../dist/games/stack.js';

test('gameplay swipes stay with the game; edge and two fingers navigate',()=>{
  assert.equal(gestureOwner({phase:'playing',x:190,width:390}),'game');
  assert.equal(gestureOwner({phase:'playing',x:380,width:390}),'feed');
  assert.equal(gestureOwner({phase:'playing',x:190,width:390,touches:2}),'feed');
  assert.equal(gestureOwner({phase:'paused',x:190,width:390}),'feed');
  assert.equal(navigationIntent(0,-100),'next');
  assert.equal(navigationIntent(100,0),'lineup');
});
test('game outcomes used for audio still distinguish merges and perfect drops',()=>{
  const result=moveBoard([[2,2,2,2],[0,0,0,0],[0,0,0,0],[0,0,0,0]],'left');
  assert.deepEqual(result.board[0],[4,4,0,0]);assert.equal(result.gained,8);
  assert.equal(overlapBlock({x:30,w:100},{x:33,w:100}).perfect,true);
  assert.equal(overlapBlock({x:30,w:100},{x:150,w:100}).w,0);
});
