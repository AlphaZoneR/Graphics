class HCoordinate3 {
    constructor(x = 0.0, y = 0.0, z = 0.0, w = 1.0) {
        this.data = new Float32Array(4);
        this.data[0] = x;
        this.data[1] = y;
        this.data[2] = z;
        this.data[3] = w;
    }

    get x() {
        return this.data[0];
    }

    get y() {
        return this.data[1];
    }

    get z() {
        return this.data[2];
    }

    get w() {
        return this.data[3];
    }

    set x(x) {
        this.data[0] = x;
    }

    set y(y) {
        this.data[1] = y;
    }

    set z(z) {
        this.data[2] = z;
    }

    set w(w) {
        this.data[3] = w;
    }

    add(rhs) {
        if (rhs instanceof HCoordinate3) {
            return new HCoordinate3(
                rhs.w * this.x + this.w * rhs.x,
                rhs.w * this.y + this.w * rhs.y,
                rhs.w * this.z + this.w * rhs.z,
                this.w * rhs.w
            );
        }
    }

    subtract(rhs) {
        if (rhs instanceof HCoordinate3) {
            return new HCoordinate3(
                rhs.w * this.x - this.w * rhs.x,
                rhs.w * this.y - this.w * rhs.y,
                rhs.w * this.z - this.w * rhs.z,
                this.w * rhs.w
            );
        }
    }

    multiply(rhs) {
        if (rhs instanceof HCoordinate3) {
            return rhs.data[3] * rhs.data[0] * this.data[3] * this.data[0] + rhs.data[3] * rhs.data[1] * this.data[3] * this.data[1] + rhs.data[3] * rhs.data[2] * this.data[3] * this.data[2];
        } else if (typeof rhs === 'number') {
            return new HCoordinate3(
                this._data[0] * rhs,
                this._data[1] * rhs,
                this._data[2] * rhs,
                this._data[3]
            );
        }

        throw new Error(`Type ${typeof rhs} is not supported!`);
    }

    divide(rhs) {
        if (typeof rhs === 'number') {
            return new HCoordinate3(
                this.data[0],
                this.data[1],
                this.data[2],
                this.data[3] * rhs
            )
        }

        throw new Error(`Type ${typeof rhs} is not supported!`);
    }

    cross(rhs) {
        if (rhs instanceof HCoordinate3) {
            return new HCoordinate3(
                this.data[0] * rhs.data[2] - this.data[2] * rhs.data[1],
                this.data[2] * rhs.data[0] - this.data[0] * rhs.data[2],
                this.data[0] * rhs.data[1] - this.data[1] * rhs.data[0],
                this.data[3] * rhs.data[3]
            );
        }

        throw new Error(`Type ${typeof rhs} is not supported!`);
    }

    normalize() {
        const l = this.length;

        if (l !== 0 && l != 1.0) {
            this.divide(l);
        }
        
        return this;
    }

    at (index) {
        if (index >= 4) {
            throw new Error(`Out of bounds!`);
        }

        return this.data[index];
    }

    get length() {
        return Math.sqrt(this.multiply(this));
    }

    toString() {
        return this.data.join(' ');
    }

    fromString(string, converter=parseFloat) {
        const values = string.split(' ').map(e => converter(e));

        if (values.length !== 4) {
            throw new Error('Malformed data!');
        }

        this.data = values;
        return this;
    }
}