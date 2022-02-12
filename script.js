const reveals = document.querySelectorAll(".section-1");

let first = true;
let disable = false;

const reveal = () => {
    let oneRevealed = false;
    for (let i = 0; i < reveals.length; i++) {
        const windowHeight = window.innerHeight;
        const elementBottom = reveals[i].getBoundingClientRect().bottom;
        const elementTop = reveals[i].getBoundingClientRect().top;
        if (((windowHeight - elementTop) / windowHeight >= 0.5 && (windowHeight - elementBottom) / windowHeight <= 0.75) || (oneRevealed && first)) {
            oneRevealed = true;
            disable = true;
            reveals[i].classList.add("active");
        } else {
            reveals[i].classList.remove("active");
        }
    }
}

reveal(); // on the first one we check if at least one box qualifies (which it will on mobile) - if so, just set em to true at first to make it look nicer
first = false;
if(!disable) {
    window.addEventListener("scroll", reveal);
}