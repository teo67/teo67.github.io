const board = document.getElementById("board");
const player = document.getElementById("player");
const waves = document.getElementById("waves");
const key = ["grass", "wall", "sand"];
const input = [];
const nomove = [1];
const create = (width, height, def) => {
    for(let i = 0; i < height; i++) {
        const arr = [];
        for(let j = 0; j < width; j++) {
            arr.push(def);
        }
        input.push(arr);
    }
} 
const addRect = (x, y, w, h, num, fill = true) => {
    for(let i = x; i < x + w; i++) {
        input[y][i] = num;
    }
    for(let i = y + 1; i < y + h - 1; i++) {
        input[i][x] = num;
        if(fill) {
            for(let j = x + 1; j < x + w - 1; j++) {
                input[i][j] = num;
            }
        }
        input[i][x + w - 1] = num;
    }
    for(let i = x; i < x + w; i++) {
        input[y + h - 1][i] = num;
    }
}




create(27, 27, 0);  
addRect(0, 0, 27, 1, 1, false);
addRect(0, 1, 1, 26, 1, false);
addRect(26, 1, 1, 26, 1, false);
addRect(1, 26, 25, 1, 1, false);
addRect(2, 2, 5, 1, 2, false);
addRect(4, 3, 1, 4, 2, false);
addRect(8, 2, 1, 5, 2, false);
addRect(9, 4, 3, 1, 2, false);
addRect(12, 2, 1, 5, 2, false);
addRect(14, 2, 1, 5, 2, false);
addRect(15, 2, 4, 1, 2, false);
addRect(15, 4, 4, 1, 2, false);
addRect(15, 6, 4, 1, 2, false);
addRect(20, 2, 5, 1, 2, false);
addRect(20, 3, 1, 3, 2, false);
addRect(24, 3, 1, 3, 2, false);
addRect(20, 6, 5, 1, 2, false);




for(let i = input.length - 1; i >= 0; i--) {
    for(let j = 0; j < input[i].length; j++) {
        const newE = document.createElement("div");
        newE.classList.add("block");
        newE.classList.add(key[input[input.length - i - 1][j]]);
        newE.style.left = `${j * 10.5}vw`;
        newE.style.bottom = `${i * 11.5}vw`;
        board.appendChild(newE);
    }
}
let x = 1;
let y = 1;
let moving = false;
const map = {
    w: [0, -1], ArrowUp: [0, -1], a: [-1, 0], ArrowLeft: [-1, 0], s: [0, 1], ArrowDown: [0, 1], d: [1, 0], ArrowRight: [1, 0]
}
document.addEventListener('keydown', event => {
    if(!moving) {
        if(map[event.key] !== undefined) {
            moving = true;
            move(map[event.key]);
        }
    }
});
const move = direction => {
    if(y + direction[1] < 0 || y + direction[1] >= input.length || x + direction[0] < 0 || x + direction[0] >= input[0].length) {
        moving = false;
        return;
    }
    if(nomove.includes(input[y + direction[1]][x + direction[0]])) {
        moving = false;
        return;
    }
    x += direction[0];
    y += direction[1];
    if(direction[0] + direction[1] != 0) {
        player.classList.add(`m${direction[0]}${direction[1]}1`);
        setTimeout(() => {
            player.classList.remove(`m${direction[0]}${direction[1]}1`);
            setTimeout(() => {
                moving = false;
            }, 10);
        }, 500);
    }
    setTimeout(() => {
        board.style.marginLeft = `${42 - x * 10.5}vw`;
        board.style.marginTop = `${(input.length + 2 - y) * 11.5}vw`;
    }, 250);
}
move([0, 0]);
setInterval(() => {
    if(document.hidden) {
        return;
    }
    const newE = document.createElement("div");
    newE.classList.add("wave");
    newE.style.top = `${Math.random() * 50}vh`;
    newE.style.width = `${Math.random() * 10 + 5}vw`;
    newE.onanimationend = () => {
        newE.remove();
    }
    waves.appendChild(newE);
}, 5000);