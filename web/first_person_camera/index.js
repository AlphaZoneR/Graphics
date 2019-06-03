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
let otherNet = null;

const POINTS = 0;
const PATCHES = 1;

let TRANSFORM_MODE = POINTS;

let transformMode = POINTS;

let escaped = false;

let showControlNet = true;

let textures = {
  terrain1: new Texture2D('/textures/terrain3.jpg'),
  terrain2: new Texture2D('/textures/terrain2.jpg'),
  terrain3: new Texture2D('/textures/terrain1.jpg'),
  smh1: new Texture2D('/textures/smh1.jpg'),
}

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
        resetControlPointColors();
      } else if (TRANSFORM_MODE === PATCHES) {
        const endPoint = startingPoint.add(direction.normalize().multiply(-distance));
        if (endPoint.distance(collisionPoint) > 0.2) {
          mesh.controlNet.move(...endPoint.subtract(collisionPoint).data);
          transformVectors.move(mesh.calculateCenter().data);
        }
        selectedNet = mesh.controlNet;
        resetControlNetColors();
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

    if (event1.keyCode == keyCode('E')) {
      showControlNet = !showControlNet;
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

  controlNets.forEach(controlNet => controlNet.render(fpsCamera.viewMatrix, showControlNet));
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

function resetControlNetColors() {
  controlNets.forEach(net => net.image.mat = net.defaultMaterial);
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

    if (self.html().toLowerCase() == 'insert') {
      generateInsertTable();
    }

    if (self.html().toLowerCase() == 'join') {
      generateDropdown($('#join-dropdown'));
    }

    if (self.html().toLowerCase() == 'merge') {
      generateDropdown($('#merge-dropdown'));
    }

    $(`#${self.html().toLowerCase()}`).removeAttr('hidden');
  });

  $('.extend-direction').click((event1) => {
    const newNet = selectedNet.extend($(event1.target).html());
    if (newNet) {
      newNet.points.forEach((row) => {
        row.forEach(point => point.mesh.moved = true);
      });
      console.log('here');
      newNet.updatePatch();
      controlNets.push(newNet);
      addPatch(`Patch${controlNets.length}`, controlNets.length - 1);
    }
  })

  $('.extend-direction').mouseenter((event1) => {
    resetControlPointColors();
    selectedNet.highlightDirection($(event1.target).html());
  });

  $('.join-direction-selected').mouseenter((event1) => {
    resetControlPointColors();
    if (selectedNet) {
      selectedNet.highlightDirection($(event1.target).html());
    }
  });

  $('.join-direction-selected').click((event1) => {
    $('.join-direction-selected').removeClass('selected');
    $(event1.target).addClass('selected');
  });

  $('.join-direction-other').click((event1) => {
    $('.join-direction-other').removeClass('selected');
    $(event1.target).addClass('selected');
  });

  $('#join-button').click(() => {
    const thisDirection = $('.join-direction-selected.selected').html();
    const otherDirection = $('.join-direction-other.selected').html();

    if (!thisDirection || !otherDirection) {
      return;
    }

    if (!selectedNet || !otherNet) {
      return;
    }

    const newNet = selectedNet.join(otherNet, thisDirection, otherDirection);
    if (newNet) {
      newNet.updatePatch();
      controlNets.push(newNet);
      addPatch(`Patch${controlNets.length}`, controlNets.length - 1);
    }
  });

  $('.join-direction-other').mouseenter((event1) => {
    resetControlPointColors();
    if (otherNet) {
      otherNet.highlightDirection($(event1.target).html());
    }
  });

  //

  $('.merge-direction-selected').mouseenter((event1) => {
    resetControlPointColors();
    if (selectedNet) {
      selectedNet.highlightDirection($(event1.target).html());
    }
  });

  $('.merge-direction-selected').click((event1) => {
    $('.merge-direction-selected').removeClass('selected');
    $(event1.target).addClass('selected');
  });

  $('.merge-direction-other').click((event1) => {
    $('.merge-direction-other').removeClass('selected');
    $(event1.target).addClass('selected');
  });

  $('#merge-button').click(() => {
    const thisDirection = $('.merge-direction-selected.selected').html();
    const otherDirection = $('.merge-direction-other.selected').html();

    if (!thisDirection || !otherDirection) {
      return;
    }

    if (!selectedNet || !otherNet) {
      return;
    }

    const newNet = selectedNet.merge(otherNet, thisDirection, otherDirection);
    if (newNet) {
      newNet.updatePatch();
      deleteNet(otherNet);
    }
  });

  $('.merge-direction-other').mouseenter((event1) => {
    resetControlPointColors();
    if (otherNet) {
      otherNet.highlightDirection($(event1.target).html());
    }
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

  $('#material-select').change((event) => {
    const material = $(event.target).val();
    if (selectedNet) {
      if (material == 'emerald') {
        selectedNet.defaultMaterial = MatFBEmerald;
      } else if (material == 'brass') {
        selectedNet.defaultMaterial = MatFBBrass;
      } else if (material == 'gold') {
        selectedNet.defaultMaterial = MatFBGold;
      } else if (material == 'ruby') {
        selectedNet.defaultMaterial = MatFBRuby;
      } else if (material == 'pearl') {
        selectedNet.defaultMaterial = MatFBPearl;
      } else if (material == 'silver') {
        selectedNet.defaultMaterial = MatFBSilver;
      } else if (material == 'turquoise') {
        selectedNet.defaultMaterial = MatFBTurquoise;
      }

      selectedNet.useTexture = false;
      resetControlNetColors();
    }
  });

  $('#texture-select').change((event) => {
    const texture = $(event.target).val();
    console.log('here');
    selectedNet.useTexture = true;
    selectedNet.texture = textures[texture];
  });
});

function deleteNet(net) {
  net.removeFromNeighbours();
  const index = controlNets.indexOf(net);
  $(`#${index}`).remove();
  controlNets = controlNets.filter((val, i) => i !== index);

  controlNets.forEach((value, index) => addPatch(`Patch${index + 1}`, index));
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
    fpsCamera.updateView();
    selectedNet = controlNets[index];
  });
  $('.patch-element').unbind('contextmenu').contextmenu((event1) => {
    event1.preventDefault();
    event1.stopImmediatePropagation();

    const self = $(event1.target);
    const index = parseInt(self.attr('id'), 10);

    controlNets[index].removeFromNeighbours();
    controlNets = controlNets.filter((val, i) => i !== index);
    self.remove();

    $('#patches').html('');

    controlNets.forEach((value, index) => addPatch(`Patch${index + 1}`, index));
  });

  // for (let i = 0; i < controlNets.length; ++i) {
  //   const net1 = controlNets[i];
  //   const arrPoints1 = net1.arrPoints;
  //   let update = false;
  //   for (let j = 0; j < arrPoints1.length; ++j) {
  //     const point1 = arrPoints1[j];
  //     for (let k = 0; k < controlNets.length; ++k) {
  //       const net2 = controlNets[k];

  //       if (net2 != net1) {
  //         const arrPoints2 = net2.arrPoints;

  //         for (let l = 0; l < arrPoints2.length; ++l) {
  //           const point2 = arrPoints2[l];

  //           if (point1 != point2) {
  //             if (point1.position.distance(point2.position) < 0.2) {
  //               net1.points[parseInt(j / 4)][j % 4] = point2;
  //               point1.parentNet.push(net1);
  //               update = true;
  //             }
  //           }
  //         }
  //       }
  //     }
  //   }

  //   if (update) {
  //     net1.updatePatch();
  //   }
  // }
}

