import elemsData, { addElement, selectElement, deSelectElement, updateElement, deleteElement, setName, moveUp, moveDown } from "./state.js";

document.addEventListener("DOMContentLoaded", () => {
    const addRectBtn = document.getElementById("add-rect");
    const addTextBtn = document.getElementById("add-text");
    const canvas = document.getElementById("canvas");
    const layerList = document.getElementById("layers-list");
    const layerUp = document.getElementById("layer-up");
    const layerDown = document.getElementById("layer-down");
    const heightInput = document.getElementById("prop-height")
    const widthInput = document.getElementById("prop-width")
    const bgInput = document.getElementById("prop-bg")
    const bgPicker = document.getElementById("prop-bg-picker")
    const textInput = document.getElementById("prop-text")
    const textColorInput = document.getElementById("prop-text-color")
    const textColorPicker = document.getElementById("prop-text-color-picker")


    addRectBtn.addEventListener("click", (elem) => {
        addElement('rect')
        renderAllElements()
    })
    addTextBtn.addEventListener("click", () => {
        addElement('text')
        renderAllElements()
    })

    const exportJsonBtn = document.getElementById("export-json");
    const exportHtmlBtn = document.getElementById("export-html");
    exportJsonBtn.addEventListener("click", exportAsJSON);
    exportHtmlBtn.addEventListener("click", exportAsHTML);

    canvas.addEventListener("click", elem => {
        const el = elem.target.closest(".canvas-element");

        if (!el) {
            deSelectElement();
            resetPropertiesValues();
            renderAllElements()
            return;
        }
        const elemData = elemsData.elements.find(e => e.id == el.id);

        selectElement(el.id);
        setPropertiesValues(elemData)
        renderAllElements()
    })
    // dragging, resizing and rotation
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

    canvas.addEventListener("mousedown", e => {
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

    canvas.addEventListener("mousemove", e => {
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

    document.addEventListener("keydown", e => {
        const tag = e.target.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || e.target.isContentEditable) return;
        if (elemsData.selectedElementId === null) return;
        const elemData = elemsData.elements.find(e => e.id == elemsData.selectedElementId);
        const elem = document.getElementById(elemsData.selectedElementId);

        const canvasRect = canvas.getBoundingClientRect();

        const elemWidth = parseInt(elem.style.width)
        const elemHeight = parseInt(elem.style.height);

        if (e.key === "Delete") {
            deleteElement(elemsData.selectedElementId)
            resetPropertiesValues();
            renderAllElements();
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
    // layers 
    layerList.addEventListener("click", e => {
        const layerTile = e.target.closest(".layer-tile");
        if (!layerTile) return;

        const elemData = elemsData.elements.find(e => e.id == layerTile.dataset.id);
        selectElement(Number(layerTile.dataset.id))
        setPropertiesValues(elemData);
        renderAllElements()
    })

    layerUp.addEventListener("click", () => {
        let id = elemsData.selectedElementId;
        if (id === null) return;
        moveUp(Number(id));

        renderAllElements()
    })

    layerDown.addEventListener("click", () => {
        let id = elemsData.selectedElementId;
        if (id === null) return;
        moveDown(Number(id));

        renderAllElements()
    })

    // properties
    heightInput.addEventListener("input", e => {
        if (elemsData.selectedElementId === null) return;
        const elemData = elemsData.elements.find(e => e.id === elemsData.selectedElementId);
        updateElement({ id: elemData.id, height: parseInt(e.target.value) || 0 });
        renderElements();
    })

    widthInput.addEventListener("input", e => {
        if (elemsData.selectedElementId === null) return;
        const elemData = elemsData.elements.find(e => e.id == elemsData.selectedElementId);
        updateElement({ id: elemData.id, width: parseInt(e.target.value) || 0 });
        renderElements();
    })

    bgInput.addEventListener("input", e => {
        if (elemsData.selectedElementId === null) return;
        const elemData = elemsData.elements.find(e => e.id == elemsData.selectedElementId);
        const colorValue = e.target.value.trim();
        if (colorValue === "" || isValidColor(colorValue)) {
            if (colorValue !== "") {
                updateElement({
                    id: Number(elemData.id),
                    styles: { ...elemData.styles, backgroundColor: colorValue }
                });

                if (colorValue.startsWith("#")) {
                    bgPicker.value = colorValue;
                } else if (colorValue.startsWith("rgba") || colorValue.startsWith("rgb")) {
                    bgPicker.value = colorToHex(colorValue);
                }
                renderElements();
            }
        }
    })

    bgInput.addEventListener("blur", e => {
        const colorValue = e.target.value.trim();
        if (colorValue && !isValidColor(colorValue)) {

            const elemData = elemsData.elements.find(e => e.id == elemsData.selectedElementId);
            if (elemData) {
                e.target.value = elemData.styles?.backgroundColor || "#fff";
            }
        }
    })

    bgPicker.addEventListener("input", e => {
        if (elemsData.selectedElementId === null) return;
        const elemData = elemsData.elements.find(e => e.id == elemsData.selectedElementId);
        updateElement({
            id: Number(elemData.id),
            styles: { ...elemData.styles, backgroundColor: e.target.value }
        });
        bgInput.value = e.target.value;
        renderElements();
    })

    textInput.addEventListener("input", e => {
        if (elemsData.selectedElementId === null) return;
        const elemData = elemsData.elements.find(e => e.id == elemsData.selectedElementId);
        if (elemData.type === "text") {
            updateElement({ id: elemData.id, text: e.target.value });
            renderElements();
        }
    })

    textColorInput.addEventListener("input", e => {
        if (elemsData.selectedElementId === null) return;
        const elemData = elemsData.elements.find(e => e.id == elemsData.selectedElementId);
        const colorValue = e.target.value.trim();

        if (colorValue === "" || isValidColor(colorValue)) {
            if (colorValue !== "") {
                updateElement({
                    id: elemData.id,
                    styles: { ...elemData.styles, color: colorValue }
                });

                if (colorValue.startsWith("#")) {
                    textColorPicker.value = colorValue;
                } else if (colorValue.startsWith("rgba") || colorValue.startsWith("rgb")) {
                    textColorPicker.value = colorToHex(colorValue);
                }
                renderElements();
            }
        }
    })

    textColorInput.addEventListener("blur", e => {
        const colorValue = e.target.value.trim();
        if (colorValue && !isValidColor(colorValue)) {
            const elemData = elemsData.elements.find(e => e.id == elemsData.selectedElementId);
            if (elemData) {
                e.target.value = elemData.styles?.color || "#000000";
            }
        }
    })

    textColorPicker.addEventListener("input", e => {
        if (elemsData.selectedElementId === null) return;
        const elemData = elemsData.elements.find(e => e.id == elemsData.selectedElementId);
        updateElement({
            id: elemData.id,
            styles: { ...elemData.styles, color: e.target.value }
        });
        textColorInput.value = e.target.value;
        renderElements();
    })

    function isValidColor(color) {
        if (!color) return false;

        // Check for hex color 
        if (/^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/.test(color)) return true;

        // Check for rgba/rgb
        if (/^rgba?\([\d\s,\.]+\)$/.test(color)) {
            const match = color.match(/rgba?\(([^)]+)\)/);
            if (match) {
                const values = match[1].split(',').map(v => v.trim());
                if (values.length >= 3) {
                    const r = parseInt(values[0]);
                    const g = parseInt(values[1]);
                    const b = parseInt(values[2]);
                    const a = values[3] ? parseFloat(values[3]) : 1;
                    if (r >= 0 && r <= 255 && g >= 0 && g <= 255 && b >= 0 && b <= 255 && a >= 0 && a <= 1) {
                        return true;
                    }
                }
            }
        }


        const namedColors = ["black", "white", "red", "green", "blue", "yellow", "cyan", "magenta",
            "transparent", "inherit", "initial", "unset"];
        if (namedColors.includes(color.toLowerCase())) return true;

        return false;
    }

    function colorToHex(color) {
        if (!color) return "#000000";
        if (color.startsWith("#")) return color;

        const colors = {
            "black": "#000000",
            "white": "#ffffff",
            "red": "#ff0000",
            "green": "#008000",
            "blue": "#0000ff",
            "yellow": "#ffff00",
            "cyan": "#00ffff",
            "magenta": "#ff00ff",
            "transparent": "#000000"
        };
        if (colors[color.toLowerCase()]) return colors[color.toLowerCase()];

        // Convert rgba/rgb to hex (for color picker display)
        if (color.startsWith("rgba") || color.startsWith("rgb")) {
            const match = color.match(/rgba?\(([^)]+)\)/);
            if (match) {
                const values = match[1].split(',').map(v => parseInt(v.trim()));
                if (values.length >= 3 && values[0] >= 0 && values[0] <= 255 &&
                    values[1] >= 0 && values[1] <= 255 && values[2] >= 0 && values[2] <= 255) {
                    const r = values[0].toString(16).padStart(2, '0');
                    const g = values[1].toString(16).padStart(2, '0');
                    const b = values[2].toString(16).padStart(2, '0');
                    return `#${r}${g}${b}`;
                }
            }
        }

        return "#000000"; // fallback
    }

    function resetPropertiesValues() {
        heightInput.value = "";
        widthInput.value = "";
        bgInput.value = "";
        bgPicker.value = "#ffffff";
        textInput.value = "";
        textColorInput.value = "";
        textColorPicker.value = "#000000";

        heightInput.disabled = true;
        widthInput.disabled = true;
        bgInput.disabled = true;
        bgPicker.disabled = true;
        textInput.disabled = true;
        textColorInput.disabled = true;
        textColorPicker.disabled = true;
    }

    function setPropertiesValues(elem) {
        if (!elem) return;

        heightInput.disabled = false;
        widthInput.disabled = false;
        bgInput.disabled = false;
        bgPicker.disabled = false;

        heightInput.value = elem.height || 0;
        widthInput.value = elem.width || 0;

        const bgColor = elem.styles?.backgroundColor || "#fff";
        bgInput.value = bgColor;

        try {
            if (bgColor.startsWith("#")) {
                bgPicker.value = bgColor;
            } else {
                bgPicker.value = colorToHex(bgColor);
            }
        } catch (e) { }

        if (elem.type === "text") {
            textInput.disabled = false;
            textColorInput.disabled = false;
            textColorPicker.disabled = false;

            textInput.value = elem.text || elem.type;
            const textColor = elem.styles?.color || "#000000";
            textColorInput.value = textColor;

            try {
                if (textColor.startsWith("#")) {
                    textColorPicker.value = textColor;
                } else {
                    textColorPicker.value = colorToHex(textColor);
                }
            } catch (e) { }
        } else {
            textInput.disabled = true;
            textColorInput.disabled = true;
            textColorPicker.disabled = true;
        }
    }
})

function renderElements() {
    const canvas = document.getElementById("canvas");
    canvas.innerHTML = "";
    elemsData.elements.forEach(({ id, type, x, y, width, height, rotation, styles, text }, idx) => {
        const div = document.createElement("div")
        div.id = id;
        div.classList.add("canvas-element", type);
        div.style.position = "absolute";
        div.style.left = x + "px";
        div.style.top = y + "px";
        div.style.width = (typeof width === 'number' ? width : parseFloat(width)) + "px";
        div.style.height = (typeof height === 'number' ? height : parseFloat(height)) + "px";
        div.style.transform = `rotate(${Math.floor(rotation)}deg)`;
        div.style.zIndex = elemsData.elements.length - (idx + 1);
        div.textContent = type == "text" ? (text || type) : "";
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

function renderLayers() {
    const layerList = document.getElementById("layers-list");
    layerList.innerHTML = "";
    elemsData.elements.forEach((elem, idx) => {
        const layerTile = document.createElement("li");
        layerTile.classList.add("layer-tile");
        if (elem.id == elemsData.selectedElementId) layerTile.classList.add("layer-tile-selected")
        layerTile.dataset.id = elem.id;
        layerTile.innerHTML = `
                    ${elem.type === "text" ? '<i class="ri-t-box-line"></i>' : '<i class="ri-rectangle-line"></i>'}
                    <div class="layer-name">${elem.name ? elem.name : `${elem.type} ${idx + 1}`}</div>`;
        layerList.appendChild(layerTile);
    })
}

function renderAllElements() {
    renderElements()
    renderLayers()
}

function exportAsJSON() {
    const data = {
        elements: elemsData.elements,
        selectedElementId: elemsData.selectedElementId,
        nextId: elemsData.nextId
    };
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "design.json";
    a.click();
    URL.revokeObjectURL(url);
}

function exportAsHTML() {
    const els = elemsData.elements;
    const n = els.length;
    let maxX = 0, maxY = 0;
    for (const e of els) {
        maxX = Math.max(maxX, (e.x || 0) + (e.width || 0));
        maxY = Math.max(maxY, (e.y || 0) + (e.height || 0));
    }
    const w = Math.max(800, maxX + 40);
    const h = Math.max(600, maxY + 40);

    let html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Exported Design</title>
  <style>body { margin: 0; padding: 20px; font-family: sans-serif; }</style>
</head>
<body>
  <div style="position: relative; width: ${w}px; height: ${h}px; background: #f5f5f5;">
`;

    els.forEach((e, idx) => {
        const style = [
            "position: absolute",
            `left: ${e.x || 0}px`,
            `top: ${e.y || 0}px`,
            `width: ${e.width || 50}px`,
            `height: ${e.height || 50}px`,
            `transform: rotate(${Math.floor(e.rotation || 0)}deg)`,
            `z-index: ${n - idx}`,
            `background-color: ${(e.styles && e.styles.backgroundColor) || "#fff"}`,
            `color: ${(e.styles && e.styles.color) || "#000"}`,
            "box-sizing: border-box"
        ].join("; ");
        const raw = e.type === "text" ? (e.text || "text") : "";
        const escaped = raw.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
        html += `    <div style="${style}">${escaped}</div>\n`;
    });

    html += `  </div>
</body>
</html>`;

    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "design.html";
    a.click();
    URL.revokeObjectURL(url);
}

renderAllElements()