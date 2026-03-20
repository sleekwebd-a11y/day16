// ---- POLICY DEFINITIONS ----
const POLICIES = [
  { id: 'tax',         label: '💰 Income Tax Rate',        min: 0,  max: 60,  default: 25, unit: '%',  desc: 'Higher tax funds services but may slow growth' },
  { id: 'healthcare',  label: '🏥 Healthcare (Public)',     min: 0,  max: 100, default: 60, unit: '%',  desc: '0 = fully private, 100 = fully public' },
  { id: 'education',   label: '🎓 Education Investment',    min: 0,  max: 100, default: 60, unit: '%',  desc: 'Higher = better outcomes, longer payoff' },
  { id: 'immigration', label: '🌍 Immigration Openness',    min: 0,  max: 100, default: 50, unit: '%',  desc: 'More open = faster growth, higher diversity' },
  { id: 'bureaucracy', label: '📋 e-Governance Level',      min: 0,  max: 100, default: 50, unit: '%',  desc: 'Higher = less red tape, more efficiency' },
  { id: 'environment', label: '🌿 Environmental Laws',      min: 0,  max: 100, default: 50, unit: '%',  desc: 'Strict = healthier, slower industrial growth' },
  { id: 'housing',     label: '🏠 Housing Freedom',         min: 0,  max: 100, default: 50, unit: '%',  desc: '0 = rent control, 100 = free market' },
  { id: 'military',    label: '⚔️ Military Spending',       min: 0,  max: 10,  default: 2,  unit: '%GDP', desc: 'High = secure but expensive' },
];

const PRESETS = {
  nordic:      { tax: 50, healthcare: 90, education: 85, immigration: 60, bureaucracy: 70, environment: 80, housing: 40, military: 2 },
  singapore:   { tax: 20, healthcare: 50, education: 80, immigration: 80, bureaucracy: 90, environment: 60, housing: 30, military: 4 },
  libertarian: { tax: 10, healthcare: 10, education: 20, immigration: 90, bureaucracy: 80, environment: 20, housing: 90, military: 1 },
  estonia:     { tax: 20, healthcare: 65, education: 75, immigration: 55, bureaucracy: 95, environment: 65, housing: 60, military: 3 },
};

// ---- EVENTS POOL ----
const EVENTS = [
  { text: '🌐 Tech companies relocate due to low red tape', condition: p => p.bureaucracy > 70, gdp: 8,  happy: 3,  pop: 2  },
  { text: '📉 Tax avoidance rises — wealthy move assets abroad', condition: p => p.tax > 50, gdp: -5, happy: -2, pop: -1 },
  { text: '🎓 Education reforms pay off — productivity surge', condition: p => p.education > 70, gdp: 6, happy: 4, pop: 1 },
  { text: '🏥 Healthcare system praised globally — life expectancy up', condition: p => p.healthcare > 75, gdp: 2, happy: 8, pop: 3 },
  { text: '🌿 Green energy boom — exports rise', condition: p => p.environment > 70, gdp: 5, happy: 5, pop: 1 },
  { text: '🌍 Immigration wave brings skilled workers', condition: p => p.immigration > 70, gdp: 7, happy: 2, pop: 8 },
  { text: '🏠 Housing crisis — affordability collapses', condition: p => p.housing > 80, gdp: -3, happy: -8, pop: -2 },
  { text: '📋 Bureaucracy strangling small businesses', condition: p => p.bureaucracy < 30, gdp: -6, happy: -5, pop: -2 },
  { text: '⚔️ Military strength deters threats — stability bonus', condition: p => p.military > 5, gdp: 3, happy: 3, pop: 1 },
  { text: '💸 Low taxes attract foreign investment boom', condition: p => p.tax < 15, gdp: 10, happy: 4, pop: 3 },
  { text: '🏥 Private healthcare crisis — inequality rises', condition: p => p.healthcare < 20, gdp: 0, happy: -9, pop: -3 },
  { text: '🌍 Brain drain — educated youth emigrating', condition: p => p.education < 30 && p.tax > 40, gdp: -7, happy: -6, pop: -5 },
  { text: '🌿 Pollution scandal damages reputation', condition: p => p.environment < 20, gdp: -4, happy: -7, pop: -2 },
  { text: '📈 e-Government wins global award — FDI surge', condition: p => p.bureaucracy > 85, gdp: 9, happy: 6, pop: 2 },
  { text: '🏘️ Rent control causes housing shortage', condition: p => p.housing < 20, gdp: -2, happy: -6, pop: -3 },
  { text: '🎉 Quality of life ranking #1 globally', condition: p => p.healthcare > 70 && p.education > 70 && p.environment > 60, gdp: 5, happy: 12, pop: 5 },
  { text: '💰 Government debt crisis — austerity needed', condition: p => p.tax < 15 && p.healthcare > 70, gdp: -8, happy: -10, pop: -2 },
  { text: '🌐 Startup ecosystem explodes — unicorns emerge', condition: p => p.bureaucracy > 75 && p.tax < 25, gdp: 12, happy: 7, pop: 4 },
  { text: '📉 Recession hits — unemployment rises', condition: () => Math.random() < 0.15, gdp: -6, happy: -8, pop: -1 },
  { text: '🌱 Environmental tourism boosts GDP', condition: p => p.environment > 65, gdp: 4, happy: 5, pop: 2 },
];

