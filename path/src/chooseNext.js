import getTotalWeight from "./getTotalWeight.js";
import weights from "./weights.js";

const log = (logsEnabled, msg) => {
    if(logsEnabled) {
        console.log(msg);
    }
}

const chooseNext = (buoyList, greenSet, redSet, greenOrdering, redOrdering) => {
    let lowestDist = null;
    let lowestIndexGreen = -1;
    let lowestIndexRed = -1;
    let logsEnabled = false;
    for(const weightName in weights) {
        if(weights[weightName].isLoggingEnabled()) {
            logsEnabled = true;
            break;
        }
    }
    const cachedRedWeights = {};
    const greenMonocolorData = {
        buoyList: buoyList,
        ordering: greenOrdering,
        isRed: false
    };
    const redMonocolorData = {
        buoyList: buoyList,
        ordering: redOrdering,
        isRed: true
    };
    const inputDataMulticolor = {
        buoyList : buoyList,
        greenOrdering : greenOrdering,
        redOrdering : redOrdering
    };

    log(logsEnabled, `choosing next: ${greenOrdering.length} chosen so far`);
    for(const greenIndex of greenSet) {
        log(logsEnabled, `now considering green = ${greenIndex}`);
        inputDataMulticolor.greenIndex = greenIndex;
        greenMonocolorData.index = greenIndex;
        const greenWeight = getTotalWeight(greenMonocolorData, true);
        if(greenWeight == null) {
            log(logsEnabled, 'green weight too high for green ' + greenIndex);
            continue;
        }
        for(const redIndex of redSet) {
            log(logsEnabled, `now considering red = ${redIndex}`);
            inputDataMulticolor.redIndex = redIndex;
            redMonocolorData.index = redIndex;
            if(cachedRedWeights[redIndex] === undefined) {
                cachedRedWeights[redIndex] = getTotalWeight(redMonocolorData, true);
            }
            if(cachedRedWeights[redIndex] == null) {
                log(logsEnabled, 'red weight too high for red ' + redIndex);
                continue;
            }
            
            const multicolorWeight = getTotalWeight(inputDataMulticolor, false);
            if(multicolorWeight == null) {
                log(logsEnabled, 'multicolor weight too high for green ' + greenIndex + ', red ' + redIndex);
                continue;
            }

            const totalWeight = greenWeight + cachedRedWeights[redIndex] + multicolorWeight;
            log(logsEnabled, `found total weight = ${totalWeight}`);
            if(lowestDist == null || totalWeight < lowestDist) {
                log(logsEnabled, 'new record!');
                lowestDist = totalWeight;  
                lowestIndexGreen = greenIndex;
                lowestIndexRed = redIndex;
            }
        }
    }
    const chosen = lowestDist == null ? null : {
        green: lowestIndexGreen, 
        red: lowestIndexRed
    };
    log(logsEnabled, 'chose: ');
    log(logsEnabled, chosen);
    return chosen;
}

export default chooseNext;