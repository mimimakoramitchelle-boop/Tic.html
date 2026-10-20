let board = ["", "", "", "", "", "", "", "", ""];
let currentPlayer = "X";
let isGameActive = true;
let isAiMode = false;
let scoreX = 0;
let scoreO = 0;
let scoreTies = 0;

const winPatterns = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
];

const cells = document.querySelectorAll(".cell");
const turnBadge = document.getElementById("turnBadge");
const resetMatchBtn = document.getElementById("resetMatchBtn");
const p2ModeBtn = document.getElementById("p2ModeBtn");
const aiModeBtn = document.getElementById("aiModeBtn");

cells.forEach(cell => {
    cell.addEventListener("click", () => {
        const index = cell.getAttribute("data-index");
        if (board[index] !== "" || !isGameActive) return;

        makeMove(index, currentPlayer);

        if (isAiMode && isGameActive && currentPlayer === "O") {
            setTimeout(makeAiMove, 350);
        }
    });
});

function makeMove(index, player) {
    board[index] = player;
    cells[index].textContent = player;
    cells[index].classList.add(player === "X" ? "text-indigo-400" : "text-rose-400");
    checkWinner();
}

function checkWinner() {
    let hasWon = false;
    for (let i = 0; i < winPatterns.length; i++) {
        const [a, b, c] = winPatterns[i];
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            hasWon = true;
            cells[a].classList.add("bg-emerald-600/40");
            cells[b].classList.add("bg-emerald-600/40");
            cells[c].classList.add("bg-emerald-600/40");
            break;
        }
    }

    if (hasWon) {
        turnBadge.textContent = `👑 Player ${currentPlayer} Won!`;
        turnBadge.className = "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full font-bold";
        if (currentPlayer === "X") scoreX++;
        else scoreO++;
        updateScores();
        isGameActive = false;
        return;
    }

    if (!board.includes("")) {
        turnBadge.textContent = "🤝 It's a Draw!";
        turnBadge.className = "bg-slate-700 text-slate-300 border border-slate-600 px-3 py-1 rounded-full font-bold";
        scoreTies++;
        updateScores();
        isGameActive = false;
        return;
    }

    currentPlayer = currentPlayer === "X" ? "O" : "X";
    turnBadge.textContent = `Player ${currentPlayer}'s Turn`;
    turnBadge.className = currentPlayer === "X"
        ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-3 py-1 rounded-full font-bold"
        : "bg-rose-500/10 text-rose-400 border border-rose-500/20 px-3 py-1 rounded-full font-bold";
}

function makeAiMove() {
    if (!isGameActive) return;
    const emptySpots = [];
    for (let i = 0; i < board.length; i++) {
        if (board[i] === "") emptySpots.push(i);
    }
    if (emptySpots.length > 0) {
        const randomIndex = emptySpots[Math.floor(Math.random() * emptySpots.length)];
        makeMove(randomIndex, "O");
    }
}

function updateScores() {
    document.getElementById("scoreX").textContent = scoreX;
    document.getElementById("scoreO").textContent = scoreO;
    document.getElementById("scoreTies").textContent = scoreTies;
}

resetMatchBtn.addEventListener("click", () => {
    board = ["", "", "", "", "", "", "", "", ""];
    currentPlayer = "X";
    isGameActive = true;
    turnBadge.textContent = "Player X's Turn";
    turnBadge.className = "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-3 py-1 rounded-full font-bold";
    cells.forEach(cell => {
        cell.textContent = "";
        cell.className = "cell bg-slate-900 hover:bg-slate-700/60 rounded-2xl flex items-center justify-center text-3xl sm:text-4xl font-black border border-slate-700 cursor-pointer shadow-inner";
    });
});

p2ModeBtn.addEventListener("click", () => {
    isAiMode = false;
    p2ModeBtn.className = "px-2.5 py-1 rounded bg-indigo-600 text-white font-bold cursor-pointer";
    aiModeBtn.className = "px-2.5 py-1 rounded text-slate-400 hover:text-white cursor-pointer";
    resetMatchBtn.click();
});

aiModeBtn.addEventListener("click", () => {
    isAiMode = true;
    aiModeBtn.className = "px-2.5 py-1 rounded bg-indigo-600 text-white font-bold cursor-pointer";
    p2ModeBtn.className = "px-2.5 py-1 rounded text-slate-400 hover:text-white cursor-pointer";
    resetMatchBtn.click();
});