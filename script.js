// ========== GLOBAL VARIABLES ==========
let tests = JSON.parse(localStorage.getItem('mockTestsPro')) || [];
let questionBank = JSON.parse(localStorage.getItem('questionBank')) || [];
let currentTestId = null;
let currentTest = null;
let userAnswers = [];
let currentQIndex = 0;
let timerInterval = null;
let timeLeft = 0;
let importModal, smartImportModal, aiImportModal, pdfUploadModal;
let aiParsedQuestions = [];
let smartParsedQuestions = [];

let stats = {
    testsTaken: parseInt(localStorage.getItem('stats_testsTaken')) || 0,
    totalScore: parseInt(localStorage.getItem('stats_totalScore')) || 0,
    totalQuestions: parseInt(localStorage.getItem('stats_totalQuestions')) || 0,
    recentTests: JSON.parse(localStorage.getItem('stats_recentTests')) || []
};

// ========== INIT ==========
document.addEventListener('DOMContentLoaded', function() {
    importModal = new bootstrap.Modal(document.getElementById('importModal'));
    smartImportModal = new bootstrap.Modal(document.getElementById('smartImportModal'));
    aiImportModal = new bootstrap.Modal(document.getElementById('aiImportModal'));
    pdfUploadModal = new bootstrap.Modal(document.getElementById('pdfUploadModal'));
    if (document.getElementById('questionsContainer')?.children.length === 0) addQuestion();
    document.getElementById('testForm')?.addEventListener('submit', saveTest);
    updateDashboardStats();
    showSection('dashboard');
});

// ========== UI NAVIGATION ==========
window.showSection = function(section) {
    document.querySelectorAll('.section').forEach(s => s.style.display = 'none');
    document.getElementById(section + '-section').style.display = 'block';
    if (section === 'list') renderTestList();
    if (section === 'create') resetCreateForm();
    if (section === 'dashboard') updateDashboardStats();
};

// ========== DASHBOARD ==========
function updateDashboardStats() {
    document.getElementById('statsTestsCreated').innerText = tests.length;
    document.getElementById('statsTestsTaken').innerText = stats.testsTaken;
    let avg = stats.testsTaken ? Math.round(stats.totalScore / stats.testsTaken) : 0;
    document.getElementById('statsAvgScore').innerText = avg + '%';
    let acc = stats.totalQuestions ? Math.round((stats.totalScore / stats.totalQuestions) * 100) : 0;
    document.getElementById('statsAccuracy').innerText = acc + '%';
    let recent = document.getElementById('recentTestsList');
    if (stats.recentTests.length) {
        recent.innerHTML = stats.recentTests.map(t => `<div class="list-group-item bg-transparent text-white d-flex justify-content-between"><span>${t.title}</span><small>${t.date}</small></div>`).join('');
    } else {
        recent.innerHTML = '<p class="text-muted">No tests taken yet.</p>';
    }
}

// ========== MINDFUL MODE ==========
window.startMindfulMode = function() {
    Swal.fire({
        title: 'Grounding Exercise',
        html: 'Take 3 deep breaths.<br><div class="breath-mini-circle mx-auto my-3"></div>',
        timer: 10000,
        timerProgressBar: true,
        showConfirmButton: true,
        confirmButtonText: 'Begin Test',
        background: '#0B2B26',
        color: '#DAF1DE'
    }).then(() => {
        let mindfulTest = {
            id: 'mindful-' + Date.now(),
            title: 'Mindful Practice: Physics Fundamentals',
            subject: 'Physics',
            duration: 15,
            questions: [
                { text: 'Take a deep breath. SI unit of force?', options: ['Joule','Newton','Watt','Pascal'], correct: 'B', topic: 'Mechanics', explanation: 'Newton.' },
                { text: 'With relaxed mind, F = ma is which law?', options: ['First','Second','Third','Gravitation'], correct: 'B', topic: 'Mechanics', explanation: 'Second Law.' },
                { text: 'Breathe out. Acceleration due to gravity?', options: ['9.8','10','8.9','9.1'], correct: 'A', topic: 'Gravitation', explanation: '9.8 m/s²' }
            ]
        };
        tests.push(mindfulTest);
        localStorage.setItem('mockTestsPro', JSON.stringify(tests));
        takeTest(mindfulTest.id, false);
    });
};

