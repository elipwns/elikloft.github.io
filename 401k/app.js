'use strict';

// ── Contribution dates (from 401k CSV, 2019–2026) ─────────────────────────
const CONTRIBUTION_DATES = [
  '2019-08-15','2019-08-30','2019-09-13','2019-09-30','2019-10-15','2019-10-31',
  '2019-11-15','2019-11-29','2019-12-13','2019-12-31',
  '2020-01-21','2020-02-03','2020-02-18','2020-02-28','2020-03-13','2020-03-31',
  '2020-04-16','2020-04-30','2020-05-15','2020-05-29','2020-06-17','2020-06-30',
  '2020-07-15','2020-07-31','2020-08-14','2020-09-02','2020-09-15','2020-10-01',
  '2020-10-15','2020-10-30','2020-11-13','2020-11-30','2020-12-15','2020-12-31',
  '2021-01-15','2021-01-29','2021-02-16','2021-02-26','2021-03-15','2021-03-31',
  '2021-04-15','2021-04-30','2021-05-14','2021-05-28','2021-06-08','2021-06-15',
  '2021-06-30','2021-07-15','2021-07-30','2021-08-13','2021-08-31','2021-09-15',
  '2021-09-30','2021-10-15','2021-10-29','2021-11-15','2021-11-30','2021-12-15',
  '2021-12-31',
  '2022-01-20','2022-01-28','2022-02-15','2022-02-28','2022-03-15','2022-03-31',
  '2022-04-19','2022-05-03','2022-05-05','2022-05-16','2022-05-31','2022-06-15',
  '2022-06-30','2022-07-15','2022-07-29','2022-08-15','2022-09-01','2022-09-15',
  '2022-09-30','2022-10-14','2022-10-31','2022-11-15','2022-11-30','2022-12-15',
  '2022-12-30',
  '2023-01-13','2023-01-31','2023-02-17','2023-02-28','2023-03-15','2023-03-31',
  '2023-04-04','2023-04-17','2023-05-01','2023-05-15','2023-05-31','2023-06-20',
  '2023-06-30','2023-07-14','2023-07-31','2023-08-15','2023-08-31','2023-09-18',
  '2023-09-29','2023-10-13','2023-10-31','2023-11-15','2023-11-30','2023-12-15',
  '2023-12-29',
  '2024-01-16','2024-01-31','2024-02-15','2024-02-29','2024-03-15','2024-03-22',
  '2024-04-01','2024-04-15','2024-04-30','2024-05-15','2024-05-31','2024-06-17',
  '2024-06-28','2024-07-15','2024-07-31','2024-08-15','2024-08-30','2024-09-13',
  '2024-09-27','2024-10-16','2024-10-31','2024-11-15','2024-12-05','2024-12-13',
  '2024-12-31',
  '2025-01-15','2025-01-31','2025-02-14','2025-02-28','2025-03-14','2025-03-28',
  '2025-04-15','2025-04-23','2025-04-30','2025-05-15','2025-05-30','2025-06-13',
  '2025-06-30','2025-07-15','2025-07-31','2025-08-15','2025-08-29','2025-09-15',
  '2025-09-30','2025-10-15','2025-10-31','2025-11-14','2025-12-05','2025-12-16',
  '2025-12-29',
  '2026-01-20','2026-01-30','2026-02-13','2026-03-02','2026-03-13','2026-03-31',
  '2026-04-14','2026-04-16',
];

const TRUMP2_START = '2025-01-20';

// Presidential terms (background bands)
const TERMS = [
  { start: '2017-01-20', end: '2021-01-20', label: 'Trump 1', color: 'rgba(220,80,50,0.07)' },
  { start: '2021-01-20', end: '2025-01-20', label: 'Biden',   color: 'rgba(60,120,220,0.07)' },
  { start: '2025-01-20', end: '2029-01-20', label: 'Trump 2', color: 'rgba(220,80,50,0.07)' },
];

