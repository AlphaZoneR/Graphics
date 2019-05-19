class RowMatrix extends Matrix {
  constructor(columnCount = 1) {
    super(1, columnCount);
  }

  at(column) {
    return this.data[0][column];
  }

  set(column, value) {
    this.data[0][column] = value;
  }

  resizeRows(rowCount) {
    return rowCount == 1;
  }
}