// ========== CREATE TEST ==========
window.addQuestion = function(data = null) {
    let container = document.getElementById('questionsContainer');
    let idx = container.children.length;
    let opt = data?.options || ['','','',''];
    let correctOptions = ['A','B','C','D'].map(l => `<option value="${l}" ${data?.correct===l?'selected':''}>${l}</option>`).join('');
    let html = `
        <div class="question-item">
            <div class="d-flex justify-content-between">
                <span class="badge-topic">Q${idx+1}</span>
                <div>
                    <button class="btn btn-sm btn-outline-secondary me-2" onclick="saveToBank(this)"><i class="bi bi-bookmark-plus"></i></button>
                    <button class="btn-close" onclick="this.closest('.question-item').remove()"></button>
                </div>
            </div>
            <textarea class="form-control mt-2" rows="2" placeholder="Question" required>${data?.text||''}</textarea>
            <div class="row g-2 mt-2">
                <div class="col-md-6"><input class="form-control" placeholder="Option A" value="${opt[0]}" required></div>
                <div class="col-md-6"><input class="form-control" placeholder="Option B" value="${opt[1]}" required></div>
                <div class="col-md-6"><input class="form-control" placeholder="Option C" value="${opt[2]}" required></div>
                <div class="col-md-6"><input class="form-control" placeholder="Option D" value="${opt[3]}" required></div>
            </div>
            <div class="row g-2 mt-2">
                <div class="col-md-2"><select class="form-control" required><option value="" disabled ${!data?.correct?'selected':''}>Correct</option>${correctOptions}</select></div>
                <div class="col-md-4"><input class="form-control" placeholder="Topic" value="${data?.topic||''}"></div>
                <div class="col-md-6"><input class="form-control" placeholder="Explanation" value="${data?.explanation||''}"></div>
            </div>
        </div>
    `;
    container.insertAdjacentHTML('beforeend', html);
};

window.addSampleAIGenerated = function() {
    addQuestion({
        text: 'A photon of wavelength 400 nm...',
        options: ['0.1 eV','1.1 eV','2.1 eV','3.1 eV'],
        correct: 'B',
        topic: 'Modern Physics',
        explanation: 'E = hc/λ = 1240/400 = 3.1 eV, KE = 3.1-2.0=1.1 eV'
    });
};

function saveTest(e) {
    e.preventDefault();
    let title = document.getElementById('testTitle').value.trim();
    let subject = document.getElementById('testSubject').value;
    let duration = parseInt(document.getElementById('testDuration').value) || 30;
    let items = document.querySelectorAll('#questionsContainer .question-item');
    if (!items.length) { alert('Add at least one question.'); return; }
    let questions = [];
    for (let item of items) {
        let text = item.querySelector('textarea').value.trim();
        let opts = Array.from(item.querySelectorAll('input[type="text"]')).slice(0,4).map(i => i.value.trim());
        let correct = item.querySelector('select').value;
        let topic = item.querySelector('input[placeholder*="Topic"]').value.trim();
        let exp = item.querySelector('input[placeholder*="Explanation"]').value.trim();
        if (!text || opts.some(o=>!o) || !correct) { alert('Fill all required fields.'); return; }
        questions.push({ text, options: opts, correct, topic, explanation: exp });
    }
    tests.push({ id: Date.now().toString(), title, subject, duration, questions });
    localStorage.setItem('mockTestsPro', JSON.stringify(tests));
    alert('Test saved!');
    showSection('list');
}

function resetCreateForm() {
    document.getElementById('testForm').reset();
    document.getElementById('questionsContainer').innerHTML = '';
    addQuestion();
}

