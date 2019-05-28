let gl = null;
let vertexShaderSource = null, fragmentShaderSource = null;
let vertexShader = null, fragmentShader = null, prog = null;
let buffer = null;
let matrixLocation = null;
let colorLocation = null;
let scaleValue = 5;
let translateX = 0;
let translateY = 0;
let translateZ = 0;

let showd1 = true;
let showd2 = true;

let pointCountValue = 200;

let time = 0;

window.addEventListener('load', async (event) => {
  const canvas = document.getElementById('drawable');
  gl = canvas.getContext('gl') || canvas.getContext("experimental-webgl");

  if (!gl || !(gl instanceof WebGLRenderingContext)) {
    alert('Your browser does not support WebGL');

    return;
  }

  globalThis.gl = gl;

  window.addEventListener('resize', (event) => {
    gl = canvas.getContext('gl') || canvas.getContext("experimental-webgl");
    globalThis.gl = gl;
    if (!gl || !(gl instanceof WebGLRenderingContext)) {
      alert('Your browser does not support WebGL');

      return;
    }
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

  });

  document.querySelector('body').appendChild(canvas);

  prog = await glProgramFrom('vert.glsl', 'frag.glsl').catch(error => console.log(error.message));

  globalThis.positionAttributeLocation = gl.getAttribLocation(prog, "in_vert");
  matrixLocation = gl.getUniformLocation(prog, 'u_matrix');
  colorLocation = gl.getUniformLocation(prog, 'in_color');

  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;

  const derivative = new RowMatrix(3);
  derivative.set(0, simple5.d0);
  derivative.set(1, simple5.d1);
  derivative.set(2, simple5.d2);

  globalThis.parametricCurve = new ParametricCurve3(derivative, simple5.uMin, simple5.uMax);

  let cyclicCurve = new CyclicCurve3(3);
  cyclicCurve.set(0, new DCoordinate3(0, 1, 0));
  cyclicCurve.set(1, new DCoordinate3(0, 0.5, 0.5 * Math.sqrt(3)));
  cyclicCurve.set(2, new DCoordinate3(0, -0.5, 0.5 * Math.sqrt(3)));
  cyclicCurve.set(3, new DCoordinate3(0, -1, 0));
  cyclicCurve.set(4, new DCoordinate3(1, -0.5, -0.5 * Math.sqrt(3)));
  cyclicCurve.set(5, new DCoordinate3(1, 0.5, -0.5 * Math.sqrt(3)));
  cyclicCurve.set(6, cyclicCurve.at(0));

  cyclicCurve.updateVertexBufferObjectsOfData();

  globalThis.cyclicCurve = cyclicCurve;

  let cyclicCurveImage = cyclicCurve.generateImage(2, 500);
  cyclicCurveImage.updateVertexBufferObjects(gl.STATIC_DRAW);
  let cyclicInterpolatedImage = null;

  let curvePointsToInterpolate = new ColumnMatrix(7, DCoordinate3);

  for (let i = 0; i < 6 + 1; ++i) {
    curvePointsToInterpolate.set(i, cyclicCurve.at(i));
  }

  let knotVector = new ColumnMatrix(6 + 1);

  for (let i = 0; i < 6 + 1; ++i) {
    knotVector.set(i, 2 * Math.PI * (i / 7));
  }

  if (cyclicCurve.updateDataForInterpolation(knotVector, curvePointsToInterpolate)) {
    cyclicInterpolatedImage = cyclicCurve.generateImage(0, 200);
    if (cyclicInterpolatedImage) {
      cyclicInterpolatedImage.updateVertexBufferObjects(gl.STATIC_DRAW);
    }
  }

  globalThis.genericCurve = cyclicCurveImage;
  globalThis.cyclicInterpolatedImage = cyclicInterpolatedImage;

  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);
  gl.enable(gl.BLEND);

  drawFrame();
});

