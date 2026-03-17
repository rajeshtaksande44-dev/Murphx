// ========== COSMICPREP – COMPLETE FUNCTIONALITY ==========
// Data stores (persisted in localStorage)
let tests = JSON.parse(localStorage.getItem('cosmicTests')) || [];
let questionBank = JSON.parse(localStorage.getItem('cosmicQuestionBank')) || [];
let pyqBank = JSON.parse(localStorage.getItem('cosmicPYQBank')) || [];
let forumPosts = JSON.parse(localStorage.getItem('cosmicForumPosts')) || [];
let doubts = JSON.parse(localStorage.getItem('cosmicDoubts')) || [];
let userProfile = JSON.parse(localStorage.getItem('cosmicProfile')) || {
    name: 'Cosmic Warrior',
    target: 'JEE Advanced 2026',
    streak: 7,
    testsTaken: 0,
    totalScore: 0,
    totalQuestions: 0,
    lastActive: new Date().toDateString()
};

// ========== INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', function() {
    // Set up navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const sectionId = this.getAttribute('onclick').match(/'([^']+)'/)[1];
            showSection(sectionId);
        });
    });

    // Load sample data if empty
    if (pyqBank.length === 0) loadSamplePYQs();
    if (forumPosts.length === 0) loadSampleForumPosts();
    
    // Update dashboard stats
    updateDashboardStats();
    
    // Start daily countdown
    updateDailyCountdown();
    setInterval(updateDailyCountdown, 1000);
    
    // Load test library
    renderTestLibrary();
    
    // Load PYQ list
    renderPYQList();
    
    // Load forum posts
    renderForumPosts();
    
    // Load doubts list
    renderDoubtsList();
    
    // Display user profile
    renderProfile();
});

// ========== SECTION SWITCHING ==========
function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(s => s.style.display = 'none');
    document.getElementById(sectionId + '-section').style.display = 'block';
    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
    document.querySelector(`.nav-link[onclick*="'${sectionId}'"]`).classList.add('active');
}

// ========== DASHBOARD ==========
function updateDashboardStats() {
    document.getElementById('statsTestsCreated').innerText = tests.length;
    document.getElementById('statsTestsTaken').innerText = userProfile.testsTaken;
    let avg = userProfile.testsTaken ? Math.round(userProfile.totalScore / userProfile.testsTaken) : 0;
    document.getElementById('statsAvgScore').innerText = avg + '%';
    let acc = userProfile.totalQuestions ? Math.round((userProfile.totalScore / userProfile.totalQuestions) * 100) : 0;
    document.getElementById('statsAccuracy').innerText = acc + '%';
    document.getElementById('streakCount').innerText = userProfile.streak;
    
    // Recent activity (last 3 tests taken)
    const recentTests = tests.filter(t => t.lastTaken).sort((a,b) => new Date(b.lastTaken) - new Date(a.lastTaken)).slice(0,3);
    let recentHtml = '';
    if (recentTests.length) {
        recentTests.forEach(t => {
            recentHtml += `<div class="test-item">${t.title} · ${t.lastScore}/${t.questions.length} correct · ${new Date(t.lastTaken).toLocaleDateString()}</div>`;
        });
    } else {
        recentHtml = '<p class="text-muted">No tests taken yet.</p>';
    }
    document.getElementById('recentTestsList').innerHTML = recentHtml;
}

