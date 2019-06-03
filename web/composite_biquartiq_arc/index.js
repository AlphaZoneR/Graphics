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

let controlPolynomes = [];
let selectedPolynome = null;
let otherPolygone = null;

const POINTS = 0;
const PATCHES = 1;

let TRANSFORM_MODE = POINTS;

let transformMode = POINTS;

let escaped = false;

let showcontrolPoly = true;

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
      everyControlPointMesh = controlPolynomes.map(controlPoly => controlPoly.controlPointMeshes).flat();
      everyControlPointMesh.forEach(mesh => mesh.mat = MatFBRuby);
    } else if (TRANSFORM_MODE == PATCHES) {
      everyControlPointMesh = controlPolynomes.map(controlPoly => controlPoly.image);
    }

    let [mesh, distance, collisionPoint] = raytrace(everyControlPointMesh);

    if (mesh) {
      draggedMesh = [mesh, distance, collisionPoint];
      if (TRANSFORM_MODE == POINTS) {
        mesh.mat = MatFBEmerald;
      } else if (TRANSFORM_MODE == PATCHES) {
        mesh.controlPoly.color();
        mesh.mat = MatFBPearl;

        selectPatchById(controlPolynomes.indexOf(mesh.controlPoly));
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

      if (!mesh) {
        return;
      }

      if (TRANSFORM_MODE === POINTS) {
        const endPoint = startingPoint.add(direction.normalize().multiply(-distance));
        mesh.controlPoint.move(...endPoint.data);
        transformVectors.move(mesh.translateVector);
        resetControlPointColors();
      } else if (TRANSFORM_MODE === PATCHES) {
        const endPoint = startingPoint.add(direction.normalize().multiply(-distance));
        if (endPoint.distance(collisionPoint) > 0.2) {
          mesh.controlPoly.move(...endPoint.subtract(collisionPoint).data);
          transformVectors.move(mesh.calculateCenter().data);
        }
        selectedPolynome = mesh.controlPoly;
        resetcontrolPolyColors();
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
      showcontrolPoly = !showcontrolPoly;
    }
  }

  window.onkeyup = (event1) => {
    keyboard[event1.keyCode] = false;
  }

  const ext1 = gl.getExtension('OES_element_index_uint');
  const ext2 = gl.getExtension('OES_standard_derivatives');

  prog = await glProgramFrom('vert.glsl', 'frag.glsl').catch(error => console.log(error.message));

  globalThis.positionAttributeLocation = gl.getAttribLocation(prog, "in_vert");
  matrixLocation = gl.getUniformLocation(prog, 'u_matrix');
  colorLocation = gl.getUniformLocation(prog, 'in_color');

  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;

  canvas.requestPointerLock = canvas.requestPointerLock ||
    canvas.mozRequestPointerLock;

  canvas.requestPointerLock();

  controlPolynomes.push(new ControlPolygone());
  selectedPolynome = controlPolynomes[0];
  addArc('Arc1', 0);

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

  controlPolynomes.forEach(controlPoly => controlPoly.render(fpsCamera.viewMatrix, showcontrolPoly));
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
  const everyControlPointMesh = controlPolynomes.map(controlPoly => controlPoly.controlPointMeshes).flat();
  everyControlPointMesh.forEach(mesh => mesh.mat = MatFBRuby);
}

