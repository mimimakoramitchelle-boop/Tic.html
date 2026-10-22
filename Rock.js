// ============================================================
// ROCK, PAPER, SCISSORS CHAMPIONSHIP ARENA
// Pure Vanilla JavaScript ·
// ============================================================

// ------------------------------------------------------------
// 1. DATA STRUCTURES & RULES
// ------------------------------------------------------------
const MOVES = {
    rock: { name: "Rock", icon: "✊", color: "text-amber-400" },
    paper: { name: "Paper", icon: "✋", color: "text-cyan-400" },
    scissors: { name: "Scissors", icon: "✌️", color: "text-rose-400" },
    lizard: { name: "Lizard", icon: "🦎", color: "text-emerald-400" },
    spock: { name: "Spock", icon: "🖖", color: "text-purple-400" }
};

// Winning pairs and flavor text: [Winner, Loser] => action phrase
const WIN_RULES = {
    "rock-scissors": "Rock crushes Scissors!",
    "rock-lizard": "Rock crushes Lizard!",
    "scissors-paper": "Scissors cuts Paper!",
    "scissors-lizard": "Scissors decapitates Lizard!",
    "paper-rock": "Paper covers Rock!",
    "paper-spock": "Paper disproves Spock!",
    "lizard-spock": "Lizard poisons Spock!",
    "lizard-paper": "Lizard eats Paper!",
    "spock-scissors": "Spock smashes Scissors!",
    "spock-rock": "Spock vaporizes Rock!"
};

// ------------------------------------------------------------
// 2. STATE MANAGEMENT
// ------------------------------------------------------------
const state = {
    playerScore: 0,
    compScore: 0,
    tieScore: 0,
    roundNumber: 0,
    streak: 0,
    maxStreak: parseInt(localStorage.getItem("rps_max_streak") || "0", 10),
    isAnimating: false,
    soundEnabled: localStorage.getItem("rps_sound") !== "false",
    matchFormat: "first_to_3", // 'first_to_3', 'first_to_5', 'endless'
    gameMode: "classic",       // 'classic', 'rpsls'
    botBrain: "smart",         // 'smart', 'predictor', 'random'
    seriesWinner: null,        // 'player', 'comp', null
    lastPlayerMove: null,
    // Markov transition memory: transitions[prevMove][nextMove] = count
    markovTransitions: {
        rock: { rock: 0, paper: 0, scissors: 0, lizard: 0, spock: 0 },
        paper: { rock: 0, paper: 0, scissors: 0, lizard: 0, spock: 0 },
        scissors: { rock: 0, paper: 0, scissors: 0, lizard: 0, spock: 0 },
        lizard: { rock: 0, paper: 0, scissors: 0, lizard: 0, spock: 0 },
        spock: { rock: 0, paper: 0, scissors: 0, lizard: 0, spock: 0 }
    },
    battleLog: []
};

// ------------------------------------------------------------
// 3. AUDIO SYNTHESIS (Web Audio API)
// ------------------------------------------------------------
let audioCtx = null;

function getAudioContext() {
    if (!audioCtx) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
            audioCtx = new AudioContextClass();
        }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    return audioCtx;
}

function playTone(freq, type = 'sine', duration = 0.15, gainVal = 0.1) {
    if (!state.soundEnabled) return;
    try {
        const ctx = getAudioContext();
        if (!ctx) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        gain.gain.setValueAtTime(gainVal, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + duration);
    } catch (e) {
        console.warn("Audio playback issue:", e);
    }
}

const SoundFX = {
    tick: (step) => {
        // Ascending tone for Rock -> Paper -> Scissors -> Shoot
        const notes = [260, 330, 392, 523];
        playTone(notes[step % notes.length], 'triangle', 0.08, 0.15);
    },
    win: () => {
        playTone(523, 'triangle', 0.1, 0.15); // C5
        setTimeout(() => playTone(659, 'triangle', 0.1, 0.15), 100); // E5
        setTimeout(() => playTone(783, 'triangle', 0.25, 0.18), 200); // G5
    },
    lose: () => {
        playTone(280, 'sawtooth', 0.15, 0.12);
        setTimeout(() => playTone(180, 'sawtooth', 0.25, 0.12), 120);
    },
    tie: () => {
        playTone(350, 'sine', 0.08, 0.1);
        setTimeout(() => playTone(350, 'sine', 0.08, 0.1), 90);
    },
    seriesVictory: () => {
        const fanfare = [392, 523, 659, 783, 1046];
        fanfare.forEach((f, i) => {
            setTimeout(() => playTone(f, 'square', 0.2, 0.15), i * 110);
        });
    }
};

