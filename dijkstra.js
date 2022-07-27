const cleaner = document.getElementById("cleaner");
class Node {
    constructor(x, y, impassible = false) {
        this.x = x;
        this.y = y;
        this.impassible = impassible;
        this.parent = null;
        this.distance = -1;
    }
}
const recurBackwards = (arr, _node) => {
    if(_node === null) {
        return;
    }
    recurBackwards(arr, _node.parent)
    arr.push([_node.x, _node.y]);
}
const run = (x, y) => {
    const area = [];
    for(let i = 0; i < input.length; i++) {
        const newA = [];
        for(let j = 0; j < input[i].length; j++) {
            newA.push(new Node(j, i, nomove.includes(input[i][j]) || key[input[i][j]] == "lava"));
        }
        area.push(newA);
    }
    area[y][x].distance = 0;
    const available = [];
    for(const row of area) {
        for(const item of row) {
            available.push(item); // 1d array (gets edited over time)
        }
    }

    let result = null;
    while(available.length > 0) {
        let index = -1;
        for(let i = 0; i < available.length; i++) {
            if(available[i].distance != -1 && (index == -1 || available[i].distance < available[index].distance)) {
                index = i;
            }
        }
        if(index == -1) {
            break;
        }
        const saved = available[index];
        available.splice(index, 1);
        if(key[input[saved.y][saved.x]] == "finish") {
            result = [];
            recurBackwards(result, saved);
            break;
        }
        const neighbors = [];
        if(saved.x > 0) {
            neighbors.push(area[saved.y][saved.x - 1]);
        }
        if(saved.x < area[0].length - 1) {
            neighbors.push(area[saved.y][saved.x + 1]);
        }
        if(saved.y > 0) {
            neighbors.push(area[saved.y - 1][saved.x]);
        }
        if(saved.y < area.length - 1) {
            neighbors.push(area[saved.y + 1][saved.x]);
        }
        for(const neighbor of neighbors) {
            if(neighbor.impassible) {
                continue;
            }
            if(neighbor.distance == -1 || saved.distance + 1 < neighbor.distance) {
                neighbor.distance = saved.distance + 1;
                neighbor.parent = saved;
            }
        }
    }
    while(cleaner.firstChild) {
        cleaner.removeChild(cleaner.firstChild);
    }
    if(result != null) {
        for(let i = 0; i < result.length - 1; i++) {
            const newE = document.createElement("div");
            newE.classList.add("path");
            newE.style.left = `${result[i + (result[i][0] < result[i + 1][0] ? 0 : 1)][0] * 10.5 + 4.5}vw`;
            newE.style.bottom = `${(input.length - 1 - result[i + (result[i][1] > result[i + 1][1] ? 0 : 1)][1]) * 11.5 + 5.25}vw`;
            if(result[i][0] < result[i + 1][0]) {
                newE.classList.add('right');
            } else if(result[i][0] > result[i + 1][0]) {
                newE.classList.add('left');
            }
            if(result[i][1] < result[i + 1][1]) {
                newE.classList.add('down');
            } else if(result[i][1] > result[i + 1][1]) {
                newE.classList.add('up');
            }
            cleaner.appendChild(newE);
        }
    }
}
