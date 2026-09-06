import test from 'node:test';
import assert from 'node:assert/strict';
import { GameAudio, readPreferences } from '../dist/audio/engine.js';
import { audioProfiles } from '../dist/audio/profiles.js';

class FakeParam {
  constructor(value = 0) { this.value = value; this.calls = []; }
  setValueAtTime(value, at) { this.value = value; this.calls.push(['set', value, at]); }
  linearRampToValueAtTime(value, at) { this.value = value; this.calls.push(['linear', value, at]); }
  exponentialRampToValueAtTime(value, at) { this.value = value; this.calls.push(['exp', value, at]); }
  cancelScheduledValues(at) { this.calls.push(['cancel', at]); }
  setTargetAtTime(value, at, timeConstant) { this.value = value; this.calls.push(['target', value, at, timeConstant]); }
}

class FakeNode {
  constructor() { this.connections = []; this.gain = new FakeParam(); this.frequency = new FakeParam(); this.onended = null; }
  connect(node) { this.connections.push(node); return node; }
  disconnect() { this.disconnected = true; }
}

class FakeOscillator extends FakeNode {
  constructor() { super(); this.type = 'sine'; this.started = []; this.stopped = []; }
  start(at) { this.started.push(at); }
  stop(at) { this.stopped.push(at); }
}

class FakeBufferSource extends FakeNode {
  constructor() { super(); this.playbackRate = new FakeParam(1); this.started = 0; this.stopped = []; }
  start() { this.started++; }
  stop(at) { this.stopped.push(at); }
}

class FakeContext {
  constructor({state = 'running', resume} = {}) {
    this.state = state; this.currentTime = 10; this.destination = new FakeNode();
    this.resumeImpl = resume || (async () => { this.state = 'running'; });
    this.oscillators = []; this.bufferSources = []; this.gains = [];
  }
  createGain() { const node = new FakeNode(); this.gains.push(node); return node; }
  createDynamicsCompressor() { const node = new FakeNode(); node.threshold = new FakeParam(); node.knee = new FakeParam(); node.ratio = new FakeParam(); return node; }
  createOscillator() { const node = new FakeOscillator(); this.oscillators.push(node); return node; }
  createBufferSource() { const node = new FakeBufferSource(); this.bufferSources.push(node); return node; }
  resume() { return this.resumeImpl(); }
  decodeAudioData() { return Promise.resolve({decoded: true}); }
  close() { this.closed = true; return Promise.resolve(); }
}

class Storage {
  constructor(value = null) { this.value = value; }
  getItem() { return this.value; }
  setItem(_key, value) { this.value = value; }
}

function timers() {
  let next = 1; const active = new Map();
  return {
    active,
    setInterval(fn) { const id = next++; active.set(id, fn); return id; },
    clearInterval(id) { active.delete(id); },
    tick() { for (const fn of active.values()) fn(); },
  };
}

test('constructing the audio service does not create an AudioContext', () => {
  let creations = 0;
  new GameAudio({ createContext: () => { creations++; return new FakeContext(); }, storage: new Storage() });
  assert.equal(creations, 0);
});

test('unlock failure can be retried on the same lazily-created context', async () => {
  let attempts = 0; const context = new FakeContext({ state: 'suspended', resume: async () => {
    attempts++; if (attempts === 1) throw new Error('gesture missed'); context.state = 'running';
  }});
  const audio = new GameAudio({ createContext: () => context, storage: new Storage() });
  assert.equal(await audio.unlock(), false);
  assert.equal(await audio.unlock(), true);
  assert.equal(attempts, 2);
});

test('preferences persist and clamp numeric values while preserving invalid values', () => {
  const storage = new Storage(JSON.stringify({ effectsVolume: 4, musicVolume: -2, muted: true, music: 'yes' }));
  assert.deepEqual(readPreferences(storage), { muted: true, effects: true, music: true, effectsVolume: 1, musicVolume: 0 });
  const audio = new GameAudio({ storage });
  audio.update({ effectsVolume: -1, musicVolume: 3, effects: 'bad' });
  assert.equal(audio.preferences.effectsVolume, 0); assert.equal(audio.preferences.musicVolume, 1); assert.equal(audio.preferences.effects, true);
  assert.deepEqual(JSON.parse(storage.value), audio.preferences);
});

