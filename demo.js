// =====================================================================
// TROTROMATE · GHANA COMMUTE & FARE ESTIMATOR
// CODETRAIN AFRICA DEMO DAY CAPSTONE PROJECT
// =====================================================================

// ---------------------------------------------------------------------
// 1. DATA: Ghana TroTro Transit Database (Arrays of Objects)
// ---------------------------------------------------------------------
const trotroRoutes = [
    {
        id: "circle-madina",
        from: "Circle (Kwame Nkrumah)",
        to: "Madina Zongo Junction",
        fare: 11.50,
        estTime: "35 - 50 mins",
        stops: "Circle Interchange ➔ Caprice ➔ Pig Farm ➔ 37 Military ➔ Legon Campus ➔ Atomic Junction ➔ Madina Zongo"
    },
    {
        id: "kaneshie-lapaz",
        from: "Kaneshie First Light",
        to: "Lapaz (George Walker Bush Hwy)",
        fare: 8.50,
        estTime: "20 - 35 mins",
        stops: "Kaneshie ➔ Darkuman Junction ➔ Bubuashie ➔ Nyamekye ➔ Lapaz Interchange"
    },
    {
        id: "tema-accra",
        from: "Tema Community 1",
        to: "Accra Central (Tema Station)",
        fare: 18.00,
        estTime: "45 - 65 mins",
        stops: "Tema Comm 1 ➔ Comm 18 ➔ Ashaiman Overhead ➔ Nungua Barrier ➔ Teshie ➔ Labadi ➔ Tema Station"
    },
    {
        id: "spintex-37",
        from: "Spintex Road (Kotobabi)",
        to: "37 Military Hospital Station",
        fare: 9.50,
        estTime: "25 - 40 mins",
        stops: "Kotobabi ➔ Kasoa Bridge ➔ Flower Pot ➔ Airport Hills ➔ El-Wak ➔ 37 Station"
    },
    {
        id: "kejetia-knust",
        from: "Kejetia Market (Kumasi)",
        to: "KNUST Campus (Tech Junction)",
        fare: 7.50,
        estTime: "25 - 40 mins",
        stops: "Kejetia ➔ Asafo Interchange ➔ Stadium ➔ Anloga Junction ➔ Tech Junction"
    }
];

// ---------------------------------------------------------------------
// 2. DOM ELEMENT SELECTION (Variables)
// ---------------------------------------------------------------------
const routeSelect = document.getElementById("routeSelect");
const fareAmountEl = document.getElementById("fareAmount");
const estTimeEl = document.getElementById("estTime");
const routeStopsEl = document.getElementById("routeStops");
const cashGivenInput = document.getElementById("cashGiven");
const calcChangeBtn = document.getElementById("calcChangeBtn");
const changeAmountEl = document.getElementById("changeAmount");
const changeFeedbackEl = document.getElementById("changeFeedback");
const quickNoteButtons = document.querySelectorAll(".quick-note");
const saveFavBtn = document.getElementById("saveFavBtn");
const savedBadge = document.getElementById("savedBadge");

let activeRoute = null;

// ---------------------------------------------------------------------
// 3. FUNCTIONS
// ---------------------------------------------------------------------

/**
 * Populates the <select> dropdown with routes from our array
 */
function initRouteDropdown() {
    routeSelect.innerHTML = "";

    trotroRoutes.forEach(function(route) {
        const option = document.createElement("option");
        option.value = route.id;
        option.textContent = `${route.from} ➔ ${route.to}`;
        routeSelect.appendChild(option);
    });

    // Check if user has a saved favorite route in LocalStorage
    const savedRouteId = localStorage.getItem("trotromate_favorite_route");
    if (savedRouteId) {
        routeSelect.value = savedRouteId;
    }

    // Load initial selection
    updateRouteDetails();
}

/**
 * Updates fare, duration, and stops when a route is chosen
 */
function updateRouteDetails() {
    const selectedId = routeSelect.value;
    
    // Find matching route in array
    activeRoute = trotroRoutes.find(function(r) {
        return r.id === selectedId;
    });

    if (activeRoute) {
        fareAmountEl.textContent = activeRoute.fare.toFixed(2);
        estTimeEl.textContent = activeRoute.estTime;
        routeStopsEl.textContent = activeRoute.stops;

        // Recalculate change if an amount is already in the input
        calculateChange();
    }
}

/**
 * Calculates the exact change the mate owes the commuter
 */
function calculateChange() {
    if (!activeRoute) return;

    const cashPaid = parseFloat(cashGivenInput.value);

    // If input is empty
    if (isNaN(cashPaid) || cashPaid <= 0) {
        changeAmountEl.textContent = "0.00";
        changeFeedbackEl.textContent = "Enter money given to mate";
        changeFeedbackEl.className = "text-xs text-amber-400 font-semibold";
        return;
    }

    const fare = activeRoute.fare;
    const change = cashPaid - fare;

    if (change < 0) {
        // Commuter didn't give enough money
        const shortBy = Math.abs(change).toFixed(2);
        changeAmountEl.textContent = "0.00";
        changeFeedbackEl.textContent = `⚠️ You are short by GH₵ ${shortBy}!`;
        changeFeedbackEl.className = "text-xs text-rose-400 font-bold";
    } else if (change === 0) {
        // Exact fare given
        changeAmountEl.textContent = "0.00";
        changeFeedbackEl.textContent = "✅ Exact fare! No change needed.";
        changeFeedbackEl.className = "text-xs text-emerald-400 font-bold";
    } else {
        // Positive change
        changeAmountEl.textContent = change.toFixed(2);
        changeFeedbackEl.textContent = `Take your GH₵ ${change.toFixed(2)} from mate!`;
        changeFeedbackEl.className = "text-xs text-emerald-400 font-bold";
    }
}

/**
 * Saves current route to LocalStorage as daily favorite
 */
function saveFavoriteRoute() {
    if (activeRoute) {
        localStorage.setItem("trotromate_favorite_route", activeRoute.id);
        savedBadge.classList.remove("hidden");
        setTimeout(function() {
            savedBadge.classList.add("hidden");
        }, 3000);
    }
}

// ---------------------------------------------------------------------
// 4. EVENT LISTENERS
// ---------------------------------------------------------------------

// When user picks a new route from dropdown
routeSelect.addEventListener("change", updateRouteDetails);

// When user clicks the Calculate Change button
calcChangeBtn.addEventListener("click", calculateChange);

// Recalculate live as user types amount
cashGivenInput.addEventListener("input", calculateChange);

// Quick-note buttons (GH₵ 10, 20, 50, 100)
quickNoteButtons.forEach(function(btn) {
    btn.addEventListener("click", function() {
        const value = btn.getAttribute("data-val");
        cashGivenInput.value = value;
        calculateChange();
    });
});

// Save favorite button
saveFavBtn.addEventListener("click", saveFavoriteRoute);

// Initialize app on page load
initRouteDropdown();