// Key market / world events (vertical lines)
const EVENTS = [
  { date: '2020-03-23', label: 'COVID\nbottom',    color: 'rgba(63,185,80,0.55)' },
  { date: '2022-01-03', label: 'Fed\nhikes begin', color: 'rgba(210,153,34,0.55)' },
  { date: '2022-10-12', label: 'Bear mkt\nbottom', color: 'rgba(63,185,80,0.55)' },
  { date: '2023-03-10', label: 'SVB\ncollapse',    color: 'rgba(248,81,73,0.55)' },
  { date: '2024-11-05', label: 'Election\nDay',    color: 'rgba(210,153,34,0.55)' },
  { date: '2025-04-02', label: 'Liberation\nDay',  color: 'rgba(248,81,73,0.75)' },
];

function buildAnnotations() {
  const out = {};

  TERMS.forEach((t, i) => {
    out[`term_${i}`] = {
      type: 'box',
      xMin: t.start,
      xMax: t.end,
      backgroundColor: t.color,
      borderWidth: 0,
      label: {
        display: true,
        content: t.label,
        position: { x: 'center', y: 'start' },
        color: 'rgba(139,148,158,0.7)',
        font: { size: 9, weight: 'bold' },
        backgroundColor: 'transparent',
        yAdjust: 6,
      },
    };
  });

  EVENTS.forEach((e, i) => {
    out[`event_${i}`] = {
      type: 'line',
      scaleID: 'x',
      value: e.date,
      borderColor: e.color,
      borderWidth: 1,
      borderDash: [3, 3],
      label: {
        display: true,
        content: e.label.split('\n'),
        rotation: -90,
        position: 'start',
        color: 'rgba(200,210,220,0.85)',
        font: { size: 8 },
        backgroundColor: 'rgba(13,17,23,0.75)',
        padding: { x: 3, y: 2 },
        yAdjust: 12,
      },
    };
  });

  return out;
}

let charts = {};
let analysisData = [];
let priceEntries  = [];

// ── Load SPY from pre-fetched local JSON ──────────────────────────────────
async function fetchSPY() {
  const res = await fetch('spy-data.json');
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const raw = await res.json();
  return raw.map(([date, price]) => ({ date, price }));
}

// ── Price lookup helpers ──────────────────────────────────────────────────
function buildDateMap(entries) {
  const map = {};
  entries.forEach((e, i) => { map[e.date] = i; });
  return map;
}