// ========== IMPORT (Pipe) ==========
window.showImportModal = () => importModal.show();
window.processImport = function() {
    let text = document.getElementById('importText').value;
    if (!text) return;
    text.split('\n').forEach(line => {
        let parts = line.split('|').map(s => s.trim());
        if (parts.length >= 6) {
            let opts = parts.slice(1,5).map(o => o.replace(/^[A-D]\)\s*/, ''));
            let correct = parts[5].toUpperCase().replace(/[^A-D]/g,'');
            if (parts[0] && opts.length===4 && correct) addQuestion({ text: parts[0], options: opts, correct, topic: parts[6]||'', explanation: parts[7]||'' });
        }
    });
    importModal.hide();
    document.getElementById('importText').value = '';
};

// ========== SMART IMPORT ==========
window.smartImport = () => { document.getElementById('smartImportText').value=''; smartImportModal.show(); };
window.parseSmartImport = function() {
    let lines = document.getElementById('smartImportText').value.split('\n').map(l=>l.trim()).filter(l=>l);
    let questions = [], current = null;
    for (let line of lines) {
        if (/^Q\d*[.)]|^\d+[.)]\s/.test(line)) {
            if (current) questions.push(current);
            current = { text: line.replace(/^Q\d*[.)]|^\d+[.)]\s*/,''), options: [], correct:'', topic:'', explanation:'' };
        } else if (current && /^[A-D][.)]/.test(line)) {
            current.options.push(line.replace(/^[A-D][.)]\s*/,''));
        } else if (current && /^(answer|ans|correct)[\s:]*/i.test(line)) {
            let m = line.match(/[A-D]/i); if (m) current.correct = m[0].toUpperCase();
        } else if (current) current.text += ' ' + line;
    }
    if (current) questions.push(current);
    smartParsedQuestions = questions.filter(q => q.text && q.options.length===4);
    let html = '<table class="table table-dark"><tr><th>Select</th><th>Question</th><th>Answer</th></tr>';
    smartParsedQuestions.forEach((q,i) => html += `<tr><td><input type="checkbox" class="smart-cb" data-index="${i}" checked></td><td>${q.text.substring(0,50)}...</td><td>${q.correct}</td></tr>`);
    html += '</table>';
    document.getElementById('smartPreviewContainer').innerHTML = html;
    document.getElementById('parseStatus').innerText = `Found ${smartParsedQuestions.length}`;
};
window.importSelectedSmart = function() {
    document.querySelectorAll('.smart-cb:checked').forEach(cb => addQuestion(smartParsedQuestions[cb.dataset.index]));
    smartImportModal.hide();
};

// ========== AI IMPORT ==========
window.showAIImport = () => { document.getElementById('aiImportText').value=''; aiImportModal.show(); };
window.analyzeWithAI = function() {
    setTimeout(() => {
        // mock AI parse – simplified
        let lines = document.getElementById('aiImportText').value.split('\n').map(l=>l.trim()).filter(l=>l);
        let qs = [];
        for (let i=0; i<lines.length; i+=6) {
            if (lines[i] && lines[i+1] && lines[i+2] && lines[i+3] && lines[i+4] && lines[i+5]) {
                qs.push({
                    text: lines[i].replace(/^Q\d*[.)]?/,''),
                    options: [lines[i+1].replace(/^[A-D][.)]?/,''), lines[i+2].replace(/^[A-D][.)]?/,''), lines[i+3].replace(/^[A-D][.)]?/,''), lines[i+4].replace(/^[A-D][.)]?/,'')],
                    correct: lines[i+5].match(/[A-D]/i)?.[0].toUpperCase() || 'A'
                });
            }
        }
        aiParsedQuestions = qs;
        document.getElementById('aiPreviewContainer').innerHTML = `<p>Parsed ${qs.length} questions.</p>`;
        document.getElementById('importAiBtn').disabled = false;
    }, 1000);
};
window.importAIParsed = function() {
    aiParsedQuestions.forEach(q => addQuestion(q));
    aiImportModal.hide();
};

