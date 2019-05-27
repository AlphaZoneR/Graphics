class Derivatives extends ColumnMatrix {
    constructor(maximumOrderOfDerivatives = 2) {
        super(2);
        this.data = this.data.fill().map(e => [new DCoordinate3()]);
        this.maximumOrderOfDerivatives = maximumOrderOfDerivatives;
    }

    loadNullVectors() {
        this.data.forEach((row) => {
            row[0].data[0] = 0.0;
            row[0].data[1] = 0.0;
            row[0].data[2] = 0.0;
        });
    }
}