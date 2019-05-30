let gl = null;
let vertexLocation = null;
let matrixLocation = null;
let colorLocation = null;
let scaleValue = 5;
let translateX = 0;
let translateY = 0;
let translateZ = 0;

let arc = null;
let beforeInterpolation = null;
let afterInterpolation = null;
let showd1 = true;
let showd2 = true;
let keyboard = new Array(512).fill().map(e => false);
let elephant;
let mouse;


let crosshair = null;
let fpsCamera = new FPSCamera();
let mousePosition = {
  x: null,
  y: null,
}
let controlpoint = 0;

let pointCountValue = 200;

let lines = [];
let lineBuffers = [];
let boundingBuffers = [];

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

  canvas.onmousedown = (event1) => {
    raytrace([elephant, mouse]);
  }

  canvas.onmousemove = (event1) => {
    if (mousePosition.x == null || mousePosition.y == null) {
      mousePosition.x = event1.clientX;
      mousePosition.y = event1.clientY;
    }
    mousePosition.x += event1.movementX
    mousePosition.y += event1.movementY;
    const x = mousePosition.x / gl.canvas.width * 2 - 1;
    const y = mousePosition.y / gl.canvas.height * -2 + 1;
    fpsCamera.mouseMove(x, y);
  }

  window.onkeydown = (event1) => {
    keyboard[event1.keyCode] = true;
  }

  window.onkeyup = (event1) => {
    keyboard[event1.keyCode] = false;
  }

  var ext1 = gl.getExtension('OES_element_index_uint');
  var ext2 = gl.getExtension('OES_standard_derivatives');

  prog = await glProgramFrom('vert.glsl', 'frag.glsl').catch(error => console.log(error.message));

  globalThis.positionAttributeLocation = gl.getAttribLocation(prog, "in_vert");
  matrixLocation = gl.getUniformLocation(prog, 'u_matrix');
  colorLocation = gl.getUniformLocation(prog, 'in_color');

  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;

  canvas.requestPointerLock = canvas.requestPointerLock ||
    canvas.mozRequestPointerLock;

  canvas.requestPointerLock();

  elephant = new TriangulatedMesh3();
  await elephant.fromOFF('/meshes/elephant.off', true);
  elephant.updateVertexBufferObjects(gl.STATIC_DRAW);


  mouse = new TriangulatedMesh3();
  await mouse.fromOFF('/meshes/sphere.off', true);
  mouse.updateVertexBufferObjects(gl.STATIC_DRAW);
  mouse.translateVector = [0, 0, 1];
  mouse.currentYRotate = 270;
  mouse.currMaterial = MatFBEmerald;

  controlpoint = new ControlNet();
  patch = controlpoint.generatePatch();

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
    afterInterpolation = patch.generateImage(30, 30);

    if (afterInterpolation) {
      afterInterpolation.updateVertexBufferObjects(gl.STATIC_DRAW);
      afterInterpolation.currMaterial = MatFBTurquoise;
    }
  }

  createBoundingBuffers([elephant, mouse]);

  crosshair = new Crosshair();

  gl.enable(gl.DEPTH_TEST);
  drawFrame();
});

function keyCode(char) {
  return char.charCodeAt(0);
}

function drawFrame() {
  if (keyboard[keyCode('W')]) {
    fpsCamera.move('w');
  }

  if (keyboard[keyCode('S')]) {
    fpsCamera.move('s');
  }

  if (keyboard[keyCode('A')]) {
    fpsCamera.move('a');
  }

  if (keyboard[keyCode('D')]) {
    fpsCamera.move('d');
  }


  globalThis.gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  globalThis.gl.clearColor(0.2, 0.2, 0.2, 1);
  globalThis.gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  elephant.render(fpsCamera.viewMatrix, gl.TRIANGLES);
  mouse.render(fpsCamera.viewMatrix, gl.TRIANGLES);

  renderLines(fpsCamera.viewMatrix);
  renderBoundingBuffers(fpsCamera.viewMatrix);

  controlpoint.render(fpsCamera.viewMatrix);
  // beforeInterpolation.render(fpsCamera.viewMatrix, gl.TRIANGLES);
  afterInterpolation.render(fpsCamera.viewMatrix, gl.TRIANGLES);


  crosshair.render();

  time++;
  setTimeout(drawFrame, 1000 / 60);
}

function getRandomColor() {
  return [Math.random(), Math.random(), Math.random(), 1];
}

