// ============ STATE ============
let userData = JSON.parse(localStorage.getItem('investorData') || '{}');
let currentPage = 'landing';
const pageHistory = [];

// ============ NAVIGATION ============
function showPage(id) {
  if (id !== currentPage) pageHistory.push(currentPage);
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
  window.scrollTo(0,0);
  currentPage = id;
  updateBackButton();
  if (id === 'onboarding') hydrateOnboardingFromData();
  if (id === 'dashboard') buildDashboard();
  if (id === 'recommendation') buildRecommendation();
  if (id === 'platforms') updatePlatformMatch(userData.risk, userData.experience);
}

function goBackPage() {
  while (pageHistory.length > 0) {
    const prev = pageHistory.pop();
    if (prev && prev !== currentPage) {
      document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
      document.getElementById(prev).classList.add('active');
      document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
      window.scrollTo(0,0);
      currentPage = prev;
      updateBackButton();
      if (prev === 'onboarding') hydrateOnboardingFromData();
      if (prev === 'dashboard') buildDashboard();
      if (prev === 'recommendation') buildRecommendation();
      return;
    }
  }
  if (currentPage !== 'landing') showPage('landing');
}

function updateBackButton() {
  const backBtn = document.getElementById('page-back-btn');
  if (!backBtn) return;
  backBtn.style.display = currentPage === 'landing' ? 'none' : 'inline-flex';
}

function hasCompletedProfile() {
  return !!(userData.experience && userData.risk && userData.goal && userData.duration && parseInt(userData.budget) > 0);
}

function updateEntryButtons() {
  const completed = hasCompletedProfile();
  const navBtn = document.getElementById('nav-cta-btn');
  const heroBtn = document.getElementById('hero-get-started-btn');
  const problemBtn = document.getElementById('problem-get-started-btn');
  if (navBtn) {
    navBtn.style.display = completed ? 'none' : 'inline-flex';
    navBtn.textContent = 'Get Started';
    navBtn.title = 'Complete onboarding to personalize your plan';
  }
  if (heroBtn) heroBtn.style.display = completed ? 'none' : 'inline-flex';
  if (problemBtn) problemBtn.style.display = completed ? 'none' : 'inline-flex';
}

function openNavProfile() {
  showPage('onboarding');
}

function triggerFeatureFromKey(e, feature) {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    openFeature(feature);
  }
}

