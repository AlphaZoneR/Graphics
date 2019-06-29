const TYPES = {
  CORNER: 0,
  EDGE: 1,
  INSIDE: 2,
}

function updatePointNeighbours(net, i, j) {
  if (i == 0 || i == 3 || j == 0 || j == 3) {
    net.points[i][j].type = TYPES.EDGE;
  } else {
    net.points[i][j].type = TYPES.INSIDE;
  }

  if ((i == 0 && j == 0) || (i == 0 && j == 3) || (i == 3 && j == 0) || (i == 3 && j == 3)) {
    net.points[i][j].type = TYPES.CORNER;
  }

  if (i > 0) {
    net.points[i][j].neighbours.N = net.points[i - 1][j];
  }

  if (i < 3) {
    net.points[i][j].neighbours.S = net.points[i + 1][j];
  }

  if (j > 0) {
    net.points[i][j].neighbours.W = net.points[i][j - 1];
  }

  if (j < 3) {
    net.points[i][j].neighbours.E = net.points[i][j + 1];
  }

  if (i > 0 && j > 0) {
    net.points[i][j].neighbours.NW = net.points[i - 1][j - 1];
  }

  if (i > 0 && j < 3) {
    net.points[i][j].neighbours.NE = net.points[i - 1][j + 1];
  }

  if (i < 3 && j < 3) {
    net.points[i][j].neighbours.SE = net.points[i + 1][j + 1];
  }

  if (i < 3 && j > 0) {
    net.points[i][j].neighbours.SW = net.points[i + 1][j - 1];
  }
}

class ControlNet {
  constructor(generate = true) {
    this.points = new Array(4).fill().map(row => []);

    for (let i = 0; i < 4; ++i) {
      for (let j = 0; j < 4; ++j) {
        this.points[i][j] = new ControlPoint(i / 4 + 2, Math.random() / 4, j / 4);
        this.points[i][j].parentNet = [this];
      }
    }

    for (let i = 0; i < 4; ++i) {
      for (let j = 0; j < 4; ++j) {
        updatePointNeighbours(this, i, j);
      }
    }

    this._isoCount = 4;

    if (generate) {
      this.patch = this.generatePatch();
      this.updateVISOLines(this._isoCount);
      this.updateUISOLines(this._isoCount);
      this.image = this.patch.generateImage(10, 10, globalThis.gl.STATIC_DRAW);
      this.image.updateVertexBufferObjects(globalThis.gl.STATIC_DRAW);
      this.image.controlNet = this;
    }

    this.defaultMaterial = MatFBBrass;
    this._useTexture = false;
    this._texture = textures['terrain1'];

    this.loaded = false;
    this.program = null;

    if (globalThis.netProgram) {
      this.program = globalThis.netProgram;
      this.loaded = true;
      this.vertexLocation = gl.getAttribLocation(this.program, 'in_vert');
      this.colorLocation = gl.getUniformLocation(this.program, 'u_color');
      this.matrixLocation = gl.getUniformLocation(this.program, 'u_matrix');
    } else {
      glProgramFrom('vert.glsl', 'frag.glsl').then((program) => {
        this.program = program;
        globalThis.netProgram = this.program;
        this.vertexLocation = gl.getAttribLocation(this.program, 'in_vert');
        this.colorLocation = gl.getUniformLocation(this.program, 'u_color');
        this.matrixLocation = gl.getUniformLocation(this.program, 'u_matrix');
        this.loaded = true;
      });
    }


    this.linesVbo = null;
    this.lineCount = 0;
    this.generateLinesVBO();
    this.updated = false;

    this.neighbours = {
      NW: null,
      N: null,
      NE: null,
      E: null,
      SE: null,
      S: null,
      SW: null,
      W: null,
    }
  }

