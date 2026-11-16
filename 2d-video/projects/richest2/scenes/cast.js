// Персонажи фильма в мультяшном стиле (toon.js). Один образ — на весь фильм.
import { SKIN, C } from './toon.js';
export const MUSA = { skin: SKIN.dark, body: 'robe', col: '#f2c037', col2: '#c8901c', trim: '#ffffff', hat: 'crown', hair: { s: 'none' }, beard: 'short', beardCol: '#1e1612', seed: 2 };
export const SULTAN = { skin: SKIN.tan, body: 'robe', col: '#2f6b8a', trim: C.gold, hat: 'turban', hatCol: '#fbf6ea', hair: { s: 'none' }, beard: 'full', beardCol: '#2b2220', seed: 5 };
export const GUARD = { skin: SKIN.tan, body: 'tunic', col: '#a8322a', col2: '#5a2a1a', hat: 'turban', hatCol: '#e9d8a0', hair: { s: 'none' }, beard: 'moustache', seed: 7 };
export const COURTIER = { skin: SKIN.tan, body: 'robe', col: '#6a8a3a', trim: '#e9d8a0', hat: 'turban', hatCol: '#f2ead8', hair: { s: 'none' }, beard: 'short', seed: 9 };
export const MALIAN = (col, i = 0) => ({ skin: i % 2 ? SKIN.brown : SKIN.dark, body: 'robe', col, trim: '#fbf6ea', hat: 'kufi', hatCol: '#fbf6ea', hair: { s: 'none' }, seed: 11 + i });
export const MERCHANT = (col, i = 0) => ({ skin: [SKIN.tan, SKIN.brown, SKIN.tan][i % 3], body: 'robe', col, trim: '#e9d8a0', hat: i % 2 ? 'fez' : 'turban', hatCol: i % 2 ? '#b8322a' : '#f2ead8', hair: { s: 'none' }, beard: ['full', 'moustache', 'short'][i % 3], seed: 20 + i });
export const UMARI = { skin: SKIN.tan, body: 'robe', col: '#5a4a7a', trim: '#e9d8a0', hat: 'turban', hatCol: '#fbf6ea', hair: { s: 'none' }, beard: 'full', beardCol: '#e9e4da', glasses: false, seed: 31 };
export const KID = { skin: SKIN.light, body: 'tunic', col: '#3a7ad9', col2: '#2a3a5a', hair: { s: 'side', c: '#6a3a1a' }, seed: 41 };
export const CRASSUS = { skin: SKIN.light, body: 'toga', col: '#f4f0e6', trim: '#8a2a5a', hair: { s: 'short', c: '#8a8a8a' }, seed: 51 };
export const ROMAN = (i = 0) => ({ skin: SKIN.light, body: 'tunic', col: ['#a8823a', '#7a8a6a', '#8a5a4a'][i % 3], col2: '#5a3a2a', hair: { s: i % 2 ? 'curly' : 'short', c: '#3a2a1a' }, beard: i % 2 ? 'short' : null, seed: 60 + i });
export const FUGGER = { skin: SKIN.light, body: 'coat', col: '#2b2632', col2: '#1a161e', hat: 'beret', hatCol: '#d9b04a', hair: { s: 'none' }, seed: 71 };
export const EMPEROR = { skin: SKIN.light, body: 'robe', col: '#7a2a3a', trim: C.gold, hat: 'none', hair: { s: 'long', c: '#6a4a2a' }, seed: 72 };
export const ROCKEFELLER = { skin: SKIN.light, body: 'suit', col: '#2a2a33', col2: '#1c1c22', hair: { s: 'bald', c: '#cfc8bc' }, tie: '#2a2a33', hat: 'tophat', seed: 81 };
export const MODERN = { skin: SKIN.light, body: 'tunic', col: '#2b2b30', col2: '#3a4a6a', hair: { s: 'short', c: '#3a2a1a' }, seed: 91 };
