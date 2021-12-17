const shapes = document.getElementById("shapes");
const grass = document.getElementById("grass");

let shapeLeft = 0;

const doShapes = () => {
    if(document.hidden) {
        return;
    }
    const newShape = document.createElement("div");
    newShape.style.setProperty("left", `${shapeLeft + Math.floor(Math.random() * window.innerWidth * 0.3)}px`);
    shapes.appendChild(newShape);
    shapeLeft = window.innerWidth / 2 - shapeLeft;
}

const makeGrass = () => {
    for(let i = 0; i < 97; i += 2) {
        const newShape = document.createElement("div");
        newShape.style.setProperty("height", `${Math.floor(Math.random() * 10) + 10}vw`);
        newShape.style.setProperty("left", `${i}vw`);
        grass.appendChild(newShape);
    }
}

shapes.addEventListener('animationend', event => {
    event.target.remove();
});

makeGrass();
window.setInterval(doShapes, 7500);