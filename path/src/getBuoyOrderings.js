const linesHolder = document.getElementById("lines");
import { drawLine } from "./util.js";
import chooseNext from "./chooseNext.js";
import { GREEN, RED } from "./constants.js";
import checkObstacles from "./checkObstacles.js";

const getBuoyOrderings = (boat, buoyList) => {
    const redOrdering = [];
    const greenOrdering = [];
    // we want green on the left
    const allRedBuoys = new Set();
    const allGreenBuoys = new Set();
    const allBlackBuoys = new Set();
    for(let i = 0; i < buoyList.length; i++) {
        if(buoyList[i].relative.y < 0) {
            buoyList[i].element.classList.add("hidden");
            continue;
        }
        if(buoyList[i].element.classList.contains("hidden")) {
            buoyList[i].element.classList.remove("hidden");
        }
        if(buoyList[i].color == RED) {
            allRedBuoys.add(i); 
        } else if(buoyList[i].color == GREEN) {
            allGreenBuoys.add(i);
        } else {
            allBlackBuoys.add(i);
        }
    }
    let result = chooseNext(buoyList, allGreenBuoys, allRedBuoys, greenOrdering, redOrdering);
    while(result !== null) {
        allGreenBuoys.delete(result.green);
        greenOrdering.push(result.green);
        allRedBuoys.delete(result.red);
        redOrdering.push(result.red);
        result = chooseNext(buoyList, allGreenBuoys, allRedBuoys, greenOrdering, redOrdering);
    }

    linesHolder.innerHTML = "";

    const finalGreen = [];
    const finalRed = [];
    for(let i = 0; i < greenOrdering.length; i++) {
        if(i > 0) {
            const obst = checkObstacles(buoyList, redOrdering[i - 1], greenOrdering[i - 1], redOrdering[i], greenOrdering[i], allBlackBuoys);
            for(const obstacle of obst) {
                const targets = [redOrdering[i - 1], redOrdering[i], greenOrdering[i - 1], greenOrdering[i]];
                let minDist = null;
                let minIndex = -1;
                for(let i = 0; i < targets.length; i++) {
                    const dist = buoyList[targets[i]].relative.subtract(buoyList[obstacle].relative).magnitude()
                    if(minDist == null || dist < minDist) {
                        minDist = dist;
                        minIndex = i;
                    }
                }
                const side = Math.floor(((minIndex + 2)%targets.length)/2);
                console.log(side);
                const obstacleSide = (side == 0) ? finalGreen : finalRed;
                const buoySide = (side == 0) ? finalRed : finalGreen;

                obstacleSide.push(obstacle);
                buoySide.push(targets[side * 2]);
                obstacleSide.push(obstacle);
                buoySide.push(targets[side * 2 + 1]);
            }
        }
        finalGreen.push(greenOrdering[i]);
        finalRed.push(redOrdering[i]);
    }

    for(const ordering of [finalGreen, finalRed]) {
        for(let i = 0; i < ordering.length - 1; i++) {
            drawLine(buoyList[ordering[i]].position, buoyList[ordering[i + 1]].position, linesHolder);
        }
    }

    for(let i = 0; i < finalGreen.length; i++) {
        drawLine(buoyList[finalGreen[i]].position, buoyList[finalRed[i]].position, linesHolder, 'cross');
    }

    const waypoints = [];
    for(let i = 0; i < finalGreen.length; i++) {
        waypoints.push(buoyList[finalGreen[i]].position.combination(buoyList[finalRed[i]].position, 0.5, 0.5));
    }

    if(waypoints.length > 0) {
        drawLine(boat.position, waypoints[0], linesHolder, "waypoint");
        for(let i = 0; i < waypoints.length - 1; i++) {
            drawLine(waypoints[i], waypoints[i + 1], linesHolder, "waypoint");
        }
    }

    return waypoints;
}

export default getBuoyOrderings;