// ---- STATE ----
let policies  = {};
let simState  = {};
let simTicker = null;
let charts    = {};
let chartData = { years: [], gdp: [], happy: [], pop: [] };

// ---- BUILD SLIDERS ----
function buildSliders() {
  const container = document.getElementById('sliders');
  POLICIES.forEach(p => {
    policies[p.id] = p.default;
    container.innerHTML += `
      <div>
        <div class="flex justify-between items-center mb-1">
          <span class="text-sm font-semibold">${p.label}</span>
          <span id="val_${p.id}" class="text-sm font-mono text-emerald-300 w-16 text-right">${p.default}${p.unit}</span>
        </div>
        <input type="range" id="slider_${p.id}" min="${p.min}" max="${p.max}" value="${p.default}" step="1"
          class="w-full h-2 rounded-full appearance-none cursor-pointer accent-emerald-500 bg-white/10"
          oninput="updatePolicy('${p.id}', this.value, '${p.unit}')">
        <div class="text-xs text-slate-500 mt-1">${p.desc}</div>
      </div>
    `;
  });
}

function updatePolicy(id, val, unit) {
  policies[id] = parseFloat(val);
  document.getElementById('val_' + id).textContent = val + unit;
}

function applyPreset(name) {
  const preset = PRESETS[name];
  Object.entries(preset).forEach(([id, val]) => {
    policies[id] = val;
    const slider = document.getElementById('slider_' + id);
    const policy = POLICIES.find(p => p.id === id);
    if (slider) slider.value = val;
    if (policy) document.getElementById('val_' + id).textContent = val + policy.unit;
  });
}

// ---- SIMULATION ENGINE ----
function startSimulation() {
  const name    = document.getElementById('nationName').value.trim() || 'Saaremaa';
  const startPop = parseInt(document.getElementById('startPop').value);

  simState = {
    name,
    year:     1,
    gdp:      12000,
    pop:      startPop,
    happy:    50,
    debt:     30,
    maxYears: 50,
  };

  chartData = { years: [], gdp: [], happy: [], pop: [] };

  document.getElementById('setupPanel').classList.add('hidden');
  document.getElementById('simPanel').classList.remove('hidden');
  document.getElementById('simNationName').textContent = '🏛️ ' + name;
  document.getElementById('finalCard').classList.add('hidden');
  document.getElementById('eventLog').innerHTML = '';

  initCharts();
  updateDisplay();

  simTicker = setInterval(simulateYear, 800);
}