// ========== PDF UPLOAD ==========
window.showPdfUploadModal = () => pdfUploadModal.show();
window.processPdfUpload = function() {
    let status = document.getElementById('pdfUploadStatus');
    status.classList.remove('d-none');
    status.innerHTML = 'Processing... (mock)';
    setTimeout(() => {
        status.innerHTML = 'Analysis complete (mock).';
        localStorage.setItem('pdfContext','mock');
        setTimeout(() => { pdfUploadModal.hide(); status.classList.add('d-none'); }, 1500);
    }, 2000);
};

// ========== QUESTION BANK ==========
window.saveToBank = function(btn) {
    let item = btn.closest('.question-item');
    let q = {
        text: item.querySelector('textarea').value,
        options: Array.from(item.querySelectorAll('input[type="text"]')).slice(0,4).map(i=>i.value),
        correct: item.querySelector('select').value,
        topic: item.querySelector('input[placeholder*="Topic"]').value,
        explanation: item.querySelector('input[placeholder*="Explanation"]').value
    };
    questionBank.push(q);
    localStorage.setItem('questionBank', JSON.stringify(questionBank));
    alert('Saved to bank');
};
window.showQuestionBank = function() {
    if (!questionBank.length) { alert('Bank empty'); return; }
    let list = questionBank.map((q,i)=>`${i+1}. ${q.text.substring(0,30)}...`).join('\n');
    let idx = prompt('Enter number to add:\n'+list);
    if (idx && !isNaN(idx) && idx>0 && idx<=questionBank.length) addQuestion(questionBank[idx-1]);
};

// ========== TEST LIST ==========
function renderTestList() {
    let container = document.getElementById('testListContainer');
    if (!tests.length) { container.innerHTML = '<p class="text-muted">No tests.</p>'; return; }
    let html = '<div class="mb-3"><button class="btn btn-outline-secondary" onclick="importTest()">Import Test</button></div>';
    tests.forEach(t => {
        html += `<div class="d-flex justify-content-between p-3 mb-2 border rounded">
            <div><h5>${t.title} <span class="badge bg-secondary">${t.subject}</span></h5><small>${t.questions.length} Q · ${t.duration} min</small></div>
            <div class="d-flex gap-2">
                <button class="btn btn-sm btn-outline-primary" onclick="editTest('${t.id}')"><i class="bi bi-pencil"></i></button>
                <button class="btn btn-sm btn-outline-success" onclick="exportTest('${t.id}')"><i class="bi bi-download"></i></button>
                <button class="btn btn-sm btn-info" onclick="takeTest('${t.id}',true)"><i class="bi bi-shuffle"></i></button>
                <button class="btn btn-sm btn-primary" onclick="takeTest('${t.id}')"><i class="bi bi-play-fill"></i></button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteTest('${t.id}')"><i class="bi bi-trash"></i></button>
            </div>
        </div>`;
    });
    container.innerHTML = html;
}
window.deleteTest = function(id) { tests = tests.filter(t=>t.id!==id); localStorage.setItem('mockTestsPro',JSON.stringify(tests)); renderTestList(); };
window.editTest = function(id) {
    let t = tests.find(t=>t.id===id);
    if (!t) return;
    document.getElementById('testTitle').value = t.title;
    document.getElementById('testSubject').value = t.subject;
    document.getElementById('testDuration').value = t.duration;
    document.getElementById('questionsContainer').innerHTML = '';
    t.questions.forEach(q => addQuestion(q));
    tests = tests.filter(tt=>tt.id!==id);
    localStorage.setItem('mockTestsPro',JSON.stringify(tests));
    showSection('create');
};

// ========== EXPORT/IMPORT ==========
window.exportTest = function(id) {
    let t = tests.find(t=>t.id===id);
    let blob = new Blob([JSON.stringify(t,null,2)], {type:'application/json'});
    let a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = t.title.replace(/\s+/g,'_')+'.json';
    a.click();
};
window.importTest = function() {
    let input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = e => {
        let file = e.target.files[0];
        let reader = new FileReader();
        reader.onload = ev => {
            try {
                let t = JSON.parse(ev.target.result);
                if (!t.title || !t.questions) throw 'Invalid';
                t.id = Date.now().toString();
                tests.push(t);
                localStorage.setItem('mockTestsPro',JSON.stringify(tests));
                alert('Imported');
                renderTestList();
            } catch { alert('Invalid JSON'); }
        };
        reader.readAsText(file);
    };
    input.click();
};

