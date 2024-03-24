class Slide {
    constructor(imageSource, description) {
        this.imageSource = imageSource;
        this.description = description;
    }
}

const tutorialSlides = [
    new Slide("drag", "Drag the boat and buoys to move them [arrow keys to navigate instructions]"),
    new Slide("rotate", "Hold q/e while dragging the boat to rotate it"),
    new Slide("path", "Move the boat so that it can find a path! (green buoys should be on the right of the boat, red on the left)"),
    new Slide("space", "Hold space to move the boat along its chosen path"),
    new Slide("storage", "Use the upper left storage to make more buoys"),
    new Slide("circles", "When placing buoys, the black circle outlines represent optimal distances from other buoys"),
    new Slide("trash", "Drag buoys to the red area on the right to delete them"),
    new Slide("topbar", "Import, export, delete all buoys, or generate a random path with the top menu"),
    new Slide("bottombar", "View information and edit weights using the bottom menu, or adjust the boat speed"),
    new Slide("path", "That's it for the instructions! Use the arrow keys again at any point to revisit them")
];

export default tutorialSlides;