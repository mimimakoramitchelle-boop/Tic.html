// 1. STATE VARIABLES
let currentDisplay = "0";
let previousInput = "";
let selectedOperator = null;
let shouldClearOnNextNumber = false;

const calcDisplay = document.getElementById("calcDisplay");
const calcEquation = document.getElementById("calcEquation");

function updateScreen() {
    calcDisplay.textContent = currentDisplay;
    if (selectedOperator) {
        calcEquation.textContent = `${previousInput} ${selectedOperator}`;
    } else {
        calcEquation.textContent = "";
    }
}

// 2. NUMBER BUTTONS (0 - 9)
document.querySelectorAll(".num-btn").forEach(function(button) {
    button.addEventListener("click", function() {
        const num = button.textContent.trim();
        if (currentDisplay === "0" || shouldClearOnNextNumber) {
            currentDisplay = num;
            shouldClearOnNextNumber = false;
        } else {
            if (currentDisplay.length < 10) {
                currentDisplay += num;
            }
        }
        updateScreen();
    });
});

// 3. DECIMAL POINT
document.getElementById("btnDot").addEventListener("click", function() {
    if (shouldClearOnNextNumber) {
        currentDisplay = "0.";
        shouldClearOnNextNumber = false;
    } else if (!currentDisplay.includes(".")) {
        currentDisplay += ".";
    }
    updateScreen();
});

// 4. OPERATORS (+, -, *, /)
document.querySelectorAll(".op-btn").forEach(function(button) {
    button.addEventListener("click", function() {
        const op = button.getAttribute("data-op");
        if (selectedOperator !== null && !shouldClearOnNextNumber) {
            calculateEquals();
        }
        previousInput = currentDisplay;
        selectedOperator = op;
        shouldClearOnNextNumber = true;
        updateScreen();
    });
});

// 5. EQUALS (=)
document.getElementById("btnEquals").addEventListener("click", calculateEquals);

function calculateEquals() {
    if (selectedOperator === null || shouldClearOnNextNumber) return;

    const prev = parseFloat(previousInput);
    const current = parseFloat(currentDisplay);
    let result = 0;

    switch (selectedOperator) {
        case "+": result = prev + current; break;
        case "-": result = prev - current; break;
        case "*": result = prev * current; break;
        case "/": 
            if (current === 0) {
                currentDisplay = "Error";
                selectedOperator = null;
                updateScreen();
                shouldClearOnNextNumber = true;
                return;
            }
            result = prev / current; 
            break;
    }

    currentDisplay = (Math.round(result * 10000000) / 10000000).toString();
    calcEquation.textContent = `${prev} ${selectedOperator} ${current} =`;
    selectedOperator = null;
    shouldClearOnNextNumber = true;
    calcDisplay.textContent = currentDisplay;
}

// 6. CLEAR (AC)
document.getElementById("btnAC").addEventListener("click", function() {
    currentDisplay = "0";
    previousInput = "";
    selectedOperator = null;
    shouldClearOnNextNumber = false;
    updateScreen();
});

// 7. DELETE (⌫)
document.getElementById("btnDEL").addEventListener("click", function() {
    if (currentDisplay.length > 1 && currentDisplay !== "Error") {
        currentDisplay = currentDisplay.slice(0, -1);
    } else {
        currentDisplay = "0";
    }
    updateScreen();
});

// 8. PERCENT (%)
document.getElementById("btnPercent").addEventListener("click", function() {
    const val = parseFloat(currentDisplay);
    currentDisplay = (val / 100).toString();
    updateScreen();
});