import test from 'node:test';
import assert from 'node:assert/strict';
import {gestureOwner, navigationIntent, isTap, pressTiming, holdPauses} from '../dist/gestures.js';
import {games} from '../dist/registry.js';
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
test('input policies judge press-timing games once and keep drag games free of hold-to-pause',()=>{
  assert.equal(pressTiming('press'),true);
  assert.equal(pressTiming('drag'),false);
  assert.equal(pressTiming(undefined),false);
  assert.equal(holdPauses('drag'),false);
  assert.equal(holdPauses('press'),true);
  assert.equal(holdPauses(undefined),true);
  // The three tap-judged timing games from the source audit move to press timing.
  assert.deepEqual(games.filter(game=>pressTiming(game.input)).map(game=>game.id),['stack','orbit','rhythm']);
  // Every game that owns the pointer from press to release opts out of hold-to-pause.
  assert.deepEqual(games.filter(game=>!holdPauses(game.input)).map(game=>game.id),
    ['snake','2048','rally','pong','breaker','meteor','hop','drop','invaders','crossy','target','pop','blocks','bubbles','golf','hoops','sprint','slice','maze']);
  // Remaining games keep the default release-tap contract with hold-to-pause available.
  assert.equal(games.length,34);
});
test('release taps keep their duration and travel semantics for default-policy games',()=>{
  assert.equal(isTap(0,0,499),true);
  assert.equal(isTap(0,0,500),false);
  assert.equal(isTap(13,0,100),false);
});