function updateDailyCountdown() {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24,0,0,0);
    const diff = midnight - now;
    if (diff <= 0) {
        document.getElementById('dailyCountdown').innerText = '00:00:00';
        return;
    }
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    document.getElementById('dailyCountdown').innerText = `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
}

window.startDailyChallenge = function() {
    // Create a quick daily challenge (can be random)
    const daily = {
        id: 'daily-' + Date.now(),
        title: 'Daily Challenge: Mixed Topics',
        subject: 'Mixed',
        duration: 10,
        questions: [
            { text: 'SI unit of force?', options: ['Joule','Newton','Watt','Pascal'], correct: 'B', topic: 'Physics', explanation: 'Newton.' },
            { text: 'Which vitamin is produced in sunlight?', options: ['A','B','C','D'], correct: 'D', topic: 'Biology', explanation: 'Vitamin D.' },
            { text: 'What is the chemical symbol for gold?', options: ['Go','Gd','Au','Ag'], correct: 'C', topic: 'Chemistry', explanation: 'Aurum – Au.' },
            { text: 'Which law is F = ma?', options: ['First','Second','Third','Gravitation'], correct: 'B', topic: 'Physics', explanation: 'Second Law.' },
            { text: 'Which cell organelle is the powerhouse?', options: ['Nucleus','Mitochondria','Ribosome','Golgi'], correct: 'B', topic: 'Biology', explanation: 'Mitochondria.' }
        ]
    };
    tests.push(daily);
    localStorage.setItem('cosmicTests', JSON.stringify(tests));
    startTest(daily.id, false);
};

window.startMindfulMode = function() {
    alert('Mindful breathing exercise would start here. For demo, test will begin.');
    // Could add a breathing animation overlay
    const mindful = {
        id: 'mindful-' + Date.now(),
        title: 'Mindful Practice: Biology Basics',
        subject: 'Biology',
        duration: 15,
        questions: [
            { text: 'Breathe in. Which organelle is the powerhouse?', options: ['Nucleus','Mitochondria','Ribosome','Golgi'], correct: 'B', topic: 'Cell', explanation: 'Mitochondria.' },
            { text: 'Exhale. Which vitamin is produced in sunlight?', options: ['A','B','C','D'], correct: 'D', topic: 'Biochemistry', explanation: 'Vitamin D.' },
            { text: 'Stay calm. Function of hemoglobin?', options: ['O₂ transport','CO₂ transport','Nutrient transport','Immunity'], correct: 'A', topic: 'Physiology', explanation: 'Oxygen transport.' }
        ]
    };
    tests.push(mindful);
    localStorage.setItem('cosmicTests', JSON.stringify(tests));
    startTest(mindful.id, false);
};

// ========== TEST MANAGEMENT ==========
function renderTestLibrary() {
    const container = document.getElementById('testLibrary');
    if (!container) return;
    if (tests.length === 0) {
        container.innerHTML = '<p class="text-muted">No tests yet. Create one!</p>';
        return;
    }
    let html = '';
    tests.forEach(t => {
        html += `
            <div class="test-item d-flex justify-content-between align-items-center">
                <div>
                    <strong>${t.title}</strong><br>
                    <small>${t.questions.length} Q · ${t.duration} min</small>
                </div>
                <div>
                    <button class="btn btn-sm btn-cosmic me-2" onclick="startTest('${t.id}', false)"><i class="fas fa-play"></i> Start</button>
                    <button class="btn btn-sm btn-outline-cosmic me-2" onclick="editTest('${t.id}')"><i class="fas fa-pen"></i></button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteTest('${t.id}')"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        `;
    });
    container.innerHTML = html;
}

window.startTest = function(id, randomize) {
    const test = tests.find(t => t.id === id);
    if (!test) return;
    // For simplicity, we'll just show an alert and not the full test UI (but we can expand)
    alert(`Starting test: ${test.title} with ${test.questions.length} questions. (Full test UI would open.)`);
    // In a real app, you'd switch to a test-taking view.
};

window.editTest = function(id) {
    const test = tests.find(t => t.id === id);
    if (!test) return;
    // Populate create modal (simplified)
    alert(`Edit test: ${test.title} – would open editor.`);
};

window.deleteTest = function(id) {
    if (confirm('Delete this test?')) {
        tests = tests.filter(t => t.id !== id);
        localStorage.setItem('cosmicTests', JSON.stringify(tests));
        renderTestLibrary();
        updateDashboardStats();
    }
};

window.showCreateTestModal = function() {
    // Simple prompt for demo
    const title = prompt('Enter test title:');
    if (!title) return;
    const newTest = {
        id: 'test-' + Date.now(),
        title: title,
        subject: 'General',
        duration: 30,
        questions: [] // empty for now
    };
    tests.push(newTest);
    localStorage.setItem('cosmicTests', JSON.stringify(tests));
    renderTestLibrary();
    alert('Test created. You can now add questions via import (mock).');
};

window.showImportModal = function() {
    const text = prompt('Paste questions in format: Question | A) opt1 | B) opt2 | C) opt3 | D) opt4 | CorrectLetter');
    if (!text) return;
    // Simple parse (mock)
    alert('Questions imported (mock). They would be added to the last created test.');
};

