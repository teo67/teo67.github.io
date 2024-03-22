import Vector from "./Vector.js";

class MovingObject {
    constructor(element) {
        this.element = element;
        this.position = new Vector(0, 0);
    }
    updatePosition(position, halfWidth, halfHeight) {
        this.position = position;
        this.element.style.left = `${position.x - halfWidth}px`;
        this.element.style.top = `${position.y - halfHeight}px`;
    }
}

export default MovingObject;