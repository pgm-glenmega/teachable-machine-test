const URL = "./files/";

let model, webcam, labelContainer, maxPredictions;
let resemblances = []; // Array to store the units of resemblance

async function init() {
  const modelURL = URL + "model.json";
  const metadataURL = URL + "metadata.json";
  model = await tmImage.load(modelURL, metadataURL);
  maxPredictions = model.getTotalClasses();
  const flip = true;
  webcam = new tmImage.Webcam(200, 200, flip);
  await webcam.setup();
  await webcam.play();
  window.requestAnimationFrame(loop);
  document.getElementById("webcam-container").appendChild(webcam.canvas);
  labelContainer = document.getElementById("label-container");
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
    const classPrediction =
      prediction[i].className + ": " + prediction[i].probability.toFixed(2);
    labelContainer.childNodes[i].innerHTML = classPrediction;
  }
  // Store the units of resemblance in the resemblances array
  resemblances = prediction.map((p) => p.probability.toFixed(2));
}

function saveResemblance() {
  // Save the units of resemblance in local storage or perform any other action
  const resemblanceString = resemblances.join(", ");
  const message = "Resemblance saved!\n\nResemblances: " + resemblanceString;
  console.log(resemblances);
  alert(message);
}
