const shapes = document.getElementById("shapes");
const grass = document.getElementById("grass-bottom");
const ground = document.getElementById("ground");
const menu = document.getElementById("menu");

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

shapes.addEventListener('animationend', event => {
    event.target.remove();
});

for(let i = 0; i < 97; i += 2) {
    const newShape = document.createElement("div");
    newShape.style.setProperty("height", `${Math.floor(Math.random() * 10) + 10}vw`);
    newShape.style.setProperty("left", `${i}vw`);
    grass.appendChild(newShape);
}

function toggleMenu() {
    if(menu.classList.contains("hidden")) {
        menu.classList.remove("hidden");
    } else {
        menu.classList.add("hidden");
    }
}

const revealGrass = () => {
    if(Math.abs(ground.getBoundingClientRect().bottom - window.innerHeight) <= 1) {
        grass.classList.add("hover");
    } else {
        grass.classList.remove("hover");
    }
}

window.setInterval(doShapes, 7500);
window.addEventListener("scroll", revealGrass);