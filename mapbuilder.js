const selector = document.getElementById("selector");
selector.classList.remove('hidden');
immune = true;
let currentType = 0;
const getPos = event => {
    if(event.composedPath().includes(selector)) {
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
    const res = getPos(event);
    if(res == null) {
        return;
    }
    const asE = board.children[res.ypos * input[0].length + res.xpos];
    asE.classList.remove(key[input[res.ypos][res.xpos]]);
    asE.classList.add(key[currentType]);
    if(types.includes(currentType)) {
        enemies.push(asE);
    } else if(types.includes(input[res.ypos][res.xpos])) {
        enemies.splice(enemies.indexOf(asE), 1);
        console.log(enemies);
    }
    if(key[currentType] == 'finish') {
        finish = asE;
    } else if(key[input[res.ypos][res.xpos]] == 'finish') {
        finish = null;
    }
    input[res.ypos][res.xpos] =  currentType;
});
document.addEventListener('contextmenu', event =>{ 
    const res = getPos(event);
    if(res == null) {
        return;
    }
    event.preventDefault();
    x = res.xpos;
    y = res.ypos;
    board.style.marginLeft = `${42 - x * 10.5}vw`;
    board.style.marginTop = `${(input.length + 2 - y) * 11.5}vw`;
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
        selector.children[currentType].classList.remove('active');
        currentType = i;
        newE.classList.add('active');
    }
    selector.appendChild(newE);
}