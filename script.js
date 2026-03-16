// ========== GLOBAL VARIABLES ==========
let tests = JSON.parse(localStorage.getItem('mockTestsPro')) || [];
let questionBank = JSON.parse(localStorage.getItem('questionBank')) || [];
let currentTestId = null;
let currentTest = null;               // questions array for the active test
let userAnswers = [];                  // { selected: null/0-3, review: boolean }
let currentQIndex = 0;
let timerInterval = null;
let timeLeft = 0;                       // seconds
let importModal, smartImportModal, aiImportModal, pdfUploadModal;
let aiParsedQuestions = [];
let smartParsedQuestions = [];

// Dashboard stats keys
let stats = {
    testsTaken: parseInt(localStorage.getItem('stats_testsTaken')) || 0,
    totalScore: parseInt(localStorage.getItem('stats_totalScore')) || 0,
    totalQuestions: parseInt(localStorage.getItem('stats_totalQuestions')) || 0,
    recentTests: JSON.parse(localStorage.getItem('stats_recentTests')) || []
};

// ========== INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Bootstrap modals
    importModal = new bootstrap.Modal(document.getElementById('importModal'));
    smartImportModal = new bootstrap.Modal(document.getElementById('smartImportModal'));
    aiImportModal = new bootstrap.Modal(document.getElementById('aiImportModal'));
    pdfUploadModal = new bootstrap.Modal(document.getElementById('pdfUploadModal'));

    // Add default question if container is empty
    if (document.getElementById('questionsContainer')?.children.length === 0) addQuestion();

    // Update dashboard stats
    updateDashboardStats();

    // Set up test form submission
    document.getElementById('testForm')?.addEventListener('submit', saveTest);
});

// ========== UI NAVIGATION ==========
window.showSection = function(sectionName) {
    document.querySelectorAll('.section').forEach(s => s.style.display = 'none');
    const section = document.getElementById(sectionName + '-section');
    if (section) section.style.display = 'block';
    if (sectionName === 'list') renderTestList();
    if (sectionName === 'create') resetCreateForm();
    if (sectionName === 'dashboard') updateDashboardStats();
};

// ========== DASHBOARD ==========
function updateDashboardStats() {
    document.getElementById('statsTestsCreated').innerText = tests.length;
    document.getElementById('statsTestsTaken').innerText = stats.testsTaken;
    const avgScore = stats.testsTaken ? Math.round(stats.totalScore / stats.testsTaken) : 0;
    document.getElementById('statsAvgScore').innerText = avgScore + '%';
    const accuracy = stats.totalQuestions ? Math.round((stats.totalScore / stats.totalQuestions) * 100) : 0;
    document.getElementById('statsAccuracy').innerText = accuracy + '%';

    // Recent tests
    const recentList = document.getElementById('recentTestsList');
    if (stats.recentTests.length) {
        recentList.innerHTML = stats.recentTests.map(t => `
            <div class="list-group-item bg-transparent text-white d-flex justify-content-between align-items-center">
                <span>${t.title} · ${t.date}</span>
                <button class="btn btn-sm btn-primary" onclick="takeTest('${t.id}')">Retake</button>
            </div>
        `).join('');
    } else {
        recentList.innerHTML = '<p class="text-muted">No tests taken yet.</p>';
    }
}