function shiftDate(dateStr, days) {
  const d = new Date(dateStr + 'T12:00:00Z');
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function getPriceIndex(targetDate, dateMap) {
  if (dateMap[targetDate] !== undefined) return dateMap[targetDate];
  for (let delta = 1; delta <= 4; delta++) {
    const idx1 = dateMap[shiftDate(targetDate,  delta)];
    const idx2 = dateMap[shiftDate(targetDate, -delta)];
    if (idx1 !== undefined) return idx1;
    if (idx2 !== undefined) return idx2;
  }
  return null;
}

function windowAvg(idx, entries, N) {
  const start = Math.max(0, idx - N);
  const end   = Math.min(entries.length - 1, idx + N);
  let sum = 0, count = 0;
  for (let i = start; i <= end; i++) {
    if (i === idx) continue;
    sum += entries[i].price;
    count++;
  }
  return count > 0 ? sum / count : null;
}

// ── Core analysis ─────────────────────────────────────────────────────────
function analyze(entries, N) {
  const dateMap = buildDateMap(entries);
  const results = [];

  for (const cd of CONTRIBUTION_DATES) {
    const idx = getPriceIndex(cd, dateMap);
    if (idx === null) continue;

    const actualDate = entries[idx].date;
    const price      = entries[idx].price;
    const avg        = windowAvg(idx, entries, N);
    if (avg === null) continue;

    const deviation = ((price - avg) / avg) * 100;
    results.push({ date: cd, actualDate, price, avg, deviation });
  }

  return results;
}

// ── Dollar significance (z-test for proportion vs 50%) ───────────────────
function zTest(data) {
  const n    = data.length;
  const p    = data.filter(d => d.deviation > 0).length / n;
  const z    = (p - 0.5) / Math.sqrt(0.25 / n);
  // two-tailed p-value approximation
  const pval = 2 * (1 - normalCDF(Math.abs(z)));
  return { z, pval };
}

function normalCDF(x) {
  const t = 1 / (1 + 0.2316419 * x);
  const poly = t * (0.319381530 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
  return 1 - (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * x * x) * poly;
}

// ── Rolling 12-month average ──────────────────────────────────────────────
function computeRolling(data) {
  const sorted = [...data].sort((a, b) => a.date.localeCompare(b.date));
  return sorted.map((d, i) => {
    const cutoff = shiftDate(d.date, -365);
    const window = sorted.slice(0, i + 1).filter(x => x.date >= cutoff);
    const avg    = window.reduce((s, x) => s + x.deviation, 0) / window.length;
    return { date: d.date, avg, n: window.length };
  }).filter(d => d.n >= 4); // need enough data for meaningful avg
}

// ── Histogram bins ────────────────────────────────────────────────────────
function computeHistogram(data) {
  const BIN_WIDTH = 0.5;
  const MIN = -6, MAX = 6.5;
  const bins = [];
  for (let s = MIN; s < MAX; s += BIN_WIDTH) {
    bins.push({ start: s, end: s + BIN_WIDTH, count: 0, isHigh: s >= 0 });
  }
  let under = 0, over = 0;
  for (const d of data) {
    if (d.deviation < MIN) { under++; continue; }
    if (d.deviation >= MAX) { over++; continue; }
    const i = Math.floor((d.deviation - MIN) / BIN_WIDTH);
    if (bins[i]) bins[i].count++;
  }
  return { bins, under, over };
}

// ── Calendar grouping (by day-of-month) ──────────────────────────────────
function computeCalendar(data) {
  const groups = [
    { label: 'Mid-month\n(days 12–16)', days: d => d >= 12 && d <= 16, devs: [], amounts: 0 },
    { label: 'End-of-month\n(days 27–31)', days: d => d >= 27,         devs: [], amounts: 0 },
    { label: 'Other\n(catch-up / misc)', days: () => true,             devs: [], amounts: 0 },
  ];

  for (const d of data) {
    const day = new Date(d.date + 'T12:00:00Z').getUTCDate();
    const g   = groups.find(g => g.days(day)) ?? groups[2];
    g.devs.push(d.deviation);
    g.amounts += d.amount;
  }

  return groups
    .filter(g => g.devs.length > 0)
    .map(g => ({
      label:   g.label,
      avg:     g.devs.reduce((a, b) => a + b, 0) / g.devs.length,
      highPct: g.devs.filter(d => d > 0).length / g.devs.length * 100,
      count:   g.devs.length,
    }));
}

// ── Stat cards ────────────────────────────────────────────────────────────
function fmtPct(n) { return (n >= 0 ? '+' : '') + n.toFixed(2) + '%'; }

function updateStats(data) {
  if (!data.length) return;

  const devs     = data.map(d => d.deviation);
  const avgDev   = devs.reduce((a, b) => a + b, 0) / devs.length;
  const highDevs = devs.filter(d => d > 0);
  const lowDevs  = devs.filter(d => d <= 0);
  const pctHigh  = highDevs.length / devs.length * 100;
  const highMag  = highDevs.length ? highDevs.reduce((a, b) => a + b, 0) / highDevs.length : 0;
  const lowMag   = lowDevs.length  ? lowDevs.reduce((a, b)  => a + b, 0) / lowDevs.length  : 0;

  const recent    = data.filter(d => d.date >= TRUMP2_START);
  const recentAvg = recent.length ? recent.reduce((s, d) => s + d.deviation, 0) / recent.length : null;

  const { z, pval } = zTest(data);
  const sigLabel  = pval < 0.001 ? 'p < 0.001' : pval < 0.01 ? 'p < 0.01' : pval < 0.05 ? 'p < 0.05' : `p = ${pval.toFixed(3)}`;
  const sigColor  = pval < 0.05 ? 'red' : 'yellow';

  set('stat-avg-dev',  fmtPct(avgDev),            avgDev  > 0 ? 'red' : 'green');
  set('stat-pct-high', pctHigh.toFixed(1) + '%',  'red');
  set('stat-pct-low',  (100-pctHigh).toFixed(1) + '%', 'green');
  if (recentAvg !== null) set('stat-recent', fmtPct(recentAvg), recentAvg > 0 ? 'red' : 'green');
  set('stat-high-mag', '+' + highMag.toFixed(2) + '%', 'red');
  set('stat-low-mag',  lowMag.toFixed(2) + '%',        'green');
  set('stat-sig',      `z=${z.toFixed(2)}`, sigColor);
  document.getElementById('stat-sig-sub').textContent = sigLabel + (pval < 0.05 ? ' — significant' : ' — not significant');
}

function set(id, text, colorClass) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = text;
  el.className = 'stat-value' + (colorClass ? ' ' + colorClass : '');
}

// ── Chart 1: SPY line + scatter ───────────────────────────────────────────
function renderMainChart(entries, data) {
  const ctx    = document.getElementById('main-chart').getContext('2d');
  const xMin   = entries[0].date;
  const xMax   = entries[entries.length - 1].date;
  if (charts.main) charts.main.destroy();

  charts.main = new Chart(ctx, {
    type: 'line',
    data: {
      datasets: [
        {
          label: 'SPY',
          data: entries.map(e => ({ x: e.date, y: e.price })),
          borderColor: 'rgba(88,166,255,0.5)',
          borderWidth: 1.5,
          pointRadius: 0,
          tension: 0,
          fill: false,
          order: 3,
        },
        {
          label: 'Bought high',
          data: data.filter(d => d.deviation > 0).map(d => ({ x: d.actualDate, y: d.price, d })),
          type: 'scatter',
          pointRadius: 5,
          pointHoverRadius: 8,
          backgroundColor: 'rgba(248,81,73,0.85)',
          borderColor: 'rgba(248,81,73,0.3)',
          borderWidth: 1,
          order: 1,
        },
        {
          label: 'Bought low',
          data: data.filter(d => d.deviation <= 0).map(d => ({ x: d.actualDate, y: d.price, d })),
          type: 'scatter',
          pointRadius: 5,
          pointHoverRadius: 8,
          backgroundColor: 'rgba(63,185,80,0.85)',
          borderColor: 'rgba(63,185,80,0.3)',
          borderWidth: 1,
          order: 2,
        },
      ],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      interaction: { mode: 'nearest', intersect: false },
      plugins: {
        legend: { display: false },
        annotation: { annotations: buildAnnotations() },
        tooltip: {
          callbacks: {
            label(ctx) {
              const d = ctx.raw?.d;
              if (!d) return `SPY $${ctx.raw.y?.toFixed(2)}`;
              const sign = d.deviation >= 0 ? '+' : '';
              return [
                `Date: ${d.date}`,
                `SPY $${d.price.toFixed(2)}  |  window avg $${d.avg.toFixed(2)}`,
                `Deviation: ${sign}${d.deviation.toFixed(2)}%`,
              ];
            },
          },
        },
      },
      scales: {
        x: { type: 'time', min: xMin, max: xMax, time: { unit: 'month' }, grid: { color: '#21262d' }, ticks: { color: '#8b949e', maxRotation: 0, font: { size: 10 } } },
        y: { grid: { color: '#21262d' }, ticks: { color: '#8b949e', font: { size: 10 }, callback: v => '$' + v.toFixed(0) } },
      },
    },
  });
}

// ── Chart 2: deviation bars ───────────────────────────────────────────────
function renderDevChart(data, highlightTrump) {
  const ctx = document.getElementById('dev-chart').getContext('2d');
  if (charts.dev) charts.dev.destroy();

  charts.dev = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.map(d => d.date),
      datasets: [{
        data: data.map(d => d.deviation),
        backgroundColor: data.map(d => {
          const hi = highlightTrump && d.date >= TRUMP2_START;
          return d.deviation > 0
            ? (hi ? 'rgba(248,81,73,1)'  : 'rgba(248,81,73,0.45)')
            : (hi ? 'rgba(63,185,80,1)'  : 'rgba(63,185,80,0.45)');
        }),
        borderWidth: 0,
        barPercentage: 0.9,
      }],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label(ctx) {
              const d = data[ctx.dataIndex];
              return `${(d.deviation >= 0 ? '+' : '')}${d.deviation.toFixed(2)}% vs window avg`;
            },
          },
        },
      },
      scales: {
        x: { grid: { display: false }, ticks: { color: '#8b949e', font: { size: 8 }, maxTicksLimit: 18, maxRotation: 45 } },
        y: { grid: { color: '#21262d' }, ticks: { color: '#8b949e', font: { size: 10 }, callback: v => v.toFixed(1) + '%' } },
      },
    },
  });
}

