let selected = null;
let offsetX = 0;
let offsetY = 0;

const boatElement = document.getElementById("boat");
const buoys = document.getElementById("buoys");
const redSupply = document.getElementById("red-supply");
const greenSupply = document.getElementById("green-supply");
const linesHolder = document.getElementById("lines");
const weights = document.getElementById("weights");
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
    }
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

const buoyList = [];

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
        }
        selected = null;
        getBuoyOrderings();
    }
});

const regenSupply = isRed => {
    const newElement = document.createElement('div');
    newElement.classList.add('draggable');
    newElement.classList.add(isRed ? 'red' : 'green');
    (isRed ? redSupply : greenSupply).appendChild(newElement);
    const newBuoy = new Buoy(isRed, newElement, isRed ? 2 * buoyRadius : 35 + 2 * buoyRadius, 2 * buoyRadius, buoyRadius);
    if(isRed) {
        nextRedBuoy = newBuoy;
    } else {
        nextGreenBuoy = newBuoy;
    }
}

let stepping = false;

document.addEventListener('mousemove', ev => {
    if(selected !== null) {
        updatePosition(selected, ev.pageX - offsetX, ev.pageY - offsetY, selected == boat ? boatRadius : buoyRadius);
        if(selected !== boat) {
            if(window.innerWidth - selected.x < 50) {
                selected.element.classList.add("removing");
            } else if(selected.element.classList.contains("removing")) {
                selected.element.classList.remove("removing");
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
    while(allRedBuoys.size > 0 || allGreenBuoys.size > 0) {
        if(allGreenBuoys.size > 0) {
            const index = chooseNext(allGreenBuoys, greenOrdering);
            allGreenBuoys.delete(index);
            greenOrdering.push(index);
        }   
        if(allRedBuoys.size > 0) {
            const index = chooseNext(allRedBuoys, redOrdering);
            allRedBuoys.delete(index);
            redOrdering.push(index);
        }
    }

    linesHolder.innerHTML = "";

    for(const ordering of [greenOrdering, redOrdering]) {
        for(let i = 0; i < ordering.length - 1; i++) {
            drawLine(buoyList[ordering[i]].x, buoyList[ordering[i]].y, buoyList[ordering[i + 1]].x, buoyList[ordering[i + 1]].y);
        }
    }

    const waypoints = [];
    for(let i = 0; i < Math.min(greenOrdering.length, redOrdering.length); i++) {
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

const distanceWeight = addWeight('same-color-dist', 1);
const angleWeight = addWeight('inline-angle', 200/Math.PI);

const angleBetween = (x1, y1, x2, y2) => {
    return Math.acos((x1 * x2 + y1 * y2) / (magnitude(x1, y1) * magnitude(x2, y2)));
}

const chooseNext = (set, ordering) => {
    let lowestDist = null;
    let lowestIndex = -1;
    const referenceX = ordering.length == 0 ? 0 : buoyList[ordering[ordering.length - 1]].relativeX;
    const referenceY = ordering.length == 0 ? 0 : buoyList[ordering[ordering.length - 1]].relativeY;
    let previousVectorX = 0;
    let previousVectorY = 0;
    if(ordering.length > 1) {
        previousVectorX = buoyList[ordering[ordering.length - 1]].relativeX - buoyList[ordering[ordering.length - 2]].relativeX;
        previousVectorY = buoyList[ordering[ordering.length - 1]].relativeY - buoyList[ordering[ordering.length - 2]].relativeY;
    }
    for(const index of set) {
        const xDiff = buoyList[index].relativeX - referenceX;
        const yDiff = buoyList[index].relativeY - referenceY;
        let dist = magnitude(xDiff, yDiff) * distanceWeight.value;
        if(ordering.length > 1) {
            const angle = angleBetween(xDiff, yDiff, previousVectorX, previousVectorY);
            dist += angle * angleWeight.value;
        }
        if(lowestDist == null || dist < lowestDist) {
            lowestDist = dist;  
            lowestIndex = index;
        }
    }
    return lowestIndex;
}

const drawLine = (x1, y1, x2, y2, line_class = "line") => {
    linesHolder.innerHTML += `<svg><line class=${line_class} x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/></svg>`
}

const speed = 100; // pixels/sec
const stepUpdateRate = .01;// seconds

const step = () => {
    if(!stepping) {
        return;
    }
    const pixelStep = speed * stepUpdateRate;
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

setInterval(step, stepUpdateRate*1000);