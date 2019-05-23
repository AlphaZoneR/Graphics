const { tan } = Math;

const surface1 = {
    uMin: 0,
    uMax: 2 * PI,
    vMin: 0,
    vMax: 2 * PI,
    d00: (u, v) => new DCoordinate3(4 * cos(v), 4 * sin(v), u),
    d01: (u, v) => new DCoordinate3(0, 0, 1),
    d10: (u, v) => new DCoordinate3(-4 * sin(v), 4 * cos(v), 0),
}

const firstSurface = {
    uMin: - 2 * Math.PI,
    uMax: + 2 * Math.PI,
    vMin: - 2 * Math.PI,
    vMax: + 2 * Math.PI,
    d00: (u, v) => new DCoordinate3(sin(u), sin(v), u + v),
    d10: (u, v) => new DCoordinate3(cos(u), 0, 1),
    d01: (u, v) => new DCoordinate3(0, cos(v), 1),
}

const secondSurface = {
    uMin: - 2 * Math.PI,
    uMax: + 2 * Math.PI,
    vMin: - 2 * Math.PI,
    vMax: + 2 * Math.PI,
    d00: (u, v) => new DCoordinate3((2 + cos(u)) * cos(v), (2 + cos(u)) * sin(v), 2 + sin(u)),
    d10: (u, v) => new DCoordinate3(-2 * sin(u) * cos(v), -2 * sin(u) * sin(v), cos(u)),
    d01: (u, v) => new DCoordinate3(-2 * sin(v) * cos(u), 2 * cos(v) * cos(u), 0),
}

const thirdSurface = {
    uMin: - 2 * Math.PI,
    uMax: + 2 * Math.PI,
    vMin: - 2 * Math.PI / 8,
    vMax: + 2 * Math.PI / 8,
    d00: (u, v) => new DCoordinate3(cos(u), sin(u), v * (cos(u) + sin(u) + 10)),
    d10: (u, v) => new DCoordinate3(-sin(u), cos(u), v * (-sin(u) + cos(u))),
    d01: (u, v) => new DCoordinate3(0, 0, sin(u) + cos(u) + 10),
}

const fourthSurface = {
    uMin: - 1,
    uMax: + 1,
    vMin: - 1,
    vMax: + 1,
    d00: (u, v) => new DCoordinate3(u, v, u * u - v * v),
    d10: (u, v) => new DCoordinate3(1, 0, 2 * u),
    d01: (u, v) => new DCoordinate3(0, 1, 2 * v),
}

const fifthSurface = {
    uMin: - 1,
    uMax: + 1,
    vMin: - 1,
    vMax: + 1,
    d00: (u, v) => new DCoordinate3(u * (1 / cos(v)), u * tan(v), u * u),
    d10: (u, v) => new DCoordinate3(1 / cos(v), tan(v), 2 * u),
    d01: (u, v) => new DCoordinate3(u * tan(v) * (1 / cos(v)), u * (1 / cos(v) * (1 / cos(v))), 0),
}