// ========== PYQ BANK ==========
function loadSamplePYQs() {
    pyqBank = [
        { id: 1, subject: 'Physics', year: 2024, exam: 'JEE Main', topic: 'Electrostatics', question: '...', options: [], correct: 'A' },
        { id: 2, subject: 'Chemistry', year: 2023, exam: 'NEET', topic: 'Organic', question: '...', options: [], correct: 'B' },
        { id: 3, subject: 'Biology', year: 2022, exam: 'AIIMS', topic: 'Human Physiology', question: '...', options: [], correct: 'C' }
    ];
    localStorage.setItem('cosmicPYQBank', JSON.stringify(pyqBank));
}

function renderPYQList() {
    const container = document.querySelector('.pyq-list');
    if (!container) return;
    let html = '';
    pyqBank.forEach(p => {
        html += `
            <div class="test-item d-flex justify-content-between align-items-center">
                <span>${p.exam} ${p.year}: ${p.topic}</span>
                <button class="btn btn-sm btn-cosmic-outline" onclick="practicePYQ(${p.id})">Practice</button>
            </div>
        `;
    });
    container.innerHTML = html;
}

window.practicePYQ = function(id) {
    alert(`Practicing PYQ #${id} – would open quiz.`);
};

// ========== AI MENTOR ==========
window.sendMessage = function() {
    const input = document.getElementById('chatInput');
    const msg = input.value.trim();
    if (!msg) return;
    const chat = document.getElementById('chatMessages');
    chat.innerHTML += `<div class="message user"><i class="fas fa-user-astronaut me-2"></i>${escapeHtml(msg)}</div>`;
    input.value = '';
    // Simulate AI response
    setTimeout(() => {
        const reply = getAIReply(msg);
        chat.innerHTML += `<div class="message bot"><i class="fas fa-robot me-2"></i>${reply}</div>`;
        chat.scrollTop = chat.scrollHeight;
    }, 1000);
};

