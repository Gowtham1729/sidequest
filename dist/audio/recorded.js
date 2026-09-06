// Recorded music loops: AI-generated performances cut bar-aligned from full
// takes (8 or 16 bars at each game's BPM). getAudioProfile layers these over
// the synthesized palettes, which still provide every game's event sounds and
// remain the fallback for any game without a loop. Echo and Beat Drop stay
// quiet by design. Loops are fetched lazily on first play; the engine bounds
// how many decoded buffers stay cached.

export const recordedLoops = {
  stack: { src: '/audio/assets/stack-loop.mp3', gain: 0.25 },
  snake: { src: '/audio/assets/snake-loop.mp3', gain: 0.25 },
  '2048': { src: '/audio/assets/2048-loop.mp3', gain: 0.25 },
  rally: { src: '/audio/assets/rally-loop.mp3', gain: 0.25 },
  memory: { src: '/audio/assets/memory-loop.mp3', gain: 0.25 },
  pong: { src: '/audio/assets/pong-loop.mp3', gain: 0.25 },
  breaker: { src: '/audio/assets/breaker-loop.mp3', gain: 0.25 },
  flap: { src: '/audio/assets/flap-loop.mp3', gain: 0.25 },
  pin: { src: '/audio/assets/pin-loop.mp3', gain: 0.25 },
  zigzag: { src: '/audio/assets/zigzag-loop.mp3', gain: 0.25 },
  meteor: { src: '/audio/assets/meteor-loop.mp3', gain: 0.25 },
  hop: { src: '/audio/assets/hop-loop.mp3', gain: 0.25 },
  chroma: { src: '/audio/assets/chroma-loop.mp3', gain: 0.25 },
  drop: { src: '/audio/assets/drop-loop.mp3', gain: 0.25 },
  invaders: { src: '/audio/assets/invaders-loop.mp3', gain: 0.25 },
  crossy: { src: '/audio/assets/crossy-loop.mp3', gain: 0.25 },
  target: { src: '/audio/assets/target-loop.mp3', gain: 0.25 },
  pop: { src: '/audio/assets/pop-loop.mp3', gain: 0.25 },
  blocks: { src: '/audio/assets/blocks-loop.mp3', gain: 0.25 },
  mines: { src: '/audio/assets/mines-loop.mp3', gain: 0.25 },
  slide: { src: '/audio/assets/slide-loop.mp3', gain: 0.25 },
  lights: { src: '/audio/assets/lights-loop.mp3', gain: 0.25 },
  four: { src: '/audio/assets/four-loop.mp3', gain: 0.25 },
  reversi: { src: '/audio/assets/reversi-loop.mp3', gain: 0.25 },
  bubbles: { src: '/audio/assets/bubbles-loop.mp3', gain: 0.25 },
  golf: { src: '/audio/assets/golf-loop.mp3', gain: 0.25 },
  hoops: { src: '/audio/assets/hoops-loop.mp3', gain: 0.25 },
  sprint: { src: '/audio/assets/sprint-loop.mp3', gain: 0.25 },
  slice: { src: '/audio/assets/slice-loop.mp3', gain: 0.25 },
  orbit: { src: '/audio/assets/orbit-loop.mp3', gain: 0.25 },
  maze: { src: '/audio/assets/maze-loop.mp3', gain: 0.25 },
  chop: { src: '/audio/assets/chop-loop.mp3', gain: 0.25 },
};
