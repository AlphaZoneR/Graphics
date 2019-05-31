class DCoordinate3 {
  constructor(x = 0.0, y = 0.0, z = 0.0) {
    this.data = new Float32Array([x, y, z]);
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

  set x(x) {
    this.data[0] = x;
  }

  set y(y) {
    this.data[1] = y;
  }

  set z(z) {
    this.data[2] = z;
  }

  get length() {
    return Math.sqrt(this.multiply(this));
  }

  distance(rhs) {
    if (rhs instanceof DCoordinate3) {
      return Math.sqrt(Math.pow(this.x - rhs.x, 2) + Math.pow(this.y - rhs.y, 2) + Math.pow(this.z - rhs.z, 2));
    }
  }

  add(rhs) {
    if (rhs instanceof DCoordinate3) {
      return new DCoordinate3(this.x + rhs.x, this.y + rhs.y, this.z + rhs.z);
    } else if (typeof rhs === 'number') {
      return new DCoordinate3(this.x + rhs, this.y + rhs, this.z + rhs);
    }

    return this;
  }

  subtract(rhs) {
    if (rhs instanceof DCoordinate3) {
      return new DCoordinate3(this.x - rhs.x, this.y - rhs.y, this.z - rhs.z);
    } else if (typeof rhs === 'number') {
      return new DCoordinate3(this.x - rhs, this.y - rhs, this.z - rhs);
    }

    return this;
  }

  divide(rhs) {
    if (typeof rhs === 'number') {
      return new DCoordinate3(this.x / rhs, this.y / rhs, this.z / rhs);
    }

    return this;
  }

  cross(rhs) {
    if (rhs instanceof DCoordinate3) {
      return new DCoordinate3(
        this.data[1] * rhs.data[2] - this.data[2] * rhs.data[1],
        this.data[2] * rhs.data[0] - this.data[0] * rhs.data[2],
        this.data[0] * rhs.data[1] - this.data[1] * rhs.data[0]
      );
    }
  }

  multiply(rhs) {
    if (rhs instanceof DCoordinate3) {
      return this.data[0] * rhs.data[0] + this.data[1] * rhs.data[1] + this.data[2] * rhs.data[2];
    } else if (typeof rhs === 'number') {
      return new DCoordinate3(this.x * rhs, this.y * rhs, this.z * rhs);
    }

    return this;
  }

  normalize() {
    const l = this.length;
    if (l !== 0.0 && l != 1.0) {
      this.data = this.divide(l).data;
    }

    return this;
  }

  equals(rhs) {
    if (rhs instanceof DCoordinate3) {
      return this.x = rhs.x && this.y == rhs.y && this.z == rhs.z;
    }

    return false;
  }

  toString() {
    return `${this.x} ${this.y} ${this.z}`;
  }

  fromString(string, converter = parseFloat) {
    const values = string.trim().split(' ').map(e => converter(e));
    if (values.length !== 3) {
      throw new Error('Malformed data!');
    }

    this.data = values;
  }
}