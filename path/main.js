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
        console.log('going again');
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
const distanceMaxDeviation = addWeight('MAX', (sameColorMaxDist - sameColorMinDist)/2 * 1.5);

const angleWeight = addWeight('inline-angle', 6/Math.PI);//3/Math.PI;
const angleMaxDeviation = addWeight('MAX', 1.1);//0.9;
const nextAngleWeight = addWeight('next-angle', 6/Math.PI);
const nextAngleMaxDeviation = addWeight('MAX', 1.1);

const diffColorDistanceWeight = addWeight('diff-color-dist', 1/5);
const diffColorDistanceMaxDeviation = addWeight('MAX', (diffColorMaxDist - diffColorMinDist)/2 * 1.5);
const crossAngleWeight = addWeight('cross-section-angle', 6/Math.PI);
const crossAngleMaxDeviation = addWeight('MAX', 1.0);

const intersectionWeight = addWeight('intersection', 0);
const intersectionMax = addWeight('MAX', 99999);

const intersectionRatioWeight = addWeight('intersection-ratio', 0);
const intersectionRatioMax = addWeight('MAX', 99999);

const boatSpeed = addWeight("boat-speed", 10);



const angleBetween = (x1, y1, x2, y2) => {
    return Math.acos((x1 * x2 + y1 * y2) / (magnitude(x1, y1) * magnitude(x2, y2)));
}

const getOrderingItemX = (ordering, index, isRed) => {
    return index < 0 ? (diffColorMidpointDist*pixelsPerFoot/2 * (isRed ? 1 : -1)) : buoyList[ordering[index]].relativeX;
}

const getOrderingItemY = (ordering, index, _) => {
    return index < 0 ? 0 : buoyList[ordering[index]].relativeY;
}

const getReference = (ordering, isRed) => {
    return {
        x: getOrderingItemX(ordering, ordering.length - 1, isRed),
        y: getOrderingItemY(ordering, ordering.length - 1, isRed)
    };
}

const getNormal = (redIndex, greenIndex) => {
    return {
        x: buoyList[greenIndex].relativeY - buoyList[redIndex].relativeY,
        y: buoyList[redIndex].relativeX - buoyList[greenIndex].relativeX
    }; 
}

const getSameColorVector = (greenOrdering, redOrdering) => {
    return greenOrdering.length < 1 ? {
        x: 0, y: 1
    } : getNormal(redOrdering[redOrdering.length - 1], greenOrdering[greenOrdering.length - 1]);
}

const getValue = input => {
    return Number(input.value); // i hate you javascript
}

const getWeight = (ordering, index, reference) => {
    const xDiff = buoyList[index].relativeX - reference.x;
    const yDiff = buoyList[index].relativeY - reference.y;
    const distanceFeet = Math.abs(magnitude(xDiff, yDiff)/pixelsPerFoot - (ordering.length == 0 ? 0 : sameColorMidpointDist));
    console.log(magnitude(xDiff, yDiff)/pixelsPerFoot);
    console.log(distanceFeet);
    if(distanceFeet > (ordering.length == 0 ? sameColorMidpointDist : 0) + getValue(distanceMaxDeviation)) {
        return null;
    }
    console.log('distance for index ' + index + ' = ' + distanceFeet);
    return distanceFeet * getValue(distanceWeight);
}

const getLinesIntersection = (x11, y11, x12, y12, x21, y21, x22, y22) => {
    // assumes lines are not parallel
    const a = ((x22-x21)*(y11-y21)-(x11-x21)*(y22-y21))/((x12-x11)*(y22-y21)-(x22-x21)*(y12-y11));
    return a;
}

