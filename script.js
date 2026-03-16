// ========== GLOBAL VARIABLES ==========
let tests = JSON.parse(localStorage.getItem('cosmicTests')) || [];
let questionBank = JSON.parse(localStorage.getItem('cosmicQuestionBank')) || [];
let currentTestId = null;
let currentTest = null;
let userAnswers = [];               // { selected: null/0-3, review: boolean }
let currentQIndex = 0;
let timerInterval = null;
let timeLeft = 0;

// Dashboard stats
let stats = {
    testsTaken: parseInt(localStorage.getItem('cosmicTestsTaken')) || 0,
    totalScore: parseInt(localStorage.getItem('cosmicTotalScore')) || 0,
    totalQuestions: parseInt(localStorage.getItem('cosmicTotalQuestions')) || 0,
    recentTests: JSON.parse(localStorage.getItem('cosmicRecentTests')) || []
};

// ========== INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', function() {
    // Add default question if container exists and is empty
    if (document.getElementById('questionsContainer')?.children.length === 0) {
        addQuestion();
    }
    // Set up form submission
    document.getElementById('testForm')?.addEventListener('submit', saveTest);
    // Update dashboard stats
    updateDashboardStats();
    // Show dashboard by default
    showSection('dashboard');
    // Start daily countdown
    updateDailyCountdown();
    setInterval(updateDailyCountdown, 1000);
});

// ========== UI NAVIGATION ==========
window.showSection = function(sectionId) {
    document.querySelectorAll('.section').forEach(s => s.style.display = 'none');
    const section = document.getElementById(sectionId + '-section');
    if (section) section.style.display = 'block';
    if (sectionId === 'dashboard') updateDashboardStats();
    if (sectionId === 'library') renderTestList();
    if (sectionId === 'create') resetCreateForm();
};

// ========== DASHBOARD ==========
function updateDashboardStats() {
    document.getElementById('statsTestsCreated').innerText = tests.length;
    document.getElementById('statsTestsTaken').innerText = stats.testsTaken;
    let avg = stats.testsTaken ? Math.round(stats.totalScore / stats.testsTaken) : 0;
    document.getElementById('statsAvgScore').innerText = avg + '%';
    let acc = stats.totalQuestions ? Math.round((stats.totalScore / stats.totalQuestions) * 100) : 0;
    document.getElementById('statsAccuracy').innerText = acc + '%';

    // Recent tests
    const recentList = document.getElementById('recentTestsList');
    if (stats.recentTests.length) {
        recentList.innerHTML = stats.recentTests.map(t => `
            <div class="recommend-item">
                <span>${t.title}</span>
                <small>${t.date}</small>
            </div>
        `).join('');
    } else {
        recentList.innerHTML = '<p class="text-muted">No tests taken yet.</p>';
    }
}

function updateDailyCountdown() {
    // Mock countdown – ends at midnight
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    const diff = midnight - now;
    if (diff <= 0) {
        document.getElementById('dailyCountdown').innerText = '00:00:00';
        return;
    }
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    document.getElementById('dailyCountdown').innerText = 
        `${hours.toString().padStart(2,'0')}:${minutes.toString().padStart(2,'0')}:${seconds.toString().padStart(2,'0')}`;
}

window.startDailyChallenge = function() {
    // Create a quick daily challenge test
    const daily = {
        id: 'daily-' + Date.now(),
        title: 'Daily Challenge: Physics Fundamentals',
        subject: 'Physics',
        duration: 10,
        questions: [
            { text: 'SI unit of force?', options: ['Joule','Newton','Watt','Pascal'], correct: 'B', topic: 'Mechanics', explanation: 'Newton is correct.' },
            { text: 'Acceleration due to gravity near Earth?', options: ['9.8','10','8.9','9.1'], correct: 'A', topic: 'Gravitation', explanation: '9.8 m/s²' },
            { text: 'Which law is F = ma?', options: ['First','Second','Third','Gravitation'], correct: 'B', topic: 'Mechanics', explanation: 'Second Law' },
            { text: 'Which is a scalar?', options: ['Velocity','Force','Mass','Acceleration'], correct: 'C', topic: 'Kinematics', explanation: 'Mass is scalar.' },
            { text: 'Speed of light in vacuum?', options: ['3×10⁸','3×10⁶','3×10⁵','3×10⁷'], correct: 'A', topic: 'Optics', explanation: '3×10⁸ m/s' }
        ]
    };
    tests.push(daily);
    localStorage.setItem('cosmicTests', JSON.stringify(tests));
    takeTest(daily.id, false);
};

