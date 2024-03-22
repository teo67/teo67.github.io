import Vector from "./Vector.js";
import { pixelsPerFoot, sameColorMaxDist, sameColorMinDist, sameColorMidpointDist, diffColorMaxDist, diffColorMinDist, diffColorMidpointDist } from "./constants.js";
import Weight from "./Weight.js";

const getNormal = (buoyList, redIndex, greenIndex) => {
    return new Vector(
        buoyList[greenIndex].relative.y - buoyList[redIndex].relative.y,
        buoyList[redIndex].relative.x - buoyList[greenIndex].relative.x
    ); 
}

class SameColorDistanceWeight extends Weight {
    requiresBothColors() {return false;}
    runCalculations({buoyList, reference, ordering, index}, _ /* cache */) {
        const diff = buoyList[index].relative.subtract(reference);
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

const updateMulticolorCache0 = (cache, buoyList, redIndex, greenIndex) => {
    if(cache[betweenBuoysDiffName] === undefined) {
        cache[betweenBuoysDiffName] = buoyList[redIndex].relative.subtract(buoyList[greenIndex].relative);
    }
}

const updateMulticolorCache1 = (cache, buoyList, greenRef, redRef, greenOrdering, _, greenIndex, redIndex) => {
    if(cache[vectorToPointName] === undefined) {
        cache[vectorToPointName] = new Vector(
            (buoyList[redIndex].relative.x + buoyList[greenIndex].relative.x - greenRef.x - redRef.x)/2,
            (buoyList[redIndex].relative.y + buoyList[greenIndex].relative.y - greenRef.y - redRef.y)/2
        );
    }
    if(cache[considerAngleName] === undefined) {
        cache[considerAngleName] = true;
        if(greenOrdering.length == 0) {
            updateMulticolorCache0(cache, buoyList, redIndex, greenIndex);
            const projection = cache[vectorToPointName].projectionOnto(cache[betweenBuoysDiffName]);
            if(Math.abs(projection/cache[betweenBuoysDiffName].magnitude()) < 0.5) {
                cache[considerAngleName] = false;
            }
        }
    }
}

const updateMulticolorCache2 = (cache, buoyList, greenOrdering, redOrdering) => {
    if(cache[previousNormalName] === undefined) {
        cache[previousNormalName] = (greenOrdering.length < 1) ? new Vector(0, 1) : getNormal(buoyList, redOrdering[redOrdering.length - 1], greenOrdering[greenOrdering.length - 1]);
    }
}

class IncomingAngleWeight extends Weight {
    requiresBothColors() {return true;}
    runCalculations({buoyList, greenRef, redRef, greenOrdering, redOrdering, greenIndex, redIndex}, cache) {
        updateMulticolorCache1(cache, buoyList, greenRef, redRef, greenOrdering, redOrdering, greenIndex, redIndex);
        if(!cache[considerAngleName]) {
            return 0;
        }
        updateMulticolorCache2(cache, buoyList, greenOrdering, redOrdering);
        return cache[previousNormalName].angleWith(cache[vectorToPointName]);
    }
}

class OutgoingAngleWeight extends Weight {
    requiresBothColors() {return true;}
    runCalculations({buoyList, greenRef, redRef, greenOrdering, redOrdering, greenIndex, redIndex}, cache) {
        updateMulticolorCache1(cache, buoyList, greenRef, redRef, greenOrdering, redOrdering, greenIndex, redIndex);
        if(!cache[considerAngleName]) {
            return 0;
        }
        return getNormal(buoyList, redIndex, greenIndex).angleWith(cache[vectorToPointName]);
    }
}

class CrossAngleWeight extends Weight {
    requiresBothColors() {return true;}
    runCalculations({buoyList, greenRef, redRef, greenIndex, redIndex}, cache) {
        updateMulticolorCache0(cache, buoyList, redIndex, greenIndex);
        const referenceBuoyToBuoy = redRef.subtract(greenRef);
        return referenceBuoyToBuoy.angleWith(cache[betweenBuoysDiffName]);
    }
}

class DiffColorDistanceWeight extends Weight {
    requiresBothColors() {return true;}
    runCalculations({buoyList, greenIndex, redIndex}, cache) {
        updateMulticolorCache0(cache, buoyList, redIndex, greenIndex);
        return Math.abs(cache[betweenBuoysDiffName].magnitude()/pixelsPerFoot - diffColorMidpointDist);
    }
}

const getLinesIntersection = (x11, y11, x12, y12, x21, y21, x22, y22) => {
    // assumes lines are not parallel
    return ((x22-x21)*(y11-y21)-(x11-x21)*(y22-y21))/((x12-x11)*(y22-y21)-(x22-x21)*(y12-y11));
}

class IntersectionWeight extends Weight {
    requiresBothColors() {return true;}
    runCalculations({buoyList, greenRef, redRef, greenIndex, redIndex}, cache) {
        updateMulticolorCache2(cache, buoyList, greenOrdering, redOrdering);
        const midpointRef = greenRef.combination(redRef, 0.5, 0.5);
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
pushWeight(    new IncomingAngleWeight('incoming angle', 6/Math.PI, 1.1, true));
pushWeight(    new OutgoingAngleWeight('outgoing angle', 6/Math.PI, 1.1, true));
pushWeight(    new CrossAngleWeight('cross angle', 6/Math.PI, 1.0, true));
pushWeight(    new DiffColorDistanceWeight('diff color dist', 1/5, (diffColorMaxDist - diffColorMinDist)/2 * 1.5, true));
pushWeight(    new IntersectionWeight('intersection', 0.5, 3, false));

export default weights;