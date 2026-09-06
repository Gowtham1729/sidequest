const STORAGE_KEY = 'sidequest.audio.v2';
const defaults = {muted:false, effects:true, music:true, effectsVolume:.65, musicVolume:.55};
const volume = (value, fallback) => typeof value === 'number' && Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : fallback;
export function readPreferences(storage) {
  try {
    const saved = JSON.parse(storage?.getItem(STORAGE_KEY) || storage?.getItem('sidequest.audio.v1') || '{}');
    const prefs = Object.fromEntries(Object.entries(defaults).map(([key, value]) => [key,
      typeof value === 'boolean' ? (typeof saved?.[key] === 'boolean' ? saved[key] : value) : volume(saved?.[key], value)]));
    if (prefs.musicVolume === .4 && !storage?.getItem(STORAGE_KEY)) prefs.musicVolume = defaults.musicVolume;
    return prefs;
  } catch { return {...defaults}; }
}
const frequency = note => 440 * 2 ** ((note - 69) / 12);

const systemSounds = {
  count: [{ note: 72, at: 0, duration: 0.08, gain: 0.18, wave: 'sine' }],
  go: [{ note: 84, at: 0, duration: 0.16, gain: 0.24, wave: 'triangle' }, { note: 88, at: 0.07, duration: 0.22, gain: 0.22, wave: 'sine' }]
};

