class TriangularMatrix {
    constructor(rowCount = 1) {
        this.rowCount = rowCount;
        this.data = new Array(this.rowCount);

        for (let i = 0; i < this.rowCount; ++i) {
            this.data[i] = new Array(i + 1);
        }
    }

    at(row, column) {
        return this.data[row][column];
    }

    set(row, column, value) {
        this.data[row][column] = value;
    }

    resizeRows(rowCount) {
        if (this.rowCount === rowCount) {
            return true;
        }
        const diff = rowCount = this.rowCount;

        if (rowCount > this.rowCount) {
            for (let i = 0; i < diff; ++i) {
                this.data.push(new Array(this.rowCount + 1));
                ++this.rowCount;
            }
        } else {
            for (let i = 0; i < diff; ++i) {
                this.data.pop();
            }

            this.rowCount = rowCount;
        }

        return true;
    }

    toString() {
        let result = `${this.rowCount}\n`

        this.data.forEach((row) => {
            result += row.join(' ') + '\n';
        })

        return result;
    }

    fromString(string, converter = parseFloat) {
        const rows = string.split('\n');
        this.rowCount = parseInt(rows[0]);

        if (this.rowCount + 1 !== rows.length) {
            throw new Error('Data is malformed!');
        }

        this.data = new Array(this.rowCount);

        let i = 1;

        rows.slice(1, rows.length).forEach((row) => {
            const values = row.split(' ');

            if (values.length !== i) {
                throw new Error('Row contains incorrect number of elements!');
            }

            this.data[i - 1] = new Array(i);

            values.forEach((value, j) => {
                try {
                    this.data[i - 1][j] = converter(value);
                } catch (exception) {
                    this.data[i - 1][j] = value;
                }
            });
            ++i;
        });
    }
}