test('playing music is idempotent and schedules one loop timer', async () => {
  const clock = timers(); const context = new FakeContext();
  const audio = new GameAudio({ createContext: () => context, storage: new Storage(), setInterval: clock.setInterval, clearInterval: clock.clearInterval });
  await audio.unlock(); audio.activate(audioProfiles.snake); audio.setPlaying(true); audio.syncMusic();
  assert.equal(clock.active.size, 1); assert.equal(audio.musicActive, true);
  audio.syncMusic(); assert.equal(clock.active.size, 1);
});

test('pause, background, and mute stop active voices and clear the loop timer', async () => {
  const clock = timers(); const context = new FakeContext();
  const audio = new GameAudio({ createContext: () => context, storage: new Storage(), setInterval: clock.setInterval, clearInterval: clock.clearInterval });
  await audio.unlock(); const handle = audio.activate({ music: audioProfiles.snake.music, sounds: { tap: [{ note: 60, duration: 1, gain: .2, wave: 'sine' }] } });
  audio.setPlaying(true); handle.play('tap'); assert.ok(audio.voices.size > 0); assert.equal(clock.active.size, 1);
  audio.setForeground(false); assert.equal(audio.voices.size, 0); assert.equal(clock.active.size, 0);
  audio.setForeground(true); audio.update({ muted: true }); assert.equal(audio.voices.size, 0);
  audio.setPlaying(false); assert.equal(audio.timer, null);
});

test('retired game handles are ignored; current handle works after foreground restore', async () => {
  const context = new FakeContext(); const audio = new GameAudio({ createContext: () => context, storage: new Storage() });
  await audio.unlock();
  const old = audio.activate({ sounds: { tap: [{ note: 60, duration: .1, gain: .2, wave: 'sine' }] } }); audio.setPlaying(true);
  const current = audio.activate({ sounds: { tap: [{ note: 67, duration: .1, gain: .2, wave: 'sine' }] } }); audio.setPlaying(true);
  const before = context.oscillators.length; old.play('tap'); assert.equal(context.oscillators.length, before);
  audio.setForeground(false); audio.setForeground(true); current.play('tap');
  assert.equal(context.oscillators.length, before + 1);
});

test('late effect and music sample loads are cancelled after pause or game switch', async () => {
  const context = new FakeContext(); const pending = [];
  const fetchFile = async () => { const deferred = {}; deferred.promise = new Promise(resolve => { deferred.resolve = resolve; }); pending.push(deferred); return deferred.promise; };
  const audio = new GameAudio({ createContext: () => context, storage: new Storage(), fetch: fetchFile }); await audio.unlock();
  const old = audio.activate({ music: { src: 'old-loop' }, sounds: { tap: { src: 'old-tap' } } }); audio.setPlaying(true); old.play('tap');
  audio.setForeground(false); audio.activate({ music: { src: 'new-loop' }, sounds: {} });
  for (const deferred of pending) deferred.resolve({ ok: true, arrayBuffer: async () => new ArrayBuffer(0) });
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(context.bufferSources.length, 0);
});

test('all five bundled profiles are distinct with valid synthesized or recorded music', () => {
  const names = ['stack', 'snake', '2048', 'rally', 'memory'];
  assert.deepEqual(Object.keys(audioProfiles).sort(), names.sort());
  const signatures = new Set();
  for (const name of names) {
    const profile = audioProfiles[name]; signatures.add(JSON.stringify(profile.music));
    if (profile.music.src) {
      assert.ok(profile.music.src.startsWith('/audio/assets/'), name);
      assert.ok(profile.music.gain > 0 && profile.music.gain <= 1, name);
    } else {
      assert.equal(profile.music.steps, 32); assert.ok(profile.music.voices.length >= 2);
      for (const voice of profile.music.voices) { assert.equal(voice.notes.length, 32); assert.ok(voice.notes.some(note => note === null)); assert.ok(['sine', 'triangle'].includes(voice.wave)); }
    }
    for (const event of ['start', 'finish', 'win']) assert.ok(profile.sounds[event]?.length);
  }
  assert.equal(signatures.size, 5);
});

