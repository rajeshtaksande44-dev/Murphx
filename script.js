// ========== MURPHX – RAINY GLASS STUDY (FULL SCRIPT) ==========
// All data is stored in localStorage for persistence across sessions.

// ---------- GLOBAL DATA STORES ----------
let tests = JSON.parse(localStorage.getItem('murphx_tests')) || [];
let forumPosts = JSON.parse(localStorage.getItem('murphx_forum')) || [];
let doubts = JSON.parse(localStorage.getItem('murphx_doubts')) || [];
let userProfile = JSON.parse(localStorage.getItem('murphx_profile')) || {
    name: 'Cosmic',
    target: 'JEE Advanced 2026',
    streak: 7,
    testsTaken: 0,
    totalScore: 0,
    totalQuestions: 0,
    lastActive: new Date().toDateString()
};

// ---------- UTILITY FUNCTIONS ----------
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Update streak based on last active date (simple version)
function updateStreak() {
    const today = new Date().toDateString();
    if (userProfile.lastActive !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        if (userProfile.lastActive === yesterday.toDateString()) {
            userProfile.streak++;
        } else {
            userProfile.streak = 1; // reset
        }
        userProfile.lastActive = today;
        saveProfile();
    }
}

function saveProfile() {
    localStorage.setItem('murphx_profile', JSON.stringify(userProfile));
}

// ---------- SECTION SWITCHING ----------
window.showSection = function(sectionId) {
    document.querySelectorAll('.section').forEach(s => s.style.display = 'none');
    const section = document.getElementById(sectionId + '-section');
    if (section) section.style.display = 'block';
    
    // Update active nav link
    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
    const activeLink = document.querySelector(`.nav-link[onclick*="'${sectionId}'"]`);
    if (activeLink) activeLink.classList.add('active');

    // Refresh data when section becomes visible
    if (sectionId === 'dashboard') updateDashboard();
    if (sectionId === 'tests') renderTests();
    if (sectionId === 'doubts') renderDoubts();
    if (sectionId === 'community') renderForum();
    if (sectionId === 'profile') renderProfile();
};

