// preprocess
import weights from "./weights.js";

const singleColorWeights = [];
const multicolorWeights = [];
for(const weightName in weights) {
    if(weights[weightName].requiresBothColors()) {
        multicolorWeights.push(weights[weightName]);
    } else {
        singleColorWeights.push(weights[weightName]);
    }
}

const getTotalWeight = (inputData, singleColor) => {
    const cache = {};
    let total = 0;
    for(const weight of (singleColor ? singleColorWeights : multicolorWeights)) {
        if(!weight.isEnabled()) {
            continue;
        }
        const rawVal = weight.runCalculations(inputData, cache);
        if(weight.isOverMax(rawVal)) {
            return null;
        }
        total += weight.getWeighted(rawVal);
    }
    return total;
}

export default getTotalWeight;