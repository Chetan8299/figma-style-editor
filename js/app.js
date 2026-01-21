import elemsData, { addElement } from "./state.js";

document.addEventListener("DOMContentLoaded", () => {
    const addRectBtn = document.getElementById("add-rect");
    const addTextBtn = document.getElementById("add-text");
    const canvas = document.getElementById("canvas");

    addRectBtn.addEventListener("click", (elem) => {
        addElement('rect')
        renderElements();
    })
    addTextBtn.addEventListener("click", () => {
        addElement('text')
        renderElements();
    })

    canvas.addEventListener("click", elem => {
        console.log(elem.target.id)
    })
})

function renderElements() {
    const canvas = document.getElementById("canvas");
    elemsData.elements.forEach(({ id, type, x, y, styles }) => {
        const div = document.createElement("div")
        div.id = id;
        div.classList.add(type);
        div.x = x;
        div.y = y;
        for (let key in styles) {
            div.style[key] = styles[key];
        }
        div.style.position = "absolute";
        div.textContent = type == "text" ? type : "";
        canvas.appendChild(div);
    })
}

renderElements()