const chooseNext = (greenSet, redSet, greenOrdering, redOrdering) => {
    console.log(`choosing next: ${greenOrdering.length} chosen so far`);
    let lowestDist = null;
    let lowestIndexGreen = -1;
    let lowestIndexRed = -1;
    const greenRef = getReference(greenOrdering, false);
    const redRef = getReference(redOrdering, true);
    const midpointRef = {
        x: greenRef.x/2 + redRef.x/2,
        y: greenRef.y/2 + redRef.y/2
    };
    const scv = getSameColorVector(greenOrdering, redOrdering);
    const cachedRedWeights = {};
    for(const greenIndex of greenSet) {
        const greenWeight = getWeight(greenOrdering, greenIndex, greenRef);
        if(greenWeight == null) {
            console.log('green weight too high for green ' + greenIndex);
            continue;
        }
        for(const redIndex of redSet) {
            if(cachedRedWeights[redIndex] === undefined) {
                cachedRedWeights[redIndex] = getWeight(redOrdering, redIndex, redRef);
            }
            if(cachedRedWeights[redIndex] == null) {
                console.log('red weight too high for red ' + redIndex);
                continue;
            }
            const distFeet = Math.abs(magnitude(buoyList[redIndex].relativeX - buoyList[greenIndex].relativeX, buoyList[redIndex].relativeY - buoyList[greenIndex].relativeY)/pixelsPerFoot - diffColorMidpointDist);
            if(distFeet > getValue(diffColorDistanceMaxDeviation)) {
                console.log('diff dist too high for green ' + greenIndex + ' red ' + redIndex + ' ' + distFeet);
                continue;
            }
            const diffColorDist = distFeet * getValue(diffColorDistanceWeight);
            const crossAngle = angleBetween(redRef.x - greenRef.x, redRef.y - greenRef.y, buoyList[redIndex].relativeX - buoyList[greenIndex].relativeX, buoyList[redIndex].relativeY - buoyList[greenIndex].relativeY);
            
            console.log('cross = ' + crossAngle);
            if(crossAngle > getValue(crossAngleMaxDeviation)) {
                console.log([redRef.x  - greenRef.x, redRef.y - greenRef.y]);
                console.log([buoyList[redIndex].relativeX - buoyList[greenIndex].relativeX, buoyList[redIndex].relativeY - buoyList[greenIndex].relativeY]);
                console.log('cross angle too high for green ' + greenIndex + ' red ' + redIndex + ' ' + crossAngle);
                continue;
            }
            
            const crossAngleContribution = crossAngle * getValue(crossAngleWeight);
            const xDiff = (buoyList[redIndex].relativeX + buoyList[greenIndex].relativeX - greenRef.x - redRef.x)/2;
            const yDiff = (buoyList[redIndex].relativeY + buoyList[greenIndex].relativeY - greenRef.y - redRef.y)/2;

            let willConsiderAngle = true;
            if(greenOrdering.length == 0) {
                const betweenBuoysDiffX = buoyList[redIndex].relativeX - buoyList[greenIndex].relativeX;
                const betweenBuoysDiffY = buoyList[redIndex].relativeY - buoyList[greenIndex].relativeY;
                
                const projection = (xDiff * betweenBuoysDiffX + yDiff * betweenBuoysDiffY)/(magnitude(betweenBuoysDiffX, betweenBuoysDiffY)**2);
                console.log('projection = ' + projection);
                if(Math.abs(projection) < 0.5) {
                    willConsiderAngle = false;
                }
            }
            let angleContribution = 0;

            // if(willConsiderAngle) {
                const angle = angleBetween(xDiff, yDiff, scv.x, scv.y);

                console.log('angle = ' + angle + ' for red ' + redIndex + ', green ' + greenIndex);
            const nextNormal = getNormal(redIndex, greenIndex);
            const nextAngle = angleBetween(xDiff, yDiff, nextNormal.x, nextNormal.y);
            console.log('next angle = ' + nextAngle);
            if(willConsiderAngle) {
                if(angle > getValue(angleMaxDeviation)) {
                    console.log('angle too high');
                    continue;
                }
                if(nextAngle > getValue(nextAngleMaxDeviation)) {
                    console.log('next angle too high');
                    continue;
                }
                angleContribution = angle * getValue(angleWeight) + nextAngle * getValue(nextAngleWeight);
            }

            const intersectionAmtCross = getLinesIntersection(buoyList[greenIndex].relativeX, buoyList[greenIndex].relativeY, buoyList[redIndex].relativeX, buoyList[redIndex].relativeY, midpointRef.x, midpointRef.y, midpointRef.x + scv.x, midpointRef.y + scv.y);
            const intersectionAmtTrajectory = getLinesIntersection(midpointRef.x, midpointRef.y, midpointRef.x + scv.x, midpointRef.y + scv.y, buoyList[greenIndex].relativeX, buoyList[greenIndex].relativeY, buoyList[redIndex].relativeX, buoyList[redIndex].relativeY);
            console.log('intersection amounts');
            console.log(intersectionAmtCross, intersectionAmtTrajectory);
            
            const normalizedCrossIntersection = Math.abs(intersectionAmtCross-0.5) * 2; // distance from target midpoint, 1 = buoy to midpoint dist
            console.log('normalized: ' + normalizedCrossIntersection);
            if(normalizedCrossIntersection > getValue(intersectionMax)) {
                console.log('intersection too high');
                continue;
            }

            const intersectionContribution = normalizedCrossIntersection * getValue(intersectionWeight);

            const dist = greenWeight + cachedRedWeights[redIndex] + diffColorDist + crossAngleContribution + angleContribution + intersectionContribution;
            console.log(`found weight = ${dist} for green=${greenIndex}, red=${redIndex}`);
            console.log({green: greenWeight, red: cachedRedWeights[redIndex], diff: diffColorDist, cross: crossAngle, angle: angleContribution, intersection: intersectionContribution});
            if(lowestDist == null || dist < lowestDist) {
                console.log("helloooo");
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
    const pixelStep = getValue(boatSpeed) * pixelsPerFoot * stepUpdateRate;
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

        const randAngle = (Math.random() - 0.5) * 2 * getValue(generateAngularDeviation);
        if(isFirst) {
            const randDist = sameColorMidpointDist + (Math.random() - 0.5) * (sameColorMaxDist - sameColorMinDist) * getValue(generateLinearDeviation);
            isFirst = false;
            currentX += randDist*pixelsPerFoot*Math.cos(randAngle);
            currentY -= randDist*pixelsPerFoot*Math.sin(randAngle);
        } else {
            const randDist = diffColorMidpointDist + (Math.random() - 0.5) * (diffColorMaxDist - diffColorMinDist) * getValue(generateLinearDeviation);
            
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