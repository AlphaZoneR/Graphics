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

let patch = null;
let beforeInterpolation = null;
let afterInterpolation = null;
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
  
  var ext1 = gl.getExtension('OES_element_index_uint');
  var ext2 = gl.getExtension('OES_standard_derivatives');

  prog = await glProgramFrom('vert.glsl', 'frag.glsl').catch(error => console.log(error.message));

  globalThis.positionAttributeLocation = gl.getAttribLocation(prog, "in_vert");
  matrixLocation = gl.getUniformLocation(prog, 'u_matrix');
  colorLocation = gl.getUniformLocation(prog, 'in_color');

  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;

  patch = new BiquarticPatch3();
  patch.setData(0, 0, -2.0, -2.0, 0.0);

  patch.setData(0, 0, -2.0, -2.0, 0.0);
  patch.setData(0, 1, -2.0, -1.0, 0.0);
  patch.setData(0, 2, -2.0, 1.0, 0.0);
  patch.setData(0, 3, -2.0, 2.0, 0.0);
  patch.setData(1, 0, -1.0, -2.0, 0.0);
  patch.setData(1, 1, -1.0, -1.0, 2.0);
  patch.setData(1, 2, -1.0, 1.0, 2.0);
  patch.setData(1, 3, -1.0, 2.0, 0.0);
  patch.setData(2, 0, 1.0, -2.0, 0.0);
  patch.setData(2, 1, 1.0, -1.0, 2.0);
  patch.setData(2, 2, 1.0, 1.0, 2.0);
  patch.setData(2, 3, 1.0, 2.0, 0.0);
  patch.setData(3, 0, 2.0, -2.0, 0.0);
  patch.setData(3, 1, 2.0, -1.0, 0.0);
  patch.setData(3, 2, 2.0, 1.0, 0.0);
  patch.setData(3, 3, 2.0, 2.0, 0.0);

  patch.updateVertexBufferObjectsOfData();

  uisolines = patch.generateUIsoparametricLines(10, 1, 200);
  uisolines.data[0].forEach(line => {
    line.updateVertexBufferObjects(gl.STATIC_DRAW);
  });
  beforeInterpolation = patch.generateImage(30, 30);
  beforeInterpolation.updateVertexBufferObjects(gl.STATIC_DRAW);

  const uKnotVector = new RowMatrix(4);
  uKnotVector.set(0, 0.0);
  uKnotVector.set(1, 1.0 / 3.0);
  uKnotVector.set(2, 2.0 / 3.0);
  uKnotVector.set(3, 1.0);

  const vKnotVector = new ColumnMatrix(4);
  vKnotVector.set(0, 0.0);
  vKnotVector.set(1, 1.0 / 3.0);
  vKnotVector.set(2, 2.0 / 3.0);
  vKnotVector.set(3, 1.0);

  const dataPointstoInterpolate = new Matrix(4, 4);
  for (let row = 0; row < 4; ++row) {
    for (let col = 0; col < 4; ++col) {
      dataPointstoInterpolate.data[row][col] = _.cloneDeep(patch.data.data[row][col]);
    }
  }

  if (patch.updateDataForInterpolation(uKnotVector, vKnotVector, dataPointstoInterpolate)) {
    afterInterpolation = patch.generateImage(200, 200);

    if (afterInterpolation) {
      afterInterpolation.updateVertexBufferObjects(gl.STATIC_DRAW);
    }
  }

  gl.enable(gl.DEPTH_TEST);
  // gl.enable(gl.CULL_FACE);
  gl.enable(gl.BLEND);

  drawFrame();
});

function drawFrame() {
  globalThis.gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  globalThis.gl.clearColor(0.2, 0.2, 0.2, 1);
  globalThis.gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);



  // if (afterInterpolation) {
  //   afterInterpolation.render(gl.TRIANGLES);
  // }
  const cameraPos = [cos(time / 100) * scaleValue, sin(time / 100) * scaleValue,  scaleValue];
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
  
  uisolines.data[0].forEach(line => {
    line.renderDerivatives(0, gl.LINE_STRIP);
  });

  beforeInterpolation.render(gl.TRIANGLES);

  patch.renderData(gl.LINE_STRIP);

  time++;
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