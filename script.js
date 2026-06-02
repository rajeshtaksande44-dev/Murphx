// global.js - Shared functions for all pages (XP, toast, confetti)

// Get or set total XP
function getTotalXP() {
  return parseInt(localStorage.getItem('murphx_totalXP')) || 0;
}

function setTotalXP(value) {
  localStorage.setItem('murphx_totalXP', Math.max(0, value));
  updateAllXPDisplays();
  return value;
}

function addXP(amount) {
  let current = getTotalXP();
  let newXP = current + amount;
  if (newXP < 0) newXP = 0;
  setTotalXP(newXP);
  if (amount > 0) {
    showToast(`+${amount} XP`);
    // Level up celebration if crossed a multiple of 400
    let oldLevel = Math.floor(current / 400);
    let newLevel = Math.floor(newXP / 400);
    if (newLevel > oldLevel) {
      triggerConfetti();
      showToast(`🎉 LEVEL UP! You reached Level ${newLevel+1} 🎉`);
    }
  }
  return newXP;
}

function updateAllXPDisplays() {
  let xp = getTotalXP();
  document.querySelectorAll('#headerXP, #headerXPValue, .xp-pill span').forEach(el => {
    if (el.id === 'headerXP' || el.id === 'headerXPValue' || el.parentElement?.classList?.contains('xp-pill')) {
      el.innerText = xp;
    }
  });
  // Also update totalXPnum if present on page
  let totalElem = document.getElementById('totalXPnum');
  if (totalElem) totalElem.innerText = xp;
}

function showToast(message, duration = 2000) {
  let toast = document.createElement('div');
  toast.innerText = message;
  toast.style.position = 'fixed';
  toast.style.bottom = '20px';
  toast.style.right = '20px';
  toast.style.backgroundColor = '#f97316';
  toast.style.color = '#030712';
  toast.style.padding = '0.6rem 1.2rem';
  toast.style.borderRadius = '40px';
  toast.style.fontWeight = 'bold';
  toast.style.zIndex = '9999';
  toast.style.backdropFilter = 'blur(8px)';
  toast.style.boxShadow = '0 0 12px rgba(249,115,22,0.5)';
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), duration);
}

function triggerConfetti() {
  if (typeof canvasConfetti === 'function') {
    canvasConfetti({ particleCount: 200, spread: 70, origin: { y: 0.6 } });
  } else {
    console.log('confetti not loaded');
  }
}

// Sync XP when localStorage changes in another tab
window.addEventListener('storage', (e) => {
  if (e.key === 'murphx_totalXP') {
    updateAllXPDisplays();
  }
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  updateAllXPDisplays();
});
