import { cast, getDemoItems } from './demo';

test('demo items have unique ids and a title', () => {
  const items = getDemoItems();
  expect(items.length).toBeGreaterThan(0);
  expect(new Set(items.map((i) => i.id)).size).toBe(items.length);
  for (const item of items) expect(item.title.length).toBeGreaterThan(0);
});

test('the cast has unique ids and names', () => {
  const people = Object.values(cast);
  expect(new Set(people.map((p) => p.id)).size).toBe(people.length);
  expect(new Set(people.map((p) => p.name)).size).toBe(people.length);
});