  updateUISOLines(count = 4) {
    this.uisolines = this.patch.generateUIsoparametricLines(count, 1, 20);
    this.uisolines.data[0].forEach(line => line.updateVertexBufferObjects(WebGLRenderingContext.STATIC_DRAW));
  }

  updateVISOLines(count = 4) {
    this.visolines = this.patch.generateVIsoparametricLines(count, 1, 20);
    this.visolines.data[0].forEach(line => line.updateVertexBufferObjects(WebGLRenderingContext.STATIC_DRAW));
  }

  deleteLinesVBO() {
    if (this.linesVbo) {
      globalThis.gl.deleteBuffer(this.linesVbo);
    }
  }

  set useTexture(boolean) {
    this.image.useTexture = boolean;
    if (boolean) {
      this.defaultMaterial = MatFBPearl;
      this.image.mat = MatFBPearl;
    }
    this._useTexture = boolean;
  }

  get useTexture() {
    return this._useTexture;
  }

  set texture(text) {
    this._texture = text;
    this.image.texture = text;
  }

  get controlPointMeshes() {
    const result = [];

    for (let i = 0; i < 4; ++i) {
      for (let j = 0; j < 4; ++j) {
        result.push(this.points[i][j].mesh);
      }
    }

    return result;
  }

  generateLinesVBO() {
    let data = [];
    for (let i = 0; i < 4; ++i) {
      for (let j = 0; j < 4; ++j) {
        if (i + 1 < 4) {
          data.push(...this.points[i][j].position.data, ...this.points[i + 1][j].position.data);
        }

        if (j + 1 < 4) {
          data.push(...this.points[i][j].position.data, ...this.points[i][j + 1].position.data);
        }
      }
    }

    this.lineCount = data.length / 3;

    const GL = WebGLRenderingContext;

    this.deleteLinesVBO();

    this.linesVbo = globalThis.gl.createBuffer();
    globalThis.gl.bindBuffer(GL.ARRAY_BUFFER, this.linesVbo);
    globalThis.gl.bufferData(GL.ARRAY_BUFFER, new Float32Array(data), GL.STATIC_DRAW);
    globalThis.gl.bindBuffer(GL.ARRAY_BUFFER, null);
  }

  _renderUIsoLines(viewMatrix) {
    if (this.uisolines) {
      globalThis.gl.disable(gl.DEPTH_TEST);
      this.uisolines.data[0].forEach((line) => {
        line.renderDerivatives(viewMatrix, 0, WebGLRenderingContext.LINE_STRIP);
      });
      globalThis.gl.enable(gl.DEPTH_TEST);
    }
  }

  _renderVIsoLines(viewMatrix) {
    if (this.visolines) {
      globalThis.gl.disable(gl.DEPTH_TEST);
      this.visolines.data[0].forEach((line) => {
        line.renderDerivatives(viewMatrix, 0, WebGLRenderingContext.LINE_STRIP);
      });
      globalThis.gl.enable(gl.DEPTH_TEST);
    }
  }

  _renderLines(viewMatrix) {
    if (!this.loaded || !this.program) {
      return false;
    }

    const proj = perspective(degToRad(45.0), gl.canvas.width / gl.canvas.height, 1.0, 1000.0);

    globalThis.gl.useProgram(this.program);
    globalThis.gl.enableVertexAttribArray(this.vertexLocation);

    globalThis.gl.uniformMatrix4fv(this.matrixLocation, false, multiply(proj, viewMatrix))

    globalThis.gl.bindBuffer(globalThis.gl.ARRAY_BUFFER, this.linesVbo);
    globalThis.gl.vertexAttribPointer(this.vertexLocation, 3, WebGLRenderingContext.FLOAT, true, 0, 0);
    globalThis.gl.drawArrays(globalThis.gl.LINES, 0, this.lineCount);

    gl.bindBuffer(globalThis.gl.ARRAY_BUFFER, null);
  }