function generateInsertTable() {
  const tableDOM = $('<table></table>');
  const tbodyDOM = $('<tbody></tbody>');
  for (let i = 0; i < 4; ++i) {
    for (let j = 0; j < 4; ++j) {
      const rowDOM = $('<tr></tr>');
      for (let k = 0; k < 3; ++k) {
        const colDOM = $('<td></td>');
        i / 4 + 2, Math.random() / 4, j / 4
        if (k == 0) {
          const inputDOM = $(`<input id="${i}${j}${k}" type="text" value="${i / 4}">`);
          colDOM.append(inputDOM);
          rowDOM.append(colDOM);
        } else if (k == 1) {
          const inputDOM = $(`<input id="${i}${j}${k}" type="text" value="${Math.random()}">`);
          colDOM.append(inputDOM);
          rowDOM.append(colDOM);
        } else if (k == 2) {
          const inputDOM = $(`<input id="${i}${j}${k}" type="text" value="${j / 4}">`);
          colDOM.append(inputDOM);
          rowDOM.append(colDOM);
        }

      }
      tbodyDOM.append(rowDOM);
    }
  }

  $('#insert').html('');
  tableDOM.append(tbodyDOM);
  $('#insert').append(tableDOM);
  const insertButton = $('<button>Insert</button>');

  insertButton.unbind('click').click(() => {
    let coordinates = new Array(4).fill().map(row => new Array(4).fill());
    for (let i = 0; i < 4; ++i) {
      for (let j = 0; j < 4; ++j) {
        const x = parseFloat($(`#${i}${j}0`).val());
        const y = parseFloat($(`#${i}${j}1`).val());
        const z = parseFloat($(`#${i}${j}2`).val());

        coordinates[i][j] = new DCoordinate3(x, y, z);
      }
    }

    const newNet = ControlNet.insert(coordinates);
    newNet.updatePatch();
    controlNets.push(newNet);
    addPatch(`Patch${controlNets.length}`, controlNets.length - 1);
  });

  $('#insert').append(insertButton);
}

