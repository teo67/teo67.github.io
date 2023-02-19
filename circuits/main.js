const circuit = document.getElementById("components");
const addingMenu = document.getElementById("adding-bar");
const addSplitter = document.getElementById("addSPLITTER");
const addResistor = document.getElementById("addRESISTOR");
const addLED = document.getElementById("addLED");
const addSwitch = document.getElementById("addSWITCH");
const resetter = document.getElementById("reset");

const displayMenu = document.getElementById("display");
const displayVoltage = document.getElementById("displayVOLTAGE");
const displayCurrent = document.getElementById("displayCURRENT");
const displayResistance = document.getElementById("displayRESISTANCE");

const INFINITY = -1; // placeholder for open switches etc.
const WIDTH = 90;
const HEIGHT = 100;
const XOFFSET = 5;
const YOFFSET = 0;
const LINE_HEIGHT = 0.001;

resetter.onclick = () => {
    while(circuit.firstElementChild) {
        circuit.removeChild(circuit.firstElementChild);
    }
    topLevel = new Series();
    topLevel.resetElement(0, 0, 1, 1);
    recalculate();
}

const getX = x => {
    return `${x * WIDTH + XOFFSET}vw`;
}

const getY = y => {
    return `${y * HEIGHT + YOFFSET}vh`;
}

const getWidth = x => {
    return `${x * WIDTH}vw`;
}

const getHeight = y => {
    return `${y * HEIGHT}vh`;
}

const generateElement = name => {
    const r = document.createElement("div");
    r.classList.add("component");
    r.classList.add(name);
    circuit.appendChild(r); 
    return r;
}

const resetElement = (element, x, y, w, h) => {
    element.style.left = getX(x);
    element.style.top = getY(y);
    element.style.width = getWidth(w);
    element.style.height = getHeight(h);
}

class CircuitComponent {
    constructor(name) {
        this.resistance = 0;
        this.voltage = 0;
        this.element = generateElement(name);
        this.element.onclick = () => {
            addingMenu.classList.add("hidden");
            displayMenu.classList.remove("hidden");
            displayResistance.innerText = `Resistance = ${this.resistance == INFINITY ? "∞" : this.resistance.toExponential(2)} Ω`;
            displayVoltage.innerText = `Voltage = ${this.voltage.toExponential(2)} V`;
            displayCurrent.innerText = `Current = ${this.resistance == INFINITY ? "0" : (this.resistance == 0 ? "∞" : (this.voltage / this.resistance).toExponential(2))} A`;
        }
    }
    getResistance() {
        return this.resistance;
    }
    supplyVolts(volts) {
        this.voltage = volts;
    }
    resetElement(x, y, w, h) {
        resetElement(this.element, x, y, w, h);
    }
}
class Switch extends CircuitComponent {
    constructor() {
        super("switch");
        this.closed = false;
        this.resistance = INFINITY;
        this.element.onclick = () => {
            this.closed = !this.closed;
            if(this.closed) {
                this.element.classList.add("closed");
            } else {
                this.element.classList.remove("closed");
            }
            recalculate();
        }
        this.seriesBlocker = generateElement("blocker");
    }
    getResistance() {
        this.resistance = this.closed ? 0 : INFINITY;
        return this.resistance; 
    }
    resetElement(x, y, w, h) {
        super.resetElement(x + w/4, y + h/2 - 0.005, w/2, 0.01);
        resetElement(this.seriesBlocker, x + w/4, y + h/2 - LINE_HEIGHT * 5, w/2, 10 * LINE_HEIGHT);
    }
}
class Series extends CircuitComponent {
    constructor() {
        super("series");
        this.items = [];
        this.adder = generateElement("adder");
    }
    addItem(item, x, y, w, h) {
        addingMenu.classList.add("hidden");
        this.items.push(item);
        
        this.resetElement(x, y, w, h);
        recalculate();
    }
    getResistance() {
        let total = 0;
        for(let i = 0; i < this.items.length; i++) {
            const adding = this.items[i].getResistance();
            if(adding == INFINITY) {
                total = INFINITY;
            } else if(total != INFINITY) {
                total += adding;
            }
        }
        this.resistance = total;
        return total;
    }
    supplyVolts(volts) {
        this.voltage = volts;
        for(let i = 0; i < this.items.length; i++) {
            if(this.items[i].resistance == INFINITY || this.resistance == INFINITY) {
                this.items[i].supplyVolts(0);
            } else if(this.resistance == 0) {
                this.items[i].supplyVolts(volts);
            } else {
                this.items[i].supplyVolts(volts * this.items[i].resistance / this.resistance);
            }
        }
    }
    resetElement(x, y, w, h) {
        super.resetElement(x, y + h/2 - LINE_HEIGHT / 2, w, LINE_HEIGHT);
        const lengthPer = w / (this.items.length + 1);
        for(let i = 0; i < this.items.length; i++) {
            this.items[i].resetElement(x + i * lengthPer, y, lengthPer, h);
        }
        const adderX = x + this.items.length * lengthPer;
        const adderWidth = Math.max(0.1 * lengthPer, 0.004);
        this.adder.style.left = getX(adderX + lengthPer/2 - adderWidth/2);
        this.adder.style.width = getWidth(adderWidth);
        this.adder.style.top = `calc(${getY(y + h/2)} - ${getWidth(adderWidth/2)})`; // janky af
        this.adder.style.height = getWidth(adderWidth);
        this.adder.style.borderWidth = getWidth(adderWidth / 20);
        this.adder.onclick = () => {
            displayMenu.classList.add("hidden");
            addingMenu.classList.remove("hidden");
            addSplitter.onclick = () => {
                this.addItem(new Parallel(), x, y, w, h);
            }
            addResistor.onclick = () => {
                this.addItem(new Resistor(5), x, y, w, h);
            }
            addLED.onclick = () => {
                this.addItem(new LED(5), x, y, w, h);
            }
            addSwitch.onclick = () => {
                this.addItem(new Switch(), x, y, w, h);
            }
        }
    }
}

