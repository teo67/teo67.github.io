import Vector from "./Vector.js";

class MovingObject {
    constructor(element) {
        this.element = element;
        this.position = new Vector(0, 0);
    }
    updatePosition(position, radius) {
        this.position = position;
        this.element.style.left = `${position.x - radius}px`;
        this.element.style.top = `${position.y - radius}px`;
    }
}

export default MovingObject;