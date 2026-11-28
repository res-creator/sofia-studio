// «Мысленный эксперимент» — «Как создать свою страну?»: Sealand, 1978 — the mercenaries, the son of Roy Bates retakes the
// platform, Germany sends a diplomat. Two real photos on the table: Sealand from a helicopter (Ryan Lackey, 1999, CC BY 2.0)
// and the fort Roughs Tower in silhouette (David P Howard, 1984, CC BY-SA 2.0). No photo of the people (none clearly free).
// Clip time = film time − 463.81 (clip 0 = film 463.81, end = film 482.70). Silent clip; key actions follow the narration
// (film.json captions, film seconds → clip seconds):
//   463.81 «Помнишь катер?» 0.00 · 464.65 «В тысяча девятьсот семьдесят восьмом в» 0.84 · 467.29 «Силенд пришли наёмники,» 3.48
//   468.89 «нанятые человеком,» 5.08 · 470.14 «который называл себя премьером.» 6.33
//   472.30 «Сын Бейтса отбил платформу и взял» 8.49 · 474.81 «нападавших в плен.» 11.00
//   476.18 «Германия прислала дипломата ради» 12.37 · 478.23 «одного из них.» 14.42
//   479.13 «Силенд считает это признанием,» 15.32 · 481.36 «другие страны нет.» 17.55 (ends 482.70 = 18.89)
export const DUR = 18.89;
export const FILM_T0 = 463.81;
export const HIT = {
  lightOn: 0.67,
  boat: 0.3,                                   // card «помнишь катер?»
  y78: 1.0, y78Land: 3.0,                      // 1978 counts up, lands with «семьдесят восьмом»
  drop1: 3.05, ring1: 3.35, lbl1: 3.5,         // loupe onto the platform in the aerial photo · «Силенд»
  merc: 3.75,                                  // «в Силенд пришли наёмники»
  hired: 5.1, prem: 6.45,                      // «нанятые человеком,» · «который называл себя премьером»
  lift1: 7.45, outA: 7.9,
  drop2: 8.55, trace: 8.85, lbl2: 9.5,         // loupe onto the fort's deck (silhouette) · outline traced · «платформа»
  son: 8.6, took: 9.35, capt: 10.85,           // «сын Бейтса» · «отбил платформу» · «и взял нападавших в плен»
  lift2: 11.95,
  de: 12.4, one: 14.45, outC: 15.0,            // «Германия прислала дипломата» · «ради одного из них»
  rec: 15.35, no: 17.55,                       // «Силенд считает это признанием,» · «другие страны — нет»
  back: 16.4,                                  // pulled back to the whole table
};
export const EVENTS = [
  { t: 0.17, k: 'light' }, { t: HIT.boat, k: 'label' }, { t: HIT.y78Land, k: 'label' },
  { t: HIT.drop1, k: 'loupe' }, { t: HIT.ring1, k: 'ring' }, { t: HIT.lbl1, k: 'label' }, { t: HIT.merc, k: 'label' },
  { t: HIT.hired, k: 'label' }, { t: HIT.prem, k: 'label' }, { t: HIT.lift1, k: 'loupe' },
  { t: HIT.drop2, k: 'loupe' }, { t: HIT.son, k: 'label' }, { t: HIT.trace, k: 'ring' }, { t: HIT.took, k: 'label' },
  { t: HIT.lbl2, k: 'label' }, { t: HIT.capt, k: 'label' }, { t: HIT.lift2, k: 'loupe' },
  { t: HIT.de, k: 'label' }, { t: HIT.one, k: 'label' }, { t: HIT.rec, k: 'label' }, { t: HIT.no, k: 'label' },
];
