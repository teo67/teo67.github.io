const shapes = document.getElementById("shapes");
const grass = document.getElementById("grass");

const doShapes = () => {
    if(document.hidden) {
        return;
    }
    const newShape = document.createElement("div");
    newShape.style.setProperty("left", `${Math.floor(Math.random() * window.innerWidth)}px`);
    shapes.appendChild(newShape);
}

const makeGrass = () => {
    for(let i = 0; i < 100; i += 2) {
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