window.startMindfulMode = function() {
    Swal.fire({
        title: '🧘 Grounding Exercise',
        html: 'Take 3 deep breaths.<br><div class="breath-mini-circle mx-auto my-3"></div>',
        timer: 10000,
        timerProgressBar: true,
        showConfirmButton: true,
        confirmButtonText: 'Begin Test',
        background: '#0f1f2f',
        color: '#e0e5f0'
    }).then(() => {
        // Create a mindful test
        const mindful = {
            id: 'mindful-' + Date.now(),
            title: 'Mindful Practice: Biology Basics',
            subject: 'Biology',
            duration: 15,
            questions: [
                { text: 'Breathe in. Which organelle is the powerhouse?', options: ['Nucleus','Mitochondria','Ribosome','Golgi'], correct: 'B', topic: 'Cell', explanation: 'Mitochondria.' },
                { text: 'Exhale. Which vitamin is produced in sunlight?', options: ['A','B','C','D'], correct: 'D', topic: 'Biochemistry', explanation: 'Vitamin D.' },
                { text: 'Stay calm. Function of hemoglobin?', options: ['O₂ transport','CO₂ transport','Nutrient transport','Immunity'], correct: 'A', topic: 'Human Physiology', explanation: 'Oxygen transport.' }
            ]
        };
        tests.push(mindful);
        localStorage.setItem('cosmicTests', JSON.stringify(tests));
        takeTest(mindful.id, false);
    });
};

// ========== CREATE TEST ==========
window.addQuestion = function(questionData = null) {
    const container = document.getElementById('questionsContainer');
    const idx = container.children.length;
    const opt = questionData?.options || ['','','',''];
    const correctOptions = ['A','B','C','D'].map(l => 
        `<option value="${l}" ${questionData?.correct===l?'selected':''}>${l}</option>`
    ).join('');

    const html = `
        <div class="question-item" data-index="${idx}">
            <div class="d-flex justify-content-between align-items-start">
                <span class="badge-topic">Q${idx+1}</span>
                <div>
                    <button type="button" class="btn btn-sm btn-outline-cosmic me-2" onclick="saveToBank(this)"><i class="fas fa-bookmark"></i></button>
                    <button type="button" class="btn-close btn-close-white" onclick="this.closest('.question-item').remove()"></button>
                </div>
            </div>
            <textarea class="form-control cosmic-input mt-2" rows="2" placeholder="Question text" required>${questionData?.text || ''}</textarea>
            <div class="row g-2 mt-2">
                <div class="col-md-6"><input class="form-control cosmic-input" placeholder="Option A" value="${opt[0]}" required></div>
                <div class="col-md-6"><input class="form-control cosmic-input" placeholder="Option B" value="${opt[1]}" required></div>
                <div class="col-md-6"><input class="form-control cosmic-input" placeholder="Option C" value="${opt[2]}" required></div>
                <div class="col-md-6"><input class="form-control cosmic-input" placeholder="Option D" value="${opt[3]}" required></div>
            </div>
            <div class="row g-2 mt-2">
                <div class="col-md-2">
                    <select class="form-control cosmic-select" required>
                        <option value="" disabled ${!questionData?.correct?'selected':''}>Correct</option>
                        ${correctOptions}
                    </select>
                </div>
                <div class="col-md-4">
                    <input class="form-control cosmic-input" placeholder="Topic (optional)" value="${questionData?.topic || ''}">
                </div>
                <div class="col-md-6">
                    <input class="form-control cosmic-input" placeholder="Explanation (optional)" value="${questionData?.explanation || ''}">
                </div>
            </div>
        </div>
    `;
    container.insertAdjacentHTML('beforeend', html);
};