  render(viewMatrix, showControlNet) {
    this.image.render(viewMatrix, globalThis.gl.TRIANGLES);
    this._renderUIsoLines(viewMatrix);
    this._renderVIsoLines(viewMatrix);
    if (showControlNet) {
      this._renderLines(viewMatrix);
      for (let i = 0; i < 4; ++i) {
        for (let j = 0; j < 4; ++j) {
          this.points[i][j].render(viewMatrix);
        }
      }
    }

  }

  set isoCount(value) {
    this._isoCount = value;
    this.updateUISOLines(value);
    this.updateVISOLines(value);
  }

  generatePatch() {
    const patch = new BiquarticPatch3();

    for (let i = 0; i < 4; ++i) {
      for (let j = 0; j < 4; ++j) {
        patch.setData(i, j, ...this.points[i][j].position.data);
      }
    }

    return patch;
  }

  updatePatch() {
    this.generateLinesVBO();
    this.patch = this.generatePatch();
    this.image = this.patch.generateImage(10, 10, globalThis.gl.STATIC_DRAW);
    this.image.updateVertexBufferObjects(globalThis.gl.STATIC_DRAW);
    this.updateVISOLines(this._isoCount);
    this.updateUISOLines(this._isoCount);
    this.image.controlNet = this;
    this.image.mat = this.defaultMaterial;
    this.image.useTexture = this._useTexture;
    this.image.texture = this._texture;
  }

  highlightDirection(direction) {
    if (direction == 'N') {
      this.points[0].forEach(point => {
        point.mesh.mat = MatFBTurquoise;
      });
    } else if (direction == 'S') {
      this.points[3].forEach(point => {
        point.mesh.mat = MatFBTurquoise;
      });
    } else if (direction == 'E') {
      this.points[0][0].mesh.mat = MatFBTurquoise;
      this.points[1][0].mesh.mat = MatFBTurquoise;
      this.points[2][0].mesh.mat = MatFBTurquoise;
      this.points[3][0].mesh.mat = MatFBTurquoise;
    } else if (direction == 'W') {
      this.points[0][3].mesh.mat = MatFBTurquoise;
      this.points[1][3].mesh.mat = MatFBTurquoise;
      this.points[2][3].mesh.mat = MatFBTurquoise;
      this.points[3][3].mesh.mat = MatFBTurquoise;
    } else if (direction == 'NE') {
      this.points[0][0].mesh.mat = MatFBTurquoise;
    } else if (direction == 'NW') {
      this.points[0][3].mesh.mat = MatFBTurquoise;
    } else if (direction == 'SW') {
      this.points[3][3].mesh.mat = MatFBTurquoise;
    } else if (direction == 'SE') {
      this.points[3][0].mesh.mat = MatFBTurquoise;
    }
  }

  move(x, y, z) {
    if (arguments.length < 3) {
      return false;
    }

    for (const row of this.points) {
      for (const point of row) {
        if (!point.updated) {
          point.translate(x, y, z, false);
          point.updated = this;
          point.mesh.moved = true;
        }
      }
    }
    this.updated = true;

    for (const key of Object.keys(this.neighbours)) {
      if (this.neighbours[key] && !this.neighbours[key].updated) {
        this.neighbours[key].move(x, y, z);
      }
    }


    for (const row of this.points) {
      for (const point of row) {
        if (point.updated == this) {
          point.updated = null;
        }
      }
    }

    this.updated = false;

    this.updatePatch();
  }

  color() {
    this.image.mat = MatFBEmerald;

    this.updated = true;
    for (const key of Object.keys(this.neighbours)) {
      if (this.neighbours[key] && !this.neighbours[key].updated) {
        this.neighbours[key].color();
      }
    }
    this.updated = false;
  }