function showFeatureToast(msg) {
  const toast = document.getElementById('feature-toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(showFeatureToast.timeoutId);
  showFeatureToast.timeoutId = setTimeout(() => toast.classList.remove('show'), 1800);
}

function openFeature(feature) {
  if (feature === 'score') {
    showPage('dashboard');
    showFeatureToast('Opened your readiness dashboard');
    return;
  }

  if (feature === 'learning') {
    showPage('learning');
    showFeatureToast('Learning Hub is ready');
    return;
  }

  if (feature === 'recommendation') {
    showPage('recommendation');
    showFeatureToast('Showing your personalized recommendation');
    return;
  }

  if (feature === 'simulator') {
    showPage('recommendation');
    showFeatureToast('Projection simulator opened');
    setTimeout(() => {
      const simSection = document.querySelector('.sim-card');
      if (simSection) simSection.scrollIntoView({ behavior:'smooth', block:'start' });
    }, 90);
    return;
  }

  if (feature === 'mistakes') {
    showPage('dashboard');
    showFeatureToast('Checking beginner mistake alerts');
    setTimeout(() => {
      const warnSection = document.getElementById('warnings-container');
      if (warnSection) warnSection.scrollIntoView({ behavior:'smooth', block:'start' });
    }, 90);
    return;
  }

  if (feature === 'roadmap') {
    showPage('dashboard');
    showFeatureToast('Opening your smart roadmap');
    setTimeout(() => {
      const roadmap = document.getElementById('roadmap-container');
      if (roadmap) roadmap.scrollIntoView({ behavior:'smooth', block:'start' });
    }, 90);
  }
}

function goLearn(topic) {
  showPage('learning');
  showTopic(topic, document.querySelector('.tab-btn'));
  document.querySelectorAll('.tab-btn').forEach(b => {
    if (b.textContent.toLowerCase().includes(topic === 'mf' ? 'mutual' : topic === 'sip' ? 'sip' : topic === 'risk' ? 'risk' : 'stocks')) {
      b.click();
    }
  });
}

// ============ ONBOARDING ============
let currentStep = 0;

function selectOption(el, key, val) {
  const parent = el.closest('.option-grid');
  parent.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected'));
  el.classList.add('selected');
  userData[key] = val;
  saveData();
}

function saveBudget(val) {
  userData.budget = parseInt(val) || 0;
  saveData();
  document.querySelectorAll('#step1 .option-btn').forEach(b => b.classList.remove('selected'));
}

function setBudgetPreset(val) {
  userData.budget = val;
  document.getElementById('budgetInput').value = val;
  saveData();
  document.querySelectorAll('#step1 .option-btn').forEach(b => b.classList.remove('selected'));
  const active = document.querySelector(`#step1 .option-btn[data-budget="${val}"]`);
  if (active) active.classList.add('selected');
}

function hydrateOnboardingFromData() {
  const { experience, risk, goal, budget, duration } = userData;
  document.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected'));

  if (experience) {
    const expBtn = document.querySelector(`#step0 .option-btn[data-key="experience"][data-value="${experience}"]`);
    if (expBtn) expBtn.classList.add('selected');
  }
  if (risk) {
    const riskBtn = document.querySelector(`#step2 .option-btn[data-key="risk"][data-value="${risk}"]`);
    if (riskBtn) riskBtn.classList.add('selected');
  }
  if (goal) {
    const goalBtn = document.querySelector(`#step3 .option-btn[data-key="goal"][data-value="${goal}"]`);
    if (goalBtn) goalBtn.classList.add('selected');
  }
  if (duration) {
    const durationBtn = document.querySelector(`#step4 .option-btn[data-key="duration"][data-value="${duration}"]`);
    if (durationBtn) durationBtn.classList.add('selected');
  }

  const budgetInput = document.getElementById('budgetInput');
  if (budgetInput) budgetInput.value = budget || '';
  if (budget) {
    const budgetBtn = document.querySelector(`#step1 .option-btn[data-budget="${budget}"]`);
    if (budgetBtn) budgetBtn.classList.add('selected');
  }
}

function nextStep(n) {
  document.getElementById('step' + currentStep).classList.remove('active');
  document.getElementById('dot' + currentStep).classList.remove('active');
  document.getElementById('dot' + currentStep).classList.add('done');
  currentStep = n;
  document.getElementById('step' + n).classList.add('active');
  document.getElementById('dot' + n).classList.add('active');
}

function prevStep(n) {
  document.getElementById('step' + currentStep).classList.remove('active');
  document.getElementById('dot' + currentStep).classList.remove('active');
  document.getElementById('dot' + currentStep).classList.remove('done');
  currentStep = n;
  document.getElementById('step' + n).classList.add('active');
  document.getElementById('dot' + n).classList.add('active');
  document.getElementById('dot' + n).classList.remove('done');
}

function finishOnboarding() {
  saveData();
  // Reset steps for next visit
  currentStep = 0;
  document.querySelectorAll('.onb-step').forEach(s => s.classList.remove('active'));
  document.getElementById('step0').classList.add('active');
  document.querySelectorAll('.step-dot').forEach(d => { d.classList.remove('active','done'); });
  document.getElementById('dot0').classList.add('active');
  showPage('dashboard');
}

function clearUserData() {
  const shouldClear = confirm('Clear all saved profile information?');
  if (!shouldClear) return;
  userData = {};
  localStorage.removeItem('investorData');
  hydrateOnboardingFromData();
  updateEntryButtons();
  pageHistory.length = 0;
  showPage('landing');
}

// ============ SCORE CALCULATION ============
function calcReadinessScore() {
  let score = 0;
  const { experience, budget, risk, goal, duration } = userData;
  if (experience === 'intermediate') score += 25;
  else if (experience === 'beginner') score += 15;
  const b = parseInt(budget) || 0;
  if (b >= 10000) score += 30;
  else if (b >= 5000) score += 25;
  else if (b >= 2000) score += 18;
  else if (b >= 500) score += 10;
  if (risk === 'low') score += 20;
  else if (risk === 'medium') score += 25;
  else if (risk === 'high') score += 15;
  if (goal === 'wealth') score += 20;
  else if (goal === 'saving') score += 15;
  else if (goal === 'short') score += 10;
  if (duration === 'long') score += 10;
  else if (duration === 'medium') score += 6;
  else if (duration === 'short') score += 3;
  return Math.min(100, score);
}

function calcConfidence() {
  const { experience, risk, goal } = userData;
  let c = 0;
  if (experience === 'intermediate') c += 2;
  else if (experience === 'beginner') c += 1;
  if (risk) c += 1;
  if (goal === 'wealth') c += 2;
  else if (goal === 'saving') c += 1;
  if (c >= 4) return 'high';
  if (c >= 2) return 'medium';
  return 'low';
}

// ============ DASHBOARD ============
function buildDashboard() {
  const { experience, budget, risk, goal, duration } = userData;
  const score = calcReadinessScore();
  const conf = calcConfidence();

  // Greeting
  const greetings = { beginner:'Hey, Future Involife Investor! 👋', intermediate:'Welcome Back to Involife! 🚀' };
  document.getElementById('dash-greeting').textContent = greetings[experience] || 'Welcome to Involife! 👋';
  document.getElementById('dash-sub').textContent = experience ? `Profile: ${experience} · Budget: ₹${(budget||0).toLocaleString('en-IN')}/mo · Risk: ${risk||'—'} · Goal: ${goal||'—'}` : 'Complete onboarding to personalise your dashboard';
  document.getElementById('profile-exp').textContent = experience ? experience.charAt(0).toUpperCase() + experience.slice(1) : '—';
  document.getElementById('profile-budget').textContent = budget ? `₹${(budget||0).toLocaleString('en-IN')}/mo` : '—';
  document.getElementById('profile-risk').textContent = risk ? risk.charAt(0).toUpperCase() + risk.slice(1) : '—';
  document.getElementById('profile-goal').textContent = goal === 'wealth' ? 'Long-term Wealth' : goal === 'saving' ? 'Big Purchase' : goal === 'short' ? 'Short-term Returns' : '—';

  // Score
  const scoreEl = document.getElementById('readiness-num');
  scoreEl.innerHTML = `${score}<span>/100</span>`;
  const bar = document.getElementById('readiness-bar');
  const ring = document.getElementById('score-ring');
  const msgs = [
    [0,30,'Start with onboarding to unlock your personalized plan','#ef4444'],
    [30,50,'You\'re getting started! Learn the basics first.','#f59e0b'],
    [50,70,'Good foundation! You\'re ready to explore SIPs.','#38bdf8'],
    [70,90,'You\'re well-prepared. Time to start investing!','#22c55e'],
    [90,101,'Excellent! You\'re highly ready. Let\'s go! 🚀','#22c55e']
  ];
  let color = '#38bdf8', msg = '';
  for (const [lo,hi,m,c] of msgs) { if (score >= lo && score < hi) { msg=m; color=c; break; } }
  bar.style.width = score + '%';
  bar.style.background = `linear-gradient(90deg, ${color}, ${color}cc)`;
  if (ring) ring.style.background = `conic-gradient(${color} ${score * 3.6}deg, #dbeafe 0deg)`;
  document.getElementById('readiness-msg').textContent = msg || `You are ${score}% ready to start investing.`;

  // Budget metric
  document.getElementById('metric-budget').textContent = budget ? `₹${parseInt(budget).toLocaleString('en-IN')}/mo` : '—';

  // Confidence
  const confMap = { high:['High Confidence',5,'lit'], medium:['Medium Confidence',3,'lit-amber'], low:['Low Confidence',1,'lit-red'] };
  const [clabel, clit, cls] = confMap[conf] || ['—',0,'lit'];
  document.getElementById('conf-label').textContent = clabel;
  const cb = document.getElementById('conf-bar');
  cb.innerHTML = Array(5).fill(0).map((_,i) => `<div class="conf-seg ${i < clit ? cls : ''}"></div>`).join('');

  // Warnings
  const warnings = [];
  if (!budget || parseInt(budget) < 1000) {
    warnings.push({bad:true, title:'No Emergency Fund?', body:'Before investing, make sure you have 3–6 months of expenses saved as an emergency fund.'});
  }
  if ((duration === 'short' || goal === 'short') && risk !== 'low') {
    warnings.push({bad:'caution', title:'Match risk with your timeline', body:'Short-term goals usually work better with lower risk products than volatile equity-heavy choices.'});
  }
  if (risk === 'high' && parseInt(budget) < 3000) {
    warnings.push({bad:true, title:'High Risk + Low Budget', body:'High-risk investments with a small budget can be devastating. Consider starting with SIPs instead.'});
  }
  if (goal === 'short' && risk === 'high') {
    warnings.push({bad:true, title:'Quick Returns Trap', body:'High returns in short time = high risk. Markets are unpredictable short-term. Set realistic expectations.'});
  }
  warnings.push({bad:'caution', title:'Avoid social media tips', body:'Random stock or crypto tips online are not a real strategy. Stick to your plan and verified research.'});
  warnings.push({bad:'caution', title:'Do not invest everything at once', body:'Keep emergency money separate and start gradually with SIPs instead of putting all money in one shot.'});
  if (warnings.length === 0) {
    warnings.push({bad:false, title:'Great Profile!', body:'Your investment profile looks balanced. You\'re on the right track.'});
  }
  document.getElementById('warnings-container').innerHTML = warnings.map(w => `
    <div class="warning-item ${w.bad === true ? '' : w.bad === 'caution' ? 'caution' : 'ok'}">
      <div class="wi-icon">${w.bad === true ? '⛔' : w.bad === 'caution' ? '⚠️' : '✅'}</div>
      <div><h4>${w.title}</h4><p>${w.body}</p></div>
    </div>`).join('');

  // Roadmap
  const starterSip = Math.max(500, Math.min(parseInt(budget) || 500, 2000));
  document.getElementById('next-step-copy').textContent =
    `Based on your ₹${starterSip.toLocaleString('en-IN')}/month budget and ${risk || 'balanced'} risk profile, start with a simple SIP plan and review it monthly.`;
  const steps = [
    { n:1, month:'Month 1', state:'done', title:'Learn the Basics', desc:'Complete the Learning Hub — stocks, SIP, mutual funds, risk.', detail:'Finish the basics first so you understand what you are investing in.' },
    { n:2, month:'Month 1', state:'active', title:'Set Up Your SIP', desc:`Start a ₹${starterSip.toLocaleString('en-IN')}/month SIP in a beginner-friendly index or flexi-cap fund.`, detail:'Keep the first setup simple. Start small, stay consistent, and avoid changing funds too fast.' },
    { n:3, month:'Month 3', state:'locked', title:'Track for 3 Months', desc:'Review your portfolio monthly. Do not panic on small dips.', detail:'Your goal is consistency, not chasing returns every week.' },
    { n:4, month:'Month 6', state:'locked', title:'Diversify', desc:'Add a second fund or safer asset only after building consistency.', detail:'Diversify only after your first SIP habit is stable.' },
  ];
  document.getElementById('roadmap-container').innerHTML = steps.map((s,i) => `
    <div class="roadmap-step ${i === 1 ? 'open' : ''}" onclick="toggleRoadmapStep(this)">
      <div class="step-circle ${s.state === 'done' ? 'done-step' : s.state === 'active' ? 'active-step' : 'locked-step'}">${s.state === 'done' ? '✓' : s.state === 'locked' ? '🔒' : s.n}</div>
      <div>
        <div class="roadmap-meta">
          <span class="roadmap-chip">${s.month}</span>
          <span class="roadmap-chip">${s.state === 'done' ? 'Completed' : s.state === 'active' ? 'Next Step' : 'Locked'}</span>
        </div>
        <h4>${s.title}</h4>
        <p>${s.desc}</p>
        <div class="roadmap-detail"><p>${s.detail}</p></div>
      </div>
    </div>`).join('');

  updatePlatformMatch(risk, experience);
}

// ============ RECOMMENDATION ============
function buildRecommendation() {
  const { risk, budget, goal, experience, duration } = userData;
  if (!risk) return;

  const plans = {
    low: {
      icon:'🛡️', title:'SIP in Debt / Hybrid Funds', subtitle:'Safe, steady growth for conservative investors',
      type:'Debt/Hybrid Mutual Funds via SIP',
      horizon: duration === 'long' ? '10–15 yrs' : duration === 'medium' ? '5–7 yrs' : '1–2 yrs',
      expected: '7–10% p.a.',
      reasons: ['Your low risk preference means capital protection is priority',`Based on your ₹${(parseInt(budget)||0).toLocaleString('en-IN')} monthly budget, a steady SIP is easier to maintain`,'Debt or hybrid funds reduce sudden volatility for beginners','This suits short or medium-term goals better than aggressive equity']
    },
    medium: {
      icon:'⚖️', title:'SIP in Diversified Mutual Funds', subtitle:'Balanced growth with manageable risk',
      type:'Flexi Cap / Large-cap Mutual Funds',
      horizon: duration === 'long' ? '7–10 yrs' : duration === 'medium' ? '5 yrs' : '3 yrs',
      expected: '12–15% p.a.',
      reasons: ['Medium risk means you can handle some market volatility',`With a ₹${(parseInt(budget)||0).toLocaleString('en-IN')} budget, diversified funds give a strong balance of growth and simplicity`,'This is a beginner-friendly way to beat inflation over time','Start with one broad fund before adding complexity']
    },
    high: {
      icon:'🔥', title:'Direct Stocks + Mid/Small Cap Funds', subtitle:'Maximum growth potential for risk-takers',
      type:'Stocks + Small-cap Funds',
      horizon: duration === 'long' ? '5–10 yrs' : duration === 'medium' ? '5 yrs' : '2–3 yrs',
      expected: '18–25%+ p.a.',
      reasons: ['You have high risk tolerance — equity is your ally',`Because your duration is ${duration || 'long-term'}, you can take a growth-focused approach`,'Direct stocks need discipline and research before investing','Only use this route if you can stay invested through volatility']
    }
  };

  const plan = plans[risk] || plans.medium;
  const b = parseInt(budget) || 2000;
  const monthlyInvest = Math.round(b * 0.8);

  document.getElementById('rec-icon').textContent = plan.icon;
  document.getElementById('rec-title').textContent = plan.title;
  document.getElementById('rec-subtitle').textContent = `${plan.subtitle}. Based on your ₹${b.toLocaleString('en-IN')}/month budget and ${risk} risk profile.`;
  document.getElementById('rec-type-badge').textContent = plan.type;
  document.getElementById('plan-monthly').textContent = `₹${monthlyInvest.toLocaleString('en-IN')}`;
  document.getElementById('plan-horizon').textContent = plan.horizon;
  document.getElementById('plan-expected').textContent = plan.expected;
  document.getElementById('rec-reasons').innerHTML = plan.reasons.map(r => `<li>${r}</li>`).join('');

  // Pre-fill simulator
  document.getElementById('sim-amount').value = monthlyInvest;
  updateSimulator();
}

// ============ SIMULATOR ============
function updateSimulator() {
  const monthly = parseInt(document.getElementById('sim-amount').value) || 0;
  const years = parseInt(document.getElementById('sim-years').value) || 1;
  const rate = 0.12 / 12;
  const n = years * 12;
  const fv = monthly * ((Math.pow(1 + rate, n) - 1) / rate) * (1 + rate);
  const invested = monthly * n;
  const returns = fv - invested;

  const fmt = (v) => {
    if (v >= 10000000) return `₹${(v/10000000).toFixed(2)}Cr`;
    if (v >= 100000) return `₹${(v/100000).toFixed(2)}L`;
    return `₹${Math.round(v).toLocaleString('en-IN')}`;
  };

  document.getElementById('sim-invested').textContent = fmt(invested);
  document.getElementById('sim-returns').textContent = fmt(returns);
  document.getElementById('sim-total').textContent = fmt(fv);

  // Draw chart
  const chartEl = document.getElementById('sim-chart');
  chartEl.innerHTML = '';
  const bars = Math.min(years, 20);
  const vals = [];
  for (let y = 1; y <= bars; y++) {
    const ny = y * 12;
    const fvy = monthly * ((Math.pow(1 + rate, ny) - 1) / rate) * (1 + rate);
    vals.push(fvy);
  }
  const maxVal = Math.max(...vals);
  vals.forEach((v, i) => {
    const pct = (v / maxVal) * 100;
    const hue = Math.round(120 * (i / (bars - 1)));
    const bar = document.createElement('div');
    bar.className = 'chart-bar';
    bar.style.height = pct + '%';
    bar.style.background = `hsl(${180 + hue * 0.4}, 80%, 55%)`;
    bar.title = `Year ${i+1}: ${fmt(v)}`;
    chartEl.appendChild(bar);
  });
}

// ============ LEARNING TABS ============
function showTopic(id, btn) {
  document.querySelectorAll('.topic-content').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  const el = document.getElementById('topic-' + id);
  if (el) el.classList.add('active');
  if (btn && btn.classList) btn.classList.add('active');
}

function toggleRoadmapStep(el) {
  el.classList.toggle('open');
}

function updatePlatformMatch(risk, experience) {
  const platformMap = {
    low: 'groww',
    medium: 'groww',
    high: experience === 'intermediate' ? 'zerodha' : 'upstox'
  };
  const best = platformMap[risk] || 'groww';
  document.querySelectorAll('.plat-card').forEach(card => {
    card.classList.toggle('recommended', card.dataset.platform === best);
  });
}

// ============ STORAGE ============
function saveData() {
  localStorage.setItem('investorData', JSON.stringify(userData));
  updateEntryButtons();
}

// ============ INIT ============
updateSimulator();
if (Object.keys(userData).length > 2) buildDashboard();
hydrateOnboardingFromData();
updateEntryButtons();
updateBackButton();