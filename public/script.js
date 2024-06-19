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
    document.getElementById("progress-container").style.display = "block"; // Show progress bars
    console.log("Model loaded successfully");
  } catch (error) {
    console.error("Error loading the model:", error);
    alert("모델을 로드하는 중 오류가 발생했습니다. 모델 URL을 확인하세요.");
  }
}

// 웹캠 루프
async function loop() {
  webcam.update();
  await predict(webcam.canvas);
  window.requestAnimationFrame(loop);
}

// 웹캠으로부터 예측
async function predict(imageElement) {
  if (!model) {
    console.error("Model not loaded");
    return;
  }
  const prediction = await model.predict(imageElement);
  displayResult(prediction);
}

// 예측 결과 표시
function displayResult(prediction) {
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

  const autismBar = document.getElementById("autistic-bar");
  const nonAutismBar = document.getElementById("non-autistic-bar");

  autismBar.style.width = autismProbability * 100 + "%";
  nonAutismBar.style.width = nonAutismProbability * 100 + "%";

  autismBar.querySelector(".percentage").innerText =
    (autismProbability * 100).toFixed(0) + "%";
  nonAutismBar.querySelector(".percentage").innerText =
    (nonAutismProbability * 100).toFixed(0) + "%";

  const result = document.getElementById("prediction-result");
  if (autismProbability > 0.5) {
    result.innerHTML = "자폐 스펙트럼이 의심됩니다";
  } else {
    result.innerHTML = "자폐 스펙트럼이 의심되지 않습니다";
  }
}

// 이미지 파일을 캔버스에 로드
function loadImageToCanvas(input) {
  const canvas = document.getElementById("uploadCanvas");
  const ctx = canvas.getContext("2d");
  const reader = new FileReader();
  reader.onload = function (e) {
    const img = new Image();
    img.onload = function () {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0, img.width, img.height);
      document.getElementById("uploaded-image").src = canvas.toDataURL(); // Display the image
      document.querySelector(".file-upload-content").style.display = "block"; // Show the upload content
      predictImage(canvas);
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(input.files[0]);
}

// 예측 실행
function predictImage() {
  const canvas = document.getElementById("uploadCanvas");
  predict(canvas);
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
  const labelContainer = document.getElementById("label-container");
  while (labelContainer.firstChild) {
    labelContainer.removeChild(labelContainer.firstChild);
  }
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

// 이미지 제거
function removeUpload() {
  document.querySelector(".file-upload-content").style.display = "none";
  document.querySelector(".file-upload-input").value = null;
  document.getElementById("uploaded-image").src = "#";
}
