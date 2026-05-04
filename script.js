const URL = "./my_model/";

let model, webcam, labelContainer, maxPredictions;

// botão
document.getElementById("start-btn").addEventListener("click", init);

async function init() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    // carrega modelo
    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    // webcam
    const flip = true;
    webcam = new tmImage.Webcam(300, 300, flip);
    await webcam.setup();
    await webcam.play();
    window.requestAnimationFrame(loop);

    // adiciona webcam na tela
    document.getElementById("webcam-container").innerHTML = "";
    document.getElementById("webcam-container").appendChild(webcam.canvas);

    // labels
    labelContainer = document.getElementById("label-container");
    labelContainer.innerHTML = "";

    for (let i = 0; i < maxPredictions; i++) {
        labelContainer.appendChild(document.createElement("div"));
    }
}

async function loop() {
    webcam.update();
    await predict();
    window.requestAnimationFrame(loop);
}

async function predict() {
    const prediction = await model.predict(webcam.canvas);

    for (let i = 0; i < maxPredictions; i++) {
        const classe = prediction[i].className;
        const prob = prediction[i].probability.toFixed(2);

        labelContainer.childNodes[i].innerHTML =
            `${classe}: ${prob}`;
    }
}