  static insert(coordinates, material = MatFBBrass) {
    const newNet = new ControlNet(false);

    for (let i = 0; i < 4; ++i) {
      for (let j = 0; j < 4; ++j) {
        if (coordinates[i][j] instanceof DCoordinate3) {
          newNet.points[i][j] = new ControlPoint(...coordinates[i][j].data)
        } else if (coordinates[i][j] instanceof Array) {
          newNet.points[i][j] = new ControlPoint(...coordinates[i][j]);
        }
        newNet.points[i][j].parentNet = [newNet];
      }
    }

    for (let i = 0; i < 4; ++i) {
      for (let j = 0; j < 4; ++j) {
        updatePointNeighbours(newNet, i, j);
        newNet.points[i][j].mesh.moved = true;
      }
    }

    return newNet;
  }

  extend(direction, extendablePatch = this, update = true) {
    if (direction == 'N') {
      if (extendablePatch.neighbours.N && update) {
        return null;
      }

      const controlNet = new ControlNet(update);
      const p = extendablePatch.points[0];
      const q = _.cloneDeep(extendablePatch.points[1]);

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
          updatePointNeighbours(controlNet, i, j);
        }
      }

      for (let i = 0; i < 4; ++i) {
        extendablePatch.points[0][i].neighbours.N = controlNet.points[2][i];

        if (i > 0) {
          extendablePatch.points[0][i].neighbours.NW = controlNet.points[2][i - 1];
        }

        if (i < 3) {
          extendablePatch.points[0][i].neighbours.NE = controlNet.points[2][i + 1];
        }
      }

      if (update) {
        extendablePatch.neighbours.N = controlNet;
        controlNet.neighbours.S = extendablePatch;
      }

