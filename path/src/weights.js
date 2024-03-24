import Vector from "./Vector.js";
import { pixelsPerFoot, sameColorMaxDist, sameColorMinDist, sameColorMidpointDist, diffColorMaxDist, diffColorMinDist, diffColorMidpointDist, buoyRadius } from "./constants.js";
import Weight from "./Weight.js";
import { getReference } from "./util.js";

const getNormal = (buoyList, redIndex, greenIndex) => {
    return new Vector(
        buoyList[greenIndex].relative.y - buoyList[redIndex].relative.y,
        buoyList[redIndex].relative.x - buoyList[greenIndex].relative.x
    ); 
}

class SameColorDistanceWeight extends Weight {
    getInfostring() {
        return "Measures the distance between the suggested buoy and the previous buoy of the same color and compares it against what is expected. If there is no previous buoy, the reference will be an imaginary buoy perpendicular to the boat and the weight will optimize for shortest distance.";
    }
    requiresBothColors() {return false;}
    runCalculations({buoyList, ordering, index, isRed}, cache) {
        updateCacheReference(cache, monocolorReferenceName, isRed, buoyList, ordering);
        const diff = buoyList[index].relative.subtract(cache[monocolorReferenceName]);
        let distanceFeet = Math.abs(diff.magnitude()/pixelsPerFoot - (ordering.length == 0 ? 0 : sameColorMidpointDist));
        if(ordering.length == 0) {
            distanceFeet = distanceFeet - sameColorMidpointDist;
        }
        return distanceFeet;
    }
}

const vectorToPointName = 'vector-to-point';
const considerAngleName = 'consider-angle';
const betweenBuoysDiffName = 'between-buoys';
const previousNormalName = 'previous-normal';
const redReferenceName = 'red-reference';
const greenReferenceName = 'green-reference';
const monocolorReferenceName = 'reference';

const updateCacheReference = (cache, refName, isRed, buoyList, ordering) => {
    if(cache[refName] === undefined) {
        cache[refName] = getReference(buoyList, ordering, isRed);
    }
}

const updateBetweenBuoysDiff = (cache, buoyList, redIndex, greenIndex) => {
    if(cache[betweenBuoysDiffName] === undefined) {
        cache[betweenBuoysDiffName] = buoyList[redIndex].relative.subtract(buoyList[greenIndex].relative);
    }
}

const updateVectorToPoint = (cache, buoyList, greenOrdering, redOrdering, greenIndex, redIndex) => {
    if(cache[vectorToPointName] === undefined) {
        updateCacheReference(cache, greenReferenceName, false, buoyList, greenOrdering);
        updateCacheReference(cache, redReferenceName, true, buoyList, redOrdering);
        const greenRef = cache[greenReferenceName];
        const redRef = cache[redReferenceName];
        cache[vectorToPointName] = new Vector(
            (buoyList[redIndex].relative.x + buoyList[greenIndex].relative.x - greenRef.x - redRef.x)/2,
            (buoyList[redIndex].relative.y + buoyList[greenIndex].relative.y - greenRef.y - redRef.y)/2
        );
    }
}
const updateConsiderAngle = (cache, buoyList, greenOrdering, redOrdering, greenIndex, redIndex) => {
    if(cache[considerAngleName] === undefined) {
        cache[considerAngleName] = true;
        if(greenOrdering.length == 0) {
            updateBetweenBuoysDiff(cache, buoyList, redIndex, greenIndex);
            updateVectorToPoint(cache, buoyList, greenOrdering, redOrdering, greenIndex, redIndex)
            const projection = cache[vectorToPointName].projectionOnto(cache[betweenBuoysDiffName]);
            if(Math.abs(projection/cache[betweenBuoysDiffName].magnitude()) < 0.5) {
                cache[considerAngleName] = false;
            }
        }
    }
}

const updatePreviousNormal = (cache, buoyList, greenOrdering, redOrdering) => {
    if(cache[previousNormalName] === undefined) {
        cache[previousNormalName] = (greenOrdering.length < 1) ? new Vector(0, 1) : getNormal(buoyList, redOrdering[redOrdering.length - 1], greenOrdering[greenOrdering.length - 1]);
    }
}

class TurnAngleWeight extends Weight {
    getInfostring() {
        return "Measures the angle that would be made between the previous pathline of the boat and the new pathline if this pair of buoys were to be chosen. If there is no previous pair of buoys, the previous path will be assumed to be in the angle of the boat.";
    }
    requiresBothColors() {return true;}
    runCalculations({buoyList, greenOrdering, redOrdering, greenIndex, redIndex}, cache) {
        updateCacheReference(cache, redReferenceName, true, buoyList, redOrdering);
        updateCacheReference(cache, greenReferenceName, false, buoyList, greenOrdering);
        updateVectorToPoint(cache, buoyList, greenOrdering, redOrdering, greenIndex, redIndex);
        const greenRef = cache[greenReferenceName];
        const redRef = cache[redReferenceName];
        const greenSecondaryRef = getReference(buoyList, greenOrdering, false, 2);
        const redSecondaryRef = getReference(buoyList, redOrdering, true, 2);
        const previousVector = new Vector(
            (greenRef.x + redRef.x - greenSecondaryRef.x - redSecondaryRef.x)/2,
            (greenRef.y + redRef.y - greenSecondaryRef.y - redSecondaryRef.y)/2
        );
        return previousVector.angleWith(cache[vectorToPointName]);
    }
}