function resetcontrolPolyColors() {
  controlPolynomes.forEach(net => net.image.mat = net.defaultMaterial);
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

    if (self.html().toLowerCase() == 'edit') {
      if (selectedPolynome) {
        $('#r').val(selectedPolynome.defaultColor[0] * 255);
        $('#g').val(selectedPolynome.defaultColor[1] * 255);
        $('#b').val(selectedPolynome.defaultColor[2] * 255);

        $('.color-choice').css('background-color', `rgb(${selectedPolynome.defaultColor[0] * 255}, ${selectedPolynome.defaultColor[1] * 255}, ${selectedPolynome.defaultColor[2] * 255})`);

        $('#showd1').prop('checked', selectedPolynome.showd1);
        $('#showd2').prop('checked', selectedPolynome.showd2);
      }
    }

    $(`#${self.html().toLowerCase()}`).removeAttr('hidden');
  });

  $('.extend-direction').click((event1) => {
    const newArc = selectedPolynome.extend($(event1.target).html());
    if (newArc) {
      newArc.points.forEach((point) => {
        point.mesh.moved = true;
      })
      newArc.updateArc();
      controlPolynomes.push(newArc);
      addArc(`Arc${controlPolynomes.length}`, controlPolynomes.length - 1);
    }
  })

  $('.extend-direction').mouseenter((event1) => {
    resetControlPointColors();
    selectedPolynome.highlightDirection($(event1.target).html());
  });

  $('.join-direction-selected').mouseenter((event1) => {
    resetControlPointColors();
    if (selectedPolynome) {
      selectedPolynome.highlightDirection($(event1.target).html());
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

    if (!selectedPolynome || !otherPolygone) {
      return;
    }

    const newNet = selectedPolynome.join(otherPolygone, thisDirection, otherDirection);
    if (newNet) {
      newNet.updateArc();
      controlPolynomes.push(newNet);
      addArc(`Arc${controlPolynomes.length}`, controlPolynomes.length - 1);
    }
  });

  $('.join-direction-other').mouseenter((event1) => {
    resetControlPointColors();
    if (otherPolygone) {
      otherPolygone.highlightDirection($(event1.target).html());
    }
  });

  //

  $('.color-slider').on('input', (event1) => {
    const r = $("#r").val();
    const g = $("#g").val();
    const b = $("#b").val();
    $('.color-choice').css('background-color', `rgb(${r}, ${g}, ${b})`);
  })

  $('#apply-color').click(() => {
    const r = $("#r").val();
    const g = $("#g").val();
    const b = $("#b").val();
    if (selectedPolynome) {
      selectedPolynome.defaultColor = [r / 255, g / 255, b / 255, 1.0];
    }
  })

  $('.merge-direction-selected').mouseenter((event1) => {
    resetControlPointColors();
    if (selectedPolynome) {
      selectedPolynome.highlightDirection($(event1.target).html());
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

    if (!selectedPolynome || !otherPolygone) {
      return;
    }

    const newNet = selectedPolynome.merge(otherPolygone, thisDirection, otherDirection);
    if (newNet) {
      newNet.updateArc();
      deleteArc(otherPolygone);
    }
  });

  $('.merge-direction-other').mouseenter((event1) => {
    resetControlPointColors();
    if (otherPolygone) {
      otherPolygone.highlightDirection($(event1.target).html());
    }
  });

  $('#showd1').click((event) => {
    const self = $(event.target);
    if (selectedPolynome) {
      selectedPolynome.showd1 = self.prop('checked');
    }
  });

  $('#showd2').click((event) => {
    const self = $(event.target);
    if (selectedPolynome) {
      selectedPolynome.showd2 = self.prop('checked');
    }
  })

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
    if (selectedPolynome) {
      if (material == 'emerald') {
        selectedPolynome.defaultMaterial = MatFBEmerald;
      } else if (material == 'brass') {
        selectedPolynome.defaultMaterial = MatFBBrass;
      } else if (material == 'gold') {
        selectedPolynome.defaultMaterial = MatFBGold;
      } else if (material == 'ruby') {
        selectedPolynome.defaultMaterial = MatFBRuby;
      } else if (material == 'pearl') {
        selectedPolynome.defaultMaterial = MatFBPearl;
      } else if (material == 'silver') {
        selectedPolynome.defaultMaterial = MatFBSilver;
      } else if (material == 'turquoise') {
        selectedPolynome.defaultMaterial = MatFBTurquoise;
      }

      selectedPolynome.useTexture = false;
      resetcontrolPolyColors();
    }
  });
});

function deleteArc(arc) {
  arc.removeFromNeighbours();
  const index = controlPolynomes.indexOf(arc);
  $(`#${index}`).remove();
  controlPolynomes = controlPolynomes.filter((val, i) => i !== index);

  controlPolynomes.forEach((value, index) => addArc(`Arc${index + 1}`, index));
}

function addArc(arcName, index) {
  const newEntry = $(`<div class="patch-element" id="${index}" data-index="${index}">${arcName}</div>`);
  $('#patches').append(newEntry);

  $('.patch-element').unbind('click').click((event1) => {
    $('.patch-element').removeClass('selected');
    const self = $(event1.target);
    self.addClass('selected');
    const index = parseInt(self.data('index'), 10);

    selectedPolynome = controlPolynomes[index];
    $('.activity-element.selected').click();
  });
  $('.patch-element').unbind('contextmenu').contextmenu((event1) => {
    event1.preventDefault();
    event1.stopImmediatePropagation();

    const self = $(event1.target);
    const index = parseInt(self.attr('id'), 10);

    controlPolynomes[index].removeFromNeighbours();
    controlPolynomes = controlPolynomes.filter((val, i) => i !== index);
    self.remove();

    $('#patches').html('');

    controlPolynomes.forEach((value, index) => addArc(`Arc${index + 1}`, index));
  });

  // for (let i = 0; i < controlPolynomes.length; ++i) {
  //   const net1 = controlPolynomes[i];
  //   const arrPoints1 = net1.arrPoints;
  //   let update = false;
  //   for (let j = 0; j < arrPoints1.length; ++j) {
  //     const point1 = arrPoints1[j];
  //     for (let k = 0; k < controlPolynomes.length; ++k) {
  //       const net2 = controlPolynomes[k];

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
  //     net1.updateArc();
  //   }
  // }
}

