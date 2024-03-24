const tutorialSection = document.getElementById("tutorial");
const tutorialDescription = document.getElementById("tutorial-description");
const tutorialImage = document.getElementById("tutorial-image");
import tutorialSlides from "./tutorialSlides.js";

const updateTutorial = slideNumber => {
    if(slideNumber < 0 || slideNumber >= tutorialSlides.length) {
        if(!tutorialSection.classList.contains("disabled")) {
            tutorialSection.classList.add("disabled");
        }
        return;
    }
    if(tutorialSection.classList.contains("disabled")) {
        tutorialSection.classList.remove("disabled");
    }
    tutorialDescription.innerText = tutorialSlides[slideNumber].description;
    tutorialImage.src = `./images/${tutorialSlides[slideNumber].imageSource}.png`;
}

export default updateTutorial;