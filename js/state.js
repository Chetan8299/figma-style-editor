const elemsData = JSON.parse(localStorage.getItem("elemsData")) ?? {
    elements: [],
    selectedElementId: null,
    nextId: 1
};

function saveElemsData() {
    localStorage.setItem("elemsData", JSON.stringify(elemsData));
}

export function addElement(type) {
    elemsData.elements.push({
        id: elemsData.nextId++,
        type,
        x: 0,
        y: 0,
        width: 50,
        height: 50,
        rotation: 0,
        styles: {
            backgroundColor: "white",
            color: "black"
        }
    });
    saveElemsData()
}

export function updateElement(elem) {
    elemsData.elements = elemsData.elements.map(e => e.id == elem.id ? { ...e, ...elem } : e);
    saveElemsData();
}

export function selectElement(id) {
    elemsData.selectedElementId = id;
    saveElemsData()
}

export function deSelectElement() {
    elemsData.selectedElementId = null;
    saveElemsData()
}

export function deleteElement(id) {
    elemsData.elements = elemsData.elements.filter(e => e.id != id)
    elemsData.selectedElementId = null
    saveElemsData()
}

export function setName(id, name) {
    elemsData.elements = elemsData.elements.map(e => e.id == id ? { ...e, name } : e);
    saveElemsData()
}

function getElementIndexById(id) {
    return elemsData.elements.findIndex(e => e.id === id);
}

export function moveUp(id) {
    let idx = getElementIndexById(id);
    let newElements = elemsData.elements;
    if (idx === 0) return;
    [newElements[idx - 1], newElements[idx]] = [newElements[idx], newElements[idx - 1]];
    elemsData.elements = newElements;
    saveElemsData();
}

export function moveDown(id) {
    let idx = getElementIndexById(id);
    let newElements = elemsData.elements;
    if (idx >= newElements.length - 1) return; // Already at the bottom
    [newElements[idx + 1], newElements[idx]] = [newElements[idx], newElements[idx + 1]];
    elemsData.elements = newElements;
    saveElemsData();
}

export default elemsData;

