// ========== GLOBAL VARIABLES ==========
let tests = JSON.parse(localStorage.getItem('mockTestsPro')) || [];
let questionBank = JSON.parse(localStorage.getItem('questionBank')) || [];
let currentTestId = null;
let currentTest = null;
let userAnswers = [];
let currentQIndex = 0;
let timerInterval = null;
let timeLeft = 0;
let importModal = null;

// ========== INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', function() {
    importModal = new bootstrap.Modal(document.getElementById('importModal'));
    if (document.getElementById('questionsContainer').children.length === 0) addQuestion();
});

// ========== UI NAVIGATION ==========
window.showSection = function(sectionName) {
    document.querySelectorAll('.section').forEach(s => s.style.display = 'none');
    document.getElementById(sectionName + '-section').style.display = 'block';
    if (sectionName === 'list') renderTestList();
    if (sectionName === 'create') resetCreateForm();
};

// ========== CREATE TEST ==========
window.addQuestion = function(questionData = null) {
    const container = document.getElementById('questionsContainer');
    const qDiv = document.createElement('div');
    qDiv.className = 'question-item';
    const idx = container.children.length;
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
                <input type="text" class="form-control" placeholder="Correct (A/B/C/D)" value="${questionData?.correct || ''}" maxlength="1" required>
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

document.getElementById('testForm').addEventListener('submit', function(e) {
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
        const correctRaw = item.querySelector('input[placeholder*="Correct"]').value.trim().toUpperCase();
        const topic = item.querySelector('input[placeholder*="Topic"]').value.trim();
        const explanation = item.querySelector('input[placeholder*="Explanation"]').value.trim();
        if (!text || opts.some(o => !o) || !correctRaw || !'ABCD'.includes(correctRaw)) {
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
});

function resetCreateForm() {
    document.getElementById('testForm').reset();
    document.getElementById('questionsContainer').innerHTML = '';
    addQuestion();
}

// ========== IMPORT ==========
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

// ========== LIST TESTS ==========
function renderTestList() {
    const container = document.getElementById('testListContainer');
    if (tests.length === 0) {
        container.innerHTML = '<p class="text-muted">No tests yet. Create one now!</p>';
        return;
    }
    let html = '<div class="mb-3"><button class="btn btn-outline-secondary" onclick="importTest()"><i class="bi bi-upload"></i> Import Test</button></div>';
    tests.forEach(test => {
        html += `
            <div class="d-flex justify-content-between align-items-center p-3 mb-3 bg-white rounded-4 shadow-sm">
                <div>
                    <h5 class="fw-semibold">${test.title} <span class="badge bg-secondary">${test.subject}</span></h5>
                    <small>${test.questions.length} questions · ${test.duration} min</small>
                </div>
                <div>
                    <button class="btn btn-sm btn-outline-primary me-2" onclick="editTest('${test.id}')" title="Edit"><i class="bi bi-pencil"></i></button>
                    <button class="btn btn-sm btn-outline-success me-2" onclick="exportTest('${test.id}')" title="Export"><i class="bi bi-download"></i></button>
                    <button class="btn btn-sm btn-info me-2" onclick="takeTest('${test.id}', true)" title="Start Randomized"><i class="bi bi-shuffle"></i></button>
                    <button class="btn btn-sm btn-primary me-2" onclick="takeTest('${test.id}', false)" title="Start"><i class="bi bi-play-fill"></i></button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteTest('${test.id}')" title="Delete"><i class="bi bi-trash3"></i></button>
                </div>
            </div>
        `;
    });
    container.innerHTML = html;
}

window.deleteTest = function(id) {
    if (confirm('Delete this test permanently?')) {
        tests = tests.filter(t => t.id !== id);
        localStorage.setItem('mockTestsPro', JSON.stringify(tests));
        renderTestList();
    }
};

// ========== EDIT TEST ==========
window.editTest = function(id) {
    const test = tests.find(t => t.id === id);
    if (!test) return;
    document.getElementById('testTitle').value = test.title;
    document.getElementById('testSubject').value = test.subject;
    document.getElementById('testDuration').value = test.duration;
    const container = document.getElementById('questionsContainer');
    container.innerHTML = '';
    test.questions.forEach(q => addQuestion(q));
    tests = tests.filter(t => t.id !== id);
    localStorage.setItem('mockTestsPro', JSON.stringify(tests));
    showSection('create');
    alert('You can now edit the test. Save it when done.');
};

// ========== QUESTION BANK ==========
window.showQuestionBank = function() {
    if (questionBank.length === 0) {
        alert('Question bank is empty. Save questions using the bookmark icon in each question.');
        return;
    }
    let list = 'Question Bank:\n';
    questionBank.forEach((q, i) => {
        list += `${i+1}. ${q.text.substring(0,50)}...\n`;
    });
    list += '\nEnter question number to add to test (or 0 to cancel):';
    const choice = prompt(list);
    if (choice && !isNaN(choice) && choice > 0 && choice <= questionBank.length) {
        addFromBank(choice - 1);
    }
};

window.addFromBank = function(index) {
    const q = questionBank[index];
    addQuestion(q);
};

window.saveToBank = function(btn) {
    const qItem = btn.closest('.question-item');
    const text = qItem.querySelector('textarea').value.trim();
    const opts = [
        qItem.querySelectorAll('input[type="text"]')[0].value.trim(),
        qItem.querySelectorAll('input[type="text"]')[1].value.trim(),
        qItem.querySelectorAll('input[type="text"]')[2].value.trim(),
        qItem.querySelectorAll('input[type="text"]')[3].value.trim()
    ];
    const correct = qItem.querySelector('input[placeholder*="Correct"]').value.trim().toUpperCase();
    const topic = qItem.querySelector('input[placeholder*="Topic"]').value.trim();
    const explanation = qItem.querySelector('input[placeholder*="Explanation"]').value.trim();
    if (!text || opts.some(o => !o) || !correct) {
        alert('Complete the question first.');
        return;
    }
    questionBank.push({ text, options: opts, correct, topic, explanation });
    localStorage.setItem('questionBank', JSON.stringify(questionBank));
    alert('Saved to question bank!');
};

// ========== EXPORT / IMPORT TEST ==========
window.exportTest = function(id) {
    const test = tests.find(t => t.id === id);
    if (!test) return;
    const dataStr = JSON.stringify(test, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${test.title.replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
};

window.importTest = function() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = e => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = ev => {
            try {
                const test = JSON.parse(ev.target.result);
                if (!test.title || !test.questions) throw new Error('Invalid test format');
                test.id = Date.now().toString();
                tests.push(test);
                localStorage.setItem('mockTestsPro', JSON.stringify(tests));
                alert('Test imported successfully!');
                renderTestList();
            } catch (err) {
                alert('Invalid JSON file.');
            }
        };
        reader.readAsText(file);
    };
    input.click();
};

// ========== TAKE TEST ==========
window.takeTest = function(id, randomize = true) {
    const test = tests.find(t => t.id === id);
    if (!test) return;
    currentTestId = id;
    let questions = [...test.questions];
    if (randomize) {
        for (let i = questions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [questions[i], questions[j]] = [questions[j], questions[i]];
        }
    }
    currentTest = { ...test, questions };
    currentQIndex = 0;
    userAnswers = questions.map(() => ({ selected: null, review: false }));

    document.getElementById('takeTestTitle').innerText = test.title + (randomize ? ' (Randomized)' : '');
    timeLeft = test.duration * 60;
    updateTimerDisplay();
    startTimer();

    renderQuestion();
    renderPalette();
    showSection('take');
};

function renderQuestion() {
    if (!currentTest) return;
    const q = currentTest.questions[currentQIndex];
    const ans = userAnswers[currentQIndex];
    const container = document.getElementById('takeTestContainer');
    let optionsHtml = '';
    q.options.forEach((opt, idx) => {
        const letter = String.fromCharCode(65 + idx);
        const checked = (ans.selected === idx) ? 'checked' : '';
        optionsHtml += `
            <div class="form-check mb-2">
                <input class="form-check-input" type="radio" name="questionOption" value="${idx}" id="opt${idx}" ${checked} onchange="saveAnswer(${currentQIndex}, ${idx})">
                <label class="form-check-label" for="opt${idx}">
                    <strong>${letter})</strong> ${opt}
                </label>
            </div>
        `;
    });
    container.innerHTML = `
        <div class="question-panel">
            <h5 class="fw-semibold mb-3">Q${currentQIndex+1}. ${q.text}</h5>
            ${optionsHtml}
            ${q.topic ? '<div class="mt-3"><span class="badge-topic"><i class="bi bi-tag"></i> ' + q.topic + '</span></div>' : ''}
        </div>
    `;
    renderPalette();
}

window.saveAnswer = function(qIndex, optIndex) {
    userAnswers[qIndex].selected = optIndex;
    renderPalette();
};

function renderPalette() {
    if (!currentTest) return;
    const palette = document.getElementById('paletteContainer');
    let btns = '';
    currentTest.questions.forEach((_, idx) => {
        let cls = 'palette-btn';
        if (userAnswers[idx].selected !== null) cls += ' answered';
        if (userAnswers[idx].review) cls += ' review';
        if (idx === currentQIndex) cls += ' current';
        btns += `<button class="${cls}" onclick="goToQuestion(${idx})">${idx+1}</button>`;
    });
    palette.innerHTML = btns;
}

window.goToQuestion = function(idx) {
    if (idx >= 0 && idx < currentTest.questions.length) {
        currentQIndex = idx;
        renderQuestion();
    }
};

window.prevQuestion = function() {
    if (currentQIndex > 0) {
        currentQIndex--;
        renderQuestion();
    }
};

window.nextQuestion = function() {
    if (currentQIndex < currentTest.questions.length - 1) {
        currentQIndex++;
        renderQuestion();
    }
};

window.markForReview = function() {
    if (!currentTest) return;
    userAnswers[currentQIndex].review = !userAnswers[currentQIndex].review;
    renderPalette();
};

function startTimer() {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            alert('Time is up! Submitting your test.');
            submitTest();
        } else {
            timeLeft--;
            updateTimerDisplay();
        }
    }, 1000);
}

