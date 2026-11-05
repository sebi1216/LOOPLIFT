// Weight units. Sets are always saved in kg; pounds are for showing and typing. A weight typed in
// pounds is kept to the gram, so 135 lb still reads as exactly 135 lb later. Pure, like tracker.ts.
import { parseKg } from './tracker';

export type Unit = 'kg' | 'lb';

const KG_PER_LB = 0.45359237;

export const otherUnit = (u: Unit): Unit => (u === 'kg' ? 'lb' : 'kg');

export const lbToKg = (lb: number) => Math.round(lb * KG_PER_LB * 1000) / 1000;

export const kgToLb = (kg: number) => kg / KG_PER_LB;

// What a weight reads as: kg to 0.1, pounds to the nearest half.
export function inUnit(kg: number, unit: Unit): number {
  return unit === 'kg' ? Math.round(kg * 10) / 10 : Math.round(kgToLb(kg) * 2) / 2;
}

// Typed text back to kg, with the same rules in both units (parseKg): half steps up to 999.5.
export function parseWeight(text: string, unit: Unit): number | null {
  const n = parseKg(text);
  if (n === null) return null;
  return unit === 'kg' ? n : lbToKg(n);
}
