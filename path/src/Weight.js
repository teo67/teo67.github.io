const weightsElement = document.getElementById("weights");
import { getValue, addWeight } from "./util.js";

class Weight {
    constructor(name, defaultValue, defaultMaximum, defaultIsEnabled) {
        this.name = name;
        this.infoElement = null;
        const weightHolder = document.createElement("div");
        weightHolder.classList.add('weight-holder');
        weightsElement.appendChild(weightHolder);

        const infoHover = document.createElement("div");
        infoHover.classList.add('info-hover');
        weightHolder.appendChild(infoHover);
        infoHover.innerText = 'i'; // todo: get image?
        infoHover.addEventListener('mouseenter', () => this.showInfo());
        infoHover.addEventListener('mouseleave', () => this.hideInfo());

        const title = document.createElement('h2');
        title.classList.add('weight-name');
        title.innerText = name;
        weightHolder.appendChild(title);
        this.enabledCheckbox = addWeight(weightHolder, 'enabled', defaultIsEnabled, true);
        this.weightInput = addWeight(weightHolder, 'weight', defaultValue, false);
        this.maxValueInput = addWeight(weightHolder, 'max value', defaultMaximum, false);
        this.debugMode = addWeight(weightHolder, 'debug', false, true);
    }
    getInfostring() {
        return "No information available.";
    }
    log(msg) {
        if(this.debugMode.checked) {
            console.log(msg);
        }
    }
    configureCallbacks(callback) {
        this.weightInput.addEventListener('keydown', callback);
        this.weightInput.addEventListener('paste', callback);
        this.weightInput.addEventListener('input', callback);

        this.maxValueInput.addEventListener('keydown', callback);
        this.maxValueInput.addEventListener('paste', callback);
        this.maxValueInput.addEventListener('input', callback);

        this.enabledCheckbox.addEventListener('input', () => {
            this.enabledCheckbox.blur();
            callback();
        });
        
        this.debugMode.addEventListener('input', () => this.debugMode.blur());
    }
    requiresBothColors() {return false;}
    runCalculations(_, __ /* inputData, cache */) {return 0;}
    isOverMax(rawValue) {
        const maxVal = getValue(this.maxValueInput);
        if(rawValue > maxVal) {
            this.log(`${this.name} is over max: ${rawValue} > ${maxVal}`);
            return true;
        }
        return false;
    }
    getWeighted(rawValue) {
        const weighted = rawValue * getValue(this.weightInput);
        this.log(`${this.name} converted raw ${rawValue} to weighted ${weighted}`);
        return weighted;
    }
    isEnabled() {
        return this.enabledCheckbox.checked;
    }
    enable(enabled = true) {
        this.enabledCheckbox.checked = enabled;
    }
    isLoggingEnabled() {
        return this.debugMode.checked;
    }
    enableLogging(enabled = true) {
        this.debugMode.checked = enabled;
    }
    getWeight() {
        return getValue(this.weightInput);
    }
    setWeight(value) {
        this.weightInput.value = value;
    }
    getMaxValue() {
        return getValue(this.maxValueInput);
    }
    setMaxValue(value) {
        this.maxValueInput.value = value;
    }
    showInfo() {
        if(this.infoElement != null) return;
        this.infoElement = document.createElement("div");
        this.infoElement.classList.add("info");
        this.infoElement.innerText = this.getInfostring();
        weightsElement.appendChild(this.infoElement);
    }
    hideInfo() {
        if(this.infoElement == null) return;
        this.infoElement.remove();
        this.infoElement = null;
    }
}

export default Weight;