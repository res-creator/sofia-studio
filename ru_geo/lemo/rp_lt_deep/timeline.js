// «Мысленный эксперимент» — «Отдалённые места»: Challenger Deep — the bathyscaphe «Trieste» (1960) and HMS Challenger (1872).
// Clip time = film time − 316.65 (clip 0 = film 316.65, end = film 341.59). Silent clip; key actions follow the Russian
// narration (film.json captions, film seconds → clip seconds):
//   316.65 «Люди там бывали: в тысяча девятьсот» 0.00 · 319.31 «шестидесятом, в две тысячи двенадцатом» 2.66
//   322.19 «и в две тысячи девятнадцатом, и позже.» 5.54 · 325.08 «Но спускались считаные единицы.» 8.43 (ends 327.00 = 10.35)
//   327.72 «Название впадине дали по британскому» 11.07 · 330.25 «кораблю «Челленджер»:» 13.60
//   331.73 «его экипаж впервые измерил здесь» 15.08 · 333.98 «глубину в тысяча восемьсот семьдесят» 17.33
//   336.51 «пятом году.» 19.86 · 337.28 «Вниз и вверх одинаково безлюдно,» 20.63 · 340.04 «только по-разному.» 23.39 (ends 24.94)
export const DUR = 24.94;
export const FILM_T0 = 316.65;
export const HIT = {
  lightOn: 0.67,
  people: 0.3,                                 // card «люди там бывали»
  drop1: 1.2, push1: 1.6, push1End: 2.5,       // loupe onto the «TRIESTE» sign on the tower; push in
  y60: 1.3, y60Land: 3.0,                      // 1960 counts up, lands with «шестидесятом»
  sign: 2.55, signLbl: 2.85,                   // the sign lights, underline · «батискаф «Триест»»
  y12: 4.45,                                   // «в две тысячи двенадцатом»
  rise1: 5.0, lift1: 5.6,
  drop2: 6.45, y19: 6.75, later: 7.75,          // loupe on the sea below the hull · «в две тысячи девятнадцатом» · «и позже»
  few: 8.55, few2: 9.25, lift2: 9.75,          // «но спускались» · «считаные единицы»
  chAt: 11.3,                                  // glide to the Challenger engraving
  name: 11.25, name2: 12.75,                   // «название впадине дали» · «по британскому кораблю»
  drop3: 13.0, push3: 13.4, push3End: 14.3,    // loupe onto the hull; push in
  hull: 14.25, ship: 14.4,                     // the hull lights · «корабль «Челленджер»»
  crew: 15.2, crew2: 16.1,                     // «его экипаж впервые» · «измерил здесь глубину»
  y75: 17.4, y75Land: 19.95,                   // 1875 counts up, lands with «пятом году»
  rise3: 20.25, lift3: 20.95,
  back: 22.3,                                  // pulled back to the whole table
  tags: 21.9,                                  // index tags on both prints
  up: 20.75, up2: 23.45,                       // «вниз и вверх одинаково безлюдно,» · «только по-разному»
};
export const EVENTS = [
  { t: 0.17, k: 'light' }, { t: HIT.people, k: 'label' },
  { t: HIT.drop1, k: 'loupe' }, { t: HIT.y60Land, k: 'label' }, { t: HIT.sign, k: 'ring' }, { t: HIT.signLbl, k: 'label' },
  { t: HIT.y12, k: 'label' }, { t: HIT.lift1, k: 'loupe' },
  { t: HIT.drop2, k: 'loupe' }, { t: HIT.y19, k: 'label' }, { t: HIT.later, k: 'label' },
  { t: HIT.few, k: 'label' }, { t: HIT.few2, k: 'label' }, { t: HIT.lift2, k: 'loupe' },
  { t: HIT.name, k: 'label' }, { t: HIT.name2, k: 'label' },
  { t: HIT.drop3, k: 'loupe' }, { t: HIT.hull, k: 'ring' }, { t: HIT.ship, k: 'label' },
  { t: HIT.crew, k: 'label' }, { t: HIT.crew2, k: 'label' }, { t: HIT.y75Land, k: 'label' }, { t: HIT.lift3, k: 'loupe' },
  { t: HIT.up, k: 'label' }, { t: HIT.tags, k: 'ring' }, { t: HIT.tags + 0.25, k: 'label' }, { t: HIT.up2, k: 'label' },
];
