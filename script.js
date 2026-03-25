// ====================== THREE.JS 3D BACKGROUND ======================
(function init3DBackground() {
  const container = document.getElementById('three-canvas');
  if (!container) return;
  const scene = new THREE.Scene();
  scene.background = null;
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 20;
  const renderer = new THREE.WebGLRenderer({ alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);
  container.appendChild(renderer.domElement);

  const particlesGeometry = new THREE.BufferGeometry();
  const particlesCount = 1200;
  const posArray = new Float32Array(particlesCount * 3);
  for (let i = 0; i < particlesCount; i++) {
    posArray[i*3] = (Math.random() - 0.5) * 80;
    posArray[i*3+1] = (Math.random() - 0.5) * 50;
    posArray[i*3+2] = (Math.random() - 0.5) * 40 - 20;
  }
  particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
  const particlesMaterial = new THREE.PointsMaterial({ color: 0x77f1ec, size: 0.12, transparent: true, opacity: 0.5 });
  const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
  scene.add(particlesMesh);

  const ringGeo = new THREE.TorusGeometry(3.5, 0.08, 64, 200);
  const ringMat = new THREE.MeshStandardMaterial({ color: 0x77f1ec, emissive: 0x1F4D3A, emissiveIntensity: 0.4 });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  scene.add(ring);

  const ambientLight = new THREE.AmbientLight(0x404060);
  scene.add(ambientLight);
  const pointLight = new THREE.PointLight(0x77f1ec, 0.6);
  pointLight.position.set(5, 5, 8);
  scene.add(pointLight);

  function animate3D() {
    requestAnimationFrame(animate3D);
    particlesMesh.rotation.y += 0.0008;
    particlesMesh.rotation.x += 0.0004;
    ring.rotation.x += 0.008;
    ring.rotation.z += 0.005;
    renderer.render(scene, camera);
  }
  animate3D();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
})();

// ====================== CHART.JS INITIALIZATION ======================
const chartCtx = document.getElementById('warriorChart')?.getContext('2d');
if (chartCtx) {
  new Chart(chartCtx, {
    type: 'line',
    data: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [{
        label: 'Flow Intensity',
        data: [78, 82, 88, 85, 92, 95, 98],
        borderColor: '#77F1EC',
        backgroundColor: 'rgba(119,241,236,0.1)',
        tension: 0.4,
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { labels: { color: '#BDD4C0' } }
      },
      scales: {
        y: { grid: { color: '#2F4F3A' }, ticks: { color: '#BDD4C0' } },
        x: { ticks: { color: '#BDD4C0' } }
      }
    }
  });
}

// ====================== TAO CHAPTERS ======================
const chapters = [
  { name: "On Zen", desc: "Empty mind, no effort", icon: "fa-om", type: "Philosophy", combat: "Intercept thought, not motion." },
  { name: "Art of the Soul", desc: "Self-actualization", icon: "fa-heart", type: "Self", combat: "Know thyself before battle." },
  { name: "Jeet Kune Do", desc: "Way of intercepting fist", icon: "fa-fist-raised", type: "Core", combat: "Stop-hit & economy of motion." },
  { name: "The Formless Form", desc: "No technique as technique", icon: "fa-dharmachakra", type: "Zen", combat: "Adapt fluidly, no fixed pattern." },
  { name: "Preliminaries", desc: "Stance, balance", icon: "fa-shoe-prints", type: "Training", combat: "Rooted mobility." },
  { name: "Qualities", desc: "Speed, timing, power", icon: "fa-bolt", type: "Attribute", combat: "Develop attributes before techniques." }
];
const chaptersContainer = document.getElementById("chaptersGrid");
if (chaptersContainer) {
  chapters.forEach(ch => {
    const tile = document.createElement("div");
    tile.className = "tech-tile";
    tile.innerHTML = `<i class="fas ${ch.icon}"></i> <strong>${ch.name}</strong><br><span style="font-size:0.7rem">${ch.type}</span><br><span>${ch.desc}</span>`;
    tile.onclick = () => {
      document.getElementById("modalTitle").innerText = `📖 ${ch.name}`;
      document.getElementById("modalMsg").innerHTML = `<strong>Bruce Lens:</strong> ${ch.combat}<br><br>🧘 Zen: ${ch.desc}.`;
      document.getElementById("globalModal").classList.add("active");
    };
    chaptersContainer.appendChild(tile);
  });
}

// ====================== DOJO SKILLS ======================
const dojoSkills = [
  "Warm-Up: Chi Sao Flow", "On-Guard Structure", "Footwork Pendulum", "Timing Interception",
  "Precision Striking", "Power Generation (1-inch)", "Side Kick Mechanics", "Straight Lead",
  "Feints & Parries", "Distance Management", "Stop-Hit Drill", "Angular Entries",
  "Broken Rhythm", "Low Kicks", "Trapping Hands", "Attack by Combination"
];
const dojoGrid = document.getElementById("dojoSkillsGrid");
if (dojoGrid) {
  dojoSkills.forEach(skill => {
    const div = document.createElement("div");
    div.className = "tech-tile";
    div.innerHTML = `<i class="fas fa-dot-circle"></i> ${skill}`;
    div.onclick = () => alert(`🔥 Dojo: ${skill} drill — "Absorb what is useful."`);
    dojoGrid.appendChild(div);
  });
}

// ====================== 5 WAYS OF ATTACK ======================
const ways = [
  { name: "SAA (Simple Attack)", desc: "Direct, minimal telegraph." },
  { name: "PIA (Progressive Indirect)", desc: "Feint to draw reaction." },
  { name: "HIA (Hand Immobilization)", desc: "Trap & strike simultaneously." },
  { name: "ABC (Attack by Combination)", desc: "Rhythm breaking combos." },
  { name: "ABD (Attack by Drawing)", desc: "Create opening by exposing." }
];
const waysContainer = document.getElementById("attackWaysGrid");
if (waysContainer) {
  ways.forEach(w => {
    const div = document.createElement("div");
    div.className = "tech-tile";
    div.innerHTML = `<i class="fas fa-bullseye"></i> <strong>${w.name}</strong><br>${w.desc}`;
    div.onclick = () => alert(`🎯 ${w.name} animated breakdown: distance & timing.`);
    waysContainer.appendChild(div);
  });
}

// ====================== FOOTWORK SIMULATOR ======================
const footCanvas = document.getElementById("footCanvas2D");
if (footCanvas) {
  const footCtx = footCanvas.getContext("2d");
  let footX = 200, footY = 180;

  function drawFootwork() {
    footCanvas.width = footCanvas.clientWidth;
    footCanvas.height = 220;
    footCtx.clearRect(0, 0, footCanvas.width, footCanvas.height);
    footCtx.fillStyle = "#77F1EC";
    footCtx.shadowBlur = 8;
    footCtx.beginPath();
    footCtx.arc(footX, footY, 14, 0, Math.PI * 2);
    footCtx.fill();
    footCtx.fillStyle = "#fff";
    footCtx.font = "bold 12px Inter";
    footCtx.fillText("you", footX - 8, footY - 12);
    footCtx.beginPath();
    footCtx.arc(footX + 42, footY - 8, 12, 0, Math.PI * 2);
    footCtx.strokeStyle = "#77F1EC";
    footCtx.stroke();
  }

  function constrainFoot() {
    footX = Math.min(footCanvas.width - 30, Math.max(30, footX));
    footY = Math.min(footCanvas.height - 30, Math.max(30, footY));
    drawFootwork();
  }

  document.getElementById("stepAdvance")?.addEventListener("click", () => {
    footY -= 18;
    constrainFoot();
  });
  document.getElementById("stepRetreat")?.addEventListener("click", () => {
    footY += 18;
    constrainFoot();
  });
  document.getElementById("stepPivot")?.addEventListener("click", () => {
    footX += 25;
    constrainFoot();
  });
  document.getElementById("resetFoot")?.addEventListener("click", () => {
    footX = footCanvas.width / 2;
    footY = footCanvas.height - 50;
    constrainFoot();
  });

  setTimeout(() => {
    footCanvas.width = 500;
    footCanvas.height = 220;
    footX = 200;
    footY = 160;
    drawFootwork();
  }, 100);
}

// ====================== RANGE AWARENESS TRAINER ======================
const rangeCanvas = document.getElementById("rangeCanvas2D");
if (rangeCanvas) {
  const rCtx = rangeCanvas.getContext("2d");
  let rangeVal = 95;

  function drawRange(dist) {
    rangeCanvas.width = rangeCanvas.clientWidth;
    rangeCanvas.height = 240;
    rCtx.clearRect(0, 0, rangeCanvas.width, rangeCanvas.height);
    const cx = rangeCanvas.width / 2, yBase = rangeCanvas.height - 50;
    rCtx.beginPath();
    rCtx.arc(cx, yBase - 20, 35, 0, Math.PI * 2);
    rCtx.strokeStyle = "#77F1EC";
    rCtx.stroke();
    rCtx.beginPath();
    rCtx.arc(cx, yBase - 20, 80, 0, Math.PI * 2);
    rCtx.stroke();
    rCtx.fillStyle = "#77F1EC";
    rCtx.beginPath();
    rCtx.arc(cx - 70, yBase, 16, 0, Math.PI * 2);
    rCtx.fill();
    rCtx.fillStyle = "#FFA07A";
    rCtx.beginPath();
    rCtx.arc(cx + (dist / 1.5), yBase - 5, 16, 0, Math.PI * 2);
    rCtx.fill();
    let zone = dist < 55 ? "CLINCH RANGE" : (dist < 115 ? "PUNCHING RANGE" : (dist < 170 ? "KICKING RANGE" : "OUT OF RANGE"));
    document.getElementById("rangeZoneText").innerHTML = `⚡ ${zone} – ${dist < 115 ? "IDEAL INTERCEPT" : "ADJUST DISTANCE"}`;
  }

  const rangeSlider = document.getElementById("rangeSlider");
  rangeSlider?.addEventListener("input", (e) => {
    rangeVal = parseInt(e.target.value);
    drawRange(rangeVal);
  });
  drawRange(95);
}

// ====================== REACTION TRAINER ======================
document.getElementById("reactionTestBtn")?.addEventListener("click", () => {
  const div = document.getElementById("reactionResult");
  div.innerHTML = "⚡ Prepare... intercept flash!";
  setTimeout(() => {
    div.innerHTML = "🔥 FLASH! TAP ANYWHERE NOW!";
    const start = Date.now();
    const handler = () => {
      const rt = Date.now() - start;
      div.innerHTML = `✅ Reaction time: ${rt}ms — ${rt < 250 ? "Elite interception." : "Sharpen timing with drills."}`;
      document.removeEventListener("click", handler);
    };
    document.addEventListener("click", handler, { once: true });
    setTimeout(() => document.removeEventListener("click", handler), 1500);
  }, 800 + Math.random() * 1000);
});

// ====================== SHADOW OPPONENT AI ======================
document.getElementById("strategyBtn")?.addEventListener("click", () => {
  const opp = document.getElementById("opponentSelect").value;
  let advice = "";
  if (opp.includes("Boxer")) advice = "Maintain kicking range, intercept jab with stop-hit. Use side kick to keep distance.";
  else if (opp.includes("Kickboxer")) advice = "Close trapping range, low kicks, break rhythm with angular footwork.";
  else if (opp.includes("Pressure")) advice = "Pivot angles, attack by drawing, use lateral movement.";
  else advice = "Use hand immobilization, control wrists, mobility and feints.";
  document.getElementById("strategyOutput").innerText = advice;
});

// ====================== JOURNAL & LOCALSTORAGE ======================
let savedJournal = localStorage.getItem("jkd_journal") || "—";
const journalPreview = document.getElementById("journalPreview");
if (journalPreview) journalPreview.innerHTML = `📜 Last reflection: "${savedJournal.substring(0, 80)}"`;

document.getElementById("saveJournalBtn")?.addEventListener("click", () => {
  const txt = document.getElementById("journalEntry").value;
  if (txt.trim()) {
    localStorage.setItem("jkd_journal", txt);
    if (journalPreview) journalPreview.innerHTML = `📜 Last reflection: "${txt.substring(0, 80)}"`;
    alert("Insight absorbed. Flow deepens.");
    let insights = parseInt(localStorage.getItem("insightCount") || "42") + 1;
    localStorage.setItem("insightCount", insights);
    const insightSpan = document.getElementById("insightCount");
    if (insightSpan) insightSpan.innerText = insights;
  } else {
    alert("Write a reflection first.");
  }
});

// Load stored stats
const insightSpan = document.getElementById("insightCount");
if (insightSpan && localStorage.getItem("insightCount")) insightSpan.innerText = localStorage.getItem("insightCount");
const drillSpan = document.getElementById("drillCount");
if (drillSpan && localStorage.getItem("drillCount")) drillSpan.innerText = localStorage.getItem("drillCount");

// Drill button increment
document.getElementById("weaknessDrillBtn")?.addEventListener("click", () => {
  let drills = parseInt(localStorage.getItem("drillCount") || "87") + 1;
  localStorage.setItem("drillCount", drills);
  if (drillSpan) drillSpan.innerText = drills;
  alert("Angular footwork: 3x 1min pivot & sidestep drills. +1 Drill recorded.");
});

// ====================== STYLE BUILDER ======================
document.querySelectorAll(".style-item").forEach(btn => {
  btn.addEventListener("click", () => alert(`➕ Added ${btn.innerText} to your personal style arsenal.`));
});
document.getElementById("saveStyleBtn")?.addEventListener("click", () => alert("Your unique JKD style recorded: fluid, adaptive, formless."));

// ====================== FLOW TAB BUTTONS ======================
document.getElementById("beginFlowBtn")?.addEventListener("click", () => alert("Enter Flow: 5 min breath, then shadow interception drills. Breathe deep."));
document.getElementById("quickLensBtn")?.addEventListener("click", () => {
  document.getElementById("modalTitle").innerText = "The Formless Form";
  document.getElementById("modalMsg").innerHTML = "“The highest technique is to have no technique. Flow, adapt, intercept.” — Apply to sparring, work, and life.";
  document.getElementById("globalModal").classList.add("active");
});
document.getElementById("breathTimerBtn")?.addEventListener("click", () => alert("🧘 4-7-8 Breathing: Inhale 4s, Hold 7s, Exhale 8s. Repeat 4 cycles. Calm the water."));

// ====================== FLOATING FAB ======================
document.getElementById("formlessFab")?.addEventListener("click", () => {
  const insights = [
    "🌀 Practice footwork without pattern — respond to invisible opponent.",
    "⚡ Your timing sharpens: stop-hit drill 5 min.",
    "📖 Revisit 'Formless Form': no technique as technique.",
    "🌊 Be water: yield and intercept today."
  ];
  const rand = insights[Math.floor(Math.random() * insights.length)];
  document.getElementById("modalTitle").innerHTML = "🌊 Formless Flow";
  document.getElementById("modalMsg").innerHTML = rand;
  document.getElementById("globalModal").classList.add("active");
});

// ====================== MODAL CLOSE ======================
document.getElementById("closeModalBtn")?.addEventListener("click", () => {
  document.getElementById("globalModal").classList.remove("active");
});

// ====================== TAB SWITCHING WITH GSAP ======================
const panes = {
  flow: document.getElementById("flowPane"),
  tao: document.getElementById("taoPane"),
  dojo: document.getElementById("dojoPane"),
  lab: document.getElementById("labPane"),
  self: document.getElementById("selfPane")
};
const navBtns = document.querySelectorAll(".nav-item");

function switchTab(tabId) {
  Object.keys(panes).forEach(id => panes[id].classList.remove("active-pane"));
  panes[tabId].classList.add("active-pane");
  navBtns.forEach(btn => btn.classList.remove("active"));
  document.querySelector(`.nav-item[data-tab="${tabId}"]`).classList.add("active");
  gsap.fromTo(`#${tabId}Pane .glass-card`, { y: 15, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.08, duration: 0.5 });
}

navBtns.forEach(btn => btn.addEventListener("click", () => switchTab(btn.getAttribute("data-tab"))));

// ====================== INITIAL GSAP ENTRANCE ======================
gsap.fromTo(".glass-card", { y: 20, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.07, duration: 0.8, ease: "power2.out" });

// ====================== STREAK AUTO-INCREMENT (DAILY) ======================
const streakSpan = document.getElementById("streakDisplay");
if (streakSpan) {
  let streak = parseInt(localStorage.getItem("streak") || "21");
  streakSpan.innerText = streak;
  setInterval(() => {
    streak++;
    localStorage.setItem("streak", streak);
    streakSpan.innerText = streak;
  }, 86400000); // once per day
             }
