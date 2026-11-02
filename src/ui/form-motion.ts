// The figure engine behind the form demos: one lift is a few key poses, and this file turns a
// pose and a moment (t, 0 to 1) into SVG paths. Hips, torso angle, hands and feet are given;
// knees and elbows follow from fixed limb lengths (two-bone IK), so a limb never stretches and a
// planted foot stays planted. Pure and marked 'worklet', so it runs per frame on the UI thread
// and in form-motion.test.ts alike. The poses live in form-demos.ts.

export const VIEW_W = 140;
export const VIEW_H = 120;
export const GROUND = 108;

const TORSO = 30;
const UPPER_ARM = 15;
const FOREARM = 15;
const THIGH = 19;
const SHIN = 19;
const HEAD_R = 7;
const NECK = 12;
const SHOULDER_W = 11;
const HIP_W = 6;

export type Pt = readonly [number, number];
export type Joint = 'hand' | 'hand2' | 'foot' | 'foot2' | 'hip' | 'shoulder';

// ta: the torso's direction from the hips in degrees. -90 is upright, 0 points right.
export type Frame = { hip: Pt; ta: number; hand: Pt; foot: Pt; hand2?: Pt; foot2?: Pt };

export type Prop =
  // A barbell seen from the side: the plate as a ring around a joint.
  | { kind: 'ring'; at: Joint; r: number; dx?: number; dy?: number }
  // A dumbbell seen from the side, level or upright.
  | { kind: 'db'; at: Joint; upright?: boolean; dx?: number; dy?: number }
  // A barbell seen from the front, between both hands.
  | { kind: 'barFront'; plates?: number }
  // A straight line from a fixed point to a joint: cable, lever, sled.
  | { kind: 'link'; from: Pt; to: Joint }
  // A short level bar at a joint: handle, pad.
  | { kind: 'tick'; at: Joint; half: number; upright?: boolean; dx?: number; dy?: number };

export type PhaseKey =
  | 'lower' | 'press' | 'pull' | 'release' | 'curl' | 'raise' | 'squat' | 'stand' | 'hold' | 'push'
  | 'hinge' | 'open' | 'squeeze' | 'extend' | 'bend' | 'crunch' | 'rollOut' | 'rollBack' | 'step' | 'drive';

export type Demo = {
  // Key poses, played first to last, then back. The first is where a rep starts.
  frames: Frame[];
  // The cue words for the way there and the way back.
  phases: readonly [PhaseKey, PhaseKey];
  // Milliseconds for the way there and the way back.
  tempo: readonly [number, number];
  // Seen from the front: both arms and legs, the far side mirrored unless a frame says otherwise.
  front?: boolean;
  // Bent forward towards the viewer: the torso looks shorter.
  torso?: number;
  // Which way elbows and knees point (+1 or -1); only the two-limb lifts need bendLeg2.
  bendArm: number;
  bendLeg: number;
  bendLeg2?: number;
  props: Prop[];
  // Bench, rack, cable tower: fixed lines behind the figure, as polylines (x y x y ...).
  scenery: number[][];
  // Which moment the small still drawing shows.
  still: number;
};

export type DemoPaths = { body: string; gear: string; head: string };

const r1 = (n: number) => {
  'worklet';
  return Math.round(n * 10) / 10;
};

// The knee or elbow between a and b for two limb lengths, on the side given by bend.
function solve(ax: number, ay: number, bx: number, by: number, l1: number, l2: number, bend: number) {
  'worklet';
  const dx = bx - ax;
  const dy = by - ay;
  const dist = Math.hypot(dx, dy) || 0.001;
  const d = Math.min(l1 + l2 - 0.01, Math.max(Math.abs(l1 - l2) + 0.01, dist));
  const a = (l1 * l1 - l2 * l2 + d * d) / (2 * d);
  const h = Math.sqrt(Math.max(0, l1 * l1 - a * a));
  const ux = dx / dist;
  const uy = dy / dist;
  const mx = ax + ux * a;
  const my = ay + uy * a;
  // The far end too: an out-of-reach target is pulled in, never drawn with a stretched limb.
  return [mx - uy * h * bend, my + ux * h * bend, ax + ux * d, ay + uy * d];
}