window.startDailyChallenge = function() {
    // Create a default daily challenge test
    const daily = {
        id: 'daily-' + Date.now(),
        title: 'Daily Challenge: Physics Fundamentals',
        subject: 'Physics',
        duration: 10,
        questions: [
            {
                text: 'Which of the following is a vector quantity?',
                options: ['Mass', 'Speed', 'Velocity', 'Time'],
                correct: 'C',
                topic: 'Kinematics',
                explanation: 'Velocity has both magnitude and direction.'
            },
            {
                text: 'What is the SI unit of force?',
                options: ['Joule', 'Newton', 'Watt', 'Pascal'],
                correct: 'B',
                topic: 'Mechanics',
                explanation: 'Newton (N) is the SI unit of force.'
            },
            {
                text: 'A car accelerates from rest at 2 m/s² for 5 seconds. Distance covered?',
                options: ['10 m', '20 m', '25 m', '50 m'],
                correct: 'C',
                topic: 'Kinematics',
                explanation: 's = ut + ½at² = 0 + ½×2×25 = 25 m'
            },
            {
                text: 'Which law states that every action has an equal and opposite reaction?',
                options: ['Newton\'s First', 'Newton\'s Second', 'Newton\'s Third', 'Law of Gravitation'],
                correct: 'C',
                topic: 'Mechanics',
                explanation: 'Newton\'s Third Law of Motion.'
            },
            {
                text: 'The dimensional formula of work is:',
                options: ['[ML²T⁻²]', '[MLT⁻²]', '[ML²T⁻¹]', '[MLT⁻¹]'],
                correct: 'A',
                topic: 'Units & Dimensions',
                explanation: 'Work = Force × Displacement → [MLT⁻²][L] = [ML²T⁻²]'
            }
        ]
    };
    // Temporarily add to tests (optional) and start
    tests.push(daily);
    localStorage.setItem('mockTestsPro', JSON.stringify(tests));
    takeTest(daily.id, true);
};

// ========== CREATE TEST ==========
window.addQuestion = function(questionData = null) {
    const container = document.getElementById('questionsContainer');
    const qDiv = document.createElement('div');
    qDiv.className = 'question-item';
    const idx = container.children.length;

    const correctOptions = ['A', 'B', 'C', 'D'].map(letter =>
        `<option value="${letter}" ${questionData?.correct === letter ? 'selected' : ''}>${letter}</option>`
    ).join('');

    qDiv.innerHTML = `
        <div class="d-flex justify-content-between align-items-start mb-2">
            <span class="badge-topic">Q${idx+1}</span>
            <div>
                <button type="button" class="btn btn-sm btn-outline-secondary me-2" onclick="saveToBank(this)"><i class="bi bi-bookmark-plus"></i></button>
                <button type="button" class="btn-close" onclick="this.closest('.question-item').remove()"></button>
            </div>
        </div>
        <div class="mb-3">
            <textarea class="form-control" rows="2" placeholder="Question text" required>${questionData?.text || ''}</textarea>
        </div>
        <div class="row g-2 mb-2">
            <div class="col-md-6"><input type="text" class="form-control" placeholder="Option A" value="${questionData?.options?.[0] || ''}" required></div>
            <div class="col-md-6"><input type="text" class="form-control" placeholder="Option B" value="${questionData?.options?.[1] || ''}" required></div>
            <div class="col-md-6"><input type="text" class="form-control" placeholder="Option C" value="${questionData?.options?.[2] || ''}" required></div>
            <div class="col-md-6"><input type="text" class="form-control" placeholder="Option D" value="${questionData?.options?.[3] || ''}" required></div>
        </div>
        <div class="row g-2">
            <div class="col-md-2">
                <select class="form-control" required>
                    <option value="" disabled ${!questionData?.correct ? 'selected' : ''}>Correct</option>
                    ${correctOptions}
                </select>
            </div>
            <div class="col-md-4">
                <input type="text" class="form-control" placeholder="Topic/Chapter (optional)" value="${questionData?.topic || ''}">
            </div>
            <div class="col-md-6">
                <input type="text" class="form-control" placeholder="Explanation (optional)" value="${questionData?.explanation || ''}">
            </div>
        </div>
    `;
    container.appendChild(qDiv);
};

window.addSampleAIGenerated = function() {
    const sample = {
        text: "A photon of wavelength 400 nm is incident on a metal surface. The work function is 2.0 eV. What is the maximum kinetic energy of photoelectrons? (Use hc = 1240 eV·nm)",
        options: ["0.1 eV", "1.1 eV", "2.1 eV", "3.1 eV"],
        correct: "B",
        topic: "Modern Physics",
        explanation: "E = hc/λ = 1240/400 = 3.1 eV. KE = E - φ = 3.1 - 2.0 = 1.1 eV."
    };
    addQuestion(sample);
};