test('late effects are discarded independently on pause, mute, and game switch', async () => {
  for (const cancel of [a=>a.setPlaying(false), a=>a.update({muted:true}), a=>a.activate({})]) {
    const context=new FakeContext(); let resolve;
    const audio=new GameAudio({createContext:()=>context, storage:new Storage(), fetch:()=>new Promise(r=>{resolve=r;})});
    await audio.unlock(); const handle=audio.activate({sounds:{hit:{src:'hit.mp3'}}});audio.setPlaying(true);handle.play('hit');cancel(audio);
    resolve({ok:true,arrayBuffer:async()=>new ArrayBuffer(0)});
    await new Promise(resolve=>setImmediate(resolve));
    assert.equal(context.bufferSources.length,0);
    audio.destroy();
  }
});

test('a decoded current sample plays, then pause stops it', async () => {
  const context=new FakeContext();
  const audio=new GameAudio({createContext:()=>context,storage:new Storage(),fetch:async()=>({ok:true,arrayBuffer:async()=>new ArrayBuffer(0)})});
  await audio.unlock(); const handle=audio.activate({sounds:{hit:{src:'hit.mp3'}}});audio.setPlaying(true);handle.play('hit');
  await new Promise(resolve=>setImmediate(resolve));
  assert.equal(context.bufferSources.length,1);assert.equal(context.bufferSources[0].started,1);
  audio.setPlaying(false);assert.equal(context.bufferSources[0].stopped.length,1);
});

test('recorded music starts one looping sample and stays cached', async () => {
  const context = new FakeContext(); let fetches = 0;
  const audio = new GameAudio({ createContext: () => context, storage: new Storage(), fetch: async () => { fetches++; return { ok: true, arrayBuffer: async () => new ArrayBuffer(0) }; } });
  await audio.unlock(); audio.activate(audioProfiles.stack); audio.setPlaying(true);
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(context.bufferSources.length, 1); assert.equal(context.bufferSources[0].loop, true); assert.equal(context.bufferSources[0].started, 1);
  audio.syncMusic(); await new Promise(resolve => setImmediate(resolve));
  assert.equal(context.bufferSources.length, 1); assert.equal(fetches, 1);
});

test('delayed music timer skips missed beats and pausing stops every scheduled voice',async()=>{
  const clock=timers(), context=new FakeContext();
  const audio=new GameAudio({createContext:()=>context,storage:new Storage(),setInterval:clock.setInterval,clearInterval:clock.clearInterval});
  await audio.unlock();audio.activate(audioProfiles.rally);audio.setPlaying(true);
  const before=context.oscillators.length;context.currentTime+=60;clock.tick();
  assert.ok(context.oscillators.length-before<=2);
  for(const source of context.oscillators.slice(before))assert.ok(source.started[0]>=context.currentTime);
  audio.setPlaying(false);assert.equal(clock.active.size,0);assert.equal(audio.voices.size,0);
  for(const source of context.oscillators)assert.ok(source.stopped.at(-1)<=context.currentTime+.04);
});

test('all registered games receive a profile and new games get rate-limited score cues',async()=>{
  const {games}=await import('../dist/registry.js');
  assert.ok(games.length>=19);
  for(const game of games)assert.ok(game.audio.music&&game.audio.sounds.start&&game.audio.sounds.finish,game.id);
  const profile=games.find(game=>game.id==='pong').audio;
  assert.equal(profile.autoScore,true);
  const context=new FakeContext(),audio=new GameAudio({createContext:()=>context,storage:new Storage()});
  await audio.unlock();audio.activate(profile);audio.play('score');audio.play('score');
  assert.equal(context.oscillators.length,1);
  context.currentTime+=.2;audio.play('score');assert.equal(context.oscillators.length,2);
});