export type Skeleton = {
  hip: number[];
  shoulder: number[];
  head: number[];
  hand: number[];
  elbow: number[];
  hand2: number[] | null;
  elbow2: number[] | null;
  foot: number[];
  knee: number[];
  foot2: number[] | null;
  knee2: number[] | null;
  shoulderR: number[];
  shoulderL: number[];
  hipR: number[];
  hipL: number[];
};

export function poseAt(demo: Demo, t: number): Skeleton {
  'worklet';
  const n = demo.frames.length - 1;
  const s = Math.min(1, Math.max(0, t)) * n;
  const i = Math.min(Math.floor(s), n - 1);
  const u = s - i;
  const a = demo.frames[i];
  const b = demo.frames[i + 1];
  const mix = (p: number, q: number) => {
    'worklet';
    return p + (q - p) * u;
  };
  const hx = mix(a.hip[0], b.hip[0]);
  const hy = mix(a.hip[1], b.hip[1]);
  const ta = (mix(a.ta, b.ta) * Math.PI) / 180;
  const torso = demo.torso ?? TORSO;
  const sx = hx + Math.cos(ta) * torso;
  const sy = hy + Math.sin(ta) * torso;
  // The head sits along the torso, turned a little towards upright.
  const na = ta + (-Math.PI / 2 - ta) * 0.25;
  const head = [sx + Math.cos(na) * NECK, sy + Math.sin(na) * NECK];

  const sw = demo.front ? SHOULDER_W : 0;
  const hw = demo.front ? HIP_W : 0;
  const shoulderR = [sx + sw, sy];
  const shoulderL = [sx - sw, sy];
  const hipR = [hx + hw, hy];
  const hipL = [hx - hw, hy];

  const hax = mix(a.hand[0], b.hand[0]);
  const hay = mix(a.hand[1], b.hand[1]);
  const arm = solve(shoulderR[0], shoulderR[1], hax, hay, UPPER_ARM, FOREARM, demo.bendArm);
  const fx = mix(a.foot[0], b.foot[0]);
  const fy = mix(a.foot[1], b.foot[1]);
  const leg = solve(hipR[0], hipR[1], fx, fy, THIGH, SHIN, demo.bendLeg);

  let hand2: number[] | null = null;
  let elbow2: number[] | null = null;
  const h2a = a.hand2;
  const h2b = b.hand2;
  if (demo.front || (h2a && h2b)) {
    const tx = h2a && h2b ? mix(h2a[0], h2b[0]) : hx * 2 - hax;
    const ty = h2a && h2b ? mix(h2a[1], h2b[1]) : hay;
    const arm2 = solve(shoulderL[0], shoulderL[1], tx, ty, UPPER_ARM, FOREARM, demo.front ? -demo.bendArm : demo.bendArm);
    elbow2 = [arm2[0], arm2[1]];
    hand2 = [arm2[2], arm2[3]];
  }

  let foot2: number[] | null = null;
  let knee2: number[] | null = null;
  const f2a = a.foot2;
  const f2b = b.foot2;
  if (demo.front || (f2a && f2b)) {
    const tx = f2a && f2b ? mix(f2a[0], f2b[0]) : hx * 2 - fx;
    const ty = f2a && f2b ? mix(f2a[1], f2b[1]) : fy;
    const leg2 = solve(hipL[0], hipL[1], tx, ty, THIGH, SHIN, demo.front ? -demo.bendLeg : (demo.bendLeg2 ?? demo.bendLeg));
    knee2 = [leg2[0], leg2[1]];
    foot2 = [leg2[2], leg2[3]];
  }

  return {
    hip: [hx, hy],
    shoulder: [sx, sy],
    head,
    hand: [arm[2], arm[3]],
    elbow: [arm[0], arm[1]],
    hand2,
    elbow2,
    foot: [leg[2], leg[3]],
    knee: [leg[0], leg[1]],
    foot2,
    knee2,
    shoulderR,
    shoulderL,
    hipR,
    hipL,
  };
}