function simulateYear() {
  if (simState.year > simState.maxYears) {
    clearInterval(simTicker);
    showFinalResult();
    return;
  }

  const p = policies;

  // GDP growth formula
  let gdpGrowth = 1.5; // base %
  gdpGrowth += (p.bureaucracy - 50) * 0.05;
  gdpGrowth += (50 - p.tax) * 0.04;
  gdpGrowth += (p.education - 50) * 0.03;
  gdpGrowth += (p.immigration - 50) * 0.02;
  gdpGrowth -= p.military * 0.1;
  gdpGrowth = Math.max(-5, Math.min(12, gdpGrowth));
  simState.gdp = Math.round(simState.gdp * (1 + gdpGrowth / 100));

  // Population growth
  let popGrowth = 0.3;
  popGrowth += (p.immigration - 50) * 0.04;
  popGrowth += (p.healthcare - 50) * 0.02;
  popGrowth -= Math.max(0, p.tax - 40) * 0.01;
  popGrowth = Math.max(-2, Math.min(5, popGrowth));
  simState.pop = Math.round(simState.pop * (1 + popGrowth / 100));

  // Happiness
  let happyDelta = 0;
  happyDelta += (p.healthcare - 50) * 0.08;
  happyDelta += (p.education  - 50) * 0.06;
  happyDelta += (p.environment- 50) * 0.04;
  happyDelta -= Math.abs(p.housing - 50) * 0.02;
  happyDelta -= p.military * 0.05;
  happyDelta -= Math.max(0, p.tax - 45) * 0.03;
  simState.happy = Math.max(0, Math.min(100, simState.happy + happyDelta));

  // Debt
  const spending = p.healthcare * 0.1 + p.education * 0.08 + p.military * 2;
  const revenue  = p.tax * 0.9;
  simState.debt  = Math.max(0, Math.min(200, simState.debt + (spending - revenue) * 0.05));

  // Random events (fire every ~5 years, condition-based)
  if (simState.year % 5 === 0 || Math.random() < 0.08) {
    fireEvent();
  }

  // Update chart data
  chartData.years.push(simState.year);
  chartData.gdp.push(simState.gdp);
  chartData.happy.push(Math.round(simState.happy));
  chartData.pop.push(Math.round(simState.pop / 1000));

  updateCharts();
  updateDisplay();

  simState.year++;
}

function fireEvent() {
  const eligible = EVENTS.filter(e => e.condition(policies));
  if (!eligible.length) return;

  const ev = eligible[Math.floor(Math.random() * eligible.length)];

  simState.gdp   = Math.max(1000, Math.round(simState.gdp   * (1 + ev.gdp   / 100)));
  simState.happy = Math.max(0, Math.min(100, simState.happy + ev.happy));
  simState.pop   = Math.max(1000, Math.round(simState.pop   * (1 + ev.pop   / 100)));

  const log    = document.getElementById('eventLog');
  const color  = ev.gdp > 0 ? 'border-emerald-500/30 bg-emerald-900/20' : 'border-rose-500/30 bg-rose-900/20';
  const entry  = document.createElement('div');
  entry.className = `p-3 rounded-xl border ${color} text-sm`;
  entry.innerHTML = `<span class="font-mono text-slate-400 text-xs">Year ${simState.year} — </span>${ev.text}`;
  log.insertBefore(entry, log.firstChild);
}

// ---- DISPLAY ----
function formatNum(n) {
  if (n >= 1000000) return (n/1000000).toFixed(1) + 'M';
  if (n >= 1000)    return (n/1000).toFixed(0) + 'k';
  return n;
}

function getGrade() {
  const score = simState.gdp / 1000 * 0.3
    + simState.happy * 0.4
    + (100 - simState.debt) * 0.2
    + Math.min(100, simState.pop / 10000) * 0.1;

  if (score > 90) return { grade: 'S', color: 'text-emerald-300' };
  if (score > 75) return { grade: 'A', color: 'text-lime-300'    };
  if (score > 55) return { grade: 'B', color: 'text-yellow-300'  };
  if (score > 35) return { grade: 'C', color: 'text-orange-300'  };
  return                  { grade: 'F', color: 'text-red-400'     };
}

function updateDisplay() {
  document.getElementById('simYear').textContent   = `Year ${simState.year} of ${simState.maxYears}`;
  document.getElementById('statGDP').textContent   = '€' + formatNum(simState.gdp);
  document.getElementById('statPop').textContent   = formatNum(simState.pop);
  document.getElementById('statHappy').textContent = Math.round(simState.happy) + '/100';
  document.getElementById('statDebt').textContent  = Math.round(simState.debt)  + '%';

  const g = getGrade();
  const gradeEl = document.getElementById('gradeDisplay');
  gradeEl.textContent  = g.grade;
  gradeEl.className    = 'text-6xl font-black ' + g.color;
}

// ---- CHARTS ----
function initCharts() {
  const defaults = {
    type: 'line',
    options: {
      responsive: true,
      animation: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: '#64748b', font: { size: 10 } }, grid: { color: '#ffffff08' } },
        y: { ticks: { color: '#64748b', font: { size: 10 } }, grid: { color: '#ffffff08' } }
      }
    }
  };

  ['GDP','Happy','Pop'].forEach(name => {
    const ctx = document.getElementById('chart' + name);
    if (charts[name]) charts[name].destroy();
    charts[name] = new Chart(ctx, {
      ...defaults,
      data: {
        labels: [],
        datasets: [{
          data: [],
          borderColor: name === 'GDP' ? '#34d399' : name === 'Happy' ? '#fbbf24' : '#60a5fa',
          borderWidth: 2,
          fill: true,
          backgroundColor: name === 'GDP' ? '#34d39915' : name === 'Happy' ? '#fbbf2415' : '#60a5fa15',
          tension: 0.4,
          pointRadius: 0,
        }]
      },
      options: {
        ...defaults.options,
        plugins: {
          ...defaults.options.plugins,
          title: {
            display: true,
            text: name === 'GDP' ? '💰 GDP per capita (€)' : name === 'Happy' ? '😊 Happiness (0-100)' : '👥 Population (thousands)',
            color: '#94a3b8',
            font: { size: 11 }
          }
        }
      }
    });
  });
}

