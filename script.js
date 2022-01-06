const reveals = document.querySelectorAll(".section-1");

const reveal = () => {
    for (let i = 0; i < reveals.length; i++) {
        const windowHeight = window.innerHeight;
        const elementBottom = reveals[i].getBoundingClientRect().bottom;
        const elementTop = reveals[i].getBoundingClientRect().top;
        if ((windowHeight - elementTop) / windowHeight >= 0.5 && (windowHeight - elementBottom) / windowHeight <= 0.5) {
            reveals[i].classList.add("active");
        } else {
            reveals[i].classList.remove("active");
        }
    }
}

window.addEventListener("scroll", reveal);