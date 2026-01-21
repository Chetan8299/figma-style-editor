const elemsData = JSON.parse(localStorage.getItem("elemsData")) ?? {
    elements: [],
    selectedElementId: null,
    nextId: 1
};

function saveElemsData() {
    localStorage.setItem("elemsData", JSON.stringify(elemsData));
}

console.log(JSON.parse(localStorage.getItem("elemsData")))
export function addElement(type) {
    elemsData.elements.push({
        id: elemsData.nextId++,
        type,
        x: 0,
        y: 0,
        styles: {
            width: "50px",
            height: "50px",
            zIndex: elemsData.elements.length + 1,
            backgroundColor: "white",
            color: "black"
        }
    });
    saveElemsData()
}

export function updateElement(elem) {
    elemsData.elements = elemsData.elements.map(e => e.id == elem.id ? { ...e, ...elem } : e);
}

export function selectElement(id) {
    elemsData.selectedElementId = id;
    saveElemsData()
}

export function deSelectElement() {
    elemsData.selectedElementId = null;
    saveElemsData()
}
export default elemsData;

