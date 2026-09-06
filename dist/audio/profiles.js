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
          gain: 0.11,
          duration: 0.28,
          notes: [60, null, 64, null, 67, null, 71, null, 72, null, 71, null, 67, null, 64, null, 60, null, 64, null, 67, null, 71, null, 74, null, 72, null, 67, null, 64, null],
        },
        {
          wave: 'sine',
          gain: 0.09,
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
          gain: 0.1,
          duration: 0.22,
          notes: [57, null, 60, 62, null, 64, 62, null, 57, null, 60, 64, null, 67, 64, null, 55, null, 59, 60, null, 62, 60, null, 55, null, 59, 62, null, 64, 62, null],
        },
        {
          wave: 'sine',
          gain: 0.08,
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
          gain: 0.12,
          duration: 0.34,
          notes: [60, null, 62, null, 65, null, 67, null, 69, null, 67, null, 65, null, 62, null, 60, null, 62, null, 65, null, 69, null, 72, null, 69, null, 65, null, 62, null],
        },
        {
          wave: 'triangle',
          gain: 0.075,
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
          gain: 0.105,
          duration: 0.24,
          notes: [62, null, 65, 67, null, 69, 67, null, 62, null, 65, 69, null, 72, 69, null, 60, null, 64, 65, null, 67, 65, null, 60, null, 64, 67, null, 69, 67, null],
        },
        {
          wave: 'sine',
          gain: 0.085,
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
          gain: 0.1,
          duration: 0.3,
          notes: [60, null, 64, 65, null, 67, 65, null, 60, null, 64, 67, null, 69, 67, null, 57, null, 60, 62, null, 64, 62, null, 57, null, 60, 64, null, 65, 64, null],
        },
        {
          wave: 'triangle',
          gain: 0.08,
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
