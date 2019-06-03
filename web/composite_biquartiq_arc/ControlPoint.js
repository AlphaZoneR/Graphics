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

    this.parentPoly = [];
  }

  render(viewMatrix) {
    if (this.loaded) {
      this.mesh.translateVector = this.position.data;
      return this.mesh.render(viewMatrix, globalThis.gl.TRIANGLES);
    }
  }

  move(x, y, z, updateParents = true) {
    const diff = new DCoordinate3(x, y, z).subtract(this.position);
    updateParents = true;
    if (arguments.length >= 1) {
      this.position.x = x;
    }

    if (arguments.length >= 2) {
      this.position.y = y;
    }

    if (arguments.length >= 3) {
      this.position.z = z;
    }
    
    if (this.parentPoly.length == 2) {
      if (this.parentPoly[0].neighbours.N == this.parentPoly[1]) {
        if (this == this.parentPoly[0].points[0]) {
          this.parentPoly[1].points[2].position = this.parentPoly[1].points[2].position.add(diff);
          this.parentPoly[1].points[2].mesh.moved = true;
        }

        this.parentPoly[0].points[1].position = this.parentPoly[0].points[1].position.add(diff);
        this.parentPoly[0].points[1].mesh.moved = true;
      } else if (this.parentPoly[0].neighbours.S == this.parentPoly[1]) {
        if (this == this.parentPoly[0].points[3]) {
          this.parentPoly[1].points[1].position = this.parentPoly[1].points[1].position.add(diff);
          this.parentPoly[1].points[1].mesh.moved = true;
        }
         this.parentPoly[0].points[2].position = this.parentPoly[0].points[2].position.add(diff);
        this.parentPoly[0].points[2].mesh.moved = true;
      }
    }

    if (this.parentPoly.length == 1) {
      const index = this.parentPoly[0].points.indexOf(this);
      if (this.parentPoly[0].neighbours.N && index == 1) {
        this.parentPoly[0].neighbours.N.points[2].position = this.parentPoly[0].neighbours.N.points[2].position.subtract(diff);
        this.parentPoly[0].neighbours.N.points[2].mesh.moved = true;

        if (updateParents) {
          this.parentPoly[0].neighbours.N.updateArc();
        }
      } else if (this.parentPoly[0].neighbours.S && index == 2) {
        this.parentPoly[0].neighbours.S.points[1].position = this.parentPoly[0].neighbours.S.points[1].position.subtract(diff);
        this.parentPoly[0].neighbours.S.points[1].mesh.moved = true;
        if (updateParents) {
          this.parentPoly[0].neighbours.S.updateArc();
        }
      }
    }

    if (updateParents) {
      this.parentPoly.forEach(net => {
        net.updateArc();
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
      this.parentPoly.forEach(net => {
        net.updateArc();
      });
    }
  }
}