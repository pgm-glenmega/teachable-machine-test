const URL = "./files/";
let model, webcam, labelContainer, maxPredictions;
let resemblances = []; // Array to store the units of resemblance
let computerWins = 0;
let userWins = 0;

// Define the rules of the game
const gameRules = {
  rock: { beats: ["scissors", "lizard"] },
  paper: { beats: ["rock", "spock"] },
  scissors: { beats: ["paper", "lizard"] },
  lizard: { beats: ["paper", "spock"] },
  spock: { beats: ["rock", "scissors"] },
};

async function init() {
  // Reset wins
  computerWins = 0;
  userWins = 0;

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
  let highestProbability = 0;
  let highestProbabilityIndex = 0;

  for (let i = 0; i < maxPredictions; i++) {
    const classPrediction =
      prediction[i].className + ": " + prediction[i].probability.toFixed(2);
    labelContainer.childNodes[i].innerHTML = classPrediction;

    if (prediction[i].probability > highestProbability) {
      highestProbability = prediction[i].probability;
      highestProbabilityIndex = i;
    }
  }

  // Store the units of resemblance in the resemblances array
  resemblances = prediction.map((p) => p.probability.toFixed(2));

  // Log the outcome with the highest probability
  console.log(
    "Highest probability outcome:",
    prediction[highestProbabilityIndex].className
  );
}

// Function to randomly select one of the choices
function getRandomChoice() {
  const choices = ["rock", "paper", "scissors", "lizard", "spock"];
  const randomIndex = Math.floor(Math.random() * choices.length);
  return choices[randomIndex];
}

// Function to compare the predicted outcome with the computer's choice
function compareOutcomes(predictedOutcome, computerChoice) {
  if (predictedOutcome === computerChoice) {
    return "It's a tie!";
  } else if (gameRules[predictedOutcome].beats.includes(computerChoice)) {
    userWins++;
    return "You win!";
  } else {
    computerWins++;
    return "You lose!";
  }
}

// Function to capture a picture from the webcam and predict its outcome
async function capturePicture() {
  const prediction = await model.predict(webcam.canvas);
  let highestProbability = 0;
  let highestProbabilityIndex = 0;

  for (let i = 0; i < maxPredictions; i++) {
    if (prediction[i].probability > highestProbability) {
      highestProbability = prediction[i].probability;
      highestProbabilityIndex = i;
    }
  }

  // Get the predicted outcome
  const predictedOutcome = prediction[highestProbabilityIndex].className;

  // Get the computer's choice
  const computerChoice = getRandomChoice();

  // Compare the predicted outcome with the computer's choice
  const result = compareOutcomes(predictedOutcome, computerChoice);

  // Log the outcome with the highest probability, computer's choice, and the game result
  console.log("Highest probability outcome:", predictedOutcome);
  console.log("Computer's choice:", computerChoice);
  console.log("Game result:", result);
  console.log("Computer wins:", computerWins);
  console.log("User wins:", userWins);

  // Display the predicted outcome, computer's choice, and the game result
  labelContainer.innerHTML = `Predicted outcome: ${predictedOutcome}<br>Computer's choice: ${computerChoice}<br>Game result: ${result}<br>Computer wins: ${computerWins}<br>User wins: ${userWins}`;
}

// Function to reset the label container
function resetLabelContainer() {
  labelContainer.innerHTML = "";
}

// Add an event listener to the button for capturing the picture
document
  .getElementById("capture-button")
  .addEventListener("click", capturePicture);

// Add an event listener to the button for starting a new game
document.getElementById("start-button").addEventListener("click", init);

// Add an event listener to the button for continuing to the next game
document
  .getElementById("continue-button")
  .addEventListener("click", function () {
    resetLabelContainer();
    if (!webcam.isActive()) {
      webcam.play(); // Restart webcam if it's not active
    }
  });

// Call the init function to start the webcam and initialize the model
init();
