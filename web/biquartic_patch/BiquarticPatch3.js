class BiquarticPatch3 extends TensorProductSurface {
    constructor() {
        super(0.0, 1.0, 0.0, 1.0, 4, 4);
    }

    UBlendingFunctionValues(uKnot, blendingValues) {
        if (arguments.length < 2) {
            throw new Error('Invalid number of arguments provided!');
        }

        if (uKnot < this.uMin || uKnot > this.uMax) {
            return false;
        }

        if (!(blendingValues instanceof RowMatrix)) {
            throw new Error('blendingValues must be of type RowMatrix');
        }

        blendingValues.resizeCols(4);

        blendingValues.set(0, this.F0D0(uKnot));
        blendingValues.set(1, this.F1D0(uKnot));
        blendingValues.set(2, this.F2D0(uKnot));
        blendingValues.set(3, this.F3D0(uKnot));

        return true;
    }

    VBlendingFunctionValues(vKnot, blendingValues) {
        if (arguments.length < 2) {
            throw new Error('Invalid number of arguments provided!');
        }

        if (vKnot < this.vMin || vKnot > this.vMax) {
            return false;
        }

        if (!(blendingValues instanceof RowMatrix)) {
            throw new Error('blendingValues must be of type RowMatrix');
        }

        blendingValues.resizeCols(4);

        blendingValues.set(0, this.F0D0(vKnot));
        blendingValues.set(1, this.F1D0(vKnot));
        blendingValues.set(2, this.F2D0(vKnot));
        blendingValues.set(3, this.F3D0(vKnot));

        return true;
    }

    calculatePartialDerivatives(maximumOrderOfPartialDerivatives, u, v, pd) {
        if (u < this.uMin || u > this.uMax || v < this.vMin || v > this.vMax || maximumOrderOfPartialDerivatives > 1) {
            return false;
        }

        if (!(pd instanceof PartialDerivatives)) {
            throw new Error('pd must be of type PartialDerivatives!');
        }

        const uBlendingValues = new RowMatrix(4);
        const d1UBlendingValues = new RowMatrix(4);

        this.UBlendingFunctionValues(u, uBlendingValues);
        d1UBlendingValues.set(0, this.F0D1(u));
        d1UBlendingValues.set(1, this.F1D1(u));
        d1UBlendingValues.set(2, this.F2D1(u));
        d1UBlendingValues.set(3, this.F3D1(u));

        const vBlendingValues = new RowMatrix(4);
        const d1VBlendingValues = new RowMatrix(4);

        this.VBlendingFunctionValues(v, vBlendingValues);
        d1VBlendingValues.set(0, this.F0D1(v));
        d1VBlendingValues.set(1, this.F1D1(v));
        d1VBlendingValues.set(2, this.F2D1(v));
        d1VBlendingValues.set(3, this.F3D1(v));

        pd.resizeRows(2);
        pd.loadNullVectors(0);

        for (let row = 0; row < 4; ++row) {
            let auxD0V = new DCoordinate3();
            let auxD1V = new DCoordinate3();
            
            for (let column = 0; column < 4; ++column) {
                auxD0V = auxD0V.add(this.data.data[row][column].multiply(vBlendingValues.at(column)));
                auxD1V = auxD1V.add(this.data.data[row][column].multiply(d1VBlendingValues.at(column)));
            }

            pd.data[0][0] = pd.data[0][0].add(auxD0V.multiply(uBlendingValues.at(row)));
            pd.data[1][0] = pd.data[1][0].add(auxD0V.multiply(d1UBlendingValues.at(row)));
            pd.data[1][1] = pd.data[1][1].add(auxD1V.multiply(uBlendingValues.at(row)));
        }

        return true;
    }

    F0D0(t) {
        return this.F3D0(1 - t);
    }

    F1D0(t) {
        return this.F2D0(1 - t);
    }

    F2D0(t) {
        return 4 * Math.pow(t, 3) * (1 - t) + 3 * Math.pow(t, 2) * Math.pow((1 - t), 2);
    }

    F3D0(t) {
        return Math.pow(t, 4);
    }

    // first order derivatives
    F0D1(t) {
        return this.F3D1(1 - t);
    }

    F1D1(t) {
        return this.F2D1(1 - t);
    }

    F2D1(t) {
        return - 2 * t * (2 * Math.pow(t, 2) + 3*t - 3);
    }

    F3D1(t) {
        return 4 * Math.pow(t, 3);
    }


}