// «Мысленный эксперимент» — «Размер Вселенной»: the Hubble Ultra Deep Field (and Webb's first deep field) on the light table.
// Clip time = film time − 318.50 (clip 0 = film 318.50, end = film 359.80). Silent clip; key actions follow the Russian
// narration (film.json captions, film seconds → clip seconds):
//   318.50 «Теперь телескоп «Хаббл».» 0.00 · 320.36 «Однажды его направили на крошечный» 1.86 · 322.71 «тёмный участок неба,» 4.21
//   324.09 «в десять раз уже полной Луны,» 5.59 · 326.10 «и снимали больше одиннадцати суток.» 7.60
//   328.52 «На кадре почти десять тысяч галактик.» 10.02 · 331.07 «Вояджер за сорок девять лет улетел на» 12.57
//   333.44 «сутки света, а этот снимок смотрит на» 14.94 · 335.82 «миллиарды лет назад.» 17.32
//   337.80 «Самые далёкие галактики на этом снимке» 19.30 · 340.57 «видны такими, какими были примерно» 22.07
//   343.04 «через пятьсот-восемьсот миллионов лет» 24.54 · 345.74 «после начала Вселенной.» 27.24
//   347.41 «Свет этих галактик вышел в путь,» 28.91 · 349.88 «когда Земли ещё не было.» 31.38
//   351.73 «Каждая точка на кадре это целая» 33.23 · 354.05 «галактика со своими звёздами.» 35.55
//   356.22 «А телескоп «Уэбб» с тех пор увидел» 37.72 · 358.45 «галактики ещё старше.» 39.95 (ends 359.82)
export const DUR = 41.3;
export const FILM_T0 = 318.50;
export const HIT = {
  lightOn: 0.67,
  hubble: 0.55,                 // card «снимок телескопа «Хаббл»»
  patch: 4.25,                  // the tiny square on the table + lines to the print       «крошечный тёмный участок неба»
  patchLbl: 4.45,
  moon: 5.9, moonLbl: 6.5,      // full-Moon circle, «в 10 раз уже полной Луны»
  diagOut: 7.4,
  days: 7.75, daysLand: 9.4,    // «снимали больше 11 суток»
  glide: 9.6, drop: 10.4,       // loupe lands on the print
  gal: 10.2, galLand: 11.9,     // «почти 10 000 галактик»
  voy: 12.75, voyLight: 15.0,   // «Вояджер» за 49 лет — сутки света
  look: 15.7, lookPast: 17.35,  // этот снимок — миллиарды лет назад
  stopA: 12.9, stopB: 14.2, stopB2: 15.9, stopC: 17.3,   // the loupe slides from galaxy to galaxy
  push: 19.3, pushEnd: 20.8,    // into the lens, onto the faintest red dots
  far: 20.9, farLbl: 21.2,      // rings + «самые далёкие галактики»
  seen: 22.15, approx: 23.9, num: 24.7, mln: 25.6, after: 27.3,  // «видны такими, какими были · примерно через · 500–800 · млн лет · после начала Вселенной»
  light: 29.0, noEarth: 31.45,  // «свет вышел в путь, · когда Земли ещё не было»
  rise: 33.25, lift: 34.15,     // back to the whole print
  dots: 34.55, dotsLbl: 35.6,    // a ring on dot after dot · «каждая точка — целая галактика»
  webbGo: 37.5, webb: 38.3, older: 39.95,   // glide to Webb's first deep field · «телескоп «Уэбб»» · «увидел галактики ещё старше»
};
export const EVENTS = [
  { t: 0.17, k: 'light' }, { t: HIT.hubble, k: 'label' }, { t: HIT.patch, k: 'ring' }, { t: HIT.patchLbl, k: 'label' },
  { t: HIT.moon, k: 'ring' }, { t: HIT.moonLbl, k: 'label' }, { t: HIT.days, k: 'label' }, { t: HIT.daysLand, k: 'label' },
  { t: HIT.drop, k: 'loupe' }, { t: HIT.gal, k: 'label' }, { t: HIT.galLand, k: 'label' },
  { t: HIT.voy, k: 'label' }, { t: HIT.voyLight, k: 'label' }, { t: HIT.look, k: 'label' }, { t: HIT.lookPast, k: 'label' },
  { t: HIT.far, k: 'ring' }, { t: HIT.far + 0.35, k: 'ring' }, { t: HIT.far + 0.7, k: 'ring' }, { t: HIT.farLbl, k: 'label' },
  { t: HIT.seen, k: 'label' }, { t: HIT.num, k: 'label' }, { t: HIT.after, k: 'label' },
  { t: HIT.light, k: 'label' }, { t: HIT.noEarth, k: 'label' }, { t: HIT.lift, k: 'loupe' },
  { t: HIT.dots, k: 'ring' }, { t: HIT.dotsLbl, k: 'label' }, { t: HIT.webb, k: 'label' }, { t: HIT.older, k: 'label' },
];
