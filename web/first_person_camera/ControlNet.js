class ControlNet {
  constructor() {
    this.points = new Array(4).fill().map(row => []);

    for (let i = 0; i < 4; ++i) {
      for (let j = 0; j < 4; ++j) {
        this.points[i][j] = new ControlPoint(i / 4 + 2, Math.random() / 4, j / 4);
      }
    }

    this.loaded = false;
    this.program = null;

    glProgramFrom('vert.glsl', 'frag.glsl').then((program) => {
      this.program = program;
      this.loaded = true;
      this.vertexLocation = gl.getAttribLocation(this.program, 'in_vert');
      this.colorLocation = gl.getUniformLocation(this.program, 'u_color');
      this.matrixLocation = gl.getUniformLocation(this.program, 'u_matrix');
      this.loaded = true;
    });

    this.linesVbo = null;
    this.lineCount = 0;
    this.generateLinesVBO();
  }

  deleteLinesVBO() {
    if (this.linesVbo) {
      globalThis.gl.deleteBuffer(this.linesVbo);
    }
  }

  generateLinesVBO() {
    let data = [];
    let count = 0;
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
}