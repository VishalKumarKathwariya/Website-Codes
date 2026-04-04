/* ── Nexus Dashboard — script.js ────────────────────── */

'use strict';

/* ── Sidebar Toggle ──────────────────────────────────── */
const sidebar   = document.getElementById('sidebar');
const overlay   = document.getElementById('overlay');
const hamburger = document.getElementById('hamburger');
const sidebarClose = document.getElementById('sidebarClose');

function openSidebar() {
  sidebar.classList.add('open');
  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}
function closeSidebar() {
  sidebar.classList.remove('open');
  overlay.classList.remove('active');
  document.body.style.overflow = '';
}

hamburger.addEventListener('click', openSidebar);
sidebarClose.addEventListener('click', closeSidebar);
overlay.addEventListener('click', closeSidebar);

/* Nav active state */
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', e => {
    e.preventDefault();
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    item.classList.add('active');
    if (window.innerWidth <= 640) closeSidebar();
  });
});

/* ── Animated Counters ───────────────────────────────── */
function animateCounter(el) {
  const target  = parseFloat(el.dataset.target);
  const prefix  = el.dataset.prefix  || '';
  const suffix  = el.dataset.suffix  || '';
  const isFloat = !Number.isInteger(target);
  const duration = 1400;
  const start = performance.now();

  function step(now) {
    const progress = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    const current = target * ease;

    let display;
    if (isFloat) {
      display = current.toFixed(2);
    } else if (target > 9999) {
      display = Math.round(current).toLocaleString();
    } else {
      display = Math.round(current).toString();
    }

    el.textContent = prefix + display + suffix;
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

/* Trigger counters when visible */
const counterObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounter(entry.target);
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });

document.querySelectorAll('.metric-value[data-target]').forEach(el => {
  counterObserver.observe(el);
});

/* ── Chart Defaults ──────────────────────────────────── */
Chart.defaults.font.family = "'Outfit', sans-serif";
Chart.defaults.color = '#555b6e';

/* ── Revenue / Users / Orders Data ──────────────────── */
const chartDatasets = {
  revenue: {
    labels: ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'],
    actual:  [41200, 47800, 52300, 61800, 58900, 67400, 74100, 84291],
    target:  [45000, 50000, 55000, 65000, 63000, 70000, 78000, 88000],
    yFormatter: v => '$' + (v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v),
    tooltipFmt: v => '$' + v.toLocaleString(),
  },
  users: {
    labels: ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'],
    actual:  [14200, 15800, 17100, 18900, 19700, 21200, 23100, 24819],
    target:  [15000, 17000, 18000, 20000, 21000, 22500, 24000, 26000],
    yFormatter: v => v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v,
    tooltipFmt: v => v.toLocaleString() + ' users',
  },
  orders: {
    labels: ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'],
    actual:  [820, 940, 1010, 1280, 1150, 1340, 1390, 1438],
    target:  [900, 1000, 1100, 1300, 1250, 1400, 1450, 1500],
    yFormatter: v => v.toLocaleString(),
    tooltipFmt: v => v.toLocaleString() + ' orders',
  }
};

/* ── Revenue Line Chart ─────────────────────────────── */
const revCtx = document.getElementById('revenueChart').getContext('2d');

let currentDataKey = 'revenue';
let revenueChart;

function buildGradient(ctx, color, alpha1, alpha2) {
  const grad = ctx.createLinearGradient(0, 0, 0, 260);
  grad.addColorStop(0, color.replace(')', `, ${alpha1})`).replace('rgb', 'rgba'));
  grad.addColorStop(1, color.replace(')', `, ${alpha2})`).replace('rgb', 'rgba'));
  return grad;
}

function createRevenueChart(key) {
  const d = chartDatasets[key];
  if (revenueChart) revenueChart.destroy();

  const blueGrad = revCtx.createLinearGradient(0, 0, 0, 260);
  blueGrad.addColorStop(0, 'rgba(79,156,249,0.18)');
  blueGrad.addColorStop(1, 'rgba(79,156,249,0)');

  revenueChart = new Chart(revCtx, {
    type: 'line',
    data: {
      labels: d.labels,
      datasets: [
        {
          label: 'Actual',
          data: d.actual,
          borderColor: '#4f9cf9',
          backgroundColor: blueGrad,
          borderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: '#4f9cf9',
          pointBorderColor: '#0c0e13',
          pointBorderWidth: 2,
          tension: 0.42,
          fill: true,
        },
        {
          label: 'Target',
          data: d.target,
          borderColor: '#a78bfa',
          backgroundColor: 'transparent',
          borderWidth: 1.5,
          borderDash: [5, 4],
          pointRadius: 0,
          pointHoverRadius: 4,
          pointBackgroundColor: '#a78bfa',
          tension: 0.42,
          fill: false,
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#1c1f2a',
          borderColor: 'rgba(255,255,255,0.1)',
          borderWidth: 1,
          padding: 10,
          titleColor: '#e8eaf0',
          bodyColor: '#8b90a0',
          titleFont: { size: 12, weight: '600' },
          bodyFont: { size: 12 },
          callbacks: {
            title: items => items[0].label,
            label: ctx => {
              const label = ctx.dataset.label || '';
              return `  ${label}: ${d.tooltipFmt(ctx.raw)}`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          border: { display: false },
          ticks: {
            color: '#555b6e',
            font: { size: 11.5 },
          }
        },
        y: {
          grid: {
            color: 'rgba(255,255,255,0.04)',
            drawBorder: false,
          },
          border: { display: false, dash: [3, 3] },
          ticks: {
            color: '#555b6e',
            font: { size: 11 },
            maxTicksLimit: 5,
            callback: v => d.yFormatter(v),
          }
        }
      }
    }
  });
}

createRevenueChart('revenue');

/* Tab switching */
document.getElementById('revenueTabs').addEventListener('click', e => {
  const tab = e.target.closest('.tab');
  if (!tab) return;
  document.querySelectorAll('#revenueTabs .tab').forEach(t => t.classList.remove('active'));
  tab.classList.add('active');
  currentDataKey = tab.dataset.chart;
  createRevenueChart(currentDataKey);
});

/* ── Donut Chart ────────────────────────────────────── */
const donutCtx = document.getElementById('donutChart').getContext('2d');

new Chart(donutCtx, {
  type: 'doughnut',
  data: {
    labels: ['Organic Search', 'Direct', 'Referral', 'Paid Ads'],
    datasets: [{
      data: [42, 28, 18, 12],
      backgroundColor: ['#4f9cf9', '#34d399', '#f59e0b', '#a78bfa'],
      borderColor: '#161820',
      borderWidth: 3,
      hoverOffset: 6,
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '72%',
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1c1f2a',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        padding: 10,
        titleColor: '#e8eaf0',
        bodyColor: '#8b90a0',
        titleFont: { size: 12, weight: '600' },
        bodyFont: { size: 12 },
        callbacks: {
          label: ctx => `  ${ctx.label}: ${ctx.raw}%`
        }
      }
    }
  }
});

/* ── Channel Bars Animation ─────────────────────────── */
function animateChannelBars() {
  document.querySelectorAll('.channel-fill').forEach(bar => {
    const target = bar.style.width;
    bar.style.width = '0%';
    setTimeout(() => { bar.style.width = target; }, 200);
  });
}

const barObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateChannelBars();
      barObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.2 });

