// Presentation-only helpers. Advance with the shell's dt, never wall-clock timers.
// Keep authoritative positions, score and random simulation draws in the game.
export const lerp=(from,to,t)=>from+(to-from)*t;
export const easeOutCubic=t=>1-(1-t)**3;
export const frameDelta=dt=>Number.isFinite(dt)?Math.max(0,Math.min(dt,.05)):0;
export const endingDuration=seconds=>Number.isFinite(seconds)?Math.max(0,Math.min(seconds,.6)):0;

// A small bounded set of named transitions for tile travel, settle and camera.
// Values remain readable at completion; clear on restart/destroy. No callbacks
// survive cancellation, and no cosmetic randomness consumes the game's RNG.
export function createMotion({reducedMotion=()=>false,limit=32}={}){
  const tracks=new Map();
  const capacity=Math.max(1,Math.min(64,Math.floor(limit)||32));
  return {
    to(key,from,to,duration=.14){
      if(!tracks.has(key)&&tracks.size>=capacity)tracks.delete(tracks.keys().next().value);
      tracks.set(key,{from,to,duration:endingDuration(duration),elapsed:0});
      return this.value(key);
    },
    value(key,fallback=0){
      const t=tracks.get(key);if(!t)return fallback;
      if(reducedMotion())t.elapsed=t.duration;
      const progress=!t.duration?1:Math.min(1,t.elapsed/t.duration);
      return lerp(t.from,t.to,easeOutCubic(progress));
    },
    tick(dt){for(const t of tracks.values())t.elapsed=reducedMotion()?t.duration:Math.min(t.duration,t.elapsed+frameDelta(dt));},
    get size(){return tracks.size;},
    clear(){tracks.clear();}
  };
}
