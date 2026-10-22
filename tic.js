// ========================================================
// GAME 1: TIC-TAC-TOE ARENA (DEMO DAY & LINKEDIN EDITION)
// Codetrain Africa · JavaScript Assignment · Project #1
// ========================================================

// --------------------------------------------------------
// 1. GAME STATE VARIABLES
// --------------------------------------------------------
let board = ["", "", "", "", "", "", "", "", ""];
let currentPlayer = "X";
let isGameActive = true;
let gameMode = "2p"; // '2p' | 'easyBot' | 'minimaxBot'
let movesCount = 0;
let roundNumber = 0;
let soundEnabled = true;

// Scores & Streaks
let scoreX = 0;
let scoreO = 0;
let scoreTies = 0;
let currentStreakX = 0;
let currentStreakO = 0;

// All 8 possible 3-in-a-row winning combinations
const winPatterns = [
    [0, 1, 2], // Row 1
    [3, 4, 5], // Row 2
    [6, 7, 8], // Row 3
    [0, 3, 6], // Column 1
    [1, 4, 7], // Column 2
    [2, 5, 8], // Column 3
    [0, 4, 8], // Diagonal TL -> BR
    [2, 4, 6]  // Diagonal TR -> BL
];

// Match History array
const matchHistory = [];

// --------------------------------------------------------
// 2. DOM ELEMENT REFERENCES
// --------------------------------------------------------
const cells = document.querySelectorAll(".cell");
const turnBadge = document.getElementById("turnBadge");
const movesCountEl = document.getElementById("movesCount");
const resetMatchBtn = document.getElementById("resetMatchBtn");
const resetScoresBtn = document.getElementById("resetScoresBtn");

const p2ModeBtn = document.getElementById("p2ModeBtn");
const easyBotBtn = document.getElementById("easyBotBtn");
const minimaxBotBtn = document.getElementById("minimaxBotBtn");
const playerOLabel = document.getElementById("playerOLabel");

const soundToggleBtn = document.getElementById("soundToggleBtn");
const soundIcon = document.getElementById("soundIcon");

const historyToggle = document.getElementById("historyToggle");
const historyList = document.getElementById("historyList");
const historyArrow = document.getElementById("historyArrow");
const totalRoundsCount = document.getElementById("totalRoundsCount");

// LinkedIn Modal Elements
const openLinkedInBtn = document.getElementById("openLinkedInBtn");
const closeLinkedInBtn = document.getElementById("closeLinkedInBtn");
const linkedInModal = document.getElementById("linkedInModal");
const linkedInPostText = document.getElementById("linkedInPostText");
const copyPostBtn = document.getElementById("copyPostBtn");
const copyIcon = document.getElementById("copyIcon");
const copyText = document.getElementById("copyText");

// --------------------------------------------------------
// 3. WEB AUDIO API SYNTHESIZER (Pure JS, Zero MP3 files needed)
// --------------------------------------------------------
let audioCtx = null;

function getAudioContext() {
    if (!audioCtx) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
            audioCtx = new AudioContextClass();
        }
    }
    if (audioCtx && audioCtx.state === "suspended") {
        audioCtx.resume();
    }
    return audioCtx;
}

function playTone(freq, type = "sine", duration = 0.12, volume = 0.15) {
    if (!soundEnabled) return;
    try {
        const ctx = getAudioContext();
        if (!ctx) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        gain.gain.setValueAtTime(volume, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + duration);
    } catch {
        // Ignore audio failures if browser blocks autoplay
    }
}

function playMoveSound(player) {
    if (player === "X") {
        playTone(520, "sine", 0.1, 0.2); // Crisp high chime
    } else {
        playTone(360, "triangle", 0.12, 0.2); // Smooth lower chime
    }
}

function playWinSound() {
    if (!soundEnabled) return;
    // Victory fanfare arpeggio (C5 -> E5 -> G5 -> C6)
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, idx) => {
        setTimeout(() => {
            playTone(freq, "triangle", 0.25, 0.22);
        }, idx * 90);
    });
}

function playDrawSound() {
    if (!soundEnabled) return;
    playTone(280, "sawtooth", 0.28, 0.12);
}