function drawFrame() {
  globalThis.gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  globalThis.gl.clearColor(0.0, 0.0, 0.0, 1);
  globalThis.gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  const cameraPos = [cos(time / 100) * scaleValue, sin(time / 100) * scaleValue, sin(time / 100) * scaleValue];
  let proj = perspective(degToRad(45.0), gl.canvas.width / gl.canvas.height, 1.0, 1000.0);

  const lookat = inverse(lookAt(
    cameraPos,
    [0.0, 0.0, 0.0],
    [0.0, 0.0, 1.0]
  ));

  proj = translate(proj, translateX, translateY, translateZ);

  globalThis.gl.useProgram(prog);
  globalThis.gl.uniformMatrix4fv(matrixLocation, false, multiply(proj, lookat))
  globalThis.gl.enableVertexAttribArray(globalThis.positionAttributeLocation);

  if (showd1) {
    gl.uniform4fv(colorLocation, new Float32Array([0.0, 0.5, 0.0, 1.0]));
    globalThis.genericCurve.renderDerivatives(1, gl.LINES);
    gl.uniform4fv(colorLocation, new Float32Array([0.0, 1.0, 0.0, 1.0]));
    globalThis.genericCurve.renderDerivatives(1, gl.POINTS);
  }

  if (showd2) {
    gl.uniform4fv(colorLocation, new Float32Array([0.0, 0.0, 0.5, 0.5]));
    globalThis.genericCurve.renderDerivatives(2, gl.LINES);
    gl.uniform4fv(colorLocation, new Float32Array([0.0, 0.0, 1.0, 1.0]));
    globalThis.genericCurve.renderDerivatives(2, gl.POINTS);
  }

  gl.uniform4fv(colorLocation, new Float32Array([1.0, 1.0, 1.0, 1.0]));
  globalThis.genericCurve.renderDerivatives(0, gl.LINE_STRIP);

  if (globalThis.cyclicInterpolatedImage) {
    gl.uniform4fv(colorLocation, new Float32Array([0.0, 0.5, 0.5, 1.0]));
    globalThis.cyclicInterpolatedImage.renderDerivatives(0, gl.LINE_STRIP);
  }

  time++;

  globalThis.cyclicCurve.renderData(gl.LINE_STRIP);
  globalThis.cyclicCurve.renderData(gl.POINTS);

  setTimeout(drawFrame, 1000 / 60);
}

function getRandomColor() {
  return [Math.random(), Math.random(), Math.random(), 1];
}

window.addEventListener('load', (event) => {
  document.getElementById('scale-slider').addEventListener('input', (event1) => {
    scaleValue = event1.target.value / 100;
  });

  document.getElementById('rotate-x-slider').addEventListener('input', (event1) => {
    translateX = event1.target.value;
  });

  document.getElementById('rotate-y-slider').addEventListener('input', (event1) => {
    translateY = event1.target.value;
  });

  document.getElementById('rotate-z-slider').addEventListener('input', (event1) => {
    translateZ = event1.target.value;
  });

  document.getElementById('d1-checkbox').addEventListener('change', (event1) => {
    showd1 = event1.target.checked;
  });

  document.getElementById('d2-checkbox').addEventListener('change', (event1) => {
    showd2 = event1.target.checked;
  });

  document.getElementById('point-count').addEventListener('input', (event1) => {
    if (event1.target.value < 10000 && event1.target.value > 50) {
      pointCountValue = event1.target.value;
      globalThis.genericCurve = globalThis.parametricCurve.generateImage(pointCountValue, gl.STATIC_DRAW);
      globalThis.genericCurve.updateVertexBufferObjects(gl.STATIC_DRAW);
    }
  });

  document.addEventListener('wheel', (event1) => {
    event1.stopImmediatePropagation();
    scaleValue += Math.sign(event1.deltaY) * 1;
    document.getElementById('scale-slider').value = parseInt(scaleValue * 100);
  }, { passive: false }); // Disable scrolling in Chrome
  window.onwheel = (event1) => {
    event1.stopImmediatePropagation();
    scaleValue += Math.sign(event1.deltaY) * 1;
    document.getElementById('scale-slider').value = parseInt(scaleValue * 100);
  }; // modern standard
  window.onmousewheel = document.onmousewheel = (event1) => {
    event1.stopImmediatePropagation();
    scaleValue += Math.sign(event1.deltaY) * 1;
    document.getElementById('scale-slider').value = parseInt(scaleValue * 100);
  }; // older browsers, IE
  window.ontouchmove = (event1) => {
    event1.stopImmediatePropagation();
    scaleValue += Math.sign(event1.deltaY) * 1;
    document.getElementById('scale-slider').value = parseInt(scaleValue * 100);
  }; // mobile
});