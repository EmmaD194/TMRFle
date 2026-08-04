const MAX_GUESSES = 6;

let currentDance = null;
let revealedClues = 1;
let guessesUsed = 0;
let gameFinished = false;
let cluePool = [];
let dances = [];

let movementAnswer = [];
let movementChoices = [];
let selectedMovements = [];

let movementAttempts = 0;
const MAX_MOVEMENT_ATTEMPTS = 3;

let movementResults = [];

let selectedTmrf = "all";

let bodyAnswer = [];
let bodyChoices = [];
let selectedBody = [];

let bodyCompleted = false;
let currentBodyIndex = null;
let currentBarsMovement = null;

let correctBarsAnswer = null;

const tmrfButtons =
    document.querySelectorAll(".tmrfButton");

tmrfButtons.forEach(button=>{

    button.addEventListener("click",()=>{

        tmrfButtons.forEach(b=>
            b.classList.remove("selected")
        );

        button.classList.add("selected");

        selectedTmrf = button.dataset.value;

        document.querySelector("#tmrfLevel").textContent =
        selectedTmrf === "all" ? "2–4" : selectedTmrf;

    });

});

async function loadDances() {

    const response = await fetch("dances.json");

    dances = await response.json();

    document.querySelector("#gameArea").hidden = true;

    

}

loadDances();


function buildClues() {

    cluePool = [];

    cluePool.push(`Timing: ${currentDance.timing}`);
    if(currentDance.dancers != null)
    cluePool.push(`${currentDance.dancers} dancers`);
    cluePool.push(currentDance.progressive ? "Progressive dance" : "Not progressive");

    if(currentDance.figures != null)
        cluePool.push(`${currentDance.figures} figures`);

    if(currentDance.totalBars != null)
        cluePool.push(`${currentDance.totalBars} bars`);

    if(currentDance.bodyBars != null)
        cluePool.push(`Body = ${currentDance.bodyBars} bars`);

    if(currentDance.numberOfMovements != null)
        cluePool.push(`${currentDance.numberOfMovements} movements`);

    if(currentDance.specificTune)
        cluePool.push(`Tune: ${currentDance.specificTune}`);

    currentDance.movements.forEach(m =>
    cluePool.push(`Movement: ${m.name}`)
);

    (currentDance.extraClues ?? []).forEach(c =>
    cluePool.push(c)
);

    cluePool = cluePool.sort(() => Math.random() - 0.5);
}

function getRandomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function startGame() {

  document.querySelector("#gameArea").hidden = false;

document.querySelector("#startGameButton").hidden = true;
document.querySelector("#study-mode").hidden = true;
  document.querySelector("#guess-section").hidden = false;

document.querySelector("#movement-game").hidden = true;
document.querySelector("#body-game").hidden = true;
document.querySelector("#bars-game").hidden = true;
document.querySelector("#flashcard").hidden = true;

document.querySelector("#resultCard").hidden = true;
document.querySelector("#new-game-button").hidden = true;



  document
    .querySelector("#bars-game")
    .hidden = true;;

  document
    .querySelector("#startGameButton")
    .hidden = true;

  console.trace("START GAME");

  let availableDances;

if(selectedTmrf=="all"){

    availableDances = dances;

}
else{

    availableDances = dances.filter(
        dance => dance.tmrf == selectedTmrf
    );

}

currentDance = getRandomItem(availableDances);

document.querySelector("#tmrfLevel").textContent =
    selectedTmrf == "all"
    ? "1–4"
    : selectedTmrf;

    revealedClues = 1;
    guessesUsed = 0;
    gameFinished = false;

    buildClues();
    renderClues();

  document.querySelector("#resultCard").hidden = true;;
  document.querySelector("#guess-input").value = "";
  document.querySelector("#guess-history").innerHTML = "";
  document.querySelector("#message").textContent = "";

  document.querySelector("#flashcard").hidden = true;
  document.querySelector("#flashcard-answer").hidden = true;

  document.querySelector("#guess-section").hidden = false;

  renderClues();
}

function renderClues(){

    const clueList = document.querySelector("#clue-list");

    clueList.innerHTML="";

    cluePool
        .slice(0,revealedClues)
        .forEach(clue=>{

            const li=document.createElement("li");

            li.textContent=clue;

            clueList.appendChild(li);

        });

}

const guessInput = document.querySelector("#guess-input");
const suggestionsBox = document.querySelector("#suggestions");

