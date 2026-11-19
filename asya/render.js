// node asya/render.js ep1            -> asya/out/ep1.mp4
// node asya/render.js ep1 1,5,9      -> stills asya/out/ep1_<t>.png
const path = require('path'), fs = require('fs');
const {render} = require('./engine');
const EP = require('./episodes');
const id = process.argv[2] || 'ep1', stills = process.argv[3];
if (!EP[id]) { console.error('unknown episode', id, Object.keys(EP)); process.exit(1); }
const outDir = path.join(__dirname, 'out'); fs.mkdirSync(outDir, {recursive: true});
render(EP[id], path.join(outDir, `${id}.mp4`), stills ? stills.split(',').map(Number) : null).then(f => console.log(f.join('\n')));
