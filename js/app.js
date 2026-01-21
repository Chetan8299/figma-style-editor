import elemsData, { addElement, selectElement, deSelectElement, updateElement } from "./state.js";

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
        const el = elem.target.closest(".canvas-element");

        if (!el) {
            deSelectElement();
            renderElements();
            return;
        }

        selectElement(el.id);
        renderElements();


    })

    let isDragging = false;
    let startMouseX = 0;
    let startMouseY = 0;
    let startElemX = 0;
    let startElemY = 0;

    canvas.addEventListener("mousedown", (e) => {
        const el = e.target.closest(".canvas-element");
        if (!el) return;

        selectElement(Number(el.id));

        const elemData = elemsData.elements.find(e => e.id === elemsData.selectedElementId)

        const canvasRect = canvas.getBoundingClientRect();

        startMouseX = e.clientX - canvasRect.left;
        startMouseY = e.clientY - canvasRect.top;

        startElemX = elemData.x;
        startElemY = elemData.y;

        isDragging = true;
    })

    canvas.addEventListener("mousemove", (e) => {
        if (!isDragging || elemsData.selectedElementId === null)
            return;

        const elemData = elemsData.elements.find(e => e.id === elemsData.selectedElementId)

        const canvasRect = canvas.getBoundingClientRect();

        const currentMouseX = e.clientX - canvasRect.left;
        const currentMouseY = e.clientY - canvasRect.top;

        const dx = currentMouseX - startMouseX;
        const dy = currentMouseY - startMouseY;

        console.log(dx, dy)
        updateElement({ id: elemData.id, x: startElemX + dx, y: startElemY + dy });

        renderElements();

    })

    document.addEventListener("mouseup", elem => {
        isDragging = false;
    })

})

function renderElements() {
    const canvas = document.getElementById("canvas");
    canvas.innerHTML = "";

    elemsData.elements.forEach(({ id, type, x, y, styles }) => {
        const div = document.createElement("div")
        div.id = id;
        div.classList.add("canvas-element", type);
        div.style.position = "absolute";
        div.style.left = x + "px";
        div.style.top = y + "px";
        div.textContent = type == "text" ? type : "";
        for (let key in styles) {
            div.style[key] = styles[key];
        }

        if (elemsData.selectedElementId == id) {
            div.classList.add("selected-elem")
        }
        canvas.appendChild(div);
    })
}

renderElements()