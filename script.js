document.addEventListener("DOMContentLoaded", () => {
    const gradeForm = document.getElementById("grade-form");
    const exportBtn = document.getElementById("export-btn");
    const importFile = document.getElementById("import-file");

    const DOM_SELECTORS = {
        lab: "lab-list",
        quiz: "quiz-list",
    };

    const GRADE_WEIGHTS = {
        homework: 0.1,
        lab: 0.1,
        quiz: 0.2,
        exam: 0.6,
    };

    // creates new score row for given category
    const addScoreRow = (category, score = "", possible = "") => {
        const list = document.getElementById(DOM_SELECTORS[category]);
        if (!list) return null;

        let defaultPossible = '';
        if (category === 'quiz') defaultPossible = 20;
        if (category === 'lab') defaultPossible = 10;
        
        const possibleVal = (possible === "") ? defaultPossible : possible;

        const row = document.createElement("div");
        row.className = "score-row";
        const rowId = `${category}-${list.children.length}`;

        row.innerHTML = `
            <label for="${rowId}-score" class="sr-only">${category} Score</label>
            <input type="number" id="${rowId}-score" class="score-input" data-type="score" placeholder="Score" value="${score}" min="0">
            <span>/</span>
            <label for="${rowId}-possible" class="sr-only">${category} Possible</label>
            <input type="number" id="${rowId}-possible" class="score-input" data-type="possible" placeholder="Possible" value="${possibleVal}" min="0">
            <button type="button" class="btn-remove" aria-label="Remove score">&times;</button>
        `;

        list.appendChild(row);
        return row.querySelector('input[data-type="score"]');
    };

    // calculate final grade, update UI
    const calculateGrade = () => {
        let totalWeight = 0;
        let totalWeightedScore = 0;

        // --- 1. homework (10%) ---
        const hwPercent = parseFloat(document.getElementById("homework-percent").value);
        const hwAvg = isNaN(hwPercent) ? NaN : hwPercent;
        updateBreakdown("hw", hwAvg);
        if (!isNaN(hwAvg)) {
            totalWeightedScore += hwAvg * GRADE_WEIGHTS.homework;
            totalWeight += GRADE_WEIGHTS.homework;
        }

        // --- 2. labs (10%) ---
        const labScores = getScoresFromCategory("lab");
        const labAvg = calculateCategoryAverage(labScores);
        updateBreakdown("lab", labAvg);
        if (!isNaN(labAvg)) {
            totalWeightedScore += labAvg * GRADE_WEIGHTS.lab;
            totalWeight += GRADE_WEIGHTS.lab;
        }

        // --- 3. quizzes (20%) ---
        const quizScores = getScoresFromCategory("quiz");
        const quizAvg = calculateCategoryAverage(quizScores, 2); // Drop 2 lowest
        updateBreakdown("quiz", quizAvg);
        if (!isNaN(quizAvg)) {
            totalWeightedScore += quizAvg * GRADE_WEIGHTS.quiz;
            totalWeight += GRADE_WEIGHTS.quiz;
        }

        // --- 4. exams (60%) ---
        const examAvg = calculateExamAverage();
        updateBreakdown("exam", examAvg);
        if (!isNaN(examAvg)) {
            totalWeightedScore += examAvg * GRADE_WEIGHTS.exam;
            totalWeight += GRADE_WEIGHTS.exam;
        }

        // --- 5. final calculation ---
        let finalPercentage = 0;
        if (totalWeight > 0) {
            finalPercentage = totalWeightedScore / totalWeight;
        } else {
            document.getElementById("final-grade").textContent = "--.-%";
            document.getElementById("letter-grade").textContent = "--";
            return;
        }

        const letter = getLetterGrade(finalPercentage);
        document.getElementById("final-grade").textContent = `${finalPercentage.toFixed(2)}%`;
        document.getElementById("letter-grade").textContent = letter;
    };

    // get all scores from a category's inputs
    const getScoresFromCategory = (category) => {
        const list = document.getElementById(DOM_SELECTORS[category]);
        if (!list) return [];

        const scores = [];
        const rows = list.getElementsByClassName("score-row");

        for (const row of rows) {
            const scoreInput = row.querySelector('input[data-type="score"]');
            const possibleInput = row.querySelector('input[data-type="possible"]');

            const score = parseFloat(scoreInput.value);
            const possible = parseFloat(possibleInput.value);

            if (!isNaN(score) && !isNaN(possible) && possible > 0) {
                scores.push({ score, possible });
            }
        }
        return scores;
    };

    // calculate average % for a category, optionally dropping lowest
    const calculateCategoryAverage = (scores, dropCount = 0) => {
        if (scores.length === 0) return NaN;

        const percentages = scores.map(item => (item.score / item.possible));

        if (scores.length <= dropCount) {
            if (scores.length === 0) return NaN;
            if (scores.length === dropCount) return NaN;
        }
        
        percentages.sort((a, b) => a - b);
        
        const scoresToAverage = percentages.slice(dropCount);

        if (scoresToAverage.length === 0) return NaN;

        const sum = scoresToAverage.reduce((acc, val) => acc + val, 0);
        const average = (sum / scoresToAverage.length) * 100;
        return average;
    };

    // calculate average % for exams
    const calculateExamAverage = () => {
        const exam1 = parseFloat(document.getElementById("exam1").value);
        const exam2 = parseFloat(document.getElementById("exam2").value);
        const exam3 = parseFloat(document.getElementById("exam3").value);
        const ec = parseFloat(document.getElementById("extra-credit").value) || 0;

        let totalEarned = 0;
        let totalPossible = 0;

        if (!isNaN(exam1)) {
            totalEarned += exam1;
            totalPossible += 100;
        }
        if (!isNaN(exam2)) {
            totalEarned += exam2;
            totalPossible += 100;
        }
        if (!isNaN(exam3)) {
            totalEarned += exam3;
            totalPossible += 100;
        }

        totalEarned += ec * 5;

        if (totalPossible === 0) return NaN;

        return (totalEarned / totalPossible) * 100;
    };

    // update breakdown UI for a category
    const updateBreakdown = (categoryKey, average) => {
        const el = document.getElementById(`breakdown-${categoryKey}`);
        if (!el) return;
        el.textContent = isNaN(average) ? "N/A" : `${average.toFixed(2)}%`;
    };

    // get letter grade. based on syllabus scale
    const getLetterGrade = (percentage) => {
        if (percentage >= 90) return "A";
        if (percentage >= 80) return "B";
        if (percentage >= 70) return "C";
        if (percentage >= 60) return "D";
        return "F";
    };

    // save to localStorage
    const saveData = () => {
        const data = {
            homework: document.getElementById("homework-percent").value,
            lab: getScoresFromCategory("lab"),
            quiz: getScoresFromCategory("quiz"),
            exams: {
                exam1: document.getElementById("exam1").value,
                exam2: document.getElementById("exam2").value,
                exam3: document.getElementById("exam3").value,
                ec: document.getElementById("extra-credit").value,
            },
        };
        localStorage.setItem("phys42GradeData", JSON.stringify(data));
    };

    // load/populate from localStorage
    const loadData = () => {
        const dataStr = localStorage.getItem("phys42GradeData");
        if (!dataStr) {
            addScoreRow('lab');
            addScoreRow('quiz');
            return;
        }

        const data = JSON.parse(dataStr);
        
        document.getElementById("homework-percent").value = data.homework || "";

        document.getElementById(DOM_SELECTORS.lab).innerHTML = '';
        document.getElementById(DOM_SELECTORS.quiz).innerHTML = '';

        data.lab?.forEach(item => addScoreRow("lab", item.score, item.possible));
        data.quiz?.forEach(item => addScoreRow("quiz", item.score, item.possible));

        if (data.exams) {
            document.getElementById("exam1").value = data.exams.exam1 || "";
            document.getElementById("exam2").value = data.exams.exam2 || "";
            document.getElementById("exam3").value = data.exams.exam3 || "";
            document.getElementById("extra-credit").value = data.exams.ec || "0";
        }

        if (data.lab?.length === 0) addScoreRow('lab');
        if (data.quiz?.length === 0) addScoreRow('quiz');

        calculateGrade();
    };

    // export JSON file
    const exportData = () => {
        saveData();
        const dataStr = localStorage.getItem("phys42GradeData");
        if (!dataStr) {
            alert("No data to export.");
            return;
        }

        const blob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "phys42_grades.json";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const importData = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const dataStr = event.target.result;
                JSON.parse(dataStr);
                localStorage.setItem("phys42GradeData", dataStr);
                e.target.value = null; 
                location.reload(); 
            } catch (error) {
                alert("Invalid file format. Please upload a valid JSON file.");
                e.target.value = null; 
            }
        };
        reader.readAsText(file);
    };

    // --- listeners ---

    gradeForm.addEventListener("input", () => {
        calculateGrade();
        saveData();
    });

    gradeForm.addEventListener("click", (e) => {
        const target = e.target;

        if (target.classList.contains("btn-add")) {
            const category = target.dataset.category;
            if (category) {
                const newScoreInput = addScoreRow(category);
                if (newScoreInput) newScoreInput.focus();
            }
        }

        if (target.classList.contains("btn-remove")) {
            const row = target.closest(".score-row");
            const list = row.parentElement;
            row.remove();
            
            if (list.children.length === 0) {
                const category = list.id.split('-')[0];
                addScoreRow(category);
            }

            calculateGrade();
            saveData();
        }
    });

    gradeForm.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            const scoreRow = e.target.closest(".score-row");
            if (!scoreRow) return;

            e.preventDefault();
            const list = scoreRow.closest(".score-list");
            if (!list) return;

            const category = list.id.split('-')[0];
            const newScoreInput = addScoreRow(category);
            if (newScoreInput) newScoreInput.focus();
        }
    });

    exportBtn.addEventListener("click", exportData);
    importFile.addEventListener("change", importData);

    // --- init Load ---
    loadData();
    calculateGrade();
});
