const board = document.getElementById("board");
const player = document.getElementById("player");
const waves = document.getElementById("waves");
const death = document.getElementById("death");
const banner = document.getElementById("banner");
const tutorial = document.getElementById("tutorial");
const muter = document.getElementById("mute");
const sounds = {
    soundtrack: document.getElementById("soundtrack"), 
    checkpoint: document.getElementById("checkpoint")
};
let muted = true;
const key = ["grass", "wall", "sand", "shooter", "brick", "checkpoint", "fakefloor", "shifter", "lava", "clock", "counterclock", "finish"];
const input = board.classList.contains("builder") ? [] : [[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], [1, 2, 2, 2, 6, 0, 6, 0, 0, 4, 4, 2, 0, 2, 0, 0, 7, 5, 2, 1], [1, 2, 2, 2, 0, 6, 0, 0, 0, 4, 4, 0, 2, 0, 0, 0, 1, 7, 7, 1], [1, 1, 1, 1, 1, 1, 1, 5, 5, 4, 4, 2, 0, 2, 0, 0, 1, 6, 6, 1], [1, 0, 0, 0, 3, 0, 0, 0, 0, 3, 4, 0, 2, 0, 0, 0, 1, 7, 7, 1], [1, 1, 5, 0, 0, 0, 1, 0, 1, 2, 4, 2, 3, 2, 0, 0, 1, 7, 7, 1], [1, 6, 6, 4, 4, 1, 0, 1, 4, 2, 4, 3, 0, 3, 0, 0, 1, 7, 7, 1], [1, 6, 6, 6, 4, 0, 0, 5, 2, 2, 2, 0, 0, 0, 5, 0, 1, 7, 7, 1], [1, 6, 6, 6, 4, 0, 0, 5, 2, 2, 2, 0, 0, 0, 5, 0, 1, 6, 6, 1], [1, 6, 6, 6, 4, 0, 0, 1, 4, 4, 4, 3, 0, 3, 0, 0, 1, 5, 5, 1], [1, 2, 2, 2, 0, 0, 0, 1, 4, 4, 4, 0, 3, 0, 1, 1, 1, 7, 7, 1], [1, 0, 0, 0, 0, 3, 0, 0, 1, 0, 9, 7, 7, 7, 5, 2, 8, 2, 8, 1], [1, 1, 1, 1, 0, 0, 0, 1, 0, 9, 10, 2, 2, 2, 8, 7, 7, 5, 2, 1], [1, 9, 7, 6, 1, 0, 1, 4, 0, 9, 10, 2, 2, 1, 1, 2, 2, 7, 1, 1], [1, 6, 1, 5, 2, 1, 4, 4, 2, 5, 9, 7, 7, 7, 10, 8, 2, 6, 4, 1], [1, 2, 3, 0, 8, 2, 8, 4, 2, 4, 7, 4, 4, 4, 5, 4, 1, 4, 4, 1], [1, 2, 1, 0, 2, 6, 2, 8, 2, 1, 10, 2, 7, 9, 7, 10, 8, 10, 2, 1], [1, 9, 10, 1, 8, 2, 6, 2, 2, 1, 10, 7, 9, 6, 9, 6, 7, 9, 2, 1], [1, 11, 10, 1, 2, 8, 2, 6, 2, 1, 10, 2, 8, 7, 2, 9, 7, 7, 8, 1], [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]];
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
if(board.classList.contains("builder")) {
    create(20, 20, 0);  
    addRect(0, 0, 20, 1, 1, false);
    addRect(0, 1, 1, 19, 1, false);
    addRect(19, 1, 1, 19, 1, false);
    addRect(1, 19, 18, 1, 1, false);
}
let finish = [];
for(let i = input.length - 1; i >= 0; i--) {
    for(let j = 0; j < input[i].length; j++) {
        const newE = document.createElement("div");
        newE.classList.add("block");
        newE.classList.add(key[input[input.length - i - 1][j]]);
        if(types.includes(input[input.length - i - 1][j])) {
            enemies.push(newE);
        }
        if(newE.classList.contains('finish')) {
            finish.push(newE);
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
let nextDirection = '';
const map = {
    w: [0, -1], ArrowUp: [0, -1], a: [-1, 0], ArrowLeft: [-1, 0], s: [0, 1], ArrowDown: [0, 1], d: [1, 0], ArrowRight: [1, 0]
}
const keydownevent = event => {
    if(!player.classList.contains('finished')) {
        if(!moving) {
            if(map[event.key] !== undefined) {
                if(tutorialIndex == 0) {
                    updateTutorial();
                }
                moving = true;
                move(map[event.key]);
            }
        } else {
            nextDirection = event.key;
        }
    }
}
document.addEventListener('keydown', keydownevent);
const keyupevent = event => {
    if(!player.classList.contains('finished')) {
        if(moving && nextDirection == event.key) {
            nextDirection = '';
        }
    }
}
document.addEventListener('keyup', keyupevent);
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
    prevX = x;
    prevY = y;
    x += direction[0];
    y += direction[1];
    if(val == 5) {
        spawn[0] = x;
        spawn[1] = y;
    } else if(val == 8) {
        die();
    }
    if(direction[0] + direction[1] != 0) {
        player.classList.add(`m${direction[0]}${direction[1]}1`);
        setTimeout(() => {
            prevX = x;
            prevY = y;
            if(val == 7) {
                move(direction);
            } else if(val == 9) {
                move([direction[1], -direction[0]]);
            } else if(val == 10) {
                move([-direction[1], direction[0]]);
            } else if(val == 11 && !board.classList.contains("builder")) {
                player.classList.add('finished');
                for(const fin of finish) {
                    fin.classList.add('finished');
                }
                const res = Math.round((Date.now() - startTime) / 1000);
                banner.innerText = `Finished in ${res}s!`;
                banner.style.left = '20vw';
            } else if(map[nextDirection] !== undefined) {
                move(map[nextDirection]);
                nextDirection = '';
            } else {
                moving = false;
            }
        }, 500);
    };
    setTimeout(() => {
        player.classList.remove(`m${direction[0]}${direction[1]}1`);
        board.style.marginLeft = `${42 - x * 10.5}vw`;
        board.style.marginTop = `${(input.length + 2 - y) * 11.5}vw`;
        if(val == 5) {
            if(!muted) {
                sounds.checkpoint.currentTime = 0;
                sounds.checkpoint.play();
            }
            player.classList.add("checkpointing");
            player.onanimationend = () => {
                player.classList.remove("checkpointing");
            }
        }
    }, 250);
}
move([0, 0]);
setInterval(() => {
    if(document.hidden) {
        return;
    }
    const newE = document.createElement("div");
    newE.classList.add("wave");
    newE.style.top = `${Math.random() * 30}vh`;
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
    if(!player.classList.contains('finished')) {
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
                        const xr = decode(enemy.style.left);
                        const yr = decode(enemy.style.bottom);
                        if(nomove.includes(input[yToPos(yr) - yshifts[i]][xToPos(xr) + xshifts[i]])) {
                            continue;
                        }
                        const newE = document.createElement("div");
                        newE.classList.add(classes[i]);
                        newE.style.left = `${xr + 10.5 * xshifts[i]}vw`;
                        newE.style.bottom = `${yr + 11.5 * yshifts[i]}vw`;
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
}
const updateTutorial = () => {
    tutorialIndex++;
    if(tutorialIndex >= tutorialItems.length) {
        tutorial.classList.add('hidden');
        return;
    }
    tutorial.innerText = tutorialItems[tutorialIndex];
}
const updateE = setInterval(updateEnemies, 250);
const tutorialItems = [
    "Use WASD or the arrow keys to move. Follow the blue dots to the finish!",
];
let tutorialIndex = -1;
updateTutorial();
run(spawn[0], spawn[1]);
muter.onclick = () => {
    if(muter.classList.contains("unmuted")) {
        muter.classList.remove("unmuted");
    } else {
        muter.classList.add("unmuted");
        sounds.soundtrack.play();
        sounds.soundtrack.volume = 0.3;
    }
    muted = !muted;
    sounds.soundtrack.muted = muted;
}
let startTime = Date.now();