function getAIReply(question) {
    const q = question.toLowerCase();
    if (q.includes('newton') || q.includes('force')) return "Newton's second law: F = ma. Force is a vector.";
    if (q.includes('mitochondria')) return "Mitochondria is the powerhouse of the cell, producing ATP.";
    if (q.includes('photosynthesis')) return "Photosynthesis: 6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂, occurs in chloroplasts.";
    if (q.includes('periodic')) return "Periodic table arranges elements by atomic number. 118 elements.";
    if (q.includes('mole')) return "Mole concept: 1 mole = 6.022×10²³ particles.";
    return "That's an excellent question! I recommend checking your study material or asking more specifically.";
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ========== DOUBTS ==========
function renderDoubtsList() {
    const container = document.querySelector('#doubts-section .test-item');
    // Not needed – we have a simple form.
}

window.submitDoubt = function() {
    const text = document.querySelector('#doubts-section textarea').value.trim();
    if (!text) return;
    doubts.push({ text, date: new Date().toISOString(), resolved: false });
    localStorage.setItem('cosmicDoubts', JSON.stringify(doubts));
    alert('Doubt submitted! Our experts will reply soon.');
    document.querySelector('#doubts-section textarea').value = '';
};

// ========== COMMUNITY FORUM ==========
function loadSampleForumPosts() {
    forumPosts = [
        { id: 1, title: 'Best book for Organic Chemistry?', replies: 12, author: 'CosmicPanda' },
        { id: 2, title: 'How to improve speed in Physics?', replies: 8, author: 'NebulaNinja' },
        { id: 3, title: 'Daily practice problem thread', replies: 24, author: 'QuasarQueen' }
    ];
    localStorage.setItem('cosmicForumPosts', JSON.stringify(forumPosts));
}

function renderForumPosts() {
    const container = document.querySelector('#community-section .test-item');
    if (!container) return;
    let html = '';
    forumPosts.forEach(p => {
        html += `<div class="test-item">🚀 ${p.title} – ${p.replies} replies</div>`;
    });
    container.innerHTML = html;
}

window.newForumPost = function() {
    const title = prompt('Enter post title:');
    if (title) {
        forumPosts.push({ id: Date.now(), title, replies: 0, author: userProfile.name });
        localStorage.setItem('cosmicForumPosts', JSON.stringify(forumPosts));
        renderForumPosts();
    }
};

// ========== PROFILE ==========
function renderProfile() {
    document.querySelector('#profile-section p:nth-child(1)').innerHTML = `<strong>Name:</strong> ${userProfile.name}`;
    document.querySelector('#profile-section p:nth-child(2)').innerHTML = `<strong>Target:</strong> ${userProfile.target}`;
    document.querySelector('#profile-section p:nth-child(3)').innerHTML = `<strong>Streak:</strong> ${userProfile.streak} days`;
    document.querySelector('#profile-section p:nth-child(4)').innerHTML = `<strong>Tests taken:</strong> ${userProfile.testsTaken}`;
}

window.editProfile = function() {
    const newName = prompt('Enter your name:', userProfile.name);
    if (newName) {
        userProfile.name = newName;
        localStorage.setItem('cosmicProfile', JSON.stringify(userProfile));
        renderProfile();
    }
};

// ========== UTILITY ==========
function updateUserAfterTest(score, total) {
    userProfile.testsTaken++;
    userProfile.totalScore += score;
    userProfile.totalQuestions += total;
    userProfile.lastActive = new Date().toDateString();
    // Update streak if active yesterday
    let last = new Date(userProfile.lastActive);
    let yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (last.toDateString() === yesterday.toDateString()) {
        userProfile.streak++;
    } else if (last.toDateString() !== new Date().toDateString()) {
        userProfile.streak = 1;
    }
    localStorage.setItem('cosmicProfile', JSON.stringify(userProfile));
    updateDashboardStats();
}

// Export functions to global scope for onclick handlers
window.showCreateTestModal = showCreateTestModal;
window.showImportModal = showImportModal;
window.startDailyChallenge = startDailyChallenge;
window.startMindfulMode = startMindfulMode;
window.sendMessage = sendMessage;
window.submitDoubt = submitDoubt;
window.newForumPost = newForumPost;
window.editProfile = editProfile;
// ========== COSMICPREP – COMPLETE FUNCTIONALITY ==========
// Data stores (persisted in localStorage)
let tests = JSON.parse(localStorage.getItem('cosmicTests')) || [];
let questionBank = JSON.parse(localStorage.getItem('cosmicQuestionBank')) || [];
let pyqBank = JSON.parse(localStorage.getItem('cosmicPYQBank')) || [];
let forumPosts = JSON.parse(localStorage.getItem('cosmicForumPosts')) || [];
let doubts = JSON.parse(localStorage.getItem('cosmicDoubts')) || [];
let userProfile = JSON.parse(localStorage.getItem('cosmicProfile')) || {
    name: 'Cosmic Warrior',
    target: 'JEE Advanced 2026',
    streak: 7,
    testsTaken: 0,
    totalScore: 0,
    totalQuestions: 0,
    lastActive: new Date().toDateString()
};

// ========== INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', function() {
    // Set up navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const sectionId = this.getAttribute('onclick').match(/'([^']+)'/)[1];
            showSection(sectionId);
        });
    });

    // Load sample data if empty
    if (pyqBank.length === 0) loadSamplePYQs();
    if (forumPosts.length === 0) loadSampleForumPosts();
    
    // Update dashboard stats
    updateDashboardStats();
    
    // Start daily countdown
    updateDailyCountdown();
    setInterval(updateDailyCountdown, 1000);
    
    // Load test library
    renderTestLibrary();
    
    // Load PYQ list
    renderPYQList();
    
    // Load forum posts
    renderForumPosts();
    
    // Load doubts list
    renderDoubtsList();
    
    // Display user profile
    renderProfile();
});

// ========== SECTION SWITCHING ==========
function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(s => s.style.display = 'none');
    document.getElementById(sectionId + '-section').style.display = 'block';
    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
    document.querySelector(`.nav-link[onclick*="'${sectionId}'"]`).classList.add('active');
}

