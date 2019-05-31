class FPSCamera {
  constructor() {
    this.roll = Math.PI;
    this.pitch = Math.PI;
    this.yaw = Math.PI;
    this.viewMatrix = identity();
    this.eyeVector = new DCoordinate3(Math.cos(1) * 5, Math.sin(1) * 5, 5);
    this.speed = 0.05;
    this.mouseXSens = 0.5;
    this.mouseYsens = 0.5;
    this.mousePosition = new DCoordinate3();
    this.mousePressed = false;
  }

  updateView() {
    let matRoll = glMatrix.mat4.create();
    let matPitch = glMatrix.mat4.create();
    let matYaw = glMatrix.mat4.create();

    glMatrix.mat4.rotateZ(matRoll, matRoll, this.roll);
    glMatrix.mat4.rotateX(matPitch, matPitch, this.pitch);
    glMatrix.mat4.rotateY(matYaw, matYaw, this.yaw);

    const rotate = glMatrix.mat4.create();
    glMatrix.mat4.mul(rotate, matRoll, matPitch);
    glMatrix.mat4.mul(rotate, rotate, matYaw);


    let translated = glMatrix.mat4.create();
    glMatrix.mat4.translate(translated, translated, new Float32Array([-this.eyeVector.x, -this.eyeVector.y, -this.eyeVector.z]));

    glMatrix.mat4.mul(this.viewMatrix, rotate, translated);
  }

  get forward() {
    return new DCoordinate3(this.viewMatrix[2], this.viewMatrix[6], this.viewMatrix[10]);
  }

  set forward(val) {
    this.viewMatrix[2] = val.x;
    this.viewMatrix[6] = val.y;
    this.viewMatrix[10] = val.z;
  }

  move(character) {
    let dx = 0.0;
    let dz = 0.0;

    if (character === 'w') {
      dz = 2;
    } else if (character === 's') {
      dz = -2;
    } else if (character === 'a') {
      dx = -2;
    } else if (character === 'd') {
      dx = 2;
    }
    // 0 1 2 3
    // 4 5 6 7
    // 8 9 0 1
    // 2 3 4 5

    const mat = _.cloneDeep(this.viewMatrix);
    const forward = new DCoordinate3(mat[2], mat[6], mat[10]);
    const strafe = new DCoordinate3(mat[0], mat[4], mat[8]);
    const multipliedForward = forward.multiply(-dz);
    const multipliedStrafe = strafe.multiply(dx);
    const added = multipliedForward.add(multipliedStrafe).multiply(this.speed);
    this.eyeVector = this.eyeVector.add(added);

    this.updateView();
  }

  mouseMove(x, y) {
    // if (!this.mousePressed) {
    //   this.mousePosition = new DCoordinate3(x, y, 0);
    //   return false;
    // }

    const mouseDelta = new DCoordinate3(x, y, 0).subtract(this.mousePosition);

    this.yaw += this.mouseXSens * mouseDelta.x;
    this.pitch += this.mouseYsens * mouseDelta.y;

    this.mousePosition = new DCoordinate3(x, y, 0);
    this.updateView();
  }

  mouseDown(x, y) {
    this.mousePressed = true;
    this.mousePosition.x = x;
    this.mousePosition.y = y;
  }

  mouseUp() {
    this.mousePressed = false;
  }
}