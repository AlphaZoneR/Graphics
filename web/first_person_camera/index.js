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
let transformVectors = null;

let time = 0;

let draggedMesh = null;

let controlNets = [];
let selectedNet = null;

const POINTS = 0;
const PATCHES = 1;

let TRANSFORM_MODE = POINTS;

let transformMode = POINTS;

let escaped = false;

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
    if (escaped) {
      canvas.requestPointerLock();
      escaped = false;
    }

    // raytrace every controlpoint
    let everyControlPointMesh = [];

    if (TRANSFORM_MODE == POINTS) {
      everyControlPointMesh = controlNets.map(controlNet => controlNet.controlPointMeshes).flat();
      everyControlPointMesh.forEach(mesh => mesh.mat = MatFBRuby);
    } else if (TRANSFORM_MODE == PATCHES) {
      everyControlPointMesh = controlNets.map(controlNet => controlNet.image);
      everyControlPointMesh.forEach(mesh => mesh.mat = MatFBBrass);
    }

    let [mesh, distance, collisionPoint] = raytrace(everyControlPointMesh);

    if (mesh) {
      draggedMesh = [mesh, distance, collisionPoint];
      if (TRANSFORM_MODE == POINTS) {
        mesh.mat = MatFBEmerald;
      } else if (TRANSFORM_MODE == PATCHES) {
        mesh.controlNet.color();
        mesh.mat = MatFBPearl;

        selectPatchById(controlNets.indexOf(mesh.controlNet));
      }

      transformVectors.move(mesh.translateVector);
      transformVectors.show();
    } else {
      transformVectors.hide();
    }
  }

  canvas.onmouseup = (event1) => {
    if (draggedMesh) {
      const [mesh, distance, collisionPoint] = draggedMesh;
      const startingPoint = _.cloneDeep(fpsCamera.eyeVector);
      const direction = fpsCamera.forward;


      if (TRANSFORM_MODE === POINTS) {
        const endPoint = startingPoint.add(direction.normalize().multiply(-distance));
        mesh.controlPoint.move(...endPoint.data);
        transformVectors.move(mesh.translateVector);
      } else if (TRANSFORM_MODE === PATCHES) {
        const endPoint = startingPoint.add(direction.normalize().multiply(-distance));
        if (endPoint.distance(collisionPoint) > 0.2) {
          mesh.controlNet.move(...endPoint.subtract(collisionPoint).data);
          transformVectors.move(mesh.calculateCenter().data);
          selectedNet = mesh.controlNet;
        }
      }

      mesh.moved = true;
    }

    draggedMesh = null;
  }

  canvas.onmousemove = (event1) => {
    if (escaped) {
      return;
    }

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

    if (event1.keyCode == 27) {
      escaped = true;
    }
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

  controlNets.push(new ControlNet());
  selectedNet = controlNets[0];
  addPatch('Patch1', 0);

  transformVectors = new TransformVectors(1, 1, 1);

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


  if (draggedMesh) {
    const [mesh, distance, _collisionPoint] = draggedMesh;
    const startingPoint = _.cloneDeep(fpsCamera.eyeVector);
    const direction = fpsCamera.forward;


    if (TRANSFORM_MODE === POINTS) {
      const endPoint = startingPoint.add(direction.normalize().multiply(-distance));
      mesh.controlPoint.move(...endPoint.data, false);
      transformVectors.move(mesh.translateVector);
    }
  }

  globalThis.gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  globalThis.gl.clearColor(0.2, 0.2, 0.2, 1);
  globalThis.gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


  renderLines(fpsCamera.viewMatrix);
  renderBoundingBuffers(fpsCamera.viewMatrix);

  controlNets.forEach(controlNet => controlNet.render(fpsCamera.viewMatrix));
  transformVectors.render(fpsCamera.viewMatrix);
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
  const distanceStep = 0.01;

  while (currentDistance < distance) {
    const currentPoint = startingPoint.add(direction.normalize().multiply(-currentDistance));

    for (let object of objects) {
      let [xmin, xmax, ymin, ymax, zmin, zmax] = object.calculateBoundingBox();

      const { x, y, z } = currentPoint;

      if (x >= xmin && x <= xmax && y >= ymin && y <= ymax && z >= zmin && z <= zmax) {
        return [object, currentDistance, currentPoint];
      }

    }
    currentDistance += distanceStep;
  }

  // addLine([startingPoint, startingPoint.add(direction.normalize().multiply(-currentDistance))]);

  return [null, Infinity, Infinity];
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

function resetControlPointColors() {
  const everyControlPointMesh = controlNets.map(controlNet => controlNet.controlPointMeshes).flat();
  everyControlPointMesh.forEach(mesh => mesh.mat = MatFBRuby);
}

function selectPatchById(id) {
  $('.patch-element').removeClass('selected');
  $(`#${id}`).addClass('selected');
}

function createBoundingBuffers(objects) {
  boundingBuffers = [];
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

  $('.activity-element').click((event) => {
    const self = $(event.target);
    $('.activity-element').removeClass('selected');
    self.addClass('selected');
    $('.activity').attr('hidden', 'true');
    $(`#${self.html().toLowerCase()}`).removeAttr('hidden');
  });

  $('.extend-direction').click((event1) => {
    extendPatch($(event1.target).html(), selectedNet);
  })

  $('.extend-direction').mouseenter((event1) => {
    resetControlPointColors();
    selectedNet.highlightDirection($(event1.target).html());
  });

  $('.extend-direction').mouseleave((event1) => {
    resetControlPointColors();
  });

  $('.transform-element').click((event1) => {
    const self = $(event1.target);
    $('.transform-element').removeClass('selected');
    self.addClass('selected');

    if (self.html().toLowerCase() == 'points') {
      TRANSFORM_MODE = POINTS;
    } else {
      TRANSFORM_MODE = PATCHES;
    }
  })
});

