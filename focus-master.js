// 1. VARIABLES: Selecting HTML elements
const scoreEl = document.getElementById("score");
const streakEl = document.getElementById("streak");
const timerEl = document.getElementById("timer");
const progressBar = document.getElementById("progressBar");
const categoryEl = document.getElementById("category");
const questionTextEl = document.getElementById("questionText");
const optionsContainer = document.getElementById("optionsContainer");
const feedbackTextEl = document.getElementById("feedbackText");
const resetBtn = document.getElementById("resetBtn");

// 2. ARRAY OF OBJECTS: Educational questions
const questions = [
    { cat: "MATH QUICK REFLEX", q: "What is 15 × 6?", options: ["90", "85", "75", "95"], ans: "90" },
    { cat: "SCIENCE FACT", q: "Which planet is closest to the Sun?", options: ["Mercury", "Venus", "Mars", "Earth"], ans: "Mercury" },
    { cat: "ACADEMIC LOGIC", q: "Simplify: (40 ÷ 8) + (7 × 3)", options: ["26", "24", "28", "21"], ans: "26" },
    { cat: "GEOGRAPHY", q: "What is the capital city of Ghana?", options: ["Accra", "Kumasi", "Nairobi", "Cape Coast"], ans: "Accra" },
    { cat: "VOCABULARY", q: "What is the opposite of 'Diminish'?", options: ["Increase", "Reduce", "Fade", "Ignore"], ans: "Increase" }
];

let score = 0;
let streak = 0;
let timeLeft = 15;
let timerInterval = null;
let currentIndex = 0;

// 3. FUNCTION: Countdown timer
function startTimer() {
    clearInterval(timerInterval);
    timeLeft = 15;
    timerEl.textContent = `${timeLeft}s`;
    progressBar.style.width = "100%";

    timerInterval = setInterval(function() {
        timeLeft--;
        timerEl.textContent = `${timeLeft}s`;
        progressBar.style.width = `${(timeLeft / 15) * 100}%`;

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            streak = 0;
            streakEl.textContent = streak;
            feedbackTextEl.textContent = "⏰ Time's up! Stay focused on the next one!";
            feedbackTextEl.className = "text-center text-xs font-bold text-rose-400 mb-4 min-h-[18px]";
            setTimeout(nextQuestion, 1500);
        }
    }, 1000);
}

// 4. FUNCTION: Load question onto screen
function loadQuestion() {
    const currentQ = questions[currentIndex];
    categoryEl.textContent = currentQ.cat;
    questionTextEl.textContent = currentQ.q;
    optionsContainer.innerHTML = "";

    currentQ.options.forEach(function(opt) {
        const btn = document.createElement("button");
        btn.className = "bg-slate-700 hover:bg-indigo-600 text-white font-semibold py-3 px-2 rounded-xl text-xs transition border border-slate-600 cursor-pointer";
        btn.textContent = opt;

        btn.addEventListener("click", function() {
            checkAnswer(opt, currentQ.ans);
        });

        optionsContainer.appendChild(btn);
    });

    startTimer();
}

// 5. FUNCTION: Validate answer
function checkAnswer(selected, correct) {
    clearInterval(timerInterval);

    const allButtons = optionsContainer.querySelectorAll("button");
    allButtons.forEach(b => b.disabled = true);

    if (selected === correct) {
        score += 10 + (streak * 2);
        streak++;
        feedbackTextEl.textContent = "🎉 Correct! Focus streak increased!";
        feedbackTextEl.className = "text-center text-xs font-bold text-emerald-400 mb-4 min-h-[18px]";
    } else {
        streak = 0;
        feedbackTextEl.textContent = `❌ Oops! Correct answer was: ${correct}`;
        feedbackTextEl.className = "text-center text-xs font-bold text-rose-400 mb-4 min-h-[18px]";
    }

    scoreEl.textContent = score;
    streakEl.textContent = streak;

    setTimeout(nextQuestion, 1200);
}

function nextQuestion() {
    currentIndex = (currentIndex + 1) % questions.length;
    feedbackTextEl.textContent = "Choose an answer to sharpen your focus!";
    feedbackTextEl.className = "text-center text-xs font-bold text-slate-400 mb-4 min-h-[18px]";
    loadQuestion();
}

// 6. EVENT LISTENER: Reset Game
resetBtn.addEventListener("click", function() {
    score = 0;
    streak = 0;
    currentIndex = 0;
    scoreEl.textContent = "0";
    streakEl.textContent = "0";
    loadQuestion();
});

// Run game on start
loadQuestion();