window.addSampleAIGenerated = function() {
    addQuestion({
        text: 'A photon of wavelength 400 nm is incident on a metal surface. Work function is 2.0 eV. What is max KE? (hc = 1240 eV·nm)',
        options: ['0.1 eV','1.1 eV','2.1 eV','3.1 eV'],
        correct: 'B',
        topic: 'Modern Physics',
        explanation: 'E = hc/λ = 1240/400 = 3.1 eV. KE = 3.1 - 2.0 = 1.1 eV.'
    });
};

function saveTest(e) {
    e.preventDefault();
    const title = document.getElementById('testTitle').value.trim();
    const subject = document.getElementById('testSubject').value;
    const duration = parseInt(document.getElementById('testDuration').value) || 30;
    const items = document.querySelectorAll('#questionsContainer .question-item');
    if (!items.length) { alert('Add at least one question.'); return; }

    let questions = [];
    for (let item of items) {
        const text = item.querySelector('textarea').value.trim();
        const opts = Array.from(item.querySelectorAll('input[type="text"]')).slice(0,4).map(i => i.value.trim());
        const correct = item.querySelector('select').value;
        const topic = item.querySelector('input[placeholder*="Topic"]').value.trim();
        const exp = item.querySelector('input[placeholder*="Explanation"]').value.trim();
        if (!text || opts.some(o => !o) || !correct) {
            alert('Please fill all required fields (question, options, correct).');
            return;
        }
        questions.push({ text, options: opts, correct, topic, explanation: exp });
    }

    const newTest = {
        id: Date.now().toString(),
        title, subject, duration,
        questions
    };
    tests.push(newTest);
    localStorage.setItem('cosmicTests', JSON.stringify(tests));
    alert('Test saved to the cosmos!');
    showSection('library');
}

function resetCreateForm() {
    document.getElementById('testForm').reset();
    document.getElementById('questionsContainer').innerHTML = '';
    addQuestion();
}

// ========== IMPORT MODALS (shared) ==========
let importModal, smartModal, aiModal, pdfModal;
document.addEventListener('DOMContentLoaded', function() {
    importModal = new bootstrap.Modal(document.getElementById('importModal'));
    smartModal = new bootstrap.Modal(document.getElementById('smartImportModal'));
    aiModal = new bootstrap.Modal(document.getElementById('aiImportModal'));
    pdfModal = new bootstrap.Modal(document.getElementById('pdfUploadModal'));
});

window.showImportModal = () => importModal.show();

window.processImport = function() {
    const text = document.getElementById('importText').value;
    if (!text.trim()) return;
    const lines = text.split('\n').filter(l => l.trim());
    lines.forEach(line => {
        const parts = line.split('|').map(s => s.trim());
        if (parts.length >= 6) {
            const qText = parts[0];
            const opts = parts.slice(1,5).map(o => o.replace(/^[A-D]\)\s*/, ''));
            const correct = parts[5].toUpperCase().replace(/[^A-D]/g, '');
            const topic = parts[6] || '';
            const exp = parts[7] || '';
            if (qText && opts.length === 4 && correct) {
                addQuestion({ text: qText, options: opts, correct, topic, explanation: exp });
            }
        }
    });
    importModal.hide();
    document.getElementById('importText').value = '';
};

// ========== SMART IMPORT ==========
let smartParsed = [];
window.smartImport = () => {
    document.getElementById('smartImportText').value = '';
    document.getElementById('smartPreviewContainer').innerHTML = '';
    document.getElementById('parseStatus').innerText = '';
    smartParsed = [];
    smartModal.show();
};

