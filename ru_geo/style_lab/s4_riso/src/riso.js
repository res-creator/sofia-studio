// RISO printer: takes a plate canvas (R = Blue ink density, G = Yellow, B = Fluorescent Pink; 0 = paper, 1 = solid)
// and prints it with WebGL2: per-plate misregistration, halftone screens, ink grain, pinholes, feed streaks, roller sweeps.
window.RISO = (() => {
  const VS = `#version 300 es
  in vec2 p; void main(){ gl_Position = vec4(p,0.,1.); }`;
  const FS = `#version 300 es
  precision highp float;
  uniform sampler2D uP; uniform vec2 uRes; uniform vec2 uOff[3]; uniform float uRot[3]; uniform float uSweep[3];
  uniform float uSeed; uniform float uSheet; uniform vec3 uInk[3]; uniform vec3 uPaper; uniform float uAng[3]; uniform float uPer;
  out vec4 o;
  float h(vec2 p){ p = fract(p*vec2(123.34, 456.21)); p += dot(p, p+45.32); return fract(p.x*p.y); }
  float n(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f);
    return mix(mix(h(i),h(i+vec2(1,0)),f.x), mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x), f.y); }
  float fbm(vec2 p){ float s=0., a=.5; for(int k=0;k<4;k++){ s+=a*n(p); p*=2.03; a*=.5; } return s; }
  mat2 R(float a){ float c=cos(a), s=sin(a); return mat2(c,-s,s,c); }
  float dens(int i, vec2 fc){
    vec2 c = uRes*.5; vec2 q = fc - uOff[i]; q = c + R(uRot[i])*(q-c);
    vec4 s = texture(uP, vec2(q.x, uRes.y - q.y)/uRes);   // canvas top-left origin
    return i==0 ? s.r : (i==1 ? s.g : s.b);
  }
  void main(){
    vec2 fc = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y);
    vec3 col = uPaper;
    for(int i=0;i<3;i++){
      float fi = float(i);
      float d = dens(i, fc);
      // halftone, screen anchored to the paper
      vec2 r = R(uAng[i]) * fc / uPer;
      float spot = .5 + .25*(cos(6.28318*r.x) + cos(6.28318*r.y));
      float g = (h(fc*1.37 + vec2(fi*17.1, uSeed)) - .5) * .16 + (n(fc*.35 + fi*40.) - .5) * .12;
      float w = fwidth(spot)*.9 + .015;
      float th = 1. - d;
      float cov = smoothstep(th - w, th + w, spot + g*.6) * step(.02, d);
      cov = mix(cov, 1., smoothstep(.84, .95, d));
      // pinholes in solids
      float ph = n(fc*.55 + vec2(fi*91., uSheet*13.));
      cov *= 1. - .55*smoothstep(.90, .97, ph) * smoothstep(.85, 1., d);
      // ink density: feed streak (stretched along x) + blots + grain
      float streak = n(vec2(fc.x*.003 + fi*7. + uSheet, fc.y*.03));
      float blot = fbm(fc*.006 + vec2(fi*3.3, uSheet*5.1));
      float k = .84 + .06*streak + .10*blot + (h(fc + uSeed*3.1 + fi) - .5)*.10;
      // roller sweep gate (plate arrives left -> right), heavier ink band at the edge
      float edge = uSweep[i] + (n(vec2(fc.y*.018, fi*9.)) - .5)*46.;
      cov *= smoothstep(edge + 3., edge - 3., fc.x);
      k += .16*exp(-max(edge - fc.x, 0.)/55.) * step(fc.x, edge) * step(edge, uRes.x + 200.);
      k = clamp(k, 0., 1.);
      vec3 ink = uInk[i];
      col *= mix(vec3(1.), ink, cov*k);
    }
    // paper fibre + tooth
    col *= 1. + (fbm(fc*vec2(.22,.6) + 3.) - .5)*.045 + (h(fc*.71 + 11.) - .5)*.022;
    o = vec4(col, 1.);
  }`;
  let gl, prog, tex, U = {};
  function init(canvas) {
    gl = canvas.getContext('webgl2', { preserveDrawingBuffer: true, antialias: false });
    const sh = (t, s) => { const x = gl.createShader(t); gl.shaderSource(x, s); gl.compileShader(x); if (!gl.getShaderParameter(x, gl.COMPILE_STATUS)) throw gl.getShaderInfoLog(x); return x; };
    prog = gl.createProgram(); gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(prog);
    gl.useProgram(prog);
    const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    tex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    for (const n of ['uP', 'uRes', 'uOff', 'uRot', 'uSweep', 'uSeed', 'uSheet', 'uInk', 'uPaper', 'uAng', 'uPer']) U[n] = gl.getUniformLocation(prog, n);
  }
  const hex = (s) => [1, 3, 5].map(i => parseInt(s.slice(i, i + 2), 16) / 255);
  function print(plate, o) {
    gl.viewport(0, 0, plate.width, plate.height);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, plate);
    gl.uniform1i(U.uP, 0);
    gl.uniform2f(U.uRes, plate.width, plate.height);
    gl.uniform2fv(U.uOff, o.off.flat());
    gl.uniform1fv(U.uRot, o.rot);
    gl.uniform1fv(U.uSweep, o.sweep);
    gl.uniform1f(U.uSeed, o.seed); gl.uniform1f(U.uSheet, o.sheet || 0);
    gl.uniform3fv(U.uInk, o.inks.map(hex).flat());
    gl.uniform3fv(U.uPaper, hex(o.paper));
    gl.uniform1fv(U.uAng, o.angles.map(a => a * Math.PI / 180));
    gl.uniform1f(U.uPer, o.period);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }
  return { init, print };
})();
