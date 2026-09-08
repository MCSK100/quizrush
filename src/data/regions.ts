export interface Region {
  id: string;
  name: string;
  icon: string;
  scope: 'global' | 'country' | 'state';
}

export const REGIONS: Region[] = [
  { id: 'global', name: 'Global', icon: '🌍', scope: 'global' },
  { id: 'india', name: 'India', icon: '🇮🇳', scope: 'country' },
];

export const INDIAN_STATES: Region[] = [
  { id: 'tamil-nadu', name: 'Tamil Nadu', icon: '🏛️', scope: 'state' },
  { id: 'kerala', name: 'Kerala', icon: '🌴', scope: 'state' },
  { id: 'karnataka', name: 'Karnataka', icon: '🏰', scope: 'state' },
  { id: 'andhra-pradesh', name: 'Andhra Pradesh', icon: '🏞️', scope: 'state' },
  { id: 'telangana', name: 'Telangana', icon: '🏙️', scope: 'state' },
  { id: 'maharashtra', name: 'Maharashtra', icon: '⛰️', scope: 'state' },
  { id: 'gujarat', name: 'Gujarat', icon: '🦁', scope: 'state' },
  { id: 'rajasthan', name: 'Rajasthan', icon: '🐪', scope: 'state' },
  { id: 'punjab', name: 'Punjab', icon: '🌾', scope: 'state' },
  { id: 'delhi', name: 'Delhi', icon: '🕌', scope: 'state' },
  { id: 'uttar-pradesh', name: 'Uttar Pradesh', icon: '🛕', scope: 'state' },
  { id: 'west-bengal', name: 'West Bengal', icon: '🎭', scope: 'state' },
];

export function regionById(id: string | undefined): Region | undefined {
  if (!id || id === 'global') return REGIONS[0];
  return [...REGIONS, ...INDIAN_STATES].find((r) => r.id === id);
}

export function regionLabel(id: string | undefined): string {
  return regionById(id)?.name ?? 'Global';
}

export function regionPrompt(id: string | undefined): string {
  const r = regionById(id);
  if (!r || r.scope === 'global') return '';
  if (r.scope === 'country') {
    return ' Focus on India: its states, history, geography, culture, sports, cinema and current affairs.';
  }
  return ` Focus on ${r.name}, India: its districts and cities, history, geography, culture, festivals, sports, cinema and famous people.`;
}
