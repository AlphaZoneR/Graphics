class ControlPoint {
    constructor(x=0, y=0, z=0) {
        this.position = new DCoordinate3(x, y, z);
        this.mesh = new TriangulatedMesh3();
        this.loaded = false;

        this.mesh.fromOFF('/meshes/sphere.off', true).then(() => {
            this.mesh.updateVertexBufferObjects(globalThis.gl.STATIC_DRAW);
            this.mesh.mat = MatFBRuby;
            this.mesh.scale = 0.05;
            this.loaded = true;
        });
    }

    render(viewMatrix) {
        if (this.loaded) {
            this.mesh.translateVector = this.position.data;
            return this.mesh.render(viewMatrix, globalThis.gl.TRIANGLES);
        }
    }
}