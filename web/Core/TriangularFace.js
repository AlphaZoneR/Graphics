class TriangularFace {
    constructor() {
        this.data = new Int32Array([0, 0, 0]);
    }

    at(index) {
        if (index >= 3) { 
            throw new Error('Out of bounds exception!');
        }

        return this.data[index];
    }

    set(index, value) {
        if (index >= 3) {
            throw new Error('Out of bounds exception!');
        }

        this.data[index] = value;
    }

    toString() {
        return `3 ${this.data[0]} ${this.data[1]} ${this.data[2]}`
    }

    fromString(string) {
        const values = string.trim().split(' ').map(v => parseInt(v));

        if (values.length != 4) {
            throw new Error('Malformed data!');
        }

        this.data = new Int32Array(values.slice(1, 4));
    }
}