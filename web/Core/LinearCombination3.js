class LinearCombination3 {
  constructor(uMin, uMax, dataCount, usageFlag = WebGLRenderingContext.STATIC_DRAW) {
    if (arguments.length < 3) {
      throw new Error('Invalid number of parameters!');
    }
    this.uMin = uMin;
    this.uMax = uMax;
    this.dataCount = dataCount;
    this.vboData = null;
    this.usageFlag = usageFlag;
    this.data = new ColumnMatrix(this.dataCount, DCoordinate3);
    

    this.loaded = false;
    this.program = null;

    glProgramFrom('vert.glsl', 'frag.glsl').then((program) => {
      const gl = globalThis.gl;
      if (gl instanceof WebGLRenderingContext) {
        this.program = program;
        this.vertexLocation = gl.getAttribLocation(this.program, 'in_vert');
        this.matrixLocation = gl.getUniformLocation(this.program, 'u_matrix');
        this.colorLocation = gl.getUniformLocation(this.program, 'u_color');
        this.loaded = true;
      }

    });
  }

  deleteVertexBufferObjectsOfData() {
    if (this.vboData !== null) {
      globalThis.gl.deleteBuffer(this.vboData);
    }
  }

  renderData(renderMode) {
    if (!this.vboData || !this.loaded || !this.program) {
      return false;
    }

    const GL = WebGLRenderingContext;
    const gl = globalThis.gl;

    const allowedRenderModes = [GL.LINE_STRIP, GL.LINE_LOOP, GL.POINTS];

    if (allowedRenderModes.indexOf(renderMode) === -1) {
      return false;
    }

    const cameraPos = [cos(time / 100) * scaleValue, sin(time / 100) * scaleValue, scaleValue];
    let proj = perspective(degToRad(45.0), gl.canvas.width / gl.canvas.height, 1.0, 1000.0);

    const lookat = inverse(lookAt(
      cameraPos,
      [0.0, 0.0, 0.0],
      [0.0, 0.0, 1.0]
    ));

    proj = translate(proj, translateX, translateY, translateZ);

    gl.useProgram(this.program);
    gl.uniformMatrix4fv(this.matrixLocation, false, multiply(proj, lookat))
    gl.enableVertexAttribArray(this.vertexLocation);

    gl.bindBuffer(GL.ARRAY_BUFFER, this.vboData);
    gl.vertexAttribPointer(this.vertexLocation, 3, WebGLRenderingContext.FLOAT, true, 0, 0);

    gl.drawArrays(renderMode, 0, this.data.rowCount);

    gl.bindBuffer(GL.ARRAY_BUFFER, null);
    gl.useProgram(null);
    return true;
  }

  updateVertexBufferObjectsOfData(usageFlag = WebGLRenderingContext.STATIC_DRAW) {
    if (!this.data[0] instanceof DCoordinate3) {
      
      return false;
    }

    const GL = WebGLRenderingContext;
    const gl = globalThis.gl;

    const allowedFlags = [GL.STREAM_DRAW, GL.STATIC_DRAW, GL.DYNAMIC_DRAW];

    if (allowedFlags.indexOf(usageFlag) === -1) {
      return false;
    }

    this.deleteVertexBufferObjectsOfData();

    this.vboData = gl.createBuffer();

    if (!this.vboData) {
      return false;
    }

    gl.bindBuffer(GL.ARRAY_BUFFER, this.vboData);
    const data = new Float32Array(this.data.data.map(([coord]) => [coord.x, coord.y, coord.z]).flat());
    gl.bufferData(GL.ARRAY_BUFFER, data, usageFlag);
    gl.bindBuffer(GL.ARRAY_BUFFER, null);

    return true;
  }

  at(index) {
    return this.data.at(index);
  }

  set(index, data) {
    this.data.set(index, data);
  }

  updateDataForInterpolation(knotVector, dataPointsToInterpolate) {
    const dataCount = this.data.length;

    if (!(knotVector instanceof Array) || !(dataPointsToInterpolate) instanceof Array) {
      throw new Error('knotVector and dataPointsToInterpolate must be of type Array');
    }

    if (dataCount !== knotVector.length || dataCount !== dataPointsToInterpolate.length) {
      return false;
    }

    const collocationMatrix = new RealSquareMatrix(dataCount);
    const currentBlendingFunctionValues = new RowMatrix(dataCount);

    knotVector.forEach((value) => {
      if (!this.blendingFunctionValues(value, currentBlendingFunctionValues)) {
        return false;
      }

      collocationMatrix.data[r] = new Array(currentBlendingFunctionValues.data[0]);
    });
  
    return collocationMatrix.solveLinearSystem(dataPointsToInterpolate, this.data)
  }

  blendingFunctionValues(u, values) {
    throw new Error('blendingFunctionValues must be implemented first!');
  }

  calculateDerivatives(maxOrderOfDerivatives, u, d) {
    throw new Error('calculateDerivatives must be implemented first!');
  }

  generateImage(maxOrderOfDerivatives, divPointCount, usageFlag = WebGLRenderingContext.STATIC_DRAW) {
    const derivatives = new Derivatives(maxOrderOfDerivatives + 1);
    let result = new GenericCurve3(maxOrderOfDerivatives, divPointCount, usageFlag);

    for (let order = 0; order < maxOrderOfDerivatives + 1; ++order) {
      if (!this.calculateDerivatives(maxOrderOfDerivatives, this.uMin, derivatives)) {
        return null;
      }
      result.derivative.data[order][0] = _.cloneDeep(derivatives.at(order));

      if (!this.calculateDerivatives(maxOrderOfDerivatives, this.uMax, derivatives)) {
        return null;
      }
      result.derivative.data[order][divPointCount - 1] = _.cloneDeep(derivatives.at(order));
    }


    const uStep = (this.uMax - this.uMin) / (divPointCount - 1);
    let u = this.uMin;

    for (let i = 1; i < divPointCount - 1; ++i) {
      u += uStep;

      for (let order = 0; order < maxOrderOfDerivatives + 1; ++order) {
        if (!this.calculateDerivatives(maxOrderOfDerivatives, u, derivatives)) {
          return null;
        }
       
        result.derivative.data[order][i] = _.cloneDeep(derivatives.at(order));
      }
    }
    return result;
  }
}