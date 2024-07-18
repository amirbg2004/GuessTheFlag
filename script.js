const difficultyButtons = document.querySelectorAll(".difficulty button");
const difficultyDiv = document.querySelector(".difficulty");
const gameTitle = document.querySelector("h1");
const containerDiv = document.querySelector(".container");
const selectDifficulty = document.querySelector("h2");

let timeLeft = 60;
var score = 0;
var numberOfQuestions = 0;
let selected = true;

let questions = [];

difficultyButtons.forEach((button) => {
  button.addEventListener("click", (event) => {
    selectDifficulty.parentNode.removeChild(selectDifficulty);
    var paragraph = document.querySelector("p");
    paragraph.parentNode.removeChild(paragraph);

    difficultyButtons.forEach((button) => {
      button.parentNode.removeChild(button);
    });

    difficultyDiv.parentNode.removeChild(difficultyDiv);

    fetchData(event.target.dataset.filter);
  });
});

let startCountdown = (div) => {
  setInterval(() => {
    timeLeft--;
    div.textContent = `Time Left: ${timeLeft} seconds`;

    if (timeLeft <= 0) {
      clearInterval(startCountdown);
      div.textContent = "Your time is up ❗❗";
      endGameOnTime();
    }
  }, 1000);
};

let fetchData = (difficulty) => {
  let jsonURL = null;
  switch (difficulty) {
    case "easy":
      jsonURL = "easy.json";
      break;
    case "medium":
      jsonURL = "medium.json";
      break;
    case "hard":
      jsonURL = "hard.json";
      break;
  }
  fetch(jsonURL)
    .then((response) => {
      if (!response.ok) throw new Error("Error fetching flags.json");
      return response.json();
    })
    .then((data) => {
      questions = data;
      numberOfQuestions = questions.length;
      shuffleQuestionsRandomly(questions, numberOfQuestions);
      startGame(0);
    })
    .catch((error) => {
      console.error(error);
    });
};

function shuffleQuestionsRandomly(questions, size) {
  for (let i = size - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [questions[i], questions[j]] = [questions[j], questions[i]];
  }
  return questions;
}

let startGame = (currentIndex) => {
  if (questions.length === 0) {
    console.error("Error");
    return;
  }
  let flagImageContainer = document.createElement("div");
  flagImageContainer.classList.add("flag-dimensions");
  let flagImage = document.createElement("img");
  flagImage.setAttribute("src", questions[currentIndex].image);
  flagImage.classList.add("flag");
  flagImageContainer.appendChild(flagImage);
  containerDiv.appendChild(flagImageContainer);

  var numberOfRemainingQuestions = numberOfQuestions - 1;
  let remainingQuestionsDiv = document.createElement("div");
  remainingQuestionsDiv.classList.add("remaining-questions");
  remainingQuestionsDiv.innerHTML = `Remaining Questions: ${numberOfRemainingQuestions}`;
  containerDiv.appendChild(remainingQuestionsDiv);

  let optionsDiv = document.createElement("div");
  optionsDiv.classList.add("options");
  optionsDiv.innerHTML = `
                              <button></button>
                              <button></button>
                              <button></button>
                              <button></button>
                          `;
  containerDiv.appendChild(optionsDiv);

  let optionButtons = document.querySelectorAll("button");

  for (let i = 0; i < optionButtons.length; i++)
    optionButtons[i].textContent = questions[currentIndex].options[i];

  let timeLeftDiv = document.createElement("div");
  timeLeftDiv.classList.add("remaining-time");
  timeLeftDiv.textContent = `Time Left: ${timeLeft} seconds`;
  containerDiv.appendChild(timeLeftDiv);

  startCountdown(timeLeftDiv);

  let nextButtonDiv = document.createElement("div");
  nextButtonDiv.classList.add("next-button");
  nextButtonDiv.textContent = "Next";
  containerDiv.appendChild(nextButtonDiv);

  optionButtons.forEach((button) => {
    button.addEventListener("click", () => {
      if (
        Array.from(optionButtons).filter((button) => button.classList.contains("correct")).length >
        0
      )
        console.log("Proceed to next question!");
      else {
        if (isCorrect(button.textContent, currentIndex)) {
          button.classList.add("correct");
          score++;
        } else {
          button.classList.add("wrong");
          optionButtons.forEach((button) => {
            if (isCorrect(button.textContent, currentIndex)) button.classList.add("correct");
          });
        }
      }
    });
  });

  let chooseAnAnswerAlertDiv = document.createElement("div");
  chooseAnAnswerAlertDiv.textContent = "Please Select Answer to Proceed!";
  chooseAnAnswerAlertDiv.classList.add("remaining-time");

  nextButtonDiv.addEventListener("click", () => {
    let nonColoredButtons = Array.from(optionButtons).filter(
      (button) => !button.classList.contains("correct") && !button.classList.contains("wrong")
    );
    if (selected === false && nonColoredButtons.length === 4) console.log("Choose An Answer!");
    else if (nonColoredButtons.length === 4) {
      selected = false;
      if (timeLeftDiv.nextSibling !== chooseAnAnswerAlertDiv)
        containerDiv.insertBefore(chooseAnAnswerAlertDiv, timeLeftDiv.nextSibling);
    } else {
      selected = true;
      if (timeLeftDiv.nextSibling === chooseAnAnswerAlertDiv)
        chooseAnAnswerAlertDiv.parentNode.removeChild(chooseAnAnswerAlertDiv);
      currentIndex++;
      numberOfRemainingQuestions--;
      if (numberOfRemainingQuestions < 0) endGame();
      else {
        displayNextQuestion(currentIndex, flagImage, optionButtons);
        remainingQuestionsDiv.textContent = `Remaining Questions: ${numberOfRemainingQuestions}`;
        optionButtons.forEach((button) => {
          button.classList.remove("correct");
          button.classList.remove("wrong");
        });
      }
    }
  });
};

