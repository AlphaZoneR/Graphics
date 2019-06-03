class GenericCurve3 {
  constructor(maximumOrderOfDerivatives = 2, pointCount = 0, usageFlag = WebGLRenderingContext.STATIC_DRAW) {
    this.usageFlag = usageFlag;
    this.vboDerivative = new RowMatrix(maximumOrderOfDerivatives + 1);
    this.derivative = new Matrix(maximumOrderOfDerivatives + 1, pointCount);

    this.program = null;
    this.loaded = false;
    this.color = [1, 1, 1, 1];
    this.boundingBox = null;
    this.moved = true;

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
  }

  calculateBoundingBox() {
    if (!this.loaded) {
      return [];
    }

    if (this.boundingBox && !this.moved) {
      return this.boundingBox;
    }

    let xmin = Infinity;
    let xmax = -Infinity;
    let ymin = Infinity;
    let ymax = -Infinity;
    let zmin = Infinity;
    let zmax = -Infinity;

    for (let i = 0; i < this.derivative.columnCount; ++i) {
      let translatedCoordinate = this.derivative.at(0, i);
      if (translatedCoordinate.x < xmin) {
        xmin = translatedCoordinate.x;
      }

      if (translatedCoordinate.x > xmax) {
        xmax = translatedCoordinate.x;
      }

      if (translatedCoordinate.y < ymin) {
        ymin = translatedCoordinate.y;
      }

      if (translatedCoordinate.y > ymax) {
        ymax = translatedCoordinate.y;
      }

      if (translatedCoordinate.z < zmin) {
        zmin = translatedCoordinate.z;
      }

      if (translatedCoordinate.z > zmax) {
        zmax = translatedCoordinate.z;
      }
    }
    
    this.boundingBox = [xmin, xmax, ymin, ymax, zmin, zmax];
    this.moved = false;
    return [xmin, xmax, ymin, ymax, zmin, zmax];
  }

  copy(curve) {
    if (curve instanceof GenericCurve3) {
      this.usageFlag = curve.usageFlag;
      this.vboDerivative = _.cloneDeep(curve.vboDerivative);
      this.derivative = _.cloneDeep(curve.derivative);

      vboUpdateIsPossible = true;

      for (let i = 0; i < curve.derivative.columnCount; ++i) {
        vboUpdateIsPossible &= curve.vboDerivative(i);
      }

      if (vboUpdateIsPossible) {
        this.updateVertexBufferObjects(this.usageFlag);
      }
    }
  }

  deleteVertexBufferObjects() {
    for (let i = 0; i < this.vboDerivative.columnCount; ++i) {
      if (this.vboDerivative.at(i)) {
        globalThis.gl.deleteBuffer(this.vboDerivative.at(i))
        this.vboDerivative.set(i, 0);
      }
    }
  }

  renderDerivatives(viewMatrix, order, renderMode) {
    const maxOrder = this.derivative.rowCount;
    if (order >= maxOrder || !this.vboDerivative.at(order) || !this.loaded) {
      return false;
    }
    const pointCount = this.derivative.columnCount;

    const proj = perspective(degToRad(45.0), gl.canvas.width / gl.canvas.height, 1.0, 1000.0);

    globalThis.gl.useProgram(this.program);
    globalThis.gl.enableVertexAttribArray(this.vertexLocation);

    globalThis.gl.uniformMatrix4fv(this.matrixLocation, false, multiply(proj, viewMatrix))

    globalThis.gl.bindBuffer(WebGLRenderingContext.ARRAY_BUFFER, this.vboDerivative.at(order));
    globalThis.gl.vertexAttribPointer(this.vertexLocation, 3, WebGLRenderingContext.FLOAT, true, 0, 0);
    globalThis.gl.uniform4fv(this.colorLocation, this.color);

    if (order === 0) {
      if (renderMode !== WebGLRenderingContext.LINE_STRIP && renderMode !== WebGLRenderingContext.LINE_LOOP && renderMode !== WebGLRenderingContext.POINTS) {
        globalThis.gl.bindBuffer(WebGLRenderingContext.ARRAY_BUFFER, 0);
        return false;
      }
      globalThis.gl.drawArrays(renderMode, 0, pointCount)
    } else {
      if (renderMode !== WebGLRenderingContext.LINES && renderMode !== WebGLRenderingContext.POINTS) {
        globalThis.gl.bindBuffer(WebGLRenderingContext.ARRAY_BUFFER, null);
        return false;
      }

      globalThis.gl.drawArrays(renderMode, 0, 2 * pointCount);
    }

    globalThis.gl.bindBuffer(WebGLRenderingContext.ARRAY_BUFFER, null);

    return true;
  }

  updateVertexBufferObjects(usageFlag) {
    const GL = WebGLRenderingContext;
    if (usageFlag !== GL.STREAM_DRAW && usageFlag !== GL.DYNAMIC_DRAW && usageFlag !== GL.STATIC_DRAW) {
      return false;
    }

    this.deleteVertexBufferObjects();

    this.usageFlag = usageFlag;

    for (let d = 0; d < this.vboDerivative.columnCount; ++d) {
      this.vboDerivative.set(d, globalThis.gl.createBuffer());
      if (!this.vboDerivative.at(d)) {
        for (let i = 0; i < d; ++i) {
          globalThis.gl.deleteBuffer(this.vboDerivative.get(i));
          this.vboDerivative.set(d, i);
        }
        return false;
      }
    }

    // curve points
    const curvePointSize = this.derivative.columnCount;
    globalThis.gl.bindBuffer(GL.ARRAY_BUFFER, this.vboDerivative.at(0));
    globalThis.gl.bufferData(GL.ARRAY_BUFFER, new Float32Array(this.derivative.getRow(0).map(o => [o.x, o.y, o.z]).flat()), this.usageFlag);
    // higher derivatives

    const higherOrderDerivativeSize = 2 * curvePointSize;

    for (let d = 1; d < this.derivative.rowCount; ++d) {
      const array = new Float32Array(higherOrderDerivativeSize * 3);

      let coordinate = 0;

      for (let i = 0; i < curvePointSize; ++i) {
        let sum = this.derivative.at(0, i);
        sum = sum.add(this.derivative.at(d, i).multiply(0.2));

        for (let j = 0; j < 3; ++j) {
          array[coordinate] = this.derivative.at(0, i).data[j];
          array[coordinate + 3] = sum.data[j];
          ++coordinate;
        }

        coordinate += 3;
      }

      globalThis.gl.bindBuffer(GL.ARRAY_BUFFER, this.vboDerivative.at(d));
      globalThis.gl.bufferData(GL.ARRAY_BUFFER, array, this.usageFlag);
    }

    globalThis.gl.bindBuffer(GL.ARRAY_BUFFER, null);
  }

  setDerivative(order, index, d) {
    if (order >= this.derivative.rowCount || index >= this.derivative.columnCount) {
      return false;
    }
    this.derivative.set(order, index, d);

    return true;
  }

  // setDerivative(order, index, x, y, z) {
  //     if (order >= this.derivative.rowCount || index >= this.derivative.columnCount) {
  //         return false;
  //     }

  //     this.derivative.set(order, index, new DCoordinate3(x, y, z));
  //     // this.derivative.at(order, index).y = y;
  //     // this.derivative.at(order, index).z = z;

  //     return true;
  // }

  getDerivative(order, index) {
    if (order >= this.derivative.rowCount || index >= this.derivative.columnCount) {
      return null;
    }

    return this.derivative.at(order, index);
  }

  get maximumOrderOfDerivatives() {
    return this.derivative.rowCount - 1;
  }

  get pointCount() {
    return this.derivative.columnCount;
  }
}