// ========== DASHBOARD ==========
function updateDashboardStats() {
    document.getElementById('statsTestsCreated').innerText = tests.length;
    document.getElementById('statsTestsTaken').innerText = userProfile.testsTaken;
    let avg = userProfile.testsTaken ? Math.round(userProfile.totalScore / userProfile.testsTaken) : 0;
    document.getElementById('statsAvgScore').innerText = avg + '%';
    let acc = userProfile.totalQuestions ? Math.round((userProfile.totalScore / userProfile.totalQuestions) * 100) : 0;
    document.getElementById('statsAccuracy').innerText = acc + '%';
    document.getElementById('streakCount').innerText = userProfile.streak;
    
    // Recent activity (last 3 tests taken)
    const recentTests = tests.filter(t => t.lastTaken).sort((a,b) => new Date(b.lastTaken) - new Date(a.lastTaken)).slice(0,3);
    let recentHtml = '';
    if (recentTests.length) {
        recentTests.forEach(t => {
            recentHtml += `<div class="test-item">${t.title} · ${t.lastScore}/${t.questions.length} correct · ${new Date(t.lastTaken).toLocaleDateString()}</div>`;
        });
    } else {
        recentHtml = '<p class="text-muted">No tests taken yet.</p>';
    }
    document.getElementById('recentTestsList').innerHTML = recentHtml;
}

function updateDailyCountdown() {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24,0,0,0);
    const diff = midnight - now;
    if (diff <= 0) {
        document.getElementById('dailyCountdown').innerText = '00:00:00';
        return;
    }
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    document.getElementById('dailyCountdown').innerText = `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
}

window.startDailyChallenge = function() {
    const daily = {
        id: 'daily-' + Date.now(),
        title: 'Daily Challenge: Mixed Topics',
        subject: 'Mixed',
        duration: 10,
        questions: [
            { text: 'SI unit of force?', options: ['Joule','Newton','Watt','Pascal'], correct: 'B', topic: 'Physics', explanation: 'Newton.' },
            { text: 'Which vitamin is produced in sunlight?', options: ['A','B','C','D'], correct: 'D', topic: 'Biology', explanation: 'Vitamin D.' },
            { text: 'What is the chemical symbol for gold?', options: ['Go','Gd','Au','Ag'], correct: 'C', topic: 'Chemistry', explanation: 'Aurum – Au.' },
            { text: 'Which law is F = ma?', options: ['First','Second','Third','Gravitation'], correct: 'B', topic: 'Physics', explanation: 'Second Law.' },
            { text: 'Which cell organelle is the powerhouse?', options: ['Nucleus','Mitochondria','Ribosome','Golgi'], correct: 'B', topic: 'Biology', explanation: 'Mitochondria.' }
        ]
    };
    tests.push(daily);
    localStorage.setItem('cosmicTests', JSON.stringify(tests));
    startTest(daily.id, false);
};

window.startMindfulMode = function() {
    const mindful = {
        id: 'mindful-' + Date.now(),
        title: 'Mindful Practice: Biology Basics',
        subject: 'Biology',
        duration: 15,
        questions: [
            { text: 'Breathe in. Which organelle is the powerhouse?', options: ['Nucleus','Mitochondria','Ribosome','Golgi'], correct: 'B', topic: 'Cell', explanation: 'Mitochondria.' },
            { text: 'Exhale. Which vitamin is produced in sunlight?', options: ['A','B','C','D'], correct: 'D', topic: 'Biochemistry', explanation: 'Vitamin D.' },
            { text: 'Stay calm. Function of hemoglobin?', options: ['O₂ transport','CO₂ transport','Nutrient transport','Immunity'], correct: 'A', topic: 'Physiology', explanation: 'Oxygen transport.' }
        ]
    };
    tests.push(mindful);
    localStorage.setItem('cosmicTests', JSON.stringify(tests));
    startTest(mindful.id, false);
};

// ========== TEST MANAGEMENT ==========
function renderTestLibrary() {
    const container = document.getElementById('testLibrary');
    if (!container) return;
    if (tests.length === 0) {
        container.innerHTML = '<p class="text-muted">No tests yet. Create one!</p>';
        return;
    }
    let html = '';
    tests.forEach(t => {
        html += `
            <div class="test-item d-flex justify-content-between align-items-center">
                <div>
                    <strong>${t.title}</strong><br>
                    <small>${t.questions.length} Q · ${t.duration} min</small>
                </div>
                <div>
                    <button class="btn btn-sm btn-cosmic me-2" onclick="startTest('${t.id}', false)"><i class="fas fa-play"></i> Start</button>
                    <button class="btn btn-sm btn-outline-cosmic me-2" onclick="editTest('${t.id}')"><i class="fas fa-pen"></i></button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteTest('${t.id}')"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        `;
    });
    container.innerHTML = html;
}