function saveTest(e) {
    e.preventDefault();
    const title = document.getElementById('testTitle').value.trim();
    const subject = document.getElementById('testSubject').value;
    const duration = parseInt(document.getElementById('testDuration').value) || 30;
    const items = document.querySelectorAll('#questionsContainer .question-item');
    if (items.length === 0) { alert('Add at least one question.'); return; }

    let questions = [];
    let valid = true;
    items.forEach(item => {
        const text = item.querySelector('textarea').value.trim();
        const opts = [
            item.querySelectorAll('input[type="text"]')[0].value.trim(),
            item.querySelectorAll('input[type="text"]')[1].value.trim(),
            item.querySelectorAll('input[type="text"]')[2].value.trim(),
            item.querySelectorAll('input[type="text"]')[3].value.trim()
        ];
        const correctRaw = item.querySelector('select').value;
        const topic = item.querySelector('input[placeholder*="Topic"]').value.trim();
        const explanation = item.querySelector('input[placeholder*="Explanation"]').value.trim();
        if (!text || opts.some(o => !o) || !correctRaw) {
            valid = false; return;
        }
        questions.push({ text, options: opts, correct: correctRaw, topic, explanation });
    });
    if (!valid) { alert('Please fill all required fields (question, options, correct letter).'); return; }

    const newTest = {
        id: Date.now().toString(),
        title, subject, duration,
        questions
    };
    tests.push(newTest);
    localStorage.setItem('mockTestsPro', JSON.stringify(tests));
    alert('Test saved!');
    showSection('list');
}

function resetCreateForm() {
    document.getElementById('testForm').reset();
    document.getElementById('questionsContainer').innerHTML = '';
    addQuestion();
}

// ========== IMPORT (Pipe Format) ==========
window.showImportModal = function() { importModal.show(); };
window.processImport = function() {
    const text = document.getElementById('importText').value;
    if (!text.trim()) return;
    const lines = text.split('\n').filter(l => l.trim() !== '');
    lines.forEach(line => {
        const parts = line.split('|').map(s => s.trim());
        if (parts.length >= 6) {
            let qText = parts[0];
            let opts = parts.slice(1,5).map(o => o.replace(/^[A-D]\)\s*/, ''));
            let correct = parts[5].toUpperCase().replace(/[^A-D]/g, '');
            let topic = parts[6] || '';
            let explanation = parts[7] || '';
            if (qText && opts.length === 4 && correct) {
                addQuestion({ text: qText, options: opts, correct, topic, explanation });
            }
        }
    });
    importModal.hide();
    document.getElementById('importText').value = '';
};

// ========== SMART IMPORT ==========
window.smartImport = function() {
    document.getElementById('smartImportText').value = '';
    document.getElementById('smartPreviewContainer').innerHTML = '';
    document.getElementById('parseStatus').innerText = '';
    smartParsedQuestions = [];
    smartImportModal.show();
};

window.parseSmartImport = function() {
    const text = document.getElementById('smartImportText').value;
    if (!text.trim()) { alert('Paste some text.'); return; }

    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    let questions = [];
    let current = null;
    const optionPatterns = [/^[A-D][.)]/, /^[a-d][.)]/, /^\d+[.)]/, /^\([A-D]\)/, /^\([a-d]\)/];

    for (let line of lines) {
        if (/^Q\d*[.)]|^\d+[.)]\s|^Question\s*\d*[:.)]/i.test(line)) {
            if (current) questions.push(current);
            current = {
                text: line.replace(/^Q\d*[.)]|^\d+[.)]\s*|^Question\s*\d*[:.)]\s*/i, '').trim(),
                options: [],
                correct: '',
                topic: '',
                explanation: ''
            };
        } else if (current && optionPatterns.some(p => p.test(line))) {
            let optText = line.replace(/^[A-Da-d\divx]+[.)]\s*|^\([A-Da-d]\)\s*/, '').trim();
            current.options.push(optText);
        } else if (current && /^(answer|ans|correct|key)[\s:]*/i.test(line)) {
            let ansMatch = line.match(/[A-Da-d]/);
            if (ansMatch) current.correct = ansMatch[0].toUpperCase();
        } else if (current && /^topic[\s:]*/i.test(line)) {
            current.topic = line.replace(/^topic[\s:]*/i, '').trim();
        } else if (current && /^(explanation|exp|explain|note)[\s:]*/i.test(line)) {
            current.explanation = line.replace(/^(explanation|exp|explain|note)[\s:]*/i, '').trim();
        } else if (current) {
            current.text += ' ' + line;
        }
    }
    if (current) questions.push(current);

    smartParsedQuestions = questions.filter(q => q.text && q.options.length === 4);
    renderSmartPreview();
    document.getElementById('parseStatus').innerText = `Parsed ${smartParsedQuestions.length} questions.`;
};

