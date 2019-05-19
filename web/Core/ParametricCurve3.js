class ParametricCurve3 {
  constructor(derivatives, uMin, uMax) {
    if (derivatives instanceof RowMatrix || derivatives instanceof Array) {
      this.uMin = uMin;
      this.uMax = uMax;
      this.derivatives = derivatives;
    }
  }

  at(order, u) {
    if (this.derivatives instanceof RowMatrix) {
      return this.derivatives.at(order)(u);
    } else {
      return this.derivatives[order](u);
    }
  }

  generateImage(divPointCount, usageFlag) {
    const result = new GenericCurve3(this.derivatives.columnCount - 1, divPointCount, usageFlag);
    for (let order = 0; order < this.derivatives.columnCount; ++order) {
      // console.log(order);
      if (this.derivatives instanceof RowMatrix) {
        result.setDerivative(order, 0, this.derivatives.at(order)(this.uMin));
        result.setDerivative(order, divPointCount - 1, this.derivatives.at(order)(this.uMax));
      } else if (this.derivatives instanceof Array) {
        result.setDerivative(order, 0, this.derivatives.at[order](this.uMin));
        result.setDerivative(order, divPointCount - 1, this.derivatives.at[order](this.uMax));
      }
    }

    const uStep = (this.uMax - this.uMin) / (divPointCount - 1);
    let u = this.uMin;

    for (let i = 1; i < divPointCount - 1; ++i) {
      u += uStep;

      for (let order = 0; order < this.derivatives.columnCount; ++order) {
        if (this.derivatives instanceof RowMatrix) {
          result.setDerivative(order, i, this.derivatives.at(order)(u));
        } else if (this.derivatives instanceof Array) {
          result.setDerivative(order, i, this.derivatives[order](u));
        }
      }
    }

    return result;
  }

  setDefinitionDomain(uMin, uMax) {
    this.uMin = uMin;
    this.uMax = uMax;
  }

  setDerivatives(derivatives) {
    if (derivatives instanceof RowMatrix || derivatives instanceof Array) {
      this.derivatives = _.cloneDeep(derivatives);
    }
  }

  getDerivative(index) {
    return this.derivatives.at(i);
  }
}