window.parseSmartImport = function() {
    const text = document.getElementById('smartImportText').value;
    if (!text.trim()) return;
    const lines = text.split('\n').map(l => l.trim()).filter(l => l);
    let questions = [];
    let current = null;
    for (let line of lines) {
        if (/^Q\d*[.)]|^\d+[.)]\s|^Question/i.test(line)) {
            if (current) questions.push(current);
            current = {
                text: line.replace(/^Q\d*[.)]|^\d+[.)]\s*|^Question\s*\d*[:.)]\s*/i, '').trim(),
                options: [],
                correct: '',
                topic: '',
                explanation: ''
            };
        } else if (current && /^[A-D][.)]|^\([A-D]\)/i.test(line)) {
            current.options.push(line.replace(/^[A-D][.)]\s*|^\([A-D]\)\s*/i, '').trim());
        } else if (current && /^(answer|ans|correct)[\s:]*/i.test(line)) {
            const m = line.match(/[A-D]/i);
            if (m) current.correct = m[0].toUpperCase();
        } else if (current) {
            current.text += ' ' + line;
        }
    }
    if (current) questions.push(current);
    smartParsed = questions.filter(q => q.text && q.options.length === 4);

    let html = '<table class="table table-dark"><thead><tr><th>Select</th><th>Question</th><th>Correct</th></tr></thead><tbody>';
    smartParsed.forEach((q,i) => {
        html += `<tr><td><input type="checkbox" class="smart-cb" data-index="${i}" checked></td><td>${q.text.substring(0,50)}...</td><td>${q.correct}</td></tr>`;
    });
    html += '</tbody></table>';
    document.getElementById('smartPreviewContainer').innerHTML = html;
    document.getElementById('parseStatus').innerText = `Found ${smartParsed.length} questions.`;
};

window.importSelectedSmart = function() {
    document.querySelectorAll('.smart-cb:checked').forEach(cb => {
        const idx = cb.dataset.index;
        addQuestion(smartParsed[idx]);
    });
    smartModal.hide();
};

// ========== AI IMPORT ==========
let aiParsed = [];
window.showAIImport = () => {
    document.getElementById('aiImportText').value = '';
    document.getElementById('aiPreviewContainer').innerHTML = '';
    document.getElementById('aiStatus').innerText = '';
    document.getElementById('importAiBtn').disabled = true;
    aiParsed = [];
    aiModal.show();
};

window.analyzeWithAI = function() {
    const text = document.getElementById('aiImportText').value;
    if (!text.trim()) return;
    document.getElementById('aiStatus').innerHTML = '<i class="fas fa-spinner fa-pulse"></i> AI analyzing...';
    setTimeout(() => {
        // Mock AI parse – in real app, call an API
        const lines = text.split('\n').map(l => l.trim()).filter(l => l);
        const qs = [];
        for (let i=0; i<lines.length; i+=6) {
            if (lines[i] && lines[i+1] && lines[i+2] && lines[i+3] && lines[i+4]) {
                qs.push({
                    text: lines[i].replace(/^\d*[.)]?\s*/,''),
                    options: [lines[i+1].replace(/^[A-D][.)]?\s*/,''),
                              lines[i+2].replace(/^[A-D][.)]?\s*/,''),
                              lines[i+3].replace(/^[A-D][.)]?\s*/,''),
                              lines[i+4].replace(/^[A-D][.)]?\s*/,'')],
                    correct: lines[i+5]?.match(/[A-D]/i)?.[0].toUpperCase() || 'A'
                });
            }
        }
        aiParsed = qs;
        document.getElementById('aiPreviewContainer').innerHTML = `<p>Parsed ${qs.length} questions.</p>`;
        document.getElementById('aiStatus').innerHTML = `<i class="fas fa-check-circle text-success"></i> Done.`;
        document.getElementById('importAiBtn').disabled = false;
    }, 1500);
};

window.importAIParsed = function() {
    aiParsed.forEach(q => addQuestion(q));
    aiModal.hide();
};

