const linesHolder = document.getElementById("lines");
import { drawLine } from "./util.js";
import chooseNext from "./chooseNext.js";

const getBuoyOrderings = (boat, buoyList) => {
    const redOrdering = [];
    const greenOrdering = [];
    // we want green on the left
    const allRedBuoys = new Set();
    const allGreenBuoys = new Set();
    for(let i = 0; i < buoyList.length; i++) {
        if(buoyList[i].relative.y < 0) {
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
    let result = chooseNext(buoyList, allGreenBuoys, allRedBuoys, greenOrdering, redOrdering);
    while(result !== null) {
        allGreenBuoys.delete(result.green);
        greenOrdering.push(result.green);
        allRedBuoys.delete(result.red);
        redOrdering.push(result.red);
        result = chooseNext(buoyList, allGreenBuoys, allRedBuoys, greenOrdering, redOrdering);
    }

    linesHolder.innerHTML = "";

    for(const ordering of [greenOrdering, redOrdering]) {
        for(let i = 0; i < ordering.length - 1; i++) {
            drawLine(buoyList[ordering[i]].position, buoyList[ordering[i + 1]].position, linesHolder);
        }
    }

    for(let i = 0; i < greenOrdering.length; i++) {
        drawLine(buoyList[greenOrdering[i]].position, buoyList[redOrdering[i]].position, linesHolder, 'cross');
    }

    const waypoints = [];
    for(let i = 0; i < greenOrdering.length; i++) {
        waypoints.push(buoyList[greenOrdering[i]].position.combination(buoyList[redOrdering[i]].position, 0.5, 0.5));
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