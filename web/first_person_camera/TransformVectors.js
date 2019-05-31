class TransformVectors {
  constructor(x = 0, y = 0, z = 0) {
    this.position = new DCoordinate3(x, y, z);
    this.loaded = false;
    this.arrow = new TriangulatedMesh3();
    this.hidden = true;
    this.arrow.fromOFF('/meshes/arrow.off').then(() => {
      this.loaded = true;
      this.arrow.updateVertexBufferObjects(globalThis.gl.STATIC_DRAW);
    });
  }


  render(viewMatrix) {
    if (this.hidden) {
      return false;
    }
    this.arrow.translateVector = _.cloneDeep(this.position.data);
    this.arrow.scale = 0.2;
    this.arrow.translateVector[2] -= 0.05 * this.arrow.scale;
    this.arrow.translateVector[1] -= 0.05 * this.arrow.scale;
    this.arrow.currentXRotate = 0;
    this.arrow.currentZRotate = 0;
    this.arrow.mat = MatFBEmerald;
    this.arrow.render(viewMatrix, globalThis.gl.TRIANGLES);
    this.arrow.translateVector[2] += 0.05 * this.arrow.scale;
    this.arrow.translateVector[1] += 0.05 * this.arrow.scale;
    this.arrow.mat = MatFBRuby;
    this.arrow.currentXRotate = 90;
    this.arrow.render(viewMatrix, globalThis.gl.TRIANGLES);
    this.arrow.mat = MatFBTurquoise;
    this.arrow.currentXRotate = 90;
    this.arrow.currentZRotate = 90;
    this.arrow.render(viewMatrix, globalThis.gl.TRIANGLES);
  }

  move(position) {
    if (position instanceof Array || position instanceof Float32Array) {
      this.position = new DCoordinate3(...position);
    } else if (position instanceof DCoordinate3) {
      this.position = _.cloneDeep(position);
    }
  }

  show() {
    this.hidden = false;
  }

  hide() {
    this.hidden = true;
  }
}