import Vector from "./Vector.js";
import { gridInterval, pixelsPerFoot, sameColorMaxDist, sameColorMinDist, sameColorMidpointDist, diffColorMaxDist, diffColorMinDist, diffColorMidpointDist, RED, GREEN } from "./constants.js";
const radialDisplays = document.getElementById("radial-displays");
const radialOutlines = document.getElementById("radial-outlines");
const grid = document.getElementById("grid");

export const getValue = input => Number(input.value);

export const addWeight = (parent, name, defaultValue, isBoolean, withNewline = true) => {
    if(withNewline) {
        const newline = document.createElement('br');
        parent.appendChild(newline);
    }
    const label = document.createElement("label");
    label.htmlFor = name;
    label.innerText = name;
    label.classList.add("weight");
    const input = document.createElement("input");
    input.type = isBoolean ? "checkbox" : "number";
    input.name = name;
    if(isBoolean) {
        input.checked = defaultValue;
    } else {
        input.value = defaultValue;
    }
    input.classList.add("weight");
    parent.appendChild(label);
    parent.appendChild(input);
    return input;
}

const getOrderingItemX = (buoyList, ordering, index, isRed, _) => {
    return index < 0 ? (diffColorMidpointDist*pixelsPerFoot/2 * (isRed ? 1 : -1)) : buoyList[ordering[index]].relative.x;
}

const getOrderingItemY = (buoyList, ordering, index, _, stepback) => {
    return index < 0 ? (1 - stepback) : buoyList[ordering[index]].relative.y;
}

export const getReference = (buoyList, ordering, isRed, stepback = 1) => {
    return new Vector(
        getOrderingItemX(buoyList, ordering, ordering.length - stepback, isRed, stepback),
        getOrderingItemY(buoyList, ordering, ordering.length - stepback, isRed, stepback)
    );
}

export const drawLine = (p1, p2, holder, line_class = "line") => {
    holder.innerHTML += `<svg><line class=${line_class} x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}"/></svg>`
}

export const makeBuoyElement = color => {
    const newElement = document.createElement('div');
    newElement.classList.add('draggable');
    newElement.classList.add(color == RED ? 'red' : (color == GREEN ? 'green' : 'black'));
    return newElement;
}

const makeRadialDisplayIndividual = (position, radius, classname, outline = true) => {
    const newEl = document.createElement("div");
    newEl.classList.add(outline ? "radial-outline" : "radial-display");
    newEl.classList.add(classname);
    newEl.style.top = `${position.y - radius}px`;
    newEl.style.left = `${position.x - radius}px`;
    newEl.style.width = `${radius * 2}px`;
    newEl.style.height = `${radius * 2}px`;
    (outline ? radialOutlines : radialDisplays).appendChild(newEl);
    return newEl;
}

export const makeFullRadialDisplay = (position, sameColor) => {
    return [
        makeRadialDisplayIndividual(position, (sameColor ? sameColorMaxDist : diffColorMaxDist)*pixelsPerFoot, sameColor ? "same" : "diff", false),
        makeRadialDisplayIndividual(position, (sameColor ? sameColorMaxDist : diffColorMaxDist)*pixelsPerFoot, "outer"),
        makeRadialDisplayIndividual(position, (sameColor ? sameColorMidpointDist : diffColorMidpointDist)*pixelsPerFoot, "center"),
        makeRadialDisplayIndividual(position, (sameColor ? sameColorMinDist : diffColorMinDist)*pixelsPerFoot, "inner")
    ]
}

export const makeGrid = () => {
    grid.innerHTML = "";
    for(let i = 0; i < window.innerWidth; i += gridInterval * pixelsPerFoot) {
        drawLine(new Vector(i, 0), new Vector(i, window.innerHeight), grid, "gridline");
    }
    for(let i = 0; i < window.innerHeight; i += gridInterval * pixelsPerFoot) {
        drawLine(new Vector(0, i), new Vector(window.innerWidth, i), grid, "gridline");
    }
}

export const updateBoatOrientation = (boat, orientation) => {
    boat.orientation = orientation;
    boat.element.style.rotate = `${-orientation - Math.PI}rad`;
}

export const clearBuoys = buoyList => {
    for(const buoy of buoyList) {
        buoy.element.remove();
    }
    buoyList.length = 0; // clear array
}