function line(points: number[][]) {
  'worklet';
  let d = '';
  for (let i = 0; i < points.length; i++) {
    d += `${i === 0 ? 'M' : 'L'}${r1(points[i][0])} ${r1(points[i][1])} `;
  }
  return d;
}

function circle(x: number, y: number, r: number) {
  'worklet';
  return `M${r1(x - r)} ${r1(y)} a${r} ${r} 0 1 0 ${r * 2} 0 a${r} ${r} 0 1 0 ${-r * 2} 0 `;
}

export function pathsAt(demo: Demo, t: number): DemoPaths {
  'worklet';
  const p = poseAt(demo, t);

  let body = line([p.hip, p.shoulder]);
  if (demo.front) {
    body += line([p.shoulderL, p.shoulderR]);
    body += line([p.hipL, p.hipR]);
  }
  body += line([p.shoulderR, p.elbow, p.hand]);
  body += line([p.hipR, p.knee, p.foot]);
  if (p.hand2 && p.elbow2) body += line([p.shoulderL, p.elbow2, p.hand2]);
  if (p.foot2 && p.knee2) body += line([p.hipL, p.knee2, p.foot2]);

  const joint = (name: Joint): number[] => {
    'worklet';
    if (name === 'hand') return p.hand;
    if (name === 'hand2') return p.hand2 ?? p.hand;
    if (name === 'foot') return p.foot;
    if (name === 'foot2') return p.foot2 ?? p.foot;
    if (name === 'hip') return p.hip;
    return p.shoulder;
  };

  let gear = '';
  for (let i = 0; i < demo.props.length; i++) {
    const g = demo.props[i];
    if (g.kind === 'ring') {
      const j = joint(g.at);
      gear += circle(j[0] + (g.dx ?? 0), j[1] + (g.dy ?? 0), g.r);
    } else if (g.kind === 'db') {
      const j = joint(g.at);
      const x = j[0] + (g.dx ?? 0);
      const y = j[1] + (g.dy ?? 0);
      if (g.upright) {
        gear += line([[x, y - 7], [x, y + 7]]) + line([[x - 3.5, y - 7], [x + 3.5, y - 7]]) + line([[x - 3.5, y + 7], [x + 3.5, y + 7]]);
      } else {
        gear += line([[x - 7, y], [x + 7, y]]) + line([[x - 7, y - 3.5], [x - 7, y + 3.5]]) + line([[x + 7, y - 3.5], [x + 7, y + 3.5]]);
      }
    } else if (g.kind === 'barFront') {
      const a = p.hand;
      const b = p.hand2 ?? p.hand;
      const y = (a[1] + b[1]) / 2;
      const left = Math.min(a[0], b[0]);
      const right = Math.max(a[0], b[0]);
      gear += line([[left - 16, y], [right + 16, y]]);
      if (g.plates) {
        gear += line([[left - 12, y - g.plates], [left - 12, y + g.plates]]);
        gear += line([[right + 12, y - g.plates], [right + 12, y + g.plates]]);
      }
    } else if (g.kind === 'link') {
      gear += line([[g.from[0], g.from[1]], joint(g.to)]);
    } else {
      const j = joint(g.at);
      const x = j[0] + (g.dx ?? 0);
      const y = j[1] + (g.dy ?? 0);
      gear += g.upright ? line([[x, y - g.half], [x, y + g.half]]) : line([[x - g.half, y], [x + g.half, y]]);
    }
  }

  return { body, gear, head: circle(p.head[0], p.head[1], HEAD_R) };
}

export const sceneryPath = (demo: Demo) =>
  demo.scenery
    .map((l) => {
      let d = '';
      for (let i = 0; i < l.length; i += 2) d += `${i === 0 ? 'M' : 'L'}${l[i]} ${l[i + 1]} `;
      return d;
    })
    .join('');

export const LIMBS = { UPPER_ARM, FOREARM, THIGH, SHIN };
