import { turnUpdateInterval, turnSpeed, stepUpdateRate, pixelsPerFoot, sameColorMaxDist, sameColorMinDist, sameColorMidpointDist, diffColorMaxDist, diffColorMinDist, diffColorMidpointDist, boatRadius, buoyRadius } from "./constants.js";
import { updateBoatOrientation, addWeight, getValue, makeBuoyElement, makeFullRadialDisplay, makeGrid, clearBuoys } from "./util.js";
import Vector from "./Vector.js";
import Buoy from "./Buoy.js";
import MovingObject from "./MovingObject.js";
import weights from "./weights.js";
import getBuoyOrderings from "./getBuoyOrderings.js";
import step from "./step.js";
import generatePath from "./generatePath.js";

const weightsElement = document.getElementById("weights");
const boatElement = document.getElementById("boat");
const buoys = document.getElementById("buoys");
const redSupply = document.getElementById("red-supply");
const greenSupply = document.getElementById("green-supply");

const generateButton = document.getElementById("generate");

const clearButton = document.getElementById("clear");

const tryClick = (ev, target, radius) => {
    const mouseVector = new Vector(ev.pageX, ev.pageY);
    const diff = mouseVector.subtract(target.position);
    if(diff.magnitude() <= radius) {
        selected = target;
        offset = diff;
        return true;
    }
    return false;
}

const regenSupply = isRed => {
    const newElement = makeBuoyElement(isRed);
    (isRed ? redSupply : greenSupply).appendChild(newElement);
    const newBuoy = new Buoy(isRed, newElement, new Vector(isRed ? 2 * buoyRadius : 35 + 2 * buoyRadius, 2 * buoyRadius), buoyRadius, boat);
    if(isRed) {
        nextRedBuoy = newBuoy;
    } else {
        nextGreenBuoy = newBuoy;
    }
}

for(const weight of weights) {
    weight.configureCallbacks(() => getBuoyOrderings(boat, buoyList));
}

let selected = null;
let offset = new Vector(0, 0);
// x = left, y = forward

const buoyList = [];
let nextRedBuoy = null;
let nextGreenBuoy = null;
let turnDirection = 0;
let registeredTurnInterval = null;
let stepping = false;
let stepTimestamp = null;

const boatSpeed = addWeight(weightsElement, 'boat speed', 10, false, false);
const boat = new MovingObject(boatElement);
boat.orientation = 0;
boat.updatePosition(new Vector(100, 100), boatRadius);
updateBoatOrientation(boat, 0);

regenSupply(true);
regenSupply(false);

makeGrid();

generatePath(buoyList, boat);

document.addEventListener('mousedown', ev => {
    if(!tryClick(ev, boat, boatRadius)) {
        if(tryClick(ev, nextGreenBuoy, buoyRadius)) return;
        if(tryClick(ev, nextRedBuoy, buoyRadius)) return;
        for(const buoy of buoyList) {
            if(tryClick(ev, buoy, buoyRadius)) return;
        }
    } else {
        registeredTurnInterval = setInterval(() => {
            updateBoatOrientation(boat, boat.orientation + turnUpdateInterval * turnSpeed * turnDirection);
        }, turnUpdateInterval*1000);
    }
});

document.addEventListener('mouseup', () => {
    if(selected !== null) {
        const isRedSupply = selected == nextRedBuoy;
        const isGreenSupply = selected == nextGreenBuoy;
        if(isRedSupply || isGreenSupply) {
            regenSupply(isRedSupply);
            buoys.appendChild(selected.element);
            buoyList.push(selected);
        }
        if(selected == boat) {
            for(const buoy of buoyList) {
                buoy.updateRelativePosition(boat);
            }
            clearInterval(registeredTurnInterval);
        } else {
            if(window.innerWidth - selected.position.x < 50) {
                selected.element.remove();
                buoyList.splice(buoyList.indexOf(selected), 1);
            }
            selected.updateRelativePosition(boat);
            for(const buoy of buoyList) {
                if(buoy.radialDisplay !== null) {
                    for(const display of buoy.radialDisplay) {
                        display.remove();
                    }
                    buoy.radialDisplay = null;
                }
            }
        }
        selected = null;
        getBuoyOrderings(boat, buoyList);
    }
});

document.addEventListener('mousemove', ev => {
    if(selected !== null) {
        const mouseVector = new Vector(ev.pageX, ev.pageY);
        selected.updatePosition(mouseVector.subtract(offset), selected == boat ? boatRadius : buoyRadius);
        if(selected !== boat) {
            if(window.innerWidth - selected.position.x < 50) {
                selected.element.classList.add("removing");
            } else if(selected.element.classList.contains("removing")) {
                selected.element.classList.remove("removing");
            }
            for(const buoy of buoyList) {
                if(buoy == selected) continue;
                const sameColor = (buoy.isRed == selected.isRed);
                const maxRadius = (sameColor ? sameColorMaxDist : diffColorMaxDist)*pixelsPerFoot;
                if(buoy.position.subtract(selected.position).magnitude() <= maxRadius) {
                    if(buoy.radialDisplay == null) {
                        buoy.radialDisplay = makeFullRadialDisplay(buoy.position, sameColor);
                    }
                } else {
                    if(buoy.radialDisplay !== null) {
                        for(const display of buoy.radialDisplay) {
                            display.remove();
                        }
                        buoy.radialDisplay = null;
                    }
                }
            }
        }
    }
});

document.addEventListener('keydown', ev => {
    if(ev.key == 'q') {
        turnDirection = 1;
    } else if(ev.key == 'e') {
        turnDirection = -1;
    } else if(ev.key == ' ') {
        stepping = true;
    }
});

document.addEventListener('keyup', ev => {
    if(ev.key == 'q' && turnDirection == 1) {
        turnDirection = 0;
    } else if(ev.key == 'e' && turnDirection == -1) {
        turnDirection = 0;
    } else if(ev.key == ' ') {
        stepping = false;
        stepTimestamp = null;
    }
});

addEventListener('resize', makeGrid);

setInterval(() => {
    if(stepping) {
        const currentTime = Date.now()/1000;
        if(stepTimestamp != null) {
            step(getValue(boatSpeed), boat, buoyList, currentTime - stepTimestamp);
        }
        stepTimestamp = currentTime;
    }
}, stepUpdateRate*1000);

generateButton.onclick = ev => {
    if(ev.target !== generateButton) return;
    clearBuoys(buoyList);
    generatePath(buoyList, boat);
}

clearButton.onclick = () => {
    clearBuoys(buoyList);
    getBuoyOrderings(boat, buoyList);
};