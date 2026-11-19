// cast.js — the whole film's cast. ONE signature colour per recurring character (see story/bible.md).
// Hats that the rig cannot draw (officer cap, pilotka, naval cap, flight helmet, headset, lei) are drawn by lib.js helpers.
export const PETROV = { top: 'suit', color: '#3fb950', color2: '#24733a', head: 'none' };            // green tunic + green cap (officerCap)
export const ARKHIPOV = { top: 'suit', color: '#2f5fb3', color2: '#1d3c78', head: 'none' };          // navy tunic + navy pilotka (pilotka)
export const SUBCMD = { top: 'none', head: 'none' };                                                 // sub commander: ink + white cap cover (navalCap)
export const ZAMPOLIT = { top: 'none', head: 'none' };
export const CREW = { top: 'none', head: 'none' };                                                   // plain ink silhouettes
export const SCI = { top: 'labcoat', face: 'glasses', head: 'none' };                                // the scientist
export const SCI2 = { top: 'labcoat', head: 'bun', headColor: '#141420' };                           // the "other model" scientist
export const TRAMGIRL = { top: 'dress', color: '#2a2633', head: 'headband', headColor: '#f2c21a', kid: true }; // ONE yellow detail
export const CHIEF = { top: 'none', head: 'curly', headColor: '#cfc8bc' };                           // + lei (coral-orange)
export const GOVERNOR = { top: 'suit', color: '#ece8df', color2: '#bdb6a8', head: 'none' };          // white uniform + white cap
export const SHOUP = { top: 'suit', color: '#6f9fd8', color2: '#3f6aa8', head: 'none' };             // never a bigFace
export const KID = { top: 'hoodie', color: '#d64a33', head: 'none', kid: true };
export const ADVISER = { top: 'tshirt', color: '#8a5ad6', head: 'none' };
export const VIEWER = { top: 'tshirt', color: '#3a6ea5', head: 'none' };
export const COL = { petrov: '#3fb950', arkhipov: '#2f5fb3', yellow: '#f2c21a', lei: '#ff8a4c', shoup: '#6f9fd8', oleander: '#ff8fb4', cold: '#7fb2ff' };
export const CAST = [PETROV, ARKHIPOV, SCI, SCI2, TRAMGIRL, CHIEF, GOVERNOR, SHOUP, KID, ADVISER, VIEWER];
// Figure presets by id (used by templates' `who` param): outfit + hat helper name
export const WHO = {
  petrov: { outfit: PETROV, hat: 'officerCap' },
  arkhipov: { outfit: ARKHIPOV, hat: 'pilotka' },
  subcmd: { outfit: SUBCMD, hat: 'navalCap' },
  zampolit: { outfit: ZAMPOLIT, hat: 'none' },
  crew: { outfit: CREW, hat: 'none' },
  pilot: { outfit: CREW, hat: 'flightHelmet' },
  duty: { outfit: CREW, hat: 'headset' },
  sci: { outfit: SCI, hat: 'none' },
  sci2: { outfit: SCI2, hat: 'none' },
  tramgirl: { outfit: TRAMGIRL, hat: 'none' },
  chief: { outfit: CHIEF, hat: 'lei' },
  governor: { outfit: GOVERNOR, hat: 'whiteCap' },
  shoup: { outfit: SHOUP, hat: 'officerCapBlue', noFace: true },
  kid: { outfit: KID, hat: 'none' },
  adviser: { outfit: ADVISER, hat: 'none' },
  viewer: { outfit: VIEWER, hat: 'none' },
};
