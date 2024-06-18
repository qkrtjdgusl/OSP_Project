const URL = "https://teachablemachine.withgoogle.com/models/XQHon85BG/";

let model, webcam, labelContainer, maxPredictions, animationFrameId;

async function init() {
  const modelURL = URL + "model.json";
  const metadataURL = URL + "metadata.json";

  try {
    // Load the model and metadata
    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    // Setup the webcam
    const flip = true;
    webcam = new tmImage.Webcam(400, 400, flip);
    await webcam.setup();
    await webcam.play();
    window.requestAnimationFrame(loop);

    // Append webcam canvas to DOM
    document.getElementById("webcam-container").appendChild(webcam.canvas);
    labelContainer = document.getElementById("label-container");
    for (let i = 0; i < maxPredictions; i++) {
      labelContainer.appendChild(document.createElement("div"));
    }

    console.log("Model loaded successfully");
  } catch (error) {
    console.error("Error loading the model:", error);
  }
}

async function loop() {
  if (webcam) {
    webcam.update();
    await predict(webcam.canvas);
    animationFrameId = window.requestAnimationFrame(loop);
  }
}

async function predict(imageElement) {
  if (!model) {
    console.error("Model not loaded");
    return;
  }
  const prediction = await model.predict(imageElement);
  for (let i = 0; i < maxPredictions; i++) {
    const classPrediction =
      prediction[i].className + ": " + prediction[i].probability.toFixed(2);
    labelContainer.childNodes[i].innerHTML = classPrediction;
  }

  displayResult(prediction);
}

function displayResult(prediction) {
  const result = document.getElementById("prediction-result");
  const autismPrediction = prediction.find((p) => p.className === "Autism");
  if (autismPrediction && autismPrediction.probability > 0.5) {
    result.innerHTML = "자폐 스펙트럼이 의심됩니다";
  } else {
    result.innerHTML = "자폐 스펙트럼이 의심되지 않습니다";
  }
}

function loadImage(event) {
  if (!model) {
    console.error("Model not loaded");
    return;
  }
  const canvas = document.getElementById("uploadCanvas");
  const ctx = canvas.getContext("2d");
  const reader = new FileReader();
  reader.onload = function () {
    const img = new Image();
    img.onload = function () {
      canvas.width = 224; // Image size required by the model
      canvas.height = 224;
      ctx.drawImage(img, 0, 0, 224, 224);
      predict(canvas);
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(event.target.files[0]);
}

function stop() {
  if (webcam) {
    webcam.stop();
  }
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }
  const webcamContainer = document.getElementById("webcam-container");
  while (webcamContainer.firstChild) {
    webcamContainer.removeChild(webcamContainer.firstChild);
  }
  if (labelContainer) {
    while (labelContainer.firstChild) {
      labelContainer.removeChild(labelContainer.firstChild);
    }
  }
}