// ── Chart 3: rolling 12-month average ────────────────────────────────────
function renderRollingChart(data) {
  const ctx     = document.getElementById('rolling-chart').getContext('2d');
  const rolling = computeRolling(data);
  if (charts.rolling) charts.rolling.destroy();

  const xMin = rolling[0].date;
  const xMax = rolling[rolling.length - 1].date;

  charts.rolling = new Chart(ctx, {
    type: 'line',
    data: {
      datasets: [
        {
          label: 'Rolling 12-mo avg deviation',
          data: rolling.map(r => ({ x: r.date, y: r.avg })),
          borderColor: '#58a6ff',
          borderWidth: 2,
          pointRadius: 2,
          tension: 0.3,
          fill: {
            target: { value: 0 },
            above: 'rgba(248,81,73,0.15)',
            below: 'rgba(63,185,80,0.15)',
          },
        },
        {
          label: 'Zero line',
          data: rolling.map(r => ({ x: r.date, y: 0 })),
          borderColor: 'rgba(139,148,158,0.4)',
          borderWidth: 1,
          borderDash: [4, 4],
          pointRadius: 0,
          fill: false,
        },
      ],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        annotation: { annotations: buildAnnotations() },
        tooltip: {
          callbacks: {
            label(ctx) {
              if (ctx.datasetIndex === 1) return null;
              const r = rolling[ctx.dataIndex];
              return `${fmtPct(ctx.raw.y)}  (based on ${r.n} contributions)`;
            },
          },
          filter: item => item.datasetIndex === 0,
        },
      },
      scales: {
        x: { type: 'time', min: xMin, max: xMax, time: { unit: 'month' }, grid: { color: '#21262d' }, ticks: { color: '#8b949e', maxRotation: 0, font: { size: 10 } } },
        y: { grid: { color: '#21262d' }, ticks: { color: '#8b949e', font: { size: 10 }, callback: v => v.toFixed(1) + '%' } },
      },
    },
  });
}