class Parallel extends CircuitComponent {
    constructor() {
        super("parallel");
        this.a = new Series();
        this.b = new Series();
        this.otherSide = generateElement("parallel");
        this.seriesBlocker = generateElement("blocker");
    }
    getResistance() {
        const ra = this.a.getResistance();
        const rb = this.b.getResistance();
        let returning;
        if(ra == 0 || rb == 0) {
            returning = 0;
        } else if(ra == INFINITY) {
            if(rb == INFINITY) {
                returning = INFINITY;
            } else {
                returning = rb;
            }
        } else if(rb == INFINITY) {
            returning = ra;
        } else {
            returning = (ra * rb) / (ra + rb);
        }
        this.resistance = returning;
        return returning;
    }
    supplyVolts(volts) {
        this.voltage = volts;
        const ra = this.a.resistance;
        const rb = this.b.resistance;
        if(ra == 0 && rb != 0) {
            this.a.supplyVolts(volts);
            this.b.supplyVolts(0);
        } else if(rb == 0 && ra != 0) {
            this.a.supplyVolts(0);
            this.b.supplyVolts(volts);
        } else {
            this.a.supplyVolts(volts);
            this.b.supplyVolts(volts);
        }
    }
    resetElement(x, y, w, h) {
        super.resetElement(x + w/10, y + h/4, 0, h/2);
        this.element.style.width = getHeight(LINE_HEIGHT);
        resetElement(this.otherSide, 0, y + h/4, 0, h/2);
        this.otherSide.style.left = `calc(${getX(x + 0.9*w)} - ${getHeight(LINE_HEIGHT)})`;
        this.otherSide.style.width = getHeight(LINE_HEIGHT);
        resetElement(this.seriesBlocker, 0, y + h/2 - 5 * LINE_HEIGHT, 0, LINE_HEIGHT * 10);
        this.seriesBlocker.style.left = `calc(${getX(x + w/10)} + ${getHeight(LINE_HEIGHT)})`;
        this.seriesBlocker.style.width = `calc(${getWidth(0.8*w)} - ${getHeight(2 * LINE_HEIGHT)})`;
        this.a.resetElement(x + w/10, y, w*0.8, h/2);
        this.b.resetElement(x + w/10, y + h/2, w*0.8, h/2);
    }
}

class Resistor extends CircuitComponent {
    constructor(res) {
        super("resistor");
        this.resistance = res;
    }
    resetElement(x, y, w, h) {
        super.resetElement(x + w/4, y + h/2 - 0.01, w/2, 0.02);
        const height = Math.max(w/20, 0.005);
        this.element.style.height = getWidth(height);
        this.element.style.top = `calc(${getY(y + h/2)} - ${getWidth(height / 2)})`;
    }
}

class LED extends CircuitComponent {
    constructor(res) {
        super("LED");
        this.resistance = res;
        this.width = 0;
    }
    supplyVolts(volts) {
        super.supplyVolts(volts);
        if(this.voltage > 0) {
            this.element.classList.add("on");
            this.element.style.boxShadow = `0 0 ${getWidth(this.width/30)} ${getWidth(this.width/70)} violet`;
        } else {
            this.element.classList.remove("on");
            this.element.style.boxShadow = `none`;
        }
    }
    resetElement(x, y, w, h) {
        const realWidth = Math.max(0.02, w);
        this.width = realWidth;
        super.resetElement(x + w/2 - realWidth/10, 0, realWidth/5);
        const height = Math.max(realWidth/10, 0.005);
        this.element.style.height = getWidth(height);
        this.element.style.top = `calc(${getY(y + h/2)} - ${getWidth(height / 2)})`;
    }
}

let topLevel = new Series();
const TOTAL_VOLTAGE = 12;

const recalculate = () => {
    displayMenu.classList.add("hidden");
    topLevel.getResistance();
    topLevel.supplyVolts(TOTAL_VOLTAGE);
}

topLevel.resetElement(0, 0, 1, 1);
recalculate();