// ------------------------------------------------------------
// 4. CONFETTI PARTICLE SYSTEM
// ------------------------------------------------------------
const canvas = document.getElementById("confettiCanvas");
const ctx = canvas ? canvas.getContext("2d") : null;
let confettiParticles = [];
let confettiAnimationId = null;

function resizeConfetti() {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeConfetti);
resizeConfetti();

class ConfettiParticle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = -20;
        this.size = Math.random() * 8 + 6;
        this.speedY = Math.random() * 4 + 3;
        this.speedX = (Math.random() - 0.5) * 4;
        this.rotation = Math.random() * 360;
        this.rotSpeed = (Math.random() - 0.5) * 10;
        const colors = ["#f59e0b", "#10b981", "#ef4444", "#3b82f6", "#8b5cf6", "#ec4899", "#facc15"];
        this.color = colors[Math.floor(Math.random() * colors.length)];
    }
    update() {
        this.y += this.speedY;
        this.x += this.speedX;
        this.rotation += this.rotSpeed;
    }
    draw() {
        if (!ctx) return;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate((this.rotation * Math.PI) / 180);
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
        ctx.restore();
    }
}

function launchConfetti(burstCount = 80) {
    if (!canvas || !ctx) return;
    for (let i = 0; i < burstCount; i++) {
        confettiParticles.push(new ConfettiParticle());
    }
    if (!confettiAnimationId) {
        animateConfetti();
    }
}

function animateConfetti() {
    if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = confettiParticles.length - 1; i >= 0; i--) {
        const p = confettiParticles[i];
        p.update();
        p.draw();
        if (p.y > canvas.height + 30) {
            confettiParticles.splice(i, 1);
        }
    }
    if (confettiParticles.length > 0) {
        confettiAnimationId = requestAnimationFrame(animateConfetti);
    } else {
        confettiAnimationId = null;
    }
}

// ------------------------------------------------------------
// 5. DOM ELEMENTS
// ------------------------------------------------------------
const playerHandCard = document.getElementById("playerHandCard");
const compHandCard = document.getElementById("compHandCard");
const playerIconEl = document.getElementById("playerIcon");
const compIconEl = document.getElementById("compIcon");
const playerChoiceLabel = document.getElementById("playerChoiceLabel");
const compChoiceLabel = document.getElementById("compChoiceLabel");
const countdownBadge = document.getElementById("countdownBadge");
const roundCounterText = document.getElementById("roundCounterText");
const resultBox = document.getElementById("resultBox");
const resultTitle = document.getElementById("resultTitle");
const resultDetail = document.getElementById("resultDetail");

const playerScoreEl = document.getElementById("playerScore");
const compScoreEl = document.getElementById("compScore");
const tieScoreEl = document.getElementById("tieScore");

const streakBadge = document.getElementById("streakBadge");
const streakCountEl = document.getElementById("streakCount");

const matchFormatSelect = document.getElementById("matchFormatSelect");
const gameModeSelect = document.getElementById("gameModeSelect");
const botBrainSelect = document.getElementById("botBrainSelect");

const seriesProgressBarContainer = document.getElementById("seriesProgressBarContainer");
const playerTargetScoreText = document.getElementById("playerTargetScoreText");
const compTargetScoreText = document.getElementById("compTargetScoreText");
const seriesStatusText = document.getElementById("seriesStatusText");
const playerProgressFill = document.getElementById("playerProgressFill");
const compProgressFill = document.getElementById("compProgressFill");

const rpslsExtraChoices = document.getElementById("rpslsExtraChoices");
const resetMatchBtn = document.getElementById("resetMatchBtn");
const toggleHistoryBtn = document.getElementById("toggleHistoryBtn");
const historyBtnLabel = document.getElementById("historyBtnLabel");
const historyDrawer = document.getElementById("historyDrawer");
const historyList = document.getElementById("historyList");
const clearHistoryBtn = document.getElementById("clearHistoryBtn");

