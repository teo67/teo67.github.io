const board = document.getElementById("board");
const player = document.getElementById("player");
const waves = document.getElementById("waves");
const death = document.getElementById("death");
const key = ["grass", "wall", "sand", "shooter", "brick", "checkpoint", "fakefloor"];
const input = [];
const nomove = [1, 3, 4];
const enemies = [];
const types = [3, 6];
const spawn = [1, 1];
let immune = false;
const create = (width, height, def) => {
    for(let i = 0; i < height; i++) {
        const arr = [];
        for(let j = 0; j < width; j++) {
            arr.push(def);
        }
        input.push(arr);
    }
} 
const add = (x, y, num) => {
    input[y][x] = num;
}
const addRect = (x, y, w, h, num, fill = true) => {
    for(let i = x; i < x + w; i++) {
        add(i, y, num);
    }
    for(let i = y + 1; i < y + h - 1; i++) {
        add(x, i, num);
        if(fill) {
            for(let j = x + 1; j < x + w - 1; j++) {
                add(j, i, num);
            }
        }
        add(x + w - 1, i, num);
    }
    for(let i = x; i < x + w; i++) {
        add(i, y + h - 1, num);
    }
}

create(30, 30, 0);  
addRect(0, 0, 30, 1, 1, false);
addRect(0, 1, 1, 29, 1, false);
addRect(29, 1, 1, 29, 1, false);
addRect(1, 29, 28, 1, 1, false);
addRect(1, 1, 5, 1, 2, false);
addRect(5, 2, 1, 3, 2, false);
addRect(1, 3, 3, 4, 4);
add(7, 2, 3);
add(9, 3, 3);
add(2, 2, 1);
addRect(6, 4, 2, 1, 2, false);
add(8, 4, 5);
add(6, 3, 1);
add(6, 1, 1);
add(8, 1, 5);
addRect(4, 6, 10, 1, 1, false);
add(10, 5, 4);
add(10, 4, 4);
addRect(10, 1, 8, 2, 6, false);
add(18, 1, 1);
add(18, 2, 1);
add(18, 3, 1);
addRect(10, 3, 7, 1, 1, false);
add(17, 3, 2);
addRect(11, 4, 8, 2, 2, false);

