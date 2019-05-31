class ControlNet {
  constructor(generate = true) {
    this.points = new Array(4).fill().map(row => []);

    for (let i = 0; i < 4; ++i) {
      for (let j = 0; j < 4; ++j) {
        this.points[i][j] = new ControlPoint(i / 4 + 2, Math.random() / 4, j / 4);
        this.points[i][j].parentNet = [this];
      }
    }

    if (generate) {
      this.patch = this.generatePatch();
      this.image = this.patch.generateImage(30, 30, globalThis.gl.STATIC_DRAW);
      this.image.updateVertexBufferObjects(globalThis.gl.STATIC_DRAW);
      this.image.controlNet = this;
      console.log('here');
    }


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

  deleteLinesVBO() {
    if (this.linesVbo) {
      globalThis.gl.deleteBuffer(this.linesVbo);
    }
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

  render(viewMatrix) {
    for (let i = 0; i < 4; ++i) {
      for (let j = 0; j < 4; ++j) {
        this.points[i][j].render(viewMatrix);
      }
    }

    this._renderLines(viewMatrix);
    this.image.render(viewMatrix, globalThis.gl.TRIANGLES);
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
    this.image = this.patch.generateImage(30, 30, globalThis.gl.STATIC_DRAW);
    this.image.updateVertexBufferObjects(globalThis.gl.STATIC_DRAW);
    this.image.controlNet = this;
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
    } else if (direction == 'W') {
      this.points[0][0].mesh.mat = MatFBTurquoise;
      this.points[1][0].mesh.mat = MatFBTurquoise;
      this.points[2][0].mesh.mat = MatFBTurquoise;
      this.points[3][0].mesh.mat = MatFBTurquoise;
    } else if (direction == 'E') {
      this.points[0][3].mesh.mat = MatFBTurquoise;
      this.points[1][3].mesh.mat = MatFBTurquoise;
      this.points[2][3].mesh.mat = MatFBTurquoise;
      this.points[3][3].mesh.mat = MatFBTurquoise;
    } else if (direction == 'NW') {
      this.points[0][0].mesh.mat = MatFBTurquoise;
    } else if (direction == 'NE') {
      this.points[0][3].mesh.mat = MatFBTurquoise;
    } else if (direction == 'SE') {
      this.points[3][3].mesh.mat = MatFBTurquoise;
    } else if (direction == 'SW') {
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
}