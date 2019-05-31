class ControlPoint {
  constructor(x = 0, y = 0, z = 0) {
    this.position = new DCoordinate3(x, y, z);
    this.mesh = new TriangulatedMesh3();
    this.mesh.controlPoint = this;
    this.loaded = false;

    if (globalThis.sphereMesh) {
      this.mesh.vertex = _.cloneDeep(globalThis.sphereMesh.vertex);
      this.mesh.normal = _.cloneDeep(globalThis.sphereMesh.normal);
      this.mesh.tex = _.cloneDeep(globalThis.sphereMesh.tex);
      this.mesh.face = _.cloneDeep(globalThis.sphereMesh.face);
      this.mesh.updateVertexBufferObjects(globalThis.gl.STATIC_DRAW);
      this.mesh.mat = MatFBRuby;
      this.mesh.scale = 0.05;
      this.loaded = true;
    } else {
      this.mesh.fromOFF('/meshes/sphere.off', true).then(() => {
        this.mesh.updateVertexBufferObjects(globalThis.gl.STATIC_DRAW);
        globalThis.sphereMesh = this.mesh;
        this.mesh.mat = MatFBRuby;
        this.mesh.scale = 0.05;
        this.loaded = true;
      });
    }



    this.updated = false;

    this.parentNet = [];
  }

  render(viewMatrix) {
    if (this.loaded) {
      this.mesh.translateVector = this.position.data;
      return this.mesh.render(viewMatrix, globalThis.gl.TRIANGLES);
    }
  }

  move(x, y, z, updateParents = true) {
    if (arguments.length >= 1) {
      this.position.x = x;
    }

    if (arguments.length >= 2) {
      this.position.y = y;
    }

    if (arguments.length >= 3) {
      this.position.z = z;
    }

    if (updateParents) {
      this.parentNet.forEach(net => {
        net.updatePatch();
      });
    }
  }

  translate(x, y, z, updateParents = true) {
    if (arguments.length >= 1) {
      this.position.x += x;
    }

    if (arguments.length >= 2) {
      this.position.y += y;
    }

    if (arguments.length >= 3) {
      this.position.z += z;
    }

    if (updateParents) {
      this.parentNet.forEach(net => {
        net.updatePatch();
      });
    }
  }
}