guessInput.addEventListener("input", showSuggestions);

function normalise(text){

    return text
        .toLowerCase()
        .replace(/\beight\b/g, "8")
        .replace(/\bfour\b/g, "4")
        .replace(/\bsix\b/g, "6")
        .replace(/\btwo\b/g, "2")
        .replace(/\bthree\b/g, "3")
        .replace(/\bfive\b/g, "5")
        .replace(/\bseven\b/g, "7");

}

function showSuggestions() {
  const searchText = normalise(guessInput.value.trim());
  suggestionsBox.innerHTML = "";

  if (!searchText) {
    return;
  }

  const matches = dances
    .filter((dance) =>
      normalise(dance.name).includes(searchText)
    )
    .slice(0, 6);

  matches.forEach((dance) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = dance.name;

    button.addEventListener("click", () => {
      guessInput.value = dance.name;
      suggestionsBox.innerHTML = "";
      guessInput.focus();
    });

    suggestionsBox.appendChild(button);
  });
}

function findDanceByName(name){

    name = normalise(name.trim());

    return dances.find(dance=>{

        if(normalise(dance.name)==name)
            return true;

        return dance.aliases.some(alias=>
            normalise(alias)==name
        );

    });

}

document
  .querySelector("#guess-button")
  .addEventListener("click", submitGuess);

document
    .querySelector("#startGameButton")
    .addEventListener("click", startGame);

guessInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    submitGuess();
  }
});

function submitGuess() {
  if (gameFinished) {
    return;
  }

  const guessedDance = findDanceByName(guessInput.value);

  if (!guessedDance) {
    document.querySelector("#message").textContent =
      "Choose a valid dance name.";
    return;
  }

  guessesUsed += 1;
  addGuessToHistory(guessedDance.name);

  if (guessedDance.id === currentDance.id) {
    winGame();
    return;
  }

  if (guessesUsed >= MAX_GUESSES) {
    loseGame();
    return;
  }

  if(revealedClues < cluePool.length) {
    revealedClues += 1;
    renderClues();
  }

  document.querySelector("#message").textContent =
    `${MAX_GUESSES - guessesUsed} guesses remaining.`;

  guessInput.value = "";
  suggestionsBox.innerHTML = "";
  guessInput.focus();
}

function addGuessToHistory(name) {
  const history = document.querySelector("#guess-history");
  const item = document.createElement("p");

  item.textContent = `${guessesUsed}. ${name}`;
  history.appendChild(item);
}

function winGame() {

    gameFinished = true;

    document.querySelector("#guess-section").hidden = true;

    document.querySelector("#resultCard").hidden = false;;

    document.querySelector("#resultTitle").textContent =
        "🎉 Correct!";

    document.querySelector("#resultText").textContent =
        `The answer was "${currentDance.name}". You got it in ${guessesUsed} guess${guessesUsed === 1 ? "" : "es"}!`;

        
   // showFlashcard();
   document.querySelector("#movement-game").hidden = false;

startMovementGame();

}

function startMovementGame(){

  movementAttempts = 0;

document.querySelector("#movementMessage").textContent = "";

  bodyCompleted = false;

    const bodyGame = document.querySelector("#body-game");

/*if (currentDance.body && currentDance.body.length > 0) {
    bodyGame.style.display = "none";
} else {
    bodyGame.style.display = "none";
}*/

bodyGame.hidden = true;

    movementAnswer=[...currentDance.orderOfMovements];

    bodyAnswer = currentDance.body
    ? [...currentDance.body]
    : [];

   

   

    movementChoices=[...movementAnswer]
        .sort(()=>Math.random()-0.5);

    selectedMovements=[];

    renderMovementGame();

}