function stopTimer() {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = null;
}

function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    document.getElementById('timerDisplay').innerText = `${minutes.toString().padStart(2,'0')}:${seconds.toString().padStart(2,'0')}`;
}

// ========== SUBMIT TEST ==========
window.submitTest = function() {
    stopTimer();
    if (!currentTest) return;

    let correctCount = 0, incorrectCount = 0, unanswered = 0;
    const topicStats = {};
    currentTest.questions.forEach((q, i) => {
        const ans = userAnswers[i];
        const topic = q.topic || 'General';
        if (!topicStats[topic]) topicStats[topic] = { total: 0, correct: 0 };
        topicStats[topic].total++;
        if (ans.selected === null) unanswered++;
        else {
            const correctIndex = q.correct.charCodeAt(0) - 65;
            if (ans.selected === correctIndex) {
                correctCount++;
                topicStats[topic].correct++;
            } else incorrectCount++;
        }
    });

    const total = currentTest.questions.length;
    const score = correctCount;

    let topicHtml = '';
    for (let topic in topicStats) {
        const stat = topicStats[topic];
        const percent = Math.round((stat.correct / stat.total) * 100);
        topicHtml += `<div class="mb-3"><div class="d-flex justify-content-between"><span><strong>${topic}</strong></span><span>${stat.correct}/${stat.total} (${percent}%)</span></div><div class="progress topic-progress"><div class="progress-bar bg-primary" style="width: ${percent}%"></div></div></div>`;
    }

    const resultContainer = document.getElementById('resultContainer');
    resultContainer.innerHTML = `
        <div class="stats-card mb-4">
            <div class="row text-center">
                <div class="col-4"><h2 class="text-success">${correctCount}</h2><small>Correct</small></div>
                <div class="col-4"><h2 class="text-danger">${incorrectCount}</h2><small>Incorrect</small></div>
                <div class="col-4"><h2 class="text-secondary">${unanswered}</h2><small>Unanswered</small></div>
            </div>
            <hr>
            <div class="text-center"><h3>Score: ${score} / ${total}</h3><p>${Math.round((score/total)*100)}%</p></div>
        </div>
        <h5 class="fw-semibold">Topic-wise Performance</h5>
        ${topicHtml}
    `;

    showDetailedReview();
    showSection('result');
};

