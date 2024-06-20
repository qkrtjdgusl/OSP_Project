const URL = "https://teachablemachine.withgoogle.com/models/XQHon85BG/";

let model, maxPredictions;

// 이미지 업로드 시 모델 초기화 및 예측 실행
async function initAndPredict(input) {
  if (!model) {
    await initModel();
  }
  if (model) {
    loadImageToCanvas(input);
  }
}

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
    // alert("모델을 로드하는 중 오류가 발생했습니다. 모델 URL을 확인하세요."); // 알림 제거
  }
}

// 예측 실행
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
      document.getElementById("progress-container").style.display = "block"; // Show progress bars
      predict(canvas); // 이미지 예측 실행
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(input.files[0]);
}

// 이미지 제거
function removeUpload() {
  document.querySelector(".file-upload-content").style.display = "none";
  document.querySelector(".file-upload-input").value = null;
  document.getElementById("uploaded-image").src = "#";
  document.getElementById("progress-container").style.display = "none"; // Hide progress bars
  document.getElementById("prediction-result").innerHTML = ""; // Clear prediction result
}
