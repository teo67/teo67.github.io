import getBuoyOrderings from "./getBuoyOrderings.js";
import { pixelsPerFoot, buoyRadius, sameColorMaxDist, sameColorMinDist, sameColorMidpointDist, diffColorMaxDist, diffColorMinDist, diffColorMidpointDist } from "./constants.js";
import { getValue, makeBuoyElement } from "./util.js";
import Vector from "./Vector.js";
import Buoy from "./Buoy.js";
const generateAngularDeviation = document.getElementById("path-angular-deviation");
const generateLinearDeviation = document.getElementById("path-linear-deviation");
const buoys = document.getElementById("buoys");

const generatePath = (buoyList, boat) => {
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
        const newBuoy = new Buoy(isRed, newElement, new Vector(currentX, currentY), buoyRadius, boat);
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

    getBuoyOrderings(boat, buoyList);
}

export default generatePath;