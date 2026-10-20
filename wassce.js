// =====================================================================
// EDUGHANA · BECE SCHOOL PLACEMENT CALCULATOR
// CODETRAIN AFRICA DEMO DAY CAPSTONE PROJECT
// Developer: Mitchelle Makora
// =====================================================================

// ---------------------------------------------------------------------
// PART 1: THE DATA (Our database of Ghanaian Senior High Schools)
// ---------------------------------------------------------------------
const schoolsDB = [
    {
        name: "Presbyterian Boys' Secondary (PRESEC Legon)",
        category: "Category A",
        location: "Greater Accra (Legon)",
        type: "Boys",
        maxAggregate: 9,
        popularPrograms: "General Science, General Arts",
        badgeColor: "bg-blue-100 text-blue-700 border-blue-200"
    },
    {
        name: "Achimota School (Motown)",
        category: "Category A",
        location: "Greater Accra (Achimota)",
        type: "Mixed",
        maxAggregate: 11,
        popularPrograms: "Science, General Arts, Home Economics",
        badgeColor: "bg-blue-100 text-blue-700 border-blue-200"
    },
    {
        name: "Wesley Girls' High School (Wey Gey Hey)",
        category: "Category A",
        location: "Central Region (Cape Coast)",
        type: "Girls",
        maxAggregate: 8,
        popularPrograms: "Science, General Arts, Business",
        badgeColor: "bg-blue-100 text-blue-700 border-blue-200"
    },
    {
        name: "Prempeh College (The Amanfuo)",
        category: "Category A",
        location: "Ashanti Region (Kumasi)",
        type: "Boys",
        maxAggregate: 10,
        popularPrograms: "General Science, Visual Arts",
        badgeColor: "bg-blue-100 text-blue-700 border-blue-200"
    },
    {
        name: "St. Augustine's College (Augusco)",
        category: "Category A",
        location: "Central Region (Cape Coast)",
        type: "Boys",
        maxAggregate: 11,
        popularPrograms: "General Science, Business, General Arts",
        badgeColor: "bg-blue-100 text-blue-700 border-blue-200"
    },
    {
        name: "Kumasi High School (KUHIS)",
        category: "Category B",
        location: "Ashanti Region (Gyinyase)",
        type: "Boys",
        maxAggregate: 18,
        popularPrograms: "General Arts, Business, Science",
        badgeColor: "bg-emerald-100 text-emerald-700 border-emerald-200"
    },
    {
        name: "Ghana National College",
        category: "Category B",
        location: "Central Region (Cape Coast)",
        type: "Mixed",
        maxAggregate: 16,
        popularPrograms: "Home Economics, General Arts, Science",
        badgeColor: "bg-emerald-100 text-emerald-700 border-emerald-200"
    },
    {
        name: "Accra Academy (Bleoo)",
        category: "Category A",
        location: "Greater Accra (Bubuashie)",
        type: "Boys",
        maxAggregate: 12,
        popularPrograms: "Business, Science, Arts",
        badgeColor: "bg-blue-100 text-blue-700 border-blue-200"
    },
    {
        name: "St. Thomas Aquinas Senior High",
        category: "Category B",
        location: "Greater Accra (Cantonments)",
        type: "Boys",
        maxAggregate: 19,
        popularPrograms: "Visual Arts, General Science, Arts",
        badgeColor: "bg-emerald-100 text-emerald-700 border-emerald-200"
    },
    {
        name: "O'Reilly Senior High School",
        category: "Category C",
        location: "Greater Accra (Okpoi Gonno)",
        type: "Mixed",
        maxAggregate: 30,
        popularPrograms: "General Arts, Home Economics, Visual Arts",
        badgeColor: "bg-amber-100 text-amber-700 border-amber-200"
    },
    {
        name: "Kaneshie Senior High Technical",
        category: "Category C",
        location: "Greater Accra (Kaneshie)",
        type: "Mixed",
        maxAggregate: 36,
        popularPrograms: "Technical, Vocational, Home Economics",
        badgeColor: "bg-amber-100 text-amber-700 border-amber-200"
    }
];

// ---------------------------------------------------------------------
// PART 2: SELECTING HTML ELEMENTS
// ---------------------------------------------------------------------
// The 3 Mandatory Core Subjects
const gradeEnglish = document.getElementById("gradeEnglish");
const gradeMath = document.getElementById("gradeMath");
const gradeScience = document.getElementById("gradeScience");

// The Candidate Electives
const gradeSocial = document.getElementById("gradeSocial");
const gradeElective1 = document.getElementById("gradeElective1");
const gradeElective2 = document.getElementById("gradeElective2");
const gradeElective3 = document.getElementById("gradeElective3");

// Display Elements
const displayAggregate = document.getElementById("displayAggregate");
const aggregateStatus = document.getElementById("aggregateStatus");
const schoolsList = document.getElementById("schoolsList");
const genderFilter = document.getElementById("genderFilter");
const saveSlipBtn = document.getElementById("saveSlipBtn");
const savedAlert = document.getElementById("savedAlert");
const gradeInputs = document.querySelectorAll(".grade-input");

let currentAggregate = 0;