function generateDropdown(dropdown) {
  dropdown.html('');

  for (let i = 0; i < controlNets.length; ++i) {
    if (selectedNet != controlNets[i]) {
      const option = $(`<option class="join-option" value="${i}">Patch${i + 1}</option>`);
      dropdown.append(option);
    }
  }

  dropdown.unbind('change').change(() => {
    const index = parseInt(dropdown.val(), 10);
    if (!Number.isNaN(index)) {
      otherNet = controlNets[index];
    }
  });

  dropdown.unbind('hover').hover(() => {
    const index = parseInt(dropdown.val(), 10);
    if (!Number.isNaN(index)) {
      otherNet = controlNets[index];
    }
  });
}

function save() {
  const array = controlNets.map((c) => {
    const obj = {};
    obj.points = c.points.map((row) => {
      return row.map((p) => {
        return {
          coordinates: [p.position.x, p.position.y, p.position.z],
          parents: p.parentNet.map((p) => controlNets.indexOf(p)),
        }
      });
    });
    obj.neighbours = {
      N: -1,
      S: -1,
      W: -1,
      E: -1,
      NW: -1,
      NE: -1,
      SE: -1,
      SW: -1
    }

    Object.keys(c.neighbours).forEach((key) => {
      if (c.neighbours[key]) {
        obj.neighbours[key] = controlNets.indexOf(c.neighbours[key]);
      }
    })

    return obj;
  });

  const link = document.createElement('a');
  link.download = `patch-${parseInt(Math.random() * 1000000)}.json`
  const blob = new Blob([JSON.stringify(array)], { type: 'text/json' });
  link.href = window.URL.createObjectURL(blob);
  link.click();
}

async function load(path) {
  try {
    const response = await fetch(path, { method: 'GET' });
    const json = await response.json();

    const netArrays = json.map((obj) => {
      return obj.points.map(row => row.map(p => p.coordinates));
    });


    const nets = netArrays.map((n) => ControlNet.insert(n));
    console.log(nets.length)

    nets.forEach((poly, index) => {
      Object.keys(poly.neighbours).forEach((key) => {
        if (json[index].neighbours[key] != -1) {
          poly.neighbours[key] = nets[json[index].neighbours[key]];
        }
      });
      
      if (json[index].neighbours.N != -1) {
        poly.neighbours.N.points[3] = poly.points[0];
      }

      if (json[index].neighbours.S != -1) {
        poly.neighbours.S.points[0] = poly.points[3];
      }

      poly.points.forEach((row, rowIndex) => {
        row.forEach((point, pointIndex) => {
          point.parentNet = json[index].points[rowIndex][pointIndex].parents.map(value => nets[value]);
          point.mesh.moved = true;
        });
      });
      poly.updatePatch();
    });

    controlNets = nets;
    $('#patches').html('');

    controlNets.forEach((value, index) => addPatch(`Patch${index + 1}`, index));

  } catch (e) {
    alert(e.message);
  }

}