export class GameAudio {
  constructor({createContext, storage, setInterval:setTimer=globalThis.setInterval, clearInterval:clearTimer=globalThis.clearInterval, fetch:fetchFile=globalThis.fetch} = {}) {
    this.createContext = createContext || (() => {
      const Context = globalThis.AudioContext || globalThis.webkitAudioContext;
      return Context ? new Context({latencyHint:'interactive'}) : null;
    });
    try { this.storage = storage === undefined ? globalThis.localStorage : storage; } catch {}
    this.preferences = readPreferences(this.storage);
    this.setTimer = (fn, ms) => setTimer(fn, ms);
    this.clearTimer = id => clearTimer(id);
    this.fetchFile = (...args) => fetchFile(...args);
    this.context=null; this.profile={}; this.generation=0; this.effectEpoch=0; this.musicEpoch=0;
    this.playing=false; this.foreground=true; this.timer=null; this.musicActive=false;
    this.voices=new Set(); this.buffers=new Map(); this.cooldowns=new Map(); this.listeners=new Set();
  }
  subscribe(listener) { this.listeners.add(listener); listener(this.preferences); return () => this.listeners.delete(listener); }
  update(patch) {
    for (const key of Object.keys(defaults)) {
      if (!(key in patch)) continue;
      this.preferences[key] = typeof defaults[key] === 'boolean' ? (typeof patch[key] === 'boolean' ? patch[key] : this.preferences[key]) : volume(patch[key], this.preferences[key]);
    }
    try { this.storage?.setItem(STORAGE_KEY, JSON.stringify(this.preferences)); } catch {}
    this.applyGains();
    if (this.preferences.muted || !this.preferences.effects || !this.preferences.effectsVolume) this.stopVoices('effects');
    this.syncMusic();
    this.listeners.forEach(listener => listener({...this.preferences}));
  }
  // Call synchronously from a real pointer/key/click handler, including retries on iOS.
  unlock() {
    try {
      if (!this.context) {
        this.context=this.createContext(); if (!this.context) return Promise.resolve(false);
        this.buses={effects:this.context.createGain(), music:this.context.createGain()};
        const limiter=this.context.createDynamicsCompressor();
        limiter.threshold.value=-8; limiter.knee.value=12; limiter.ratio.value=8;
        limiter.connect(this.context.destination);
        for (const bus of Object.values(this.buses)) bus.connect(limiter);
        this.context.onstatechange=() => this.syncMusic();
        this.applyGains();
      }
      const ready=this.context.state === 'running' ? Promise.resolve() : this.context.resume();
      return ready.then(() => { this.syncMusic(); return this.context.state === 'running'; }).catch(() => false);
    } catch { return Promise.resolve(false); }
  }
  applyGains() {
    if (!this.context) return;
    const p=this.preferences, now=this.context.currentTime;
    for (const channel of ['effects','music']) {
      const gain=this.buses[channel].gain;
      gain.cancelScheduledValues(now);
      gain.setTargetAtTime(!p.muted && p[channel] && this.foreground ? p[`${channel}Volume`] : 0, now, .018);
    }
  }
  activate(profile={}) {
    this.generation++; this.stopMusic(); this.stopVoices(); this.cooldowns.clear();
    this.profile=profile || {}; this.playing=false;
    const generation=this.generation;
    // Retired games cannot leak asynchronous sounds into the next game.
    return Object.freeze({play:(event, options) => { if (generation===this.generation && this.playing) this.play(event, options); }});
  }
  setPlaying(playing) {
    if (this.playing===playing) return;
    this.playing=playing;
    if (!playing) { this.stopVoices('effects'); this.cooldowns.clear(); }
    this.syncMusic();
  }
  setForeground(foreground) {
    this.foreground=foreground;
    if (!foreground) this.stopVoices();
    this.applyGains(); this.syncMusic();
  }
  canPlay(channel) {
    return this.context?.state==='running' && this.foreground && !this.preferences.muted && this.preferences[channel] && this.preferences[`${channel}Volume`]>0;
  }
  play(event, {pitch=0}={}) {
    if (!this.canPlay('effects')) return;
    const sound=this.profile.sounds?.[event] || systemSounds[event]; if (!sound) return;
    const now=this.context.currentTime;
    if (now-(this.cooldowns.get(event)??-Infinity)<(event==='score'?.18:.045)) return;
    this.cooldowns.set(event, now);
    if (sound.src) {
      const generation=this.generation, epoch=this.effectEpoch;
      this.buffer(sound.src).then(buffer => {
        if (buffer && generation===this.generation && epoch===this.effectEpoch && this.canPlay('effects')) this.sample(buffer, sound, 'effects');
      });
    } else {
      for (const note of sound) this.tone({...note, note:note.note+volumePitch(pitch), endNote:note.endNote===undefined?undefined:note.endNote+volumePitch(pitch)}, now+(note.at||0), 'effects');
    }
  }
  track(source, envelope, channel) {
    const voice={source,envelope,channel}; this.voices.add(voice);
    source.onended=() => { source.disconnect(); envelope.disconnect(); this.voices.delete(voice); };
    return voice;
  }
  tone(note, when, channel) {
    if (this.voices.size>=48 || !Number.isFinite(note.note)) return;
    const ctx=this.context, source=ctx.createOscillator(), envelope=ctx.createGain();
    const duration=Math.max(.03,Math.min(4,note.duration||.12));
    source.type=['sine','triangle','square','sawtooth'].includes(note.wave)?note.wave:'sine';
    source.frequency.setValueAtTime(frequency(note.note),when);
    if (Number.isFinite(note.endNote)) source.frequency.exponentialRampToValueAtTime(frequency(note.endNote),when+duration);
    envelope.gain.setValueAtTime(0,when);
    envelope.gain.linearRampToValueAtTime(volume(note.gain,.15),when+.008);
    envelope.gain.exponentialRampToValueAtTime(.0001,when+duration);
    source.connect(envelope); envelope.connect(this.buses[channel]); this.track(source,envelope,channel);
    source.start(when); source.stop(when+duration+.015);
  }
  async buffer(src) {
    if (!this.buffers.has(src)) {
      const promise=(async () => {
        try { const response=await this.fetchFile(src); if (!response.ok) throw new Error('Audio unavailable'); return await this.context.decodeAudioData(await response.arrayBuffer()); }
        catch { this.buffers.delete(src); return null; }
      })();
      this.buffers.set(src,promise);
    }
    return this.buffers.get(src);
  }
  sample(buffer, options, channel) {
    if (this.voices.size>=48) return;
    const ctx=this.context, source=ctx.createBufferSource(), envelope=ctx.createGain();
    source.buffer=buffer; source.loop=channel==='music';
    source.playbackRate.value=Math.max(.25,Math.min(4,options.playbackRate||1));
    envelope.gain.setValueAtTime(0,ctx.currentTime);
    envelope.gain.linearRampToValueAtTime(volume(options.gain,.25),ctx.currentTime+.015);
    source.connect(envelope); envelope.connect(this.buses[channel]); this.track(source,envelope,channel); source.start();
  }
  stopVoices(channel) {
    if (!channel || channel==='effects') this.effectEpoch++;
    if (!this.context) return;
    const now=this.context.currentTime;
    for (const voice of [...this.voices]) {
      if (channel && voice.channel!==channel) continue;
      voice.envelope.gain.cancelScheduledValues(now);
      voice.envelope.gain.setTargetAtTime(0,now,.008);
      try { voice.source.stop(now+.035); } catch {}
      this.voices.delete(voice);
    }
  }
  stopMusic() {
    this.musicEpoch++; this.musicActive=false;
    if (this.timer!==null) this.clearTimer(this.timer);
    this.timer=null; this.stopVoices('music');
  }
  syncMusic() {
    const music=this.profile.music;
    if (!this.playing || !this.canPlay('music') || !music) { if (this.musicActive) this.stopMusic(); return; }
    if (this.musicActive) return;
    this.musicActive=true;
    const epoch=++this.musicEpoch;
    if (music.src) {
      this.buffer(music.src).then(buffer => { if (buffer && epoch===this.musicEpoch && this.playing && this.canPlay('music')) this.sample(buffer,music,'music'); });
      return;
    }
    const stepLength=30/Math.max(40,Math.min(180,music.bpm||90));
    let step=0, next=this.context.currentTime+.04;
    const schedule=() => {
      if (!this.canPlay('music')) { this.stopMusic(); return; }
      const now=this.context.currentTime;
      // A delayed timer never bursts through a backlog of missed notes.
      if (next<now) next=now+.02;
      while (next<now+.12) {
        for (const voice of music.voices||[]) {
          const note=voice.notes[step%voice.notes.length];
          if (Number.isFinite(note)) this.tone({...voice,note},next,'music');
        }
        step=(step+1)%(music.steps||32); next+=stepLength;
      }
    };
    schedule(); this.timer=this.setTimer(schedule,40);
  }
  destroy() {
    this.generation++; this.playing=false; this.stopMusic(); this.stopVoices();
    this.listeners.clear();
    if (this.context) { this.context.onstatechange=null; this.context.close().catch(()=>{}); }
  }
}
function volumePitch(pitch) { return Number.isFinite(pitch) ? Math.max(-12,Math.min(12,pitch)) : 0; }
