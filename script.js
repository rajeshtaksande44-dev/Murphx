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
// ========== SMART IMPORT PROFESSIONAL ==========
let smartParsedQuestions = []; // store parsed questions for preview

window.smartImport = function() {
    // Reset modal
    document.getElementById('smartImportText').value = '';
    document.getElementById('smartPreviewContainer').innerHTML = '';
    document.getElementById('parseStatus').innerText = '';
    smartParsedQuestions = [];
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('smartImportModal'));
    modal.show();
};

window.parseSmartImport = function() {
    const text = document.getElementById('smartImportText').value;
    if (!text.trim()) {
        alert('Please paste some text.');
        return;
    }
    
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    let questions = [];
    let current = null;
    let optionPatterns = [
        /^[A-D][.)]/,           // A), A.
        /^[a-d][.)]/,           // a), a.
        /^\d+[.)]/,              // 1), 1.
        /^\([A-D]\)/,            // (A)
        /^\([a-d]\)/,            // (a)
        /^[ivx]+[.)]/i           // i), ii.
    ];
    
    for (let line of lines) {
        // Detect question start (e.g., "Q1.", "1.", "Question 1:", etc.)
        if (/^Q\d*[.)]|^\d+[.)]\s|^Question\s*\d*[:.)]|^\d+\.\s+\D/i.test(line)) {
            if (current) questions.push(current);
            current = {
                text: line.replace(/^Q\d*[.)]|^\d+[.)]\s*|^Question\s*\d*[:.)]\s*/i, '').trim(),
                options: [],
                correct: '',
                topic: '',
                explanation: ''
            };
        }
        // Option detection
        else if (current && optionPatterns.some(p => p.test(line))) {
            let optText = line.replace(/^[A-Da-d\divx]+[.)]\s*|^\([A-Da-d]\)\s*/, '').trim();
            current.options.push(optText);
        }
        // Answer detection
        else if (current && /^(answer|ans|correct|key)[\s:]*/i.test(line)) {
            let ansMatch = line.match(/[A-Da-d]/); // find first letter A-D
            if (ansMatch) current.correct = ansMatch[0].toUpperCase();
        }
        // Topic detection
        else if (current && /^topic[\s:]*/i.test(line)) {
            current.topic = line.replace(/^topic[\s:]*/i, '').trim();
        }
        // Explanation detection
        else if (current && /^(explanation|exp|explain|note)[\s:]*/i.test(line)) {
            current.explanation = line.replace(/^(explanation|exp|explain|note)[\s:]*/i, '').trim();
            // Inside the question loop, after explanation
if (pdfContextData.perQuestion && pdfContextData.perQuestion[i]) {
    reviewHtml += `
        <div class="mt-3 p-3 bg-warning bg-opacity-10 rounded-3 border-start border-warning border-4">
            <i class="bi bi-book-fill text-warning me-2"></i>📘 NCERT Context: ${pdfContextData.perQuestion[i]}
        </div>
    `;
} else {
    // Fallback mock context for demonstration
    reviewHtml += `
        <div class="mt-3 p-3 bg-light rounded-3 border-start border-secondary border-4">
            <i class="bi bi-info-circle me-2"></i>ℹ️ Upload a PDF to get AI-generated NCERT lines for each question.
        </div>
    `;
}
        }
        // Otherwise append to current question text (multiline)
        else if (current) {
            current.text += ' ' + line;
        }
    }
    if (current) questions.push(current);
    
    // Filter valid questions (at least text and 4 options)
    smartParsedQuestions = questions.filter(q => q.text && q.options.length === 4);
    
    // Render preview
    renderSmartPreview();
    document.getElementById('parseStatus').innerText = `Parsed ${smartParsedQuestions.length} questions.`;
};