function renderMovementGame(){

    const selectedDiv =
        document.querySelector("#selectedMovements");

    const choicesDiv =
        document.querySelector("#movementChoices");

    selectedDiv.innerHTML="";
    choicesDiv.innerHTML="";

    // Selected movements

    selectedMovements.forEach((movement, index) => {

    const chip = document.createElement("button");
chip.type = "button";
chip.textContent = `${index + 1}. ${movement}`;

    chip.className="movementChip selectedChip";

    if(movementResults[index]=="correct")
        chip.classList.add("correctChip");

    if(movementResults[index]=="partial")
        chip.classList.add("partialChip");

    if(movementResults[index]=="wrong")
        chip.classList.add("wrongChip");

        chip.addEventListener("click",()=>{

    // Remove it from the selected list
    const removed = selectedMovements.splice(index,1)[0];

    // Put it back into the available choices
    movementChoices.push(removed);

    renderMovementGame();

});

        selectedDiv.appendChild(chip);

    });

    // Remaining choices

    movementChoices.forEach((movement, index) => {

        const chip = document.createElement("button");
chip.type = "button";
chip.textContent = movement;

        chip.className="movementChip";

        chip.addEventListener("click",()=>{

            if(movement == "Body"){

    if(bodyCompleted){

      bodyCompleted = true;


        selectedMovements.push("Body");
        movementChoices.splice(index,1);

        renderMovementGame();

    }else{

        startBodyGame(index);

    }

    return;

}

selectedMovements.push(movement);

movementChoices.splice(index,1);

renderMovementGame();

        });

        choicesDiv.appendChild(chip);

    });

}

document
    .querySelector("#checkMovementOrder")
    .addEventListener("click",checkMovementOrder);

    function startBodyGame(index){

      document.querySelector("#bodyMessage").textContent =
    "This dance contains a repeated Body. Complete it once, then return to finish building the dance.";

document.querySelector("#bodyMessage").className =
    "gameMessage";

    bodyChoices=[...bodyAnswer]
        .sort(()=>Math.random()-0.5);

    selectedBody=[];

    currentBodyIndex=index;

    const bodyGame = document.querySelector("#body-game");

bodyGame.style.display = "block";
bodyGame.hidden = false;;

    renderBodyGame();

}

function renderBodyGame(){

    const selected=
        document.querySelector("#selectedBody");

    const choices=
        document.querySelector("#bodyChoices");

    selected.innerHTML="";
    choices.innerHTML="";

    selectedBody.forEach((movement, index) => {

        const chip=document.createElement("button");

        chip.type="button";

        chip.className="movementChip selectedChip";

        chip.textContent=movement;

        chip.onclick=()=>{

            const removed=
                selectedBody.splice(index,1)[0];

            bodyChoices.push(removed);

            renderBodyGame();

        };

        selected.appendChild(chip);

    });

    bodyChoices.forEach((movement, index) => {

        const chip=document.createElement("button");

        chip.type="button";

        chip.className="movementChip";

        chip.textContent=movement;

        chip.onclick=()=>{

            selectedBody.push(movement);

            bodyChoices.splice(index,1);

            renderBodyGame();

        };

        choices.appendChild(chip);

    });

}

document
.querySelector("#checkBody")
.addEventListener("click",()=>{

    if(JSON.stringify(selectedBody)
        != JSON.stringify(bodyAnswer)){

       const msg = document.querySelector("#bodyMessage");

msg.textContent = "Not quite. Try again.";
msg.className = "gameMessage error";

        return;

    }

    const bodyGame = document.querySelector("#body-game");

//bodyGame.style.display = "none";
//bodyGame.hidden = true;;

const msg = document.querySelector("#bodyMessage");

msg.textContent =
    "🎉 Body complete! Scroll back up to finish building the dance.";

msg.className = "gameMessage success";



document.querySelector("#movement-game").scrollIntoView({
    behavior:"smooth",
    block:"start"
});

bodyCompleted = true;

document.querySelector("#movement-game").scrollIntoView({
    behavior: "smooth",
    block: "start"
});
    /*selectedMovements.push("Body");

    movementChoices.splice(currentBodyIndex,1);

    renderMovementGame();*/

});

function movementGameOver(){

    gameFinished = true;

    document.querySelector("#movement-game").hidden = true;

    document.querySelector("#resultCard").hidden = false;

    document.querySelector("#resultTitle").textContent =
        "❌ Game Over";

    document.querySelector("#resultText").innerHTML =
    `<p>You used all ${MAX_MOVEMENT_ATTEMPTS} movement attempts.</p>
     <p><strong>Correct order:</strong></p>`;

     const resultText = document.querySelector("#resultText");

const list = document.createElement("ol");

movementAnswer.forEach(movement => {

    const item = document.createElement("li");

    item.textContent = movement;

    list.appendChild(item);

});

resultText.appendChild(list);

    document.querySelector("#new-game-button").hidden = false;

    document.querySelector("#resultCard").scrollIntoView({
        behavior:"smooth"
    });

}

