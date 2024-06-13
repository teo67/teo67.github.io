const transformXToLine = (x, pos1, pos2) => {
    const slope = (pos2.y - pos1.y)/(pos2.x - pos1.x);
    return slope * (x - pos1.x) + pos1.y;
}

const transformYToLine = (y, pos1, pos2) => {
    const slope = (pos2.x - pos1.x)/(pos2.y - pos1.y);
    return slope * (y - pos1.y) + pos1.x;
}

const checkObstacles = (buoyList, redPrev, greenPrev, redNext, greenNext, obstacles) => {
    // returns list in increasing order of dist
    const obst = [];
    const midpointPrev = buoyList[redPrev].relative.add(buoyList[greenPrev].relative);
    const midpointNext = buoyList[redNext].relative.add(buoyList[greenNext].relative);
    const L = midpointNext.subtract(midpointPrev);
    for(const obstacle of obstacles) {
        const m = buoyList[obstacle].relative.subtract(midpointPrev).projectionOnto(L);
        if(m)
    }
    return obst;
}

export default checkObstacles;