window.startTest = function(id, randomize) {
    const test = tests.find(t => t.id === id);
    if (!test) return;
    // Store current test in session for the test-taking view
    sessionStorage.setItem('currentTest', JSON.stringify(test));
    // Redirect to test-taking page (we'd need a separate HTML or overlay)
    alert(`Starting test: ${test.title} with ${test.questions.length} questions. (Full test UI would open.)`);
};

window.editTest = function(id) {
    const test = tests.find(t => t.id === id);
    if (!test) return;
    // Populate create modal (simplified)
    alert(`Edit test: ${test.title} – would open editor.`);
};

window.deleteTest = function(id) {
    if (confirm('Delete this test?')) {
        tests = tests.filter(t => t.id !== id);
        localStorage.setItem('cosmicTests', JSON.stringify(tests));
        renderTestLibrary();
        updateDashboardStats();
    }
};

window.showCreateTestModal = function() {
    const title = prompt('Enter test title:');
    if (!title) return;
    const newTest = {
        id: 'test-' + Date.now(),
        title: title,
        subject: 'General',
        duration: 30,
        questions: []
    };
    tests.push(newTest);
    localStorage.setItem('cosmicTests', JSON.stringify(tests));
    renderTestLibrary();
    alert('Test created. You can now add questions via import (mock).');
};

window.showImportModal = function() {
    const text = prompt('Paste questions in format: Question | A) opt1 | B) opt2 | C) opt3 | D) opt4 | CorrectLetter');
    if (!text) return;
    alert('Questions imported (mock). They would be added to the last created test.');
};

// ========== PYQ BANK ==========
function loadSamplePYQs() {
    pyqBank = [
        { id: 1, subject: 'Physics', year: 2024, exam: 'JEE Main', topic: 'Electrostatics', question: '...', options: [], correct: 'A' },
        { id: 2, subject: 'Chemistry', year: 2023, exam: 'NEET', topic: 'Organic', question: '...', options: [], correct: 'B' },
        { id: 3, subject: 'Biology', year: 2022, exam: 'AIIMS', topic: 'Human Physiology', question: '...', options: [], correct: 'C' }
    ];
    localStorage.setItem('cosmicPYQBank', JSON.stringify(pyqBank));
}

function renderPYQList() {
    const container = document.querySelector('.pyq-list');
    if (!container) return;
    let html = '';
    pyqBank.forEach(p => {
        html += `
            <div class="test-item d-flex justify-content-between align-items-center">
                <span>${p.exam} ${p.year}: ${p.topic}</span>
                <button class="btn btn-sm btn-cosmic-outline" onclick="practicePYQ(${p.id})">Practice</button>
            </div>
        `;
    });
    container.innerHTML = html;
}

window.practicePYQ = function(id) {
    alert(`Practicing PYQ #${id} – would open quiz.`);
};

