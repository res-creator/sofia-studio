// «Мысленный эксперимент» — «Размеры стран»: Gerard Mercator, his 1569 wall map and the 1595 «Atlas» on the light table.
// Clip time = film time − 44.20 (clip 0 = film 44.20, end = film 78.00). Silent clip; key actions follow the Russian
// narration (film.json captions, film seconds → clip seconds):
//   44.22 «Звали того человека Герард Меркатор.» 0.02 · 46.39 «Большую настенную карту мира он» 2.19
//   48.57 «выпустил в тысяча пятьсот шестьдесят» 4.37 · 51.10 «девятом году, уже живя в немецком» 6.90 · 53.42 «Дуйсбурге.» 9.22
//   54.12 «В её длинном латинском названии есть» 9.92 · 56.61 «слова «исправленная для пользы» 12.41 · 58.68 «мореплавателей».» 14.48
//   59.78 «Это была карта не для школы,» 15.58 · 61.86 «а для штурмана.» 17.66 (ends 62.98 = 18.78)
//   63.69 «В тысяча пятьсот девяносто пятом году,» 19.49 · 66.47 «уже после его смерти,» 22.27
//   68.00 «вышел его труд под названием «Атлас».» 23.80 · 70.71 «Так слово, знакомое каждому по» 26.51
//   72.79 «школьным атласам,» 28.59 · 73.98 «связано с тем самым человеком,» 29.78 · 76.06 «который растянул Гренландию.» 31.86 (ends 33.81)
export const DUR = 33.8;
export const FILM_T0 = 44.20;
export const HIT = {
  lightOn: 0.67,
  name: 0.45, nameLand: 1.0, nameLine: 0.95,   // card «Герард Меркатор» + underline under GERARDI MERCATORIS on the portrait
  glide: 2.0, mapAt: 3.4,                      // glide to the 1569 wall map (sheet 1 of 14)
  map: 2.45, sheet: 2.95,                      // «большая настенная карта мира» · «лист 1 из 14»
  year: 4.5, yearLand: 7.1,                    // 1569 counts up and lands with «девятом году»
  drop1: 7.55, push1: 8.0, push1End: 8.95,     // loupe onto the dedication cartouche; push into the signature line
  sig: 8.35, sigLbl: 8.6,                      // line lights, underline · «Герард Меркатор»
  duis: 9.25,                                  // «уже живя в Дуйсбурге»
  rise1: 9.75, lift1: 10.45,
  title: 10.15, title2: 11.45, quote: 12.45, quote2: 14.5,  // «в длинном латинском названии карты есть слова: «исправленная для пользы мореплавателей»»
  drop2: 15.25, school: 15.75, nav: 17.7, lift2: 18.5,       // loupe on the rhumb lines · «не для школы, — а для штурмана»
  atlasGo: 18.55, atlasAt: 20.35,
  y95: 19.55, y95Land: 21.35, death: 22.3, work: 23.85,     // 1595 · «уже после его смерти» · «вышел его труд»
  drop3: 23.55, push3: 24.0, push3End: 24.95,
  atl: 25.0, atlLbl: 25.75,                    // the word ATLAS lights · «Атлас»
  word: 26.6, school2: 28.65,                  // «так слово, знакомое каждому» · «по школьным атласам»
  rise3: 29.2, lift3: 29.95,
  back: 31.45,                                 // pulled back to the whole table
  arc: 30.55, man: 30.7, man2: 31.9,           // arc ATLAS → portrait · «связано с тем самым человеком,» · «который растянул Гренландию»
};
export const EVENTS = [
  { t: 0.17, k: 'light' }, { t: HIT.name, k: 'label' }, { t: HIT.nameLine, k: 'ring' },
  { t: HIT.map, k: 'label' }, { t: HIT.yearLand, k: 'label' },
  { t: HIT.drop1, k: 'loupe' }, { t: HIT.sig, k: 'ring' }, { t: HIT.sigLbl, k: 'label' }, { t: HIT.duis, k: 'label' },
  { t: HIT.title, k: 'label' }, { t: HIT.lift1, k: 'loupe' }, { t: HIT.quote, k: 'label' }, { t: HIT.quote2, k: 'label' },
  { t: HIT.drop2, k: 'loupe' }, { t: HIT.school, k: 'label' }, { t: HIT.nav, k: 'label' }, { t: HIT.lift2, k: 'loupe' },
  { t: HIT.y95, k: 'label' }, { t: HIT.y95Land, k: 'label' }, { t: HIT.death, k: 'label' },
  { t: HIT.drop3, k: 'loupe' }, { t: HIT.work, k: 'label' }, { t: HIT.atl, k: 'ring' }, { t: HIT.atlLbl, k: 'label' },
  { t: HIT.word, k: 'label' }, { t: HIT.school2, k: 'label' }, { t: HIT.lift3, k: 'loupe' },
  { t: HIT.arc + 0.6, k: 'ring' }, { t: HIT.man, k: 'label' }, { t: HIT.man2, k: 'label' },
];