function renderSmartPreview() {
    const container = document.getElementById('smartPreviewContainer');
    if (smartParsedQuestions.length === 0) {
        container.innerHTML = '<p class="text-muted">No valid questions found.</p>';
        return;
    }
    let html = '<table class="table table-dark table-hover"><thead><tr><th><input type="checkbox" id="selectAllPreview" checked onchange="toggleSelectAll(this)"></th><th>Question</th><th>Options</th><th>Correct</th></tr></thead><tbody>';
    smartParsedQuestions.forEach((q, idx) => {
        html += `<tr>
            <td><input type="checkbox" class="question-checkbox" data-index="${idx}" checked></td>
            <td>${escapeHtml(q.text.substring(0,50))}...</td>
            <td>${q.options.join(' | ')}</td>
            <td>${q.correct}</td>
        </tr>`;
    });
    html += '</tbody></table>';
    container.innerHTML = html;
}

window.toggleSelectAll = function(checkbox) {
    document.querySelectorAll('.question-checkbox').forEach(cb => cb.checked = checkbox.checked);
};

window.importSelectedSmart = function() {
    const selected = [];
    document.querySelectorAll('.question-checkbox:checked').forEach(cb => {
        selected.push(smartParsedQuestions[parseInt(cb.dataset.index)]);
    });
    selected.forEach(q => addQuestion(q));
    smartImportModal.hide();
    alert(`Added ${selected.length} questions.`);
};

// ========== AI IMPORT ==========
window.showAIImport = function() {
    document.getElementById('aiImportText').value = '';
    document.getElementById('aiPreviewContainer').innerHTML = '';
    document.getElementById('aiStatus').innerText = '';
    document.getElementById('importAiBtn').disabled = true;
    aiParsedQuestions = [];
    aiImportModal.show();
};

window.analyzeWithAI = function() {
    const text = document.getElementById('aiImportText').value.trim();
    if (!text) { alert('Paste some text.'); return; }

    const status = document.getElementById('aiStatus');
    status.innerHTML = '<i class="bi bi-hourglass-split"></i> AI analyzing...';

    setTimeout(() => {
        const mockParsed = mockAIParse(text);
        aiParsedQuestions = mockParsed;
        renderAIPreview(mockParsed);
        status.innerHTML = `<i class="bi bi-check-circle"></i> Found ${mockParsed.length} questions.`;
        document.getElementById('importAiBtn').disabled = false;
    }, 1500);
};

