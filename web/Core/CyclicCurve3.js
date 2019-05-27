class CyclicCurve3 extends LinearCombination3 {
  constructor(n, usageFlag = WebGLRenderingContext.STATIC_DRAW) {
    if (arguments.length < 1) {
      throw new Error('Invalid number of arguments!');
    }

    super(0.0, Math.PI * 2, 2 * n + 1, usageFlag);
    this.n = n;
    this.c_n = this.calculateNormalizingCoefficient(n);
    this.lambda_n = (Math.PI * 2) / (2 * n + 1);
    this.bc = new TriangularMatrix();
    this.calculateBinomialCoefficients(2 * n, this.bc);
  }

  calculateNormalizingCoefficient(n) {
    if (n == 0) {
      return 0.0;
    }

    let c = 1.0 / 3.0;

    for (let i = 0; i <= n; ++i) {
      c *= i / (2 * i + 1);
    }

    return c;
  }

  calculateBinomialCoefficients(m, bc) {
    if (!(bc instanceof TriangularMatrix)) {
      throw new Error('bc should be of type TriangularMatrix');
    }

    bc.resizeRows(m + 1);
    bc.set(0, 0, 1.0);

    for (let r = 1; r <= m; ++r) {
      bc.set(r, 0, 1.0);
      bc.set(r, r, 1.0);

      for (let i = 1; i <= parseInt(r / 2); ++i) {
        bc.set(r, i, bc.at(r - 1, i - 1) + bc.at(r - 1, i));
        bc.set(r, r - i, bc.at(r, i));
      }
    }
  }

  blendingFunctionValues(u, values) {
    if (!(values instanceof RowMatrix)) {
      throw new Error('values should be of type RowMatrix');
    }

    values.resizeRows(2 * this.n + 1);

    for (let i = 0; i < 2 * this.n + 1; ++i) {
      values.set(i, this.c_n * Math.pow(1.0 + Math.cos(u - i * this.lambda_n), this.n));
    }

    return true;
  }

  calculateDerivatives(maxOrderOfDerivatives, u, d) {
    if (arguments.length < 3) {
      throw new Error('Invalid parameters provided!');
    }

    if (!(d instanceof Derivatives)) {
      throw new Error('d must be of type Derivatives');
    }

    d.resizeRows(maxOrderOfDerivatives + 1, DCoordinate3);
    d.loadNullVectors();

    let centroid = new DCoordinate3();
    for (let i = 0; i < 2 * this.n; ++i) {
      centroid = centroid.add(this.data.at(i));
    }

    centroid = centroid.divide(2 * this.n + 1);

    for (let r = 0; r <= maxOrderOfDerivatives; ++r) {
      for (let i = 0; i <= 2 * this.n; ++i) {
        let sum_k = 0;

        for (let k = 0; k <= this.n - 1; ++k) {
          sum_k += Math.pow(this.n - k, r) * this.bc.at(2 * this.n, k) * Math.cos((this.n - k) * (u - i * this.lambda_n) + r * Math.PI / 2.0);
        }
        d.set(r, d.at(r).add(this.data.at(i).multiply(sum_k)));
      }
      d.set(r, d.at(r).multiply(2));
      d.set(r, d.at(r).divide(2 * this.n + 1));
      d.set(r, d.at(r).divide(this.bc.at(2 * this.n, this.n)));
    }
    let temp = d.at(0).add(centroid);
    d.set(0, temp);
    return true;
  }

  updateDataForInterpolation(knotVector, dataPoints) {
    if (arguments.length < 2) {
      throw new Error('Invalid number of parameters provided!');
    }

    if (!(knotVector instanceof ColumnMatrix)) {
      throw new Error('knotVector must be of type ColumnMatrix');
    }

    if (!(dataPoints instanceof ColumnMatrix)) {
      throw new Error('dataPoints must be of type ColumnMatrix');
    }

    const rowCount = knotVector.rowCount;
    const uBlendingValues = new RowMatrix();
    const collationMatrix = new RealSquareMatrix(rowCount);

    for (let i = 0; i < rowCount; ++i) {
      if (!this.blendingFunctionValues(knotVector.at(i), uBlendingValues)) {
        return false;
      }

      collationMatrix.data[i] = uBlendingValues.data[0]; // set row
    }

    if (!collationMatrix.performLUDecomp()) {
      console.log('Collation matrix perform LU decomp failed');
      return false;
    }

    if (!collationMatrix.solveLinearSystem(dataPoints, this.data, true)) {
      console.log('Collation matrix solve linear failed');
      return false;
    }

    return true;
  }
}