let displayNextQuestion = (currentIndex, flagImage, optionButtons) => {
  flagImage.setAttribute("src", questions[currentIndex].image);
  for (let i = 0; i < 4; i++) optionButtons[i].textContent = questions[currentIndex].options[i];
};

let isCorrect = (answer, currentIndex) => answer === questions[currentIndex].flag;

function showTimePopup() {
  let popupContentDiv = document.querySelector(".popup-content");
  let playAgainButton = document.createElement("button");
  let scoreDisplay = document.getElementById("score-display");
  let timeEndedParagraph = document.getElementById("time-ended");

  timeEndedParagraph.textContent = "Your time has ended!";

  scoreDisplay.innerHTML = `Score: ${score} / ${numberOfQuestions}`;

  playAgainButton.id = "play-again";
  playAgainButton.onclick = () => removePopup();
  playAgainButton.textContent = "Play Again";
  console.log(playAgainButton);

  document.querySelector(".overlay").style.display = "block";
  document.querySelector(".popup").style.display = "block";

  popupContentDiv.appendChild(playAgainButton);

  setInterval(() => {
    addGlowEffect(playAgainButton);
    setTimeout(removeGlowEffect(playAgainButton), 1000);
  }, 1000);
}

function showEndPopup() {
  let popupContentDiv = document.querySelector(".popup-content");
  let playAgainButton = document.createElement("button");
  let scoreDisplay = document.getElementById("score-display");
  let timeEndedParagraph = document.getElementById("time-ended");

  timeEndedParagraph.textContent = "Congratulations!";

  scoreDisplay.innerHTML = `Score: ${score} / ${numberOfQuestions}`;

  playAgainButton.id = "play-again";
  playAgainButton.onclick = () => removePopup();
  playAgainButton.textContent = "Play Again";
  console.log(playAgainButton);

  document.querySelector(".overlay").style.display = "block";
  document.querySelector(".popup").style.display = "block";

  popupContentDiv.appendChild(playAgainButton);

  setInterval(() => {
    playAgainButton.classList.add("glowing");
    setTimeout(() => {
      playAgainButton.classList.remove("glowing");
    }, 3000);
  }, 4000);
}

function removeGlowEffect(button) {
  button.classList.remove("glowing");
}

function removePopup() {
  document.querySelector(".overlay").style.display = "none";
  document.querySelector(".popup").style.display = "none";
  location.reload();
}
let endGameOnTime = () => {
  clearInterval(startCountdown);
  showTimePopup();
};

let endGame = () => {
  clearInterval(startCountdown);
  showEndPopup();
};