// --------------------------------------------------------
// 4. ATTACH CLICK LISTENERS TO BOARD CELLS
// --------------------------------------------------------
cells.forEach((cell) => {
    cell.addEventListener("click", () => {
        const index = parseInt(cell.getAttribute("data-index"), 10);

        // Guard: Cell filled or game finished
        if (board[index] !== "" || !isGameActive) {
            return;
        }

        // Human Move
        executeMove(index, currentPlayer);

        // If playing against Bot and it's Bot's turn (O)
        if (gameMode !== "2p" && isGameActive && currentPlayer === "O") {
            // Slight delay so the move feels natural
            setTimeout(triggerBotTurn, 380);
        }
    });
});

// --------------------------------------------------------
// 5. EXECUTE MOVE
// --------------------------------------------------------
function executeMove(index, player) {
    board[index] = player;
    movesCount++;
    movesCountEl.textContent = movesCount;

    // Update Cell DOM with animation
    cells[index].textContent = player;
    if (player === "X") {
        cells[index].classList.add("text-indigo-400", "scale-105");
    } else {
        cells[index].classList.add("text-rose-400", "scale-105");
    }
    setTimeout(() => cells[index].classList.remove("scale-105"), 150);

    playMoveSound(player);
    evaluateGameState();
}

// --------------------------------------------------------
// 6. EVALUATE GAME STATE (Check Win or Draw)
// --------------------------------------------------------
function evaluateGameState() {
    let winningCombo = null;

    // Check all 8 win patterns
    for (let i = 0; i < winPatterns.length; i++) {
        const [a, b, c] = winPatterns[i];
        if (board[a] !== "" && board[a] === board[b] && board[a] === board[c]) {
            winningCombo = [a, b, c];
            break;
        }
    }

    // CASE 1: WINNER FOUND
    if (winningCombo) {
        roundNumber++;
        isGameActive = false;

        // Highlight winning cells with glowing emerald
        winningCombo.forEach((idx) => {
            cells[idx].classList.remove("bg-slate-950/70", "border-slate-800");
            cells[idx].classList.add("bg-emerald-600/30", "border-emerald-500", "shadow-[0_0_20px_rgba(16,185,129,0.4)]", "animate-pulse");
        });

        // Update turn badge
        turnBadge.textContent = `👑 Player ${currentPlayer} Won!`;
        turnBadge.className = "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full font-bold";

        // Update scores and streaks
        if (currentPlayer === "X") {
            scoreX++;
            currentStreakX++;
            currentStreakO = 0;
        } else {
            scoreO++;
            currentStreakO++;
            currentStreakX = 0;
        }
        updateScoreboard();

        // Play victory sound & confetti blast
        playWinSound();
        triggerConfetti();

        // Record history
        recordHistory(`Player ${currentPlayer} Won`, `Winner combo: [${winningCombo.join(", ")}] in ${movesCount} moves`);
        refreshLinkedInDraft();
        return;
    }

    // CASE 2: BOARD FULL -> DRAW
    if (!board.includes("")) {
        roundNumber++;
        isGameActive = false;
        scoreTies++;
        currentStreakX = 0;
        currentStreakO = 0;
        updateScoreboard();

        turnBadge.textContent = "🤝 Stalemate! It's a Draw";
        turnBadge.className = "bg-slate-700/80 text-slate-300 border border-slate-600 px-3 py-1 rounded-full font-bold";

        playDrawSound();
        recordHistory("Draw / Tie", `Full board deadlock in 9 moves`);
        refreshLinkedInDraft();
        return;
    }

    // CASE 3: SWITCH TURN
    currentPlayer = currentPlayer === "X" ? "O" : "X";
    if (currentPlayer === "X") {
        turnBadge.textContent = "Player X's Turn";
        turnBadge.className = "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-3 py-1 rounded-full font-bold";
    } else {
        const botName = gameMode === "easyBot" ? "Casual Bot" : gameMode === "minimaxBot" ? "Minimax AI" : "Player O";
        turnBadge.textContent = `${botName}'s Turn (O)`;
        turnBadge.className = "bg-rose-500/10 text-rose-400 border border-rose-500/20 px-3 py-1 rounded-full font-bold";
    }
}