for(let i = input.length - 1; i >= 0; i--) {
    for(let j = 0; j < input[i].length; j++) {
        const newE = document.createElement("div");
        newE.classList.add("block");
        newE.classList.add(key[input[input.length - i - 1][j]]);
        if(types.includes(input[input.length - i - 1][j])) {
            enemies.push(newE);
        }
        newE.style.left = `${j * 10.5}vw`;
        newE.style.bottom = `${i * 11.5}vw`;
        board.appendChild(newE);
    }
}
let prevX = spawn[0];
let prevY = spawn[1];
let x = spawn[0];
let y = spawn[1];
let moving = false;
const map = {
    w: [0, -1], ArrowUp: [0, -1], a: [-1, 0], ArrowLeft: [-1, 0], s: [0, 1], ArrowDown: [0, 1], d: [1, 0], ArrowRight: [1, 0]
}
document.addEventListener('keydown', event => {
    if(event.key == 'y') {
        y--;
        move([0, 0]);
    } else if(event.key == 'g') {
        x--;
        move([0, 0]);
    } else if(event.key == 'h') {
        y++;
        move([0, 0]);
    } else if(event.key == 'j') {
        x++;
        move([0, 0]);
    } else if(event.key == ' ') {
        immune = !immune;
    }
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
    const val = input[y + direction[1]][x + direction[0]];
    if(nomove.includes(val)) {
        moving = false;
        return;
    }
    if(val == 5) {
        spawn[0] = x + direction[0];
        spawn[1] = y + direction[1];
    }
    prevX = x;
    prevY = y;
    x += direction[0];
    y += direction[1];
    if(direction[0] + direction[1] != 0) {
        player.classList.add(`m${direction[0]}${direction[1]}1`);
        setTimeout(() => {
            player.classList.remove(`m${direction[0]}${direction[1]}1`);
            prevX = x;
            prevY = y;
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
const decode = val => {
    return 1 * val.substring(0, val.length - 2);
}
const xToPos = x => {
    return Math.floor(x / 10.5);
}
const yToPos = y => {
    return Math.floor(input.length - 1 - y / 11.5);
}
const isColliding = (xt, yt, dx, dy) => {
    return (xt + dx == x && yt + dy == y) || (xt + dx == prevX && yt + dy == prevY) || (xt == x && yt == y) || (xt == prevX && yt == prevY)
}
const die = () => {
    if(!immune) {
        x = spawn[0];
        y = spawn[1];
        move([0, 0]);
        death.classList.remove("hidden");
        setTimeout(() => {
            death.classList.add("hidden");
        }, 1000);
    }
}
let enemyTick = 0;
const bulletUpdate = (dx, dy, enemy, rem) => {
    if(enemyTick % 1 == 0) {
        const xr = decode(enemy.style.left);
        const yr = decode(enemy.style.bottom);
        const xt = xToPos(xr);
        const yt = yToPos(yr);
        if(isColliding(xt, yt, dx, dy)) {
            die();
        }
        if(xt + dx >= input[0].length || xt + dx < 0 || yt + dy < 0 || yt + dy >= input.length) {
            rem();
        } else {
            const res = input[yt + dy][xt + dx];
            if(nomove.includes(res)) {
                rem();
            } else {
                enemy.style.left = `${dx * 10.5 + xr}vw`;
                enemy.style.bottom = `${dy * -11.5 + yr}vw`;
            }
        }
        
    }
}
const updateEnemies = () => {
    let iLength = enemies.length;
    for(let i = 0; i < iLength; i++) {
        const enemy = enemies[i];
        const rem = () => {
            enemies.splice(i, 1);
            i--;
            iLength--;
            enemy.classList.add("shatter");
            setTimeout(() => {
                enemy.remove();
            }, 1000);
        }
        if(enemy.classList.contains("shooter")) {
            if(enemyTick % 12 == 0) {
                const classes = ["bulletup", "bulletright", "bulletdown", "bulletleft"];
                const xshifts = [0, 1, 0, -1];
                const yshifts = [1, 0, -1, 0];
                for(let i = 0; i < classes.length; i++) {
                    const newE = document.createElement("div");
                    newE.classList.add(classes[i]);
                    newE.style.left = `${decode(enemy.style.left) + 10.5 * xshifts[i]}vw`;
                    newE.style.bottom = `${decode(enemy.style.bottom) + 11.5 * yshifts[i]}vw`;
                    enemies.push(newE);
                    board.appendChild(newE);
                }
            }
        } else if(enemy.classList.contains("bulletup")) {
            bulletUpdate(0, -1, enemy, rem);
        } else if(enemy.classList.contains("bulletright")) {
            bulletUpdate(1, 0, enemy, rem);
        } else if(enemy.classList.contains("bulletdown")) {
            bulletUpdate(0, 1, enemy, rem);
        } else if(enemy.classList.contains("bulletleft")) {
            bulletUpdate(-1, 0, enemy, rem);
        } else if(enemy.classList.contains("fakefloor")) {
            if(enemyTick % 2 == 0) {
                const xr = decode(enemy.style.left);
                const yr = decode(enemy.style.bottom);
                const xt = xToPos(xr);
                const yt = yToPos(yr);
                if(enemy.classList.contains("trapped")) {
                    if(x == xt && y == yt) {
                        die();
                    }
                } else {
                    if(prevX == xt && prevY == yt) {
                        enemy.classList.add("trapped");
                        setTimeout(() => {
                            enemy.classList.remove("trapped");
                        }, 1000);
                    } 
                }
            }
        }
    }
    enemyTick++;
}
setInterval(updateEnemies, 250);