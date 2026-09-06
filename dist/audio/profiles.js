// Original, lightweight audio palette for Sidequest's five mini-games.
// Notes use MIDI numbers; null leaves a step silent. Each loop is four bars
// of eighth notes at the profile's BPM.

export const audioProfiles = {
  stack: {
    music: {
      bpm: 112,
      steps: 32,
      voices: [
        {
          wave: 'triangle',
          gain: 0.16,
          duration: 0.28,
          notes: [60, null, 64, null, 67, null, 71, null, 72, null, 71, null, 67, null, 64, null, 60, null, 64, null, 67, null, 71, null, 74, null, 72, null, 67, null, 64, null],
        },
        {
          wave: 'sine',
          gain: 0.13,
          duration: 0.38,
          notes: [48, null, null, 48, null, null, 55, null, 48, null, null, 48, null, null, 55, null, 50, null, null, 50, null, null, 57, null, 48, null, null, 48, null, null, 55, null],
        },
      ],
    },
    sounds: {
      start: [{ note: 60, at: 0, duration: 0.16, gain: 0.22, wave: 'sine' }, { note: 64, at: 0.1, duration: 0.2, gain: 0.18, wave: 'sine' }],
      finish: [{ note: 67, at: 0, duration: 0.18, gain: 0.24, wave: 'triangle' }, { note: 72, at: 0.12, duration: 0.3, gain: 0.25, wave: 'triangle' }],
      win: [{ note: 72, at: 0, duration: 0.16, gain: 0.26, wave: 'sine' }, { note: 76, at: 0.12, duration: 0.16, gain: 0.25, wave: 'sine' }, { note: 79, at: 0.24, duration: 0.4, gain: 0.3, wave: 'triangle' }],
      place: [{ note: 67, at: 0, duration: 0.12, gain: 0.2, wave: 'sine' }],
      perfect: [{ note: 72, at: 0, duration: 0.14, gain: 0.25, wave: 'triangle' }, { note: 79, at: 0.1, duration: 0.28, gain: 0.24, wave: 'sine' }],
      miss: [{ note: 55, at: 0, duration: 0.16, gain: 0.16, wave: 'triangle', endNote: 49 }],
    },
  },

  snake: {
    music: {
      bpm: 126,
      steps: 32,
      voices: [
        {
          wave: 'triangle',
          gain: 0.16,
          duration: 0.22,
          notes: [57, null, 60, 62, null, 64, 62, null, 57, null, 60, 64, null, 67, 64, null, 55, null, 59, 60, null, 62, 60, null, 55, null, 59, 62, null, 64, 62, null],
        },
        {
          wave: 'sine',
          gain: 0.13,
          duration: 0.34,
          notes: [45, null, null, 45, null, null, 52, null, 45, null, null, 45, null, null, 52, null, 43, null, null, 43, null, null, 50, null, 43, null, null, 43, null, null, 50, null],
        },
      ],
    },
    sounds: {
      start: [{ note: 57, at: 0, duration: 0.14, gain: 0.22, wave: 'sine' }, { note: 64, at: 0.1, duration: 0.2, gain: 0.18, wave: 'triangle' }],
      finish: [{ note: 64, at: 0, duration: 0.18, gain: 0.24, wave: 'triangle' }, { note: 69, at: 0.13, duration: 0.3, gain: 0.25, wave: 'sine' }],
      win: [{ note: 69, at: 0, duration: 0.14, gain: 0.25, wave: 'sine' }, { note: 72, at: 0.1, duration: 0.14, gain: 0.26, wave: 'triangle' }, { note: 76, at: 0.21, duration: 0.38, gain: 0.3, wave: 'sine' }],
      turn: [{ note: 62, at: 0, duration: 0.08, gain: 0.13, wave: 'square' }],
      eat: [{ note: 72, at: 0, duration: 0.11, gain: 0.22, wave: 'sine' }, { note: 76, at: 0.07, duration: 0.16, gain: 0.2, wave: 'triangle' }],
      crash: [{ note: 52, at: 0, duration: 0.15, gain: 0.2, wave: 'square', endNote: 44 }],
    },
  },

  '2048': {
    music: {
      bpm: 96,
      steps: 32,
      voices: [
        {
          wave: 'sine',
          gain: 0.17,
          duration: 0.34,
          notes: [60, null, 62, null, 65, null, 67, null, 69, null, 67, null, 65, null, 62, null, 60, null, 62, null, 65, null, 69, null, 72, null, 69, null, 65, null, 62, null],
        },
        {
          wave: 'triangle',
          gain: 0.12,
          duration: 0.48,
          notes: [48, null, null, null, 53, null, null, null, 45, null, null, null, 52, null, null, null, 48, null, null, null, 53, null, null, null, 45, null, null, null, 52, null, null, null],
        },
      ],
    },
    sounds: {
      start: [{ note: 60, at: 0, duration: 0.2, gain: 0.21, wave: 'sine' }, { note: 67, at: 0.16, duration: 0.24, gain: 0.18, wave: 'triangle' }],
      finish: [{ note: 65, at: 0, duration: 0.18, gain: 0.24, wave: 'sine' }, { note: 72, at: 0.14, duration: 0.32, gain: 0.25, wave: 'triangle' }],
      win: [{ note: 69, at: 0, duration: 0.15, gain: 0.25, wave: 'sine' }, { note: 74, at: 0.12, duration: 0.15, gain: 0.26, wave: 'sine' }, { note: 77, at: 0.24, duration: 0.42, gain: 0.3, wave: 'triangle' }],
      slide: [{ note: 62, at: 0, duration: 0.12, gain: 0.16, wave: 'sine', endNote: 65 }],
      merge: [{ note: 65, at: 0, duration: 0.12, gain: 0.21, wave: 'sine' }, { note: 72, at: 0.09, duration: 0.24, gain: 0.24, wave: 'triangle' }],
      blocked: [{ note: 53, at: 0, duration: 0.14, gain: 0.16, wave: 'sine', endNote: 50 }],
    },
  },

  rally: {
    music: {
      bpm: 120,
      steps: 32,
      voices: [
        {
          wave: 'triangle',
          gain: 0.16,
          duration: 0.24,
          notes: [62, null, 65, 67, null, 69, 67, null, 62, null, 65, 69, null, 72, 69, null, 60, null, 64, 65, null, 67, 65, null, 60, null, 64, 67, null, 69, 67, null],
        },
        {
          wave: 'sine',
          gain: 0.13,
          duration: 0.4,
          notes: [50, null, null, 50, null, null, 57, null, 50, null, null, 50, null, null, 57, null, 48, null, null, 48, null, null, 55, null, 48, null, null, 48, null, null, 55, null],
        },
      ],
    },
    sounds: {
      start: [{ note: 62, at: 0, duration: 0.14, gain: 0.23, wave: 'sine' }, { note: 69, at: 0.1, duration: 0.22, gain: 0.2, wave: 'triangle' }],
      finish: [{ note: 69, at: 0, duration: 0.16, gain: 0.24, wave: 'triangle' }, { note: 74, at: 0.12, duration: 0.32, gain: 0.26, wave: 'sine' }],
      win: [{ note: 69, at: 0, duration: 0.14, gain: 0.25, wave: 'sine' }, { note: 74, at: 0.11, duration: 0.15, gain: 0.26, wave: 'triangle' }, { note: 81, at: 0.23, duration: 0.4, gain: 0.3, wave: 'sine' }],
      wall: [{ note: 57, at: 0, duration: 0.12, gain: 0.17, wave: 'sine', endNote: 60 }],
      hit: [{ note: 67, at: 0, duration: 0.1, gain: 0.22, wave: 'triangle' }, { note: 72, at: 0.08, duration: 0.18, gain: 0.2, wave: 'sine' }],
      miss: [{ note: 55, at: 0, duration: 0.15, gain: 0.16, wave: 'triangle', endNote: 50 }],
    },
  },

  memory: {
    music: {
      bpm: 104,
      steps: 32,
      voices: [
        {
          wave: 'sine',
          gain: 0.16,
          duration: 0.3,
          notes: [60, null, 64, 65, null, 67, 65, null, 60, null, 64, 67, null, 69, 67, null, 57, null, 60, 62, null, 64, 62, null, 57, null, 60, 64, null, 65, 64, null],
        },
        {
          wave: 'triangle',
          gain: 0.13,
          duration: 0.46,
          notes: [48, null, null, null, 55, null, null, null, 50, null, null, null, 57, null, null, null, 48, null, null, null, 55, null, null, null, 50, null, null, null, 57, null, null, null],
        },
      ],
    },
    sounds: {
      start: [{ note: 60, at: 0, duration: 0.18, gain: 0.22, wave: 'sine' }, { note: 67, at: 0.14, duration: 0.26, gain: 0.2, wave: 'triangle' }],
      finish: [{ note: 67, at: 0, duration: 0.18, gain: 0.24, wave: 'sine' }, { note: 72, at: 0.14, duration: 0.32, gain: 0.25, wave: 'triangle' }],
      win: [{ note: 72, at: 0, duration: 0.15, gain: 0.25, wave: 'sine' }, { note: 76, at: 0.12, duration: 0.15, gain: 0.25, wave: 'triangle' }, { note: 79, at: 0.24, duration: 0.42, gain: 0.3, wave: 'sine' }],
      flip: [{ note: 65, at: 0, duration: 0.12, gain: 0.18, wave: 'sine', endNote: 69 }],
      match: [{ note: 69, at: 0, duration: 0.13, gain: 0.23, wave: 'sine' }, { note: 76, at: 0.1, duration: 0.28, gain: 0.26, wave: 'triangle' }],
      mismatch: [{ note: 60, at: 0, duration: 0.14, gain: 0.16, wave: 'triangle', endNote: 55 }],
    },
  },
};