function checkMovementOrder(){

    if(selectedMovements.length != movementAnswer.length){

        const msg = document.querySelector("#movementMessage");

        msg.textContent = "Choose all the movements first.";
        msg.className = "gameMessage error";

        return;

    }

    // Count this attempt
    movementAttempts++;

    movementResults = [];

    let correct = true;

    for(let i = 0; i < movementAnswer.length; i++){

        if(selectedMovements[i] === movementAnswer[i]){

            movementResults.push("correct");

        }
        else if(movementAnswer.includes(selectedMovements[i])){

            movementResults.push("partial");
            correct = false;

        }
        else{

            movementResults.push("wrong");
            correct = false;

        }

    }

    renderMovementGame();

    const msg = document.querySelector("#movementMessage");

    if(correct){

        msg.textContent =
            "🎉 Perfect! Scroll down to the Bars Challenge.";

        msg.className = "gameMessage success";

        showBarsQuestion();

        document.querySelector("#bars-game").scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

        return;

    }

    // Wrong answer

    const remaining = MAX_MOVEMENT_ATTEMPTS - movementAttempts;

    if(remaining > 0){

        msg.textContent =
            `❌ Not quite. ${remaining} attempt${remaining === 1 ? "" : "s"} remaining.`;

        msg.className = "gameMessage error";

    }
    else{

        movementGameOver();

    }

}

function showFlashcard() {
  if (currentDance.flashcards.length === 0) {
    document.querySelector("#flashcard-question").textContent =
        "No flashcards have been added for this dance yet.";
    document.querySelector("#flashcard").hidden = false;
    return;
}

const card=getRandomItem(currentDance.flashcards);

  document.querySelector("#flashcard-question").textContent =
    card.question;

  document.querySelector("#flashcard-answer").textContent =
    card.answer;

  document.querySelector("#flashcard-answer").hidden = true;
  document.querySelector("#flashcard").hidden = false;
}

document
  .querySelector("#reveal-answer-button")
  .addEventListener("click", () => {
    document.querySelector("#flashcard-answer").hidden = false;
  });

  document
  .querySelector("#new-game-button")
  .addEventListener("click", showStartScreen);

  function showStartScreen(){

    document.querySelector("#study-mode").hidden = false;

    document.querySelector("#startGameButton").hidden = false;

    document.querySelector("#gameArea").hidden = true;

    document.querySelector("#resultCard").hidden = true;

}

function loseGame() {

    gameFinished = true;

    document.querySelector("#guess-section").hidden = true;

    document.querySelector("#resultCard").hidden = false;;

    document.querySelector("#resultTitle").textContent =
        "❌ Game Over";

    document.querySelector("#resultText").textContent =
        `The correct answer was "${currentDance.name}".`;

    document.querySelector("#new-game-button").hidden = false;

    //showFlashcard();

}

function showBarsQuestion(){

    const barMovements = currentDance.movements.filter(
    movement => movement.bars != null
);

currentBarsMovement = getRandomItem(barMovements);

    correctBarsAnswer = currentBarsMovement.bars;

    document.querySelector("#barsQuestion").textContent =
        `How many bars is "${currentBarsMovement.name}"?`;

    document
        .querySelector("#bars-game")
        .hidden = false;;

    renderBarsChoices();

}

function renderBarsChoices(){

    const choices = document.querySelector("#barsChoices");

    choices.innerHTML = "";

    let options = [4,8,16,24,32,40,48];

    options = options.filter(
        b => b == correctBarsAnswer || Math.abs(b-correctBarsAnswer)<=16
    );

    options.sort(()=>Math.random()-0.5);

    options.forEach(bar=>{

        const button=document.createElement("button");

        button.type="button";

        button.textContent=bar;

        button.onclick=()=>checkBarsAnswer(bar);

        choices.appendChild(button);

    });

}

function checkBarsAnswer(answer){

    if(answer==correctBarsAnswer){

        const msg = document.querySelector("#barsMessage");

msg.textContent = "🎉 Correct!";
msg.className = "gameMessage success";

setTimeout(() => {

    document.querySelector("#bars-game").hidden = true;

    document.querySelector("#barsMessage").textContent =
    "🏆 Dance Complete!";

document.querySelector("#barsMessage").className =
    "gameMessage success";

document.querySelector("#new-game-button").hidden = false;

document.querySelector("#resultCard").scrollIntoView({
    behavior:"smooth"
});

},1000);

       

    }
    else{

        alert("Not quite!");

    }

}


if ("serviceWorker" in navigator) {

    navigator.serviceWorker.register("sw.js");

}