// ========== AI MENTOR (SMART) ==========
const knowledgeBase = {
    newton: "**Newton's Laws of Motion:**\n\n• **First Law (Law of Inertia):** An object at rest stays at rest, and an object in motion stays in motion with the same speed and in the same direction unless acted upon by an unbalanced force.\n• **Second Law:** F = ma (Force = mass × acceleration). This is the fundamental equation of classical mechanics.\n• **Third Law:** For every action, there is an equal and opposite reaction.\n\n**Example:** When you push a wall, the wall pushes back with equal force.",
    force: "**Force** is any interaction that, when unopposed, will change the motion of an object. It is a vector quantity (has both magnitude and direction). SI unit: Newton (N).\n\n**Formula:** F = ma (from Newton's second law).\n\n**Types of forces:** Gravitational, electromagnetic, nuclear, frictional, tension, normal, etc.",
    acceleration: "**Acceleration** is the rate of change of velocity per unit time. It is a vector quantity. SI unit: m/s².\n\n**Formula:** a = (v - u)/t, where v = final velocity, u = initial velocity, t = time.\n\n**In gravitation:** Near Earth's surface, acceleration due to gravity g = 9.8 m/s².",
    gravity: "**Gravity** is the force of attraction between any two masses. Newton's law of universal gravitation: F = G·m₁·m₂/r², where G = 6.67×10⁻¹¹ N·m²/kg².\n\n**Acceleration due to gravity** g = GM/R² ≈ 9.8 m/s² on Earth.\n\n**Variation:** g decreases with height and depth; maximum at poles, minimum at equator.",
    electrostatics: "**Electrostatics** deals with electric charges at rest.\n\n• **Coulomb's Law:** F = k·q₁·q₂/r², where k = 9×10⁹ N·m²/C².\n• **Electric field** E = F/q = kQ/r².\n• **Potential** V = kQ/r.\n• **Capacitance** C = Q/V. For parallel plate capacitor: C = ε₀A/d.\n\n**Key point:** Like charges repel, unlike attract.",
    thermodynamics: "**Thermodynamics** studies heat, work, and energy.\n\n• **Zeroth Law:** Thermal equilibrium.\n• **First Law:** ΔU = Q - W (change in internal energy = heat added - work done).\n• **Second Law:** Entropy of an isolated system always increases.\n• **Third Law:** Entropy approaches zero as temperature approaches absolute zero.\n\n**Important processes:** Isothermal, adiabatic, isobaric, isochoric.",
    mole: "**Mole Concept**\n\n• 1 mole = 6.022 × 10²³ particles (Avogadro's number).\n• Molar mass = mass of 1 mole in grams.\n• **Formulas:**\n  - Number of moles = given mass / molar mass\n  - Number of moles = (number of particles) / N_A\n  - For gases: PV = nRT (ideal gas equation)\n\n**Example:** 18g of water = 1 mole = 6.022×10²³ molecules.",
    periodic: "**Periodic Table**\n\n• Arranged by increasing atomic number.\n• **Groups (columns):** 1-18, elements with similar valence electron configuration.\n• **Periods (rows):** 7 periods, elements in same period have same number of shells.\n• **Trends:**\n  - Atomic radius decreases left to right, increases top to bottom.\n  - Ionization energy increases left to right, decreases top to bottom.\n  - Electronegativity (highest: Fluorine).",
    organic: "**Organic Chemistry** – Study of carbon compounds.\n\n• **Functional groups:** -OH (alcohol), -COOH (carboxylic acid), -CHO (aldehyde), -CO- (ketone), -NH₂ (amine).\n• **Reactions:** Substitution, addition, elimination, rearrangement.\n• **Important:** Hydrocarbons (alkanes, alkenes, alkynes), aromatic compounds (benzene).\n\n**IUPAC naming:** Find longest chain, number carbons, identify substituents.",
    mitochondria: "**Mitochondria** – The powerhouse of the cell.\n\n• **Structure:** Double membrane, inner membrane folded into cristae, matrix inside.\n• **Function:** Site of aerobic respiration; produces ATP (energy currency) via Krebs cycle and oxidative phosphorylation.\n• **DNA:** Has its own circular DNA and ribosomes (semi-autonomous).\n• **Found in:** Eukaryotic cells (plants, animals, fungi).",
    photosynthesis: "**Photosynthesis** – Process by which plants convert light energy into chemical energy.\n\n• **Equation:** 6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂ (in presence of sunlight and chlorophyll).\n• **Stages:**\n  1. Light reactions (in thylakoids): Produce ATP and NADPH.\n  2. Calvin cycle (in stroma): Fix CO₂ into glucose.\n• **Factors affecting:** Light intensity, CO₂ concentration, temperature, water.",
    meiosis: "**Meiosis** – Cell division that produces gametes (sperm and egg) with half the chromosome number.\n\n• **Purpose:** Genetic diversity through crossing over and independent assortment.\n• **Stages:** Meiosis I (reductional) and Meiosis II (equational).\n  - Prophase I: Crossing over occurs.\n  - Metaphase I: Homologous pairs align.\n  - Anaphase I: Homologous separate.\n  - Telophase I: Two haploid cells form.\n• **Result:** 4 genetically unique haploid cells.\n\n**Significance:** Essential for sexual reproduction and evolution.",
    default: "That's a great question! I'm here to help. Could you please provide more details or rephrase? I can explain concepts in Physics, Chemistry, and Biology for NEET/JEE preparation."
};

window.sendMessage = function() {
    const input = document.getElementById('chatInput');
    const msg = input.value.trim();
    if (!msg) return;
    const chat = document.getElementById('chatMessages');
    chat.innerHTML += `<div class="message user"><i class="fas fa-user-astronaut me-2"></i>${escapeHtml(msg)}</div>`;
    input.value = '';
    
    // Show typing indicator
    const typingId = 'typing-' + Date.now();
    chat.innerHTML += `<div class="message bot" id="${typingId}"><i class="fas fa-robot me-2"></i>Typing<span class="typing-dots">...</span></div>`;
    chat.scrollTop = chat.scrollHeight;
    
    setTimeout(() => {
        document.getElementById(typingId)?.remove();
        const reply = getAIReply(msg);
        chat.innerHTML += `<div class="message bot"><i class="fas fa-robot me-2"></i>${reply.replace(/\n/g, '<br>')}</div>`;
        chat.scrollTop = chat.scrollHeight;
    }, 1500);
};