// ── Chart 4: histogram ────────────────────────────────────────────────────
function renderHistChart(data) {
  const ctx = document.getElementById('hist-chart').getContext('2d');
  const { bins } = computeHistogram(data);
  if (charts.hist) charts.hist.destroy();

  charts.hist = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: bins.map(b => (b.start >= 0 ? '+' : '') + b.start.toFixed(1) + '%'),
      datasets: [{
        data: bins.map(b => b.count),
        backgroundColor: bins.map(b => b.isHigh ? 'rgba(248,81,73,0.75)' : 'rgba(63,185,80,0.75)'),
        borderWidth: 0,
        barPercentage: 1.0,
        categoryPercentage: 1.0,
      }],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: ctx => `${ctx.raw} contributions` } },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#8b949e', font: { size: 9 }, maxRotation: 45, maxTicksLimit: 14 },
        },
        y: {
          grid: { color: '#21262d' },
          ticks: { color: '#8b949e', font: { size: 10 }, stepSize: 1 },
          title: { display: true, text: 'contributions', color: '#8b949e', font: { size: 9 } },
        },
      },
    },
  });
}

// ── Chart 5: calendar breakdown ───────────────────────────────────────────
function renderCalChart(data) {
  const ctx    = document.getElementById('cal-chart').getContext('2d');
  const groups = computeCalendar(data);
  if (charts.cal) charts.cal.destroy();

  charts.cal = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: groups.map(g => g.label),
      datasets: [
        {
          label: 'Avg deviation',
          data: groups.map(g => g.avg),
          backgroundColor: groups.map(g => g.avg > 0 ? 'rgba(248,81,73,0.75)' : 'rgba(63,185,80,0.75)'),
          borderWidth: 0,
          yAxisID: 'y',
        },
        {
          label: '% bought high',
          data: groups.map(g => g.highPct),
          backgroundColor: 'rgba(88,166,255,0.3)',
          borderColor: 'rgba(88,166,255,0.8)',
          borderWidth: 1.5,
          type: 'line',
          yAxisID: 'y2',
          pointRadius: 5,
          tension: 0.2,
        },
      ],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          labels: { color: '#8b949e', font: { size: 10 }, boxWidth: 12 },
        },
        tooltip: {
          callbacks: {
            afterLabel(ctx) {
              return `n = ${groups[ctx.dataIndex].count}`;
            },
          },
        },
      },
      scales: {
        x: { grid: { display: false }, ticks: { color: '#8b949e', font: { size: 10 } } },
        y: {
          position: 'left',
          grid: { color: '#21262d' },
          ticks: { color: '#8b949e', font: { size: 9 }, callback: v => v.toFixed(1) + '%' },
          title: { display: true, text: 'avg deviation', color: '#8b949e', font: { size: 9 } },
        },
        y2: {
          position: 'right',
          min: 0, max: 100,
          grid: { display: false },
          ticks: { color: '#58a6ff', font: { size: 9 }, callback: v => v + '%' },
          title: { display: true, text: '% bought high', color: '#58a6ff', font: { size: 9 } },
        },
      },
    },
  });
}

