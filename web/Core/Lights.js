// to do

class DirectionalLight {
    constructor(lightIndex, position, ambientIntensity, diffuseIntensity, specularIntensity) {
        if (position instanceof Hcoordinate3 && ambientIntensity instanceof Color4 && diffuseIntensity instanceof Color4 && specularIntensity instanceof Color4) {
            this.index = lightIndex;
            this.position = _.deepClone(position);
            this.ambientIntensity = _.deepClone(ambientIntensity);
            this.diffuseIntensity = _.deepClone(diffuseIntensity);
            this.specularIntensity = _.deepClone(specularIntensity);
        }
    }
}