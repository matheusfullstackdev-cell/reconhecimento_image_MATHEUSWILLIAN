const URL = "./my_model/";

let model, webcam, labelContainer, maxPredictions;
let isRunning = false;

// Elementos DOM
const startBtn = document.getElementById("start-btn");
const stopBtn = document.getElementById("stop-btn");
const loadingDiv = document.getElementById("loading");
const errorDiv = document.getElementById("error-message");
const webcamContainer = document.getElementById("webcam-container");

// Eventos
startBtn.addEventListener("click", startRecognition);
stopBtn.addEventListener("click", stopRecognition);

async function startRecognition() {
    try {
        showLoading(true);
        hideError();

        const modelURL = URL + "model.json";
        const metadataURL = URL + "metadata.json";

        // Carrega modelo
        model = await tmImage.load(modelURL, metadataURL);
        maxPredictions = model.getTotalClasses();

        // Webcam
        const flip = true;
        webcam = new tmImage.Webcam(400, 400, flip);
        await webcam.setup();
        await webcam.play();

        isRunning = true;
        startBtn.disabled = true;
        stopBtn.disabled = false;

        // Adiciona webcam na tela
        webcamContainer.innerHTML = "";
        webcamContainer.appendChild(webcam.canvas);

        // Labels
        labelContainer = document.getElementById("label-container");
        labelContainer.innerHTML = "";

        for (let i = 0; i < maxPredictions; i++) {
            const div = document.createElement("div");
            div.className = "prediction-item";
            labelContainer.appendChild(div);
        }

        showLoading(false);
        window.requestAnimationFrame(loop);

    } catch (error) {
        console.error("Erro ao iniciar reconhecimento:", error);
        showError("Erro ao carregar modelo ou acessar câmera. Verifique se o modelo existe e se a câmera está disponível.");
        showLoading(false);
    }
}

function stopRecognition() {
    if (webcam) {
        webcam.stop();
        isRunning = false;
    }
    startBtn.disabled = false;
    stopBtn.disabled = true;
    webcamContainer.innerHTML = "";
    labelContainer.innerHTML = "";
}

async function loop() {
    if (!isRunning) return;

    webcam.update();
    await predict();
    window.requestAnimationFrame(loop);
}

async function predict() {
    if (!model || !isRunning) return;

    try {
        const prediction = await model.predict(webcam.canvas);

        for (let i = 0; i < maxPredictions; i++) {
            const classe = prediction[i].className;
            const prob = prediction[i].probability;
            const probPercent = (prob * 100).toFixed(1);

            const div = labelContainer.childNodes[i];
            div.innerHTML = `
                <span class="class-name">${classe}</span>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${probPercent}%"></div>
                </div>
                <span class="probability">${probPercent}%</span>
            `;

            // Destaque para alta confiança
            if (prob > 0.8) {
                div.classList.add("high-confidence");
            } else {
                div.classList.remove("high-confidence");
            }
        }
    } catch (error) {
        console.error("Erro na predição:", error);
        showError("Erro durante o reconhecimento. Tente reiniciar.");
    }
}

function showLoading(show) {
    loadingDiv.classList.toggle("hidden", !show);
}

function showError(message) {
    errorDiv.textContent = message;
    errorDiv.classList.remove("hidden");
}

function hideError() {
    errorDiv.classList.add("hidden");
}