// ===============================
// MURPHX PREP V2 - FINAL SCRIPT
// Professional Glass Rain App Logic
// ===============================

document.addEventListener("DOMContentLoaded", () => {
  // -------------------------------
  // STATE
  // -------------------------------
  const state = {
    currentSection: "dashboard",
    streak: 1,
    testsDone: 0,
    averageScore: 0,
    accuracy: 0,
    darkMode: true,
    timerInterval: null,
    timerRunning: false,
    timerSeconds: 300,
    dailyChallengeStarted: false,
    quotes: [
      "The rain teaches patience. The storm teaches power.",
      "A calm mind cuts deeper than chaos.",
      "Every master was once a beginner.",
      "Discipline is your sharpest weapon.",
      "Small progress every day becomes greatness.",
      "You are not here to be average.",
      "Focus is the art of becoming unstoppable."
    ],
    quickTests: [],
    customTests: [],
    doubts: [
      {
        id: 1,
        subject: "Physics",
        topic: "Electrostatics",
        question: "Why is electric field zero inside a conductor in electrostatic equilibrium?",
        status: "Answered"
      },
      {
        id: 2,
        subject: "Chemistry",
        topic: "Chemical Bonding",
        question: "How to identify bond order quickly in MOT questions?",
        status: "Pending"
      }
    ],
    subjects: [
      {
        name: "Physics",
        progress: 68,
        completed: 12,
        total: 18,
        topics: [
          "Units & Dimensions",
          "Kinematics",
          "Laws of Motion",
          "Work Energy Power",
          "Rotational Motion",
          "Gravitation",
          "Thermodynamics",
          "SHM",
          "Waves",
          "Electrostatics",
          "Current Electricity",
          "Magnetism",
          "EMI",
          "Optics",
          "Modern Physics"
        ]
      },
      {
        name: "Chemistry",
        progress: 64,
        completed: 9,
        total: 14,
        topics: [
          "Mole Concept",
          "Atomic Structure",
          "Periodic Table",
          "Chemical Bonding",
          "Thermodynamics",
          "Equilibrium",
          "Redox",
          "Organic Basics",
          "Hydrocarbons",
          "Biomolecules"
        ]
      },
      {
        name: "Biology",
        progress: 70,
        completed: 15,
        total: 22,
        topics: [
          "Cell",
          "Biomolecules",
          "Cell Cycle",
          "Plant Kingdom",
          "Animal Kingdom",
          "Morphology",
          "Anatomy",
          "Genetics",
          "Evolution",
          "Human Physiology",
          "Ecology"
        ]
      }
    ],
    notes: [],
    mentorMessages: [
      {
        role: "assistant",
        text: "I am your Murphx AI mentor. Ask me anything about NEET prep, discipline, focus, strategy, or concepts."
      }
    ],
    searchIndex: []
  };

  // -------------------------------
  // HELPERS
  // -------------------------------
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => document.querySelectorAll(selector);

  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const showToast = (message) => {
    const toast = $("#toast");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    setTimeout(() => {
      toast.classList.remove("show");
    }, 2500);
  };

  const randomFrom = (arr) => arr[Math.floor(Math.random() * arr.length)];

  const saveState = () => {
    localStorage.setItem("murphx_prep_state_v2", JSON.stringify({
      streak: state.streak,
      testsDone: state.testsDone,
      averageScore: state.averageScore,
      accuracy: state.accuracy,
      darkMode: state.darkMode,
      quickTests: state.quickTests,
      customTests: state.customTests,
      notes: state.notes,
      doubts: state.doubts,
      mentorMessages: state.mentorMessages,
      subjects: state.subjects
    }));
  };

  const loadState = () => {
    const raw = localStorage.getItem("murphx_prep_state_v2");
    if (!raw) return;
    try {
      const data = JSON.parse(raw);
      state.streak = data.streak ?? state.streak;
      state.testsDone = data.testsDone ?? state.testsDone;
      state.averageScore = data.averageScore ?? state.averageScore;
      state.accuracy = data.accuracy ?? state.accuracy;
      state.darkMode = data.darkMode ?? state.darkMode;
      state.quickTests = data.quickTests ?? state.quickTests;
      state.customTests = data.customTests ?? state.customTests;
      state.notes = data.notes ?? state.notes;
      state.doubts = data.doubts ?? state.doubts;
      state.mentorMessages = data.mentorMessages ?? state.mentorMessages;
      state.subjects = data.subjects ?? state.subjects;
    } catch (err) {
      console.warn("Failed to load saved state", err);
    }
  };

  const buildSearchIndex = () => {
    const index = [];
    state.subjects.forEach(subject => {
      index.push({
        type: "subject",
        label: subject.name,
        section: "tests"
      });
      subject.topics.forEach(topic => {
        index.push({
          type: "topic",
          label: `${topic} (${subject.name})`,
          section: "tests"
        });
      });
    });

    [
      "Dashboard",
      "Mock Tests",
      "Breath Focus",
      "AI Mentor",
      "Doubts",
      "Community",
      "Profile",
      "Daily Challenge",
      "Quick Builder",
      "Subject Progress",
      "Focus Timer"
    ].forEach(label => {
      index.push({
        type: "page",
        label,
        section: label.toLowerCase().includes("dashboard")
          ? "dashboard"
          : label.toLowerCase().includes("breath")
          ? "breath"
          : label.toLowerCase().includes("mentor")
          ? "mentor"
          : label.toLowerCase().includes("doubts")
          ? "doubts"
          : label.toLowerCase().includes("community")
          ? "community"
          : label.toLowerCase().includes("profile")
          ? "profile"
          : "tests"
      });
    });

    state.searchIndex = index;
  };

  // -------------------------------
  // NAVIGATION
  // -------------------------------
  const sections = $$(".app-section");
  const navButtons = $$("[data-nav]");

  const switchSection = (sectionName) => {
    state.currentSection = sectionName;

    sections.forEach(section => {
      section.classList.toggle("active", section.dataset.section === sectionName);
    });

    navButtons.forEach(btn => {
      btn.classList.toggle("active", btn.dataset.nav === sectionName);
    });

    renderSectionHeader();
  };

  const renderSectionHeader = () => {
    const title = $("#mobile-section-title");
    const subtitle = $("#mobile-section-subtitle");
    if (!title || !subtitle) return;

    const map = {
      dashboard: {
        title: "Dashboard",
        subtitle: "your study overview"
      },
      tests: {
        title: "Mock Tests",
        subtitle: "create, solve, review, and improve"
      },
      breath: {
        title: "Breath Focus",
        subtitle: "calm the storm, sharpen the mind"
      },
      mentor: {
        title: "AI Mentor",
        subtitle: "ask, learn, improve instantly"
      },
      doubts: {
        title: "Doubts",
        subtitle: "capture and resolve confusion"
      },
      community: {
        title: "Community",
        subtitle: "learn with focused aspirants"
      },
      profile: {
        title: "Profile",
        subtitle: "track your warrior evolution"
      }
    };

    title.textContent = map[state.currentSection]?.title || "Murphx Prep";
    subtitle.textContent = map[state.currentSection]?.subtitle || "rainy glass focus";
  };

  navButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.nav;
      if (target) switchSection(target);
    });
  });

  // -------------------------------
  // DASHBOARD RENDER
  // -------------------------------
  const renderQuote = () => {
    const quoteEl = $("#rain-quote");
    if (quoteEl) {
      quoteEl.textContent = `"${randomFrom(state.quotes)}"`;
    }
  };

  const renderStats = () => {
    const streakEl = $("#streak-count");
    const testsDoneEl = $("#tests-done");
    const avgScoreEl = $("#avg-score");
    const accuracyEl = $("#accuracy-score");
    const profileStreak = $("#profile-streak");
    const profileTests = $("#profile-tests");
    const profileAvg = $("#profile-avg");
    const profileAccuracy = $("#profile-accuracy");

    if (streakEl) streakEl.textContent = `${state.streak} day`;
    if (testsDoneEl) testsDoneEl.textContent = state.testsDone;
    if (avgScoreEl) avgScoreEl.textContent = `${state.averageScore}%`;
    if (accuracyEl) accuracyEl.textContent = `${state.accuracy}%`;

    if (profileStreak) profileStreak.textContent = `${state.streak} days`;
    if (profileTests) profileTests.textContent = state.testsDone;
    if (profileAvg) profileAvg.textContent = `${state.averageScore}%`;
    if (profileAccuracy) profileAccuracy.textContent = `${state.accuracy}%`;
  };

  const renderSubjects = () => {
    const container = $("#subject-progress-list");
    const testSubjectSelect = $("#test-subject");
    const chapterSelect = $("#test-chapter");

    if (container) {
      container.innerHTML = "";
      state.subjects.forEach(subject => {
        const card = document.createElement("div");
        card.className = "glass-card subject-card";
        card.innerHTML = `
          <div class="subject-card-top">
            <div>
              <h4>${subject.name}</h4>
              <p>${subject.completed}/${subject.total} topics</p>
            </div>
            <span class="subject-percent">${subject.progress}%</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" style="width:${subject.progress}%"></div>
          </div>
        `;
        container.appendChild(card);
      });
    }

    if (testSubjectSelect) {
      testSubjectSelect.innerHTML = `<option value="">Choose Subject</option>`;
      state.subjects.forEach(subject => {
        const option = document.createElement("option");
        option.value = subject.name;
        option.textContent = subject.name;
        testSubjectSelect.appendChild(option);
      });
    }

    if (chapterSelect && !chapterSelect.dataset.initialized) {
      chapterSelect.innerHTML = `<option value="">Choose Chapter</option>`;
      chapterSelect.dataset.initialized = "true";
    }
  };

  // -------------------------------
  // TEST BUILDER
  // -------------------------------
  const renderTests = () => {
    const testList = $("#custom-test-list");
    if (!testList) return;

    testList.innerHTML = "";

    if (state.customTests.length === 0) {
      testList.innerHTML = `
        <div class="glass-card empty-card">
          <h4>No custom tests yet</h4>
          <p>Create your first high-focus mock test now.</p>
        </div>
      `;
      return;
    }

    state.customTests.forEach((test, index) => {
      const card = document.createElement("div");
      card.className = "glass-card test-card";
      card.innerHTML = `
        <div class="test-card-head">
          <div>
            <h4>${test.subject} • ${test.chapter}</h4>
            <p>${test.questions} Questions • ${test.duration} mins</p>
          </div>
          <span class="pill">${test.mode}</span>
        </div>
        <div class="test-card-actions">
          <button class="ghost-btn" data-start-test="${index}">Start</button>
          <button class="ghost-btn danger" data-delete-test="${index}">Delete</button>
        </div>
      `;
      testList.appendChild(card);
    });

    $$("[data-start-test]").forEach(btn => {
      btn.addEventListener("click", () => {
        const idx = Number(btn.dataset.startTest);
        const test = state.customTests[idx];
        if (!test) return;

        const score = Math.floor(Math.random() * 41) + 60; // 60-100
        state.testsDone += 1;
        state.averageScore = state.testsDone === 1
          ? score
          : Math.round(((state.averageScore * (state.testsDone - 1)) + score) / state.testsDone);
        state.accuracy = Math.min(100, Math.max(50, state.averageScore - Math.floor(Math.random() * 8)));
        showToast(`Test completed! Score: ${score}%`);
        renderStats();
        saveState();
      });
    });

    $$("[data-delete-test]").forEach(btn => {
      btn.addEventListener("click", () => {
        const idx = Number(btn.dataset.deleteTest);
        state.customTests.splice(idx, 1);
        renderTests();
        saveState();
        showToast("Test deleted");
      });
    });
  };

  const setupTestBuilder = () => {
    const subjectSelect = $("#test-subject");
    const chapterSelect = $("#test-chapter");
    const createBtn = $("#create-test-btn");

    if (subjectSelect) {
      subjectSelect.addEventListener("change", () => {
        const selected = state.subjects.find(s => s.name === subjectSelect.value);
        if (!chapterSelect) return;
        chapterSelect.innerHTML = `<option value="">Choose Chapter</option>`;

        if (selected) {
          selected.topics.forEach(topic => {
            const option = document.createElement("option");
            option.value = topic;
            option.textContent = topic;
            chapterSelect.appendChild(option);
          });
        }
      });
    }

    if (createBtn) {
      createBtn.addEventListener("click", () => {
        const subject = $("#test-subject")?.value || "";
        const chapter = $("#test-chapter")?.value || "";
        const questions = Number($("#test-questions")?.value || 0);
        const duration = Number($("#test-duration")?.value || 0);
        const mode = $("#test-mode")?.value || "Rank 1";

        if (!subject || !chapter || !questions || !duration) {
          showToast("Please fill all test fields");
          return;
        }

        state.customTests.push({
          subject,
          chapter,
          questions,
          duration,
          mode
        });

        renderTests();
        saveState();
        showToast("Custom test created successfully");
      });
    }
  };

  // -------------------------------
  // BREATH / FOCUS TIMER
  // -------------------------------
  const renderTimer = () => {
    const timerEl = $("#focus-timer");
    if (timerEl) timerEl.textContent = formatTime(state.timerSeconds);
  };

  const setupBreath = () => {
    const startBtn = $("#start-breath-btn");
    const resetBtn = $("#reset-breath-btn");
    const presetBtns = $$("[data-timer-preset]");

    presetBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        if (state.timerRunning) return;
        state.timerSeconds = Number(btn.dataset.timerPreset);
        renderTimer();
        showToast(`Timer set to ${Math.floor(state.timerSeconds / 60)} mins`);
      });
    });

    if (startBtn) {
      startBtn.addEventListener("click", () => {
        if (state.timerRunning) {
          clearInterval(state.timerInterval);
          state.timerRunning = false;
          startBtn.textContent = "Start Focus";
          showToast("Focus paused");
          return;
        }

        state.timerRunning = true;
        startBtn.textContent = "Pause Focus";

        state.timerInterval = setInterval(() => {
          if (state.timerSeconds > 0) {
            state.timerSeconds--;
            renderTimer();
          } else {
            clearInterval(state.timerInterval);
            state.timerRunning = false;
            startBtn.textContent = "Start Focus";
            showToast("Focus session complete. Breathe like thunder.");
          }
        }, 1000);
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        clearInterval(state.timerInterval);
        state.timerRunning = false;
        state.timerSeconds = 300;
        renderTimer();
        if (startBtn) startBtn.textContent = "Start Focus";
        showToast("Timer reset");
      });
    }
  };

  // -------------------------------
  // AI MENTOR
  // -------------------------------
  const renderMentorMessages = () => {
    const chat = $("#mentor-chat");
    if (!chat) return;

    chat.innerHTML = "";
    state.mentorMessages.forEach(msg => {
      const bubble = document.createElement("div");
      bubble.className = `chat-bubble ${msg.role}`;
      bubble.textContent = msg.text;
      chat.appendChild(bubble);
    });

    chat.scrollTop = chat.scrollHeight;
  };

  const getMentorReply = (input) => {
    const text = input.toLowerCase();

    if (text.includes("physics")) {
      return "For NEET Physics: concepts first, formulas second, questions third. Weak chapter? Do 20 focused numericals + 10 error log corrections.";
    }
    if (text.includes("motivation") || text.includes("discipline")) {
      return "Discipline is stronger than motivation. Study even when the mind resists. That is where rank is built.";
    }
    if (text.includes("biology") || text.includes("botany") || text.includes("zoology")) {
      return "NCERT is king for Biology. Read line by line, underline traps, revise diagrams, and solve assertion-reason questions.";
    }
    if (text.includes("chemistry")) {
      return "Chemistry strategy: Physical = numericals, Organic = mechanism memory, Inorganic = repeated NCERT revision + exception list.";
    }
    if (text.includes("test")) {
      return "After every mock: classify errors into concept gap, silly mistake, speed issue, and overthinking. Fix the pattern, not just the question.";
    }
    return "Good question. My best advice: break it into concept → repetition → testing → error correction. That is how toppers create inevitability.";
  };

  const setupMentor = () => {
    const input = $("#mentor-input");
    const sendBtn = $("#mentor-send-btn");

    const sendMessage = () => {
      const text = input?.value?.trim();
      if (!text) return;

      state.mentorMessages.push({
        role: "user",
        text
      });

      const reply = getMentorReply(text);

      setTimeout(() => {
        state.mentorMessages.push({
          role: "assistant",
          text: reply
        });
        renderMentorMessages();
        saveState();
      }, 350);

      input.value = "";
      renderMentorMessages();
      saveState();
    };

    if (sendBtn) sendBtn.addEventListener("click", sendMessage);
    if (input) {
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") sendMessage();
      });
    }
  };

  // -------------------------------
  // DOUBTS
  // -------------------------------
  const renderDoubts = () => {
    const list = $("#doubts-list");
    if (!list) return;

    list.innerHTML = "";

    if (state.doubts.length === 0) {
      list.innerHTML = `
        <div class="glass-card empty-card">
          <h4>No doubts saved</h4>
          <p>Your clarity board is empty. Add a doubt now.</p>
        </div>
      `;
      return;
    }

    state.doubts.forEach((doubt, index) => {
      const card = document.createElement("div");
      card.className = "glass-card doubt-card";
      card.innerHTML = `
        <div class="doubt-meta">
          <span class="pill">${doubt.subject}</span>
          <span class="status ${doubt.status.toLowerCase()}">${doubt.status}</span>
        </div>
        <h4>${doubt.topic}</h4>
        <p>${doubt.question}</p>
        <div class="doubt-actions">
          <button class="ghost-btn" data-resolve-doubt="${index}">
            ${doubt.status === "Pending" ? "Mark Answered" : "Mark Pending"}
          </button>
          <button class="ghost-btn danger" data-delete-doubt="${index}">Delete</button>
        </div>
      `;
      list.appendChild(card);
    });

    $$("[data-resolve-doubt]").forEach(btn => {
      btn.addEventListener("click", () => {
        const idx = Number(btn.dataset.resolveDoubt);
        const doubt = state.doubts[idx];
        if (!doubt) return;
        doubt.status = doubt.status === "Pending" ? "Answered" : "Pending";
        renderDoubts();
        saveState();
      });
    });

    $$("[data-delete-doubt]").forEach(btn => {
      btn.addEventListener("click", () => {
        const idx = Number(btn.dataset.deleteDoubt);
        state.doubts.splice(idx, 1);
        renderDoubts();
        saveState();
        showToast("Doubt deleted");
      });
    });
  };

  const setupDoubts = () => {
    const addBtn = $("#add-doubt-btn");
    if (!addBtn) return;

    addBtn.addEventListener("click", () => {
      const subject = $("#doubt-subject")?.value || "";
      const topic = $("#doubt-topic")?.value?.trim() || "";
      const question = $("#doubt-question")?.value?.trim() || "";

      if (!subject || !topic || !question) {
        showToast("Please fill all doubt fields");
        return;
      }

      state.doubts.unshift({
        id: Date.now(),
        subject,
        topic,
        question,
        status: "Pending"
      });

      $("#doubt-topic").value = "";
      $("#doubt-question").value = "";

      renderDoubts();
      saveState();
      showToast("Doubt saved");
    });
  };

  // -------------------------------
  // COMMUNITY
  // -------------------------------
  const setupCommunity = () => {
    const joinBtn = $("#join-community-btn");
    const postBtn = $("#community-post-btn");
    const feed = $("#community-feed");

    if (joinBtn) {
      joinBtn.addEventListener("click", () => {
        showToast("Joined Rain Glass Focus Circle 🌧️");
      });
    }

    if (postBtn && feed) {
      postBtn.addEventListener("click", () => {
        const input = $("#community-input");
        const text = input?.value?.trim();
        if (!text) {
          showToast("Write something first");
          return;
        }

        const card = document.createElement("div");
        card.className = "glass-card community-post";
        card.innerHTML = `
          <div class="community-post-head">
            <span class="avatar">A</span>
            <div>
              <h4>Aditya NEET 2026</h4>
              <p>Just now</p>
            </div>
          </div>
          <p>${text}</p>
        `;
        feed.prepend(card);

        input.value = "";
        showToast("Posted to community");
      });
    }
  };

  // -------------------------------
  // PROFILE
  // -------------------------------
  const setupProfile = () => {
    const themeBtn = $("#theme-toggle-btn");
    const resetBtn = $("#reset-data-btn");

    if (themeBtn) {
      themeBtn.addEventListener("click", () => {
        state.darkMode = !state.darkMode;
        document.body.classList.toggle("light-mode", !state.darkMode);
        saveState();
        showToast(state.darkMode ? "Dark rain mode enabled" : "Light mode enabled");
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        const confirmReset = confirm("Reset all Murphx progress and local data?");
        if (!confirmReset) return;

        localStorage.removeItem("murphx_prep_state_v2");
        location.reload();
      });
    }
  };

  // -------------------------------
  // SEARCH
  // -------------------------------
  const setupSearch = () => {
    const input = $("#global-search");
    const results = $("#search-results");

    if (!input || !results) return;

    input.addEventListener("input", () => {
      const query = input.value.trim().toLowerCase();

      if (!query) {
        results.innerHTML = "";
        results.classList.remove("show");
        return;
      }

      const matched = state.searchIndex.filter(item =>
        item.label.toLowerCase().includes(query)
      ).slice(0, 8);

      results.innerHTML = "";

      if (matched.length === 0) {
        results.innerHTML = `<div class="search-empty">No results found</div>`;
        results.classList.add("show");
        return;
      }

      matched.forEach(item => {
        const row = document.createElement("button");
        row.className = "search-item";
        row.innerHTML = `
          <span>${item.label}</span>
          <small>${item.type}</small>
        `;
        row.addEventListener("click", () => {
          switchSection(item.section);
          input.value = item.label;
          results.innerHTML = "";
          results.classList.remove("show");
          showToast(`Opened ${item.label}`);
        });
        results.appendChild(row);
      });

      results.classList.add("show");
    });

    document.addEventListener("click", (e) => {
      if (!input.contains(e.target) && !results.contains(e.target)) {
        results.classList.remove("show");
      }
    });
  };

  // -------------------------------
  // DAILY CHALLENGE
  // -------------------------------
  const setupDailyChallenge = () => {
    const startBtn = $("#start-challenge-btn");
    const statusEl = $("#challenge-status");

    if (!startBtn) return;

    startBtn.addEventListener("click", () => {
      if (!state.dailyChallengeStarted) {
        state.dailyChallengeStarted = true;
        startBtn.textContent = "Complete Challenge";
        if (statusEl) statusEl.textContent = "Challenge in progress • 5 questions • Physics";
        showToast("Daily challenge started");
      } else {
        state.dailyChallengeStarted = false;
        startBtn.textContent = "Start Challenge";
        if (statusEl) statusEl.textContent = "Completed for today • Great work";
        state.testsDone += 1;
        const challengeScore = Math.floor(Math.random() * 21) + 80;
        state.averageScore = state.testsDone === 1
          ? challengeScore
          : Math.round(((state.averageScore * (state.testsDone - 1)) + challengeScore) / state.testsDone);
        state.accuracy = Math.min(100, Math.max(60, state.averageScore - Math.floor(Math.random() * 5)));
        renderStats();
        saveState();
        showToast(`Challenge completed • Score ${challengeScore}%`);
      }
    });
  };

  // -------------------------------
  // QUICK ACTIONS
  // -------------------------------
  const setupQuickActions = () => {
    const quickMock = $("#quick-mock-btn");
    const quickBreath = $("#quick-breath-btn");
    const quickMentor = $("#quick-mentor-btn");
    const quickDoubt = $("#quick-doubt-btn");

    if (quickMock) {
      quickMock.addEventListener("click", () => switchSection("tests"));
    }

    if (quickBreath) {
      quickBreath.addEventListener("click", () => switchSection("breath"));
    }

    if (quickMentor) {
      quickMentor.addEventListener("click", () => switchSection("mentor"));
    }

    if (quickDoubt) {
      quickDoubt.addEventListener("click", () => switchSection("doubts"));
    }
  };

  // -------------------------------
  // RAIN FX
  // -------------------------------
  const createRain = () => {
    const rainLayer = $("#rain-layer");
    if (!rainLayer) return;

    rainLayer.innerHTML = "";

    for (let i = 0; i < 40; i++) {
      const drop = document.createElement("span");
      drop.className = "rain-drop";
      drop.style.left = `${Math.random() * 100}%`;
      drop.style.animationDuration = `${0.8 + Math.random() * 1.6}s`;
      drop.style.animationDelay = `${Math.random() * 2}s`;
      drop.style.opacity = `${0.08 + Math.random() * 0.2}`;
      drop.style.height = `${10 + Math.random() * 18}px`;
      rainLayer.appendChild(drop);
    }
  };

  // -------------------------------
  // INIT
  // -------------------------------
  const init = () => {
    loadState();
    buildSearchIndex();
    renderSectionHeader();
    renderQuote();
    renderStats();
    renderSubjects();
    renderTests();
    renderTimer();
    renderMentorMessages();
    renderDoubts();
    createRain();

    setupTestBuilder();
    setupBreath();
    setupMentor();
    setupDoubts();
    setupCommunity();
    setupProfile();
    setupSearch();
    setupDailyChallenge();
    setupQuickActions();

    document.body.classList.toggle("light-mode", !state.darkMode);

    setInterval(renderQuote, 8000);
    switchSection("dashboard");
  };

  init();
});
