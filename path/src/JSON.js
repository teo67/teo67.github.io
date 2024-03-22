import Buoy from "./Buoy.js";
import weights from "./weights.js";
import { clearBuoys, makeBuoyElement, updateBoatOrientation } from "./util.js";
import Vector from "./Vector.js";
import { boatWidth, buoyRadius } from "./constants.js";
import getBuoyOrderings from "./getBuoyOrderings.js";

const buoys = document.getElementById("buoys");

export const exportJSON = (boat, buoyList, fileName) => {
    const packedWeights = {};
    for(const weightName in weights) {
        packedWeights[weightName] = {
            enabled: weights[weightName].isEnabled(),
            weight: weights[weightName].getWeight(),
            max: weights[weightName].getMaxValue(),
            debug: weights[weightName].isLoggingEnabled()
        };
    }
    const packedBuoys = [];
    for(const buoy of buoyList) {
        packedBuoys.push({
            x: buoy.position.x,
            y: buoy.position.y,
            isRed: buoy.isRed
        });
    }
    const jsObj = {
        weights: packedWeights,
        boat: {
            x: boat.position.x,
            y: boat.position.y,
            orientation: boat.orientation
        },
        buoys: packedBuoys
    };
    const JSONObj = JSON.stringify(jsObj, null, 2);

    const fileToSave = new Blob([JSONObj], {
        type: 'application/json'
    });

    const a = document.createElement("a");
    document.body.appendChild(a);
    a.style = "display: none";

    const url = window.URL.createObjectURL(fileToSave);
    a.href = url;
    a.download = fileName + ".json";
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
}

export const importJSON = async (boat, buoyList, files) => {
    if(files.length < 1) {
        return;
    }
    const file = files[0];
    const fileReader = new FileReader();
    
    const prom = new Promise(res => {
        fileReader.addEventListener('load', res);
    });

    fileReader.readAsText(file);

    await prom;
    const textResult = fileReader.result;
    const jsResult = JSON.parse(textResult);
    clearBuoys(buoyList);

    boat.updatePosition(new Vector(jsResult.boat.x, jsResult.boat.y), boatWidth/2, boatWidth/2);
    updateBoatOrientation(boat, jsResult.boat.orientation);

    for(const buoy of jsResult.buoys) {
        const newElement = makeBuoyElement(buoy.isRed);
        buoys.appendChild(newElement);

        const newBuoy = new Buoy(buoy.isRed, newElement, new Vector(buoy.x, buoy.y), buoyRadius, boat);
        buoyList.push(newBuoy);
    }

    for(const weightName in jsResult.weights) {
        if(weightName in weights) {
            const selectedWeight = weights[weightName];
            const selectedWeightLoaded = jsResult.weights[weightName];
            selectedWeight.enable(selectedWeightLoaded.enabled);
            selectedWeight.setWeight(selectedWeightLoaded.weight);
            selectedWeight.setMaxValue(selectedWeightLoaded.max);
            selectedWeight.enableLogging(selectedWeightLoaded.debug);
        }
    }

    getBuoyOrderings(boat, buoyList);
}