const intro = document.getElementById("intro");
const title = document.getElementById("title");
const blue = document.getElementById("slide");
const red = document.getElementById("slidered");
const img = document.getElementById("slideright");
const game = document.getElementById("game");
const links = document.getElementById("links");
const vh = () => {
    return Math.max(document.documentElement.clientHeight, window.innerHeight) / 100;
}
const vw = () => {
    return Math.max(document.documentElement.clientWidth, window.innerWidth) / 100;
}
const listener = () => {
    const bottom = title.getBoundingClientRect().bottom;
    const vh1 = vh();
    if(bottom < vh1 * 25 && bottom >= vh1 * -25) {
        blue.style.opacity = `${60 - (1.6 * bottom / vh1)}%`;
        red.style.opacity = `${60 - (1.6 * bottom / vh1)}%`;
    }
    if(window.innerHeight + window.scrollY >= document.body.scrollHeight - 20 * vh1) {
        init();
        links.style.opacity = "0";
        blue.style.opacity = "1";
        red.style.opacity = "1";
        
        setTimeout(() => {
            img.style.display = "none";
            game.style.display = "block";
            blue.classList.add("moving");
            red.classList.add("moving");
        }, 500);
        
        
        document.body.style.overflow = "hidden";
        document.removeEventListener('scroll', listener);
        setTimeout(() => {
            intro.style.display = "none";
        }, 3000);
    }
}
window.onbeforeunload = () => {
    window.scrollTo(0, 0);
}
document.addEventListener('scroll', listener);
const writerText = "Hi, I'm Theo";
const ivw = vw();
title.innerText = writerText;
const width = title.getBoundingClientRect().width;
title.style.marginLeft = `${(document.documentElement.clientWidth - width) / (2 * ivw)}vw`;
title.style.opacity = "1";
let currentIndex = 0;
const interval = setInterval(() => {
    if(currentIndex >= writerText.length) {
        clearInterval(interval);
        return;
    }
    currentIndex++;
    title.innerText = writerText.substring(0, currentIndex);
}, 150);
// window.addEventListener('resize', () => {
//     location.reload();
// });