function getAIReply(question) {
    const q = question.toLowerCase().trim();
    if (q.includes('newton') || q.includes('force')) return knowledgeBase.newton;
    if (q.includes('acceleration')) return knowledgeBase.acceleration;
    if (q.includes('gravity') || q.includes('gravitation')) return knowledgeBase.gravity;
    if (q.includes('electrostatics') || q.includes('coulomb')) return knowledgeBase.electrostatics;
    if (q.includes('thermodynamics') || q.includes('heat') || q.includes('entropy')) return knowledgeBase.thermodynamics;
    if (q.includes('mole') || q.includes('avogadro')) return knowledgeBase.mole;
    if (q.includes('periodic') || q.includes('table')) return knowledgeBase.periodic;
    if (q.includes('organic') || q.includes('functional group')) return knowledgeBase.organic;
    if (q.includes('mitochondria') || q.includes('powerhouse')) return knowledgeBase.mitochondria;
    if (q.includes('photosynthesis')) return knowledgeBase.photosynthesis;
    if (q.includes('meiosis')) return knowledgeBase.meiosis;
    return knowledgeBase.default;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ========== DOUBTS ==========
function renderDoubtsList() {
    const container = document.getElementById('doubtsList');
    if (!container) return;
    if (doubts.length === 0) {
        container.innerHTML = '<p class="text-muted">No doubts submitted yet.</p>';
        return;
    }
    let html = '';
    doubts.slice().reverse().forEach(d => {
        html += `<div class="test-item">❓ ${d.text} <small class="text-secondary">${new Date(d.date).toLocaleDateString()}</small></div>`;
        if (d.answer) {
            html += `<div class="test-item ms-4">✅ Expert: ${d.answer}</div>`;
        }
    });
    container.innerHTML = html;
}

window.submitDoubt = function() {
    const text = document.getElementById('doubtInput').value.trim();
    if (!text) return;
    doubts.push({
        text,
        date: new Date().toISOString(),
        answered: false,
        answer: null
    });
    localStorage.setItem('cosmicDoubts', JSON.stringify(doubts));
    document.getElementById('doubtInput').value = '';
    renderDoubtsList();
    alert('Doubt submitted! Our experts will answer soon.');
};

// ========== COMMUNITY FORUM ==========
function loadSampleForumPosts() {
    forumPosts = [
        { id: 1, title: 'Best book for Organic Chemistry?', replies: 12, author: 'CosmicPanda', date: '2025-03-15' },
        { id: 2, title: 'How to improve speed in Physics?', replies: 8, author: 'NebulaNinja', date: '2025-03-14' },
        { id: 3, title: 'Daily practice problem thread', replies: 24, author: 'QuasarQueen', date: '2025-03-13' }
    ];
    localStorage.setItem('cosmicForumPosts', JSON.stringify(forumPosts));
}

function renderForumPosts() {
    const container = document.getElementById('forumPostsList');
    if (!container) return;
    let html = '';
    forumPosts.forEach(p => {
        html += `<div class="test-item d-flex justify-content-between">
                    <div><strong>${p.title}</strong><br><small>by ${p.author} · ${p.replies} replies</small></div>
                    <button class="btn btn-sm btn-cosmic-outline" onclick="viewPost(${p.id})">View</button>
                </div>`;
    });
    container.innerHTML = html;
}

window.newForumPost = function() {
    const title = prompt('Enter post title:');
    if (!title) return;
    forumPosts.push({
        id: Date.now(),
        title,
        replies: 0,
        author: userProfile.name,
        date: new Date().toISOString().split('T')[0]
    });
    localStorage.setItem('cosmicForumPosts', JSON.stringify(forumPosts));
    renderForumPosts();
};

window.viewPost = function(id) {
    alert(`Viewing post #${id} – full thread would open.`);
};

// ========== PROFILE ==========
function renderProfile() {
    document.getElementById('profileName').innerText = userProfile.name