const soundToggleBtn = document.getElementById("soundToggleBtn");
const soundIcon = document.getElementById("soundIcon");

const rulesModal = document.getElementById("rulesModal");
const rulesModalBtn = document.getElementById("rulesModalBtn");
const closeRulesBtn = document.getElementById("closeRulesBtn");
const understoodRulesBtn = document.getElementById("understoodRulesBtn");

// ------------------------------------------------------------
// 6. AI BOT DECISION ENGINE
// ------------------------------------------------------------
function getAvailableMoves() {
    return state.gameMode === "rpsls"
        ? ["rock", "paper", "scissors", "lizard", "spock"]
        : ["rock", "paper", "scissors"];
}

// Find all moves that beat a given target move
function getMovesThatBeat(targetMove) {
    const wins = [];
    for (const key in WIN_RULES) {
        const [winner, loser] = key.split("-");
        if (loser === targetMove) {
            wins.push(winner);
        }
    }
    return wins;
}

function calculateBotChoice() {
    const available = getAvailableMoves();

    // 1. Random AI
    if (state.botBrain === "random" || !state.lastPlayerMove) {
        return available[Math.floor(Math.random() * available.length)];
    }

    // 2. Smart Tactician (Win-Stay, Lose-Shift Counter)
    if (state.botBrain === "smart") {
        const counters = getMovesThatBeat(state.lastPlayerMove).filter(m => available.includes(m));
        if (counters.length > 0 && Math.random() < 0.65) {
            return counters[Math.floor(Math.random() * counters.length)];
        }
        return available[Math.floor(Math.random() * available.length)];
    }

    // 3. Markov Chain Predictor (Mind Reader)
    if (state.botBrain === "predictor") {
        const historyFromLast = state.markovTransitions[state.lastPlayerMove];
        if (historyFromLast) {
            let maxCount = -1;
            let predictedPlayerMove = available[0];
            available.forEach(m => {
                const count = historyFromLast[m] || 0;
                if (count > maxCount) {
                    maxCount = count;
                    predictedPlayerMove = m;
                }
            });

            if (maxCount > 0 && Math.random() < 0.75) {
                const winningCounters = getMovesThatBeat(predictedPlayerMove).filter(m => available.includes(m));
                if (winningCounters.length > 0) {
                    return winningCounters[Math.floor(Math.random() * winningCounters.length)];
                }
            }
        }
        return available[Math.floor(Math.random() * available.length)];
    }

    return available[Math.floor(Math.random() * available.length)];
}

// ------------------------------------------------------------
// 7. ROUND EXECUTION & ANIMATION
// ------------------------------------------------------------
function executeRound(playerChoice) {
    if (state.isAnimating) return;
    if (state.seriesWinner) {
        resultTitle.textContent = "Series Finished! Click 'Reset Current Series' to play again.";
        resultTitle.className = "text-base sm:text-lg font-black text-amber-400";
        return;
    }

    state.isAnimating = true;

    // Reset hands to clashing fists ✊
    playerIconEl.textContent = "✊";
    compIconEl.textContent = "✊";
    playerChoiceLabel.textContent = "Ready...";
    compChoiceLabel.textContent = "Ready...";

    // Start dramatic CSS shake animation
    playerHandCard.classList.add("anim-shake-left");
    compHandCard.classList.add("anim-shake-right");

    const countdownWords = ["Rock!", "Paper!", "Scissors!", "SHOOT!"];
    let step = 0;

    const interval = setInterval(() => {
        countdownBadge.textContent = countdownWords[step];
        countdownBadge.className = "text-lg sm:text-2xl font-black text-amber-400 tracking-wider h-8 flex items-center justify-center uppercase scale-110 transition-transform";
        SoundFX.tick(step);
        step++;

        if (step >= countdownWords.length) {
            clearInterval(interval);
            setTimeout(() => {
                revealResult(playerChoice);
            }, 300);
        }
    }, 280);
}