function generateInsertTable() {
  const tableDOM = $('<table></table>');
  const tbodyDOM = $('<tbody></tbody>');
  for (let i = 0; i < 4; ++i) {
    const rowDOM = $('<tr></tr>');
    for (let k = 0; k < 3; ++k) {
      const colDOM = $('<td></td>');
      if (k == 0) {
        const inputDOM = $(`<input id="${i}${k}" type="text" value="${i / 4}">`);
        colDOM.append(inputDOM);
        rowDOM.append(colDOM);
      } else if (k == 1) {
        const inputDOM = $(`<input id="${i}${k}" type="text" value="${Math.random()}">`);
        colDOM.append(inputDOM);
        rowDOM.append(colDOM);
      } else if (k == 2) {
        const inputDOM = $(`<input id="${i}${k}" type="text" value="${Math.random()}">`);
        colDOM.append(inputDOM);
        rowDOM.append(colDOM);
      }

    }
    tbodyDOM.append(rowDOM);
  }

  $('#insert').html('');
  tableDOM.append(tbodyDOM);
  $('#insert').append(tableDOM);
  const insertButton = $('<button>Insert</button>');

  insertButton.unbind('click').click(() => {
    let coordinates = new Array(4).fill();
    for (let i = 0; i < 4; ++i) {
      const x = parseFloat($(`#${i}0`).val());
      const y = parseFloat($(`#${i}1`).val());
      const z = parseFloat($(`#${i}2`).val());

      coordinates[i] = new DCoordinate3(x, y, z);

    }

    const newArc = ControlPolygone.insert(coordinates);
    newArc.updateArc();
    controlPolynomes.push(newArc);
    addArc(`Arc${controlPolynomes.length}`, controlPolynomes.length - 1);
  });

  $('#insert').append(insertButton);
}

function generateDropdown(dropdown) {
  dropdown.html('');

  for (let i = 0; i < controlPolynomes.length; ++i) {
    if (selectedPolynome != controlPolynomes[i]) {
      const option = $(`<option class="join-option" value="${i}">Arc${i + 1}</option>`);
      dropdown.append(option);
    }
  }

  dropdown.unbind('change').change(() => {
    const index = parseInt(dropdown.val(), 10);
    if (!Number.isNaN(index)) {
      otherPolygone = controlPolynomes[index];
    }
  });

  dropdown.unbind('hover').hover(() => {
    const index = parseInt(dropdown.val(), 10);
    if (!Number.isNaN(index)) {
      otherPolygone = controlPolynomes[index];
    }
  });
}

function save() {
  const array = controlPolynomes.map((c) => {
    const obj = {};
    obj.points = c.points.map((p) => {
      return {
        coordinates: [p.position.x, p.position.y, p.position.z],
        parents: p.parentPoly.map((p) => controlPolynomes.indexOf(p)),
      }
    });
    obj.neighbours = {
      N: -1,
      S: -1,
    }

    Object.keys(c.neighbours).forEach((key) => {
      if (c.neighbours[key]) {
        obj.neighbours[key] = controlPolynomes.indexOf(c.neighbours[key]);
      }
    })

    return obj;
  });

  const link = document.createElement('a');
  link.download = `arc-${parseInt(Math.random() * 1000000)}.json`
  const blob = new Blob([JSON.stringify(array)], { type: 'text/json' });
  link.href = window.URL.createObjectURL(blob);
  link.click();
}

async function load(path) {
  try {
    const response = await fetch(path, { method: 'GET' });
    const json = await response.json();

    const polynomes = json.map((obj) => ControlPolygone.insert(obj.points.map(point => point.coordinates)));
    polynomes.forEach((poly, index) => {
      if (json[index].neighbours.S != -1) {
        poly.neighbours.S = polynomes[json[index].neighbours.S]
      }

      if (json[index].neighbours.N != -1) {
        poly.neighbours.N = polynomes[json[index].neighbours.N]
        poly.neighbours.N.points[3] = poly.points[0];
      }

      poly.points.forEach((point, pointIndex) => {
        point.parentPoly = json[index].points[pointIndex].parents.map(value => polynomes[value]);
      })
      poly.updateArc();
    });

    controlPolynomes = polynomes;
    $('#patches').html('');
    console.log(polynomes);
    controlPolynomes.forEach((value, index) => addArc(`Arc${index + 1}`, index));

  } catch (e) {
    alert(e.message);
  }
}