// ========== PDF UPLOAD (mock) ==========
window.showPdfUploadModal = () => pdfModal.show();

window.processPdfUpload = function() {
    const file = document.getElementById('pdfModalFile').files[0];
    const status = document.getElementById('pdfModalStatus');
    if (!file) { status.innerHTML = '<span class="text-danger">Select a PDF</span>'; return; }
    status.innerHTML = '<i class="fas fa-spinner fa-pulse"></i> Analyzing PDF...';
    setTimeout(() => {
        // Mock – generate 3 random questions
        const mockQuestions = [
            { text: 'What is the first law of thermodynamics?', options: ['Energy conservation','Entropy increase','Absolute zero','Heat death'], correct: 'A', topic: 'Physics', explanation: 'Energy cannot be created or destroyed.' },
            { text: 'Which element has atomic number 6?', options: ['Oxygen','Carbon','Nitrogen','Hydrogen'], correct: 'B', topic: 'Chemistry', explanation: 'Carbon.' },
            { text: 'What is the powerhouse of the cell?', options: ['Nucleus','Mitochondria','Ribosome','Golgi'], correct: 'B', topic: 'Biology', explanation: 'Mitochondria.' }
        ];
        mockQuestions.forEach(q => addQuestion(q));
        status.innerHTML = '<span class="text-success">Added 3 questions from PDF.</span>';
        setTimeout(() => { pdfModal.hide(); status.innerHTML = ''; }, 1500);
    }, 2000);
};

// ========== QUESTION BANK ==========
window.saveToBank = function(btn) {
    const item = btn.closest('.question-item');
    const q = {
        text: item.querySelector('textarea').value,
        options: Array.from(item.querySelectorAll('input[type="text"]')).slice(0,4).map(i => i.value),
        correct: item.querySelector('select').value,
        topic: item.querySelector('input[placeholder*="Topic"]').value,
        explanation: item.querySelector('input[placeholder*="Explanation"]').value
    };
    questionBank.push(q);
    localStorage.setItem('cosmicQuestionBank', JSON.stringify(questionBank));
    alert('Saved to question bank!');
};

window.showQuestionBank = function() {
    if (!questionBank.length) { alert('Bank is empty.'); return; }
    let list = questionBank.map((q,i) => `${i+1}. ${q.text.substring(0,30)}...`).join('\n');
    let choice = prompt('Enter number to add:\n' + list);
    if (choice && !isNaN(choice) && choice>0 && choice<=questionBank.length) {
        addQuestion(questionBank[choice-1]);
    }
};

// ========== TEST LIBRARY ==========
function renderTestList() {
    const container = document.getElementById('testListContainer');
    if (!tests.length) {
        container.innerHTML = '<p class="text-muted">No tests yet. Create one!</p>';
        return;
    }
    let html = '<div class="mb-3"><button class="btn btn-cosmic-outline" onclick="importTest()"><i class="fas fa-upload"></i> Import Test</button></div>';
    tests.forEach(t => {
        html += `
            <div class="cosmic-card p-3 mb-3">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <h5 class="mb-0">${t.title} <span class="badge bg-secondary">${t.subject}</span></h5>
                        <small>${t.questions.length} Q · ${t.duration} min</small>
                    </div>
                    <div class="d-flex gap-2">
                        <button class="btn btn-sm btn-cosmic-outline" onclick="editTest('${t.id}')"><i class="fas fa-pen"></i></button>
                        <button class="btn btn-sm btn-cosmic-outline" onclick="exportTest('${t.id}')"><i class="fas fa-download"></i></button>
                        <button class="btn btn-sm btn-cosmic-outline" onclick="takeTest('${t.id}', true)"><i class="fas fa-random"></i></button>
                        <button class="btn btn-sm btn-cosmic-success" onclick="takeTest('${t.id}')"><i class="fas fa-play"></i></button>
                        <button class="btn btn-sm btn-outline-da
