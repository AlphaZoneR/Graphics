class ColumnMatrix extends Matrix {
    constructor(rowCount, constructor) {
        super(rowCount, 1);

        if (constructor) {
            for (let i = 0; i < this.rowCount; ++i) {
                this.data[i] = [new constructor()];
            }
        }
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