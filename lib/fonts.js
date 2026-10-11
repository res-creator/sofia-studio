const {GlobalFonts}=require('@napi-rs/canvas');const f=__dirname+'/../node_modules/@fontsource/';
for (const w of [700,800,900]) { GlobalFonts.registerFromPath(f+`nunito/files/nunito-latin-${w}-normal.woff2`,'NunitoL'); GlobalFonts.registerFromPath(f+`nunito/files/nunito-cyrillic-${w}-normal.woff2`,'NunitoC'); }
for (const w of [500,600,700]) GlobalFonts.registerFromPath(f+`fredoka/files/fredoka-latin-${w}-normal.woff2`,'FredokaL');
module.exports={RU:'NunitoL, NunitoC', EN:'FredokaL, NunitoC'};
