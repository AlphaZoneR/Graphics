class Material {
    constructor(
        frontAmbient,
        frontDiffuse,
        frontSpecular,
        frontEmissive,
        frontShininess,
        backAmbient,
        backDiffuse,
        backSpecular,
        backEmissive,
        backShininess
    ) {
        this.frontAmbient = frontAmbient;
        this.frontDiffuse = frontDiffuse;
        this.frontSpecular = frontSpecular;
        this.frontEmissive = frontEmissive;
        this.frontShininess = frontShininess;
        this.backAmbient = backAmbient;
        this.backDiffuse = backDiffuse;
        this.backSpecular = backSpecular;
        this.backEmissive = backEmissive;
        this.backShininess = backShininess;
    }
}

const MatFBBrass = new Material(
    new Color4(0.329412, 0.223529, 0.027451, 0.4),
    new Color4(0.780392, 0.568627, 0.113725, 0.6),
    new Color4(0.992157, 0.941176, 0.807843, 0.8),
    new Color4(0.000000, 0.000000, 0.000000, 0.0),
    27.8974,
    new Color4(0.329412, 0.223529, 0.027451, 0.4),
    new Color4(0.780392, 0.568627, 0.113725, 0.6),
    new Color4(0.992157, 0.941176, 0.807843, 0.8),
    new Color4(0.000000, 0.000000, 0.000000, 0.0),
    27.8974);

const MatFBEmerald = new Material(
    new Color4(0.021500, 0.174500, 0.021500, 0.4),
    new Color4(0.075680, 0.614240, 0.075680, 0.6),
    new Color4(0.633000, 0.727811, 0.633000, 0.8),
    new Color4(0.000000, 0.000000, 0.000000, 0.0),
    76.8,
    new Color4(0.021500, 0.174500, 0.021500, 0.4),
    new Color4(0.075680, 0.614240, 0.075680, 0.6),
    new Color4(0.633000, 0.727811, 0.633000, 0.8),
    new Color4(0.000000, 0.000000, 0.000000, 0.0),
    76.8);

const MatFBGold = new Material(
    new Color4(0.247250, 0.199500, 0.074500, 0.4),
    new Color4(0.751640, 0.606480, 0.226480, 0.6),
    new Color4(0.628281, 0.555802, 0.366065, 0.8),
    new Color4(0.000000, 0.000000, 0.000000, 0.0),
    51.2,
    new Color4(0.247250, 0.199500, 0.074500, 0.4),
    new Color4(0.751640, 0.606480, 0.226480, 0.6),
    new Color4(0.628281, 0.555802, 0.366065, 0.8),
    new Color4(0.000000, 0.000000, 0.000000, 0.0),
    51.2);

// pearl
const MatFBPearl = new Material(
    new Color4(0.250000, 0.207250, 0.207250, 0.4),
    new Color4(1.000000, 0.829000, 0.829000, 0.6),
    new Color4(0.296648, 0.296648, 0.296648, 0.8),
    new Color4(0.000000, 0.000000, 0.000000, 0.0),
    11.264,
    new Color4(0.250000, 0.207250, 0.207250, 0.4),
    new Color4(1.000000, 0.829000, 0.829000, 0.6),
    new Color4(0.296648, 0.296648, 0.296648, 0.8),
    new Color4(0.000000, 0.000000, 0.000000, 0.0),
    11.264);

// ruby
const MatFBRuby = new Material(
    new Color4(0.174500, 0.011750, 0.011750, 0.4),
    new Color4(0.614240, 0.041360, 0.041360, 0.6),
    new Color4(0.727811, 0.626959, 0.626959, 0.8),
    new Color4(0.000000, 0.000000, 0.000000, 0.0),
    76.8,
    new Color4(0.174500, 0.011750, 0.011750, 0.4),
    new Color4(0.614240, 0.041360, 0.041360, 0.6),
    new Color4(0.727811, 0.626959, 0.626959, 0.8),
    new Color4(0.000000, 0.000000, 0.000000, 0.0),
    76.8);

// silver
const MatFBSilver = new Material(
    new Color4(0.192250, 0.192250, 0.192250, 0.4),
    new Color4(0.507540, 0.507540, 0.507540, 0.6),
    new Color4(0.508273, 0.508273, 0.508273, 0.8),
    new Color4(0.000000, 0.000000, 0.000000, 0.0),
    51.2,
    new Color4(0.192250, 0.192250, 0.192250, 0.4),
    new Color4(0.507540, 0.507540, 0.507540, 0.6),
    new Color4(0.508273, 0.508273, 0.508273, 0.8),
    new Color4(0.000000, 0.000000, 0.000000, 0.0),
    51.2);

// turquoise
const MatFBTurquoise = new Material(
    new Color4(0.100000, 0.187250, 0.174500, 0.4),
    new Color4(0.396000, 0.741510, 0.691020, 0.6),
    new Color4(0.297254, 0.308290, 0.306678, 0.8),
    new Color4(0.000000, 0.000000, 0.000000, 0.0),
    12.8,
    new Color4(0.100000, 0.187250, 0.174500, 0.4),
    new Color4(0.396000, 0.741510, 0.691020, 0.6),
    new Color4(0.297254, 0.308290, 0.306678, 0.8),
    new Color4(0.000000, 0.000000, 0.000000, 0.0),
    12.8);