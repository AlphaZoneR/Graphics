class ControlPoint {
  constructor(x = 0, y = 0, z = 0) {
    this.position = new DCoordinate3(x, y, z);
    this.mesh = new TriangulatedMesh3();
    this.mesh.controlPoint = this;
    this.loaded = false;
    this.edgePoint = false;
    this.cornerPoint = false;

    this.neighbours = {
      NW: null,
      N: null,
      NE: null,
      E: null,
      SE: null,
      S: null,
      SW: null,
      W: null,
    }

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
    const diff = new DCoordinate3(x, y, z).subtract(this.position);
    if (arguments.length >= 1) {
      this.position.x = x;
    }

    if (arguments.length >= 2) {
      this.position.y = y;
    }

    if (arguments.length >= 3) {
      this.position.z = z;
    }

    const moveablePoints = [];
    const updateableNets = [];

    if (this.parentNet.length == 1 || true) {
      if (this.parentNet[0].neighbours.N && this.neighbours.N.edgePoint && !this.cornerPoint) {
        this.neighbours.N.neighbours.N.position = this.neighbours.N.neighbours.N.position.subtract(diff);
        this.neighbours.N.neighbours.N.mesh.moved = true;
        updateableNets.push(this.parentNet[0].neighbours.N);
      }

      if (this.parentNet[0].neighbours.S && this.neighbours.S.edgePoint && !this.cornerPoint) {
        this.neighbours.S.neighbours.S.position = this.neighbours.S.neighbours.S.position.subtract(diff);
        this.neighbours.S.neighbours.S.mesh.moved = true;
        updateableNets.push(this.parentNet[0].neighbours.S);
      }

      if (this.parentNet[0].neighbours.E && this.neighbours.E.edgePoint && !this.cornerPoint) {
        this.neighbours.E.neighbours.E.position = this.neighbours.E.neighbours.E.position.subtract(diff);
        this.neighbours.E.neighbours.E.mesh.moved = true;
        updateableNets.push(this.parentNet[0].neighbours.E);
      }

      if (this.parentNet[0].neighbours.W && this.neighbours.W.edgePoint && !this.cornerPoint) {
        this.neighbours.W.neighbours.W.position = this.neighbours.W.neighbours.W.position.subtract(diff);
        this.neighbours.W.neighbours.W.mesh.moved = true;
        updateableNets.push(this.parentNet[0].neighbours.W);
      }

      if (this.parentNet[0].neighbours.SE && this.neighbours.SE.edgePoint && !this.cornerPoint) {
        console.log('here');
        this.neighbours.SE.neighbours.SE.position = this.neighbours.SE.neighbours.SE.position.add(diff);
        this.neighbours.SE.neighbours.SE.mesh.moved = true;
        updateableNets.push(this.parentNet[0].neighbours.SE);
      }

      if (this.parentNet[0].neighbours.SW && this.neighbours.SW.edgePoint && !this.cornerPoint) {
        this.neighbours.SW.neighbours.SW.position = this.neighbours.SW.neighbours.SW.position.add(diff);
        this.neighbours.SW.neighbours.SW.mesh.moved = true;
        updateableNets.push(this.parentNet[0].neighbours.SW);
      }

      if (this.parentNet[0].neighbours.NE && this.neighbours.NE.edgePoint && !this.cornerPoint) {
        this.neighbours.NE.neighbours.NE.position = this.neighbours.NE.neighbours.NE.position.add(diff);
        this.neighbours.NE.neighbours.NE.mesh.moved = true;
        updateableNets.push(this.parentNet[0].neighbours.NE);
      }

      if (this.parentNet[0].neighbours.NW && this.neighbours.NW.edgePoint && !this.cornerPoint) {
        this.neighbours.NW.neighbours.NW.position = this.neighbours.NW.neighbours.NW.position.add(diff);
        this.neighbours.NW.neighbours.NW.mesh.moved = true;
        updateableNets.push(this.parentNet[0].neighbours.NW);
      }
    }

    if (this.edgePoint && this.parentNet.length > 1) {
      Object.keys(this.neighbours).forEach((key) => {
        if (this.neighbours[key] != null) {
          moveablePoints.push(this.neighbours[key]);
        }
      })
    }

    moveablePoints.forEach((point) => {
      point.position = point.position.add(diff);
      point.parentNet.forEach((n) => {
        if (updateableNets.indexOf(n) === -1) {
          updateableNets.push(n);
        }
      })
      point.mesh.moved = true;
    })

    if (updateParents || true) {
      this.parentNet.forEach(net => {
        if (updateableNets.indexOf(net) === -1) {
          updateableNets.push(net);
        }
      });

      updateableNets.forEach((net) => {
        net.updatePatch();
      })
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