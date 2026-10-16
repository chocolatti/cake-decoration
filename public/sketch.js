let socket = io();

let selectedDecoration = "";

let decorations = document.querySelectorAll(".decoration");

let cake = document.querySelector("#cake");

let candle = document.querySelector("#candle");

let candleImage = document.querySelector("#candleImage");

let selectedIsBad= false;

const resetButton = document.querySelector("#reset");

decorations.forEach((decoration) => {
    decoration.addEventListener("dragstart", () => {
        selectedDecoration = decoration.getAttribute("src");
        selectedIsBad = decoration.dataset.bad === "true";

        console.log("Selected:", selectedDecoration);
        console.log("Is bad:", selectedIsBad);
        });
});

candleImage.addEventListener("dragstart", (event) => {
    selectedDecoration = candleImage.getAttribute("src");
    selectedIsBad = false;
});

cake.addEventListener("dragover", (event) => {
    event.preventDefault();
});

cake.addEventListener("drop", (event) => {
    event.preventDefault ();
    let rect = cake.getBoundingClientRect();
    let x = ((event.clientX - rect.left) / rect.width) *100;
    let y = ((event.clientY - rect.top) / rect.height) *100;
    console.log("Dropped:", selectedDecoration, selectedIsBad);
    socket.emit("decoration", {
        type: selectedDecoration,
        x: x,
        y: y,
        isBad: selectedIsBad
    });

    selectedDecoration = "";
    selectedIsBad = false;
});


socket.on ("decorations", (data) => {
    console.log("Received decorations:", data);
    displayDecorations(data);
});

function displayDecorations(data) {
    cake.querySelectorAll(".placed-decoration").forEach((image) => {
        image.remove();
    });

    data.forEach((arg) => {
        let image = document.createElement("img");
        image.src = arg.type;
        image.classList.add("placed-decoration");
        console.log(arg);
        image.style.left = arg.x + "%";
        image.style.top = arg.y + "%";
        
        cake.appendChild(image);
    });
}

socket.on("badDecorationAdded", () => {
    const cryFace = document.createElement("div");
    cryFace.textContent = "😢";
    cryFace.classList.add("cry-face");
    document.body.appendChild(cryFace);

    setTimeout(() => {
        cryFace.remove();
    }, 2000);
});

candle.addEventListener("click", () => {
    console.log("Candle clicked");
    socket.emit("toggleCandle");
});

socket.on("candleState", (isLit) => {
    if (isLit) {
        candleImage.src = "/candle.png";
        candleImage.alt = "Lit Candle";

        document.body.classList.add("dark-mode");
        showConfetti();
    } else {
        candleImage.src = "/candle-unlit.jpg";
        candleImage.alt = "Unlit Candle";
        document.body.classList.remove("dark-mode");
    }

    candle.setAttribute("aria-label", isLit ? "Extinguish the Candle" : "Light the Candle");
});

function showConfetti () {
    const colors = ["#ff4d6d", "#ffd166", "#06d6a0", "#118ab2", "#ff914d"];
    
    const cakeRect = cake.getBoundingClientRect();
    for (let i=0; i < 100; i++) {
        const confetti = document.createElement("div");
        confetti.classList.add("confetti");
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.left = (cakeRect.left + Math.random() * cakeRect.width) + "px";
        confetti.style.top = (cakeRect.top - 30 - Math.random() * 100) + "px";
        confetti.style.animationDuration = Math.random() * 3 + 2 + "s";
        confetti.style.animationDelay = Math.random() * 0.9 + "s";
        confetti.style.width = (Math.random() * 6 + 8) + "px";
        confetti.style.height = (Math.random() * 8 + 12) + "px";
        cake.appendChild(confetti);

        setTimeout(() => {
            confetti.remove();
        }, 5000);  
    }

    showPoppers();
}

function showPoppers() {
    const cakeRect = cake.getBoundingClientRect();
    const positions = [
        { left: (cakeRect.left - 20) + "px", top: (cakeRect.top + cakeRect.height * 0.4) + "px" },
        { left: (cakeRect.right - 30) + "px", top: (cakeRect.top + cakeRect.height * 0.4) + "px" },
        { left: (cakeRect.left + cakeRect.width * 0.25) + "px", top: (cakeRect.top - 40) + "px" },
        { left: (cakeRect.left + cakeRect.width * 0.7) + "px", top: (cakeRect.top - 40) + "px" }
    ];

    positions.forEach((position, index) => {
        const popper = document.createElement("div");
        popper.style.left = position.left;
        popper.style.top = position.top;

        popper.classList.add("party-popper");
        popper.textContent = "🎉";

        popper.style.animationDelay = (index * 0.15) + "s";

        cake.appendChild(popper);

        setTimeout(() => {
            popper.remove();
        }, 2000);
    });
}

resetButton.addEventListener("click", () => {
    socket.emit("resetCake");
});