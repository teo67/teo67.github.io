export const pixelsPerFoot = 10;

export const sameColorMinDist = 10;
export const sameColorMaxDist = 20;
export const diffColorMinDist = 6;
export const diffColorMaxDist = 10;

export const sameColorMidpointDist = (sameColorMaxDist + sameColorMinDist)/2;
export const diffColorMidpointDist = (diffColorMaxDist + diffColorMinDist)/2;

export const gridInterval = 5; //feet

export const boatWidth = 33/12 * pixelsPerFoot; //px
export const boatLength = 48/12 * pixelsPerFoot; //px

// actual buoy radius = 20.3 * .0328084 / 2 * pixelsPerFoot; since diameter = 20.3cm
// this would be annoyingly small so we enlarge them significantly
export const buoyRadius = 25/2

export const turnSpeed = 2; //rad/sec
export const turnUpdateInterval = 0.01; //seconds

export const stepUpdateRate = .01;// seconds

export const RED = 0;
export const GREEN = 1;
export const BLACK = 2;