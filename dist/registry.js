import {createStack} from './games/stack.js';
import {createSnake} from './games/snake.js';
import {createMerge} from './games/merge.js';
import {createRally} from './games/rally.js';
import {createMemory} from './games/memory.js';

// Add games here. The feed, picker, score display, and input boundary share this contract.
// A factory returns start(), tick(dt), destroy(), plus optional action/pointer/direction handlers.
export const games=[
  {id:'stack',title:'Stack',category:'Timing',glyph:'▱',accent:'#c9f86a',tint:'#e8f2d8',ink:'#668843',scoreLabel:'HEIGHT',description:'One tap. One block. How high can you go?',instructions:'Tap to drop the moving block. Line it up with the one below. Miss the edge and your tower gets smaller.',chips:['Tap to drop','Space'],hint:'<b>Tap anywhere</b> to drop a block · Space works too',create:createStack},
  {id:'snake',title:'Snake',category:'Classic',glyph:'⌁',accent:'#9cde8c',tint:'#dfedde',ink:'#4e8153',scoreLabel:'SNACKS',description:'A familiar face. A growing appetite.',instructions:'Swipe in the game to turn. Collect the coral snacks and avoid the walls and your own tail. You can also use the arrows below.',chips:['Swipe to turn','Arrow keys'],hint:'<b>Swipe to turn</b> · or use the arrows',dpad:true,create:createSnake},
  {id:'2048',title:'2048',category:'Puzzle',glyph:'2ⁿ',accent:'#f1d782',tint:'#f3ecd7',ink:'#987b37',scoreLabel:'SCORE',description:'Slide. Combine. Chase that magic number.',instructions:'Swipe to slide every tile. Matching numbers merge once per move. Make a 2048 tile before the board fills up.',chips:['Swipe to merge','Arrow keys'],hint:'<b>Swipe to merge</b> · or use the arrows',dpad:true,create:createMerge},
  {id:'rally',title:'Rally',category:'Reflex',glyph:'↔',accent:'#b9c7ff',tint:'#e5e9f7',ink:'#6575aa',scoreLabel:'RETURNS',description:'Just you, a paddle, and one more return.',instructions:'Drag left and right to move your paddle. Keep the ball in play. Each return makes it a little faster.',chips:['Drag to move','← → keys'],hint:'<b>Drag to move</b> the paddle · ← → on keyboard',create:createRally},
  {id:'memory',title:'Memory Match',category:'Memory',glyph:'◈',accent:'#f3b8d7',tint:'#f5e1ed',ink:'#a06788',scoreLabel:'MOVES',description:'Six pairs. A little space in your mind.',instructions:'Flip two cards at a time and find the matching symbols. Clear all six pairs in as few moves as you can.',chips:['Tap to flip','Tab + Enter'],hint:'<b>Tap two cards</b> to find a pair · Fewer moves is better',lowerIsBetter:true,create:createMemory}
];
