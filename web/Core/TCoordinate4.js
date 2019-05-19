class TCoordinate4 {
    constructor(s = 0.0, t = 0.0, r = 0.0, q = 1.0) {
        this.data = new Float32Array([s, t, r, q]);
    }

    get s() {
        return this.data[0];
    }

    get t() {
        return this.data[1];
    }

    get r() {
        return this.data[2];
    }

    get q() {
        return this.data[3];
    }

    set s(s) {
        if (typeof s == 'number') {
            this.data[0] = s;
        } else if (s instanceof Number) {
            this.data[0] = s.valueOf();
        }
    }

    set t(t) {
        if (typeof t == 'number') {
            this.data[1] = t;
        } else if (t instanceof Number) {
            this.data[1] = t.valueOf();
        }
    }

    set r(r) {
        if (typeof r == 'number') {
            this.data[2] = r;
        } else if (r instanceof Number) {
            this.data[2] = r.valueOf();
        }
    }

    set q(q) {
        if (typeof q == 'number') {
            this.data[3] = q;
        } else if (q instanceof Number) {
            this.data[3] = q.valueOf();
        }
    }
}