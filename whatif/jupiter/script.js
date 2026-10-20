// "What if you fell into Jupiter?" — one line per shot. [id, scene, text]. Text is English only, spoken by the dummy.
module.exports = [
  ['l01', 'hook', 'What if you fell into Jupiter?'],
  ['l02', 'hook2', "I'm a crash-test dummy. So... I checked."],
  ['l03', 'gas', "First problem: there's no ground! Jupiter is a giant ball of gas. Mostly hydrogen and helium."],
  ['l04', 'speed', "Its gravity pulls me in at sixty kilometers per second. That's New York to LA in about one minute!"],
  ['l05', 'fire', 'The air hits me so hard, I glow like a meteor. Hot! Hot! Hot!'],
  ['l06', 'cold', "Then... it's freezing. Minus one hundred forty-five degrees. And these clouds are made of ammonia. Toilet-cleaner clouds. Great."],
  ['l07', 'storm', 'Oh no. The Great Red Spot. A storm bigger than the whole Earth. Wheee!'],
  ['l08', 'probe', 'In nineteen ninety-five, NASA dropped a probe into Jupiter. It lasted fifty-eight minutes. Then the heat and pressure destroyed it.'],
  ['l09', 'press', 'Me? I keep falling. The pressure squeezes me like a soda can... under a thousand elephants.'],
  ['l10', 'metal', "Deep inside, it's hotter than the surface of the Sun. And hydrogen turns into liquid metal. An ocean of it!"],
  ['l11', 'bottom', 'And the bottom? There is no bottom. I just... become part of Jupiter.'],
  ['l12', 'rebuilt', "Good news: I'm a dummy. They rebuilt me."],
  ['l13', 'cta', 'So... should I fall into the Sun next, or into a black hole? Tell me in the comments!'],
];
if (require.main === module) { const L = module.exports; console.log(L.length, 'lines,', L.reduce((a, l) => a + l[2].length, 0), 'chars'); }