function showDetailedReview() {
    const container = document.getElementById('resultContainer');
    let reviewHtml = '<h5 class="fw-semibold mt-4">Detailed Review</h5>';
    currentTest.questions.forEach((q, i) => {
        const ans = userAnswers[i];
        const correctIndex = q.correct.charCodeAt(0) - 65;
        const isCorrect = (ans.selected === correctIndex);
        const userLetter = ans.selected !== null ? String.fromCharCode(65 + ans.selected) : 'Not answered';
        const correctLetter = String.fromCharCode(65 + correctIndex);
        reviewHtml += `
            <div class="card mb-3 p-3 ${isCorrect ? 'border-success' : 'border-danger'}">
                <div class="d-flex justify-content-between">
                    <strong>Q${i+1}: ${q.text}</strong>
                    <span class="badge ${isCorrect ? 'bg-success' : 'bg-danger'}">${isCorrect ? 'Correct' : 'Incorrect'}</span>
                </div>
                <div class="row mt-2">
                    ${q.options.map((opt, idx) => `
                        <div class="col-md-6">
                            <span class="${idx === correctIndex ? 'fw-bold text-success' : ''} ${idx === ans.selected && idx !== correctIndex ? 'text-danger' : ''}">
                                ${String.fromCharCode(65+idx)}) ${opt}
                                ${idx === correctIndex ? ' ✓' : ''}
                                ${idx === ans.selected && idx !== correctIndex ? ' ✗' : ''}
                            </span>
                        </div>
                    `).join('')}
                </div>
                <div class="mt-2 small">
                    <span class="text-secondary">Your answer: ${userLetter}</span><br>
                    <span class="text-success">Correct: ${correctLetter}</span>
                    ${q.explanation ? `<br><span class="text-info">Explanation: ${q.explanation}</span>` : ''}
                </div>
            </div>
        `;
    });
    container.innerHTML += reviewHtml;
}
// ========== SMART IMPORT ==========
window.smartImport = function() {
    const text = prompt("Paste your questions below (format: Q1. ... / options / Answer: ...):");
    if (!text) return;
    
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    let questions = [];
    let currentQuestion = null;
    let optionPatterns = [/^[A-D][.)]/, /^\d+[.)]/, /^[ivx]+[.)]/i]; // detects A), 1), i), etc.
    
    for (let line of lines) {
        // Detect new question (starts with Q or number followed by dot)
        if (/^Q\d*[.)]|^\d+[.)]\s/.test(line)) {
            if (currentQuestion) questions.push(currentQuestion);
            currentQuestion = {
                text: line.replace(/^Q\d*[.)]/, '').trim(),
                options: [],
                correct: '',
                topic: '',
                explanation: ''
            };
        }
        // Detect option line
        else if (currentQuestion && optionPatterns.some(p => p.test(line))) {
            let optText = line.replace(/^[A-D\divx]+[.)]\s*/, '').trim();
            currentQuestion.options.push(optText);
        }
        // Detect answer line
        else if (currentQuestion && /^(answer|ans|correct)[\s:]*/i.test(line)) {
            let ansMatch = line.match(/[A-D]/i);
            if (ansMatch) currentQuestion.correct = ansMatch[0].toUpperCase();
        }
        // If no pattern matches, append to last question text (multiline question)
        else if (currentQuestion) {
            currentQuestion.text += ' ' + line;
        }
    }
    if (currentQuestion) questions.push(currentQuestion);
    
    // Validate and add
    let added = 0;
    questions.forEach(q => {
        if (q.text && q.options.length === 4 && q.correct) {
            addQuestion(q);
            added++;
        }
    });
    alert(`Added ${added} questions. ${questions.length - added} skipped (incomplete).`);
};