// --------------------------------------------------------
// 7. BOT AI LOGIC (Easy vs Unbeatable Minimax)
// --------------------------------------------------------
function triggerBotTurn() {
    if (!isGameActive) return;

    if (gameMode === "easyBot") {
        // Casual Random Bot
        const available = [];
        for (let i = 0; i < board.length; i++) {
            if (board[i] === "") available.push(i);
        }
        if (available.length > 0) {
            const pick = available[Math.floor(Math.random() * available.length)];
            executeMove(pick, "O");
        }
    } else if (gameMode === "minimaxBot") {
        // Unbeatable Minimax Algorithm
        const bestMoveIndex = getBestMinimaxMove(board);
        if (bestMoveIndex !== -1) {
            executeMove(bestMoveIndex, "O");
        }
    }
}

// --------------------------------------------------------
// 8. MINIMAX DECISION TREE ALGORITHM (Unbeatable AI)
// --------------------------------------------------------
function getBestMinimaxMove(currentBoard) {
    let bestScore = -Infinity;
    let move = -1;

    for (let i = 0; i < 9; i++) {
        if (currentBoard[i] === "") {
            currentBoard[i] = "O"; // Try bot move
            const score = minimax(currentBoard, 0, false);
            currentBoard[i] = ""; // Undo move
            if (score > bestScore) {
                bestScore = score;
                move = i;
            }
        }
    }
    return move;
}

function checkMinimaxWinner(b) {
    for (let i = 0; i < winPatterns.length; i++) {
        const [x, y, z] = winPatterns[i];
        if (b[x] !== "" && b[x] === b[y] && b[x] === b[z]) {
            return b[x];
        }
    }
    if (!b.includes("")) return "tie";
    return null;
}

function minimax(simulatedBoard, depth, isMaximizing) {
    const result = checkMinimaxWinner(simulatedBoard);
    if (result === "O") return 10 - depth; // Bot wins: higher score earlier
    if (result === "X") return depth - 10; // Human wins: penalize
    if (result === "tie") return 0;        // Draw: neutral score

    if (isMaximizing) {
        let maxEval = -Infinity;
        for (let i = 0; i < 9; i++) {
            if (simulatedBoard[i] === "") {
                simulatedBoard[i] = "O";
                const evaluation = minimax(simulatedBoard, depth + 1, false);
                simulatedBoard[i] = "";
                maxEval = Math.max(maxEval, evaluation);
            }
        }
        return maxEval;
    } else {
        let minEval = Infinity;
        for (let i = 0; i < 9; i++) {
            if (simulatedBoard[i] === "") {
                simulatedBoard[i] = "X";
                const evaluation = minimax(simulatedBoard, depth + 1, true);
                simulatedBoard[i] = "";
                minEval = Math.min(minEval, evaluation);
            }
        }
        return minEval;
    }
}

// --------------------------------------------------------
// 9. CONFETTI BLAST
// --------------------------------------------------------
function triggerConfetti() {
    if (typeof window.confetti === "function") {
        window.confetti({
            particleCount: 75,
            spread: 60,
            origin: { y: 0.65 },
            colors: ["#6366f1", "#10b981", "#f43f5e", "#fbbf24", "#06b6d4"]
        });
    }
}

// --------------------------------------------------------
// 10. SCOREBOARD & STREAKS
// --------------------------------------------------------
function updateScoreboard() {
    document.getElementById("scoreX").textContent = scoreX;
    document.getElementById("scoreO").textContent = scoreO;
    document.getElementById("scoreTies").textContent = scoreTies;

    document.getElementById("streakX").textContent = `${currentStreakX} streak`;
    document.getElementById("streakO").textContent = `${currentStreakO} streak`;
}

// --------------------------------------------------------
// 11. MATCH HISTORY LOG
// --------------------------------------------------------
function recordHistory(result, detail) {
    matchHistory.unshift({
        round: roundNumber,
        result,
        detail,
        mode: gameMode === "2p" ? "2 Players" : gameMode === "easyBot" ? "Casual Bot" : "Minimax AI",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    });

    renderHistory();
}

