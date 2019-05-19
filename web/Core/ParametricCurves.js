const PI = 3.1415926535897932384626433832795;
const TWO_PI = 2.0 * PI;
const E = 0.5772156649;

const {cos, sin, pow} = Math;

const spiralOnCone = {
    uMin: -TWO_PI,
    uMax: TWO_PI,
    d0: (u) => {
        return new DCoordinate3(u * Math.cos(u), u * Math.sin(u), u);
    },
    d1: (u) => {
        return new DCoordinate3(Math.cos(u) - u * Math.sin(u), Math.sin(u) + u * Math.cos(u), 1);
    },
    d2: (u) => {
        const c = Math.cos(u), s = Math.sin(u);
        return new DCoordinate3(-2.0 * s - u * c, 2.0 * c - u * s, 0);
    }
};

const simple1 = {
    uMin: - 2 * Math.PI,
    uMax: 2 * Math.PI,
    d0: (u) => {
        return new DCoordinate3(u, cos(2 * u), sin(2 * u));
    },
    d1: (u) => {
        return new DCoordinate3(1, -2 * sin(2 * u), 2 * cos(2 * u));
    },
    d2: (u) => {
        return new DCoordinate3(1, -4 * cos(2 * u), -4 * sin(2 * u));
    }
};

const simple2 = {
    uMin: - 2 * Math.PI,
    uMax: 2 * Math.PI,
    d0: (u) => {
        return new DCoordinate3(u * cos(u), u * sin(u), u * u);
    },
    d1: (u) => {
        return new DCoordinate3(cos(u) - u * sin(u), sin(u) + u * cos(u), 2 * u);
    },
    d2: (u) => {
        return new DCoordinate3(-2 * sin(u) - u * cos(u), 2 * cos(u) - u * sin(u), 2);
    }
};

const simple3 = {
    uMin: 0,
    uMax: TWO_PI,
    d0: (u) => {
        return new DCoordinate3(3 * cos(u) + cos(3 * u), 3 * sin(u) - sin(3 * u), sin(u));
    },
    d1: (u) => {
        return new DCoordinate3(-3 * (sin(u) + sin(3 * u)), 3 * (cos(u) - cos(3 * u)), -cos(u));
    },
    d2: (u) => {
        return new DCoordinate3(-3 * (cos(u) + 3 * cos(3 * u)), 9 * sin(3 * u) - 3 * sin(u), -sin(u));
    }
};

const simple4 = {
    uMin: -TWO_PI / 6,
    uMax: +TWO_PI / 6,
    d0: (u) => {
        return new DCoordinate3(pow(E, u) + u * u, pow(E, 2 * u) + 3 * u, u);
    },
    d1: (u) => {
        return new DCoordinate3(pow(E, u) + 2 * u, 2 * pow(E, 2 * u) + 3, 1);
    },
    d2: (u) => {
        return new DCoordinate3(pow(E, u) + 2, 4 * pow(E, 2 * u), 0);
    }
};

const simple5 = {
    uMin: -TWO_PI,
    uMax: +TWO_PI,
    d0: (u) => {
        return new DCoordinate3( cos(u),  sin(u), 2*u);
    },
    d1: (u) => {
        const c = cos(u), s = sin(u);
        return new DCoordinate3(s, c , 2.0);
    },
    d2: (u) => {
        const c = cos(u), s = sin(u);
        return new DCoordinate3(c, - s, 0);
    }
};