function raytrace(objects) {
  const direction = fpsCamera.forward;
  const startingPoint = _.cloneDeep(fpsCamera.eyeVector);
  const distance = 100;
  let currentDistance = 0.1;
  const distanceStep = 0.1;

  while (currentDistance < distance) {
    const currentPoint = startingPoint.add(direction.normalize().multiply(-currentDistance));

    for (let object of objects) {
      let [xmin, xmax, ymin, ymax, zmin, zmax] = object.calculateBoundingBox();

      const { x, y, z } = currentPoint;

      if (x >= xmin && x <= xmax && y >= ymin && y <= ymax && z >= zmin && z <= zmax) {
        console.log('collided');
        return true;
      }

    }
    currentDistance += distanceStep;
  }

  addLine([startingPoint, startingPoint.add(direction.normalize().multiply(-currentDistance))]);

  return false;
}

function addLine(line) {
  const GL = WebGLRenderingContext;
  const [A, B] = line;
  const bufferData = new Float32Array([...A.data, ...B.data]);

  const buff = gl.createBuffer();
  gl.bindBuffer(GL.ARRAY_BUFFER, buff);
  gl.bufferData(GL.ARRAY_BUFFER, bufferData, GL.STATIC_DRAW);

  lineBuffers.push(buff);

  gl.bindBuffer(GL.ARRAY_BUFFER, null);
}

function renderLines(viewMatrix) {
  const proj = perspective(degToRad(45.0), gl.canvas.width / gl.canvas.height, 1.0, 1000.0);

  globalThis.gl.useProgram(prog);
  globalThis.gl.enableVertexAttribArray(vertexLocation);

  globalThis.gl.uniformMatrix4fv(matrixLocation, false, multiply(proj, viewMatrix))

  for (const lineBuffer of lineBuffers) {
    globalThis.gl.bindBuffer(globalThis.gl.ARRAY_BUFFER, lineBuffer);
    globalThis.gl.vertexAttribPointer(vertexLocation, 3, WebGLRenderingContext.FLOAT, true, 0, 0);
    globalThis.gl.drawArrays(globalThis.gl.LINES, 0, 2);
  }

  gl.bindBuffer(globalThis.gl.ARRAY_BUFFER, null);
}

function createBoundingBuffers(objects) {
  for (const object of objects) {
    let [xmin, xmax, ymin, ymax, zmin, zmax] = object.calculateBoundingBox();
    const A = new DCoordinate3(xmin, ymax, zmin);
    const B = new DCoordinate3(xmax, ymax, zmin);
    const C = new DCoordinate3(xmax, ymin, zmin);
    const D = new DCoordinate3(xmin, ymin, zmin);

    const E = new DCoordinate3(xmin, ymax, zmax);
    const F = new DCoordinate3(xmax, ymax, zmax);
    const G = new DCoordinate3(xmax, ymin, zmax);
    const H = new DCoordinate3(xmin, ymin, zmax);

    const preliminaryData = [];
    preliminaryData.push(...A.data, ...B.data); // A -> B
    preliminaryData.push(...B.data, ...C.data); // B -> C
    preliminaryData.push(...C.data, ...D.data); // C -> D;
    preliminaryData.push(...D.data, ...A.data); // D -> A;

    preliminaryData.push(...E.data, ...F.data); // E -> F
    preliminaryData.push(...F.data, ...G.data); // F -> G
    preliminaryData.push(...G.data, ...H.data); // H -> H;
    preliminaryData.push(...H.data, ...E.data); // D -> A;

    preliminaryData.push(...A.data, ...E.data); // A -> E
    preliminaryData.push(...B.data, ...F.data); // B -> F
    preliminaryData.push(...C.data, ...G.data); // C -> G;
    preliminaryData.push(...D.data, ...H.data); // D -> H;

    const data = new Float32Array(preliminaryData);

    const buff = globalThis.gl.createBuffer();
    globalThis.gl.bindBuffer(globalThis.gl.ARRAY_BUFFER, buff);
    globalThis.gl.bufferData(globalThis.gl.ARRAY_BUFFER, data, globalThis.gl.STATIC_DRAW);

    globalThis.gl.bindBuffer(globalThis.gl.ARRAY_BUFFER, null);

    boundingBuffers.push(buff);
  }
}

function renderBoundingBuffers(viewMatrix) {
  const proj = perspective(degToRad(45.0), gl.canvas.width / gl.canvas.height, 1.0, 1000.0);

  globalThis.gl.useProgram(prog);
  globalThis.gl.enableVertexAttribArray(vertexLocation);

  globalThis.gl.uniformMatrix4fv(matrixLocation, false, multiply(proj, viewMatrix));

  for (const boundingBuffer of boundingBuffers) {
    globalThis.gl.bindBuffer(globalThis.gl.ARRAY_BUFFER, boundingBuffer);
    globalThis.gl.vertexAttribPointer(vertexLocation, 3, WebGLRenderingContext.FLOAT, true, 0, 0);
    globalThis.gl.drawArrays(globalThis.gl.LINES, 0, 24);
  }
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