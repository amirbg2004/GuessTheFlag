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
var questionsIndex = 0;

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
      alert("Your time is up! Please refresh your page.");
    }
  }, 1000);
};

let fetchData = (difficulty) => {
  let jsonURL = null;
  switch (difficulty) {
    case "easy":
      jsonURL = "easy.json";
      numberOfQuestions = 10;
      break;
    case "medium":
      jsonURL = "medium.json";
      numberOfQuestions = 15;
      break;
    case "hard":
      jsonURL = "hard.json";
      numberOfQuestions = 15;
      break;
  }
  fetch(jsonURL)
    .then((response) => {
      if (!response.ok) throw new Error("Error fetching flags.json");
      return response.json();
    })
    .then((data) => {
      questions = data;
      startGame(0);
    })
    .catch((error) => {
      console.error(error);
    });
};

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

  console.log(optionButtons);

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

let endGame = () => {
  alert(`You finished on time and scored ${score} / ${numberOfQuestions}`);
  window.reload();
};