function revealResult(playerChoice) {
    // Stop shake
    playerHandCard.classList.remove("anim-shake-left");
    compHandCard.classList.remove("anim-shake-right");

    const compChoice = calculateBotChoice();

    // Update Markov model
    if (state.lastPlayerMove && state.markovTransitions[state.lastPlayerMove]) {
        state.markovTransitions[state.lastPlayerMove][playerChoice] =
            (state.markovTransitions[state.lastPlayerMove][playerChoice] || 0) + 1;
    }
    state.lastPlayerMove = playerChoice;

    // Display revealed icons
    playerIconEl.textContent = MOVES[playerChoice].icon;
    compIconEl.textContent = MOVES[compChoice].icon;
    playerChoiceLabel.textContent = MOVES[playerChoice].name;
    compChoiceLabel.textContent = MOVES[compChoice].name;

    state.roundNumber++;
    roundCounterText.textContent = `Round ${state.roundNumber}`;

    // Determine Winner
    let outcome = "tie"; // 'win', 'lose', 'tie'
    let detailMessage = "";

    if (playerChoice === compChoice) {
        outcome = "tie";
        state.tieScore++;
        detailMessage = `Both picked ${MOVES[playerChoice].name}. Stalemate!`;
        SoundFX.tie();
    } else if (WIN_RULES[`${playerChoice}-${compChoice}`]) {
        outcome = "win";
        state.playerScore++;
        state.streak++;
        if (state.streak > state.maxStreak) {
            state.maxStreak = state.streak;
            localStorage.setItem("rps_max_streak", state.maxStreak.toString());
        }
        detailMessage = WIN_RULES[`${playerChoice}-${compChoice}`];
        SoundFX.win();
    } else {
        outcome = "lose";
        state.compScore++;
        state.streak = 0;
        detailMessage = WIN_RULES[`${compChoice}-${playerChoice}`] || `${MOVES[compChoice].name} defeats ${MOVES[playerChoice].name}`;
        SoundFX.lose();
    }

    // Update UI scores
    playerScoreEl.textContent = state.playerScore;
    compScoreEl.textContent = state.compScore;
    tieScoreEl.textContent = state.tieScore;

    // Update Streak Badge
    if (state.streak > 1) {
        streakBadge.classList.remove("hidden");
        streakBadge.classList.add("inline-flex");
        streakCountEl.textContent = state.streak;
    } else {
        streakBadge.classList.add("hidden");
        streakBadge.classList.remove("inline-flex");
    }

    // Update Result Banner
    countdownBadge.textContent = outcome === "win" ? "VICTORY!" : (outcome === "lose" ? "DEFEAT!" : "DRAW!");

    if (outcome === "win") {
        countdownBadge.className = "text-lg sm:text-2xl font-black text-emerald-400 tracking-wider h-8 flex items-center justify-center uppercase";
        resultTitle.textContent = `🎉 You Win Round ${state.roundNumber}!`;
        resultTitle.className = "text-base sm:text-lg font-black text-emerald-400";
        resultDetail.textContent = detailMessage;
        resultBox.className = "mt-4 p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/50 transition-all duration-300";
    } else if (outcome === "lose") {
        countdownBadge.className = "text-lg sm:text-2xl font-black text-rose-400 tracking-wider h-8 flex items-center justify-center uppercase";
        resultTitle.textContent = `💀 Computer Wins Round ${state.roundNumber}!`;
        resultTitle.className = "text-base sm:text-lg font-black text-rose-400";
        resultDetail.textContent = detailMessage;
        resultBox.className = "mt-4 p-3 rounded-xl bg-rose-950/40 border border-rose-500/50 transition-all duration-300";
    } else {
        countdownBadge.className = "text-lg sm:text-2xl font-black text-slate-300 tracking-wider h-8 flex items-center justify-center uppercase";
        resultTitle.textContent = `🤝 Round ${state.roundNumber} is a Tie!`;
        resultTitle.className = "text-base sm:text-lg font-black text-slate-300";
        resultDetail.textContent = detailMessage;
        resultBox.className = "mt-4 p-3 rounded-xl bg-slate-900 border border-slate-700 transition-all duration-300";
    }

    // Append to Battle Log
    recordRoundLog(state.roundNumber, playerChoice, compChoice, outcome, detailMessage);

    // Check Match Series Progress
    checkSeriesStatus();

    state.isAnimating = false;
}

