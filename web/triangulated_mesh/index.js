let gl = null;
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

  var ext = gl.getExtension('OES_element_index_uint');

  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;

  globalThis.mesh = new TriangulatedMesh3();
  await globalThis.mesh.fromOFF('/meshes/elephant.off', true);
  globalThis.mesh.updateVertexBufferObjects(gl.STATIC_DRAW);
  gl.enable(gl.DEPTH_TEST);


  drawFrame();
});

function drawFrame() {
  globalThis.gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  globalThis.gl.clearColor(0.1, 0.1, 0.1, 1);
  globalThis.gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  globalThis.mesh.render(globalThis.gl.TRIANGLES);
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
    globalThis.mesh.currentXRotate = event1.target.value;
  });

  document.getElementById('rotate-y-slider').addEventListener('input', (event1) => {
    globalThis.mesh.currentYRotate = event1.target.value;
  });

  document.getElementById('rotate-z-slider').addEventListener('input', (event1) => {
    globalThis.mesh.currentZRotate = event1.target.value;
  });

  document.getElementById('current-curve').addEventListener('input', (event1) => {
    currentCurve(event1.target.value);
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

  document.addEventListener('wheel', preventDefault, { passive: false }); // Disable scrolling in Chrome
  window.onwheel = preventDefault; // modern standard
  window.onmousewheel = document.onmousewheel = preventDefault; // older browsers, IE
  window.ontouchmove = preventDefault; // mobile
});

async function currentCurve(name) {
  if (['mouse', 'house', 'elephant', 'space_shuttle'].indexOf(name) !== -1) {
    await globalThis.mesh.fromOFF(`/meshes/${name}.off`, true);
    globalThis.mesh.updateVertexBufferObjects(WebGLRenderingContext.STATIC_DRAW);
  }

}