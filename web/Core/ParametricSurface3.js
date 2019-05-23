class ParametricSurface3 {
    constructor(pd, uMin, uMax, vMin, vMax) {
        this.pd = _.cloneDeep(pd);
        this.uMin = uMin;
        this.uMax = uMax;
        this.vMin = vMin;
        this.vMax = vMax;
    }

    generateImage(uDivCount, vDivCount, usageFlag) {
        if (this.pd.rowCount < 2 || uDivCount < 2 || vDivCount < 2) {
            console.error(`[Error] Geneare pd.rowCout < 2 || uDivCount < 2 || vDivCount < 2`);
            return null;
        }

        let result = new TriangulatedMesh3(
            uDivCount * vDivCount,
            2 * (uDivCount - 1) * (vDivCount - 1),
            usageFlag);

        const du = (this.uMax - this.uMin) / (uDivCount - 1);
        const dv = (this.vMax - this.vMin) / (vDivCount - 1);

        
        const ds = 1.0 / (uDivCount - 1);
        const dt = 1.0 / (vDivCount - 1);
        
        let currentFace = 0;

        for (let i = 0; i < uDivCount; ++i) {
            const u = Math.min(this.uMin + i * du, this.uMax);
            const s = Math.min(i * ds, 1.0);

            for (let j = 0; j < vDivCount; ++j) {
                const v = Math.min(this.vMin + j * dv, this.vMax);
                const t = Math.min(j * dt, 1.0);

                const index = new Uint32Array(4);
                index[0] = i * vDivCount + j;
                index[1] = index[0] + 1;
                index[2] = index[1] + vDivCount;
                index[3] = index[2] - 1;

                result.vertex[[index[0]]] = this.pd.at(0, 0)(u, v);

                result.normal[index[0]] = this.pd.at(1, 0)(u, v);
                result.normal[index[0]] = result.normal[index[0]].cross(this.pd.at(1, 1)(u, v));
                result.normal[index[0]].normalize();

                result.tex[index[0]].s = s;
                result.tex[index[0]].t = t;

                if (i < uDivCount - 1 && j < vDivCount - 1) {
                    result.face[currentFace].set(0, index[0]);
                    result.face[currentFace].set(1, index[1]);
                    result.face[currentFace].set(2, index[2]);
                    ++currentFace;

                    result.face[currentFace].set(0, index[0]);
                    result.face[currentFace].set(1, index[2]);
                    result.face[currentFace].set(2, index[3]);
                    ++currentFace;
                }
            }
        }
        console.log(result.face);
        return result;
    }
}