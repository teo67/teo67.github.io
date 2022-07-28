/* colors:
dark green: 627264
medium green: A1CDA8
turqoise: B5DFCA
light blue: C5E7E2
purple gray: AD9BAA
*/
const lines = document.getElementById("lines");
const title = document.getElementById("title");
const spaces = document.getElementsByClassName("space");
const a90 = Math.PI / 2
const addLine = (x, y, len, rotation, r, g, b) => {
    const newElement = document.createElement("div");
    newElement.classList.add("line");
    newElement.style.height = `${len}%`;
    newElement.style.top = `${y - Math.sin(rotation + a90) * len}%`;
    newElement.style.left = `${x - Math.cos(rotation + a90) * len}%`;
    newElement.style.transform = `rotate(${rotation}rad)`;
    newElement.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
    newElement.onanimationend = () => {
        newElement.remove();
    }
    lines.appendChild(newElement);
}
const newLayer = (numDivisions, len, r, g, b) => {
    for(let i = 0; i < numDivisions; i++) {
        addLine(50, 20, len, 2 * Math.PI * i / numDivisions, r, g, b);
    }
}
let counter = 2;
let direction = 1;
const interval = setInterval(() => {
    if(!document.hidden) {
        newLayer(counter * 2, 40, counter * 20, 0, 100);
    counter += direction;
    if(counter > 10 || counter < 2) {
        direction *= -1;
    }
    }
}, 400);
window.onbeforeunload = () => {
    window.scrollTo(0, 0);
}
window.onscroll = () => {
    for(const item of [lines, title]) {
        item.style.opacity = '0';
    }
    for(const space of spaces) {
        const top = space.getBoundingClientRect().top;
        if(top <= window.innerHeight / 2 && !space.classList.contains("up")) {
            space.classList.add("up");
        }
    }
};