function mockAIParse(text) {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const questions = [];
    let current = null;
    for (let line of lines) {
        if (/^Q\d*[.)]|^\d+[.)]\s|^Question\s*\d*[:.)]/i.test(line)) {
            if (current) questions.push(current);
            current = {
                text: line.replace(/^Q\d*[.)]|^\d+[.)]\s*|^Question\s*\d*[:.)]\s*/i, '').trim(),
                options: [],
                correct: '',
                topic: '',
                explanation: ''
            };
        } else if (current && /^[A-D][.)]|^\([A-D]\)/i.test(line)) {
            let optText = line.replace(/^[A-D][.)]\s*|^\([A-D]\)\s*/i, '').trim();
            current.options.push(optText);
        } else if (current && /^(answer|ans|correct)[\s:]*/i.test(line)) {
            let ansMatch = line.match(/[A-D]/i);
            if (ansMatch) current.correct = ansMatch[0].toUpperCase();
        } else if (current && /^topic[\s:]*/i.test(line)) {
            current.topic = line.replace(/^topic[\s:]*/i, '').trim();
        } else if (current && /^(explanation|exp|note)[\s:]*/i.test(line)) {
            current.explanation = line.replace(/^(explanation|exp|note)[\s:]*/i, '').trim();
        } else if (current) {
            if (line.includes('-') || line.includes('—')) {
                current.options.push(line);
            } else {
                current.text += ' ' + line;
            }
        }
    }
    if (current) questions.push(current);

    questions.forEach(q => {
        if (q.options.length === 0 && q.text.toLowerCase().includes('match')) {
            q.options = [
                "A) a-i, b-ii, c-iii, d-iv",
                "B) a-ii, b-i, c-iv, d-iii",
                "C) a-iii, b-iv, c-i, d-ii",
                "D) a-iv, b-iii, c-ii, d-i"
            ];
            q.correct = 'A';
        }
    });
    return questions.filter(q => q.text && q.options.length >= 4);
}

function renderAIPreview(questions) {
    const container = document.getElementById('aiPreviewContainer');
    if (questions.length === 0) {
        container.innerHTML = '<p class="text-muted">No questions parsed.</p>';
        return;
    }
    let html = '<div class="list-group">';
    questions.forEach((q, idx) => {
        html += `<div class="list-group-item bg-dark text-white">Q${idx+1}: ${escapeHtml(q.text.substring(0,80))}... (${q.options.length} options)</div>`;
    });
    html += '</div>';
    container.innerHTML = html;
}

window.importAIParsed = function() {
    let added = 0;
    aiParsedQuestions.forEach(q => {
        if (q.text && q.options.length >= 4 && q.correct) {
            if (q.options.length > 4) q.options = q.options.slice(0,4);
            addQuestion(q);
            added++;
        }
    });
    alert(`Added ${added} questions.`);
    aiImportModal.hide();
};

// ========== PDF UPLOAD (Mock) ==========
window.showPdfUploadModal = function() { pdfUploadModal.show(); };
window.processPdfUpload = function() {
    const fileInput = document.getElementById('pdfFileInput');
    const statusDiv = document.getElementById('pdfUploadStatus');
    statusDiv.classList.remove('d-none');
    if (!fileInput.files.length) {
        statusDiv.innerHTML = '<i class="bi bi-exclamation-triangle"></i> Please select a PDF.';
        return;
    }
    statusDiv.innerHTML = '<i class="bi bi-hourglass-split"></i> Analyzing PDF with AI...';
    setTimeout(() => {
        statusDiv.innerHTML = '<i class="bi bi-check-circle"></i> Analysis complete! (Mock) Context will appear in review.';
        localStorage.setItem('pdfContext', JSON.stringify({ mock: true }));
        setTimeout(() => {
            pdfUploadModal.hide();
            statusDiv.classList.add('d-none');
        }, 1500);
    }, 2000);
};