// ========== TAKE TEST ==========
window.takeTest = function(id, randomize=false) {
    let t = tests.find(t=>t.id===id);
    if (!t) return;
    currentTestId = id;
    let qs = [...t.questions];
    if (randomize) qs.sort(()=>Math.random()-0.5);
    currentTest = { ...t, questions: qs };
    currentQIndex = 0;
    userAnswers = qs.map(()=>({selected:null, review:false}));
    document.getElementById('takeTestTitle').innerText = t.title;
    timeLeft = t.duration*60;
    updateTimerDisplay();
    startTimer();
    renderQuestion();
    renderPalette();
    showSection('take');
};

function renderQuestion() {
    let q = currentTest.questions[currentQIndex];
    let ans = userAnswers[currentQIndex];
    let html = `<h5>Q${currentQIndex+1}. ${q.text}</h5>`;
    q.options.forEach((opt,i) => {
        let checked = ans.selected===i ? 'checked' : '';
        html += `<div class="form-check"><input class="form-check-input" type="radio" name="qOpt" value="${i}" ${checked} onchange="saveAnswer(${currentQIndex},${i})"> <label>${String.fromCharCode(65+i)}) ${opt}</label></div>`;
    });
    if (q.topic) html += `<div class="mt-2 badge-topic">${q.topic}</div>`;
    document.getElementById('takeTestContainer').innerHTML = html;
    renderPalette();
}
window.saveAnswer = (idx,opt) => { userAnswers[idx].selected = opt; renderPalette(); };
function renderPalette() {
    let btns = '';
    currentTest.questions.forEach((_,i) => {
        let cls = 'palette-btn';
        if (userAnswers[i].selected!==null) cls += ' answered';
        if (userAnswers[i].review) cls += ' review';
        if (i===currentQIndex) cls += ' current';
        btns += `<button class="${cls}" onclick="goToQuestion(${i})">${i+1}</button>`;
    });
    document.getElementById('paletteContainer').innerHTML = btns;
}
window.goToQuestion = i => { currentQIndex = i; renderQuestion(); };
window.prevQuestion = () => { if (currentQIndex>0) { currentQIndex--; renderQuestion(); } };
window.nextQuestion = () => { if (currentQIndex<currentTest.questions.length-1) { currentQIndex++; renderQuestion(); } };
window.markForReview = () => { userAnswers[currentQIndex].review = !userAnswers[currentQIndex].review; renderPalette(); };
function startTimer() {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        if (timeLeft<=0) { clearInterval(timerInterval); alert('Time up!'); submitTest(); }
        else { timeLeft--; updateTimerDisplay(); }
    },1000);
}
function updateTimerDisplay() {
    let m = Math.floor(timeLeft/60), s = timeLeft%60;
    document.getElementById('timerDisplay').innerText = `${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
}
function stopTimer() { clearInterval(timerInterval); timerInterval=null; }

// ========== SUBMIT ==========
window.submitTest = function() {
    stopTimer();
    let correct=0, incorrect=0, unans=0;
    let topicStats = {};
    currentTest.questions.forEach((q,i) => {
        let ans = userAnswers[i];
        let t = q.topic||'General';
        if (!topicStats[t]) topicStats[t] = { total:0, correct:0 };
        topicStats[t].total++;
        if (ans.selected===null) unans++;
        else if (ans.selected === (q.correct.charCodeAt(0)-65)) { correct++; topicStats[t].correct++; }
        else incorrect++;
    });
    let total = currentTest.questions.length;
    stats.testsTaken++; stats.totalScore += correct; stats.totalQuestions += total;
    stats.recentTests.unshift({title:currentTest.title, date:new Date().toLocaleDateString()});
    if (stats.recentTests.length>5) stats.recentTests.pop();
    localStorage.setItem('stats_testsTaken',stats.t