export default audioProfiles;

// New games receive a bespoke, non-fatiguing 32-step procedural BGM loop and harmonized cues.
export const extendedProfiles = {
  pong: {
    autoScore: true,
    music: {
      bpm: 118,
      steps: 32,
      voices: [
        {
          wave: 'sine',
          gain: 0.16,
          duration: 0.22,
          notes: [64, null, 67, null, 71, null, 69, 67, null, 64, null, 67, 71, null, 74, 71, 64, null, 67, null, 71, null, 69, 67, null, 64, 67, 69, null, 71, null, null],
        },
        {
          wave: 'triangle',
          gain: 0.13,
          duration: 0.34,
          notes: [40, null, null, 40, null, null, 47, null, 40, null, null, 40, null, null, 47, null, 43, null, null, 43, null, null, 50, null, 40, null, null, 40, null, 47, null, null],
        },
      ],
    },
    sounds: {
      start: [{ note: 64, at: 0, duration: 0.15, gain: 0.22, wave: 'sine' }, { note: 71, at: 0.1, duration: 0.22, gain: 0.2, wave: 'triangle' }],
      finish: [{ note: 67, at: 0, duration: 0.18, gain: 0.24, wave: 'triangle' }, { note: 64, at: 0.12, duration: 0.3, gain: 0.25, wave: 'sine' }],
      win: [{ note: 64, at: 0, duration: 0.14, gain: 0.24, wave: 'sine' }, { note: 71, at: 0.1, duration: 0.16, gain: 0.25, wave: 'triangle' }, { note: 76, at: 0.22, duration: 0.38, gain: 0.3, wave: 'sine' }],
      score: [{ note: 71, duration: 0.08, gain: 0.18, wave: 'sine' }],
    },
  },

  breaker: {
    autoScore: true,
    music: {
      bpm: 124,
      steps: 32,
      voices: [
        {
          wave: 'triangle',
          gain: 0.16,
          duration: 0.2,
          notes: [69, null, 72, null, 74, null, 76, null, 74, 72, null, 69, null, 72, 74, null, 67, null, 71, null, 72, null, 74, null, 72, 71, null, 67, null, 71, 74, null],
        },
        {
          wave: 'triangle',
          gain: 0.13,
          duration: 0.32,
          notes: [45, null, null, 45, null, null, 52, null, 45, null, null, 45, null, null, 52, null, 43, null, null, 43, null, null, 50, null, 45, null, null, 45, null, 52, null, null],
        },
      ],
    },
    sounds: {
      start: [{ note: 69, at: 0, duration: 0.15, gain: 0.22, wave: 'triangle' }, { note: 76, at: 0.1, duration: 0.22, gain: 0.2, wave: 'sine' }],
      finish: [{ note: 72, at: 0, duration: 0.16, gain: 0.22, wave: 'triangle' }, { note: 69, at: 0.12, duration: 0.3, gain: 0.25, wave: 'sine' }],
      win: [{ note: 69, at: 0, duration: 0.14, gain: 0.24, wave: 'sine' }, { note: 74, at: 0.1, duration: 0.16, gain: 0.26, wave: 'triangle' }, { note: 81, at: 0.22, duration: 0.38, gain: 0.3, wave: 'sine' }],
      score: [{ note: 76, duration: 0.07, gain: 0.18, wave: 'triangle' }],
    },
  },

  flap: {
    autoScore: true,
    music: {
      bpm: 116,
      steps: 32,
      voices: [
        {
          wave: 'sine',
          gain: 0.17,
          duration: 0.28,
          notes: [65, null, 69, null, 72, null, 76, null, 77, null, 76, null, 72, null, 69, null, 67, null, 71, null, 72, null, 74, null, 76, null, 72, null, 69, null, 72, null],
        },
        {
          wave: 'triangle',
          gain: 0.12,
          duration: 0.4,
          notes: [41, null, null, null, 48, null, null, null, 45, null, null, null, 48, null, null, null, 43, null, null, null, 50, null, null, null, 41, null, null, null, 48, null, null, null],
        },
      ],
    },
    sounds: {
      start: [{ note: 65, at: 0, duration: 0.16, gain: 0.22, wave: 'sine' }, { note: 72, at: 0.1, duration: 0.24, gain: 0.2, wave: 'sine' }],
      finish: [{ note: 69, at: 0, duration: 0.18, gain: 0.22, wave: 'triangle' }, { note: 65, at: 0.12, duration: 0.3, gain: 0.24, wave: 'sine' }],
      win: [{ note: 65, at: 0, duration: 0.15, gain: 0.25, wave: 'sine' }, { note: 72, at: 0.1, duration: 0.15, gain: 0.25, wave: 'sine' }, { note: 77, at: 0.22, duration: 0.4, gain: 0.3, wave: 'triangle' }],
      score: [{ note: 77, duration: 0.08, gain: 0.18, wave: 'sine' }],
    },
  },

  pin: {
    autoScore: true,
    music: {
      bpm: 108,
      steps: 32,
      voices: [
        {
          wave: 'sine',
          gain: 0.15,
          duration: 0.24,
          notes: [71, null, 74, 71, null, 76, 74, null, 71, null, 74, 71, null, 78, 76, null, 69, null, 73, 69, null, 74, 73, null, 71, null, 74, 71, null, 74, null, null],
        },
        {
          wave: 'triangle',
          gain: 0.12,
          duration: 0.34,
          notes: [47, null, null, 47, null, null, 54, null, 47, null, null, 47, null, null, 54, null, 45, null, null, 45, null, null, 52, null, 47, null, null, 47, null, null, 54, null],
        },
      ],
    },
    sounds: {
      start: [{ note: 71, at: 0, duration: 0.14, gain: 0.22, wave: 'sine' }, { note: 76, at: 0.09, duration: 0.2, gain: 0.2, wave: 'triangle' }],
      finish: [{ note: 71, at: 0, duration: 0.16, gain: 0.24, wave: 'triangle' }, { note: 67, at: 0.12, duration: 0.28, gain: 0.22, wave: 'sine' }],
      win: [{ note: 71, at: 0, duration: 0.14, gain: 0.24, wave: 'sine' }, { note: 74, at: 0.1, duration: 0.14, gain: 0.25, wave: 'sine' }, { note: 78, at: 0.22, duration: 0.38, gain: 0.3, wave: 'triangle' }],
      score: [{ note: 74, duration: 0.07, gain: 0.18, wave: 'sine' }],
    },
  },

  zigzag: {
    autoScore: true,
    music: {
      bpm: 128,
      steps: 32,
      voices: [
        {
          wave: 'triangle',
          gain: 0.16,
          duration: 0.2,
          notes: [62, null, 65, null, 67, null, 69, null, 67, 65, null, 67, 69, null, 72, null, 60, null, 64, null, 65, null, 67, null, 65, 64, null, 65, 67, null, 70, null],
        },
        {
          wave: 'triangle',
          gain: 0.13,
          duration: 0.3,
          notes: [38, null, null, 38, null, 45, null, null, 38, null, null, 38, null, 45, null, null, 36, null, null, 36, null, 43, null, null, 38, null, null, 38, null, 45, null, null],
        },
      ],
    },
    sounds: {
      start: [{ note: 62, at: 0, duration: 0.14, gain: 0.22, wave: 'triangle' }, { note: 69, at: 0.09, duration: 0.2, gain: 0.2, wave: 'sine' }],
      finish: [{ note: 65, at: 0, duration: 0.16, gain: 0.22, wave: 'triangle' }, { note: 62, at: 0.12, duration: 0.28, gain: 0.24, wave: 'sine' }],
      win: [{ note: 62, at: 0, duration: 0.14, gain: 0.24, wave: 'sine' }, { note: 67, at: 0.1, duration: 0.14, gain: 0.25, wave: 'triangle' }, { note: 74, at: 0.22, duration: 0.38, gain: 0.3, wave: 'sine' }],
      score: [{ note: 72, duration: 0.07, gain: 0.18, wave: 'triangle' }],
    },
  },

  chop: {
    autoScore: true,
    music: {
      bpm: 132,
      steps: 32,
      voices: [
        {
          wave: 'sine',
          gain: 0.16,
          duration: 0.18,
          notes: [67, null, 71, 74, null, 76, 74, null, 67, null, 71, 74, null, 79, 76, null, 65, null, 69, 72, null, 74, 72, null, 67, null, 71, 74, null, 76, null, null],
        },
        {
          wave: 'triangle',
          gain: 0.13,
          duration: 0.26,
          notes: [43, null, 50, null, 43, null, 50, null, 43, null, 50, null, 43, null, 50, null, 41, null, 48, null, 41, null, 48, null, 43, null, 50, null, 43, null, 50, null],
        },
      ],
    },
    sounds: {
      start: [{ note: 67, at: 0, duration: 0.14, gain: 0.22, wave: 'sine' }, { note: 74, at: 0.09, duration: 0.2, gain: 0.2, wave: 'triangle' }],
      finish: [{ note: 71, at: 0, duration: 0.16, gain: 0.22, wave: 'triangle' }, { note: 67, at: 0.12, duration: 0.28, gain: 0.24, wave: 'sine' }],
      win: [{ note: 67, at: 0, duration: 0.14, gain: 0.24, wave: 'sine' }, { note: 71, at: 0.1, duration: 0.14, gain: 0.25, wave: 'triangle' }, { note: 79, at: 0.22, duration: 0.38, gain: 0.3, wave: 'sine' }],
      score: [{ note: 79, duration: 0.07, gain: 0.18, wave: 'sine' }],
    },
  },

  meteor: {
    autoScore: true,
    music: {
      bpm: 110,
      steps: 32,
      voices: [
        {
          wave: 'sine',
          gain: 0.16,
          duration: 0.36,
          notes: [61, null, null, 64, null, null, 68, null, 66, null, null, 64, null, null, 61, null, 59, null, null, 63, null, null, 66, null, 64, null, null, 63, null, 66, null, null],
        },
        {
          wave: 'triangle',
          gain: 0.12,
          duration: 0.48,
          notes: [37, null, null, null, 44, null, null, null, 37, null, null, null, 44, null, null, null, 35, null, null, null, 42, null, null, null, 37, null, null, null, 44, null, null, null],
        },
      ],
    },
    sounds: {
      start: [{ note: 61, at: 0, duration: 0.16, gain: 0.22, wave: 'sine' }, { note: 68, at: 0.1, duration: 0.24, gain: 0.2, wave: 'triangle' }],
      finish: [{ note: 64, at: 0, duration: 0.18, gain: 0.22, wave: 'triangle' }, { note: 61, at: 0.12, duration: 0.3, gain: 0.24, wave: 'sine' }],
      win: [{ note: 61, at: 0, duration: 0.15, gain: 0.24, wave: 'sine' }, { note: 68, at: 0.1, duration: 0.15, gain: 0.25, wave: 'triangle' }, { note: 73, at: 0.22, duration: 0.4, gain: 0.3, wave: 'sine' }],
      score: [{ note: 73, duration: 0.08, gain: 0.18, wave: 'sine' }],
    },
  },

  hop: {
    autoScore: true,
    music: {
      bpm: 122,
      steps: 32,
      voices: [
        {
          wave: 'triangle',
          gain: 0.16,
          duration: 0.2,
          notes: [60, null, 64, null, 67, 72, null, 71, null, 67, null, 64, null, 67, 72, null, 62, null, 65, null, 69, 74, null, 72, null, 69, null, 65, null, 69, 74, null],
        },
        {
          wave: 'triangle',
          gain: 0.13,
          duration: 0.3,
          notes: [48, null, null, 48, null, 55, null, null, 48, null, null, 48, null, 55, null, null, 50, null, null, 50, null, 57, null, null, 48, null, null, 48, null, 55, null, null],
        },
      ],
    },
    sounds: {
      start: [{ note: 60, at: 0, duration: 0.14, gain: 0.22, wave: 'triangle' }, { note: 67, at: 0.09, duration: 0.2, gain: 0.2, wave: 'sine' }],
      finish: [{ note: 64, at: 0, duration: 0.16, gain: 0.22, wave: 'triangle' }, { note: 60, at: 0.12, duration: 0.28, gain: 0.24, wave: 'sine' }],
      win: [{ note: 60, at: 0, duration: 0.14, gain: 0.24, wave: 'sine' }, { note: 67, at: 0.1, duration: 0.14, gain: 0.25, wave: 'triangle' }, { note: 72, at: 0.22, duration: 0.38, gain: 0.3, wave: 'triangle' }],
      score: [{ note: 72, duration: 0.07, gain: 0.18, wave: 'triangle' }],
    },
  },

  chroma: {
    autoScore: true,
    music: {
      bpm: 120,
      steps: 32,
      voices: [
        {
          wave: 'sine',
          gain: 0.16,
          duration: 0.24,
          notes: [64, null, 68, null, 71, null, 74, null, 71, 68, null, 71, 74, null, 76, null, 62, null, 66, null, 69, null, 72, null, 69, 66, null, 69, 72, null, 74, null],
        },
        {
          wave: 'triangle',
          gain: 0.13,
          duration: 0.32,
          notes: [40, null, null, 40, null, null, 47, null, 40, null, null, 40, null, null, 47, null, 38, null, null, 38, null, null, 45, null, 40, null, null, 40, null, null, 47, null],
        },
      ],
    },
    sounds: {
      start: [{ note: 64, at: 0, duration: 0.14, gain: 0.22, wave: 'sine' }, { note: 71, at: 0.09, duration: 0.2, gain: 0.2, wave: 'triangle' }],
      finish: [{ note: 68, at: 0, duration: 0.16, gain: 0.22, wave: 'triangle' }, { note: 64, at: 0.12, duration: 0.28, gain: 0.24, wave: 'sine' }],
      win: [{ note: 64, at: 0, duration: 0.14, gain: 0.24, wave: 'sine' }, { note: 71, at: 0.1, duration: 0.14, gain: 0.25, wave: 'triangle' }, { note: 76, at: 0.22, duration: 0.38, gain: 0.3, wave: 'sine' }],
      score: [{ note: 76, duration: 0.07, gain: 0.18, wave: 'sine' }],
    },
  },

  drop: {
    autoScore: true,
    music: {
      bpm: 114,
      steps: 32,
      voices: [
        {
          wave: 'sine',
          gain: 0.16,
          duration: 0.26,
          notes: [73, null, 71, null, 69, null, 66, null, 64, null, 66, null, 69, null, 71, null, 74, null, 73, null, 71, null, 68, null, 66, null, 68, null, 71, null, null, null],
        },
        {
          wave: 'triangle',
          gain: 0.13,
          duration: 0.36,
          notes: [42, null, null, 42, null, null, 49, null, 42, null, null, 42, null, null, 49, null, 40, null, null, 40, null, null, 47, null, 42, null, null, 42, null, 49, null, null],
        },
      ],
    },
    sounds: {
      start: [{ note: 66, at: 0, duration: 0.14, gain: 0.22, wave: 'sine' }, { note: 73, at: 0.09, duration: 0.2, gain: 0.2, wave: 'triangle' }],
      finish: [{ note: 69, at: 0, duration: 0.16, gain: 0.22, wave: 'triangle' }, { note: 66, at: 0.12, duration: 0.28, gain: 0.24, wave: 'sine' }],
      win: [{ note: 66, at: 0, duration: 0.14, gain: 0.24, wave: 'sine' }, { note: 73, at: 0.1, duration: 0.14, gain: 0.25, wave: 'triangle' }, { note: 78, at: 0.22, duration: 0.38, gain: 0.3, wave: 'sine' }],
      score: [{ note: 73, duration: 0.07, gain: 0.18, wave: 'sine' }],
    },
  },

  invaders: {
    autoScore: true,
    music: {
      bpm: 112,
      steps: 32,
      voices: [
        {
          wave: 'triangle',
          gain: 0.16,
          duration: 0.2,
          notes: [60, null, 63, null, 67, null, 63, null, 60, null, 63, null, 70, null, 67, null, 58, null, 62, null, 65, null, 62, null, 60, null, 63, null, 67, null, null, null],
        },
        {
          wave: 'triangle',
          gain: 0.14,
          duration: 0.3,
          notes: [48, null, 48, null, 48, null, 48, null, 48, null, 48, null, 48, null, 48, null, 46, null, 46, null, 46, null, 46, null, 48, null, 48, null, 48, null, 48, null],
        },
      ],
    },
    sounds: {
      start: [{ note: 60, at: 0, duration: 0.14, gain: 0.22, wave: 'triangle' }, { note: 67, at: 0.09, duration: 0.2, gain: 0.2, wave: 'sine' }],
      finish: [{ note: 63, at: 0, duration: 0.16, gain: 0.22, wave: 'triangle' }, { note: 60, at: 0.12, duration: 0.28, gain: 0.24, wave: 'sine' }],
      win: [{ note: 60, at: 0, duration: 0.14, gain: 0.24, wave: 'sine' }, { note: 67, at: 0.1, duration: 0.14, gain: 0.25, wave: 'triangle' }, { note: 72, at: 0.22, duration: 0.38, gain: 0.3, wave: 'triangle' }],
      score: [{ note: 67, duration: 0.07, gain: 0.18, wave: 'triangle' }],
    },
  },

  crossy: {
    autoScore: true,
    music: {
      bpm: 116,
      steps: 32,
      voices: [
        {
          wave: 'triangle',
          gain: 0.16,
          duration: 0.22,
          notes: [62, null, 66, null, 69, 71, null, 74, null, 71, null, 69, null, 66, 69, null, 64, null, 67, null, 71, 73, null, 76, null, 73, null, 71, null, 67, 71, null],
        },
        {
          wave: 'triangle',
          gain: 0.13,
          duration: 0.34,
          notes: [50, null, null, null, 57, null, null, null, 50, null, null, null, 57, null, null, null, 47, null, null, null, 54, null, null, null, 50, null, null, null, 57, null, null, null],
        },
      ],
    },
    sounds: {
      start: [{ note: 62, at: 0, duration: 0.14, gain: 0.22, wave: 'triangle' }, { note: 69, at: 0.09, duration: 0.2, gain: 0.2, wave: 'sine' }],
      finish: [{ note: 66, at: 0, duration: 0.16, gain: 0.22, wave: 'triangle' }, { note: 62, at: 0.12, duration: 0.28, gain: 0.24, wave: 'sine' }],
      win: [{ note: 62, at: 0, duration: 0.14, gain: 0.24, wave: 'sine' }, { note: 69, at: 0.1, duration: 0.14, gain: 0.25, wave: 'triangle' }, { note: 74, at: 0.22, duration: 0.38, gain: 0.3, wave: 'sine' }],
      score: [{ note: 74, duration: 0.07, gain: 0.18, wave: 'sine' }],
    },
  },

  target: {
    autoScore: true,
    music: {
      bpm: 92,
      steps: 32,
      voices: [
        {
          wave: 'sine',
          gain: 0.18,
          duration: 0.45,
          notes: [69, null, null, 72, null, null, 76, null, 74, null, null, 72, null, null, 69, null, 67, null, null, 71, null, null, 74, null, 72, null, null, 71, null, null, null, null],
        },
        {
          wave: 'triangle',
          gain: 0.12,
          duration: 0.55,
          notes: [45, null, null, null, 52, null, null, null, 45, null, null, null, 52, null, null, null, 43, null, null, null, 50, null, null, null, 45, null, null, null, 52, null, null, null],
        },
      ],
    },
    sounds: {
      start: [{ note: 69, at: 0, duration: 0.16, gain: 0.22, wave: 'sine' }, { note: 76, at: 0.1, duration: 0.24, gain: 0.2, wave: 'triangle' }],
      finish: [{ note: 72, at: 0, duration: 0.18, gain: 0.22, wave: 'triangle' }, { note: 69, at: 0.12, duration: 0.3, gain: 0.24, wave: 'sine' }],
      win: [{ note: 69, at: 0, duration: 0.15, gain: 0.24, wave: 'sine' }, { note: 76, at: 0.1, duration: 0.15, gain: 0.25, wave: 'triangle' }, { note: 81, at: 0.22, duration: 0.4, gain: 0.3, wave: 'sine' }],
      score: [{ note: 81, duration: 0.08, gain: 0.18, wave: 'sine' }],
    },
  },

  pop: {
    autoScore: true,
    music: {
      bpm: 100,
      steps: 32,
      voices: [
        {
          wave: 'sine',
          gain: 0.17,
          duration: 0.32,
          notes: [63, null, 67, null, 70, null, 75, null, 74, null, 70, null, 67, null, 65, null, 62, null, 65, null, 68, null, 72, null, 70, null, 67, null, 65, null, null, null],
        },
        {
          wave: 'triangle',
          gain: 0.13,
          duration: 0.42,
          notes: [39, null, null, null, 46, null, null, null, 43, null, null, null, 46, null, null, null, 41, null, null, null, 48, null, null, null, 39, null, null, null, 46, null, null, null],
        },
      ],
    },
    sounds: {
      start: [{ note: 63, at: 0, duration: 0.15, gain: 0.22, wave: 'sine' }, { note: 70, at: 0.1, duration: 0.22, gain: 0.2, wave: 'triangle' }],
      finish: [{ note: 67, at: 0, duration: 0.16, gain: 0.22, wave: 'triangle' }, { note: 63, at: 0.12, duration: 0.28, gain: 0.24, wave: 'sine' }],
      win: [{ note: 63, at: 0, duration: 0.14, gain: 0.24, wave: 'sine' }, { note: 70, at: 0.1, duration: 0.14, gain: 0.25, wave: 'triangle' }, { note: 75, at: 0.22, duration: 0.38, gain: 0.3, wave: 'sine' }],
      score: [{ note: 75, duration: 0.07, gain: 0.18, wave: 'sine' }],
    },
  },
};

const arcadeProfile = {
  autoScore: true,
  music: audioProfiles.rally.music,
  sounds: {
    start: audioProfiles.stack.sounds.start,
    finish: audioProfiles.stack.sounds.finish,
    win: audioProfiles.stack.sounds.win,
    score: [{note: 72, duration: .09, gain: .12, wave: 'sine'}]
  }
};

export function getAudioProfile(gameId) {
  return audioProfiles[gameId] || extendedProfiles[gameId] || arcadeProfile;
}