const channelList = document.querySelector('.channels-list');
if (channelList) barObserver.observe(channelList);

/* ── Live Activity Feed ─────────────────────────────── */
const activityData = [
  { icon: 'success', title: 'New signup',       desc: 'alex@company.io · Pro Plan',    time: 'just now' },
  { icon: 'info',    title: 'Plan upgrade',      desc: 'Starter → Team plan',           time: '2m ago' },
  { icon: 'warning', title: 'Payment retry',     desc: 'chloe@growth.fr · $299',        time: '9m ago' },
  { icon: 'purple',  title: 'New project',       desc: 'marco@corp.eu · API v2',        time: '21m ago' },
  { icon: 'success', title: 'Payment received',  desc: 'dev@buildfast.in · $49',        time: '34m ago' },
  { icon: 'info',    title: 'New signup',        desc: 'nina@startup.de · Starter',     time: '1h ago' },
  { icon: 'warning', title: 'Trial expiring',    desc: 'sara@designlabs.co in 2 days',  time: '1h ago' },
];

const iconSVGs = {
  success: `<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8"><polyline points="3,8 6,11 13,4"/></svg>`,
  info:    `<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M8 3v10M3 8l5-5 5 5"/></svg>`,
  warning: `<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="8" cy="8" r="6"/><line x1="8" y1="5" x2="8" y2="9"/><circle cx="8" cy="11.5" r=".5" fill="currentColor"/></svg>`,
  purple:  `<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="4" width="10" height="8" rx="1"/><path d="M6 4V3a1 1 0 011-1h2a1 1 0 011 1v1"/></svg>`,
};

let activityIndex = 0;
const activityList = document.getElementById('activityList');

function addActivityItem() {
  const item = activityData[activityIndex % activityData.length];
  activityIndex++;

  const el = document.createElement('div');
  el.className = 'activity-item';
  el.style.opacity = '0';
  el.style.transform = 'translateX(-8px)';
  el.style.transition = 'opacity .3s ease, transform .3s ease';

  el.innerHTML = `
    <div class="activity-icon activity-icon--${item.icon}">${iconSVGs[item.icon]}</div>
    <div class="activity-body">
      <span class="activity-name">${item.title}</span>
      <span class="activity-desc">${item.desc}</span>
    </div>
    <span class="activity-time">${item.time}</span>
  `;

  activityList.insertBefore(el, activityList.firstChild);

  requestAnimationFrame(() => {
    el.style.opacity = '1';
    el.style.transform = 'translateX(0)';
  });

  /* Remove last if more than 5 */
  const items = activityList.querySelectorAll('.activity-item');
  if (items.length > 5) {
    const last = items[items.length - 1];
    last.style.opacity = '0';
    last.style.transform = 'translateX(8px)';
    setTimeout(() => last.remove(), 300);
  }
}

/* Simulate live feed every 5–9 seconds */
function scheduleActivity() {
  const delay = 5000 + Math.random() * 4000;
  setTimeout(() => {
    addActivityItem();
    scheduleActivity();
  }, delay);
}
scheduleActivity();

/* ── Search keyboard shortcut ───────────────────────── */
document.addEventListener('keydown', e => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault();
    document.querySelector('.search-input').focus();
  }
  if (e.key === 'Escape') {
    document.querySelector('.search-input').blur();
    closeSidebar();
  }
});

/* ── Notification button ────────────────────────────── */
document.getElementById('notifBtn').addEventListener('click', () => {
  const dot = document.querySelector('.notif-dot');
  if (dot) dot.style.display = 'none';
});

/* ── Responsive chart resize ────────────────────────── */
window.addEventListener('resize', () => {
  if (revenueChart) revenueChart.resize();
});

/* ── Tooltip-style title for truncated text ─────────── */
document.querySelectorAll('.activity-desc, .customer-email').forEach(el => {
  el.title = el.textContent.trim();
});