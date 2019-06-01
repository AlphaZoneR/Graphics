class ControlPolygone {
  constructor(generate = true) {
    this.points = new Array(4);

    for (let i = 0; i < 4; ++i) {
      this.points[i] = new ControlPoint(i / 4 + 2, Math.random() / 4, Math.random() / 4);
      this.points[i].parentPoly = [this];
    }

    if (generate) {
      this.arc = this.generateArc();
      this.image = this.arc.generateImage(2, 30, globalThis.gl.STATIC_DRAW);
      this.image.updateVertexBufferObjects(globalThis.gl.STATIC_DRAW);
      this.image.controlPoly = this;
    }

    this._defaultColor = [1.0, 1.0, 1.0, 1.0];

    this.loaded = false;
    this.program = null;

    if (globalThis.netProgram) {
      this.program = globalThis.netProgram;
      this.loaded = true;
      this.vertexLocation = gl.getAttribLocation(this.program, 'in_vert');
      this.colorLocation = gl.getUniformLocation(this.program, 'in_color');
      this.matrixLocation = gl.getUniformLocation(this.program, 'u_matrix');
    } else {
      glProgramFrom('vert.glsl', 'frag.glsl').then((program) => {
        this.program = program;
        globalThis.netProgram = this.program;
        this.vertexLocation = gl.getAttribLocation(this.program, 'in_vert');
        this.colorLocation = gl.getUniformLocation(this.program, 'in_color');
        this.matrixLocation = gl.getUniformLocation(this.program, 'u_matrix');
        this.loaded = true;
      });
    }

    this.linesVbo = null;
    this.lineCount = 0;
    this.generateLinesVBO();
    this.updated = false;

    this.neighbours = {
      N: null,
      S: null
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
      result.push(this.points[i].mesh);
    }

    return result;
  }

  generateLinesVBO() {
    let data = [];

    for (let i = 0; i < 3; ++i) {
      data.push(...this.points[i].position.data, ...this.points[i + 1].position.data)
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
    globalThis.gl.uniform4fv(this.colorLocation, [1, 1, 1, 1]);

    globalThis.gl.bindBuffer(globalThis.gl.ARRAY_BUFFER, this.linesVbo);
    globalThis.gl.vertexAttribPointer(this.vertexLocation, 3, WebGLRenderingContext.FLOAT, true, 0, 0);
    globalThis.gl.drawArrays(globalThis.gl.LINES, 0, this.lineCount);

    gl.bindBuffer(globalThis.gl.ARRAY_BUFFER, null);
  }

  render(viewMatrix, showControlPolygone) {
    if (showControlPolygone) {
      for (let i = 0; i < 4; ++i) {
        this.points[i].render(viewMatrix);
      }

      this._renderLines(viewMatrix);
    }
    this.image.renderDerivatives(viewMatrix, 0, globalThis.gl.LINE_STRIP);
  }

  generateArc() {
    const arc = new BiquarticArc3();

    for (let i = 0; i < 4; ++i) {
      arc.set(i, this.points[i].position);
    }

    return arc;
  }

  updateArc() {
    this.generateLinesVBO();
    this.arc = this.generateArc();
    this.image = this.arc.generateImage(2, 20, globalThis.gl.STATIC_DRAW);
    this.image.updateVertexBufferObjects(globalThis.gl.STATIC_DRAW);
    this.image.controlPoly = this;
    this.image.color = this._defaultColor;
  }

  set defaultColor(color) {
    this._defaultColor = color;
    this.image.color = color;
  }

  highlightDirection(direction) {
    if (direction == 'N') {
      this.points[0].mesh.mat = MatFBTurquoise;
    } else if (direction == 'S') {
      this.points[3].mesh.mat = MatFBTurquoise;
    }
  }

  move(x, y, z) {
    if (arguments.length < 3) {
      return false;
    }

    for (const point of this.points) {
      if (!point.updated) {
        point.translate(x, y, z, false);
        point.updated = this;
        point.mesh.moved = true;
      }
    }

    this.updated = true;

    for (const key of Object.keys(this.neighbours)) {
      if (this.neighbours[key] && !this.neighbours[key].updated) {
        this.neighbours[key].move(x, y, z);
      }
    }


    for (const point of this.points) {
      if (point.updated == this) {
        point.updated = null;
      }
    }

    this.updated = false;

    this.updateArc();
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

  static insert(coordinates) {
    const newArc = new ControlPolygone(false);

    for (let i = 0; i < 4; ++i) {
      if (coordinates[i] instanceof DCoordinate3) {
        newArc.points[i] = new ControlPoint(...coordinates[i].data)
      } else if (coordinates[i] instanceof Array) {
        newArc.points[i] = new ControlPoint(...coordinates[i]);
      }
      newArc.points[i].parentPoly = [newArc];
    }

    return newArc;
  }

  extend(direction, extendableArc = this, update = true) {
    if (direction == 'N') {
      if (extendableArc.neighbours.N && update) {
        return null;
      }

      const controlPolygone = new ControlPolygone(update);
      const p = extendableArc.points[0];
      const q = _.cloneDeep(extendableArc.points[1]);

      controlPolygone.points[3] = p;
      controlPolygone.points[3].parentPoly.push(controlPolygone);

      for (let i = 1; i < 4; ++i) {
        controlPolygone.points[3 - i] = new ControlPoint(...p.position.add(p.position.subtract(q.position).multiply(i)).data);
      }

      for (let i = 0; i < 3; ++i) {
        controlPolygone.points[i].parentPoly = [controlPolygone];
      }

      if (update) {
        extendableArc.neighbours.N = controlPolygone;
        controlPolygone.neighbours.S = extendableArc;
      }

      return controlPolygone;
    } else if (direction == 'S') {
      if (extendableArc.neighbours.S && update) {
        return null;
      }

      const controlPolygone = new ControlPolygone(update);
      const p = extendableArc.points[3];
      const q = _.cloneDeep(extendableArc.points[2]);

      controlPolygone.points[0] = p;
      controlPolygone.points[0].parentPoly.push(controlPolygone);

      for (let i = 1; i < 4; ++i) {
        controlPolygone.points[i] = new ControlPoint(...p.position.add(p.position.subtract(q.position).multiply(i)).data);
      }

      for (let i = 1; i < 4; ++i) {
        controlPolygone.points[i].parentPoly = [controlPolygone];
      }

      if (update) {
        extendableArc.neighbours.S = controlPolygone;
        controlPolygone.neighbours.N = extendableArc;
      }

      return controlPolygone;
    }
  }

  join(otherArc, thisDirection, otherDirection) {
    const newArc = new ControlPolygone(false);

    let thisFirstPoint = null;
    let thisSecondPoint = [];

    if (thisDirection == 'N') {
      if (this.neighbours.N) {
        return null;
      }

      const p = thisFirstPoint = this.points[0];
      const q = _.cloneDeep(this.points[1]);
      thisSecondPoint = new ControlPoint(...p.position.add(p.position.subtract(q.position)).data)

    } else if (thisDirection == 'S') {
      if (this.neighbours.S) {
        return null;
      }

      const p = thisFirstPoint = this.points[3];
      const q = _.cloneDeep(this.points[2]);
      thisSecondPoint = new ControlPoint(...p.position.add(p.position.subtract(q.position)).data)
    }

    let otherFirstPoint = null;
    let otherSecondPoint = [];

    if (otherDirection == 'N') {
      if (otherArc.neighbours.N) {
        return null;
      }

      const p = otherFirstPoint = otherArc.points[0];
      const q = _.cloneDeep(otherArc.points[1]);
      otherSecondPoint = new ControlPoint(...p.position.add(p.position.subtract(q.position)).data)
    } else if (otherDirection == 'S') {
      if (otherArc.neighbours.N) {
        return null;
      }

      const p = otherFirstPoint = otherArc.points[3];
      const q =  _.cloneDeep(otherArc.points[2]);
      otherSecondPoint = new ControlPoint(...p.position.add(p.position.subtract(q.position)).data);
    }


    thisFirstPoint.parentPoly.push(newArc);
    otherFirstPoint.parentPoly.push(newArc);

    if (thisDirection == 'N') {
      newArc.points[3] = thisFirstPoint;
      newArc.points[2] = thisSecondPoint;
      newArc.points[1] = otherSecondPoint;
      newArc.points[0] = otherFirstPoint;

      this.neighbours.N = newArc;
      newArc.neighbours.S = this;
      otherArc.neighbours.S = newArc;
      newArc.neighbours.N = otherArc;
    } else if (thisDirection == 'S') {
      newArc.points[0] = thisFirstPoint;
      newArc.points[1] = thisSecondPoint;
      newArc.points[2] = otherSecondPoint;
      newArc.points[3] = otherFirstPoint;

      this.neighbours.S = newArc;
      newArc.neighbours.N = this;
      otherArc.neighbours.N = newArc;
      newArc.neighbours.S = otherArc;
    }

    return newArc;
  }

  removeFromNeighbours() {
    if (this.neighbours.N) {
      this.neighbours.N.neighbours.S = null;
    }

    if (this.neighbours.S) {
      this.neighbours.S.neighbours.N = null;
    }

    this.points.forEach(point => point.parentPoly = point.parentPoly.filter(ppoly => ppoly != this));
  }

  merge(otherArc, thisDirection, otherDirection) {
    let thisFirstPoint = null;
    let thisSecondPoint = [];

    if (thisDirection == 'S') {
      if (this.neighbours.S) {
        return null;
      }

      thisFirstPoint = _.cloneDeep(this.points[0]);
      thisSecondPoint = _.cloneDeep(this.points[1]);
    } else if (thisDirection == 'N') {
      if (this.neighbours.N) {
        return null;
      }

      thisFirstPoint = _.cloneDeep(this.points[3]);
      thisSecondPoint = _.cloneDeep(this.points[2]);
    }

    let otherFirstPoint = null;
    let otherSecondPoint = [];

    if (otherDirection == 'S') {
      if (this.neighbours.S) {
        return null;
      }

      otherFirstPoint = _.cloneDeep(otherArc.points[0]);
      otherSecondPoint = _.cloneDeep(otherArc.points[1]);
    } else if (otherDirection == 'N') {
      if (this.neighbours.N) {
        return null;
      }

      otherFirstPoint = _.cloneDeep(otherArc.points[3]);
      otherSecondPoint = _.cloneDeep(otherArc.points[2]);
    }

    if (thisDirection == 'N') {
      this.points[3] = thisFirstPoint;
      this.points[2] = thisSecondPoint;
      this.points[1] = otherSecondPoint;
      this.points[0] = otherFirstPoint;
    } else if (thisDirection == 'S') {
      this.points[0] = thisFirstPoint;
      this.points[1] = thisSecondPoint;
      this.points[2] = otherSecondPoint;
      this.points[3] = otherFirstPoint;
    }
    this.points.forEach((point) => point.parentPoly = [this]);

    return this;

  }

  get arrPoints() {
    return this.points;
  }
}