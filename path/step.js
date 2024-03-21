import { pixelsPerFoot, boatRadius } from "./constants.js";
import { updateBoatOrientation } from "./util.js";
import getBuoyOrderings from "./getBuoyOrderings.js";

const step = (speed, boat, buoyList, dt) => {
    const pixelStep = speed * pixelsPerFoot * dt;
    const waypoints = getBuoyOrderings(boat, buoyList);
    if(waypoints.length == 0) {
        return;
    }
    const targetPosition = waypoints[0];
    let targetAngle = boat.orientation;
    if(waypoints.length > 1) {
        targetAngle = -Math.atan2(waypoints[1].y - waypoints[0].y, waypoints[1].x - waypoints[0].x) + Math.PI/2;
    }
    const targetPositionDiff = targetPosition.subtract(boat.position);
    const fractionMoved = pixelStep / targetPositionDiff.magnitude();
    let angleDiff = (targetAngle - boat.orientation) % (2 * Math.PI);
    if(angleDiff > Math.PI) {
        angleDiff -= 2 * Math.PI;
    }
    updateBoatOrientation(boat, boat.orientation + fractionMoved * angleDiff);

    boat.updatePosition(boat.position.combination(targetPositionDiff, 1, fractionMoved), boatRadius);
    for(const buoy of buoyList) {
        buoy.updateRelativePosition(boat, boat.orientation);
    }
}

export default step;