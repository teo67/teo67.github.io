import MovingObject from "./MovingObject.js";
import Vector from "./Vector.js";

class Buoy extends MovingObject {
    constructor(isRed, element, position, radius, boat) {
        super(element);
        this.isRed = isRed;
        this.updatePosition(position, radius, radius);
        this.updateRelativePosition(boat);
        this.radialDisplay = null;
    }

    updateRelativePosition(boat) {
        this.relative = new Vector(
            (this.position.x - boat.position.x) * Math.cos(boat.orientation) - (this.position.y - boat.position.y) * Math.sin(boat.orientation),
            (this.position.y - boat.position.y) * Math.cos(boat.orientation) + (this.position.x - boat.position.x) * Math.sin(boat.orientation)
        );
    }
}

export default Buoy;