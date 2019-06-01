class Crosshair {
    constructor() {
        let gl = globalThis.gl;
        this.program = 0;
        this.loaded = false;
        this.data = new Float32Array([-0.01, 0.0, 0.01, 0.0, 0.0, -0.01, 0.0, 0.01]);
        this.dataVbo = null;

        glProgramFrom('/shaders/crosshair.vert', '/shaders/crosshair.frag').then((program) => {
            this.program = program;
            this.loaded = true;
            this.vertexLocation = gl.getAttribLocation(this.program, 'in_vert');
            this.colorLocation = gl.getUniformLocation(this.program, 'u_color');
            this.loaded = true;
        });

        this.updateVertexBufferObjects();
    }

    deleteVertexBufferObjects() {
        if (this.dataVbo) {
            globalThis.gl.deleteBuffer(this.dataVbo);
            this.dataVbo = null;
        }
    }

    updateVertexBufferObjects() {
        this.deleteVertexBufferObjects();
        const GL = WebGLRenderingContext;
        this.dataVbo = globalThis.gl.createBuffer();

        if (!this.dataVbo) {
            return false;
        }

        globalThis.gl.bindBuffer(GL.ARRAY_BUFFER, this.dataVbo);
        globalThis.gl.bufferData(GL.ARRAY_BUFFER, this.data, GL.STATIC_DRAW);
        globalThis.gl.bindBuffer(GL.ARRAY_BUFFER, null);
    }

    render() {
        if (!this.loaded || !this.program) {
            return false;
        }

        const GL = WebGLRenderingContext;
        globalThis.gl.useProgram(this.program);
        globalThis.gl.enableVertexAttribArray(this.vertexLocation);

        globalThis.gl.bindBuffer(GL.ARRAY_BUFFER, this.dataVbo);
        globalThis.gl.vertexAttribPointer(this.vertexLocation, 2, WebGLRenderingContext.FLOAT, true, 0, 0);
        globalThis.gl.drawArrays(GL.LINES, 0, 4);

        globalThis.gl.bindBuffer(GL.ARRAY_BUFFER, null);
        globalThis.gl.useProgram(null);

    }
}