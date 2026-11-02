import { GROUND, type Demo, type Frame, type Pt } from './form-motion';

// The form demos: every starter lift as key poses (own work, decisions #8 and #14: nothing copied,
// no video files, no two lifts alike). Grid 140 x 120, floor at y = 108, the figure faces right
// when seen from the side. A pose gives the hips, the torso angle, hands and feet; form-motion.ts
// works out elbows and knees. form-motion.test.ts checks that each lift exists, is one of a kind,
// stays on the grid and keeps its planted feet down.

const G = GROUND;
const STAND: Pt = [70, 71];
const FOOT: Pt = [72, G];
const FOOT_FRONT: Pt = [78, G];

// A point on a circle: hands that turn around a still elbow or shoulder.
const arc = (cx: number, cy: number, r: number, deg: number): Pt => [
  Math.round((cx + r * Math.cos((deg * Math.PI) / 180)) * 10) / 10,
  Math.round((cy + r * Math.sin((deg * Math.PI) / 180)) * 10) / 10,
];

// A point relative to the shoulder of a given pose: a bar that rides on the back or the chest.
const fromShoulder = (hip: Pt, ta: number, dx: number, dy: number, torso = 30): Pt => [
  Math.round((hip[0] + Math.cos((ta * Math.PI) / 180) * torso + dx) * 10) / 10,
  Math.round((hip[1] + Math.sin((ta * Math.PI) / 180) * torso + dy) * 10) / 10,
];

const pose = (hip: Pt, ta: number, hand: Pt, foot: Pt, extra: Partial<Frame> = {}): Frame => ({ hip, ta, hand, foot, ...extra });

const SLOW_DOWN = [1800, 1000] as const; // lowering is slow, the effort is quick
const SLOW_BACK = [1000, 1800] as const; // the effort first, then a slow way back
const HOLD = [1600, 1600] as const;

const benchFlat = [[34, 84, 112, 84], [46, 84, 46, G], [100, 84, 100, G]];
const tower = (x: number) => [[x, 8, x, G], [x - 12, 8, x, 8]];
const pullBar = [[40, 12, 100, 12]];

