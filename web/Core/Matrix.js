class Matrix {
  constructor(rowCount = 1, columnCount = 1, defaultValueConstructor = null, defaultValue = 0) {
    this.columnCount = columnCount;
    this.rowCount = rowCount;
    this.data = new Array(this.rowCount);
    this.defaultValue = defaultValue;
    this.defaultValueConstructor = defaultValueConstructor;

    for (let i = 0; i < this.rowCount; ++i) {
      this.data[i] = new Array(this.columnCount);
    }

    // if (defaultValueConstructor) {
    //   this.data.fill(new Array(this.columnCount).fill(new defaultValueConstructor(defaultValue)));
    // } else {
    //   this.data.fill(new Array(this.columnCount).fill(defaultValue));
    // }


  }

  fromMat(mat) {
    if (mat instanceof Matrix) {
      this.columnCount = mat.columnCount;
      this.rowCount = mat.rowCount;

      this.data = new Array(this.rowCount);

      for (let i = 0; i < this.rowCount; ++i) {
        this.data[i] = new Array(this.columnCount);

        for (let j = 0; j < this.columnCount; ++j) {
          this.data[i][j] = _.cloneDeep(mat.data[i][j]);
        }
      }
    }
  }

  at(row, column) {
    return this.data[row][column]
  }

  set(row, column, value) {
    this.data[row][column] = value;
  }

  resizeRows(rowCount, constructor) {
    if (this.rowCount < rowCount) {
      for (let i = this.rowCount; i < rowCount; ++i) {
        if (constructor) {
          this.data.push(new Array(this.columnCount).fill().map(e => new constructor()));
        } else {
          this.data.push(new Array(this.columnCount).fill(this.defaultValue));
        }
      }
    } else if (this.rowCount > rowCount) {
      this.data = this.data.slice(0, rowCount);
    }

    this.rowCount = rowCount;

    return true;
  }

  resizeCols(columnCount) {
    if (this.columnCount < columnCount) {
      this.data.forEach((row, index) => {
        const newData = new Array(columnCount);
        for (let i = 0; i < row.length; ++i) {
          newData[i] = row[i];
        }

        this.data[index] = newData;
      });
    } else if (this.columnCount > columnCount) {
      this.data.forEach((row, index) => {
        this.data[index] = row.slice(0, columnCount);
      })
    }

    this.columnCount = columnCount;
    return true;
  }

  setRow(index, row) {
    if (index >= this.rowCount) {
      return false;
    }

    if (row instanceof Array) {
      if (row.length !== this.columnCount) {
        return false;
      }

      this.data[index] = row;
    } else if (row instanceof RowMatrix) {
      if (row.columnCount >= this.rowCount) {
        return false;
      }

      this.data[index] = row.data[0];
    }

    return true;
  }

  setColumn(index, column) {
    if (index >= this.columnCount) {
      return false;
    }

    if (column instanceof Array) {
      if (column.length !== this.rowCount) {
        return false;
      }

      for (let i = 0; i < this.rowCount; ++i) {
        this.data[i][index] = column[i];
      }
    } else if (column instanceof ColumnMatrix) {
      if (column.rowCount !== this.rowCount) {
        return false;
      }

      for (let i = 0; i < this.rowCount; ++i) {
        this.data[i][index] = column.data[i][0];
      }
    }
  }

  getRow(row) {
    return this.data[row];
  }

  toString() {
    let result = `${this.rowCount}\n`

    this.data.forEach((row) => {
      result += row.join(' ') + '\n';
    })

    return result;
  }

  fromString(string) {
    const rows = string.split('\n');
    const details = rows[0].split(' ');
    this.rowCount = parseInt(details[0]);
    this.columnCount = parseInt(details[1]);

    if (this.rowCount + 1 !== rows.length) {
      throw new Error('Data is malformed!');
    }

    this.data = new Array(this.rowCount);

    rows.slice(1, rows.length).forEach((row, i) => {
      const values = row.split(' ');

      if (values.length !== this.columnCount) {
        throw new Error('Row contains incorrect number of elements!');
      }

      this.data[i] = new Array(this.columnCount);

      values.forEach((value, j) => {
        try {
          this.data[i][j] = converter(value);
        } catch (exception) {
          this.data[i][j] = value;
        }
      });
    });
  }
}