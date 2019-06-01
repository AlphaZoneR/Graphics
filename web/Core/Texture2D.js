class Texture2D {
  constructor(filename) {
    this.loaded = false;
    this.texture = null;
    this.image = null;

    const headers = new Headers();
    headers.append('pragma', 'no-cache');
    headers.append('cache-control', 'no-cache');

    fetch(filename, { headers, method: 'GET' }).then((response) => {
      response.blob().then((blob) => {
        this.image = new Image();
        this.image.src = URL.createObjectURL(blob);

        this.image.onload = (event) => {
          this.updateTexture();
          this.loaded = true;
        }
      });
    })
  }

  deleteTexture() {
    if (this.texture) {
      globalThis.gl.deleteTexture(this.texture);
    }
  }

  updateTexture() {
    this.deleteTexture();

    this.texture = globalThis.gl.createTexture();

    if (!this.texture) {
      return false;
    }

    const GL = WebGLRenderingContext;

    globalThis.gl.bindTexture(GL.TEXTURE_2D, this.texture);
    globalThis.gl.texImage2D(GL.TEXTURE_2D, 0, GL.RGB, GL.RGB, GL.UNSIGNED_BYTE, this.image);

    if (isPowerOf2(this.image.width) && isPowerOf2(this.image.height)) {
      globalThis.gl.generateMipmap(GL.TEXTURE_2D);
    } else {
      globalThis.gl.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE);
      globalThis.gl.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE);
      globalThis.gl.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.LINEAR);
    }
  }

  use() {
    if (this.loaded || this.image || this.texture) {
      globalThis.gl.activeTexture(globalThis.gl.TEXTURE0)
      globalThis.gl.bindTexture(globalThis.gl.TEXTURE_2D, this.texture);
    }
  }

  static useDefault() {
    globalThis.gl.bindTexture(globalThis.gl.TEXTURE_2D, null);
  }
}