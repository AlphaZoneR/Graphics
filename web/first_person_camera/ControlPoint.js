class ControlPoint {
  constructor(x = 0, y = 0, z = 0) {
    this.position = new DCoordinate3(x, y, z);
    this.mesh = new TriangulatedMesh3();
    this.mesh.controlPoint = this;
    this.loaded = false;
    this.edgePoint = false;
    this.cornerPoint = false;
    this.type = null;

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

  _move(x, y, z, updateParents = true) {
    const diff = new DCoordinate3(x, y, z).subtract(this.position);
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

    this.moved = true;

    if (this.type == TYPES.CORNER) {
      Object.keys(this.neighbours).forEach((key) => {
        if (this.neighbours[key]) {
          moveablePoints.push(this.neighbours[key]);
        }
      })
    } else if (this.type == TYPES.INSIDE) {
      const sub = [];
      if (this.neighbours.N) {
        if (this.neighbours.N.neighbours.N && this.neighbours.N.neighbours.N.type == TYPES.INSIDE) {
          sub.push(this.neighbours.N.neighbours.N);
        }
      }

      if (this.neighbours.S) {
        if (this.neighbours.S.neighbours.S && this.neighbours.S.neighbours.S.type == TYPES.INSIDE) {
          sub.push(this.neighbours.S.neighbours.S);
        }
      }

      if (this.neighbours.E) {
        if (this.neighbours.E.neighbours.E && this.neighbours.E.neighbours.E.type == TYPES.INSIDE) {
          sub.push(this.neighbours.E.neighbours.E);
        }
      }

      if (this.neighbours.W) {
        if (this.neighbours.W.neighbours.W && this.neighbours.W.neighbours.W.type == TYPES.INSIDE) {
          sub.push(this.neighbours.W.neighbours.W);
        }
      }

      if (this.neighbours.SW) {
        if (this.neighbours.SW.neighbours.SW && this.neighbours.SW.neighbours.SW.type == TYPES.INSIDE) {
          moveablePoints.push(this.neighbours.SW.neighbours.SW);
        }
      }

      if (this.neighbours.SE) {
        if (this.neighbours.SE.neighbours.SE && this.neighbours.SE.neighbours.SE.type == TYPES.INSIDE) {
          moveablePoints.push(this.neighbours.SE.neighbours.SE);
        }
      }

      if (this.neighbours.NW) {
        if (this.neighbours.NW.neighbours.NW && this.neighbours.NW.neighbours.NW.type == TYPES.INSIDE) {
          moveablePoints.push(this.neighbours.NW.neighbours.NW);
        }
      }

      if (this.neighbours.NE) {
        if (this.neighbours.NE.neighbours.NE && this.neighbours.NE.neighbours.NE.type == TYPES.INSIDE) {
          moveablePoints.push(this.neighbours.NE.neighbours.NE);
        }
      }

      sub.forEach((point) => {
        point._move(...new DCoordinate3(0, 0, 0).subtract(diff).data, false);
        point.mesh.moved = true;
        point.parentNet.forEach((net) => {
          if (updateableNets.indexOf(net) === -1) {
            updateableNets.push(net);
          }
        });
      });
    } else if (this.type == TYPES.EDGE) {
      if (this.neighbours.W && this.neighbours.W.type == TYPES.CORNER) {
        const add = [];
        const sub = [];
        if (this.neighbours.S) {
          moveablePoints.push(this.neighbours.S);
          if (this.neighbours.S.neighbours.W.neighbours.W) {
            sub.push(this.neighbours.S.neighbours.W.neighbours.W)
          }
        }

        if (this.neighbours.N) {
          moveablePoints.push(this.neighbours.N);
          if (this.neighbours.N.neighbours.W.neighbours.W) {
            sub.push(this.neighbours.N.neighbours.W.neighbours.W)
          }
        }

        if (this.neighbours.W.neighbours.W) {
          sub.push(this.neighbours.W.neighbours.W);
        }

        sub.forEach((point) => {
          point._move(...new DCoordinate3(0, 0, 0).subtract(diff).data, false);
          point.mesh.moved = true;
          point.parentNet.forEach((net) => {
            if (updateableNets.indexOf(net) === -1) {
              updateableNets.push(net);
            }
          });
        });
      } else if (this.neighbours.E && this.neighbours.E.type == TYPES.CORNER) {
        const add = [];
        const sub = [];
        if (this.neighbours.S) {
          moveablePoints.push(this.neighbours.S);
          if (this.neighbours.S.neighbours.E.neighbours.E) {
            sub.push(this.neighbours.S.neighbours.E.neighbours.E)
          }
        }

        if (this.neighbours.N) {
          moveablePoints.push(this.neighbours.N);
          if (this.neighbours.N.neighbours.E.neighbours.E) {
            sub.push(this.neighbours.N.neighbours.E.neighbours.E)
          }
        }

        if (this.neighbours.E.neighbours.E) {
          sub.push(this.neighbours.E.neighbours.E);
        }

        sub.forEach((point) => {
          point._move(...new DCoordinate3(0, 0, 0).subtract(diff).data, false);
          point.mesh.moved = true;
          point.parentNet.forEach((net) => {
            if (updateableNets.indexOf(net) === -1) {
              updateableNets.push(net);
            }
          });
        });
      } else if (this.neighbours.S && this.neighbours.S.type == TYPES.CORNER) {
        const add = [];
        const sub = [];
        if (this.neighbours.E) {
          moveablePoints.push(this.neighbours.E);
          if (this.neighbours.E.neighbours.S.neighbours.S) {
            sub.push(this.neighbours.E.neighbours.S.neighbours.S)
          }
        }

        if (this.neighbours.W) {
          moveablePoints.push(this.neighbours.W);
          if (this.neighbours.W.neighbours.S.neighbours.S) {
            sub.push(this.neighbours.W.neighbours.S.neighbours.S)
          }
        }

        if (this.neighbours.S.neighbours.S) {
          sub.push(this.neighbours.S.neighbours.S);
        }

        sub.forEach((point) => {
          point._move(...new DCoordinate3(0, 0, 0).subtract(diff).data, false);
          point.mesh.moved = true;
          point.parentNet.forEach((net) => {
            if (updateableNets.indexOf(net) === -1) {
              updateableNets.push(net);
            }
          });
        });
      } else if (this.neighbours.N && this.neighbours.N.type == TYPES.CORNER) {
        const add = [];
        const sub = [];
        if (this.neighbours.E) {
          moveablePoints.push(this.neighbours.E);
          if (this.neighbours.E.neighbours.N.neighbours.N) {
            sub.push(this.neighbours.E.neighbours.N.neighbours.N)
          }
        }

        if (this.neighbours.W) {
          moveablePoints.push(this.neighbours.W);
          if (this.neighbours.W.neighbours.N.neighbours.N) {
            sub.push(this.neighbours.W.neighbours.N.neighbours.N)
          }
        }

        if (this.neighbours.N.neighbours.N) {
          sub.push(this.neighbours.N.neighbours.N);
        }

        sub.forEach((point) => {
          point._move(...new DCoordinate3(0, 0, 0).subtract(diff).data, false);
          point.mesh.moved = true;
          point.parentNet.forEach((net) => {
            if (updateableNets.indexOf(net) === -1) {
              updateableNets.push(net);
            }
          });
        });
      }
    }

    moveablePoints.forEach((point) => {
      point._move(...diff.data, false);
      point.mesh.moved = true;
      point.parentNet.forEach((net) => {
        if (updateableNets.indexOf(net) === -1) {
          updateableNets.push(net);
        }
      });
    });

    this.moved = false;

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