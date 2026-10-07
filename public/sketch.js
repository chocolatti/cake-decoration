let socket = io();

let selectedDecoration = "";

let decorations = document.querySelectorAll(".decoration");

let cake = document.querySelector("#cake");

decorations.forEach((decoration) => {
    decoration.addEventListener("dragstart", () => {
        selectedDecoration = decoration.getAttribute("src");
        });
});

cake.addEventListener("dragover", (event) => {
    event.preventDefault();
});

cake.addEventListener("drop", (event) => {
    event.preventDefault ();
    let rect = cake.getBoundingClientRect();
    let x = ((event.clientX - rect.left) / rect.width) *100;
    let y = ((event.clientY - rect.top) / rect.height) *100;
    console.log(selectedDecoration);
    socket.emit("decoration", {
        type: selectedDecoration,
        x: x,
        y: y
    });
});

socket.on("decorationResponse", (arg) => {
    let image = document.createElement ("img");
    image.src = arg.type;
    image.classList.add("placed-decoration");
    console.log(arg);
    image.style.left = arg.x + "%";
    image.style.top = arg.y + "%";
    
    cake.appendChild(image);
});