// ========== QUESTION BANK ==========
window.showQuestionBank = function() {
    if (questionBank.length === 0) {
        alert('Question bank is empty. Save questions using the bookmark icon.');
        return;
    }
    let list = 'Question Bank:\n';
    questionBank.forEach((q, i) => { list += `${i+1}. ${q.text.substring(0,50)}...\n`; }
// ========== FOCUS ZONE ==========
let meditationInterval;
let meditationTime = 300; // 5 minutes in seconds
let meditationRunning = false;
let breathInterval;
let breathState = 'inhale';
let mantraList = [
    "I am calm and focused",
    "My mind is clear and peaceful",
    "I breathe in calm, breathe out stress",
    "I am present in this moment",
    "My potential is limitless",
    "I radiate positive energy",
    "I am in harmony with the universe"
];
let mantraIndex = 0;
let focusSessions = parseInt(localStorage.getItem('focusSessions')) || 0;
let totalFocusSeconds = parseInt(localStorage.getItem('totalFocusSeconds')) || 0;

function updateMedTimerDisplay() {
    const mins = Math.floor(meditationTime / 60);
    const secs = meditationTime % 60;
    document.getElementById('medTimer').innerText = `${mins.toString().padStart(2,'0')}:${secs.toString().padStart(2,'0')}`;
    const progress = ((300 - meditationTime) / 300) * 100;
    document.getElementById('medProgress').style.width = progress + '%';
}

function startMeditation() {
    if (meditationRunning) return;
    meditationRunning = true;
    document.getElementById('medStartBtn').innerHTML = '<i class="bi bi-play-fill fs-4"></i>';
    meditationInterval = setInterval(() => {
        if (meditationTime > 0) {
            meditationTime--;
            updateMedTimerDisplay();
        } else {
            // Session complete
            clearInterval(meditationInterval);
            meditationRunning = false;
            focusSessions++;
            totalFocusSeconds += 300;
            localStorage.setItem('focusSessions', focusSessions);
            localStorage.setItem('totalFocusSeconds', totalFocusSeconds);
            document.getElementById('focusSessions').innerText = focusSessions;
            alert('Meditation complete! Great job.');
            resetMeditation();
        }
    }, 1000);
}

function pauseMeditation() {
    clearInterval(meditationInterval);
    meditationRunning = false;
}

function resetMeditation() {
    pauseMeditation();
    meditationTime = 300;
    updateMedTimerDisplay();
}

// Breath circle animation
function startBreathCycle() {
    breathInterval = setInterval(() => {
        const circle = document.getElementById('breathCircle');
        const phase = document.getElementById('breathPhase');
        if (breathState === 'inhale') {
            circle.classList.add('inhale');
            circle.classList.remove('exhale');
            phase.innerText = 'Inhale';
            breathState = 'exhale';
        } else {
            circle.classList.add('exhale');
            circle.classList.remove('inhale');
            phase.innerText = 'Exhale';
            breathState = 'inhale';
        }
    }, 4000); // 4 sec inhale, 4 sec exhale
}
startBreathCycle();

// Mantra cycling
document.getElementById('mantraText').innerText = mantraList[0];
window.nextMantra = function() {
    mantraIndex = (mantraIndex + 1) % mantraList.length;
    document.getElementById('mantraText').innerText = mantraList[mantraIndex];
};

// Focus mode buttons
document.querySelectorAll('.focus-mode').forEach(btn => {
    btn.addEventListener('click', function(e) {
        document.querySelectorAll('.focus-mode').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        const mode = this.dataset.mode;
        document.getElementById('focusModeDisplay').innerText = this.innerText;
        // Change timer speed or background based on mode
        if (mode === 'fast') {
            meditationTime = 60; // 1 min
        } else if (mode === 'slow') {
            meditationTime = 300; // 5 min
        } else if (mode === 'homing') {
            // just visual
        }
        updateMedTimerDisplay();
    });
});

// Color psychology
window.setMood = function(mood) {
    const tips = {
        passion: 'Red: Passion, love, energy – great for motivation.',
        energy: 'Orange: Warmth, enthusiasm, creativity.',
        growth: 'Green: Growth, health, harmony – perfect for focus.',
        happiness: 'Yellow: Happiness, intellect, caution.',
        calm: 'Blue: Calmness, trust, wisdom – ideal for meditation.',
        creativity: 'Purple: Creativity, luxury, mystery.',
        love: 'Pink: Love, compassion, innocence.',
        power: 'Black: Power, sophistication, mystery.',
        purity: 'White: Purity, cleanliness, peace.'
    };
    document.getElementById('psychologyTip').innerHTML = `<i class="bi bi-info-circle me-2"></i>${tips[mood]}`;
    // Optionally change body background
    // document.body.style.background = moodColors[mood];
};

// Update stats display
document.getElementById('focusSessions').innerText = focusSessions;
const hours = Math.floor(totalFocusSeconds / 3600);
const minutes = Math.floor((totalFocusSeconds % 3600) / 60);
document.getElementById('totalFocusTime').innerText = `${hours}h ${minutes}m`;
document.getElementById('avgSession').innerText = focusSessions ? Math.round(totalFocusSeconds / focusSessions / 60) + 'm' : '0m';
