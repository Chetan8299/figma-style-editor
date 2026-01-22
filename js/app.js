import elemsData, { addElement, selectElement, deSelectElement, updateElement, deleteElement } from "./state.js";

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
    let isResizing = false;
    let resizeDirection = "tl";
    let startHeight = 0;
    let startWidth = 0;
    let isRotating = false;
    let startAngle = 0;
    let startRotation = 0;
    let centerX, centerY;

    canvas.addEventListener("mousedown", (e) => {
        let rotationHandle = e.target.closest(".rotation-handle");
        if (rotationHandle) isRotating = true;

        let handle = e.target.closest(".handle");
        if (handle && !isRotating) {
            e.stopPropagation()
            isResizing = true;
            resizeDirection = handle.dataset.dir;
        }
        const el = e.target.closest(".canvas-element");
        if (!el) return;
        if (!isResizing && !isRotating) isDragging = true;

        selectElement(Number(el.id));

        const elemData = elemsData.elements.find(e => e.id === elemsData.selectedElementId)

        const canvasRect = canvas.getBoundingClientRect();

        startMouseX = e.clientX - canvasRect.left;
        startMouseY = e.clientY - canvasRect.top;

        startElemX = elemData.x;
        startElemY = elemData.y;

        startWidth = elemData.width;
        startHeight = elemData.height;

        centerX = elemData.x + elemData.width / 2;
        centerY = elemData.y + elemData.height / 2;

        startAngle = Math.atan2(startMouseY - centerY, startMouseX - centerX) * 180 / Math.PI;
        startRotation = elemData.rotation;
    })

    canvas.addEventListener("mousemove", (e) => {
        if (!isResizing && !isDragging && !isRotating) return;

        const elemData = elemsData.elements.find(e => e.id === elemsData.selectedElementId)

        const canvasRect = canvas.getBoundingClientRect();

        const currentMouseX = e.clientX - canvasRect.left;
        const currentMouseY = e.clientY - canvasRect.top;

        const dx = currentMouseX - startMouseX;
        const dy = currentMouseY - startMouseY;

        if (isRotating) {
            const angleNow = Math.atan2(currentMouseY - centerY, currentMouseX - centerX) * 180 / Math.PI;

            const deltaAngle = angleNow - startAngle;

            updateElement({
                id: elemData.id,
                rotation: startRotation + deltaAngle
            });

            renderElements();
            return;
        }

        if (isResizing) {
            let w = startWidth;
            let h = startHeight;
            let x = startElemX;
            let y = startElemY;

            if (resizeDirection === "br") {
                w += dx;
                h += dy;
            }
            if (resizeDirection === "bl") {
                w -= dx;
                h += dy;
                x += dx;
            }
            if (resizeDirection === "tr") {
                w += dx;
                h -= dy;
                y += dy;
            }
            if (resizeDirection === "tl") {
                w -= dx;
                h -= dy;
                x += dx;
                y += dy;
            }

            w = Math.max(20, w);
            h = Math.max(20, h);
            updateElement({ id: elemData.id, x, y, width: w, height: h });

            renderElements();
            return;
        }

        if (!isDragging || elemsData.selectedElementId === null)
            return;
        updateElement({ id: elemData.id, x: startElemX + dx, y: startElemY + dy });
        renderElements();
    })

    document.addEventListener("mouseup", elem => {
        isDragging = false;
        isResizing = false;
        isRotating = false;
        resizeDirection = null;

    })

    document.addEventListener("keydown", (e) => {
        const elemData = elemsData.elements.find(e => e.id == elemsData.selectedElementId);
        const elem = document.getElementById(elemsData.selectedElementId);

        const canvasRect = canvas.getBoundingClientRect();

        const elemWidth = parseInt(elem.style.width)
        const elemHeight = parseInt(elem.style.height);

        if (e.key === "Delete") {
            deleteElement(elemsData.selectedElementId)
        } else if (e.key === "ArrowUp") {
            updateElement({ ...elemData, y: Math.max(elemData.y - 7, 0) });
        } else if (e.key === "ArrowDown") {
            updateElement({ ...elemData, y: Math.min(elemData.y + 7, canvasRect.height - elemHeight) });
        } else if (e.key === "ArrowLeft") {
            updateElement({ ...elemData, x: Math.max(elemData.x - 7, 0) });
        } else if (e.key === "ArrowRight") {
            updateElement({ ...elemData, x: Math.min(elemData.x + 7, canvasRect.width - elemWidth) });
        }
        renderElements()
    })
})

function renderElements() {
    const canvas = document.getElementById("canvas");
    canvas.innerHTML = "";

    elemsData.elements.forEach(({ id, type, x, y, width, height, rotation, styles }) => {
        const div = document.createElement("div")
        div.id = id;
        div.classList.add("canvas-element", type);
        div.style.position = "absolute";
        div.style.left = x + "px";
        div.style.top = y + "px";
        div.style.width = (typeof width === 'number' ? width : parseFloat(width)) + "px";
        div.style.height = (typeof height === 'number' ? height : parseFloat(height)) + "px";
        div.style.transform = `rotate(${Math.floor(rotation)}deg)`;
        div.textContent = type == "text" ? type : "";
        for (let key in styles) {
            div.style[key] = styles[key];
        }

        if (elemsData.selectedElementId == id) {
            const positions = ["tl", "tr", "bl", "br"];

            positions.forEach(pos => {
                const handle = document.createElement("div");
                handle.classList.add("handle", pos);
                handle.dataset.dir = pos;
                div.appendChild(handle);
            })

            const rotationHandle = document.createElement("div");
            rotationHandle.classList.add("rotation-handle")
            rotationHandle.dataset.type = "rotate";
            div.appendChild(rotationHandle);
            div.classList.add("selected-elem")
        }


        canvas.appendChild(div);
    })
}


renderElements()