export const demos: Record<string, Demo> = {
  // ---- Chest ----
  // Bench Press: the bar straight down to the chest and back up.
  e1: {
    frames: [pose([54, 78], 0, [84, 49], [34, G]), pose([54, 78], 0, [78, 65], [34, G])],
    phases: ['lower', 'press'],
    tempo: SLOW_DOWN,
    bendArm: -1,
    bendLeg: 1,
    props: [{ kind: 'ring', at: 'hand', r: 10 }],
    scenery: benchFlat,
    still: 0.5,
  },
  // Incline DB Press: on a slanted bench, dumbbells over the shoulders.
  e2: {
    frames: [pose([58, 84], -52, [78, 31], [30, G]), pose([58, 84], -52, [72, 52], [30, G])],
    phases: ['lower', 'press'],
    tempo: SLOW_DOWN,
    bendArm: -1,
    bendLeg: 1,
    props: [{ kind: 'db', at: 'hand' }],
    scenery: [[46, 96, 76, 58], [54, 90, 54, G]],
    still: 0,
  },
  // Dips: hands still on the bars, the body goes down and up.
  e18: {
    frames: [
      pose([66, 61], -85, [72, 61], [56, 92]),
      pose([58, 77], -78, [72, 61], [46, 104]),
    ],
    phases: ['lower', 'press'],
    tempo: SLOW_DOWN,
    bendArm: 1,
    bendLeg: -1,
    props: [],
    scenery: [[60, 63, 92, 63], [84, 63, 84, G]],
    still: 1,
  },
  // Incline Bench Press: the barbell on a flatter slant.
  e33: {
    frames: [pose([54, 86], -36, [79, 38], [26, G]), pose([54, 86], -36, [74, 58], [26, G])],
    phases: ['lower', 'press'],
    tempo: SLOW_DOWN,
    bendArm: -1,
    bendLeg: 1,
    props: [{ kind: 'ring', at: 'hand', r: 10 }],
    scenery: [[44, 96, 92, 66], [50, 92, 50, G], [78, 48, 78, G]],
    still: 0.6,
  },
  // Dumbbell Bench Press: flat bench, dumbbells come down wide.
  e34: {
    frames: [pose([54, 78], 0, [84, 49], [34, G]), pose([54, 78], 0, [74, 67], [34, G])],
    phases: ['lower', 'press'],
    tempo: SLOW_DOWN,
    bendArm: -1,
    bendLeg: 1,
    props: [{ kind: 'db', at: 'hand' }],
    scenery: benchFlat,
    still: 1,
  },
  // Cable Fly: from the front, wide arms come together in an arc.
  e35: {
    frames: [
      pose(STAND, -90, [107, 34], FOOT_FRONT),
      pose(STAND, -90, [98, 50], FOOT_FRONT),
      pose(STAND, -90, [76, 58], FOOT_FRONT),
    ],
    phases: ['squeeze', 'open'],
    tempo: SLOW_BACK,
    front: true,
    bendArm: 1,
    bendLeg: -1,
    props: [{ kind: 'link', from: [134, 8], to: 'hand' }, { kind: 'link', from: [6, 8], to: 'hand2' }],
    scenery: [[134, 8, 134, G], [6, 8, 6, G]],
    still: 1,
  },
  // Pec Deck: seated from the front, pads swing together.
  e36: {
    frames: [
      pose([70, 74], -90, [108, 42], [86, G]),
      pose([70, 74], -90, [100, 40], [86, G]),
      pose([70, 74], -90, [77, 54], [86, G]),
    ],
    phases: ['squeeze', 'open'],
    tempo: SLOW_BACK,
    front: true,
    bendArm: 1,
    bendLeg: -1,
    props: [{ kind: 'tick', at: 'hand', half: 9, upright: true }, { kind: 'tick', at: 'hand2', half: 9, upright: true }],
    scenery: [[52, 78, 88, 78], [70, 78, 70, G]],
    still: 1,
  },
  // Push-up: hands and toes stay, the straight body goes down in one line.
  e37: {
    frames: [pose([69, 89], -26, [96, 106], [35, 106]), pose([72, 99], -10, [96, 106], [35, 106])],
    phases: ['lower', 'push'],
    tempo: SLOW_DOWN,
    bendArm: 1,
    bendLeg: 1,
    props: [],
    scenery: [[20, G, 120, G]],
    still: 0,
  },
  // Chest Press Machine: seated upright, handles pushed forward.
  e38: {
    frames: [pose([50, 84], -90, [64, 58], [78, G]), pose([50, 84], -90, [79, 54], [78, G])],
    phases: ['press', 'release'],
    tempo: SLOW_BACK,
    bendArm: 1,
    bendLeg: -1,
    props: [{ kind: 'tick', at: 'hand', half: 9, upright: true }, { kind: 'link', from: [112, 24], to: 'hand' }],
    scenery: [[34, 92, 66, 92], [50, 92, 50, G], [36, 92, 36, 46], [112, 24, 112, G]],
    still: 1,
  },
  // Decline Bench Press: head low, feet hooked, bar to the lower chest.
  e39: {
    frames: [pose([52, 70], 14, [83, 47], [28, 74]), pose([52, 70], 14, [76, 64], [28, 74])],
    phases: ['lower', 'press'],
    tempo: SLOW_DOWN,
    bendArm: -1,
    bendLeg: 1,
    props: [{ kind: 'ring', at: 'hand', r: 10 }],
    scenery: [[28, 76, 106, 96], [42, 79, 42, G], [94, 93, 94, G]],
    still: 1,
  },

  // ---- Back ----
  // Pull-up: from the front, hands fixed, from a hang to the chin over the bar.
  e5: {
    frames: [pose([70, 74], -90, [85, 14], [75, G]), pose([70, 56], -90, [85, 14], [75, 92])],
    phases: ['pull', 'lower'],
    tempo: SLOW_BACK,
    front: true,
    bendArm: 1,
    bendLeg: -1,
    props: [],
    scenery: pullBar,
    still: 1,
  },
  // Barbell Row: hinged and still, the bar comes up to the belly.
  e6: {
    frames: [pose([54, 74], -25, [80, 91], [66, G]), pose([54, 74], -25, [66, 77], [66, G])],
    phases: ['pull', 'lower'],
    tempo: SLOW_BACK,
    bendArm: 1,
    bendLeg: -1,
    props: [{ kind: 'ring', at: 'hand', r: 11 }],
    scenery: [],
    still: 1,
  },
  // Lat Pulldown: seated, the bar from high to the upper chest.
  e15: {
    frames: [pose([58, 84], -100, [58, 25], [84, G]), pose([58, 84], -100, [62, 52], [84, G])],
    phases: ['pull', 'release'],
    tempo: SLOW_BACK,
    bendArm: 1,
    bendLeg: -1,
    props: [{ kind: 'tick', at: 'hand', half: 16 }, { kind: 'link', from: [60, 4], to: 'hand' }],
    scenery: [[42, 92, 76, 92], [58, 92, 58, G], [60, 4, 120, 4], [120, 4, 120, G]],
    still: 1,
  },
  // Seated Cable Row: chest up, the handle to the belly.
  e16: {
    frames: [pose([50, 84], -78, [86, 66], [84, 96]), pose([50, 84], -96, [60, 72], [84, 96])],
    phases: ['pull', 'release'],
    tempo: SLOW_BACK,
    bendArm: 1,
    bendLeg: -1,
    props: [{ kind: 'link', from: [126, 76], to: 'hand' }, { kind: 'tick', at: 'hand', half: 6, upright: true }],
    scenery: [[36, 92, 70, 92], [52, 92, 52, G], [88, 86, 88, 104], [126, 40, 126, G]],
    still: 1,
  },
  // Dumbbell Row: one hand and knee on the bench, the other pulls up.
  e40: {
    frames: [
      pose([42, 72], -6, [72, 96], [34, G], { hand2: [90, 84], foot2: [48, 84] }),
      pose([42, 72], -6, [58, 78], [34, G], { hand2: [90, 84], foot2: [48, 84] }),
    ],
    phases: ['pull', 'lower'],
    tempo: SLOW_BACK,
    bendArm: 1,
    bendLeg: -1,
    bendLeg2: -1,
    props: [{ kind: 'db', at: 'hand' }],
    scenery: [[44, 86, 104, 86], [56, 86, 56, G], [94, 86, 94, G]],
    still: 1,
  },
  // T-Bar Row: hinged over the bar, its far end stays on the floor.
  e41: {
    frames: [pose([50, 76], -18, [90, 88], [62, G]), pose([50, 76], -18, [72, 72], [62, G])],
    phases: ['pull', 'lower'],
    tempo: SLOW_BACK,
    bendArm: 1,
    bendLeg: -1,
    props: [{ kind: 'link', from: [10, 106], to: 'hand' }, { kind: 'ring', at: 'hand', r: 8, dx: 9, dy: 1 }],
    scenery: [],
    still: 1,
  },
  // Chin-up: seen from the side, palms towards you.
  e42: {
    frames: [pose([66, 74], -84, [76, 15], [64, G - 2]), pose([60, 57], -76, [76, 15], [56, 92])],
    phases: ['pull', 'lower'],
    tempo: SLOW_BACK,
    bendArm: -1,
    bendLeg: -1,
    props: [{ kind: 'ring', at: 'hand', r: 3 }],
    scenery: [[46, 15, 100, 15], [100, 15, 100, G]],
    still: 1,
  },
  // Straight-Arm Pulldown: arms stay long and swing from the shoulder.
  e43: {
    frames: [
      pose([60, 71], -72, arc(69.3, 42.5, 29.5, -10), [64, G]),
      pose([60, 71], -72, arc(69.3, 42.5, 29.5, 40), [64, G]),
      pose([60, 71], -72, arc(69.3, 42.5, 29.5, 85), [64, G]),
    ],
    phases: ['pull', 'release'],
    tempo: SLOW_BACK,
    bendArm: 1,
    bendLeg: -1,
    props: [{ kind: 'link', from: [122, 10], to: 'hand' }, { kind: 'tick', at: 'hand', half: 6, upright: true }],
    scenery: tower(122),
    still: 1,
  },
  // Back Extension: hips on the pad, the back comes up to one long line.
  e44: {
    frames: [
      pose([58, 72], 50, fromShoulder([58, 72], 50, 6, -6), [24, 88]),
      pose([58, 72], 20, fromShoulder([58, 72], 20, 4, -7), [24, 88]),
      pose([58, 72], -12, fromShoulder([58, 72], -12, 2, -8), [24, 88]),
    ],
    phases: ['raise', 'lower'],
    tempo: SLOW_BACK,
    bendArm: 1,
    bendLeg: -1,
    props: [],
    scenery: [[46, 80, 66, 80], [56, 80, 40, G], [18, 96, 34, 96], [26, 96, 30, G]],
    still: 1,
  },
  // Rack Pull: the bar starts on the pins at knee height.
  e45: {
    frames: [pose([58, 78], -50, [77, 85], [66, G]), pose([68, 71], -90, [70, 71], [66, G])],
    phases: ['raise', 'lower'],
    tempo: SLOW_BACK,
    bendArm: 1,
    bendLeg: -1,
    props: [{ kind: 'ring', at: 'hand', r: 11 }],
    scenery: [[94, 40, 94, G], [66, 97, 104, 97]],
    still: 0,
  },
  // Shrug: from the front, only the shoulders go up, the arms hang.
  e46: {
    frames: [pose([70, 74], -90, [84, 73], FOOT_FRONT), pose([70, 70], -90, [84, 69], FOOT_FRONT)],
    phases: ['raise', 'lower'],
    tempo: SLOW_BACK,
    front: true,
    bendArm: 1,
    bendLeg: -1,
    props: [{ kind: 'barFront', plates: 9 }],
    scenery: [],
    still: 1,
  },

  // ---- Legs ----
  // Back Squat: bar over the mid foot all the way, hips down and back.
  e9: {
    frames: [
      pose(STAND, -90, fromShoulder(STAND, -90, -6, -3), FOOT),
      pose([58, 88], -56, fromShoulder([58, 88], -56, -6, -3), FOOT),
    ],
    phases: ['squat', 'stand'],
    tempo: SLOW_DOWN,
    bendArm: -1,
    bendLeg: -1,
    props: [{ kind: 'ring', at: 'shoulder', r: 10, dx: -9, dy: 1 }],
    scenery: [],
    still: 1,
  },
  // Deadlift: from the floor, the bar stays close to the shins.
  e10: {
    frames: [pose([52, 78], -30, [76, 92], [66, G]), pose([68, 71], -90, [70, 71], [66, G])],
    phases: ['raise', 'lower'],
    tempo: SLOW_BACK,
    bendArm: 1,
    bendLeg: -1,
    props: [{ kind: 'ring', at: 'hand', r: 13 }],
    scenery: [],
    still: 0,
  },
  // Romanian Deadlift: knees almost still, hips go back, the bar slides down the thighs.
  e11: {
    frames: [pose([68, 72], -90, [70, 72], [66, G]), pose([54, 74], -16, [80, 91], [66, G])],
    phases: ['hinge', 'stand'],
    tempo: SLOW_DOWN,
    bendArm: 1,
    bendLeg: -1,
    props: [{ kind: 'ring', at: 'hand', r: 10 }],
    scenery: [],
    still: 1,
  },
  // Leg Press: seated in the sled, the plate pushed up and away.
  e12: {
    frames: [pose([44, 76], -135, [48, 78], [66, 58]), pose([44, 76], -135, [48, 78], [73, 53])],
    phases: ['push', 'lower'],
    tempo: SLOW_BACK,
    bendArm: 1,
    bendLeg: -1,
    props: [{ kind: 'tick', at: 'foot', half: 11, upright: true, dx: 3 }, { kind: 'link', from: [122, 16], to: 'foot' }],
    scenery: [[10, 40, 42, 86, 66, 86], [52, 86, 52, G], [122, 16, 122, G]],
    still: 0,
  },
  // Walking Lunge: long step, the back knee sinks towards the floor.
  e13: {
    frames: [
      pose([68, 72], -90, [70, 72], [84, G], { foot2: [52, G] }),
      pose([66, 88], -90, [68, 88], [84, G], { foot2: [52, G] }),
    ],
    phases: ['lower', 'stand'],
    tempo: SLOW_DOWN,
    bendArm: 1,
    bendLeg: -1,
    bendLeg2: -1,
    props: [{ kind: 'db', at: 'hand', upright: true }],
    scenery: [],
    still: 1,
  },
  // Calf Raise: the heel lifts, the toes stay on the step.
  e14: {
    frames: [pose([70, 71], -90, [71, 71], [72, 106]), pose([70, 62], -90, [71, 62], [72, 98])],
    phases: ['raise', 'lower'],
    tempo: SLOW_BACK,
    bendArm: 1,
    bendLeg: -1,
    props: [{ kind: 'link', from: [86, 106], to: 'foot' }],
    scenery: [[60, 110, 110, 110]],
    still: 1,
  },
  // Front Squat: the bar on the front of the shoulders, torso much more upright.
  e21: {
    frames: [
      pose(STAND, -90, fromShoulder(STAND, -90, 8, -1), FOOT),
      pose([60, 90], -70, fromShoulder([60, 90], -70, 8, -1), FOOT),
    ],
    phases: ['squat', 'stand'],
    tempo: SLOW_DOWN,
    bendArm: 1,
    bendLeg: -1,
    props: [{ kind: 'ring', at: 'hand', r: 10 }],
    scenery: [],
    still: 1,
  },
  // Bulgarian Split Squat: back foot on the bench, down on the front leg.
  e22: {
    frames: [
      pose([68, 74], -90, [70, 74], [84, G], { foot2: [40, 80] }),
      pose([62, 90], -84, [66, 90], [84, G], { foot2: [40, 80] }),
    ],
    phases: ['lower', 'stand'],
    tempo: SLOW_DOWN,
    bendArm: 1,
    bendLeg: -1,
    bendLeg2: 1,
    props: [{ kind: 'db', at: 'hand', upright: true }],
    scenery: [[22, 84, 52, 84], [36, 84, 36, G]],
    still: 1,
  },
  // Hip Thrust: shoulders on the bench, the hips push the bar up.
  e23: {
    frames: [pose([68, 96], -41, [70, 88], [50, G]), pose([66, 78], -8, [68, 70], [50, G])],
    phases: ['raise', 'lower'],
    tempo: SLOW_BACK,
    bendArm: 1,
    bendLeg: 1,
    props: [{ kind: 'ring', at: 'hip', r: 9, dy: -10 }],
    scenery: [[84, 84, 116, 84], [100, 84, 100, G]],
    still: 1,
  },
  // Leg Extension: seated, the shin swings up around the still knee.
  e24: {
    frames: [
      pose([58, 72], -100, [52, 74], arc(77, 72, 19, 90)),
      pose([58, 72], -100, [52, 74], arc(77, 72, 19, 45)),
      pose([58, 72], -100, [52, 74], arc(77, 72, 19, -6)),
    ],
    phases: ['raise', 'lower'],
    tempo: SLOW_BACK,
    bendArm: 1,
    bendLeg: -1,
    props: [{ kind: 'link', from: [78, 74], to: 'foot' }],
    scenery: [[42, 80, 74, 80], [58, 80, 58, G], [42, 80, 36, 36]],
    still: 1,
  },
  // Lying Leg Curl: face down, the heels come up to the seat.
  e25: {
    frames: [
      pose([60, 72], 0, [100, 84], arc(41, 72, 19, 176)),
      pose([60, 72], 0, [100, 84], arc(41, 72, 19, 225)),
      pose([60, 72], 0, [100, 84], arc(41, 72, 19, 278)),
    ],
    phases: ['curl', 'lower'],
    tempo: SLOW_BACK,
    bendArm: 1,
    bendLeg: -1,
    props: [{ kind: 'tick', at: 'foot', half: 5, dy: 1 }],
    scenery: [[34, 80, 112, 80], [50, 80, 50, G], [100, 80, 100, G]],
    still: 1,
  },
  // Seated Leg Curl: seated, the shin pulls down and under.
  e26: {
    frames: [
      pose([58, 72], -106, [50, 72], arc(77, 72, 19, 2)),
      pose([58, 72], -106, [50, 72], arc(77, 72, 19, 50)),
      pose([58, 72], -106, [50, 72], arc(77, 72, 19, 104)),
    ],
    phases: ['curl', 'release'],
    tempo: SLOW_BACK,
    bendArm: 1,
    bendLeg: -1,
    props: [{ kind: 'tick', at: 'foot', half: 6, upright: true, dx: 3 }],
    scenery: [[42, 80, 74, 80], [58, 80, 58, G], [42, 80, 32, 36], [76, 62, 86, 62]],
    still: 1,
  },
  // Goblet Squat: one dumbbell against the chest, deep and upright.
  e27: {
    frames: [
      pose(STAND, -90, fromShoulder(STAND, -90, 9, 9), FOOT),
      pose([60, 92], -68, fromShoulder([60, 92], -68, 9, 9), FOOT),
    ],
    phases: ['squat', 'stand'],
    tempo: SLOW_DOWN,
    bendArm: 1,
    bendLeg: -1,
    props: [{ kind: 'db', at: 'hand', upright: true, dx: 3 }],
    scenery: [],
    still: 1,
  },
  // Hack Squat: back on the slanted sled, feet stay on the plate.
  e28: {
    frames: [pose([58, 66], -125, [54, 62], [82, 94]), pose([68, 80], -125, [64, 76], [82, 94])],
    phases: ['squat', 'stand'],
    tempo: SLOW_DOWN,
    bendArm: 1,
    bendLeg: -1,
    props: [],
    scenery: [[26, 24, 72, 96], [72, 104, 96, 88], [58, 80, 58, G]],
    still: 1,
  },
  // Hip Adduction: seated from the front, the knees press together.
  e29: {
    frames: [pose([70, 68], -90, [85, 66], [101, 92]), pose([70, 68], -90, [85, 66], [80, 104])],
    phases: ['squeeze', 'open'],
    tempo: SLOW_BACK,
    front: true,
    bendArm: 1,
    bendLeg: -1,
    props: [{ kind: 'tick', at: 'foot', half: 7, upright: true, dx: -4 }, { kind: 'tick', at: 'foot2', half: 7, upright: true, dx: 4 }],
    scenery: [[50, 72, 90, 72], [70, 72, 70, G]],
    still: 1,
  },
  // Hip Abduction: seated from the front, the knees press apart.
  e30: {
    frames: [pose([70, 68], -90, [84, 67], [79, 104]), pose([70, 68], -90, [84, 67], [103, 90])],
    phases: ['open', 'squeeze'],
    tempo: SLOW_BACK,
    front: true,
    bendArm: 1,
    bendLeg: -1,
    props: [{ kind: 'tick', at: 'foot', half: 7, upright: true, dx: 4 }, { kind: 'tick', at: 'foot2', half: 7, upright: true, dx: -4 }],
    scenery: [[50, 72, 90, 72], [70, 72, 70, G]],
    still: 1,
  },
  // Sumo Deadlift: from the front, wide feet, the knees track out.
  e31: {
    frames: [pose([70, 88], -90, [79, 88], [90, G]), pose([70, 71], -90, [80, 71], [88, G])],
    phases: ['raise', 'lower'],
    tempo: SLOW_BACK,
    front: true,
    bendArm: 1,
    bendLeg: -1,
    props: [{ kind: 'barFront', plates: 13 }],
    scenery: [],
    still: 0,
  },
  // Step-up: the front foot on the box, push up, the back foot follows.
  e32: {
    frames: [
      pose([66, 74], -90, [68, 74], [90, 86], { foot2: [60, G] }),
      pose([86, 50], -90, [88, 50], [90, 86], { foot2: [76, 78] }),
    ],
    phases: ['step', 'lower'],
    tempo: SLOW_BACK,
    bendArm: 1,
    bendLeg: -1,
    bendLeg2: -1,
    props: [{ kind: 'db', at: 'hand', upright: true }],
    scenery: [[76, 88, 110, 88], [76, 88, 76, G], [110, 88, 110, G]],
    still: 0.5,
  },

  // ---- Shoulders ----
  // Overhead Press: from the front, the bar from the collarbone to locked out.
  e3: {
    frames: [pose(STAND, -90, [87, 36], FOOT_FRONT), pose(STAND, -90, [84, 12], FOOT_FRONT)],
    phases: ['press', 'lower'],
    tempo: SLOW_BACK,
    front: true,
    bendArm: 1,
    bendLeg: -1,
    props: [{ kind: 'barFront', plates: 11 }],
    scenery: [],
    still: 1,
  },
  // Face Pull: the rope from the high pulley to the forehead, elbows high.
  e7: {
    frames: [pose(STAND, -92, [99, 36], FOOT), pose(STAND, -96, [80, 28], FOOT)],
    phases: ['pull', 'release'],
    tempo: SLOW_BACK,
    bendArm: -1,
    bendLeg: -1,
    props: [{ kind: 'link', from: [126, 24], to: 'hand' }],
    scenery: tower(126),
    still: 1,
  },
  // Lateral Raise: from the front, arms out to shoulder height, no higher.
  e17: {
    frames: [
      pose(STAND, -90, [85, 69], FOOT_FRONT),
      pose(STAND, -90, [104, 60], FOOT_FRONT),
      pose(STAND, -90, [110, 42], FOOT_FRONT),
    ],
    phases: ['raise', 'lower'],
    tempo: SLOW_BACK,
    front: true,
    bendArm: -1,
    bendLeg: -1,
    props: [{ kind: 'db', at: 'hand', upright: true }, { kind: 'db', at: 'hand2', upright: true }],
    scenery: [],
    still: 1,
  },
  // Dumbbell Shoulder Press: from the front, both dumbbells straight up.
  e47: {
    frames: [pose([70, 78], -90, [93, 42], [88, G]), pose([70, 78], -90, [83, 19], [88, G])],
    phases: ['press', 'lower'],
    tempo: SLOW_BACK,
    front: true,
    bendArm: 1,
    bendLeg: -1,
    props: [{ kind: 'db', at: 'hand' }, { kind: 'db', at: 'hand2' }],
    scenery: [[52, 82, 88, 82], [70, 82, 70, G]],
    still: 1,
  },
  // Arnold Press: from the front, hands start in front of the chest and turn out on the way up.
  e48: {
    frames: [
      pose([70, 78], -90, [78, 44], [88, G]),
      pose([70, 78], -90, [95, 36], [88, G]),
      pose([70, 78], -90, [83, 19], [88, G]),
    ],
    phases: ['press', 'lower'],
    tempo: SLOW_BACK,
    front: true,
    bendArm: 1,
    bendLeg: -1,
    props: [{ kind: 'db', at: 'hand', upright: true }, { kind: 'db', at: 'hand2', upright: true }],
    scenery: [[52, 82, 88, 82], [70, 82, 70, G]],
    still: 0.5,
  },
  // Rear Delt Fly: bent forward, seen from the front, arms open wide.
  e49: {
    frames: [
      pose([70, 74], -90, [84, 83], [80, G]),
      pose([70, 74], -90, [103, 74], [80, G]),
      pose([70, 74], -90, [110, 57], [80, G]),
    ],
    phases: ['raise', 'lower'],
    tempo: SLOW_BACK,
    front: true,
    torso: 18,
    bendArm: -1,
    bendLeg: -1,
    props: [{ kind: 'db', at: 'hand', upright: true }, { kind: 'db', at: 'hand2', upright: true }],
    scenery: [],
    still: 1,
  },
  // Upright Row: from the side, the bar up along the body, elbows above the hands.
  e50: {
    frames: [pose(STAND, -90, [74, 70], FOOT), pose(STAND, -90, [80, 48], FOOT)],
    phases: ['pull', 'lower'],
    tempo: SLOW_BACK,
    bendArm: -1,
    bendLeg: -1,
    props: [{ kind: 'ring', at: 'hand', r: 9, dx: 3 }],
    scenery: [],
    still: 1,
  },
  // Cable Lateral Raise: one arm, from the low pulley on the other side.
  e51: {
    frames: [
      pose(STAND, -90, [76, 70], FOOT_FRONT, { hand2: [56, 66] }),
      pose(STAND, -90, [100, 62], FOOT_FRONT, { hand2: [56, 66] }),
      pose(STAND, -90, [110, 43], FOOT_FRONT, { hand2: [56, 66] }),
    ],
    phases: ['raise', 'lower'],
    tempo: SLOW_BACK,
    front: true,
    bendArm: -1,
    bendLeg: -1,
    props: [{ kind: 'link', from: [20, 102], to: 'hand' }],
    scenery: [[20, 30, 20, G]],
    still: 1,
  },

  // ---- Arms ----
  // Triceps Pushdown: elbows pinned to the sides, the hands go down.
  e4: {
    frames: [
      pose(STAND, -90, arc(70, 56, 15, 22), FOOT),
      pose(STAND, -90, arc(70, 56, 15, 55), FOOT),
      pose(STAND, -90, arc(70, 56, 15, 88), FOOT),
    ],
    phases: ['push', 'release'],
    tempo: SLOW_BACK,
    bendArm: 1,
    bendLeg: -1,
    props: [{ kind: 'link', from: [108, 12], to: 'hand' }, { kind: 'tick', at: 'hand', half: 6 }],
    scenery: tower(108),
    still: 1,
  },
  // Biceps Curl: the elbow stays beside the ribs, the forearm comes up.
  e8: {
    frames: [
      pose(STAND, -90, arc(70, 56, 15, 84), FOOT),
      pose(STAND, -90, arc(70, 56, 15, 25), FOOT),
      pose(STAND, -90, arc(70, 56, 15, -45), FOOT),
    ],
    phases: ['curl', 'lower'],
    tempo: SLOW_BACK,
    bendArm: 1,
    bendLeg: -1,
    props: [{ kind: 'db', at: 'hand' }],
    scenery: [],
    still: 1,
  },
  // Hammer Curl: the same arc, the dumbbell stays upright.
  e19: {
    frames: [
      pose(STAND, -90, arc(70, 56, 15, 80), FOOT),
      pose(STAND, -90, arc(70, 56, 15, 20), FOOT),
      pose(STAND, -90, arc(70, 56, 15, -38), FOOT),
    ],
    phases: ['curl', 'lower'],
    tempo: SLOW_BACK,
    bendArm: 1,
    bendLeg: -1,
    props: [{ kind: 'db', at: 'hand', upright: true }],
    scenery: [],
    still: 1,
  },
  // Skull Crusher: lying down, the upper arm still, the bar to the forehead.
  e52: {
    frames: [
      pose([54, 78], 0, arc(84, 63, 15, -88), [34, G]),
      pose([54, 78], 0, arc(84, 63, 15, -48), [34, G]),
      pose([54, 78], 0, arc(84, 63, 15, -8), [34, G]),
    ],
    phases: ['bend', 'extend'],
    tempo: SLOW_DOWN,
    bendArm: -1,
    bendLeg: 1,
    props: [{ kind: 'ring', at: 'hand', r: 7 }],
    scenery: benchFlat,
    still: 1,
  },
  // Overhead Triceps Extension: elbows by the ears, the weight goes behind the head.
  e53: {
    frames: [
      pose(STAND, -90, arc(72, 26, 15, -86), FOOT),
      pose(STAND, -90, arc(72, 26, 15, -136), FOOT),
      pose(STAND, -90, arc(72, 26, 15, 170), FOOT),
    ],
    phases: ['bend', 'extend'],
    tempo: SLOW_DOWN,
    bendArm: 1,
    bendLeg: -1,
    props: [{ kind: 'db', at: 'hand', upright: true }],
    scenery: [],
    still: 0.5,
  },
  // Close-Grip Bench Press: the elbows stay close and travel towards the feet.
  e54: {
    frames: [pose([54, 78], 0, [84, 49], [34, G]), pose([54, 78], 0, [72, 68], [34, G])],
    phases: ['lower', 'press'],
    tempo: SLOW_DOWN,
    bendArm: -1,
    bendLeg: 1,
    props: [{ kind: 'ring', at: 'hand', r: 8 }],
    scenery: benchFlat,
    still: 0.6,
  },
  // Preacher Curl: the upper arm rests on the pad, only the forearm moves.
  e55: {
    frames: [
      pose([58, 78], -75, arc(80.5, 52, 15, 16), [86, G]),
      pose([58, 78], -75, arc(80.5, 52, 15, -40), [86, G]),
      pose([58, 78], -75, arc(80.5, 52, 15, -100), [86, G]),
    ],
    phases: ['curl', 'lower'],
    tempo: SLOW_BACK,
    bendArm: 1,
    bendLeg: -1,
    props: [{ kind: 'ring', at: 'hand', r: 6 }],
    scenery: [[44, 86, 72, 86], [58, 86, 58, G], [84, 58, 72, 66, 72, G]],
    still: 1,
  },
  // Incline Dumbbell Curl: the arm hangs behind the body, the elbow stays back.
  e56: {
    frames: [
      pose([66, 84], -125, arc(48.8, 74.4, 15, 88), [92, G]),
      pose([66, 84], -125, arc(48.8, 74.4, 15, 30), [92, G]),
      pose([66, 84], -125, arc(48.8, 74.4, 15, -32), [92, G]),
    ],
    phases: ['curl', 'lower'],
    tempo: SLOW_BACK,
    bendArm: 1,
    bendLeg: -1,
    props: [{ kind: 'db', at: 'hand' }],
    scenery: [[28, 40, 66, 94, 86, 94], [66, 94, 66, G]],
    still: 1,
  },
  // Cable Curl: the curl with the pull from a low pulley in front.
  e57: {
    frames: [
      pose(STAND, -90, arc(70, 56, 15, 76), FOOT),
      pose(STAND, -90, arc(70, 56, 15, 20), FOOT),
      pose(STAND, -90, arc(70, 56, 15, -40), FOOT),
    ],
    phases: ['curl', 'lower'],
    tempo: SLOW_BACK,
    bendArm: 1,
    bendLeg: -1,
    props: [{ kind: 'link', from: [116, 104], to: 'hand' }, { kind: 'tick', at: 'hand', half: 6, upright: true }],
    scenery: [[116, 64, 116, G]],
    still: 1,
  },

  // ---- Core ----
  // Plank: on the forearms, one straight line; a slow steady hold.
  e20: {
    frames: [pose([55, 90], -8, [99, 106], [20, 106]), pose([55, 91.5], -8, [99, 106], [20, 106])],
    phases: ['hold', 'hold'],
    tempo: HOLD,
    bendArm: 1,
    bendLeg: 1,
    props: [],
    scenery: [[10, G, 120, G]],
    still: 0,
  },
  // Hanging Leg Raise: hands on the bar, the legs swing up from the hips.
  e58: {
    frames: [
      pose([70, 72], -86, [80, 14], [70, 107]),
      pose([70, 72], -86, [80, 14], arc(70, 72, 37, 45)),
      pose([70, 72], -86, [80, 14], arc(70, 72, 37, 4)),
    ],
    phases: ['raise', 'lower'],
    tempo: SLOW_BACK,
    bendArm: -1,
    bendLeg: -1,
    props: [],
    scenery: [[46, 14, 100, 14]],
    still: 1,
  },
  // Cable Crunch: kneeling, the ribs curl towards the hips.
  e59: {
    frames: [
      pose([66, 84], -88, fromShoulder([66, 84], -88, 6, -10), [46, 104]),
      pose([66, 84], -38, fromShoulder([66, 84], -38, 5, -8), [46, 104]),
    ],
    phases: ['crunch', 'release'],
    tempo: SLOW_BACK,
    bendArm: 1,
    bendLeg: -1,
    props: [{ kind: 'link', from: [34, 8], to: 'hand' }],
    scenery: [[34, 8, 34, G], [24, 8, 34, 8]],
    still: 1,
  },
  // Ab Wheel Rollout: from the knees, the wheel rolls out, the back stays flat.
  e60: {
    frames: [pose([46, 80], -30, [74, 95], [24, 104]), pose([58, 94], -8, [112, 98], [24, 104])],
    phases: ['rollOut', 'rollBack'],
    tempo: SLOW_DOWN,
    bendArm: 1,
    bendLeg: -1,
    props: [{ kind: 'ring', at: 'hand', r: 6, dy: 4 }],
    scenery: [[12, G, 128, G]],
    still: 0.7,
  },
};

export const hasDemo = (id: string) => id in demos;
