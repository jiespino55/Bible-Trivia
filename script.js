const libraryBtn = document.getElementById("libraryBtn");
const questionLibrary = document.getElementById("questionLibrary");
const librarySection = document.getElementById("librarySection");
const categoryFilter = document.getElementById("categoryFilter");
const startBtn = document.getElementById("startBtn");
const gameSetup = document.getElementById("gameSetup");
const categoryCheckboxes = document.getElementById("categoryCheckboxes");
const beginGameBtn = document.getElementById("beginGameBtn");
const hostView = document.getElementById("hostView");
const questionNumber = document.getElementById("questionNumber");
const questionCategory = document.getElementById("questionCategory");
const currentQuestion = document.getElementById("currentQuestion");
const currentAnswer = document.getElementById("currentAnswer");
const currentReference = document.getElementById("currentReference");
const previousBtn = document.getElementById("previousBtn");
const nextBtn = document.getElementById("nextBtn");
const endGameBtn = document.getElementById("endGameBtn");

let gameQuestions = [];
let currentQuestionIndex = 0;

let questions = [];

async function loadQuestions() {

    const files = [
        "data/oldTestament.json",
        "data/newTestament.json",
        "data/finishVerse.json",
        "data/bibleChar.json",
        "data/biblicalNum.json",
        "data/biblicalWordsMeanings.json",
        "data/theologyDoctrinesTerms.json",
        "data/realOrAi.json"
    ];

    const responses = await Promise.all(
        files.map(file => fetch(file))
    );

    responses.forEach(function(response) {
        console.log(response.url, response.status);
    });


    const questionSets = await Promise.all(
        responses.map(response => response.json())
    );

    questions = questionSets.flat();

    const categories = [...new Set(questions.map(q => q.category))];

    categories.forEach(function(category) {
        const option = document.createElement("option");

        option.value = category;
        option.textContent = category;

        categoryFilter.appendChild(option);
    });
}

function displayQuestions() {
    questionLibrary.innerHTML = "";

    const selectedCategory = categoryFilter.value;

    const filteredQuestions = questions.filter(function(question) {
        return selectedCategory === "all" ||
               question.category === selectedCategory;
    });

    filteredQuestions.forEach(function(question) {
        questionLibrary.innerHTML += `
            <div class="question-card">
                <h3>${question.question}</h3>
                <p><strong>Category:</strong> ${question.category}</p>
                <p><strong>Answer:</strong> ${question.answer}</p>
                <p><strong>Reference:</strong> ${question.reference}</p>
            </div>
        `;
    });
}

function displayCategoryCheckboxes() {
    categoryCheckboxes.innerHTML = "";

    const categories = [...new Set(questions.map(q => q.category))];

    categories.forEach(function(category) {
        const label = document.createElement("label");
        const checkbox = document.createElement("input");

        checkbox.type = "checkbox";
        checkbox.value = category;
        checkbox.checked = true;

        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(category));

        categoryCheckboxes.appendChild(label);
    });
}

function shuffleQuestions(questionPool) {
    const shuffled = [...questionPool];

    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));

        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled;
}

function displayCurrentQuestion() {
    const question = gameQuestions[currentQuestionIndex];

    questionNumber.textContent =
        `Question ${currentQuestionIndex + 1} of ${gameQuestions.length}`;

    questionCategory.textContent = question.category;
    currentQuestion.textContent = question.question;
    currentAnswer.textContent = `Answer: ${question.answer}`;
    currentReference.textContent = question.reference;

    previousBtn.disabled = currentQuestionIndex === 0;

    nextBtn.disabled =
        currentQuestionIndex === gameQuestions.length - 1;
}

function saveGame() {
    const gameState = {
        questions: gameQuestions,
        index: currentQuestionIndex
    };

    localStorage.setItem("bibleTriviaGame", JSON.stringify(gameState));
}

function restoreGame() {
    const savedGame = localStorage.getItem("bibleTriviaGame");

    if (savedGame) {
        const gameState = JSON.parse(savedGame);

        if (
            Array.isArray(gameState.questions) &&
            gameState.questions.length > 0 &&
            Number.isInteger(gameState.index) &&
            gameState.index >= 0 &&
            gameState.index < gameState.questions.length
        ) {
            gameQuestions = gameState.questions;
            currentQuestionIndex = gameState.index;

            librarySection.style.display = "none";
            gameSetup.style.display = "none";
            hostView.style.display = "block";

            displayCurrentQuestion();
        }
    }
}

beginGameBtn.addEventListener("click", function() {
    const selectedCategories = Array.from(
        categoryCheckboxes.querySelectorAll("input:checked")
    ).map(checkbox => checkbox.value);

    if (selectedCategories.length === 0) {
        alert("Please select at least one category.");
        return;
    }

    const questionPool = questions.filter(function(question) {
        return selectedCategories.includes(question.category);
    });

    gameQuestions = shuffleQuestions(questionPool);
    currentQuestionIndex = 0;

    console.log("Selected categories:", selectedCategories);
    console.log("Randomized questions:", gameQuestions);

    gameSetup.style.display = "none";
    hostView.style.display = "block";

    displayCurrentQuestion();
    saveGame();
});

startBtn.addEventListener("click", function() {
    librarySection.style.display = "none";
    gameSetup.style.display = "block";

    displayCategoryCheckboxes();
});

libraryBtn.addEventListener("click", function() {
    gameSetup.style.display = "none";
    librarySection.style.display = "block";

    displayQuestions();
});

nextBtn.addEventListener("click", function() {
    if (currentQuestionIndex < gameQuestions.length - 1) {
        currentQuestionIndex++;
        displayCurrentQuestion();
        saveGame();
    }
});

previousBtn.addEventListener("click", function() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        displayCurrentQuestion();
        saveGame();
    }
});

endGameBtn.addEventListener("click", function() {
    const confirmEnd = confirm("Are you sure you want to end this game?");

    if (confirmEnd) {
        localStorage.removeItem("bibleTriviaGame");

        hostView.style.display = "none";
        gameSetup.style.display = "block";

        gameQuestions = [];
        currentQuestionIndex = 0;
    }
});

categoryFilter.addEventListener("change", displayQuestions);

loadQuestions();
restoreGame();