function renderHistory() {
    totalRoundsCount.textContent = matchHistory.length;

    if (matchHistory.length === 0) {
        historyList.innerHTML = `<p class="text-slate-500 italic text-center py-1">No rounds played yet. Make a move!</p>`;
        return;
    }

    historyList.innerHTML = matchHistory.slice(0, 6).map((item) => {
        const isWin = item.result.includes("Won");
        const badgeColor = isWin ? "text-emerald-400 bg-emerald-500/10" : "text-amber-400 bg-amber-500/10";
        return `
            <div class="flex items-center justify-between bg-slate-950/60 border border-slate-800/80 p-1.5 rounded-lg">
                <div class="flex items-center gap-1.5">
                    <span class="text-[10px] font-bold px-1.5 py-0.5 rounded ${badgeColor}">R${item.round}</span>
                    <span class="font-medium text-slate-200">${item.result}</span>
                    <span class="text-[10px] text-slate-500">(${item.mode})</span>
                </div>
                <span class="text-[10px] text-slate-400 font-mono">${item.time}</span>
            </div>
        `;
    }).join("");
}

historyToggle.addEventListener("click", () => {
    historyList.classList.toggle("hidden");
    historyArrow.textContent = historyList.classList.contains("hidden") ? "▶" : "▼";
});

// --------------------------------------------------------
// 12. RESET HANDLERS
// --------------------------------------------------------
resetMatchBtn.addEventListener("click", () => {
    board = ["", "", "", "", "", "", "", "", ""];
    currentPlayer = "X";
    isGameActive = true;
    movesCount = 0;
    movesCountEl.textContent = "0";

    turnBadge.textContent = "Player X's Turn";
    turnBadge.className = "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-3 py-1 rounded-full font-bold";

    cells.forEach((cell) => {
        cell.textContent = "";
        cell.className = "cell bg-slate-950/70 hover:bg-slate-800/70 border border-slate-800 rounded-2xl flex items-center justify-center text-3xl sm:text-4xl font-black text-white cursor-pointer shadow-inner transition duration-150 active:scale-95 focus:outline-none";
    });
});

resetScoresBtn.addEventListener("click", () => {
    if (confirm("Reset all score counters and streaks back to zero?")) {
        scoreX = 0;
        scoreO = 0;
        scoreTies = 0;
        currentStreakX = 0;
        currentStreakO = 0;
        updateScoreboard();
        resetMatchBtn.click();
    }
});

// --------------------------------------------------------
// 13. OPPONENT MODE TOGGLE (2P vs Easy Bot vs Minimax)
// --------------------------------------------------------
function setMode(mode) {
    gameMode = mode;

    // Reset button styles
    p2ModeBtn.className = "py-1.5 px-2 rounded-lg text-slate-400 hover:text-white font-medium cursor-pointer transition text-center";
    easyBotBtn.className = "py-1.5 px-2 rounded-lg text-slate-400 hover:text-white font-medium cursor-pointer transition text-center";
    minimaxBotBtn.className = "py-1.5 px-2 rounded-lg text-slate-400 hover:text-white font-medium cursor-pointer transition text-center flex items-center justify-center gap-1";

    if (mode === "2p") {
        p2ModeBtn.className = "py-1.5 px-2 rounded-lg bg-indigo-600 text-white font-bold cursor-pointer transition shadow text-center";
        playerOLabel.textContent = "Player O";
    } else if (mode === "easyBot") {
        easyBotBtn.className = "py-1.5 px-2 rounded-lg bg-indigo-600 text-white font-bold cursor-pointer transition shadow text-center";
        playerOLabel.textContent = "Casual Bot";
    } else {
        minimaxBotBtn.className = "py-1.5 px-2 rounded-lg bg-indigo-600 text-white font-bold cursor-pointer transition shadow text-center flex items-center justify-center gap-1";
        playerOLabel.textContent = "Minimax AI 🧠";
    }

    resetMatchBtn.click();
    refreshLinkedInDraft();
}