// ── Data table ────────────────────────────────────────────────────────────
function renderTable(data) {
  const tbody = document.querySelector('#data-table tbody');
  tbody.innerHTML = '';
  document.getElementById('table-count').textContent = `(${data.length} dates)`;

  [...data].reverse().forEach(d => {
    const high = d.deviation > 0;
    const sign = d.deviation >= 0 ? '+' : '';
    const tr   = document.createElement('tr');
    tr.className = high ? 'high' : 'low';
    tr.innerHTML = `
      <td>${d.date}</td>
      <td>$${d.price.toFixed(2)}</td>
      <td>$${d.avg.toFixed(2)}</td>
      <td>${sign}${d.deviation.toFixed(2)}%</td>
      <td class="${high ? 'badge-high' : 'badge-low'}">${high ? '↑ Bought high' : '↓ Bought low'}</td>
    `;
    tbody.appendChild(tr);
  });
}

// ── Re-run everything when window size changes ────────────────────────────
function reanalyze() {
  const N = parseInt(document.getElementById('window-select').value, 10);
  document.getElementById('window-label').textContent = N * 2;
  analysisData = analyze(priceEntries, N);
  const trump  = document.getElementById('toggle-trump').checked;

  updateStats(analysisData);
  renderMainChart(priceEntries, analysisData);
  renderDevChart(analysisData, trump);
  renderRollingChart(analysisData);
  renderHistChart(analysisData);
  renderCalChart(analysisData);
  renderTable(analysisData);
}

// ── Bootstrap ─────────────────────────────────────────────────────────────
async function init() {
  try {
    priceEntries = await fetchSPY();

    const latest = priceEntries[priceEntries.length - 1]?.date ?? '?';
    document.getElementById('status-dot').className   = 'status-dot ok';
    document.getElementById('status-text').textContent = `${priceEntries.length} trading days · updated ${latest}`;

    reanalyze();

    document.getElementById('window-select').addEventListener('change', reanalyze);
    document.getElementById('toggle-trump').addEventListener('change', () => {
      renderDevChart(analysisData, document.getElementById('toggle-trump').checked);
    });

  } catch (err) {
    console.error('Failed to load market data:', err);
    document.getElementById('status-dot').className   = 'status-dot err';
    document.getElementById('status-text').textContent = 'Data unavailable';
    document.getElementById('error-banner').classList.remove('hidden');
  }
}

document.addEventListener('DOMContentLoaded', init);
