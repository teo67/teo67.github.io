const selector = document.getElementById("selector");
const play = document.getElementById("play");
const edit = document.getElementById("edit");
tutorialItems.push("Use the bottom right menu to switch tiles.");
tutorialItems.push("Click on any tile to place a block.");
tutorialItems.push("Right click on any tile to teleport there, regardless of its type.");
tutorialItems.push("When you're ready, press play to start the game.");
tutorialItems.push("Press 'edit' to exit play mode. Note that you can also press play again to restart.");
tutorialItems.push("Use 'set start position' to change the initial position of the player on 'play.'");
immune = true;
let currentType = 0;
let start = [1, 1];
const getPos = event => {
    const path = event.composedPath();
    if(path.includes(selector) || path.includes(play) || path.includes(edit) || path.includes(muter)) {
        return null;
    }
    const vw = Math.max(document.documentElement.clientWidth, window.innerWidth) / 100;
    const xpos = x + xToPos(event.clientX / vw) - 4;
    const ypos = 1 + yToPos((document.documentElement.scrollHeight - event.clientY - 40 * vw) / vw);
    if(xpos < 0 || ypos < 0 || xpos >= input[0].length || ypos >= input.length) {
        return null;
    }
    return {xpos, ypos};
}
document.addEventListener('click', event => {
    if(board.classList.contains("builder")) {
        const res = getPos(event);
        if(res == null) {
            return;
        }
        if(tutorialIndex == 2) {
            updateTutorial();
        }
        const asE = board.children[res.ypos * input[0].length + res.xpos + 1];
        if(currentType == key.length) {
            start = [res.xpos, res.ypos];
            asE.classList.add('starting');
            asE.onanimationend = () => {
                asE.classList.remove('starting');
            }
        } else {
            asE.classList.remove(key[input[res.ypos][res.xpos]]);
            asE.classList.add(key[currentType]);
            if(types.includes(currentType)) {
                enemies.push(asE);
            } else if(types.includes(input[res.ypos][res.xpos])) {
                enemies.splice(enemies.indexOf(asE), 1);
                console.log(enemies);
            }
            if(key[currentType] == 'finish') {
                finish.push(asE);
            } else if(key[input[res.ypos][res.xpos]] == 'finish') {
                finish.splice(finish.indexOf(asE), 1);
            }
            input[res.ypos][res.xpos] = currentType;
        }
        run(start[0], start[1]);
    }
});
document.addEventListener('contextmenu', event =>{ 
    if(board.classList.contains("builder")) {
        const res = getPos(event);
        if(res == null) {
            return;
        }
        if(tutorialIndex == 3) {
            updateTutorial();
            play.classList.remove('restricted');
        }
        event.preventDefault();
        x = res.xpos;
        y = res.ypos;
        board.style.marginLeft = `${42 - x * 10.5}vw`;
        board.style.marginTop = `${(input.length + 2 - y) * 11.5}vw`;
    }
});
document.addEventListener('copy', () => {
    let returning = '[';
    for(let i = 0; i < input.length; i++) {
        returning += '[';
        for(let j = 0; j < input[i].length; j++) {
            returning += input[i][j];
            if(j != input[i].length - 1) {
                returning += ', ';
            }
        }
        returning += ']';
        if(i != input.length - 1) {
            returning += ', ';
        }
    }
    returning += ']';
    navigator.clipboard.writeText(returning);
});
for(let i = 0; i < key.length; i++) {
    const newE = document.createElement('button');
    if(i == 0) {
        newE.classList.add('active');
    }
    newE.innerText = key[i];
    newE.onclick = () => {
        if(tutorialIndex == 1) {
            updateTutorial();
        }
        selector.children[currentType].classList.remove('active');
        currentType = i;
        newE.classList.add('active');
    }
    selector.appendChild(newE);
}
const changeStart = document.createElement('button');
changeStart.innerText = 'set start position';
changeStart.onclick = () => {
    if(tutorialIndex == 6) {
        updateTutorial();
    }
    selector.children[currentType].classList.remove('active');
    currentType = key.length;
    changeStart.classList.add('active');
}
selector.appendChild(changeStart);
const reset = () => {
    player.classList.remove('finished');
    for(const fin of finish) {
        fin.classList.remove('finished');
    }
    banner.style.left = '-60vw';
    moving = false;
}
play.onclick = () => {
    if(!play.classList.contains("restricted")) {
        if(tutorialIndex == 4) {
            updateTutorial();
        }
        board.classList.remove("builder");
        selector.classList.add("restricted");
        edit.classList.remove("restricted");
        spawn[0] = start[0];
        spawn[1] = start[1];
        x = spawn[0];
        y = spawn[1];
        immune = false;
        board.style.marginLeft = `${42 - x * 10.5}vw`;
        board.style.marginTop = `${(input.length + 2 - y) * 11.5}vw`;
        reset();
        startTime = Date.now();
    }
}
edit.onclick = () => {
    if(!edit.classList.contains("restricted")) {
        if(tutorialIndex == 5) {
            updateTutorial();
        }
        board.classList.add("builder");
        selector.classList.remove("restricted");
        edit.classList.add("restricted");
        immune = true;
        reset();
    }
}