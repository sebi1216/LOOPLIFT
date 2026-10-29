// Demo data and the data "service" for slice 1. Screens call these functions, never a backend.
// When a real backend comes (for example Supabase), only this folder changes, not the screens.

// CAST (story bible light): the same few made-up people and things on every screen, test and
// screenshot, so screens tell one consistent story. /kickoff replaces them with a cast that fits
// the app (2 or 3 personas, one hero content set). Rules: invented names only, no real people,
// no real emails or photos. Change the cast here, never inline in a screen.
export const cast = {
  hero: { id: 'u1', name: 'Alex', role: 'the main user, opens the app every day' },
  friend: { id: 'u2', name: 'Kai', role: 'a friend who shares things with Alex' },
  newcomer: { id: 'u3', name: 'Sam', role: 'just installed the app, sees empty states' },
} as const;

export type DemoItem = {
  id: string;
  title: string;
  subtitle: string;
};

const items: DemoItem[] = [
  { id: '1', title: `${cast.hero.name}'s first item`, subtitle: 'Replace with the hero content set from docs/brief.md' },
  { id: '2', title: `${cast.friend.name} shared this`, subtitle: 'Fixed data, so screenshots stay the same' },
  { id: '3', title: `Welcome, ${cast.newcomer.name}`, subtitle: 'Invented cast only, no real people' },
];

export function getDemoItems(): DemoItem[] {
  return items;
}