p2ModeBtn.addEventListener("click", () => setMode("2p"));
easyBotBtn.addEventListener("click", () => setMode("easyBot"));
minimaxBotBtn.addEventListener("click", () => setMode("minimaxBot"));

// --------------------------------------------------------
// 14. SOUND TOGGLE
// --------------------------------------------------------
soundToggleBtn.addEventListener("click", () => {
    soundEnabled = !soundEnabled;
    soundIcon.textContent = soundEnabled ? "🔊" : "🔇";
    soundToggleBtn.classList.toggle("border-indigo-500", soundEnabled);
});

// --------------------------------------------------------
// 15. LINKEDIN POST GENERATOR (Demo Day Ready)
// --------------------------------------------------------
function generateLinkedInPostContent() {
    const totalRounds = scoreX + scoreO + scoreTies;
    return `🚀 Project #1 Completed! Excited to showcase my Tic-Tac-Toe Arena built with pure Vanilla JavaScript, HTML5 & Tailwind CSS for our Demo Day at Codetrain Africa! 🎮✨

💡 What I Engineered:
• 🧠 Unbeatable AI Bot: Implemented the Minimax recursive backtracking decision algorithm in JavaScript to compute optimal game trees (impossible to defeat!).
• 🎵 Web Audio API Synthesizer: Created native oscillator frequency sound effects for player moves, draw chords, and victory fanfares without using any external audio files.
• ⚡ State & DOM Architecture: Structured clean state management tracking 9 board coordinates, 8 victory matrices, dynamic streak calculations, and interactive match history logs.
• 🎨 Modern Responsive UI: Designed a sleek dark-mode glassmorphic interface with canvas-confetti particle celebrations and interactive mode switching.

📊 Stats from My Test Session:
• Rounds Completed: ${totalRounds > 0 ? totalRounds : "Ready for Demo"}
• Player X Wins: ${scoreX} | Bot/Player O Wins: ${scoreO} | Stalemate Ties: ${scoreTies}

Building projects from scratch reinforces core software engineering fundamentals — from algorithmic thinking to real-world DOM manipulation.

Next stop: Project #2! What do you think of the Minimax implementation? 💬

#JavaScript #WebDevelopment #FrontendDeveloper #CodetrainAfrica #DemoDay #Algorithms #SoftwareEngineering #Minimax #TechCommunity #BuildInPublic`;
}

function refreshLinkedInDraft() {
    if (linkedInPostText) {
        linkedInPostText.value = generateLinkedInPostContent();
    }
}

// Modal open/close
openLinkedInBtn.addEventListener("click", () => {
    refreshLinkedInDraft();
    linkedInModal.classList.remove("hidden");
});

closeLinkedInBtn.addEventListener("click", () => {
    linkedInModal.classList.add("hidden");
});

linkedInModal.addEventListener("click", (e) => {
    if (e.target === linkedInModal) {
        linkedInModal.classList.add("hidden");
    }
});

// Copy button
copyPostBtn.addEventListener("click", async () => {
    try {
        await navigator.clipboard.writeText(linkedInPostText.value);
        copyIcon.textContent = "✅";
        copyText.textContent = "Copied to Clipboard!";
        copyPostBtn.classList.remove("bg-emerald-600", "hover:bg-emerald-500");
        copyPostBtn.classList.add("bg-indigo-600", "hover:bg-indigo-500");

        setTimeout(() => {
            copyIcon.textContent = "📋";
            copyText.textContent = "Copy Post to Clipboard";
            copyPostBtn.classList.remove("bg-indigo-600", "hover:bg-indigo-500");
            copyPostBtn.classList.add("bg-emerald-600", "hover:bg-emerald-500");
        }, 2200);
    } catch {
        linkedInPostText.select();
        document.execCommand("copy");
        copyText.textContent = "Copied!";
        setTimeout(() => (copyText.textContent = "Copy Post to Clipboard"), 2000);
    }
});

// --------------------------------------------------------
// 16. INITIALIZE
// --------------------------------------------------------
updateScoreboard();
renderHistory();
refreshLinkedInDraft();