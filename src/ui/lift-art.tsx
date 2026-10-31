import { View } from "react-native";
import Svg, { Circle, Polyline, Rect } from "react-native-svg";

// One simple line figure per lift and per workout (decisions #8 and #14): our own drawings in
// the app's style, never copied, never one drawing for two lifts. Drawn so far: Lena's 8 lifts
// and her two workouts; everything else shows a neutral dumbbell until the art task draws it.
// Each drawing is lines (polylines with round ends), heads (circles) and plates (rects) on a
// 120 x 100 grid.

type Drawing = {
  lines: number[][];
  heads?: [number, number][];
  plates?: [number, number, number][];
};

const drawings: Record<string, Drawing> = {
  // Bench Press: lying on the bench, feet down, bar over the chest.
  e1: {
    lines: [
      [14, 78, 98, 78],
      [26, 78, 22, 94],
      [86, 78, 86, 92],
      [82, 70, 46, 70, 34, 56, 26, 92],
      [78, 70, 74, 34],
      [70, 70, 66, 34],
      [54, 30, 106, 30],
    ],
    heads: [[90, 66]],
    plates: [
      [60, 30, 22],
      [100, 30, 22],
    ],
  },
  // Incline DB Press: on a slanted bench, one dumbbell straight up.
  e2: {
    lines: [
      [30, 92, 80, 54],
      [40, 82, 76, 48],
      [40, 82, 26, 84, 22, 96],
      [74, 50, 70, 20],
      [60, 18, 82, 18],
    ],
    heads: [[84, 40]],
    plates: [
      [62, 18, 14],
      [80, 18, 14],
    ],
  },
  // Overhead Press: standing, bar locked out overhead.
  e3: {
    lines: [
      [60, 44, 60, 72],
      [60, 72, 52, 96],
      [60, 72, 68, 96],
      [60, 48, 44, 40, 46, 16],
      [60, 48, 76, 40, 74, 16],
      [26, 16, 94, 16],
    ],
    heads: [[60, 34]],
    plates: [
      [32, 16, 18],
      [88, 16, 18],
    ],
  },
  // Triceps Pushdown: at the cable tower, elbows in, handle pushed down.
  e4: {
    lines: [
      [94, 8, 94, 96],
      [70, 10, 94, 10],
      [72, 10, 72, 62],
      [64, 62, 82, 62],
      [45, 34, 47, 66],
      [47, 66, 42, 96],
      [47, 66, 54, 96],
      [46, 38, 52, 56, 68, 62],
    ],
    heads: [[45, 25]],
  },
  // Pull-up: hanging from the bar, chin coming up.
  e5: {
    lines: [
      [24, 12, 96, 12],
      [44, 12, 46, 32, 56, 40],
      [76, 12, 74, 32, 64, 40],
      [60, 38, 60, 66],
      [60, 66, 52, 80, 56, 94],
      [60, 66, 68, 80, 64, 94],
    ],
    heads: [[60, 28]],
  },
  // Barbell Row: hinged forward, bar pulled to the belly.
  e6: {
    lines: [
      [40, 58, 78, 44],
      [40, 58, 50, 76, 42, 96],
      [40, 58, 34, 78, 28, 96],
      [76, 46, 70, 60, 74, 72],
      [48, 74, 104, 74],
    ],
    heads: [[88, 40]],
    plates: [
      [54, 74, 18],
      [98, 74, 18],
    ],
  },
  // Face Pull: rope from a high pulley to the face, elbows high.
  e7: {
    lines: [
      [16, 8, 16, 96],
      [16, 30, 66, 36],
      [82, 36, 84, 66],
      [84, 66, 76, 96],
      [84, 66, 92, 96],
      [82, 40, 96, 30, 72, 36],
    ],
    heads: [[80, 26]],
  },
  // Biceps Curl: standing, one dumbbell curled up, one down.
  e8: {
    lines: [
      [55, 32, 55, 66],
      [55, 66, 48, 96],
      [55, 66, 62, 96],
      [55, 36, 60, 56, 74, 42],
      [68, 42, 82, 42],
      [55, 36, 48, 62],
      [40, 66, 56, 66],
    ],
    heads: [[55, 22]],
    plates: [
      [70, 42, 12],
      [80, 42, 12],
      [42, 66, 12],
      [54, 66, 12],
    ],
  },
  // Push (workout): leaning into a wall, pushing it away.
  w1: {
    lines: [
      [104, 10, 104, 96],
      [28, 96, 76, 46],
      [74, 50, 102, 46],
      [70, 54, 102, 58],
      [16, 96, 40, 96],
    ],
    heads: [[84, 38]],
  },
  // Pull (workout): leaning back, pulling a rope towards you.
  w2: {
    lines: [
      [54, 70, 40, 40],
      [54, 70, 66, 82, 62, 96],
      [54, 70, 50, 84, 44, 96],
      [42, 46, 66, 52],
      [44, 52, 66, 58],
      [62, 55, 112, 60],
    ],
    heads: [[34, 30]],
  },
};

// The stand-in for lifts without their own drawing yet: a plain dumbbell.
const placeholder: Drawing = {
  lines: [[36, 50, 84, 50]],
  plates: [
    [40, 50, 30],
    [80, 50, 30],
    [30, 50, 18],
    [90, 50, 18],
  ],
};

export const hasDrawing = (id: string) => id in drawings;

type Props = { id: string; color: string; width: number };

// Decorative: the name next to it always says what it is.
export function LiftArt({ id, color, width }: Props) {
  const d = drawings[id] ?? placeholder;
  const sw = 7;
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Svg width={width} height={(width * 100) / 120} viewBox="0 0 120 100">
        {d.lines.map((l, i) => (
          <Polyline
            key={i}
            points={l.join(" ")}
            fill="none"
            stroke={color}
            strokeWidth={sw}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
        {(d.heads ?? []).map(([cx, cy], i) => (
          <Circle key={`h${i}`} cx={cx} cy={cy} r={8} fill={color} />
        ))}
        {(d.plates ?? []).map(([cx, cy, h], i) => (
          <Rect
            key={`p${i}`}
            x={cx - 4}
            y={cy - h / 2}
            width={8}
            height={h}
            rx={3}
            fill={color}
          />
        ))}
      </Svg>
    </View>
  );
}