// ------------------------------------------------------------
// 8. SERIES & MATCH FORMAT HANDLING
// ------------------------------------------------------------
function getTargetScore() {
    if (state.matchFormat === "first_to_3") return 3;
    if (state.matchFormat === "first_to_5") return 5;
    return Infinity;
}

function updateSeriesProgressUI() {
    const target = getTargetScore();
    if (target === Infinity) {
        seriesProgressBarContainer.classList.add("hidden");
        return;
    }

    seriesProgressBarContainer.classList.remove("hidden");
    playerTargetScoreText.textContent = `Player: ${state.playerScore} / ${target}`;
    compTargetScoreText.textContent = `Bot: ${state.compScore} / ${target}`;

    const playerPct = Math.min(100, (state.playerScore / target) * 100);
    const compPct = Math.min(100, (state.compScore / target) * 100);

    playerProgressFill.style.width = `${playerPct / 2}%`;
    compProgressFill.style.width = `${compPct / 2}%`;
}

function checkSeriesStatus() {
    const target = getTargetScore();
    updateSeriesProgressUI();

    if (target === Infinity) return;

    if (state.playerScore >= target) {
        state.seriesWinner = "player";
        seriesStatusText.textContent = "🏆 YOU WON THE CHAMPIONSHIP!";
        seriesStatusText.className = "text-emerald-400 font-black animate-pulse";
        resultTitle.textContent = "👑 CHAMPION OF THE ARENA!";
        resultTitle.className = "text-xl font-black text-emerald-400";
        resultDetail.textContent = `You conquered the Computer Bot ${state.playerScore} - ${state.compScore}!`;
        SoundFX.seriesVictory();
        launchConfetti(120);
    } else if (state.compScore >= target) {
        state.seriesWinner = "comp";
        seriesStatusText.textContent = "💀 BOT WON THE SERIES";
        seriesStatusText.className = "text-rose-400 font-black";
        resultTitle.textContent = "GAME OVER: Series Lost!";
        resultTitle.className = "text-xl font-black text-rose-400";
        resultDetail.textContent = `The Bot took the match ${state.compScore} - ${state.playerScore}. Hit reset to rematch!`;
    }
}

// ------------------------------------------------------------
// 9. BATTLE LOG
// ------------------------------------------------------------
function recordRoundLog(round, pChoice, cChoice, outcome, detail) {
    state.battleLog.unshift({
        round,
        pChoice,
        cChoice,
        outcome,
        detail,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    });

    historyBtnLabel.textContent = `View Battle Log (${state.battleLog.length})`;
    renderBattleLog();
}

function renderBattleLog() {
    if (!historyList) return;
    if (state.battleLog.length === 0) {
        historyList.innerHTML = `<p class="text-slate-500 text-center py-4 text-xs">No rounds recorded yet. Make a move!</p>`;
        return;
    }

    historyList.innerHTML = state.battleLog.map(item => {
        let badgeColor = "bg-slate-800 text-slate-300 border-slate-700";
        let label = "DRAW";
        if (item.outcome === "win") {
            badgeColor = "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
            label = "WIN";
        } else if (item.outcome === "lose") {
            badgeColor = "bg-rose-500/20 text-rose-300 border-rose-500/40";
            label = "LOSS";
        }

        return `
            <div class="flex items-center justify-between p-2 rounded-xl bg-slate-950/70 border border-slate-800/80">
                <div class="flex items-center gap-2">
                    <span class="text-[10px] font-bold px-1.5 py-0.5 rounded border ${badgeColor}">${label}</span>
                    <span class="font-bold text-slate-200">#${item.round}:</span>
                    <span class="text-slate-300">${MOVES[item.pChoice].icon} vs ${MOVES[item.cChoice].icon}</span>
                    <span class="text-[11px] text-slate-400 hidden sm:inline">(${item.detail})</span>
                </div>
                <span class="text-[10px] text-slate-500 font-mono">${item.time}</span>
            </div>
        `;
    }).join("");
}

