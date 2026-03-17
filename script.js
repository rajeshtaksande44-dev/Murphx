/* ===============================
   MURPHX V2 - FUNCTIONAL STATIC APP
   Premium NEET Prep Frontend Engine
   =============================== */

document.addEventListener("DOMContentLoaded", () => {
  /* ===============================
     DOM HELPERS
     =============================== */
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

  /* ===============================
     STORAGE KEYS
     =============================== */
  const STORAGE_KEYS = {
    stats: "murphx_stats_v2",
    history: "murphx_history_v2",
    settings: "murphx_settings_v2",
    streak: "murphx_streak_v2",
    chat: "murphx_chat_v2",
  };

  /* ===============================
     APP STATE
     =============================== */
  const state = {
    currentSection: "dashboard",
    currentTest: null,
    currentQuestionIndex: 0,
    userAnswers: [],
    timerInterval: null,
    remainingSeconds: 0,
    breathInterval: null,
    breathPhase: "inhale",
    breathRunning: false,
    stats: {
      testsTaken: 0,
      questionsSolved: 0,
      avgAccuracy: 0,
      studyStreak: 1,
      totalStudyMinutes: 0,
      bestScore: 0,
    },
    history: [],
    chatMessages: [],
  };

  /* ===============================
     DEFAULT DATA
     =============================== */
  const subjectProgress = {
    Physics: 42,
    Chemistry: 57,
    Botany: 61,
    Zoology: 54,
  };

  const chapterBank = {
    Physics: [
      "Units & Dimensions",
      "Motion in 1D",
      "Laws of Motion",
      "Work Energy Power",
      "Gravitation",
      "Thermodynamics",
      "Electrostatics",
      "Current Electricity",
      "Magnetism",
      "Ray Optics",
      "Modern Physics",
    ],
    Chemistry: [
      "Mole Concept",
      "Atomic Structure",
      "Chemical Bonding",
      "Thermodynamics",
      "Equilibrium",
      "Redox Reactions",
      "Electrochemistry",
      "Organic Basics",
      "Hydrocarbons",
      "Biomolecules",
    ],
    Botany: [
      "Cell: The Unit of Life",
      "Biological Classification",
      "Plant Kingdom",
      "Morphology of Flowering Plants",
      "Anatomy of Flowering Plants",
      "Photosynthesis",
      "Respiration in Plants",
      "Plant Growth & Development",
      "Genetics",
    ],
    Zoology: [
      "Animal Kingdom",
      "Structural Organisation in Animals",
      "Biomolecules",
      "Digestion & Absorption",
      "Breathing & Exchange of Gases",
      "Body Fluids & Circulation",
      "Neural Control",
      "Chemical Coordination",
      "Human Reproduction",
      "Evolution",
    ],
  };

  /* ===============================
     QUESTION BANK
     =============================== */
  const questionBank = {
    Physics: [
      {
        question: "The dimensional formula of pressure is:",
        options: ["[MLT⁻²]", "[ML⁻¹T⁻²]", "[ML²T⁻²]", "[M⁰LT⁻²]"],
        answer: 1,
        explanation: "Pressure = Force / Area = [MLT⁻²] / [L²] = [ML⁻¹T⁻²]",
        difficulty: "Easy",
      },
      {
        question: "A body moving with uniform acceleration has velocity-time graph:",
        options: ["Parabola", "Straight line", "Hyperbola", "Circle"],
        answer: 1,
        explanation: "For uniform acceleration, v = u + at, so velocity changes linearly with time.",
        difficulty: "Easy",
      },
      {
        question: "The work done in uniform circular motion is:",
        options: ["Maximum", "Minimum", "Zero", "Infinite"],
        answer: 2,
        explanation: "Force is centripetal and perpendicular to displacement, so work done is zero.",
        difficulty: "Medium",
      },
      {
        question: "Escape velocity from Earth is approximately:",
        options: ["7.9 km/s", "11.2 km/s", "9.8 km/s", "15 km/s"],
        answer: 1,
        explanation: "Standard escape velocity of Earth ≈ 11.2 km/s.",
        difficulty: "Medium",
      },
      {
        question: "Equivalent resistance in series combination is:",
        options: ["Product of resistances", "Reciprocal sum", "Sum of resistances", "Always zero"],
        answer: 2,
        explanation: "For series: Req = R1 + R2 + R3 ...",
        difficulty: "Easy",
      },
      {
        question: "Power of a lens is measured in:",
        options: ["Watt", "Tesla", "Dioptre", "Henry"],
        answer: 2,
        explanation: "Lens power = 1/f (in meters), unit = Dioptre.",
        difficulty: "Easy",
      },
    ],
    Chemistry: [
      {
        question: "1 mole of any gas at STP occupies:",
        options: ["11.2 L", "22.4 L", "44.8 L", "1 L"],
        answer: 1,
        explanation: "At STP, 1 mole gas occupies 22.4 L.",
        difficulty: "Easy",
      },
      {
        question: "Hybridization of carbon in methane is:",
        options: ["sp", "sp²", "sp³", "dsp²"],
        answer: 2,
        explanation: "Methane has tetrahedral geometry, so carbon is sp³ hybridized.",
        difficulty: "Easy",
      },
      {
        question: "Oxidation number of Mn in KMnO₄ is:",
        options: ["+4", "+6", "+7", "+2"],
        answer: 2,
        explanation: "K = +1, O = -2 × 4 = -8, so Mn = +7.",
        difficulty: "Medium",
      },
      {
        question: "pH of a neutral solution at 25°C is:",
        options: ["0", "14", "7", "1"],
        answer: 2,
        explanation: "At 25°C, neutral solution has pH = 7.",
        difficulty: "Easy",
      },
      {
        question: "Anode is the site of:",
        options: ["Reduction", "Oxidation", "Neutralization", "Hydrolysis"],
        answer: 1,
        explanation: "Oxidation always occurs at anode.",
        difficulty: "Medium",
      },
      {
        question: "Benzene undergoes mainly:",
        options: ["Addition", "Substitution", "Elimination", "Oxidation only"],
        answer: 1,
        explanation: "Benzene prefers electrophilic substitution to preserve aromaticity.",
        difficulty: "Medium",
      },
    ],
    Botany: [
      {
        question: "The powerhouse of the cell is:",
        options: ["Golgi body", "Lysosome", "Mitochondria", "Ribosome"],
        answer: 2,
        explanation: "Mitochondria produce ATP, hence called powerhouse of the cell.",
        difficulty: "Easy",
      },
      {
        question: "Middle lamella is mainly made of:",
        options: ["Cellulose", "Pectin", "Lignin", "Suberin"],
        answer: 1,
        explanation: "Middle lamella is rich in calcium pectate/pectin.",
        difficulty: "Medium",
      },
      {
        question: "Grana are present in:",
        options: ["Mitochondria", "Golgi apparatus", "Chloroplast", "Nucleus"],
        answer: 2,
        explanation: "Grana are stacks of thylakoids in chloroplast.",
        difficulty: "Easy",
      },
      {
        question: "The site of protein synthesis is:",
        options: ["Ribosome", "Vacuole", "Centrosome", "Peroxisome"],
        answer: 0,
        explanation: "Ribosomes are the site of protein synthesis.",
        difficulty: "Easy",
      },
      {
        question: "NCERT states that prokaryotic cells generally lack:",
        options: ["Cell wall", "Ribosomes", "Membrane-bound organelles", "Plasma membrane"],
        answer: 2,
        explanation: "Prokaryotes lack membrane-bound organelles like mitochondria, ER, Golgi.",
        difficulty: "Medium",
      },
      {
        question: "The fluid mosaic model was proposed by:",
        options: ["Watson and Crick", "Singer and Nicolson", "Darwin and Wallace", "Mendel and Morgan"],
        answer: 1,
        explanation: "Fluid mosaic model was proposed by Singer and Nicolson (1972).",
        difficulty: "Medium",
      },
    ],
    Zoology: [
      {
        question: "The functional unit of kidney is:",
        options: ["Neuron", "Nephron", "Alveolus", "Sarcomere"],
        answer: 1,
        explanation: "Nephron is the structural and functional unit of kidney.",
        difficulty: "Easy",
      },
      {
        question: "Bile is produced by:",
        options: ["Pancreas", "Liver", "Gall bladder", "Duodenum"],
        answer: 1,
        explanation: "Bile is produced by liver and stored in gall bladder.",
        difficulty: "Easy",
      },
      {
        question: "The pacemaker of human heart is:",
        options: ["AV node", "SA node", "Bundle of His", "Purkinje fibers"],
        answer: 1,
        explanation: "SA node initiates heartbeat and acts as pacemaker.",
        difficulty: "Easy",
      },
      {
        question: "The hormone insulin is secreted by:",
        options: ["Alpha cells", "Beta cells", "Delta cells", "Acinar cells"],
        answer: 1,
        explanation: "Insulin is secreted by beta cells of islets of Langerhans.",
        difficulty: "Easy",
      },
      {
        question: "The site of fertilization in human female is usually:",
        options: ["Ovary", "Uterus", "Ampullary-isthmic junction", "Cervix"],
        answer: 2,
        explanation: "NCERT: fertilization usually occurs at ampullary-isthmic junction.",
        difficulty: "Medium",
      },
      {
        question: "Myelinated nerve fibres are found mainly in:",
        options: ["Grey matter of brain", "White matter of brain", "Liver", "Blood plasma"],
        answer: 1,
        explanation: "White matter mainly contains myelinated fibres.",
        difficulty: "Medium",
      },
    ],
  };

  /* ===============================
     DOM REFERENCES
     =============================== */
  const sections = $$(".section");
  const navButtons = $$(".nav-btn");
  const quickNavButtons = $$("[data-go-section]");
  const modal = $("#testModal");
  const openTestModalBtns = $$("[data-open-test-modal]");
  const closeModalBtns = $$("[data-close-modal]");

  // Dashboard stats
  const testsTakenEls = $$("[data-stat='testsTaken']");
  const questionsSolvedEls = $$("[data-stat='questionsSolved']");
  const avgAccuracyEls = $$("[data-stat='avgAccuracy']");
  const streakEls = $$("[data-stat='studyStreak']");
  const bestScoreEls = $$("[data-stat='bestScore']");

  // Lists
  const progressList = $("#progressList");
  const historyList = $("#historyList");
  const profileHistoryList = $("#profileHistoryList");

  // Test Builder
  const subjectSelect = $("#testSubject");
  const chapterSelect = $("#testChapter");
  const difficultyChips = $$(".difficulty-chip");
  const questionCountChips = $$(".question-count-chip");
  const testTimeChips = $$(".test-time-chip");
  const generateTestBtn = $("#generateTestBtn");

  // Quiz
  const quizShell = $("#quizShell");
  const resultCard = $("#resultCard");
  const quizTitle = $("#quizTitle");
  const quizTimer = $("#quizTimer");
  const quizProgressText = $("#quizProgressText");
  const quizProgressFill = $("#quizProgressFill");
  const questionText = $("#questionText");
  const questionDifficulty = $("#questionDifficulty");
  const optionsList = $("#optionsList");
  const prevQuestionBtn = $("#prevQuestionBtn");
  const nextQuestionBtn = $("#nextQuestionBtn");
  const submitTestBtn = $("#submitTestBtn");

  // Result
  const resultScore = $("#resultScore");
  const resultCorrect = $("#resultCorrect");
  const resultWrong = $("#resultWrong");
  const resultAccuracy = $("#resultAccuracy");
  const resultTime = $("#resultTime");
  const reviewAnswersBtn = $("#reviewAnswersBtn");
  const retakeTestBtn = $("#retakeTestBtn");

  // Doubt Solver
  const doubtInput = $("#doubtInput");
  const solveDoubtBtn = $("#solveDoubtBtn");
  const doubtResponse = $("#doubtResponse");
  const doubtResponseBody = $("#doubtResponseBody");

  // AI Mentor
  const chatWindow = $("#chatWindow");
  const chatInput = $("#chatInput");
  const sendChatBtn = $("#sendChatBtn");

  // Breath
  const breathOrb = $("#breathOrb");
  const breathLabel = $("#breathLabel");
  const breathSub = $("#breathSub");
  const startBreathBtn = $("#startBreathBtn");
  const stopBreathBtn = $("#stopBreathBtn");

  // Toast
  const toastWrap = $("#toastWrap");

  /* ===============================
     UTILITIES
     =============================== */
  function safeJSONParse(value, fallback) {
    try {
      return JSON.parse(value) ?? fallback;
    } catch {
      return fallback;
    }
  }

  function saveToStorage() {
    localStorage.setItem(STORAGE_KEYS.stats, JSON.stringify(state.stats));
    localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(state.history));
    localStorage.setItem(STORAGE_KEYS.chat, JSON.stringify(state.chatMessages));
  }

  function loadFromStorage() {
    state.stats = safeJSONParse(localStorage.getItem(STORAGE_KEYS.stats), state.stats);
    state.history = safeJSONParse(localStorage.getItem(STORAGE_KEYS.history), []);
    state.chatMessages = safeJSONParse(localStorage.getItem(STORAGE_KEYS.chat), []);
  }

  function showToast(message) {
    if (!toastWrap) return;
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = message;
    toastWrap.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(-8px)";
      toast.style.transition = "all 0.25s ease";
      setTimeout(() => toast.remove(), 250);
    }, 2200);
  }

  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }

  function shuffleArray(arr) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function getSelectedChipValue(chips) {
    const active = chips.find((chip) => chip.classList.contains("active"));
    return active ? active.dataset.value : null;
  }

  function setChipGroup(chips, clickedChip) {
    chips.forEach((chip) => chip.classList.remove("active"));
    clickedChip.classList.add("active");
  }

  /* ===============================
     NAVIGATION
     =============================== */
  function switchSection(sectionId) {
    state.currentSection = sectionId;

    sections.forEach((section) => {
      section.classList.toggle("active", section.id === sectionId);
    });

    navButtons.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.section === sectionId);
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  navButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      switchSection(btn.dataset.section);
    });
  });

  quickNavButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.goSection;
      if (target) switchSection(target);
    });
  });

  /* ===============================
     MODAL
     =============================== */
  function openModal() {
    if (modal) modal.classList.add("active");
  }

  function closeModal() {
    if (modal) modal.classList.remove("active");
  }

  openTestModalBtns.forEach((btn) => btn.addEventListener("click", openModal));
  closeModalBtns.forEach((btn) => btn.addEventListener("click", closeModal));

  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });
  }

  /* ===============================
     SUBJECT + CHAPTER
     =============================== */
  function populateSubjects() {
    if (!subjectSelect) return;

    subjectSelect.innerHTML = `
      <option value="">Choose Subject</option>
      <option value="Physics">Physics</option>
      <option value="Chemistry">Chemistry</option>
      <option value="Botany">Botany</option>
      <option value="Zoology">Zoology</option>
    `;
  }

  function populateChapters(subject) {
    if (!chapterSelect) return;

    if (!subject || !chapterBank[subject]) {
      chapterSelect.innerHTML = `<option value="">Choose Chapter</option>`;
      return;
    }

    chapterSelect.innerHTML = `<option value="">Choose Chapter</option>`;
    chapterBank[subject].forEach((chapter) => {
      const option = document.createElement("option");
      option.value = chapter;
      option.textContent = chapter;
      chapterSelect.appendChild(option);
    });
  }

  if (subjectSelect) {
    subjectSelect.addEventListener("change", (e) => {
      populateChapters(e.target.value);
    });
  }

  difficultyChips.forEach((chip) => {
    chip.addEventListener("click", () => setChipGroup(difficultyChips, chip));
  });

  questionCountChips.forEach((chip) => {
    chip.addEventListener("click", () => setChipGroup(questionCountChips, chip));
  });

  testTimeChips.forEach((chip) => {
    chip.addEventListener("click", () => setChipGroup(testTimeChips, chip));
  });

  /* ===============================
     TEST GENERATION
     =============================== */
  function generateTest() {
    const subject = subjectSelect?.value;
    const chapter = chapterSelect?.value || "Mixed Concepts";
    const difficulty = getSelectedChipValue(difficultyChips) || "Mixed";
    const questionCount = Number(getSelectedChipValue(questionCountChips) || 5);
    const timeMinutes = Number(getSelectedChipValue(testTimeChips) || 10);

    if (!subject) {
      showToast("Please select a subject first.");
      return;
    }

    const baseQuestions = questionBank[subject] || [];
    if (baseQuestions.length === 0) {
      showToast("No questions available for this subject yet.");
      return;
    }

    let filtered = [...baseQuestions];
    if (difficulty !== "Mixed") {
      filtered = baseQuestions.filter((q) => q.difficulty.toLowerCase() === difficulty.toLowerCase());
      if (filtered.length === 0) filtered = [...baseQuestions];
    }

    const expandedPool = [];
    while (expandedPool.length < questionCount) {
      expandedPool.push(...shuffleArray(filtered));
    }

    const selectedQuestions = shuffleArray(expandedPool).slice(0, questionCount);

    state.currentTest = {
      subject,
      chapter,
      difficulty,
      questionCount,
      timeMinutes,
      questions: selectedQuestions,
      startedAt: Date.now(),
    };

    state.currentQuestionIndex = 0;
    state.userAnswers = new Array(questionCount).fill(null);
    state.remainingSeconds = timeMinutes * 60;

    closeModal();
    switchSection("tests");
    startQuiz();
    showToast(`${subject} test generated successfully.`);
  }

  if (generateTestBtn) {
    generateTestBtn.addEventListener("click", generateTest);
  }

  /* ===============================
     QUIZ ENGINE
     =============================== */
  function startQuiz() {
    if (!state.currentTest || !quizShell) return;

    quizShell.classList.add("active");
    resultCard?.classList.remove("active");

    if (quizTitle) {
      quizTitle.textContent = `${state.currentTest.subject} • ${state.currentTest.chapter}`;
    }

    startTimer();
    renderQuestion();
  }

  function startTimer() {
    clearInterval(state.timerInterval);

    if (quizTimer) quizTimer.textContent = formatTime(state.remainingSeconds);

    state.timerInterval = setInterval(() => {
      state.remainingSeconds--;
      if (quizTimer) quizTimer.textContent = formatTime(Math.max(0, state.remainingSeconds));

      if (state.remainingSeconds <= 0) {
        clearInterval(state.timerInterval);
        showToast("Time's up! Submitting test...");
        submitTest();
      }
    }, 1000);
  }

  function renderQuestion() {
    if (!state.currentTest) return;

    const q = state.currentTest.questions[state.currentQuestionIndex];
    if (!q) return;

    if (quizProgressText) {
      quizProgressText.textContent = `Question ${state.currentQuestionIndex + 1} / ${state.currentTest.questions.length}`;
    }

    if (quizProgressFill) {
      const percent = ((state.currentQuestionIndex + 1) / state.currentTest.questions.length) * 100;
      quizProgressFill.style.width = `${percent}%`;
    }

    if (questionText) questionText.textContent = 