function extendPatch(direction, extendableNet, update = true) {
  if (direction == 'N') {
    if (extendableNet.neighbours.N && update) {
      return;
    }

    const controlNet = new ControlNet(update);
    const p = extendableNet.points[0];
    const q = _.cloneDeep(extendableNet.points[1]);

    controlNet.points[3][0] = p[0];
    controlNet.points[3][1] = p[1];
    controlNet.points[3][2] = p[2];
    controlNet.points[3][3] = p[3];

    controlNet.points[3][0].parentNet.push(controlNet);
    controlNet.points[3][1].parentNet.push(controlNet);
    controlNet.points[3][2].parentNet.push(controlNet);
    controlNet.points[3][3].parentNet.push(controlNet);

    for (let i = 1; i < 4; ++i) {
      controlNet.points[3 - i][0] = new ControlPoint(...p[0].position.add(p[0].position.subtract(q[0].position).multiply(i)).data);
      controlNet.points[3 - i][1] = new ControlPoint(...p[1].position.add(p[1].position.subtract(q[1].position).multiply(i)).data);
      controlNet.points[3 - i][2] = new ControlPoint(...p[2].position.add(p[2].position.subtract(q[2].position).multiply(i)).data);
      controlNet.points[3 - i][3] = new ControlPoint(...p[3].position.add(p[3].position.subtract(q[3].position).multiply(i)).data);
    }

    for (let i = 0; i < 3; ++i) {
      for (let j = 0; j < 4; ++j) {
        controlNet.points[i][j].parentNet = [controlNet];
      }
    }

    if (update) {
      extendableNet.neighbours.N = controlNet;
      controlNet.neighbours.S = extendableNet;

      controlNet.updatePatch();
      controlNets.push(controlNet);
      addPatch(`Patch${controlNets.length}`, controlNets.length - 1);
    }

    return controlNet;
  } else if (direction == 'S') {
    if (extendableNet.neighbours.S && update) {
      return;
    }

    const controlNet = new ControlNet(update);
    const p = extendableNet.points[3];
    const q = _.cloneDeep(extendableNet.points[2]);

    controlNet.points[0][0] = p[0];
    controlNet.points[0][1] = p[1];
    controlNet.points[0][2] = p[2];
    controlNet.points[0][3] = p[3];

    controlNet.points[0][0].parentNet.push(controlNet);
    controlNet.points[0][1].parentNet.push(controlNet);
    controlNet.points[0][2].parentNet.push(controlNet);
    controlNet.points[0][3].parentNet.push(controlNet);

    for (let i = 1; i < 4; ++i) {
      controlNet.points[i][0] = new ControlPoint(...p[0].position.add(p[0].position.subtract(q[0].position).multiply(i)).data);
      controlNet.points[i][1] = new ControlPoint(...p[1].position.add(p[1].position.subtract(q[1].position).multiply(i)).data);
      controlNet.points[i][2] = new ControlPoint(...p[2].position.add(p[2].position.subtract(q[2].position).multiply(i)).data);
      controlNet.points[i][3] = new ControlPoint(...p[3].position.add(p[3].position.subtract(q[3].position).multiply(i)).data);
    }

    for (let i = 1; i < 4; ++i) {
      for (let j = 0; j < 4; ++j) {
        controlNet.points[i][j].parentNet = [controlNet];
      }
    }

    if (update) {
      extendableNet.neighbours.S = controlNet;
      controlNet.neighbours.N = extendableNet;

      controlNet.updatePatch();
      controlNets.push(controlNet);
      addPatch(`Patch${controlNets.length}`, controlNets.length - 1);
    }

    return controlNet;
  } else if (direction == 'W') {
    if (extendableNet.neighbours.W && update) {
      return;
    }
    const controlNet = new ControlNet(update);
    const p = [extendableNet.points[0][0], extendableNet.points[1][0], extendableNet.points[2][0], extendableNet.points[3][0]];
    const q = _.cloneDeep([extendableNet.points[0][1], extendableNet.points[1][1], extendableNet.points[2][1], extendableNet.points[3][1]]);

    controlNet.points[0][3] = p[0];
    controlNet.points[1][3] = p[1];
    controlNet.points[2][3] = p[2];
    controlNet.points[3][3] = p[3];

    controlNet.points[0][3].parentNet.push(controlNet);
    controlNet.points[1][3].parentNet.push(controlNet);
    controlNet.points[2][3].parentNet.push(controlNet);
    controlNet.points[3][3].parentNet.push(controlNet);

    for (let i = 1; i < 4; ++i) {
      controlNet.points[0][3 - i] = new ControlPoint(...p[0].position.add(p[0].position.subtract(q[0].position).multiply(i)).data);
      controlNet.points[1][3 - i] = new ControlPoint(...p[1].position.add(p[1].position.subtract(q[1].position).multiply(i)).data);
      controlNet.points[2][3 - i] = new ControlPoint(...p[2].position.add(p[2].position.subtract(q[2].position).multiply(i)).data);
      controlNet.points[3][3 - i] = new ControlPoint(...p[3].position.add(p[3].position.subtract(q[3].position).multiply(i)).data);
    }

    for (let i = 0; i < 4; ++i) {
      for (let j = 0; j < 3; ++j) {
        controlNet.points[i][j].parentNet = [controlNet];
      }
    }

    if (update) {
      extendableNet.neighbours.W = controlNet;
      controlNet.neighbours.E = extendableNet;

      controlNet.updatePatch();
      controlNets.push(controlNet);
      addPatch(`Patch${controlNets.length}`, controlNets.length - 1);
    }

    return controlNet;

  } else if (direction == 'E') {
    if (extendableNet.neighbours.E && update) {
      return;
    }

    const controlNet = new ControlNet(update);
    const p = [extendableNet.points[0][3], extendableNet.points[1][3], extendableNet.points[2][3], extendableNet.points[3][3]];
    const q = _.cloneDeep([extendableNet.points[0][2], extendableNet.points[1][2], extendableNet.points[2][2], extendableNet.points[3][2]]);

    controlNet.points[0][0] = p[0];
    controlNet.points[1][0] = p[1];
    controlNet.points[2][0] = p[2];
    controlNet.points[3][0] = p[3];

    controlNet.points[0][0].parentNet.push(controlNet);
    controlNet.points[1][0].parentNet.push(controlNet);
    controlNet.points[2][0].parentNet.push(controlNet);
    controlNet.points[3][0].parentNet.push(controlNet);

    for (let i = 1; i < 4; ++i) {
      controlNet.points[0][i] = new ControlPoint(...p[0].position.add(p[0].position.subtract(q[0].position).multiply(i)).data);
      controlNet.points[1][i] = new ControlPoint(...p[1].position.add(p[1].position.subtract(q[1].position).multiply(i)).data);
      controlNet.points[2][i] = new ControlPoint(...p[2].position.add(p[2].position.subtract(q[2].position).multiply(i)).data);
      controlNet.points[3][i] = new ControlPoint(...p[3].position.add(p[3].position.subtract(q[3].position).multiply(i)).data);
    }

    for (let i = 0; i < 4; ++i) {
      for (let j = 1; j < 4; ++j) {
        controlNet.points[i][j].parentNet = [controlNet];
      }
    }

    if (update) {
      extendableNet.neighbours.E = controlNet;
      controlNet.neighbours.W = extendableNet;
      controlNet.updatePatch();
      controlNets.push(controlNet);
      addPatch(`Patch${controlNets.length}`, controlNets.length - 1);
    }

    return controlNet;

  } else if (direction == 'NE') {
    if (extendableNet.neighbours.NE) {
      return;
    }

    const NORTH = extendPatch('N', extendableNet, false);
    const controlNet = extendPatch('E', NORTH, false);

    if (update) {
      extendableNet.neighbours.NE = controlNet;
      controlNet.neighbours.SW = extendableNet;
      controlNet.updatePatch();
      controlNets.push(controlNet);
      addPatch(`Patch${controlNets.length}`, controlNets.length - 1);
    }

    return controlNet;
  } else if (direction == 'NW') {
    if (extendableNet.neighbours.NW) {
      return;
    }

    const NORTH = extendPatch('N', extendableNet, false);
    const controlNet = extendPatch('W', NORTH, false);

    if (update) {
      extendableNet.neighbours.NW = controlNet;
      controlNet.neighbours.SE = extendableNet;
      controlNet.updatePatch();
      controlNets.push(controlNet);
      addPatch(`Patch${controlNets.length}`, controlNets.length - 1);
    }
  } else if (direction == 'SW') {
    if (extendableNet.neighbours.SW) {
      return;
    }

    const NORTH = extendPatch('S', extendableNet, false);
    const controlNet = extendPatch('W', NORTH, false);

    if (update) {
      extendableNet.neighbours.SW = controlNet;
      controlNet.neighbours.NE = extendableNet;
      controlNet.updatePatch();
      controlNets.push(controlNet);
      addPatch(`Patch${controlNets.length}`, controlNets.length - 1);
    }
  } else if (direction == 'SE') {
    if (extendableNet.neighbours.SE) {
      return;
    }

    const NORTH = extendPatch('S', extendableNet, false);
    const controlNet = extendPatch('E', NORTH, false);

    if (update) {
      extendableNet.neighbours.SE = controlNet;
      controlNet.neighbours.NW = extendableNet;
      controlNet.updatePatch();
      controlNets.push(controlNet);
      addPatch(`Patch${controlNets.length}`, controlNets.length - 1);
    }
  }
}

function addPatch(patchName, index) {
  const newEntry = $(`<div class="patch-element" id="${index}" data-index="${index}">${patchName}</div>`);
  $('#patches').append(newEntry);

  $('.patch-element').unbind('click').click((event1) => {
    $('.patch-element').removeClass('selected');
    const self = $(event1.target);
    self.addClass('selected');
    const index = parseInt(self.data('index'), 10);
    fpsCamera.eyeVector = controlNets[index].image.calculateCenter();
    selectedNet = controlNets[index];
  });
}