// ---------------------------------------------------------------------
// PART 3: THE CALCULATION FUNCTION (3 Cores + Best 3 Electives)
// ---------------------------------------------------------------------
function calculateAggregate() {
    // 1. Get values for the 3 Mandatory Cores
    const eng = parseInt(gradeEnglish.value);
    const math = parseInt(gradeMath.value);
    const sci = parseInt(gradeScience.value);

    // Sum of 3 cores
    const coreSum = eng + math + sci;

    // 2. Gather all candidate electives
    const soc = parseInt(gradeSocial.value);
    const el1 = parseInt(gradeElective1.value);
    const el2 = parseInt(gradeElective2.value);
    const el3 = parseInt(gradeElective3.value);

    // 3. Sort electives from lowest (best) grade to highest
    // In BECE, Grade 1 is the best score, Grade 9 is the worst
    const electives = [soc, el1, el2, el3].sort(function(a, b) {
        return a - b;
    });

    // 4. Take the top 3 best electives
    const bestThreeElectives = electives[0] + electives[1] + electives[2];

    // 5. Calculate Final Best 6 Aggregate = 3 Cores + 3 Best Electives
    currentAggregate = coreSum + bestThreeElectives;

    // 6. Update the aggregate number on screen
    displayAggregate.textContent = currentAggregate;

    // 7. Update status badge
    if (currentAggregate <= 9) {
        aggregateStatus.textContent = "🌟 Category A Elite Distinction";
    } else if (currentAggregate <= 15) {
        aggregateStatus.textContent = "✨ Category A / B Competitive";
    } else if (currentAggregate <= 25) {
        aggregateStatus.textContent = "👍 Category B / C Qualified";
    } else {
        aggregateStatus.textContent = "Category C Placement";
    }

    // 8. Refresh matching schools list
    renderQualifiedSchools();
}

// ---------------------------------------------------------------------
// PART 4: DISPLAYING QUALIFIED SCHOOLS (DOM Manipulation)
// ---------------------------------------------------------------------
function renderQualifiedSchools() {
    // Clear old cards first
    schoolsList.innerHTML = "";

    const selectedGender = genderFilter.value;

    // Filter schools based on aggregate and gender
    const qualified = schoolsDB.filter(function(school) {
        const matchesAggregate = currentAggregate <= school.maxAggregate;
        const matchesGender = (selectedGender === "all" || school.type === selectedGender);
        return matchesAggregate && matchesGender;
    });

    // If no schools qualify with this score
    if (qualified.length === 0) {
        schoolsList.innerHTML = `
            <div class="text-center py-8">
                <div class="text-3xl mb-2">🏫</div>
                <p class="text-sm font-semibold text-slate-700">No schools matching this criteria</p>
                <p class="text-xs text-slate-400 mt-1">Try adjusting your gender filter or checking Category C options.</p>
            </div>
        `;
        return;
    }

    // Build a card for each matching school
    qualified.forEach(function(school) {
        const card = document.createElement("div");
        card.className = "p-3.5 bg-slate-50 border border-slate-200 rounded-2xl hover:border-blue-300 transition";

        card.innerHTML = `
            <div class="flex items-center justify-between gap-2 mb-1.5">
                <h4 class="font-bold text-slate-800 text-sm">${school.name}</h4>
                <span class="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${school.badgeColor} shrink-0">
                    ${school.category}
                </span>
            </div>
            <div class="flex items-center gap-2 text-xs text-slate-500 mb-2">
                <span>📍 ${school.location}</span>
                <span>•</span>
                <span class="font-medium text-slate-600">${school.type}</span>
                <span>•</span>
                <span class="text-blue-600 font-semibold">Cut-off: Aggregate ${school.maxAggregate}</span>
            </div>
            <p class="text-[11px] text-slate-400">
                <strong class="text-slate-600">Top Programs:</strong> ${school.popularPrograms}
            </p>
        `;

        schoolsList.appendChild(card);
    });
}

// ---------------------------------------------------------------------
// PART 5: LOCALSTORAGE (Saving & Loading Results)
// ---------------------------------------------------------------------
function saveResultSlip() {
    const slip = {
        eng: gradeEnglish.value,
        math: gradeMath.value,
        sci: gradeScience.value,
        soc: gradeSocial.value,
        el1: gradeElective1.value,
        el2: gradeElective2.value,
        el3: gradeElective3.value
    };

    localStorage.setItem("edughana_result_slip", JSON.stringify(slip));

    savedAlert.classList.remove("hidden");
    setTimeout(function() {
        savedAlert.classList.add("hidden");
    }, 2500);
}

function loadSavedSlip() {
    const saved = localStorage.getItem("edughana_result_slip");
    if (saved) {
        const slip = JSON.parse(saved);
        gradeEnglish.value = slip.eng;
        gradeMath.value = slip.math;
        gradeScience.value = slip.sci;
        gradeSocial.value = slip.soc;
        gradeElective1.value = slip.el1;
        gradeElective2.value = slip.el2;
        gradeElective3.value = slip.el3;
    }
}

// ---------------------------------------------------------------------
// PART 6: EVENT LISTENERS
// ---------------------------------------------------------------------
gradeInputs.forEach(function(input) {
    input.addEventListener("change", calculateAggregate);
});

genderFilter.addEventListener("change", renderQualifiedSchools);
saveSlipBtn.addEventListener("click", saveResultSlip);

// Initialize on page load
loadSavedSlip();
calculateAggregate();