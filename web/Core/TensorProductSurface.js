class PartialDerivatives extends TriangularMatrix {
  constructor(maximumOrderOfPartialDerivatives = 1) {
    super(maximumOrderOfPartialDerivatives);
  }

  loadNullVectors() {
    for (let i = 0; i < this.rowCount; ++i) {
      for (let j = 0; j <= i; ++j) {
        this.data[i][j] = new DCoordinate3();
      }
    }
  }
}

class TensorProductSurface {
  constructor(uMin, uMax, vMin, vMax, rowCount = 4, columnCount = 4, uClosed = false, vClosed = false) {
    if (arguments.length < 4) {
      throw new Error('Invalid number of arguments provided!');
    }

    this.uClosed = uClosed;
    this.vClosed = vClosed;
    this.uMin = uMin;
    this.uMax = uMax;
    this.vMin = vMin;
    this.vMax = vMax;
    this.vboData = null;
    this.data = new Matrix(rowCount, columnCount);

    this.data.data = this.data.data.map(row => row.map(e => new DCoordinate3()));

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

  setData(row, column, x, y, z) {
    if (arguments.length < 3) {
      throw new Error('Invalid number of arguments provided!');
    }

    if (row >= this.data.rowCount || column >= this.data.columnCount) {
      return false;
    }

    if (arguments.length === 3 && x instanceof DCoordinate3) {
      this.data.data[row][column] = _.cloneDeep(x);
    } else {
      this.data.data[row][column] = new DCoordinate3(x, y, z);
    }
  }

  getData(row, colum) {
    if (row >= this.data.rowCount || column >= this.data.columnCount) {
      return null;
    }

    return new Float32Array(this.data.data[row][colum].data);
  }

  deleteVertexBufferObjectsOfData() {
    if (this.vboData) {
      globalThis.gl.deleteBuffer(this.vboData);
      this.vboData = null;
    }
  }

  updateVertexBufferObjectsOfData(usageFlag = WebGLRenderingContext.STATIC_DRAW) {
    const row = this.data.rowCount;
    const column = this.data.columnCount;

    if (row === 0 || column == 0) {
      return false;
    }

    const GL = WebGLRenderingContext;
    const gl = globalThis.gl;

    const acceptedFlags = [GL.STREAM_DRAW, GL.STATIC_DRAW, GL.DYNAMIC_DRAW];

    if (acceptedFlags.indexOf(usageFlag) === -1) {
      return false;
    }

    this.deleteVertexBufferObjectsOfData();
    this.vboData = gl.createBuffer();

    if (!this.vboData) {
      return false;
    }

    gl.bindBuffer(GL.ARRAY_BUFFER, this.vboData);
    const data = new Float32Array(2 * row * column * 3);

    let coordinate = 0;

    for (let k = 0; k < row; ++k) {
      for (let i = 0; i < column; ++i) {
        for (let j = 0; j < 3; ++j) {
          data[coordinate++] = this.data.data[k][i].data[j];
        }
      }
    }

    for (let i = 0; i < column; ++i) {
      for (let k = 0; k < row; ++k) {
        for (let j = 0; j < 3; ++j) {
          data[coordinate++] = this.data.data[k][i].data[j];
        }
      }
    }

    gl.bufferData(GL.ARRAY_BUFFER, data, usageFlag);

    gl.bindBuffer(GL.ARRAY_BUFFER, null);
  }

  generateUIsoparametricLines(isoLineCount, maximumOrderOfDerivatives, divPointCount, usageFlag = WebGLRenderingContext.STATIC_DRAW) {
    if (arguments.length < 3) {
      throw new Error('Invalid number of parameters provided!');
    }

    if (maximumOrderOfDerivatives > 2) {
      return null;
    }

    const vStep = (this.vMax - this.vMin) / (divPointCount - 1);

    const result = new RowMatrix(isoLineCount);

    for (let i = 0; i < isoLineCount; ++i) {
      let u = this.uMin + i * ((this.uMax - this.uMin) / (isoLineCount - 1));
      result.set(i, new GenericCurve3(maximumOrderOfDerivatives, divPointCount));
      let v = this.vMin;
      for (let k = i; k < divPointCount; ++k) {
        const pDerivs = new PartialDerivatives(maximumOrderOfDerivatives);
        this.calculatePartialDerivatives(maximumOrderOfDerivatives, u, v, pDerivs);

        for (let order = 0; order < maximumOrderOfDerivatives; ++order) {
          result.at(i).derivative.data[order][k] = _.cloneDeep(pDerivs.data[order][order]);
        }

        v += vStep;
      }

      for (let order = 0; order < maximumOrderOfDerivatives + 1; ++order) {
        const pDerivs = new PartialDerivatives(maximumOrderOfDerivatives);
        this.calculatePartialDerivatives(maximumOrderOfDerivatives, u, this.vMax, pDerivs);
        result.at(i).derivative.data[order][divPointCount - 1] = _.cloneDeep(pDerivs.data[order][order]);
      }
    }

    return result;
  }

  generateVIsoparametricLines(isoLineCount, maximumOrderOfDerivatives, divPointCount, usageFlag = WebGLRenderingContext.STATIC_DRAW) {
    if (arguments.length < 3) {
      throw new Error('Invalid number of parameters provided!');
    }

    if (maximumOrderOfDerivatives > 2) {
      return null;
    }

    const uStep = (this.vMax - this.vMin) / (divPointCount - 1);
    const result = new RowMatrix(isoLineCount);

    for (let i = 0; i < isoLineCount; ++i) {
      let v = this.vMin + i * ((this.vMax - this.vMin) / (isoLineCount - 1));
      result.set(i, new GenericCurve3(maximumOrderOfDerivatives, divPointCount));
      let u = this.uMin;

      for (let i = k; k < divPointCount; ++k) {
        const pDerivs = new PartialDerivatives(maximumOrderOfDerivatives);
        this.calculatePartialDerivatives(maximumOrderOfDerivatives, u, v, pDerivs);

        for (let order = 0; order < maximumOrderOfDerivatives + 1; ++order) {
          result.at(i).derivative.data[order][k] = _.cloneDeep(pDerivs.data[order][order]);
        }

        u += uStep;
      }

      for (let order = 0; order < maximumOrderOfDerivatives + 1; ++order) {
        const pDerivs = new PartialDerivatives(maximumOrderOfDerivatives);
        this.calculatePartialDerivatives(maximumOrderOfDerivatives, this.uMax, v, pDerivs);
        result.at(i).derivative.data[order][divPointCount - 1] = _.cloneDeep(pDerivs.data[order][order]);
      }
    }

    return result;
  }

  generateImage(uDivPointCount, vDivPointCount, usageFlag = WebGLRenderingContext.STATIC_DRAW) {
    if (arguments.length < 2) {
      throw new Error('Invalid number of arguments provided!');
    }

    if (uDivPointCount <= 1 || vDivPointCount <= 1) {
      return false;
    }

    const vertexCount = uDivPointCount * vDivPointCount;
    const faceCount = 2 * (uDivPointCount - 1) * (vDivPointCount - 1);

    const result = new TriangulatedMesh3(vertexCount, faceCount, usageFlag);

    if (!result) {
      return false;
    }

    const du = (this.uMax - this.uMin) / (uDivPointCount - 1);
    const dv = (this.vMax - this.vMin) / (vDivPointCount - 1);

    const sdu = 1.0 / (uDivPointCount - 1);
    const tdv = 1.0 / (vDivPointCount - 1);

    let currentFace = 0;

    const pd = new PartialDerivatives();

    for (let i = 0; i < uDivPointCount; ++i) {
      const u = Math.min(this.uMin + i * du, this.uMax);
      const s = Math.min(i * sdu, 1.0);

      for (let j = 0; j < vDivPointCount; ++j) {
        const v = Math.min(this.vMin + j * dv, this.vMax);
        const t = Math.min(j * tdv, 1.0);

        const index = new Uint32Array(4);

        index[0] = i * vDivPointCount + j;
        index[1] = index[0] + 1;
        index[2] = index[1] + vDivPointCount;
        index[3] = index[2] - 1;

        this.calculatePartialDerivatives(1, u, v, pd);

        result.vertex[index[0]] = _.cloneDeep(pd.at(0, 0));

        result.normal[index[0]] = _.cloneDeep(pd.at(1, 0));
        result.normal[index[0]] = result.normal[index[0]].cross(pd.at(1, 1))
        result.normal[index[0]].normalize();

        result.tex[index[0]].s = s;
        result.tex[index[0]].t = t;


        if (i < uDivPointCount - 1 && j < vDivPointCount - 1) {
          result.face[currentFace].set(0, index[0]);
          result.face[currentFace].set(1, index[1]);
          result.face[currentFace].set(2, index[2]);
          ++currentFace;

          result.face[currentFace].set(0, index[0]);
          result.face[currentFace].set(1, index[2]);
          result.face[currentFace].set(2, index[3]);
          ++currentFace;
        }
      }
    }

    return result;
  }

  updateDataForInterpolation(uKnotVector, vKnotVector, dataPointsToInterpolate) {
    if (arguments.length < 3) {
      throw new Error('Invalid number of arguments provided!');
    }

    const rowCount = this.data.rowCount;

    if (!rowCount) {
      return false;
    }

    const columnCount = this.data.columnCount;

    if (!columnCount) {
      return false;
    }

    if (!(uKnotVector instanceof RowMatrix) || !(vKnotVector instanceof ColumnMatrix) || !(dataPointsToInterpolate instanceof Matrix)) {
      throw new Error('Invalid argument types provided!');
    }

    if (uKnotVector.columnCount != rowCount || vKnotVector.rowCount != columnCount || dataPointsToInterpolate.rowCount != rowCount || dataPointsToInterpolate.columnCount != columnCount) {
      return false;
    }

    const uBlendingValues = new RowMatrix();
    const uCollationMatrix = new RealSquareMatrix(rowCount);

    for (let i = 0; i < rowCount; ++i) {
      if (!this.UBlendingFunctionValues(uKnotVector.at(i), uBlendingValues)) {
        console.log('UBlendingFunctionValues false');
        return false;
      }

      uCollationMatrix.data[i] = _.cloneDeep(uBlendingValues.data[0]);
    }

    if (!uCollationMatrix.performLUDecomp()) {
      console.log('Failed to perform LUDecomp on uCollationMatrix!');
    }

    const vBlendingValues = new RowMatrix();
    const vCollationMatrix = new RealSquareMatrix(columnCount);

    for (let i = 0; i < columnCount; ++i) {
      if (!this.VBlendingFunctionValues(vKnotVector.at(i), vBlendingValues)) {
        console.log('VBlendingFunctionValues false');
        return false;
      }

      vCollationMatrix.data[i] = _.cloneDeep(vBlendingValues.data[0]);
    }

    if (!vCollationMatrix.performLUDecomp()) {
      console.log('Failed to perform LUDecomp on vCollationMatrix!');
    }

    const a = new Matrix(rowCount, columnCount);

    for (let i = 0; i < rowCount; ++i) {
      for (let j = 0; j < columnCount; ++j) {
        a.data[i][j] = new DCoordinate3(); 
      }
    }

    if (!uCollationMatrix.solveLinearSystem(dataPointsToInterpolate, a)) {
      console.log('SolveLinearSystem failed on uCollocationMatrix');
      return false;
    }

    if (!vCollationMatrix.solveLinearSystem(a, this.data, false)) {
      console.log('SolveLinearSystem failed on uCollocationMatrix');
      return false;
    }

    return true;

  }

  renderData(renderMode) {
    const GL = WebGLRenderingContext;
    const gl = globalThis.gl;
    const allowedRenderMode = [GL.LINE_STRIP, GL.LINE_LOOP, GL.POINTS];

    if (allowedRenderMode.indexOf(renderMode) === -1 || !this.vboData || !this.loaded || !this.program) {
      return false;
    }
    
    gl.bindBuffer(GL.ARRAY_BUFFER, this.vboData);

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

    for (let r = 0; r < this.data.rowCount; ++r) {
      const offset = r * this.data.columnCount;
      gl.drawArrays(renderMode, offset, this.data.columnCount);
    }

    for (let c = 0; c < this.data.columnCount; ++c) {
      const offset = this.data.rowCount * this.data.columnCount + c * this.data.rowCount;
      gl.drawArrays(renderMode, offset, this.data.rowCount);
    }    

    gl.bindBuffer(GL.ARRAY_BUFFER, null);
    gl.useProgram(null);

  }

  UBlendingFunctionValues(uKnot, bledingValues) {
    throw new Error('UBlendingFunctionValues must be implemented!');
  }

  VBlendingFunctionValues(vKnot, bledingValues) {
    throw new Error('VBlendingFunctionValues must be implemented!');
  }

  calculatePartialDerivatives(maximumOrderOfDerivatives, u, v, pd) {
    throw new Error('calculatePartialDerivatives must be implemented!');
  }
}