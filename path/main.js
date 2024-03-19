let selected = null;
let offsetX = 0;
let offsetY = 0;

const boatElement = document.getElementById("boat");
const buoys = document.getElementById("buoys");
const redSupply = document.getElementById("red-supply");
const greenSupply = document.getElementById("green-supply");
const linesHolder = document.getElementById("lines");
const weights = document.getElementById("weights");
const grid = document.getElementById("grid");
const radialDisplays = document.getElementById("radial-displays");
const radialOutlines = document.getElementById("radial-outlines");
const generateButton = document.getElementById("generate");
const generateAngularDeviation = document.getElementById("path-angular-deviation");
const generateLinearDeviation = document.getElementById("path-linear-deviation");
const clearButton = document.getElementById("clear");
let boatX = 0;
let boatY = 0;
const boatRadius = 75/2;
const buoyRadius = 25/2;
let boatOrientation = 0; // 0 = pointed down, positive counterclockwise
// x = left, y = forward

class Buoy {
    constructor(isRed, element, x, y, radius) {
        this.isRed = isRed;
        this.element = element;
        updatePosition(this, x, y, radius);
        updateRelativePosition(this);
        this.radialDisplay = null;
    }
}

const makeBuoyElement = isRed => {
    const newElement = document.createElement('div');
    newElement.classList.add('draggable');
    newElement.classList.add(isRed ? 'red' : 'green');
    return newElement;
}

const updatePosition = (obj, x, y, radius) => {
    obj.x = x;
    obj.y = y;
    obj.element.style.left = `${x - radius}px`;
    obj.element.style.top = `${y - radius}px`;
}

const updateRelativePosition = obj => {
    obj.relativeX = (obj.x - boat.x) * Math.cos(boatOrientation) - (obj.y - boat.y) * Math.sin(boatOrientation);
    obj.relativeY = (obj.y - boat.y) * Math.cos(boatOrientation) + (obj.x - boat.x) * Math.sin(boatOrientation);
}

const updateBoatOrientation = orientation => {
    boatOrientation = orientation;
    boat.element.style.rotate = `${-orientation - Math.PI}rad`;
}

const boat = {
    x: 100,
    y: 100,
    element: boatElement
};

let buoyList = [];

let nextRedBuoy = null;
let nextGreenBuoy = null;
const turnSpeed = 2; //rad/sec
let turnDirection = 0; //0, 1, -1
const turnUpdateInterval = 0.01; //seconds
let registeredTurnInterval = null;

updatePosition(boat, boat.x, boat.y, boatRadius);
updateBoatOrientation(0);

document.addEventListener('mousedown', ev => {
    if(!tryClick(ev, boat, boatRadius)) {
        if(tryClick(ev, nextGreenBuoy, buoyRadius)) return;
        if(tryClick(ev, nextRedBuoy, buoyRadius)) return;
        for(const buoy of buoyList) {
            if(tryClick(ev, buoy, buoyRadius)) return;
        }
    } else {
        registeredTurnInterval = setInterval(() => {
            updateBoatOrientation(boatOrientation + turnUpdateInterval * turnSpeed * turnDirection);
        }, turnUpdateInterval*1000);
    }
});

const tryClick = (ev, target, radius) => {
    if(ev.pageX >= target.x - radius && ev.pageX <= target.x + radius && ev.pageY >= target.y - radius && ev.pageY <= target.y + radius) {
        selected = target;
        offsetX = ev.pageX - target.x;
        offsetY = ev.pageY - target.y;
        return true;
    }
    return false;
}

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
                updateRelativePosition(buoy);
            }
            clearInterval(registeredTurnInterval);
        } else {
            if(window.innerWidth - selected.x < 50) {
                selected.element.remove();
                buoyList.splice(buoyList.indexOf(selected), 1);
            }
            updateRelativePosition(selected);
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
        getBuoyOrderings();
    }
});

const regenSupply = isRed => {
    const newElement = makeBuoyElement(isRed);
    (isRed ? redSupply : greenSupply).appendChild(newElement);
    const newBuoy = new Buoy(isRed, newElement, isRed ? 2 * buoyRadius : 35 + 2 * buoyRadius, 2 * buoyRadius, buoyRadius);
    if(isRed) {
        nextRedBuoy = newBuoy;
    } else {
        nextGreenBuoy = newBuoy;
    }
}

let stepping = false;

const makeRadialDisplayIndividual = (x, y, radius, classname, outline = true) => {
    const newEl = document.createElement("div");
    newEl.classList.add(outline ? "radial-outline" : "radial-display");
    newEl.classList.add(classname);
    newEl.style.top = `${y - radius}px`;
    newEl.style.left = `${x - radius}px`;
    newEl.style.width = `${radius * 2}px`;
    newEl.style.height = `${radius * 2}px`;
    (outline ? radialOutlines : radialDisplays).appendChild(newEl);
    return newEl;
}

