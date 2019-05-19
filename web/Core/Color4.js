class Color4 {
    constructor(r = 0.0, g = 0.0, b = 0.0, a = 1.0) {
        this.data = new Float32Array([r, g, b, a]);
    }

    get r() {
        return this.data[0];
    }

    get g() {
        return this.data[1];
    }

    get b() {
        return this.data[2];
    }

    get a() {
        return this.data[3];
    }

    set r(r) {
        if (typeof r == 'number') {
            this.data[0] = r;
        } else if (r instanceof Number) {
            this.data[0] = r.valueOf();
        }
    }

    set g(g) {
        if (typeof g == 'number') {
            this.data[1] = g;
        } else if (g instanceof Number) {
            this.data[1] = g.valueOf();
        }
    }

    set b(b) {
        if (typeof b == 'number') {
            this.data[2] = b;
        } else if (b instanceof Number) {
            this.data[2] = b.valueOf();
        }
    }

    set a(a) {
        if (typeof a == 'number') {
            this.data[3] = a;
        } else if (a instanceof Number) {
            this.data[3] = a.valueOf();
        }
    }
}