// ---------- DASHBOARD ----------
function updateDashboard() {
    document.getElementById('statsCreated').innerText = tests.length;
    document.getElementById('statsTaken').innerText = userProfile.testsTaken;
    const avg = userProfile.testsTaken ? Math.round(userProfile.totalScore / userProfile.testsTaken) : 0;
    document.getElementById('statsAvgScore').innerText = avg + '%';
    const acc = userProfile.totalQuestions ? Math.round((userProfile.totalScore / userProfile.totalQuestions) * 100) : 0;
    document.getElementById('statsAccuracy').innerText = acc + '%';
    document.getElementById('streakCount').innerText = userProfile.streak;
    document.getElementById('userNameDisplay').innerText = userProfile.name;

    // Recent activity (last 3 tests)
    const recentTests = tests.slice(-3).reverse();
    let recentHtml = '';
    if (recentTests.length) {
        recentTests.forEach(t => {
            recentHtml += `<div class="activity-item"><span>${escapeHtml(t.title)}</span><span>${t.questions?.length || 0} Q · ${t.date || 'recent'}</span></div>`;
        });
    } else {
        recentHtml = '<div class="activity-item">No tests yet</div>';
    }
    document.getElementById('recentActivityList').innerHTML = recentHtml;

    // Leaderboard (mock – could be extended)
    const leaderboard = [
        { name: 'MurphxPanda', points: 1245 },
        { name: 'NebulaNinja', points: 1180 },
        { name: 'QuasarQueen', points: 1090 },
        { name: 'you', points: 980 }
    ];
    let leaderHtml = '';
    leaderboard.forEach((item, idx) => {
        const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx+1}️⃣`;
        leaderHtml += `<div class="activity-item"><span>${medal} ${item.name}</span><span>${item.points} pts</span></div>`;
    });
    document.getElementById('leaderboardList').innerHTML = leaderHtml;
}

// ---------- DAILY CHALLENGE ----------
window.startDailyChallenge = function() {
    const daily = {
        id: 'daily-' + Date.now(),
        title: 'Daily Challenge: Physics Mix',
        subject: 'Physics',
        duration: 10,
        questions: [
            { text: 'SI unit of force?', options: ['Joule','Newton','Watt','Pascal'], correct: 'B', explanation: 'Newton' },
            { text: 'Acceleration due to gravity near Earth?', options: ['9.8','10','8.9','9.1'], correct: 'A', explanation: '9.8 m/s²' }
        ],
        date: new Date().toLocaleDateString()
    };
    tests.push(daily);
    localStorage.setItem('murphx_tests', JSON.stringify(tests));
    alert('✅ Daily challenge added to your tests!');
    if (document.getElementById('tests-section').style.display === 'block') renderTests();
    updateDashboard();
};

// ---------- MINDFUL MODE ----------
window.startMindfulMode = function() {
    alert('🧘 Take 3 deep breaths. A mindful test will be added.');
    const mindful = {
        id: 'mindful-' + Date.now(),
        title: 'Mindful Practice: Biology',
        subject: 'Biology',
        duration: 5,
        questions: [
            { text: 'Powerhouse of the cell?', options: ['Nucleus','Mitochondria','Ribosome','Golgi'], correct: 'B', explanation: 'Mitochondria' }
        ],
        date: new Date().toLocaleDateString()
    };
    tests.push(mindful);
    localStorage.setItem('murphx_tests', JSON.stringify(tests));
    updateDashboard();
};

// ---------- BREATH TECHNIQUES (timer simulation) ----------
window.startBreath = function(technique) {
    let message = '';
    switch(technique) {
        case 'nostril': message = 'Nostril Awareness: Focus on the coolness of inhale and warmth of exhale. 2 minutes.'; break;
        case 'count': message = 'Counting Breaths: Inhale 1, exhale 2 … up to 10. Repeat for 3 minutes.'; break;
        case 'pause': message = 'Pause Between Breaths: After each exhale, observe the stillness. 2 minutes.'; break;
        default: message = 'Start your breath practice.';
    }
    alert(message + '\n\n(Timer would start in a full implementation.)');
};

// ---------- TESTS MANAGEMENT ----------
function renderTests() {
    const container = document.getElementById('testsList');
    if (!container) return;
    if (tests.length === 0) {
        container.innerHTML = '<p>No tests yet. Create one!</p>';
        return;
    }
    let html = '';
    tests.forEach(t => {
        html += `
            <div class="activity-item">
                <span><strong>${escapeHtml(t.title)}</strong> (${t.questions?.length || 0} Q) · ${t.date || ''}</span>
                <div>
                    <button class="btn btn-sm btn-primary" onclick="alert('Start test: ${escapeHtml(t.title)}')">Start</button>
                    <button class="btn btn-sm" onclick="deleteTest('${t.id}')"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        `;
    });
    container.innerHTML = html;
}

window.deleteTest = function(id) {
    if (confirm('Delete this test?')) {
        tests = tests.filter(t => t.id !== id);
        localStorage.setItem('murphx_tests', JSON.stringify(tests));
        renderTests();
        updateDashboard();
    }
};

// ---------- CREATE TEST MODAL ----------
window.showCreateModal = function() {
    document.getElementById('createModal').style.display = 'flex';
};
window.closeModal = function() {
    document.getElementById('createModal').style.display = 'none';
    document.getElementById('newTestTitle').value = '';
    document.getElementById('newTestDuration').value = '30';
};
window.createTest = function() {
    const title = document.getElementById('newTestTitle').value.trim();
    const duration = parseInt(document.getElementById('newTestDuration').value) || 30;
    if (!title) {
        alert('Please enter a test title.');
        return;
    }
    tests.push({
        id: 'test-' + Date.now(),
        title: title,
        duration: duration,
        questions: [],
        date: new Date().toLocaleDateString()
    });
    localStorage.setItem('murphx_tests', JSON.stringify(tests));
    closeModal();
    renderTests();
    updateDashboard();
};

// ---------- AI MENTOR CHAT ----------
window.sendMessage = function() {
    const input = document.getElementById('chatInput');
    const msg = input.value.trim();
    if (!msg) return;
    const chat = document.getElementById('chatMessages');
    chat.innerHTML += `<div class="message user"><i class="fas fa-user-astronaut me-2"></i>${escapeHtml(msg)}</div>`;
    input.value = '';
    chat.scrollTop = chat.scrollHeight;

    // Simulate AI thinking
    setTimeout(() => {
        const reply = getAIReply(msg);
        chat.innerHTML += `<div class="message bot"><i class="fas fa-robot me-2"></i>${reply}</div>`;
        chat.scrollTop = chat.scrollHeight;
    }, 1000);
};

function getAIReply(question) {
    const q = question.toLowerCase();
    if (q.includes('newton')) return "**Newton's Laws:**\n- First: Inertia\n- Second: F = ma\n- Third: Action‑reaction";
    if (q.includes('mitochondria')) return "**Mitochondria** is the powerhouse of the cell. It produces ATP through cellular respiration.";
    if (q.includes('photosynthesis')) return "**Photosynthesis:** 6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂. Occurs in chloroplasts.";
    if (q.includes('mole')) return "**Mole Concept:** 1 mole = 6.022×10²³ particles. Molar mass = mass of 1 mole.";
    if (q.includes('periodic')) return "**Periodic Table:** Elements arranged by atomic number. Groups have similar properties.";
    return "I'm your cosmic AI. That's a great question! Could you be more specific?";
}

// ---------- DOUBTS ----------
window.submitDoubt = function() {
    const text = document.getElementById('doubtInput').value.trim();
    if (!text) return;
    doubts.push({
        text: text,
        date: new Date().toLocaleDateString(),
        answered: false
    });
    localStorage.setItem('murphx_doubts', JSON.stringify(doubts));
    document.getElementById('doubtInput').value = '';
    renderDoubts();
};

function renderDoubts() {
    const container = document.getElementById('doubtsList');
    if (!container) return;
    if (doubts.length === 0) {
        container.innerHTML = '<p>No doubts yet.</p>';
        return;
    }
    let html = '';
    doubts.slice().reverse().forEach(d => {
        html += `<div class="activity-item">❓ ${escapeHtml(d.text)} <small>${d.date}</small></div>`;
    });
    container.innerHTML = html;
}

// ---------- COMMUNITY FORUM ----------
window.newForumPost = function() {
    const title = prompt('Enter post title:');
    if (!title) return;
    forumPosts.push({
        title: title,
        author: userProfile.name,
        date: new Date().toLocaleDateString(),
        replies: 0
    });
    localStorage.setItem('murphx_forum', JSON.stringify(forumPosts));
    renderForum();
};

function renderForum() {
    const container = document.getElementById('forumPostsList');
    if (!container) return;
    if (forumPosts.length === 0) {
        container.innerHTML = '<p>No posts yet. Be the first to post!</p>';
        return;
    }
    let html = '';
    forumPosts.slice().reverse().forEach(p => {
        html += `<div class="activity-item">📢 <strong>${escapeHtml(p.title)}</strong> <small>by ${escapeHtml(p.author)} on ${p.date}</small></div>`;
    });
    container.innerHTML = html;
}

// ---------- PROFILE ----------
function renderProfile() {
    document.getElementById('profileName').innerText = userProfile.name;
    document.getElementById('profileTarget').innerText = userProfile.target;
    document.getElementById('profileStreak').innerText = userProfile.streak;
    document.getElementById('profileTestsTaken').innerText = userProfile.testsTaken;
}

window.editProfile = function() {
    const newName = prompt('Enter your name:', userProfile.name);
    if (newName) {
        userProfile.name = newName.trim() || userProfile.name;
        saveProfile();
        renderProfile();
        document.getElementById('userNameDisplay').innerText = userProfile.name;
    }
};

// ---------- DAILY COUNTDOWN (in dashboard) ----------
function updateDailyCountdown() {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
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
setInterval(updateDailyCountdown, 1000);

// ---------- INITIAL SETUP ----------
document.addEventListener('DOMContentLoaded', function() {
    updateStreak();
    updateDashboard();
    renderTests();
    renderDoubts();
    renderForum();
    renderProfile();
});

// Make all functions globally available (for onclick attributes)
window.deleteTest = deleteTest;
window.sendMessage = sendMessage;
window.submitDoubt = submitDoubt;
window.newForumPost = newForumPost;
window.editProfile = editProfile;
window.showCreateModal = showCreateModal;
window.closeModal = closeModal;
window.createTest = createTest;
window.startDailyChallenge = startDailyChallenge;
window.startMindfulMode = startMindfulMode;
window.startBreath = startBreath;