// ------------------------------------------------------------
// 10. CONTROLS, MODES & RESET
// ------------------------------------------------------------
function resetMatch() {
    state.playerScore = 0;
    state.compScore = 0;
    state.tieScore = 0;
    state.roundNumber = 0;
    state.streak = 0;
    state.seriesWinner = null;
    state.lastPlayerMove = null;

    playerScoreEl.textContent = "0";
    compScoreEl.textContent = "0";
    tieScoreEl.textContent = "0";
    roundCounterText.textContent = "Round 0";

    playerIconEl.textContent = "✊";
    compIconEl.textContent = "✊";
    playerChoiceLabel.textContent = "Ready";
    compChoiceLabel.textContent = "Ready";

    countdownBadge.textContent = "VS";
    countdownBadge.className = "text-lg sm:text-2xl font-black text-amber-400 tracking-wider h-8 flex items-center justify-center uppercase";

    streakBadge.classList.add("hidden");
    seriesStatusText.textContent = "MATCH IN PROGRESS";
    seriesStatusText.className = "text-amber-400 font-black";

    resultTitle.textContent = "Arena Reset! Choose your weapon.";
    resultTitle.className = "text-base sm:text-lg font-black text-amber-400";
    resultDetail.textContent = "Keyboard shortcuts: 1 (Rock), 2 (Paper), 3 (Scissors)";
    resultBox.className = "mt-4 p-3 rounded-xl bg-slate-900 border border-slate-800 transition-all duration-300";

    updateSeriesProgressUI();
}

// ------------------------------------------------------------
// 11. EVENT LISTENERS
// ------------------------------------------------------------

// Choice buttons
document.querySelectorAll(".choice-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        const choice = btn.getAttribute("data-choice");
        if (choice) executeRound(choice);
    });
});

// Match format selector
matchFormatSelect.addEventListener("change", (e) => {
    state.matchFormat = e.target.value;
    resetMatch();
});

// Game variant (Classic vs RPSLS)
gameModeSelect.addEventListener("change", (e) => {
    state.gameMode = e.target.value;
    if (state.gameMode === "rpsls") {
        rpslsExtraChoices.classList.remove("hidden");
    } else {
        rpslsExtraChoices.classList.add("hidden");
    }
    resetMatch();
});

// Bot Brain Selector
botBrainSelect.addEventListener("change", (e) => {
    state.botBrain = e.target.value;
});

// Sound Toggle
soundToggleBtn.addEventListener("click", () => {
    state.soundEnabled = !state.soundEnabled;
    localStorage.setItem("rps_sound", state.soundEnabled.toString());
    soundIcon.textContent = state.soundEnabled ? "🔊" : "🔇";
    if (state.soundEnabled) SoundFX.tick(0);
});

// Rules Modal
rulesModalBtn.addEventListener("click", () => rulesModal.classList.remove("hidden"));
closeRulesBtn.addEventListener("click", () => rulesModal.classList.add("hidden"));
understoodRulesBtn.addEventListener("click", () => rulesModal.classList.add("hidden"));

// History Drawer
toggleHistoryBtn.addEventListener("click", () => {
    historyDrawer.classList.toggle("hidden");
});

clearHistoryBtn.addEventListener("click", () => {
    state.battleLog = [];
    historyBtnLabel.textContent = "View Battle Log (0)";
    renderBattleLog();
});

// Reset Button
resetMatchBtn.addEventListener("click", resetMatch);

// Keyboard Shortcuts
window.addEventListener("keydown", (e) => {
    if (["INPUT", "SELECT", "TEXTAREA"].includes(document.activeElement.tagName)) return;

    const key = e.key.toLowerCase();

    if (key === "1" || key === "r") executeRound("rock");
    else if (key === "2" || key === "p") executeRound("paper");
    else if (key === "3" || key === "s") executeRound("scissors");
    else if ((key === "4" || key === "l") && state.gameMode === "rpsls") executeRound("lizard");
    else if ((key === "5" || key === "k") && state.gameMode === "rpsls") executeRound("spock");
    else if (key === "m") soundToggleBtn.click();
    else if (key === " ") {
        e.preventDefault();
        resetMatch();
    }
});

// Initial Setup
soundIcon.textContent = state.soundEnabled ? "🔊" : "🔇";
updateSeriesProgressUI();