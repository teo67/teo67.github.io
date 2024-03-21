class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this._cachedMag = null;
    }
    magnitude() {
        if(this._cachedMag == null) {
            this._cachedMag = Math.sqrt(this.x**2 + this.y**2);
        }
        return this._cachedMag;
    }
    dotProduct(other) {
        return this.x * other.x + this.y * other.y;
    }
    projectionOnto(other) {
        return this.dotProduct(other)/other.magnitude();
    }
    angleWith(other) {
        return Math.acos(this.dotProduct(other)/(other.magnitude() * this.magnitude()));
    }
    combination(other, thisMultiplier, otherMultiplier) {
        return new Vector(thisMultiplier * this.x + otherMultiplier * other.x, thisMultiplier * this.y + otherMultiplier * other.y);
    }
    add(other) {
        return this.combination(other, 1, 1);
    }
    subtract(other) {
        return this.combination(other, 1, -1);
    }
    scalarMultiply(scalar) {
        return this.combination(this, scalar, 0);
    }
}
export default Vector;