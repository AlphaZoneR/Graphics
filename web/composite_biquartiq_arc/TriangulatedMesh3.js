class TriangulatedMesh3 {
  constructor(vertexCount = 0, faceCount = 0, usageFlag = WebGLRenderingContext.STATIC_DRAW) {
    const gl = globalThis.gl;
    this.loaded = false;

    if (gl instanceof WebGLRenderingContext) {
      this.currentXRotate = 0;
      this.currentYRotate = 0;
      this.currentZRotate = 0;
      this.currMaterial = MatFBBrass;
      this.usageFlag = usageFlag;
      this.vboVertices = null;
      this.vboNormals = null;
      this.vboTexCoordinates = null;
      this.vboIndices = null;
      this.lightVbo = null;
      this.leftMostVertex = new DCoordinate3();
      this.rightMostVertex = new DCoordinate3();
      this.vertex = new Array(vertexCount).fill().map(u => new DCoordinate3());
      this.normal = new Array(vertexCount).fill().map(u => new DCoordinate3());
      this.tex = new Array(vertexCount).fill().map(u => new TCoordinate4());
      this.face = new Array(faceCount).fill().map(u => new TriangularFace());
      this.scale = 1.0;
      this.translateVector = [0, 0, 0];
      this.boundingBox = null;
      this.center = null;
      this.moved = true;
      this._useTexture = 0;
      this.texture = null;

      if (globalThis.triangulatedProgram) {
        this.program = globalThis.triangulatedProgram;
        this.frontMaterial = {
          ambientLoc: gl.getUniformLocation(this.program, 'front_material.ambient'),
          diffuseLoc: gl.getUniformLocation(this.program, 'front_material.diffuse'),
          specularLoc: gl.getUniformLocation(this.program, 'front_material.specular'),
          emissionLoc: gl.getUniformLocation(this.program, 'front_material.emission'),
          shininessLoc: gl.getUniformLocation(this.program, 'front_material.shininess')
        }

        this.backMaterial = {
          ambientLoc: gl.getUniformLocation(this.program, 'back_material.ambient'),
          diffuseLoc: gl.getUniformLocation(this.program, 'back_material.diffuse'),
          specularLoc: gl.getUniformLocation(this.program, 'back_material.specular'),
          emissionLoc: gl.getUniformLocation(this.program, 'back_material.emission'),
          shininessLoc: gl.getUniformLocation(this.program, 'back_material.shininess')
        }

        this.light = {
          positionLoc: gl.getUniformLocation(this.program, 'light_source.position'),
          ambientLoc: gl.getUniformLocation(this.program, 'light_source.ambient'),
          diffuseLoc: gl.getUniformLocation(this.program, 'light_source.diffuse'),
          specularLoc: gl.getUniformLocation(this.program, 'light_source.specular'),
          halfVectorLoc: gl.getUniformLocation(this.program, 'light_source.half_vector'),
        }

        this.modelLocation = gl.getUniformLocation(this.program, 'u_model');
        this.viewLocation = gl.getUniformLocation(this.program, 'u_view');
        this.projectionLocation = gl.getUniformLocation(this.program, 'u_projection');
        this.scaleLocation = gl.getUniformLocation(this.program, 'u_scale');
        this.samplerLocation = gl.getUniformLocation(this.program, 'u_sampler');
        this.useTextureLocation = gl.getUniformLocation(this.program, 'u_use_texture');

        this.vertexLocation = gl.getAttribLocation(this.program, 'position');
        this.normalLocation = gl.getAttribLocation(this.program, 'normal');
        this.texLocation = gl.getAttribLocation(this.program, 'tex');
        this.loaded = true;
      } else {
        glProgramFrom('/shaders/agoston.1.vert', '/shaders/agoston.1.frag')
          .then((program) => {
            this.program = program;
            globalThis.triangulatedProgram = program;
            this.frontMaterial = {
              ambientLoc: gl.getUniformLocation(this.program, 'front_material.ambient'),
              diffuseLoc: gl.getUniformLocation(this.program, 'front_material.diffuse'),
              specularLoc: gl.getUniformLocation(this.program, 'front_material.specular'),
              emissionLoc: gl.getUniformLocation(this.program, 'front_material.emission'),
              shininessLoc: gl.getUniformLocation(this.program, 'front_material.shininess')
            }

            this.backMaterial = {
              ambientLoc: gl.getUniformLocation(this.program, 'back_material.ambient'),
              diffuseLoc: gl.getUniformLocation(this.program, 'back_material.diffuse'),
              specularLoc: gl.getUniformLocation(this.program, 'back_material.specular'),
              emissionLoc: gl.getUniformLocation(this.program, 'back_material.emission'),
              shininessLoc: gl.getUniformLocation(this.program, 'back_material.shininess')
            }

            this.light = {
              positionLoc: gl.getUniformLocation(this.program, 'light_source.position'),
              ambientLoc: gl.getUniformLocation(this.program, 'light_source.ambient'),
              diffuseLoc: gl.getUniformLocation(this.program, 'light_source.diffuse'),
              specularLoc: gl.getUniformLocation(this.program, 'light_source.specular'),
              halfVectorLoc: gl.getUniformLocation(this.program, 'light_source.half_vector'),
            }

            this.modelLocation = gl.getUniformLocation(this.program, 'u_model');
            this.viewLocation = gl.getUniformLocation(this.program, 'u_view');
            this.projectionLocation = gl.getUniformLocation(this.program, 'u_projection');
            this.scaleLocation = gl.getUniformLocation(this.program, 'u_scale');
            this.samplerLocation = gl.getUniformLocation(this.program, 'u_sampler');
            this.useTextureLocation = gl.getUniformLocation(this.program, 'u_use_texture');

            this.vertexLocation = gl.getAttribLocation(this.program, 'position');
            this.normalLocation = gl.getAttribLocation(this.program, 'normal');
            this.texLocation = gl.getAttribLocation(this.program, 'tex');
            this.loaded = true;
          });
      }
    }
  }

  deleteVertexBufferObjects() {
    if (this.vboVertices) {
      globalThis.gl.deleteBuffer(this.vboVertices);
      this.vboVertices = null;
    }

    if (this.vboNormals) {
      globalThis.gl.deleteBuffer(this.vboNormals);
      this.vboNormals = null;
    }

    if (this.vboTexCoordinates) {
      globalThis.gl.deleteBuffer(this.vboTexCoordinates);
      this.vboTexCoordinates = null;
    }

    if (this.vboIndices) {
      globalThis.gl.deleteBuffer(this.vboIndices);
      this.vboIndices = null;
    }

    if (this.lightVbo) {
      globalThis.gl.deleteBuffer(this.lightVbo);
    }
  }

  updateVertexBufferObjects(usageFlag) {
    const GL = WebGLRenderingContext;
    const gl = globalThis.gl;
    const allowed = [GL.STREAM_DRAW, GL.STATIC_DRAW, GL.DYNAMIC_DRAW];

    if (allowed.indexOf(usageFlag) === -1) {
      return false;
    }

    this.usageFlag = usageFlag;

    if (gl instanceof WebGLRenderingContext) {

      this.deleteVertexBufferObjects();

      this.vboVertices = gl.createBuffer();

      if (!this.vboVertices) {
        return false;
      }

      this.vboNormals = gl.createBuffer();

      if (!this.vboNormals) {
        this.deleteVertexBufferObjects();
        return false;
      }

      this.vboTexCoordinates = gl.createBuffer();

      if (!this.vboTexCoordinates) {
        this.deleteVertexBufferObjects();
        return false;
      }

      this.vboIndices = gl.createBuffer();

      if (!this.vboIndices) {
        this.deleteVertexBufferObjects();
        return false;
      }

      this.lightVbo = gl.createBuffer();

      if (!this.lightVbo) {
        this.deleteVertexBufferObjects();
        return false;
      }

      const floatVerticesArray = new Float32Array(this.vertex.map(dcoordiante => [dcoordiante.x, dcoordiante.y, dcoordiante.z]).flat());
      gl.bindBuffer(GL.ARRAY_BUFFER, this.vboVertices);
      gl.bufferData(GL.ARRAY_BUFFER, floatVerticesArray, this.usageFlag);

      const floatNormalsArray = new Float32Array(this.normal.map(dcoordiante => [dcoordiante.x, dcoordiante.y, dcoordiante.z]).flat());

      gl.bindBuffer(GL.ARRAY_BUFFER, this.vboNormals);
      gl.bufferData(GL.ARRAY_BUFFER, floatNormalsArray, this.usageFlag);

      const floatTexCoordsArray = new Float32Array(this.tex.map(tcoord => [tcoord.s, tcoord.t, tcoord.r, tcoord.q]).flat());
      gl.bindBuffer(GL.ARRAY_BUFFER, this.vboTexCoordinates);
      gl.bufferData(GL.ARRAY_BUFFER, floatTexCoordsArray, this.usageFlag);

      gl.bindBuffer(GL.ARRAY_BUFFER, this.lightVbo);
      gl.bufferData(GL.ARRAY_BUFFER, new Float32Array(cube), this.usageFlag);

      const intIndicesArray = new Uint32Array(this.face.map(tface => [tface.data[0], tface.data[1], tface.data[2]]).flat());
      gl.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, this.vboIndices);
      gl.bufferData(GL.ELEMENT_ARRAY_BUFFER, intIndicesArray, this.usageFlag);

      gl.bindBuffer(GL.ARRAY_BUFFER, null);
      gl.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, null);

      return true;
    }

  }

  render(viewMatrix, renderMode) {
    if (!this.vboVertices || !this.vboNormals || !this.vboTexCoordinates || !this.vboIndices || !this.loaded) {
      return false;
    }

    const gl = globalThis.gl;

    if (gl instanceof WebGLRenderingContext) {
      const accepted = [gl.TRIANGLES, gl.POINTS, gl.TRIANGLE_STRIP];

      if (accepted.indexOf(renderMode) === -1) {
        return false;
      }

      gl.useProgram(this.program);

      gl.uniform4fv(this.light.ambientLoc, [0.4, 0.4, 0.4, 1.0]);
      gl.uniform4fv(this.light.diffuseLoc, [0.8, 0.8, 0.8, 1.0]);
      gl.uniform4fv(this.light.specularLoc, [1.0, 1.0, 1.0, 1.0]);

      gl.uniform4fv(this.frontMaterial.ambientLoc, this.currMaterial.frontAmbient.data);
      gl.uniform4fv(this.frontMaterial.diffuseLoc, this.currMaterial.frontDiffuse.data);
      gl.uniform4fv(this.frontMaterial.specularLoc, this.currMaterial.frontSpecular.data);
      gl.uniform4fv(this.frontMaterial.emissionLoc, this.currMaterial.frontEmissive.data);
      gl.uniform1f(this.frontMaterial.shininessLoc, this.currMaterial.frontShininess);

      gl.uniform4fv(this.backMaterial.ambientLoc, this.currMaterial.backAmbient.data);
      gl.uniform4fv(this.backMaterial.diffuseLoc, this.currMaterial.backDiffuse.data);
      gl.uniform4fv(this.backMaterial.specularLoc, this.currMaterial.backSpecular.data);
      gl.uniform4fv(this.backMaterial.emissionLoc, this.currMaterial.backEmissive.data);
      gl.uniform1f(this.backMaterial.shininessLoc, this.currMaterial.backShininess);

      gl.uniform1i(this.useTextureLocation, this._useTexture);

      const cameraPos = [cos(time / 100) * scaleValue, sin(time / 100) * scaleValue, scaleValue];
      let proj = perspective(degToRad(45.0), gl.canvas.width / gl.canvas.height, 1.0, 1000.0);

      const lookat = viewMatrix;
      let model = [1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
      ];

      let position = new HCoordinate3(0, 0, 1);
      let halfVector = new DCoordinate3(0, 0, 1).add(new DCoordinate3(...cameraPos).normalize());
      halfVector.normalize();
      halfVector = new HCoordinate3(...halfVector.data);

      gl.uniform4fv(this.light.positionLoc, position.data);
      gl.uniform4fv(this.light.halfVectorLoc, halfVector.data);


      model = translate(model, ...this.translateVector);

      model = xRotate(model, degToRad(this.currentXRotate));
      model = yRotate(model, degToRad(this.currentYRotate));
      model = zRotate(model, degToRad(this.currentZRotate));

      gl.uniformMatrix4fv(this.projectionLocation, false, proj);
      gl.uniformMatrix4fv(this.viewLocation, false, lookat);
      gl.uniformMatrix4fv(this.modelLocation, false, model);
      gl.uniform1f(this.scaleLocation, this.scale);

      // gl.uniform3fv(this.light.positionLoc, [cos(time / 100) * (scaleValue - 1), sin(time / 100) * (scaleValue - 1), (scaleValue - 1)]);
    
      gl.enableVertexAttribArray(this.vertexLocation);
      gl.enableVertexAttribArray(this.normalLocation);
      

      gl.bindBuffer(gl.ARRAY_BUFFER, this.vboNormals);
      gl.vertexAttribPointer(this.normalLocation, 3, gl.FLOAT, false, 0, 0);

      gl.bindBuffer(gl.ARRAY_BUFFER, this.vboVertices);
      gl.vertexAttribPointer(this.vertexLocation, 3, gl.FLOAT, false, 0, 0);

      if (this._useTexture == 1) {
        gl.enableVertexAttribArray(this.texLocation);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vboTexCoordinates);
        gl.vertexAttribPointer(this.texLocation, 4, gl.FLOAT, false, 0, 0);
        this.texture.use();
        gl.uniform1i(this.samplerLocation, 0);
      }

      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.vboIndices);
      gl.drawElements(renderMode, 3 * this.face.length, gl.UNSIGNED_INT, 0);

      gl.bindBuffer(gl.ARRAY_BUFFER, null);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

      gl.disableVertexAttribArray(this.vertexLocation);
      gl.disableVertexAttribArray(this.normalLocation);

      // gl.useProgram(this.lightProg);
      // gl.uniformMatrix4fv(this.lightProjectionLocation, false, proj);
      // gl.uniformMatrix4fv(this.lightViewLocation, false, lookat);
      // let lightModel = [1, 0, 0, 0,
      //   0, 1, 0, 0,
      //   0, 0, 1, 0,
      //   0, 0, 0, 1
      // ];
      // lightModel = translate(lightModel, cos(time / 100) * (scaleValue - 1), sin(time / 100) * (scaleValue - 1), (scaleValue - 1));
      // lightModel = scale(lightModel, 0.05, 0.05, 0.05);
      // gl.uniformMatrix4fv(this.lightModelLocation, false, lightModel);
      // gl.enableVertexAttribArray(this.lightVertexLocation);
      // gl.bindBuffer(gl.ARRAY_BUFFER, this.lightVbo);
      // gl.vertexAttribPointer(this.lightVertexLocation, 3, gl.FLOAT, false, 0, 0);
      // gl.drawArrays(gl.TRIANGLES, 0, 36);

      return true;
    }

  }

  calculateBoundingBox() {
    if (!this.loaded) {
      return [];
    }

    if (this.boundingBox && !this.moved) {
      return this.boundingBox;
    }

    let xmin = Infinity;
    let xmax = -Infinity;
    let ymin = Infinity;
    let ymax = -Infinity;
    let zmin = Infinity;
    let zmax = -Infinity;

    this.vertex.forEach((coordinate) => {
      let translatedCoordinate = coordinate.multiply(this.scale).add(new DCoordinate3(...this.translateVector))
      if (translatedCoordinate.x < xmin) {
        xmin = translatedCoordinate.x;
      }

      if (translatedCoordinate.x > xmax) {
        xmax = translatedCoordinate.x;
      }

      if (translatedCoordinate.y < ymin) {
        ymin = translatedCoordinate.y;
      }

      if (translatedCoordinate.y > ymax) {
        ymax = translatedCoordinate.y;
      }

      if (translatedCoordinate.z < zmin) {
        zmin = translatedCoordinate.z;
      }

      if (translatedCoordinate.z > zmax) {
        zmax = translatedCoordinate.z;
      }
    });
    this.boundingBox = [xmin, xmax, ymin, ymax, zmin, zmax];
    this.moved = false;
    return [xmin, xmax, ymin, ymax, zmin, zmax];
  }

  set useTexture(boolean) {
    if (boolean === true) {
      this._useTexture = 1;
    } else {
      this._useTexture = 0;
    }
  }

  get useTexture() {
    return this._useTexture == 1 ? true : false;
  }

  calculateCenter() {
    if (!this.loaded) {
      return [];
    }

    if (this.center && !this.moved) {
      return this.center;
    }

    let centroid = new DCoordinate3(0, 0, 0);

    this.vertex.forEach((coordinate) => {
      centroid = centroid.add(coordinate.multiply(this.scale).add(new DCoordinate3(...this.translateVector)));
    });

    centroid = centroid.divide(this.vertex.length);
    this.center = centroid;
    this.moved = false;
    return this.center;
  }

  set mat(val) {
    this.currMaterial = val;
  }

  async fromOFF(filename, translateAndFit) {
    const headers = new Headers();
    headers.append('pragma', 'no-cache');
    headers.append('cache-control', 'no-cache');

    const fileResponse = await fetch(filename, { headers, method: 'GET' });
    const fileContents = await fileResponse.text();

    const lines = fileContents.split('\n').filter(line => line.length !== 0).filter(line => !line.startsWith('#'));

    let [vertexCount, faceCount, edgeCount] = lines[1].split(' ').map(n => parseInt(n, 10));

    this.vertex = new Array(vertexCount).fill().map(u => new DCoordinate3());
    this.normal = new Array(vertexCount).fill().map(u => new DCoordinate3());
    this.tex = new Array(vertexCount).fill().map(u => new TCoordinate4());
    this.face = new Array(faceCount).fill().map(u => new TriangularFace());

    this.leftMostVertex.data = new Float32Array([99999, 99999, 99999]);
    this.rightMostVertex.data = new Float32Array([-99999, -99999, -99999]);

    let lineCount = 2;

    for (let i = 0; i < vertexCount; ++i) {
      const foo = new DCoordinate3();
      foo.fromString(lines[lineCount++]);
      this.vertex[i] = foo;

      if (foo.x < this.leftMostVertex.x) {
        this.leftMostVertex.x = foo.x;
      }

      if (foo.y < this.leftMostVertex.y) {
        this.leftMostVertex.y = foo.y;
      }

      if (foo.z < this.leftMostVertex.z) {
        this.leftMostVertex.z = foo.z;
      }

      if (foo.x > this.rightMostVertex.x) {
        this.rightMostVertex.x = foo.x;
      }

      if (foo.y > this.rightMostVertex.y) {
        this.rightMostVertex.y = foo.y;
      }

      if (foo.z > this.rightMostVertex.z) {
        this.rightMostVertex.z = foo.z;
      }
    }

    if (translateAndFit) {
      const scale = 1.0 / Math.max(this.rightMostVertex.x - this.leftMostVertex.x, this.rightMostVertex.y - this.leftMostVertex.y, this.rightMostVertex.z - this.leftMostVertex.z);
      let middle = _.cloneDeep(this.leftMostVertex);
      middle = middle.add(this.rightMostVertex);
      middle = middle.multiply(0.5);

      this.vertex = this.vertex.map((vit) => {
        vit = vit.subtract(middle);
        return vit.multiply(scale);
      });
    }

    for (let i = 0; i < faceCount; ++i) {
      const foo = new TriangularFace();
      const doo = lines[lineCount++];
      foo.fromString(doo);
      this.face[i] = foo;
    }

    for (const face of this.face) {
      if (face instanceof TriangularFace) {
        let n = this.vertex[face.at(1)];
        n = n.subtract(this.vertex[face.at(0)]);

        let p = this.vertex[face.at(2)];
        p = p.subtract(this.vertex[face.at(0)]);

        n = n.cross(p);

        for (let node = 0; node < 3; ++node) {
          this.normal[face.at(node)] = this.normal[face.at(node)].add(n);
        }
      }
    }

    for (const normal of this.normal) {
      normal.normalize();
    }

    return true;
  }
}