function updateCharts() {
  charts.GDP.data.labels            = chartData.years;
  charts.GDP.data.datasets[0].data  = chartData.gdp;
  charts.Happy.data.labels          = chartData.years;
  charts.Happy.data.datasets[0].data = chartData.happy;
  charts.Pop.data.labels            = chartData.years;
  charts.Pop.data.datasets[0].data  = chartData.pop;

  charts.GDP.update('none');
  charts.Happy.update('none');
  charts.Pop.update('none');
}

// ---- FINAL RESULT ----
function showFinalResult() {
  const g = getGrade();
  document.getElementById('finalCard').classList.remove('hidden');
  document.getElementById('finalCard').scrollIntoView({ behavior: 'smooth' });

  const comparisons = {
    S: 'Better than Singapore 🇸🇬 — a true utopia.',
    A: 'Comparable to Nordic countries 🇸🇪 — exceptional governance.',
    B: 'Similar to Germany 🇩🇪 — solid but room to improve.',
    C: 'Around the EU average 🇪🇺 — needs reforms.',
    F: 'Struggling — major policy overhaul needed 🔴',
  };

  document.getElementById('finalStats').innerHTML = `
    <div class="text-center py-4">
      <span class="text-7xl font-black ${g.color}">${g.grade}</span>
      <div class="text-slate-300 mt-2 font-semibold">${comparisons[g.grade]}</div>
    </div>
    <div class="grid grid-cols-2 gap-3">
      <div class="bg-white/5 rounded-2xl p-4 text-center">
        <div class="text-2xl font-black text-emerald-300">€${formatNum(simState.gdp)}</div>
        <div class="text-xs text-slate-400 mt-1">Final GDP/capita</div>
      </div>
      <div class="bg-white/5 rounded-2xl p-4 text-center">
        <div class="text-2xl font-black text-yellow-300">${Math.round(simState.happy)}/100</div>
        <div class="text-xs text-slate-400 mt-1">Final happiness</div>
      </div>
      <div class="bg-white/5 rounded-2xl p-4 text-center">
        <div class="text-2xl font-black text-blue-300">${formatNum(simState.pop)}</div>
        <div class="text-xs text-slate-400 mt-1">Final population</div>
      </div>
      <div class="bg-white/5 rounded-2xl p-4 text-center">
        <div class="text-2xl font-black text-rose-300">${Math.round(simState.debt)}%</div>
        <div class="text-xs text-slate-400 mt-1">Debt/GDP</div>
      </div>
    </div>
  `;
}

// ---- SHARE ----
function shareNation() {
  const payload = { name: simState.name, policies };
  const b64  = btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
  const url  = location.origin + location.pathname + '#n=' + encodeURIComponent(b64);
  navigator.clipboard.writeText(url)
    .then(() => alert('✅ Nation config copied! Share it and see how others do with your policies.'))
    .catch(() => prompt('Copy this:', url));
}

function resetSim() {
  clearInterval(simTicker);
  document.getElementById('simPanel').classList.add('hidden');
  document.getElementById('setupPanel').classList.remove('hidden');
}

// ---- LOAD FROM HASH ----
const match = location.hash.match(/#n=([^&]+)/);
if (match) {
  try {
    const d = JSON.parse(decodeURIComponent(escape(atob(decodeURIComponent(match[1])))));
    if (d.name) document.getElementById('nationName').value = d.name;
    if (d.policies) {
      Object.assign(policies, d.policies);
      Object.entries(d.policies).forEach(([id, val]) => {
        const slider = document.getElementById('slider_' + id);
        const policy = POLICIES.find(p => p.id === id);
        if (slider) slider.value = val;
        if (policy) document.getElementById('val_' + id).textContent = val + policy.unit;
      });
    }
  } catch {}
}

// ---- INIT ----
buildSliders();
