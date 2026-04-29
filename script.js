// ========================
// CONSCIOUS DISCIPLINE - NEET 2027
// Core JavaScript (Full Featured)
// ========================

(function() {
    // ---------- DOM Elements ----------
    const elements = {
        // Dashboard
        countdownDisplay: document.getElementById('countdownDisplay'),
        yearProgressFill: document.getElementById('yearProgressFill'),
        weekTaskDone: document.getElementById('weekTaskDone'),
        weekTotalTasks: document.getElementById('weekTotalTasks'),
        weekFillBar: document.getElementById('weekFillBar'),
        latestTestScoreDash: document.getElementById('latestTestScoreDash'),
        quickTasksList: document.getElementById('quickTasksList'),
        motivationTip: document.getElementById('motivationTip'),
        rankEstimate: document.getElementById('rankEstimate'),
        
        // Weekly Planner
        weeklyTasksContainer: document.getElementById('weeklyTasksContainer'),
        weeklyTestScoreInput: document.getElementById('weeklyTestScore'),
        saveWeeklyScoreBtn: document.getElementById('saveWeeklyScoreBtn'),
        resetWeeklyTasksBtn: document.getElementById('resetWeeklyTasksBtn'),
        weeklyScoreFeedback: document.getElementById('weeklyScoreFeedback'),
        
        // Revision Sprint
        sprintWeeksContainer: document.getElementById('sprintWeeksContainer'),
        resetSprintProgress: document.getElementById('resetSprintProgress'),
        
        // Progress Tracker
        syllabusPercentText: document.getElementById('syllabusPercentText'),
        syllabusChartFill: document.getElementById('syllabusChartFill'),
        consistencyRate: document.getElementById('consistencyRate'),
        streakCount: document.getElementById('streakCount'),
        resetAllDataBtn: document.getElementById('resetAllDataBtn'),
        
        // Rank Lab
        mockScoreInput: document.getElementById('mockScoreInput'),
        estimateRankBtn: document.getElementById('estimateRankBtn'),
        rankResult: document.getElementById('rankResult'),
        suggestionBox: document.getElementById('suggestionBox'),
        
        // General
        liveDate: document.getElementById('liveDate'),
        refreshAdviceBtn: document.getElementById('refreshAdviceBtn')
    };

    // ---------- Data Models ----------
    let weeklyTasks = [];       // { text, completed }
    let weeklyScores = [];      // { date, score }
    let sprintWeeks = [];       // { weekIndex, title, description, completed }
    let syllabusPercent = 18;   // dynamic (0-100)

    // Default weekly tasks (customise as needed)
    const DEFAULT_TASKS = [
        "Physics: 2 chapters + 40 numericals (NCERT + HCV)",
        "Chemistry: Inorganic + Organic revision + 30 MCQs",
        "Biology: 4 NCERT units + 100 PYQs",
        "Previous week weak topics revision (2 hrs)",
        "One full mock (subjectwise or part syllabus)",
        "Analyse mistakes & maintain error log",
        "Daily formula/ diagram revision (30 min)"
    ];

    // 12‑week revision sprint (3 months core + extra)
    const SPRINT_PLAN = [
        { title: "Phase 1 (Week 1-2)", desc: "NCERT Physics: Mechanics + Kinematics | Bio: Unit 1-2 (Diversity)" },
        { title: "Phase 2 (Week 3-4)", desc: "Chemistry: Mole Concept, Thermochem | Bio: Human Physiology I" },
        { title: "Phase 3 (Week 5-6)", desc: "Physics: Optics + Waves | Inorganic: Periodic Table & Bonding" },
        { title: "Phase 4 (Week 7-8)", desc: "Organic: GOC, Hydrocarbons | Bio: Genetics & Evolution" },
        { title: "Phase 5 (Week 9-10)", desc: "Full syllabus mocks (3 per week) + Weak area revival" },
        { title: "Phase 6 (Week 11-12)", desc: "NCERT Exemplar + PYQ marathon + Diagrams & flowcharts" }
    ];

    // Chart instances
    let scoreChart = null;
    let syllabusPieChart = null;

    // ---------- Helper: Date & Countdown ----------
    function getNeet2027Date() {
        // NEET 2027: 1st Sunday of May 2027
        let date = new Date(2027, 4, 1); // May 1, 2027
        while (date.getDay() !== 0) date.setDate(date.getDate() + 1);
        return date;
    }

    function updateCountdown() {
        const target = getNeet2027Date();
        const now = new Date();
        const diff = target - now;
        if (diff <= 0) {
            if (elements.countdownDisplay) elements.countdownDisplay.innerText = "0d 0h 0m";
            return;
        }
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        if (elements.countdownDisplay) {
            elements.countdownDisplay.innerText = `${days}d ${hours}h ${minutes}m`;
        }
        // Academic year progress (from May 2026 to May 2027)
        const start = new Date(2026, 4, 1);
        const total = target - start;
        const elapsed = now - start;
        let percent = Math.min(100, Math.max(0, (elapsed / total) * 100));
        if (elements.yearProgressFill) elements.yearProgressFill.style.width = percent + "%";
    }

    // ---------- LocalStorage CRUD ----------
    function loadData() {
        const storedTasks = localStorage.getItem("CD_tasks");
        weeklyTasks = storedTasks ? JSON.parse(storedTasks) : DEFAULT_TASKS.map(t => ({ text: t, completed: false }));

        const storedScores = localStorage.getItem("CD_scores");
        weeklyScores = storedScores ? JSON.parse(storedScores) : [];

        const storedSprint = localStorage.getItem("CD_sprint");
        if (storedSprint) {
            sprintWeeks = JSON.parse(storedSprint);
        } else {
            sprintWeeks = SPRINT_PLAN.map((item, idx) => ({
                weekIndex: idx,
                title: item.title,
                description: item.desc,
                completed: false
            }));
        }

        const storedSyllabus = localStorage.getItem("CD_syllabus");
        syllabusPercent = storedSyllabus ? parseInt(storedSyllabus) : 18;
        if (isNaN(syllabusPercent)) syllabusPercent = 18;
    }

    function saveAll() {
        localStorage.setItem("CD_tasks", JSON.stringify(weeklyTasks));
        localStorage.setItem("CD_scores", JSON.stringify(weeklyScores));
        localStorage.setItem("CD_sprint", JSON.stringify(sprintWeeks));
        localStorage.setItem("CD_syllabus", syllabusPercent);
    }

    // ---------- Syllabus & Progress Calculators ----------
    function recalcSyllabusPercent() {
        // Based on weekly task completion + average test score
        let taskCompletion = 0;
        if (weeklyTasks.length) {
            const doneCount = weeklyTasks.filter(t => t.completed).length;
            taskCompletion = (doneCount / weeklyTasks.length) * 100;
        }
        let avgScore = 0;
        if (weeklyScores.length) {
            const sum = weeklyScores.reduce((acc, s) => acc + s.score, 0);
            avgScore = sum / weeklyScores.length;
        }
        // Formula: 30% from tasks, 30% from scores, base 15%
        let newPercent = Math.floor(15 + (taskCompletion * 0.3) + (avgScore / 720) * 30);
        newPercent = Math.min(95, Math.max(12, newPercent));
        syllabusPercent = newPercent;
        saveAll();
        return syllabusPercent;
    }

    function updateProgressUI() {
        if (elements.syllabusPercentText) elements.syllabusPercentText.innerText = syllabusPercent + "%";
        if (elements.syllabusChartFill) elements.syllabusChartFill.style.width = syllabusPercent + "%";
        
        // Update pie chart if exists
        if (syllabusPieChart) {
            syllabusPieChart.data.datasets[0].data = [syllabusPercent, 100 - syllabusPercent];
            syllabusPieChart.update();
        }
        
        // Consistency rate
        const doneTasks = weeklyTasks.filter(t => t.completed).length;
        const consistency = weeklyTasks.length ? Math.round((doneTasks / weeklyTasks.length) * 100) : 0;
        if (elements.consistencyRate) elements.consistencyRate.innerText = consistency + "%";
        
        // Streak: weeks with test score > 400
        let streak = 0;
        for (let i = weeklyScores.length - 1; i >= 0; i--) {
            if (weeklyScores[i].score > 400) streak++;
            else break;
        }
        if (elements.streakCount) elements.streakCount.innerText = streak;
    }

    // ---------- Weekly Tasks Render ----------
    function renderWeeklyTasks() {
        if (!elements.weeklyTasksContainer) return;
        elements.weeklyTasksContainer.innerHTML = "";
        weeklyTasks.forEach((task, idx) => {
            const taskDiv = document.createElement("div");
            taskDiv.className = "task-item";
            const cb = document.createElement("input");
            cb.type = "checkbox";
            cb.checked = task.completed;
            cb.addEventListener("change", (e) => {
                weeklyTasks[idx].completed = e.target.checked;
                saveAll();
                renderWeeklyTasks();
                updateDashboardWidgets();
                updateProgressUI();
                recalcSyllabusPercent();
                updateProgressUI();
            });
            const span = document.createElement("span");
            span.innerText = task.text;
            taskDiv.appendChild(cb);
            taskDiv.appendChild(span);
            elements.weeklyTasksContainer.appendChild(taskDiv);
        });
        
        // Update counts
        const total = weeklyTasks.length;
        const done = weeklyTasks.filter(t => t.completed).length;
        if (elements.weekTotalTasks) elements.weekTotalTasks.innerText = total;
        if (elements.weekTaskDone) elements.weekTaskDone.innerText = done;
        const percent = total ? (done / total) * 100 : 0;
        if (elements.weekFillBar) elements.weekFillBar.style.width = percent + "%";
    }

    // Dashboard quick updates
    function updateDashboardWidgets() {
        const done = weeklyTasks.filter(t => t.completed).length;
        if (elements.weekTaskDone) elements.weekTaskDone.innerText = done;
        const lastScore = weeklyScores.length ? weeklyScores[weeklyScores.length - 1].score : "--";
        if (elements.latestTestScoreDash) elements.latestTestScoreDash.innerText = lastScore;
        
        // Quick tasks list (first 3)
        if (elements.quickTasksList) {
            elements.quickTasksList.innerHTML = "";
            weeklyTasks.slice(0, 3).forEach(task => {
                const li = document.createElement("li");
                li.innerHTML = task.completed ? `<s>${task.text}</s>` : task.text;
                elements.quickTasksList.appendChild(li);
            });
        }
        
        // Refresh rank estimate text on dashboard
        if (lastScore !== "--" && !isNaN(lastScore)) {
            const rankText = estimateRankCategory(lastScore);
            if (elements.rankEstimate) elements.rankEstimate.innerText = `Estimated Rank: ${rankText}`;
        } else {
            if (elements.rankEstimate) elements.rankEstimate.innerText = "Add test score →";
        }
    }

    // ---------- Test Scores ----------
    function addWeeklyScore(score) {
        const now = new Date();
        const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
        const dateStr = weekStart.toISOString().slice(0,10);
        weeklyScores.push({ date: dateStr, score: score });
        // Keep only last 10 entries for chart clarity
        if (weeklyScores.length > 10) weeklyScores.shift();
        saveAll();
        if (elements.weeklyScoreFeedback) {
            elements.weeklyScoreFeedback.innerHTML = "✅ Score saved! Trend updated.";
            setTimeout(() => { if(elements.weeklyScoreFeedback) elements.weeklyScoreFeedback.innerHTML = ""; }, 2000);
        }
        updateScoreChart();
        recalcSyllabusPercent();
        updateProgressUI();
        updateDashboardWidgets();
        updateRankLabSuggestion();
    }

    // ---------- Charts (Score Trend & Syllabus Pie) ----------
    function updateScoreChart() {
        const canvas = document.getElementById("scoreTrendChart");
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        const labels = weeklyScores.map((_, i) => `Week ${i+1}`);
        const data = weeklyScores.map(s => s.score);
        if (scoreChart) scoreChart.destroy();
        scoreChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Test Score / 720',
                    data: data,
                    borderColor: '#2b9eff',
                    backgroundColor: 'rgba(43,158,255,0.1)',
                    tension: 0.2,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: { legend: { labels: { color: '#edf4ff' } } }
            }
        });
    }

    function initSyllabusPieChart() {
        const canvas = document.getElementById("syllabusPieChart");
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        if (syllabusPieChart) syllabusPieChart.destroy();
        syllabusPieChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Covered', 'Remaining'],
                datasets: [{
                    data: [syllabusPercent, 100 - syllabusPercent],
                    backgroundColor: ['#2b9eff', '#2a3a60'],
                    borderWidth: 0
                }]
            },
            options: { responsive: true, maintainAspectRatio: true }
        });
    }

    // ---------- Revision Sprint Render ----------
    function renderSprint() {
        if (!elements.sprintWeeksContainer) return;
        elements.sprintWeeksContainer.innerHTML = "";
        sprintWeeks.forEach((week, idx) => {
            const card = document.createElement("div");
            card.className = "task-item";
            const cb = document.createElement("input");
            cb.type = "checkbox";
            cb.checked = week.completed;
            cb.addEventListener("change", () => {
                sprintWeeks[idx].completed = cb.checked;
                saveAll();
                renderSprint();
                updateProgressUI(); // update consistency if needed
            });
            const textDiv = document.createElement("div");
            textDiv.style.flex = "1";
            textDiv.innerHTML = `<strong>${week.title}</strong><br><span style="font-size:0.8rem;">${week.description}</span>`;
            card.appendChild(cb);
            card.appendChild(textDiv);
            elements.sprintWeeksContainer.appendChild(card);
        });
    }

    // ---------- Rank Estimation & Advice ----------
    function estimateRankCategory(score) {
        if (score >= 680) return "AIR 1-200";
        if (score >= 650) return "AIR 200-800";
        if (score >= 600) return "AIR 800-4000";
        if (score >= 550) return "AIR 4000-15000";
        if (score >= 500) return "AIR 15000-40000";
        if (score >= 400) return "AIR 40000-100000";
        return "Below 1.5L, need focused effort";
    }

    function updateRankLabSuggestion() {
        if (!elements.suggestionBox) return;
        const lastScore = weeklyScores.length ? weeklyScores[weeklyScores.length-1].score : null;
        let suggestion = "📌 Add your weekly test score in 'Weekly Planner' to get personalised advice.";
        if (lastScore !== null) {
            if (lastScore < 450) suggestion = "🎯 Focus on NCERT line‑by‑line & solve 100+ PYQs per week. Strengthen Biology & Inorganic Chemistry.";
            else if (lastScore < 550) suggestion = "📈 Increase mock frequency (2 per week). Analyse every mistake using error log. Revise weak chapters from Revision Sprint.";
            else if (lastScore < 650) suggestion = "🚀 Excellent! Maintain accuracy & speed. Do full syllabus mocks under timed conditions. Minor improvements yield top ranks.";
            else suggestion = "🏆 Topper trajectory! Keep revising and attempt All India mock series. Avoid silly mistakes.";
        }
        elements.suggestionBox.innerHTML = suggestion;
    }

    function displayRankEstimate() {
        if (!elements.mockScoreInput || !elements.rankResult) return;
        const score = parseInt(elements.mockScoreInput.value);
        if (isNaN(score) || score < 0 || score > 720) {
            elements.rankResult.innerHTML = "❌ Please enter a valid score (0-720).";
            return;
        }
        const rankText = estimateRankCategory(score);
        let tips = "";
        if (score >= 620) tips = "💡 You're on track for top 2000. Keep revising and taking mocks.";
        else if (score >= 500) tips = "💡 Improve by focusing on high‑weightage topics (Modern Physics, Chemical Bonding, Ecology).";
        else tips = "💡 Dedicate 2 extra hours daily to NCERT reading and previous year questions.";
        elements.rankResult.innerHTML = `📊 Predicted Rank: ${rankText}<br>${tips}`;
    }

    // ---------- Reset Functions ----------
    function resetWeeklyTasks() {
        weeklyTasks = weeklyTasks.map(t => ({ ...t, completed: false }));
        saveAll();
        renderWeeklyTasks();
        updateDashboardWidgets();
        recalcSyllabusPercent();
        updateProgressUI();
    }

    function resetSprint() {
        sprintWeeks = SPRINT_PLAN.map((item, idx) => ({
            weekIndex: idx,
            title: item.title,
            description: item.desc,
            completed: false
        }));
        saveAll();
        renderSprint();
        updateProgressUI();
    }

    function resetAllAppData() {
        if (confirm("⚠️ WARNING: This will erase all tasks, test scores, revision progress. Are you sure?")) {
            localStorage.clear();
            loadData();
            saveAll();
            renderWeeklyTasks();
            renderSprint();
            updateScoreChart();
            initSyllabusPieChart();
            updateDashboardWidgets();
            updateProgressUI();
            recalcSyllabusPercent();
            updateRankLabSuggestion();
            if (elements.weeklyScoreFeedback) elements.weeklyScoreFeedback.innerHTML = "🗑️ All data reset.";
        }
    }

    // ---------- Navigation & Page Switching ----------
    function switchPage(pageId) {
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active-page'));
        const targetPage = document.getElementById(pageId);
        if (targetPage) targetPage.classList.add('active-page');
        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
        const activeBtn = document.querySelector(`.nav-btn[data-page="${pageId}"]`);
        if (activeBtn) activeBtn.classList.add('active');
        
        // Refresh page-specific components
        if (pageId === 'progress') {
            updateScoreChart();
            initSyllabusPieChart();
            updateProgressUI();
        }
        if (pageId === 'rank') updateRankLabSuggestion();
        if (pageId === 'weekly') renderWeeklyTasks();
        if (pageId === 'revision') renderSprint();
        if (pageId === 'dashboard') updateDashboardWidgets();
    }

    // ---------- Live Date & Random Motivation ----------
    function updateLiveDate() {
        if (elements.liveDate) {
            const now = new Date();
            elements.liveDate.innerText = now.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
        }
    }

    const motivationQuotes = [
        "✨ Consistency > Intensity. Small daily gains = big rank jump.",
        "📖 Your only competition is yesterday's version of you.",
        "⚡ A 3‑month sprint can rewrite your NEET story.",
        "🧠 Revise like your rank depends on it — because it does.",
        "🎯 80% syllabus with 100% confidence beats 100% syllabus with confusion."
    ];
    function refreshMotivation() {
        if (elements.motivationTip) {
            const randomIdx = Math.floor(Math.random() * motivationQuotes.length);
            elements.motivationTip.innerText = motivationQuotes[randomIdx];
        }
    }

    // ---------- Event Binding ----------
    function bindEvents() {
        if (elements.saveWeeklyScoreBtn) {
            elements.saveWeeklyScoreBtn.addEventListener('click', () => {
                const val = parseInt(elements.weeklyTestScoreInput.value);
                if (!isNaN(val) && val >= 0 && val <= 720) addWeeklyScore(val);
                else if (elements.weeklyScoreFeedback) elements.weeklyScoreFeedback.innerHTML = "⚠️ Enter score between 0-720.";
            });
        }
        if (elements.resetWeeklyTasksBtn) elements.resetWeeklyTasksBtn.addEventListener('click', resetWeeklyTasks);
        if (elements.resetSprintProgress) elements.resetSprintProgress.addEventListener('click', resetSprint);
        if (elements.resetAllDataBtn) elements.resetAllDataBtn.addEventListener('click', resetAllAppData);
        if (elements.estimateRankBtn) elements.estimateRankBtn.addEventListener('click', displayRankEstimate);
        if (elements.refreshAdviceBtn) elements.refreshAdviceBtn.addEventListener('click', () => {
            refreshMotivation();
            updateRankLabSuggestion();
        });
        
        // Navigation buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const page = btn.getAttribute('data-page');
                if (page) switchPage(page);
            });
        });
        // Also support data-nav on any element
        document.querySelectorAll('[data-nav]').forEach(el => {
            el.addEventListener('click', (e) => {
                e.preventDefault();
                const page = el.getAttribute('data-nav');
                if (page) switchPage(page);
            });
        });
    }

    // ---------- Initialisation ----------
    function init() {
        loadData();
        bindEvents();
        renderWeeklyTasks();
        renderSprint();
        updateCountdown();
        updateDashboardWidgets();
        updateScoreChart();
        initSyllabusPieChart();
        updateProgressUI();
        recalcSyllabusPercent();
        updateRankLabSuggestion();
        refreshMotivation();
        updateLiveDate();
        
        setInterval(updateCountdown, 1000);
        setInterval(updateLiveDate, 60000);
    }
    
    // Start everything when DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
