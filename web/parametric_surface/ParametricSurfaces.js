const surface1 = {
    uMin: 0,
    uMax: 2 * PI,
    vMin: 0,
    vMax: 2 * PI,
    d00: (u, v) => new DCoordinate3(4 * cos(v), 4 * sin(v), u),
    d01: (u, v) => new DCoordinate3(0, 0, 1),
    d10: (u, v) => new DCoordinate3(-4 * sin(v), 4 * cos(v), 0),
}