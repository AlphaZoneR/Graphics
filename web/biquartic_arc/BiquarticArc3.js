class BiquarticArc extends LinearCombination3 {
  constructor() {
    super(0, 1.0, 4);
  }

  blendingFunctionValues(uKnot, blendingValues) {
    if (arguments.length < 2) {
      throw new Error('Invalid number of arguments provided!');
    }

    if (uKnot < this.uMin || uKnot > this.uMax) {
      return false;
    }

    if (!(blendingValues instanceof RowMatrix)) {
      throw new Error('blendingValues must be of type RowMatrix');
    }

    blendingValues.resizeCols(4);

    blendingValues.set(0, this.F0D0(uKnot));
    blendingValues.set(1, this.F1D0(uKnot));
    blendingValues.set(2, this.F2D0(uKnot));
    blendingValues.set(3, this.F3D0(uKnot));

    return true;
  }

  calculateDerivatives(maxOrderOfDerivatives, u, derivatives) {
    if (u < this.uMin || u > this.uMax || maxOrderOfDerivatives > 2) {
      console.log(u, this.uMin, maxOrderOfDerivatives);

      return false;
    }

    if (!(derivatives instanceof Derivatives)) {
      throw new Error('derivatives must be of type Derivatives');
    }

    derivatives.resizeRows(maxOrderOfDerivatives + 1);
    derivatives.loadNullVectors();

    let fVals = new RowMatrix();
    this.blendingFunctionValues(u, fVals);
    for (let i = 0; i < 4; ++i) {
      derivatives.set(0, derivatives.at(0).add(this.data.at(i).multiply(fVals.at(i))));
    }

    derivatives.set(1, derivatives.at(1).add(this.data.at(0).multiply(this.F0D1(u))));
    derivatives.set(1, derivatives.at(1).add(this.data.at(1).multiply(this.F1D1(u))));
    derivatives.set(1, derivatives.at(1).add(this.data.at(2).multiply(this.F2D1(u))));
    derivatives.set(1, derivatives.at(1).add(this.data.at(3).multiply(this.F3D1(u))));

    if (maxOrderOfDerivatives == 2) {
      derivatives.set(2, derivatives.at(2).add(this.data.at(0).multiply(this.F0D2(u))));
      derivatives.set(2, derivatives.at(2).add(this.data.at(1).multiply(this.F1D2(u))));
      derivatives.set(2, derivatives.at(2).add(this.data.at(2).multiply(this.F2D2(u))));
      derivatives.set(2, derivatives.at(2).add(this.data.at(3).multiply(this.F3D2(u))));
    }

    return true;
  }

  F0D0(t) {
    return this.F3D0(1 - t);
  }

  F1D0(t) {
    return this.F2D0(1 - t);
  }

  F2D0(t) {
    return 4 * Math.pow(t, 3) * (1 - t) + 3 * Math.pow(t, 2) * Math.pow((1 - t), 2);
  }

  F3D0(t) {
    return Math.pow(t, 4);
  }

  // first order derivatives
  F0D1(t) {
    return -this.F3D1(1 - t);
  }

  F1D1(t) {
    return -this.F2D1(1 - t);
  }

  F2D1(t) {
    return -4.0 * Math.pow(t, 3.0) - 6.0 * Math.pow(t, 2.0) + 6.0 * t;
  }

  F3D1(t) {
    return 4 * Math.pow(t, 3);
  }

  // second order derivatives

  F0D2(t) {
    return this.F3D2(1 - t);
  }

  F1D2(t) {
    return this.F2D2(1 - t);
  }

  F2D2(t) {
    return - 12.0 * Math.pow(t, 2.0) - 12.0 * t + 6.0;
  }

  F3D2(t) {
    return 12.0 * Math.pow(t, 2);
  }
}