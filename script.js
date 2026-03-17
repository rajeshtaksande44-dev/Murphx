/* =========================
   MURPHXPREP - PREMIUM RAINY GLASS JS
   Fully interactive app logic
   ========================= */

(() => {
  "use strict";

  /* =========================
     APP STATE
     ========================= */
  const STORAGE_KEYS = {
    customTests: "murphxprep_custom_tests",
    streak: "murphxprep_streak",
    dailyChallenge: "murphxprep_daily_challenge",
    mindfulStats: "murphxprep_mindful_stats",
    profile: "murphxprep_profile"
  };

  const appState = {
    activeSection: "dashboard",
    timerInterval: null,
    timerSeconds: 25 * 60,
    timerRunning: false,
    customTests: [],
    sidebarOpen: false,
    dailyChallenges: [
      {
        title: "45-Minute Rank Push",
        description: "Solve 30 Physics questions in 45 minutes with no distractions. Focus on speed + accuracy.",
        duration: 45,
        type: "physics"
      },
      {
        title: "NCERT Sniper Drill",
        description: "Read 12 Biology NCERT pages and note 10 hidden facts that can become direct NEET MCQs.",
        duration: 35,
        type: "biology"
      },
      {
        title: "Chemistry Precision Set",
        description: "Attempt 25 mixed Chemistry MCQs and keep accuracy above 85%.",
        duration: 40,
        type: "chemistry"
      },
      {
        title: "Mindful Revision Sprint",
        description: "Revise one weak chapter with deep focus for 30 minutes. No phone. No breaks.",
        duration: 30,
        type: "focus"
      }
    ],
    aiResponses: [
      "Good. Stay sharp. Your next move should be 45 minutes of focused problem-solving on your weakest chapter.",
      "If your accuracy is below 80%, stop chasing speed. First fix conceptual leaks, then push pace.",
      "NEET toppers don’t just study more. They repeat high-yield concepts until mistakes disappear.",
      "Your best next action: solve 20 Physics numericals from one chapter and track error patterns.",
      "You don’t need motivation right now. You need execution. Open the next test and start.",
      "For Rank 1 mindset: reduce emotional friction. Sit, start, finish. Repeat daily.",
      "Biology gains come from NCERT repetition. Chemistry gains come from precision. Physics gains come from battle.",
      "If you feel overwhelmed, simplify: one chapter, one timer, one mission."
    ]
  };

  const starterTests = [
    {
      id: "t1",
      title: "NEET Physics Shockwave Test",
      subject: "Physics",
      difficulty: "Hard",
      questions: 45,
      duration: 45,
      description: "High-concept numericals, traps, and mixed conceptual questions built for top-rankers."
    },
    {
      id: "t2",
      title: "NCERT Bio Sniper Mock",
      subject: "Biology",
      difficulty: "Medium",
      questions: 90,
      duration: 50,
      description: "Direct + twisted NCERT line-based questions with diagram traps and PYQ-style framing."
    },
    {
      id: "t3",
      title: "Organic Reaction Master Drill",
      subject: "Chemistry",
      difficulty: "Hard",
      questions: 35,
      duration: 40,
      description: "Reaction mechanism, named reactions, conversion logic, and elimination traps."
    }
  ];

  /* =========================
     DOM HELPERS
     ========================= */
  const $ = (selector, parent = document) => parent.querySelector(selector);
  const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];

  const safeParse = (value, fallback) => {
    try {
      return JSON.parse(value) ?? fallback;
    } catch {
      return fallback;
    }
  };

  const saveToStorage = (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
  };

  const loadFromStorage = (key, fallback) => {
    return safeParse(localStorage.getItem(key), fallback);
  };

  const formatDateKey = (date = new Date()) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const randomFrom = (arr) => arr[Math.floor(Math.random() * arr.length)];

  const createEl = (tag, className = "", html = "") => {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (html) el.innerHTML = html;
    return el;
  };

  /* =========================
     INIT
     ========================= */
  document.addEventListener("DOMContentLoaded", initApp);

  function initApp() {
    loadAppData();
    bindGlobalFunctions();
    bindNavigation();
    bindTopbar();
    bindModal();
    bindTimer();
    bindAIChat();
    renderDailyChallenge();
    renderTests();
    renderStreak();
    renderTodayMeta();
    hydrateProfile();
    setActiveSection("dashboard");
    injectWelcomeMessage();
    updatePageTitle("Dashboard");
  }

  /* =========================
     LOAD DATA
     ========================= */
  function loadAppData() {
    const storedCustomTests = loadFromStorage(STORAGE_KEYS.customTests, []);
    appState.customTests = Array.isArray(storedCustomTests) ? storedCustomTests : [];

    const storedStreak = loadFromStorage(STORAGE_KEYS.streak, {
      count: 1,
      lastActiveDate: formatDateKey(),
      totalSessions: 0
    });

    const today = formatDateKey();
    if (!storedStreak.lastActiveDate) {
      storedStreak.lastActiveDate = today;
    }

    appState.streak = storedStreak;

    const storedMindfulStats = loadFromStorage(STORAGE_KEYS.mindfulStats, {
      sessions: 0,
      totalMinutes: 0
    });
    appState.mindfulStats = storedMindfulStats;

    const storedProfile = loadFromStorage(STORAGE_KEYS.profile, {
      name: "Aditya",
      target: "NEET 2026 Rank Mission",
      initials: "A"
    });
    appState.profile = storedProfile;
  }

  /* =========================
     EXPOSE GLOBALS FOR INLINE HTML
     ========================= */
  function bindGlobalFunctions() {
    window.showSection = setActiveSection;
    window.showCreateModal = openCreateTestModal;
    window.closeCreateModal = closeCreateTestModal;
    window.startDailyChallenge = startDailyChallenge;
    window.startMindfulMode = startMindfulMode;
    window.toggleSidebar = toggleSidebar;
    window.sendAIMessage = sendAIMessage;
    window.createCustomTest = handleCreateTestSubmit;
    window.startPomodoro = startPomodoro;
    window.pausePomodoro = pausePomodoro;
    window.resetPomodoro = resetPomodoro;
  }

  /* =========================
     NAVIGATION
     ========================= */
  function bindNavigation() {
    const navButtons = $$(".nav-btn[data-section]");
    navButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const section = btn.dataset.section;
        setActiveSection(section);
      });
    });
  }

  function setActiveSection(sectionId = "dashboard") {
    appState.activeSection = sectionId;

    $$(".page-section").forEach((section) => {
      section.classList.remove("active");
      if (section.id === sectionId) section.classList.add("active");
    });

    $$(".nav-btn[data-section]").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.section === sectionId);
    });

    const sectionNames = {
      dashboard: "Dashboard",
      tests: "Mock Tests",
      mentor: "AI Mentor",
      leaderboard: "Leaderboard",
      profile: "Profile"
    };

    updatePageTitle(sectionNames[sectionId] || "MurphxPrep");

    if (window.innerWidth <= 992) {
      closeSidebar();
    }
  }

  function updatePageTitle(title) {
    const pageTitle = $("#pageTitle");
    const pageSubtitle = $("#pageSubtitle");

    if (pageTitle) pageTitle.textContent = title;

    if (pageSubtitle) {
      const subtitleMap = {
        Dashboard: "Rainy focus mode. Build your rank in silence.",
        "Mock Tests": "Create, filter, and attack tests like a topper.",
        "AI Mentor": "Ask, refine, and execute with precision.",
        Leaderboard: "Compete with your highest self.",
        Profile: "Tune your mission, focus, and study identity."
      };
      pageSubtitle.textContent = subtitleMap[title] || "Study sharper. Stay calmer.";
    }
  }

  /* =========================
     TOPBAR / SIDEBAR
     ========================= */
  function bindTopbar() {
    const menuBtn = $("#menuToggle");
    if (menuBtn) {
      menuBtn.addEventListener("click", toggleSidebar);
    }

    document.addEventListener("click", (e) => {
      const sidebar = $("#sidebar");
      const menuToggle = $("#menuToggle");

      if (
        window.innerWidth <= 992 &&
        sidebar &&
        appState.sidebarOpen &&
        !sidebar.contains(e.target) &&
        menuToggle &&
        !menuToggle.contains(e.target)
      ) {
        closeSidebar();
      }
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 992) {
        const sidebar = $("#sidebar");
        if (sidebar) sidebar.classList.remove("open");
        appState.sidebarOpen = false;
      }
    });
  }

  function toggleSidebar() {
    const sidebar = $("#sidebar");
    if (!sidebar) return;

    appState.sidebarOpen = !appState.sidebarOpen;
    sidebar.classList.toggle("open", appState.sidebarOpen);
  }

  function closeSidebar() {
    const sidebar = $("#sidebar");
    if (!sidebar) return;
    appState.sidebarOpen = false;
    sidebar.classList.remove("open");
  }

  /* =========================
     DAILY META
     ========================= */
  function renderTodayMeta() {
    const dateEl = $("#todayDate");
    if (!dateEl) return;

    const now = new Date();
    const formatted = now.toLocaleDateString(undefined, {
      weekday: "long",
      day: "numeric",
      month: "long"
    });

    dateEl.textContent = formatted;
  }

  /* =========================
     STREAK SYSTEM
     ========================= */
  function renderStreak() {
    const streakCountEl = $("#streakCount");
    const streakProgressEl = $("#streakProgress");
    const streakTextEl = $("#streakText");

    const today = formatDateKey();
    const last = appState.streak.lastActiveDate;

    if (last !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayKey = formatDateKey(yesterday);

      if (last === yesterdayKey) {
        appState.streak.count += 1;
      } else {
        appState.streak.count = 1;
      }

      appState.streak.lastActiveDate = today;
      saveToStorage(STORAGE_KEYS.streak, appState.streak);
    }

    const progress = Math.min((appState.streak.count / 7) * 100, 100);

    if (streakCountEl) streakCountEl.textContent = `${appState.streak.count} Day Streak`;
    if (streakProgressEl) streakProgressEl.style.width = `${progress}%`;
    if (streakTextEl) {
      streakTextEl.textContent = `You are ${Math.max(0, 7 - appState.streak.count)} days away from a 7-day focus streak.`;
    }
  }

  function incrementStudySession(minutes = 25) {
    appState.streak.totalSessions = (appState.streak.totalSessions || 0) + 1;
    appState.streak.lastActiveDate = formatDateKey();
    saveToStorage(STORAGE_KEYS.streak, appState.streak);

    appState.mindfulStats.sessions += 1;
    appState.mindfulStats.totalMinutes += minutes;
    saveToStorage(STORAGE_KEYS.mindfulStats, appState.mindfulStats);

    renderStreak();
    updateMindfulStatsUI();
  }

  /* =========================
     DAILY CHALLENGE
     ========================= */
  function renderDailyChallenge() {
    const titleEl = $("#challengeTitle");
    const descEl = $("#challengeDescription");
    const badgeEl = $("#challengeBadge");

    if (!titleEl || !descEl) return;

    const todayKey = formatDateKey();
    let stored = loadFromStorage(STORAGE_KEYS.dailyChallenge, null);

    if (!stored || stored.date !== todayKey) {
      stored = {
        date: todayKey,
        challenge: randomFrom(appState.dailyChallenges)
      };
      saveToStorage(STORAGE_KEYS.dailyChallenge, stored);
    }

    appState.currentChallenge = stored.challenge;

    titleEl.textContent = stored.challenge.title;
    descEl.textContent = stored.challenge.description;

    if (badgeEl) {
      badgeEl.textContent = `${stored.challenge.duration} min`;
    }
  }

  function startDailyChallenge() {
    if (!appState.currentChallenge) {
      showToast("No challenge loaded yet.");
      return;
    }

    appState.timerSeconds = appState.currentChallenge.duration * 60;
    updateTimerUI();
    startPomodoro();
    showToast(`Challenge started: ${appState.currentChallenge.title}`);
  }

  /* =========================
     POMODORO / FOCUS TIMER
     ========================= */
  function bindTimer() {
    updateTimerUI();
    updateMindfulStatsUI();
  }

  function startPomodoro() {
    if (appState.timerRunning) return;

    appState.timerRunning = true;

    appState.timerInterval = setInterval(() => {
      if (appState.timerSeconds > 0) {
        appState.timerSeconds -= 1;
        updateTimerUI();
      } else {
        pausePomodoro();
        incrementStudySession(25);
        showToast("Focus session complete. Warrior mode unlocked.");
        pulseFocusComplete();
      }
    }, 1000);

    updateTimerButtons();
  }

  function pausePomodoro() {
    appState.timerRunning = false;
    clearInterval(appState.timerInterval);
    appState.timerInterval = null;
    updateTimerButtons();
  }

  function resetPomodoro() {
    pausePomodoro();
    appState.timerSeconds = 25 * 60;
    updateTimerUI();
    showToast("Timer reset to 25:00");
  }

  function updateTimerUI() {
    const timerEl = $("#timerDisplay");
    if (!timerEl) return;

    const mins = Math.floor(appState.timerSeconds / 60);
    const secs = appState.timerSeconds % 60;
    timerEl.textContent = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }

  function updateTimerButtons() {
    const startBtn = $("#startTimerBtn");
    const pauseBtn = $("#pauseTimerBtn");

    if (startBtn) startBtn.disabled = appState.timerRunning;
    if (pauseBtn) pauseBtn.disabled = !appState.timerRunning;
  }

  function pulseFocusComplete() {
    const timerCard = $("#timerCard");
    if (!timerCard) return;

    timerCard.style.transform = "scale(1.02)";
    timerCard.style.boxShadow = "0 0 0 1px rgba(34,197,94,0.25), 0 12px 40px rgba(34,197,94,0.18)";
    setTimeout(() => {
      timerCard.style.transform = "";
      timerCard.style.boxShadow = "";
    }, 1200);
  }

  function startMindfulMode() {
    appState.timerSeconds = 15 * 60;
    updateTimerUI();
    startPomodoro();
    showToast("Mindful Mode started. 15 minutes of silent deep focus.");
  }

  function updateMindfulStatsUI() {
    const mindfulSessions = $("#mindfulSessions");
    const mindfulMinutes = $("#mindfulMinutes");

    if (mindfulSessions) mindfulSessions.textContent = appState.mindfulStats.sessions;
    if (mindfulMinutes) mindfulMinutes.textContent = appState.mindfulStats.totalMinutes;
  }

  /* =========================
     TESTS RENDERING
     ========================= */
  function renderTests() {
    const testGrid = $("#testsGrid");
    if (!testGrid) return;

    const allTests = [...starterTests, ...appState.customTests];
    testGrid.innerHTML = "";

    if (!allTests.length) {
      testGrid.innerHTML = `
        <div class="empty-state glass" style="grid-column:1/-1;">
          <i class="fas fa-flask"></i>
          <h3>No tests found</h3>
          <p>Create your first custom Murphx test and start building your rank engine.</p>
        </div>
      `;
      return;
    }

    allTests.forEach((test) => {
      const card = createEl("div", "test-card glass");
      card.innerHTML = `
        <div class="test-top">
          <span class="test-tag">${escapeHtml(test.subject)}</span>
          <span class="test-level">${escapeHtml(test.difficulty)}</span>
        </div>
        <h3>${escapeHtml(test.title)}</h3>
        <p>${escapeHtml(test.description)}</p>
        <div class="test-meta">
          <span><i class="fas fa-list-check"></i> ${test.questions} Qs</span>
          <span><i class="fas fa-clock"></i> ${test.duration} min</span>
        </div>
        <div class="test-actions">
          <button class="btn btn-primary start-test-btn" data-id="${test.id}">
            <i class="fas fa-bolt"></i> Start Test
          </button>
          ${
            isCustomTest(test.id)
              ? `<button class="btn btn-danger delete-test-btn" data-id="${test.id}">
                  <i class="fas fa-trash"></i> Delete
                 </button>`
              : `<button class="btn btn-secondary review-test-btn" data-id="${test.id}">
                  <i class="fas fa-eye"></i> Preview
                 </button>`
          }
        </div>
      `;
      testGrid.appendChild(card);
    });

    bindTestCardActions();
  }

  function bindTestCardActions() {
    $$(".start-test-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const testId = btn.dataset.id;
        const test = findTestById(testId);
        if (!test) return;

        appState.timerSeconds = test.duration * 60;
        updateTimerUI();
        setActiveSection("dashboard");
        showToast(`Loaded "${test.title}" into focus timer. Attack it.`);
      });
    });

    $$(".review-test-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const testId = btn.dataset.id;
        const test = findTestById(testId);
        if (!test) return;
        showToast(`Preview: ${test.title} • ${test.questions} questions • ${test.duration} mins`);
      });
    });

    $$(".delete-test-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const testId = btn.dataset.id;
        deleteCustomTest(testId);
      });
    });
  }

  function findTestById(id) {
    return [...starterTests, ...appState.customTests].find((t) => t.id === id);
  }

  function isCustomTest(id) {
    return appState.customTests.some((t) => t.id === id);
  }

  function deleteCustomTest(id) {
    appState.customTests = appState.customTests.filter((t) => t.id !== id);
    saveToStorage(STORAGE_KEYS.customTests, appState.customTests);
    renderTests();
    showToast("Custom test deleted.");
  }

  /* =========================
     TEST FILTERS
     ========================= */
  window.filterTests = function () {
    const subjectFilter = $("#subjectFilter");
    const difficultyFilter = $("#difficultyFilter");
    const searchInput = $("#testSearch");
    const testGrid = $("#testsGrid");

    if (!testGrid) return;

    const subjectValue = subjectFilter ? subjectFilter.value.toLowerCase() : "all";
    const difficultyValue = difficultyFilter ? difficultyFilter.value.toLowerCase() : "all";
    const searchValue = searchInput ? searchInput.value.toLowerCase().trim() : "";

    const cards = $$(".test-card", testGrid);

    cards.forEach((card) => {
      const subject = $(".test-tag", card)?.textContent.toLowerCase() || "";
      const difficulty = $(".test-level", card)?.textContent.toLowerCase() || "";
      const title = $("h3", card)?.textContent.toLowerCase() || "";
      const desc = $("p", card)?.textContent.toLowerCase() || "";

      const subjectMatch = subjectValue === "all" || subject === subjectValue;
      const difficultyMatch = difficultyValue === "all" || difficulty === difficultyValue;
      const searchMatch =
        !searchValue || title.includes(searchValue) || desc.includes(searchValue);

      card.style.display = subjectMatch && difficultyMatch && searchMatch ? "" : "none";
    });
  };

  /* =========================
     CREATE TEST MODAL
     ========================= */
  function bindModal() {
    const overlay = $("#createTestModal");
    const form = $("#createTestForm");

    if (overlay) {
      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) closeCreateTestModal();
      });
    }

    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        handleCreateTestSubmit();
      });
          }