const makeFullRadialDisplay = (x, y, sameColor) => {
    return [
        makeRadialDisplayIndividual(x, y, (sameColor ? sameColorMaxDist : diffColorMaxDist)*pixelsPerFoot, sameColor ? "same" : "diff", false),
        makeRadialDisplayIndividual(x, y, (sameColor ? sameColorMaxDist : diffColorMaxDist)*pixelsPerFoot, "outer"),
        makeRadialDisplayIndividual(x, y, (sameColor ? sameColorMidpointDist : diffColorMidpointDist)*pixelsPerFoot, "center"),
        makeRadialDisplayIndividual(x, y, (sameColor ? sameColorMinDist : diffColorMinDist)*pixelsPerFoot, "inner")
    ]
}

document.addEventListener('mousemove', ev => {
    if(selected !== null) {
        updatePosition(selected, ev.pageX - offsetX, ev.pageY - offsetY, selected == boat ? boatRadius : buoyRadius);
        if(selected !== boat) {
            if(window.innerWidth - selected.x < 50) {
                selected.element.classList.add("removing");
            } else if(selected.element.classList.contains("removing")) {
                selected.element.classList.remove("removing");
            }
            for(const buoy of buoyList) {
                if(buoy == selected) continue;
                const sameColor = (buoy.isRed == selected.isRed);
                const maxRadius = (sameColor ? sameColorMaxDist : diffColorMaxDist)*pixelsPerFoot;
                if(magnitude(buoy.x - selected.x, buoy.y - selected.y) <= maxRadius) {
                    if(buoy.radialDisplay == null) {
                        console.log("making display");
                        buoy.radialDisplay = makeFullRadialDisplay(buoy.x, buoy.y, sameColor);
                    }
                } else {
                    if(buoy.radialDisplay !== null) {
                        console.log("removing display");
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
    }
});

regenSupply(true);
regenSupply(false);

const getBuoyOrderings = () => {
    const redOrdering = [];
    const greenOrdering = [];
    // we want green on the left
    const allRedBuoys = new Set();
    const allGreenBuoys = new Set();
    for(let i = 0; i < buoyList.length; i++) {
        if(buoyList[i].relativeY < 0) {
            buoyList[i].element.classList.add("hidden");
            continue;
        }
        if(buoyList[i].element.classList.contains("hidden")) {
            buoyList[i].element.classList.remove("hidden");
        }
        if(buoyList[i].isRed) {
            allRedBuoys.add(i);
        } else {
            allGreenBuoys.add(i);
        }
    }
    let result = chooseNext(allGreenBuoys, allRedBuoys, greenOrdering, redOrdering);
    while(result !== null) {
        allGreenBuoys.delete(result.green);
        greenOrdering.push(result.green);
        allRedBuoys.delete(result.red);
        redOrdering.push(result.red);
        result = chooseNext(allGreenBuoys, allRedBuoys, greenOrdering, redOrdering);
    }

    linesHolder.innerHTML = "";

    for(const ordering of [greenOrdering, redOrdering]) {
        for(let i = 0; i < ordering.length - 1; i++) {
            drawLine(buoyList[ordering[i]].x, buoyList[ordering[i]].y, buoyList[ordering[i + 1]].x, buoyList[ordering[i + 1]].y);
        }
    }

    for(let i = 0; i < greenOrdering.length; i++) {
        drawLine(buoyList[greenOrdering[i]].x, buoyList[greenOrdering[i]].y, buoyList[redOrdering[i]].x, buoyList[redOrdering[i]].y, 'cross');
    }

    const waypoints = [];
    for(let i = 0; i < greenOrdering.length; i++) {
        waypoints.push({x: buoyList[greenOrdering[i]].x/2 + buoyList[redOrdering[i]].x/2,
                        y: buoyList[greenOrdering[i]].y/2 + buoyList[redOrdering[i]].y/2});
    }

    if(waypoints.length > 0) {
        drawLine(boat.x, boat.y, waypoints[0].x, waypoints[0].y, "waypoint");
        for(let i = 0; i < waypoints.length - 1; i++) {
            drawLine(waypoints[i].x, waypoints[i].y, waypoints[i + 1].x, waypoints[i + 1].y, "waypoint");
        }
    }

    return waypoints;
}

const magnitude = (x, y) => {
    return (x**2 + y**2)**0.5;
}

const addWeight = (name, defaultValue) => {
    const label = document.createElement("label");
    label.htmlFor = name;
    label.innerText = name;
    label.classList.add("weight");
    const input = document.createElement("input");
    input.type = "number";
    input.name = name;
    input.value = defaultValue;
    input.classList.add("weight");
    input.addEventListener('keydown', () => getBuoyOrderings());
    input.addEventListener('paste', () => getBuoyOrderings());
    input.addEventListener('input', () => getBuoyOrderings());
    weights.appendChild(label);
    weights.appendChild(input);
    return input;
}

const pixelsPerFoot = 10;
const sameColorMinDist = 10;
const sameColorMaxDist = 20;
const diffColorMinDist = 6;
const diffColorMaxDist = 10;

const sameColorMidpointDist = (sameColorMaxDist + sameColorMinDist)/2;
const diffColorMidpointDist = (diffColorMaxDist + diffColorMinDist)/2;

const gridInterval = 5; //feet

const distanceWeight = addWeight('same-color-dist', 1/5);
const distanceMaxDeviation = addWeight('MAX', (sameColorMaxDist - sameColorMinDist) * 1.5);
const angleWeight = addWeight('inline-angle', 3/Math.PI);
const angleMaxDeviation = addWeight('MAX', Math.PI/2.5);
const diffColorDistanceWeight = addWeight('diff-color-dist', 1/5);
const diffColorDistanceMaxDeviation = addWeight('MAX', (diffColorMaxDist - diffColorMinDist) * 1.5);
const crossAngleWeight = addWeight('cross-section-angle', 3/Math.PI);
const crossAngleMaxDeviation = addWeight('MAX', Math.PI/2.5);
const boatSpeed = addWeight("boat-speed", 10);

const angleBetween = (x1, y1, x2, y2) => {
    return Math.acos((x1 * x2 + y1 * y2) / (magnitude(x1, y1) * magnitude(x2, y2)));
}

const getReference = ordering => {
    return {
        x: ordering.length == 0 ? 0 : buoyList[ordering[ordering.length - 1]].relativeX,
        y: ordering.length == 0 ? 0 : buoyList[ordering[ordering.length - 1]].relativeY
    };
}

const getSameColorVector = ordering => {
    return {
        x: ordering.length < 2 ? 0 : buoyList[ordering[ordering.length - 1]].relativeX - buoyList[ordering[ordering.length - 2]].relativeX,
        y: ordering.length < 2 ? 0 : buoyList[ordering[ordering.length - 1]].relativeY - buoyList[ordering[ordering.length - 2]].relativeY
    };
}

const getWeight = (ordering, index, reference, scv) => {
    const xDiff = buoyList[index].relativeX - reference.x;
    const yDiff = buoyList[index].relativeY - reference.y;
    const distanceFeet = Math.abs(magnitude(xDiff, yDiff)/pixelsPerFoot - (ordering.length == 0 ? 0 : sameColorMidpointDist));
    if(ordering.length > 0 && distanceFeet > distanceMaxDeviation.value) {
        return null;
    }
    let dist = distanceFeet * distanceWeight.value;
    if(ordering.length > 1) {
        const angle = angleBetween(xDiff, yDiff, scv.x, scv.y);
        if(angle > angleMaxDeviation.value) {
            return null;
        }
        dist += angle * angleWeight.value;
    }
    return dist;
}

const chooseNext = (greenSet, redSet, greenOrdering, redOrdering) => {
    console.log(`choosing next: ${greenOrdering.length} chosen so far`);
    let lowestDist = null;
    let lowestIndexGreen = -1;
    let lowestIndexRed = -1;
    const greenRef = getReference(greenOrdering);
    const redRef = getReference(redOrdering);
    const greenSCV = getSameColorVector(greenOrdering);
    const redSCV = getSameColorVector(redOrdering);
    for(const greenIndex of greenSet) {
        const greenWeight = getWeight(greenOrdering, greenIndex, greenRef, greenSCV);
        if(greenWeight == null) {
            continue;
        }
        for(const redIndex of redSet) {
            const redWeight = getWeight(redOrdering, redIndex, redRef, redSCV);
            if(redWeight == null) {
                continue;
            }
            const distFeet = Math.abs(magnitude(buoyList[redIndex].relativeX - buoyList[greenIndex].relativeX, buoyList[redIndex].relativeY - buoyList[greenIndex].relativeY)/pixelsPerFoot - diffColorMidpointDist);
            if(distFeet > diffColorDistanceMaxDeviation.value) {
                continue;
            }
            const diffColorDist = distFeet * diffColorDistanceWeight.value;
            let crossAngle = 0;
            if(greenOrdering.length > 0 && redOrdering.length > 0) {
                crossAngle = angleBetween(redRef.x - greenRef.x, redRef.y - greenRef.y, buoyList[redIndex].relativeX - buoyList[greenIndex].relativeX, buoyList[redIndex].relativeY - buoyList[greenIndex].relativeY) * crossAngleWeight.value;
                if(crossAngle > crossAngleMaxDeviation.value) {
                    continue;
                }
            }
            const dist = greenWeight + redWeight + diffColorDist + crossAngle;
            console.log(`found weight = ${dist} for green=${greenIndex}, red=${redIndex}`);
            console.log({green: greenWeight, red: redWeight, diff: diffColorDist, cross: crossAngle});
            if(lowestDist == null || dist < lowestDist) {
                lowestDist = dist;  
                lowestIndexGreen = greenIndex;
                lowestIndexRed = redIndex;
            }
        }
    }
    return lowestDist == null ? null : {
        green: lowestIndexGreen, 
        red: lowestIndexRed
    };
}

const drawLine = (x1, y1, x2, y2, line_class = "line", holder = linesHolder) => {
    holder.innerHTML += `<svg><line class=${line_class} x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/></svg>`
}

const makeGrid = () => {
    grid.innerHTML = "";
    for(let i = 0; i < window.innerWidth; i += gridInterval * pixelsPerFoot) {
        drawLine(i, 0, i, window.innerHeight, "gridline", grid);
    }
    for(let i = 0; i < window.innerHeight; i += gridInterval * pixelsPerFoot) {
        drawLine(0, i, window.innerWidth, i, "gridline", grid);
    }
}

makeGrid();
addEventListener('resize', makeGrid);

const stepUpdateRate = .01;// seconds

const step = () => {
    if(!stepping) {
        return;
    }
    const pixelStep = boatSpeed.value * pixelsPerFoot * stepUpdateRate;
    const waypoints = getBuoyOrderings();
    if(waypoints.length == 0) {
        return;
    }
    const targetPosition = waypoints[0];
    let targetAngle = boatOrientation;
    if(waypoints.length > 1) {
        targetAngle = -Math.atan2(waypoints[1].y - waypoints[0].y, waypoints[1].x - waypoints[0].x) + Math.PI/2;
    }
    const positionDiff = magnitude(boat.x - targetPosition.x, boat.y - targetPosition.y);
    const fractionMoved = pixelStep / positionDiff;
    let angleDiff = (targetAngle - boatOrientation) % (2 * Math.PI);
    if(angleDiff > Math.PI) {
        angleDiff -= 2 * Math.PI;
    }
    updateBoatOrientation(boatOrientation + fractionMoved * angleDiff);
    updatePosition(boat, boat.x + fractionMoved * (targetPosition.x - boat.x), boat.y + fractionMoved * (targetPosition.y - boat.y), boatRadius);
    for(const buoy of buoyList) {
        updateRelativePosition(buoy);
    }
}

const generatePath = () => {
    const minX = 5*pixelsPerFoot;
    const minY = 5*pixelsPerFoot;
    const maxX = window.innerWidth - 5 * pixelsPerFoot;
    const maxY = window.innerHeight - 5 * pixelsPerFoot;

    let currentX = minX + 10*pixelsPerFoot;
    let currentY = window.innerHeight/2;
    let isRed = false;
    let isFirst = false;

    while(currentX >= minX && currentX <= maxX && currentY >= minY && currentY <= maxY) {
        const newElement = makeBuoyElement(isRed);
        const newBuoy = new Buoy(isRed, newElement, currentX, currentY, buoyRadius);
        buoys.appendChild(newElement);
        buoyList.push(newBuoy);

        const randAngle = (Math.random() - 0.5) * 2 * generateAngularDeviation.value;
        if(isFirst) {
            const randDist = sameColorMidpointDist + (Math.random() - 0.5) * (sameColorMaxDist - sameColorMinDist) * generateLinearDeviation.value;
            isFirst = false;
            currentX += randDist*pixelsPerFoot*Math.cos(randAngle);
            currentY -= randDist*pixelsPerFoot*Math.sin(randAngle);
        } else {
            const randDist = diffColorMidpointDist + (Math.random() - 0.5) * (diffColorMaxDist - diffColorMinDist) * generateLinearDeviation.value;
            
            currentX += randDist*pixelsPerFoot*Math.sin(randAngle);
            currentY += randDist*pixelsPerFoot*Math.cos(randAngle) * (isRed ? -1 : 1);

            isRed = !isRed;
            isFirst = true;
        }
    }

    getBuoyOrderings();
}

const clearBuoys = () => {
    for(const buoy of buoyList) {
        buoy.element.remove();
    }
    buoyList = [];
    getBuoyOrderings();
}

setInterval(step, stepUpdateRate*1000);

generatePath();
generateButton.onclick = () => {
    clearBuoys();
    generatePath();
}

clearButton.onclick = clearBuoys;