class RealSquareMatrix extends Matrix {
  constructor(size = 1) {
    super(size, size);
    this.luDecompIsDone = false;
    this.rowPermuation = [];
  }

  resizeRows(rowCount) {
    return super.resizeCols(rowCount) && super.resizeRows(rowCount);
  }

  resizeCols(columnCount) {
    return super.resizeCols(columnCount) && super.resizeRows(colorLocation);
  }


  solveLinearSystem(b, x, representSolutionsAsColumns = true) {
    if (b instanceof Matrix && x instanceof Matrix) {
      if (!this.luDecompIsDone) {
        console.log('Lu decomp has not yet been done! Trying now..');
        if (!this.performLUDecomp()) {
          console.log('Cannot perform LU decomp');
          return false;
        }
      }

      if (representSolutionsAsColumns) {
        const size = this.columnCount;

        if (b.rowCount !== size) {
          return false;
        }

        x.data = _.cloneDeep(b.data);

        for (let k = 0; k < b.columnCount; ++k) {
          let ii = 0;
          for (let i = 0; i < size; ++i) {
            let ip = this.rowPermuation[i];
            let sum = x.at(ip, k);
            x.data[ip][k] = _.cloneDeep(x.at(i, k));

            if (ii != 0) {
              for (let j = ii - 1; j < i; ++j) {
                sum = sum.subtract(x.at(j, k).multiply(this.data[i][j]));
              }
            } else {
              if (sum != 0) {
                ii++;
              }
            }
            x.data[i][k] = _.cloneDeep(sum);
          }


          for (let i = size - 1; i >= 0; --i) {
            let sum = x.at(i, k);

            for (let j = i + 1; j < size; ++j) {
              sum = sum.subtract(x.at(j, k).multiply(this.data[i][j]));
            }
            x.data[i][k] = _.cloneDeep(sum.divide(this.data[i][i]));
          }
        }
      } else {
        const size = this.rowCount;

        if (size !== b.columnCount) {
          console.log('Size error size !== b.columnCount');
          return false;
        }

        x.data = _.cloneDeep(b.data);

        for (let k = 0; k < b.rowCount; ++k) {
          let ii = 0;
          for (let i = 0; i < size; ++i) {
            let ip = this.rowPermuation[i];
            let sum = x.at(k, ip);
            x.data[k][ip] = _.cloneDeep(x.at(k, i));


            if (i !== 0) {
              for (let j = ii - 1; j < i; ++j) {
                sum = sum.subtract(x.at(k, j).multiply(this.data[i][j]));
              }
            } else {
              if (sum != 0) {
                ii = i + 1;
              }
            }
            x.data[k][i] = _.cloneDeep(sum);
          }

          for (let i = size - 1; i >= 0; --i) {
            let sum = x.at(k, i);

            for (let j = i + 1; j < size; ++j) {
              sum = sum.subtract(x.at(k, j).multiply(this.data[i][j]));
            }
            x.data[k][i] = _.cloneDeep(sum.divide(this.data[i][i]));
          }
        }
      }

    return true;
    }

    throw new Error(`${typeof b} and ${typeof x} are not supported!`);
  }

  performLUDecomp() {
    if (this.luDecompIsDone) {
      return true;
    }

    if (this.rowCount <= 1) {
      return false;
    }

    const size = this.data.length;
    let tiny = -Infinity;

    const implicitScalingOfEachRow = new Array(size);
    this.rowPermuation = new Array(size);

    let rowInterchanges = 1;
    let indexOfImpScale = 0;
    this.data.forEach((row) => {
      let big = 0.0;

      row.forEach((element) => {
        const temp = Math.abs(element);

        if (temp > big) {
          big = temp;
        }
      });

      if (big == 0) {
        console.log('Matrix is singular!');
        return false;
      }

      implicitScalingOfEachRow[indexOfImpScale++] = 1.0 / big;
    });

    for (let k = 0; k < size; ++k) {
      let imax = k;
      let big = 0;

      for (let i = k; i < size; ++i) {
        const temp = implicitScalingOfEachRow[i] * Math.abs(this.data[i][k]);

        if (temp > big) {
          big = temp;
          imax = i;
        }
      }

      if (k != imax) {
        for (let j = 0; j < size; ++j) {
          const temp = this.data[imax][j];
          this.data[imax][j] = this.data[k][j];
          this.data[k][j] = temp;
        }

        rowInterchanges = -rowInterchanges;

        implicitScalingOfEachRow[imax] = implicitScalingOfEachRow[k];
      }

      this.rowPermuation[k] = imax;

      if (this.data[k][k] == 0.0) {
        this.data[k][k] = tiny;
      }

      for (let i = k + 1; i < size; ++i) {
        const temp = this.data[i][k] /= this.data[k][k];

        for (let j = k + 1; j < size; ++j) {
          this.data[i][j] -= temp * this.data[k][j];
        }
      }
    }

    this.luDecompIsDone = true;
    return true;
  }
}