class IncomingAngleWeight extends Weight {
    getInfostring() {
        return "Measures the angle that would be made between the normal of the previous pair of points and the vector from the previous midpoint to the midpoint of the buoys being chosen. If this weight is applied before any buoys are chosen and the boat is sufficiently close to the first two buoys, the weight is ignored.";
    }
    requiresBothColors() {return true;}
    runCalculations({buoyList, greenOrdering, redOrdering, greenIndex, redIndex}, cache) {
        updateConsiderAngle(cache, buoyList, greenOrdering, redOrdering, greenIndex, redIndex);
        if(!cache[considerAngleName]) {
            return 0;
        }
        updateVectorToPoint(cache, buoyList, greenOrdering, redOrdering, greenIndex, redIndex);
        updatePreviousNormal(cache, buoyList, greenOrdering, redOrdering);
        return cache[previousNormalName].angleWith(cache[vectorToPointName]);
    }
}

class OutgoingAngleWeight extends Weight {
    getInfostring() {
        return "Measures the angle between the normal made by the buoys being chosen and the vector from the previous midpoint to the midpoint of the buoys being chosen. If this weight is applied before any buoys are chosen and the boat is sufficiently close to the first two buoys, the weight is ignored.";
    }
    requiresBothColors() {return true;}
    runCalculations({buoyList, greenOrdering, redOrdering, greenIndex, redIndex}, cache) {
        updateConsiderAngle(cache, buoyList, greenOrdering, redOrdering, greenIndex, redIndex);
        if(!cache[considerAngleName]) {
            return 0;
        }
        updateVectorToPoint(cache, buoyList, greenOrdering, redOrdering, greenIndex, redIndex);
        return getNormal(buoyList, redIndex, greenIndex).angleWith(cache[vectorToPointName]);
    }
}

class CrossAngleWeight extends Weight {
    getInfostring() {
        return "Measures the angle made between the green-to-red vector of the previously selected pair of buoys and the green-to-red vector that would be made by the buoys being selected. If no buoys have been previously selected, the previous angle is assumed to be orthogonal to the angle of the boat.";
    }
    requiresBothColors() {return true;}
    runCalculations({buoyList, greenIndex, redIndex, redOrdering, greenOrdering}, cache) {
        updateBetweenBuoysDiff(cache, buoyList, redIndex, greenIndex);
        updateCacheReference(cache, redReferenceName, true, buoyList, redOrdering);
        updateCacheReference(cache, greenReferenceName, false, buoyList, greenOrdering);
        const redRef = cache[redReferenceName];
        const greenRef = cache[greenReferenceName];
        const referenceBuoyToBuoy = redRef.subtract(greenRef);
        return referenceBuoyToBuoy.angleWith(cache[betweenBuoysDiffName]);
    }
}

class DiffColorDistanceWeight extends Weight {
    getInfostring() {
        return "Measures the distance between the two buoys (red and green) being added and compares it against what is expected.";
    }
    requiresBothColors() {return true;}
    runCalculations({buoyList, greenIndex, redIndex}, cache) {
        updateBetweenBuoysDiff(cache, buoyList, redIndex, greenIndex);
        return Math.abs(cache[betweenBuoysDiffName].magnitude()/pixelsPerFoot - diffColorMidpointDist);
    }
}

const getLinesIntersection = (x11, y11, x12, y12, x21, y21, x22, y22) => {
    // assumes lines are not parallel
    return ((x22-x21)*(y11-y21)-(x11-x21)*(y22-y21))/((x12-x11)*(y22-y21)-(x22-x21)*(y12-y11));
}

class IntersectionWeight extends Weight {
    getInfostring() {
        return "Extends the normal vector of the previous two buoys past its midpoint until it intersects the line made by the difference vector of the buoys being added, and measures how close the intersection point is to the midpoint of the buoys being added.";
    }
    requiresBothColors() {return true;}
    runCalculations({buoyList, greenIndex, redIndex, greenOrdering, redOrdering}, cache) {
        updatePreviousNormal(cache, buoyList, greenOrdering, redOrdering);
        updateCacheReference(cache, redReferenceName, true, buoyList, redOrdering);
        updateCacheReference(cache, greenReferenceName, false, buoyList, greenOrdering);
        const midpointRef = cache[greenReferenceName].combination(cache[redReferenceName], 0.5, 0.5);
        const midpointPlusNormal = midpointRef.add(cache[previousNormalName]);
        const intersectionAmtCross = getLinesIntersection(buoyList[greenIndex].relative.x, buoyList[greenIndex].relative.y, buoyList[redIndex].relative.x, buoyList[redIndex].relative.y, midpointRef.x, midpointRef.y, midpointPlusNormal.x, midpointPlusNormal.y);
        return Math.abs(intersectionAmtCross-0.5) * 2; // distance from target midpoint, 1 = buoy to midpoint dist   
    }
}

const weights = {};

const pushWeight = weight => {
    weights[weight.name] = weight;
}

pushWeight(    new SameColorDistanceWeight('same color dist', 1/5, (sameColorMaxDist - sameColorMinDist)/2 * 1.5, true));
pushWeight(    new DiffColorDistanceWeight('diff color dist', 1/5, (diffColorMaxDist - diffColorMinDist)/2 * 1.5, true));
pushWeight(    new TurnAngleWeight('turn angle', 6/Math.PI, 1.5, true));
pushWeight(    new CrossAngleWeight('cross angle', 6/Math.PI, 1.0, true));

pushWeight(    new IncomingAngleWeight('incoming angle', 0, 1.1, false));
pushWeight(    new OutgoingAngleWeight('outgoing angle', 0, 0.85, true));
pushWeight(    new IntersectionWeight('intersection', 0.5, 3, false));


export default weights;