class GenericCurve3 {
    constructor(maximumOrderOfDerivatives = 2, pointCount = 0, usageFlag = WebGLRenderingContext.STATIC_DRAW) {
        this.usageFlag = usageFlag;
        this.vboDerivative = new RowMatrix(maximumOrderOfDerivatives + 1);
        this.derivative = new Matrix(maximumOrderOfDerivatives + 1, pointCount);
    }

    copy(curve) {
        if (curve instanceof GenericCurve3) {
            this.usageFlag = curve.usageFlag;
            this.vboDerivative = _.cloneDeep(curve.vboDerivative);
            this.derivative = _.cloneDeep(curve.derivative);

            vboUpdateIsPossible = true;

            for (let i = 0; i < curve.derivative.columnCount; ++i) {
                vboUpdateIsPossible &= curve.vboDerivative(i);
            }

            if (vboUpdateIsPossible) {
                this.updateVertexBufferObjects(this.usageFlag);
            }
        }
    }

    deleteVertexBufferObjects() {
        for (let i = 0; i < this.vboDerivative.columnCount; ++i) {
            if (this.vboDerivative.at(i)) {
                globalThis.gl.deleteBuffer(this.vboDerivative.at(i))
                this.vboDerivative.set(i, 0);
            }
        }
    }

    renderDerivatives(order, renderMode) {
        const maxOrder = this.derivative.rowCount;
        if (order >= maxOrder || !this.vboDerivative.at(order)) {
            return false;
        }

        const pointCount = this.derivative.columnCount;

        globalThis.gl.bindBuffer(WebGLRenderingContext.ARRAY_BUFFER, this.vboDerivative.at(order));
        globalThis.gl.vertexAttribPointer(globalThis.positionAttributeLocation, 3, WebGLRenderingContext.FLOAT, true, 0, 0);
        if (order === 0) {
            if (renderMode !== WebGLRenderingContext.LINE_STRIP && renderMode !== WebGLRenderingContext.LINE_LOOP && renderMode !== WebGLRenderingContext.POINTS) {
                globalThis.gl.bindBuffer(WebGLRenderingContext.ARRAY_BUFFER, 0);
                return false;
            }
            globalThis.gl.drawArrays(renderMode, 0, pointCount)
        } else {
            if (renderMode !== WebGLRenderingContext.LINES && renderMode !== WebGLRenderingContext.POINTS) {
                globalThis.gl.bindBuffer(WebGLRenderingContext.ARRAY_BUFFER, null);
                return false;
            }

            globalThis.gl.drawArrays(renderMode, 0, 2 * pointCount);
        }

        globalThis.gl.bindBuffer(WebGLRenderingContext.ARRAY_BUFFER, null);

        return true;
    }

    updateVertexBufferObjects(usageFlag) {
        const GL = WebGLRenderingContext;
        if (usageFlag !== GL.STREAM_DRAW && usageFlag !== GL.DYNAMIC_DRAW && usageFlag !== GL.STATIC_DRAW) {
            return false;
        }

        this.deleteVertexBufferObjects();
        
        this.usageFlag = usageFlag;

        for (let d = 0; d < this.vboDerivative.columnCount; ++d) {
            this.vboDerivative.set(d, globalThis.gl.createBuffer());
            if (!this.vboDerivative.at(d)) {
                for (let i = 0; i < d; ++i) {
                    globalThis.gl.deleteBuffer(this.vboDerivative.get(i));
                    this.vboDerivative.set(d, i);
                }
                return false;
            }
        }

        // curve points
        const curvePointSize = this.derivative.columnCount;
        globalThis.gl.bindBuffer(GL.ARRAY_BUFFER, this.vboDerivative.at(0));
        globalThis.gl.bufferData(GL.ARRAY_BUFFER, new Float32Array(this.derivative.getRow(0).map(o => [o.x, o.y, o.z]).flat()), this.usageFlag);
        // higher derivatives

        const higherOrderDerivativeSize = 2 * curvePointSize;

        for (let d = 1; d < this.derivative.rowCount; ++d) {
            const array = new Float32Array(higherOrderDerivativeSize * 3);

            let coordinate = 0;

            for (let i = 0; i < curvePointSize; ++i) {
                let sum = this.derivative.at(0, i);
                sum = sum.add(this.derivative.at(d, i).multiply(0.3));

                for (let j = 0; j < 3; ++j) {
                    array[coordinate] = this.derivative.at(0, i).data[j];
                    array[coordinate + 3] = sum.data[j];
                    ++coordinate;
                }

                coordinate += 3;
            }

            globalThis.gl.bindBuffer(GL.ARRAY_BUFFER, this.vboDerivative.at(d));
            globalThis.gl.bufferData(GL.ARRAY_BUFFER, array, this.usageFlag);
        }

        globalThis.gl.bindBuffer(GL.ARRAY_BUFFER, null);
    }

    setDerivative(order, index, d) {
        if (order >= this.derivative.rowCount || index >= this.derivative.columnCount) {
            return false;
        }
        this.derivative.set(order, index, d);

        return true;
    }

    // setDerivative(order, index, x, y, z) {
    //     if (order >= this.derivative.rowCount || index >= this.derivative.columnCount) {
    //         return false;
    //     }

    //     this.derivative.set(order, index, new DCoordinate3(x, y, z));
    //     // this.derivative.at(order, index).y = y;
    //     // this.derivative.at(order, index).z = z;

    //     return true;
    // }

    getDerivative(order, index) {
        if (order >= this.derivative.rowCount || index >= this.derivative.columnCount) {
            return null;
        }

        return this.derivative.at(order, index);
    }

    get maximumOrderOfDerivatives() {
        return this.derivative.rowCount - 1;
    }

    get pointCount() {
        return this.derivative.columnCount;
    }
}