class ColumnMatrix extends Matrix {
    constructor(rowCount) {
        super(rowCount, 1);
    }

    at(row) {
        return this.data[row][0];
    }

    set(row, val) {
        this.data[row][0] = val;
    }

    resizeCols(columnCount) {
        return columnCount === 1;
    }
}