      return controlNet;
    } else if (direction == 'S') {
      if (extendablePatch.neighbours.S && update) {
        return null;
      }

      const controlNet = new ControlNet(update);
      const p = extendablePatch.points[3];
      const q = _.cloneDeep(extendablePatch.points[2]);

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
          updatePointNeighbours(controlNet, i, j);
        }
      }

      for (let i = 0; i < 4; ++i) {
        extendablePatch.points[3][i].neighbours.S = controlNet.points[1][i];

        if (i > 0) {
          extendablePatch.points[3][i].neighbours.SW = controlNet.points[1][i - 1];
        }

        if (i < 3) {
          extendablePatch.points[3][i].neighbours.SE = controlNet.points[1][i + 1];
        }
      }

      if (update) {
        extendablePatch.neighbours.S = controlNet;
        controlNet.neighbours.N = extendablePatch;
      }

      return controlNet;
    } else if (direction == 'E') {
      if (extendablePatch.neighbours.W && update) {
        return null;
      }
      const controlNet = new ControlNet(update);
      const p = [extendablePatch.points[0][0], extendablePatch.points[1][0], extendablePatch.points[2][0], extendablePatch.points[3][0]];
      const q = _.cloneDeep([extendablePatch.points[0][1], extendablePatch.points[1][1], extendablePatch.points[2][1], extendablePatch.points[3][1]]);

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
          updatePointNeighbours(controlNet, i, j);
        }
      }

      for (let i = 0; i < 4; ++i) {
        extendablePatch.points[i][0].neighbours.W = controlNet.points[i][2];

        if (i > 0) {
          extendablePatch.points[i][0].neighbours.NW = controlNet.points[i - 1][2];
        }

        if (i < 3) {
          extendablePatch.points[i][0].neighbours.SW = controlNet.points[i + 1][2];
        }
      }

      if (update) {
        extendablePatch.neighbours.W = controlNet;
        controlNet.neighbours.E = extendablePatch;
      }

      return controlNet;

    } else if (direction == 'W') {
      if (extendablePatch.neighbours.E && update) {
        return null;
      }

      const controlNet = new ControlNet(update);
      const p = [extendablePatch.points[0][3], extendablePatch.points[1][3], extendablePatch.points[2][3], extendablePatch.points[3][3]];
      const q = _.cloneDeep([extendablePatch.points[0][2], extendablePatch.points[1][2], extendablePatch.points[2][2], extendablePatch.points[3][2]]);

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
          updatePointNeighbours(controlNet, i, j);
        }
      }

      for (let i = 0; i < 4; ++i) {
        extendablePatch.points[i][3].neighbours.E = controlNet.points[i][1];

        if (i > 0) {
          extendablePatch.points[i][3].neighbours.NE = controlNet.points[i - 1][1];
        }

        if (i < 3) {
          extendablePatch.points[i][3].neighbours.SE = controlNet.points[i + 1][1];
        }
      }

      if (update) {
        extendablePatch.neighbours.E = controlNet;
        controlNet.neighbours.W = extendablePatch;
      }

      return controlNet;

    } else if (direction == 'NE') {
      if (extendablePatch.neighbours.NE) {
        return null;
      }

      const NORTH = this.extend('N', extendablePatch, false);
      const controlNet = this.extend('E', NORTH, false);

      if (extendablePatch.neighbours.N) {
        for (let i = 0; i < 4; ++i) {
          controlNet.points[i][3] = extendablePatch.neighbours.N.points[i][0];
          controlNet.points[i][3].parentNet.push(controlNet);
        }
      }

      if (extendablePatch.neighbours.E) {
        for (let i = 0; i < 4; ++i) {
          controlNet.points[3][i] = extendablePatch.neighbours.E.points[0][i];
          controlNet.points[3][i].parentNet.push(controlNet);
        }
      }

      if (update) {
        extendablePatch.neighbours.NE = controlNet;
        controlNet.neighbours.SW = extendablePatch;
      }

      return controlNet;
    } else if (direction == 'NW') {
      if (extendablePatch.neighbours.NW) {
        return null;
      }

      const NORTH = this.extend('N', extendablePatch, false);
      const controlNet = this.extend('W', NORTH, false);

      if (update) {
        extendablePatch.neighbours.NW = controlNet;
        controlNet.neighbours.SE = extendablePatch;
      }

      return controlNet;
    } else if (direction == 'SE') {
      if (extendablePatch.neighbours.SW) {
        return null;
      }

      const NORTH = this.extend('S', extendablePatch, false);
      const controlNet = this.extend('W', NORTH, false);

      if (update) {
        extendablePatch.neighbours.SW = controlNet;
        controlNet.neighbours.NE = extendablePatch;
      }

      return controlNet;
    } else if (direction == 'SW') {
      if (extendablePatch.neighbours.SE) {
        return null;
      }

      const NORTH = this.extend('S', extendablePatch, false);
      const controlNet = this.extend('E', NORTH, false);

      if (update) {
        extendablePatch.neighbours.SE = controlNet;
        controlNet.neighbours.NW = extendablePatch;
      }

      return controlNet;
    }
  }

  join(otherNet, thisDirection, otherDirection) {
    const newNet = new ControlNet(false);

    let thisFirstRow = null;
    let thisSecondRow = [];

    if (thisDirection == 'N') {
      if (this.neighbours.N) {
        return null;
      }

      const p = this.points[0];
      const q = _.cloneDeep(this.points[1]);

      thisFirstRow = p;
      for (let j = 0; j < 4; ++j) {
        const ctrlp = new ControlPoint(...p[j].position.add(p[j].position.subtract(q[j].position).multiply(1)).data);
        ctrlp.parentNet = [newNet];
        thisSecondRow.push(ctrlp);
      }

    } else if (thisDirection == 'S') {
      if (this.neighbours.S) {
        return null;
      }

      const p = this.points[3];
      const q = _.cloneDeep(this.points[2]);

      thisFirstRow = p;

      for (let j = 0; j < 4; ++j) {
        const ctrlp = new ControlPoint(...p[j].position.add(p[j].position.subtract(q[j].position).multiply(1)).data);
        ctrlp.parentNet = [newNet];
        thisSecondRow.push(ctrlp);
      }
    } else if (thisDirection == 'W') {
      if (this.neighbours.W) {
        return null;
      }

      const p = [this.points[0][0], this.points[1][0], this.points[2][0], this.points[3][0]];
      const q = _.cloneDeep([this.points[0][1], this.points[1][1], this.points[2][1], this.points[3][1]]);


      thisFirstRow = p;

      for (let j = 0; j < 4; ++j) {
        const ctrlp = new ControlPoint(...p[j].position.add(p[j].position.subtract(q[j].position).multiply(1)).data);
        ctrlp.parentNet = [newNet];
        thisSecondRow.push(ctrlp);
      }
    } else if (thisDirection == 'E') {
      if (this.neighbours.E) {
        return null;
      }

      const p = [this.points[0][3], this.points[1][3], this.points[2][3], this.points[3][3]];
      const q = _.cloneDeep([this.points[0][2], this.points[1][2], this.points[2][2], this.points[3][2]]);

      thisFirstRow = p;

      for (let j = 0; j < 4; ++j) {
        const ctrlp = new ControlPoint(...p[j].position.add(p[j].position.subtract(q[j].position).multiply(1)).data);
        ctrlp.parentNet = [newNet];
        thisSecondRow.push(ctrlp);
      }
    }

    let otherFirstRow = null;
    let otherSecondRow = [];

    if (otherDirection == 'N') {
      if (otherNet.neighbours.N) {
        return null;
      }

      const p = otherNet.points[0];
      const q = _.cloneDeep(otherNet.points[1]);

      otherFirstRow = p;
      for (let j = 0; j < 4; ++j) {
        const ctrlp = new ControlPoint(...p[j].position.add(p[j].position.subtract(q[j].position).multiply(1)).data);
        ctrlp.parentNet = [newNet];
        otherSecondRow.push(ctrlp);
      }

    } else if (otherDirection == 'S') {
      if (otherNet.neighbours.N) {
        return null;
      }

      const p = otherNet.points[3];
      const q = _.cloneDeep(otherNet.points[2]);

      otherFirstRow = p;

      for (let j = 0; j < 4; ++j) {
        const ctrlp = new ControlPoint(...p[j].position.add(p[j].position.subtract(q[j].position).multiply(1)).data);
        ctrlp.parentNet = [newNet];
        otherSecondRow.push(ctrlp);
      }
    } else if (otherDirection == 'W') {
      if (otherNet.neighbours.W) {
        return null;
      }

      const p = [otherNet.points[0][0], otherNet.points[1][0], otherNet.points[2][0], otherNet.points[3][0]];
      const q = _.cloneDeep([otherNet.points[0][1], otherNet.points[1][1], otherNet.points[2][1], otherNet.points[3][1]]);


      otherFirstRow = p;

      for (let j = 0; j < 4; ++j) {
        const ctrlp = new ControlPoint(...p[j].position.add(p[j].position.subtract(q[j].position).multiply(1)).data);
        ctrlp.parentNet = [newNet];
        otherSecondRow.push(ctrlp);
      }
    } else if (otherDirection == 'E') {
      if (otherNet.neighbours.E) {
        return null;
      }

      const p = [otherNet.points[0][3], otherNet.points[1][3], otherNet.points[2][3], otherNet.points[3][3]];
      const q = _.cloneDeep([otherNet.points[0][2], otherNet.points[1][2], otherNet.points[2][2], otherNet.points[3][2]]);

      otherFirstRow = p;

      for (let j = 0; j < 4; ++j) {
        const ctrlp = new ControlPoint(...p[j].position.add(p[j].position.subtract(q[j].position).multiply(1)).data);
        ctrlp.parentNet = [newNet];
        otherSecondRow.push(ctrlp);
      }
    }

    for (let i = 0; i < 4; ++i) {
      thisFirstRow[i].parentNet.push(newNet);
      otherFirstRow[i].parentNet.push(newNet);
    }

    if (thisDirection == 'N') {
      newNet.points[3] = thisFirstRow;
      newNet.points[2] = thisSecondRow;
      newNet.points[1] = otherSecondRow;
      newNet.points[0] = otherFirstRow;

      this.neighbours.N = newNet;
      newNet.neighbours.S = this;
      otherNet.neighbours.S = newNet;
      newNet.neighbours.N = otherNet;
    } else if (thisDirection == 'S') {
      newNet.points[0] = thisFirstRow;
      newNet.points[1] = thisSecondRow;
      newNet.points[2] = otherSecondRow;
      newNet.points[3] = otherFirstRow;

      this.neighbours.S = newNet;
      newNet.neighbours.N = this;
      otherNet.neighbours.N = newNet;
      newNet.neighbours.S = otherNet;
    } else if (thisDirection == 'W') {
      for (let j = 0; j < 4; ++j) {
        newNet.points[j][3] = thisFirstRow[3 - j];
      }

      for (let j = 0; j < 4; ++j) {
        newNet.points[j][2] = thisSecondRow[3 - j];
      }

      for (let j = 0; j < 4; ++j) {
        newNet.points[j][1] = otherSecondRow[3 - j];
      }

      for (let j = 0; j < 4; ++j) {
        newNet.points[j][0] = otherFirstRow[3 - j];
      }

      this.neighbours.W = newNet;
      newNet.neighbours.E = this;
      otherNet.neighbours.E = newNet;
      newNet.neighbours.W = otherNet;
    } else if (thisDirection = 'E') {
      for (let j = 0; j < 4; ++j) {
        newNet.points[j][3] = otherFirstRow[j];
      }

      for (let j = 0; j < 4; ++j) {
        newNet.points[j][2] = otherSecondRow[j];
      }

      for (let j = 0; j < 4; ++j) {
        newNet.points[j][1] = thisSecondRow[j];
      }

      for (let j = 0; j < 4; ++j) {
        newNet.points[j][0] = thisFirstRow[j];
      }

      this.neighbours.E = newNet;
      newNet.neighbours.W = this;
      otherNet.neighbours.W = newNet;
      newNet.neighbours.E = otherNet;
    }

    for (let i = 0; i < 4; ++i) {
      for (let j = 0; j < 4; ++j) {
        updatePointNeighbours(newNet, i, j);
      }
    }

    return newNet;
  }

  removeFromNeighbours() {
    if (this.neighbours.N) {
      this.neighbours.N.neighbours.S = null;
    }

    if (this.neighbours.S) {
      this.neighbours.S.neighbours.N = null;
    }

    if (this.neighbours.W) {
      this.neighbours.W.neighbours.E = null;
    }

    if (this.neighbours.E) {
      this.neighbours.E.neighbours.W = null;
    }

    if (this.neighbours.NW) {
      this.neighbours.NW.neighbours.SE = null;
    }

    if (this.neighbours.NE) {
      this.neighbours.NE.neighbours.SW = null;
    }

    if (this.neighbours.SE) {
      this.neighbours.SE.neighbours.NW = null;
    }

    if (this.neighbours.SW) {
      this.neighbours.SW.neighbours.NE = null;
    }

    this.points.forEach(row => row.forEach(point => point.parentNet = point.parentNet.filter(pnet => pnet != this)));
  }

  merge(otherNet, thisDirection, otherDirection) {
    let thisFirstRow = null;
    let thisSecondRow = [];

    if (thisDirection == 'S') {
      if (this.neighbours.S) {
        return null;
      }

      thisFirstRow = _.cloneDeep(this.points[0]);
      thisSecondRow = _.cloneDeep(this.points[1]);
    } else if (thisDirection == 'N') {
      if (this.neighbours.N) {
        return null;
      }

      thisFirstRow = _.cloneDeep(this.points[3]);
      thisSecondRow = _.cloneDeep(this.points[2]);
    } else if (thisDirection == 'E') {
      if (this.neighbours.E) {
        return null;
      }

      thisFirstRow = _.cloneDeep([this.points[0][0], this.points[1][0], this.points[2][0], this.points[3][0]]);
      thisSecondRow = _.cloneDeep([this.points[0][1], this.points[1][1], this.points[2][1], this.points[3][1]]);
    } else if (thisDirection == 'W') {
      if (this.neighbours.W) {
        return null;
      }

      thisFirstRow = _.cloneDeep([this.points[0][3], this.points[1][3], this.points[2][3], this.points[3][3]]);
      thisSecondRow = _.cloneDeep([this.points[0][2], this.points[1][2], this.points[2][2], this.points[3][2]]);
    }

    let otherFirstRow = null;
    let otherSecondRow = [];

    if (otherDirection == 'S') {
      if (this.neighbours.S) {
        return null;
      }

      otherFirstRow = _.cloneDeep(otherNet.points[0]);
      otherSecondRow = _.cloneDeep(otherNet.points[1]);
    } else if (otherDirection == 'N') {
      if (this.neighbours.N) {
        return null;
      }

      otherFirstRow = _.cloneDeep(otherNet.points[3]);
      otherSecondRow = _.cloneDeep(otherNet.points[2]);
    } else if (otherDirection == 'E') {
      if (this.neighbours.E) {
        return null;
      }

      otherFirstRow = _.cloneDeep([otherNet.points[0][0], otherNet.points[1][0], otherNet.points[2][0], otherNet.points[3][0]]);
      otherSecondRow = _.cloneDeep([otherNet.points[0][1], otherNet.points[1][1], otherNet.points[2][1], otherNet.points[3][1]]);
    } else if (otherDirection == 'W') {
      if (this.neighbours.W) {
        return null;
      }

      otherFirstRow = _.cloneDeep([otherNet.points[0][3], otherNet.points[1][3], otherNet.points[2][3], otherNet.points[3][3]]);
      otherSecondRow = _.cloneDeep([otherNet.points[0][2], otherNet.points[1][2], otherNet.points[2][2], otherNet.points[3][2]]);
    }

    if (thisDirection == 'N') {
      this.points[3] = thisFirstRow;
      this.points[2] = thisSecondRow;
      this.points[1] = otherSecondRow;
      this.points[0] = otherFirstRow;
    } else if (thisDirection == 'S') {
      this.points[0] = thisFirstRow;
      this.points[1] = thisSecondRow;
      this.points[2] = otherSecondRow;
      this.points[3] = otherFirstRow;
    } else if (thisDirection == 'W') {
      for (let j = 0; j < 4; ++j) {
        this.points[j][3] = thisFirstRow[j];
      }

      for (let j = 0; j < 4; ++j) {
        this.points[j][2] = thisSecondRow[j];
      }

      for (let j = 0; j < 4; ++j) {
        this.points[j][1] = otherSecondRow[j];
      }

      for (let j = 0; j < 4; ++j) {
        this.points[j][0] = otherFirstRow[j];
      }
    } else if (thisDirection = 'E') {
      for (let j = 0; j < 4; ++j) {
        this.points[j][3] = otherFirstRow[j];
      }

      for (let j = 0; j < 4; ++j) {
        this.points[j][2] = otherSecondRow[j];
      }

      for (let j = 0; j < 4; ++j) {
        this.points[j][1] = thisSecondRow[j];
      }

      for (let j = 0; j < 4; ++j) {
        this.points[j][0] = thisFirstRow[j];
      }
    }

    this.points.forEach(row => row.forEach(point => point.parentNet = [this]));

    return this;

  }

  get arrPoints() {
    const result = [];

    for (let i = 0; i < 4; ++i) {
      for (let j = 0; j < 4; ++j) {
        result.push(this.points[i][j]);
      }
    }

    return result;
  }
}