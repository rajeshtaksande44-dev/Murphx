// script.js – NEET Blueprint: Discipline Engine
// All interactions: 7‑day mission, daily checklist, error notebook, physics reminder

(function() {
  // ---------- DOM Elements ----------
  const sevenDayGrid = document.getElementById('sevenDayGrid');
  const resetMissionBtn = document.getElementById('resetMissionBtn');
  const missionFeedback = document.getElementById('missionFeedback');
  const dailyChecklistContainer = document.getElementById('dailyChecklistContainer');
  const resetDailyBtn = document.getElementById('resetDailyBtn');
  const errorNotebook = document.getElementById('errorNotebook');

  // ---------- 7‑DAY MISSION (Physics at 7:30 AM) ----------
  let sevenDayState = JSON.parse(localStorage.getItem('neetSevenDay')) || [false, false, false, false, false, false, false];
  const dayMessages = [
    "Day 1 · just sit + try",
    "Day 2 · just sit + try",
    "Day 3 · slight improvement",
    "Day 4 · slight improvement",
    "Day 5 · momentum begins",
    "Day 6 · momentum builds",
    "Day 7 · discipline wire"
  ];

  function renderSevenDayGrid() {
    if (!sevenDayGrid) return;
    sevenDayGrid.innerHTML = '';
    sevenDayState.forEach((completed, idx) => {
      const dayDiv = document.createElement('div');
      dayDiv.className = `day-card ${completed ? 'completed' : ''}`;
      dayDiv.innerHTML = `
        <div class="day-number">${idx + 1}</div>
        <div class="day-label">${dayMessages[idx].split('·')[0]}</div>
        <div style="font-size:10px;">${completed ? '✓ done' : '📌'}</div>
      `;
      dayDiv.addEventListener('click', () => {
        sevenDayState[idx] = !sevenDayState[idx];
        localStorage.setItem('neetSevenDay', JSON.stringify(sevenDayState));
        renderSevenDayGrid();
        updateMissionFeedback();
      });
      sevenDayGrid.appendChild(dayDiv);
    });
    updateMissionFeedback();
  }

  function updateMissionFeedback() {
    if (!missionFeedback) return;
    const completedCount = sevenDayState.filter(v => v === true).length;
    if (completedCount === 7) {
      missionFeedback.innerHTML = '🎉🏆 PERFECT! You proved: “I can show up.” Momentum is yours — keep going!';
      missionFeedback.style.color = '#15803d';
    } else {
      missionFeedback.innerHTML = `✅ ${completedCount}/7 days completed · "Just sit and try — no perfection needed."`;
      missionFeedback.style.color = '#1e40af';
    }
  }

  if (resetMissionBtn) {
    resetMissionBtn.addEventListener('click', () => {
      sevenDayState = [false, false, false, false, false, false, false];
      localStorage.setItem('neetSevenDay', JSON.stringify(sevenDayState));
      renderSevenDayGrid();
    });
  }

  // ---------- DAILY CHECKLIST ----------
  const checklistItems = [
    { id: "phyMorning", label: "🌅 7:30 AM - 10:30 AM · Physics Deep Focus (concept + problems)" },
    { id: "chemPhase", label: "🧪 11:00 AM - 2:00 PM · Chemistry (Physical/Organic + NCERT Inorganic) + 30-40 Qs" },
    { id: "practicePhase", label: "⚙️ 3:00 PM - 5:00 PM · PYQs / modules (Physics/Chem Practice - NO lectures)" },
    { id: "bioPhase", label: "🌿 5:30 PM - 7:30 PM · Biology NCERT line-by-line + 2 chapters" },
    { id: "nightRev", label: "📓 8:00 PM - 10:00 PM · Night reinforcement (mistakes revision + error notebook)" },
    { id: "mockPrep", label: "📊 Extra: Sunday Mock Test simulation (if Sunday) — else daily consistency" }
  ];

  function loadDailyChecklist() {
    if (!dailyChecklistContainer) return;
    const saved = JSON.parse(localStorage.getItem('neetDailyChecklist')) || {};
    dailyChecklistContainer.innerHTML = '';
    checklistItems.forEach(item => {
      const isChecked = saved[item.id] === true;
      const div = document.createElement('div');
      div.className = 'checklist-item';
      div.innerHTML = `
        <input type="checkbox" id="${item.id}" ${isChecked ? 'checked' : ''}>
        <label for="${item.id}">${item.label}</label>
      `;
      const cb = div.querySelector('input');
      cb.addEventListener('change', (e) => {
        const newState = JSON.parse(localStorage.getItem('neetDailyChecklist')) || {};
        newState[item.id] = e.target.checked;
        localStorage.setItem('neetDailyChecklist', JSON.stringify(newState));
      });
      dailyChecklistContainer.appendChild(div);
    });
  }

  if (resetDailyBtn) {
    resetDailyBtn.addEventListener('click', () => {
      localStorage.setItem('neetDailyChecklist', JSON.stringify({}));
      loadDailyChecklist();
    });
  }

  // ---------- ERROR NOTEBOOK (Auto-save) ----------
  if (errorNotebook) {
    const savedNotes = localStorage.getItem('neetErrorNotebook');
    if (savedNotes) errorNotebook.value = savedNotes;
    errorNotebook.addEventListener('input', () => {
      localStorage.setItem('neetErrorNotebook', errorNotebook.value);
    });
  }

  // ---------- PHYSICS REMINDER (Dynamic injection) ----------
  function injectPhysicsWidget() {
    // Find the right column (second column of dashboard)
    const rightColumn = document.querySelector('.dashboard > div:last-child');
    if (!rightColumn) return;
    // Avoid duplicate injection
    if (document.getElementById('physicsWidget')) return;
    
    const widget = document.createElement('div');
    widget.id = 'physicsWidget';
    widget.className = 'card';
    widget.style.marginTop = '0';
    widget.innerHTML = `
      <div class="card-title"><i class="fas fa-dumbbell"></i> ⚡ Physics daily (NON‑NEGOTIABLE)</div>
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap;">
        <span><i class="fas fa-check-circle" style="color:#3b82f6"></i> “Even if mood off, tired, bored — show up.”</span>
        <button id="physicsReminderBtn" class="btn-sm" style="background:#f97316; color:white;"><i class="fas fa-bell"></i> Remind me</button>
      </div>
      <div class="note" style="margin-top: 10px;">🔁 Physics = your weakness = your weapon. Build the 7:30 AM habit first.</div>
    `;
    const cards = rightColumn.querySelectorAll('.card');
    if (cards.length) {
      cards[cards.length - 1].insertAdjacentElement('afterend', widget);
    } else {
      rightColumn.appendChild(widget);
    }
    const reminderBtn = document.getElementById('physicsReminderBtn');
    if (reminderBtn) {
      reminderBtn.addEventListener('click', () => {
        alert("🧠 Right now: SIT FOR PHYSICS. Even 5 questions. Starting resistance will vanish after 7 days.");
      });
    }
  }

  // ---------- "NO ZERO DAYS" RULE CARD (adds to left column) ----------
  function addZeroDayRule() {
    const leftColumn = document.querySelector('.dashboard > div:first-child');
    if (!leftColumn) return;
    const lastCard = leftColumn.querySelector('.card:last-child');
    if (!lastCard) return;
    // Avoid duplicate
    if (document.getElementById('zeroDayRule')) return;
    const zeroDiv = document.createElement('div');
    zeroDiv.id = 'zeroDayRule';
    zeroDiv.style.marginTop = '1rem';
    zeroDiv.style.padding = '0.8rem';
    zeroDiv.style.background = '#fff7ed';
    zeroDiv.style.borderRadius = '1rem';
    zeroDiv.innerHTML = `<i class="fas fa-calendar-day"></i> <strong>No Zero Days rule:</strong> On worst days, just do 2 hours — ANY subject. Prove you can return.`;
    lastCard.appendChild(zeroDiv);
  }

  // ---------- SUNDAY MOCK TEST REMINDER (if today is Sunday) ----------
  function addSundayMockReminder() {
    const today = new Date().getDay(); // 0 = Sunday
    if (today !== 0) return;
    const rightColumn = document.querySelector('.dashboard > div:last-child');
    if (!rightColumn) return;
    const firstCard = rightColumn.querySelector('.card');
    if (!firstCard) return;
    // Avoid multiple reminders
    if (document.getElementById('sundayMockReminder')) return;
    const reminder = document.createElement('div');
    reminder.id = 'sundayMockReminder';
    reminder.className = 'rule-badge';
    reminder.style.background = '#fce7f3';
    reminder.style.marginBottom = '1rem';
    reminder.innerHTML = '<i class="fas fa-vial"></i> 🧪 TODAY IS SUNDAY → Mock test day! 3-4h test + 2h analysis. Simulate exam conditions.';
    firstCard.parentNode.insertBefore(reminder, firstCard);
  }

  // ---------- INITIALISE ALL ----------
  function init() {
    renderSevenDayGrid();
    loadDailyChecklist();
    injectPhysicsWidget();
    addZeroDayRule();
    addSundayMockReminder();
  }

  // Start everything when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
