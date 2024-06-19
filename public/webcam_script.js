const URL = "https://teachablemachine.withgoogle.com/models/XQHon85BG/";

let model, webcam, maxPredictions;

// 모델과 웹캠 초기화
async function init() {
  const modelURL = URL + "model.json";
  const metadataURL = URL + "metadata.json";

  try {
    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    const flip = true;
    webcam = new tmImage.Webcam(400, 400, flip); // Increased webcam size
    await webcam.setup();
    await webcam.play();
    window.requestAnimationFrame(loop);

    document.getElementById("webcam-container").appendChild(webcam.canvas);
    document.getElementById("progress-container-webcam").style.display =
      "block"; // Show progress bars for webcam
    console.log("Model loaded successfully");
  } catch (error) {
    console.error("Error loading the model:", error);
    alert("모델을 로드하는 중 오류가 발생했습니다. 모델 URL을 확인하세요.");
  }
}

// 웹캠 루프
async function loop() {
  webcam.update();
  await predictWebcam(webcam.canvas);
  window.requestAnimationFrame(loop);
}

// 웹캠 예측 실행
async function predictWebcam(imageElement) {
  if (!model) {
    console.error("Model not loaded");
    return;
  }
  console.log("Predicting webcam...");
  const prediction = await model.predict(imageElement);
  console.log("Webcam prediction result:", prediction);
  displayResultWebcam(prediction);
}

// 웹캠 예측 결과 표시
function displayResultWebcam(prediction) {
  const autismPrediction = prediction.find((p) => p.className === "Autism");
  const nonAutismPrediction = prediction.find((p) => p.className !== "Autism");

  let autismProbability = autismPrediction ? autismPrediction.probability : 0;
  let nonAutismProbability = nonAutismPrediction
    ? nonAutismPrediction.probability
    : 0;

  // Adjust the non-autism probability to ensure the total is 100%
  nonAutismProbability = 1 - autismProbability;

  // Cap the displayed probability at 70%
  if (autismProbability > 0.7) {
    autismProbability = 0.7;
    nonAutismProbability = 0.3;
  }

  const autismBar = document.getElementById("autistic-bar-webcam");
  const nonAutismBar = document.getElementById("non-autistic-bar-webcam");

  autismBar.style.width = autismProbability * 100 + "%";
  nonAutismBar.style.width = nonAutismProbability * 100 + "%";

  autismBar.querySelector(".percentage").innerText =
    (autismProbability * 100).toFixed(0) + "%";
  nonAutismBar.querySelector(".percentage").innerText =
    (nonAutismProbability * 100).toFixed(0) + "%";

  const result = document.getElementById("prediction-result-webcam");
  if (autismProbability > 0.5) {
    result.innerHTML = "자폐 스펙트럼이 의심됩니다 (웹캠)";
  } else {
    result.innerHTML = "자폐 스펙트럼이 의심되지 않습니다 (웹캠)";
  }
}

// 웹캠 시작
function initWebcam() {
  init();
}

// 웹캠 중지
function stopWebcam() {
  if (webcam) {
    webcam.stop();
  }
  const webcamContainer = document.getElementById("webcam-container");
  while (webcamContainer.firstChild) {
    webcamContainer.removeChild(webcamContainer.firstChild);
  }
  const labelContainer = document.getElementById("label-container-webcam");
  while (labelContainer.firstChild) {
    labelContainer.removeChild(labelContainer.firstChild);
  }
  document.getElementById("progress-container-webcam").style.display = "none"; // Hide progress bars for webcam
}

// 모델 초기화 호출
initModel();

// 모델 초기화 함수
async function initModel() {
  const modelURL = URL + "model.json";
  const metadataURL = URL + "metadata.json";

  try {
    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();
    console.log("Model loaded successfully");
  } catch (error) {
    console.error("Error loading the model:", error);
    alert("모델을 로드하는 중 오류가 발생했습니다. 모델 URL을 확인하세요.");
  }
}