function renderSmartPreview() {
    const container = document.getElementById('smartPreviewContainer');
    if (smartParsedQuestions.length === 0) {
        container.innerHTML = '<p class="text-muted">No valid questions found. Check your format.</p>';
        return;
    }
    
    let html = `
        <table class="smart-preview-table">
            <thead>
                <tr>
                    <th style="width:40px"><input type="checkbox" id="selectAllPreview" checked onchange="toggleSelectAll(this)"></th>
                    <th>Question</th>
                    <th>Options</th>
                    <th>Correct</th>
                    <th>Topic</th>
                    <th>Explanation</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    smartParsedQuestions.forEach((q, idx) => {
        html += `
            <tr>
                <td><input type="checkbox" class="question-checkbox" data-index="${idx}" checked></td>
                <td><input type="text" class="smart-edit-input" value="${escapeHtml(q.text)}" onchange="updateQuestion(${idx}, 'text', this.value)"></td>
                <td>
                    ${[0,1,2,3].map(i => `
                        <input type="text" class="smart-edit-input mb-1" value="${escapeHtml(q.options[i] || '')}" placeholder="Option ${String.fromCharCode(65+i)}" onchange="updateOption(${idx}, ${i}, this.value)">
                    `).join('')}
                </td>
                <td>
                    <select class="smart-edit-input" onchange="updateQuestion(${idx}, 'correct', this.value)">
                        <option value="">Select</option>
                        <option value="A" ${q.correct === 'A' ? 'selected' : ''}>A</option>
                        <option value="B" ${q.correct === 'B' ? 'selected' : ''}>B</option>
                        <option value="C" ${q.correct === 'C' ? 'selected' : ''}>C</option>
                        <option value="D" ${q.correct === 'D' ? 'selected' : ''}>D</option>
                    </select>
                </td>
                <td><input type="text" class="smart-edit-input" value="${escapeHtml(q.topic || '')}" onchange="updateQuestion(${idx}, 'topic', this.value)"></td>
                <td><input type="text" class="smart-edit-input" value="${escapeHtml(q.explanation || '')}" onchange="updateQuestion(${idx}, 'explanation', this.value)"></td>
            </tr>
        `;
    });
    
    html += '</tbody></table>';
    container.innerHTML = html;
}

// Helper to escape HTML for safe editing
function escapeHtml(unsafe) {
    return unsafe.replace(/[&<>"]/g, function(m) {
        if(m === '&') return '&amp;'; if(m === '<') return '&lt;'; if(m === '>') return '&gt;'; if(m === '"') return '&quot;';
        return m;
    });
}

// Update question in smartParsedQuestions
window.updateQuestion = function(idx, field, value) {
    if (smartParsedQuestions[idx]) {
        smartParsedQuestions[idx][field] = value;
    }
};

window.updateOption = function(idx, optIndex, value) {
    if (smartParsedQuestions[idx]) {
        smartParsedQuestions[idx].options[optIndex] = value;
    }
};

window.toggleSelectAll = function(checkbox) {
    document.querySelectorAll('.question-checkbox').forEach(cb => cb.checked = checkbox.checked);
};

window.importSelectedSmart = function() {
    const selectedIndices = [];
    document.querySelectorAll('.question-checkbox:checked').forEach(cb => {
        selectedIndices.push(parseInt(cb.dataset.index));
    });
    
    let added = 0;
    selectedIndices.forEach(idx => {
        const q = smartParsedQuestions[idx];
        if (q.text && q.options.length === 4 && q.correct) {
            addQuestion(q);
            added++;
        }
    });
    
    alert(`Added ${added} questions.`);
    // Close modal
    bootstrap.Modal.getInstance(document.getElementById('smartImportModal')).hide();
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

    // Load PDF context if available
    const storedContext = localStorage.getItem('pdfContext');
    if (storedContext) {
        pdfContextData = JSON.parse(storedContext);
    } else {
        pdfContextData = { perQuestion: {} };
    }

    // ... rest of your submitTest code
};
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
// ========== PDF UPLOAD & AI ANALYSIS ==========
let pdfContextData = {}; // Stores AI-generated context per question index (after test creation)

window.showPdfUploadModal = function() {
    const modal = new bootstrap.Modal(document.getElementById('pdfUploadModal'));
    modal.show();
};

window.processPdfUpload = function() {
    const fileInput = document.getElementById('pdfFileInput');
    const statusDiv = document.getElementById('pdfUploadStatus');
    statusDiv.classList.remove('d-none');
    
    if (!fileInput.files.length) {
        statusDiv.innerHTML = '<i class="bi bi-exclamation-triangle"></i> Please select a PDF file.';
        return;
    }
    
    const file = fileInput.files[0];
    statusDiv.innerHTML = '<i class="bi bi-hourglass-split"></i> Reading PDF...';
    
    // Use PDF.js to extract text (first few pages as mock)
    const reader = new FileReader();
    reader.onload = function(e) {
        const typedarray = new Uint8Array(e.target.result);
        
        pdfjsLib.getDocument(typedarray).promise.then(function(pdf) {
            let fullText = '';
            const numPages = Math.min(pdf.numPages, 5); // Limit to first 5 pages for demo
            const pagePromises = [];
            
            for (let i = 1; i <= numPages; i++) {
                pagePromises.push(pdf.getPage(i).then(page => 
                    page.getTextContent().then(textContent => 
                        textContent.items.map(item => item.str).join(' ')
                    )
                ));
            }
            
            Promise.all(pagePromises).then(pagesText => {
                fullText = pagesText.join('\n');
                statusDiv.innerHTML = '<i class="bi bi-robot"></i> Analyzing with AI... (mock)';
                
                // Simulate AI analysis: generate mock context based on extracted text
                setTimeout(() => {
                    // In a real implementation, you'd send fullText to an AI API (e.g., OpenAI)
                    // and receive context per question. Here we mock it.
                    const mockContext = {
                        general: "Based on the uploaded PDF, here are key lines:\n" + fullText.substring(0, 200) + "...",
                        perQuestion: {} // will be filled when test is taken
                    };
                    
                    // Store context globally (could be associated with test later)
                    localStorage.setItem('pdfContext', JSON.stringify(mockContext));
                    
                    statusDiv.innerHTML = '<i class="bi bi-check-circle"></i> Analysis complete! Context will appear in review.';
                    
                    // Close modal after a delay
                    setTimeout(() => {
                        bootstrap.Modal.getInstance(document.getElementById('pdfUploadModal')).hide();
                        statusDiv.classList.add('d-none');
                    }, 2000);
                }, 1500);
            });
        }).catch(error => {
            statusDiv.innerHTML = '<i class="bi bi-exclamation-triangle"></i> Error reading PDF: ' + error;
        });
    };
    reader.readAsArrayBuffer(file);
};
