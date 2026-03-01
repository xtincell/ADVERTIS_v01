/**
 * AMARA Strategic Interface - Data Visualizations
 * Chart.js-based visualizations for metrics, timelines, and data
 */

/**
 * METRIC CARD - Animated number counter
 */
function animateMetric(element, target, duration = 2000) {
  const start = 0;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Easing function (easeOutCubic)
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = start + (target - start) * eased;

    element.textContent = formatNumber(Math.floor(current));

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      element.textContent = formatNumber(target);
    }
  }

  requestAnimationFrame(update);
}

function formatNumber(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

/**
 * KPI CARD - with trend indicator
 */
function createKPICard(options) {
  const {
    container,
    label,
    value,
    trend,
    trendValue,
    icon = '📊'
  } = options;

  const trendClass = trend === 'up' ? 'positive' : trend === 'down' ? 'negative' : '';
  const trendIcon = trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→';

  const html = `
    <div class="stat-card">
      <div class="stat-label">${icon} ${label}</div>
      <div class="stat-value">${value}</div>
      ${trendValue ? `<div class="stat-change ${trendClass}">${trendIcon} ${trendValue}</div>` : ''}
    </div>
  `;

  if (typeof container === 'string') {
    document.querySelector(container).innerHTML += html;
  } else {
    container.innerHTML += html;
  }
}

/**
 * BAR CHART - Budget breakdown, comparisons
 */
async function createBarChart(canvasId, data, options = {}) {
  // Wait for Chart.js to load
  if (typeof Chart === 'undefined') {
    console.warn('Chart.js not loaded. Including CDN...');
    await loadChartJS();
  }

  const canvas = document.getElementById(canvasId);
  if (!canvas) {
    console.error(`Canvas #${canvasId} not found`);
    return null;
  }

  const ctx = canvas.getContext('2d');

  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: options.showLegend !== false,
        position: 'top'
      },
      title: {
        display: !!options.title,
        text: options.title || '',
        font: { size: 16, weight: 'bold' }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return options.format === 'currency' ? '$' + formatNumber(value) : formatNumber(value);
          }
        }
      }
    }
  };

  return new Chart(ctx, {
    type: 'bar',
    data: data,
    options: { ...defaultOptions, ...options.chartOptions }
  });
}

/**
 * LINE CHART - Performance over time
 */
async function createLineChart(canvasId, data, options = {}) {
  if (typeof Chart === 'undefined') {
    await loadChartJS();
  }

  const canvas = document.getElementById(canvasId);
  if (!canvas) {
    console.error(`Canvas #${canvasId} not found`);
    return null;
  }

  const ctx = canvas.getContext('2d');

  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: options.showLegend !== false,
        position: 'top'
      },
      title: {
        display: !!options.title,
        text: options.title || '',
        font: { size: 16, weight: 'bold' }
      }
    },
    scales: {
      y: {
        beginAtZero: options.beginAtZero !== false,
        ticks: {
          callback: function(value) {
            return options.format === 'currency' ? '$' + formatNumber(value) :
                   options.format === 'percent' ? value + '%' :
                   formatNumber(value);
          }
        }
      }
    },
    interaction: {
      mode: 'index',
      intersect: false
    }
  };

  return new Chart(ctx, {
    type: 'line',
    data: data,
    options: { ...defaultOptions, ...options.chartOptions }
  });
}

/**
 * DONUT/PIE CHART - Market share, budget distribution
 */
async function createDonutChart(canvasId, data, options = {}) {
  if (typeof Chart === 'undefined') {
    await loadChartJS();
  }

  const canvas = document.getElementById(canvasId);
  if (!canvas) {
    console.error(`Canvas #${canvasId} not found`);
    return null;
  }

  const ctx = canvas.getContext('2d');

  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: options.showLegend !== false,
        position: 'right'
      },
      title: {
        display: !!options.title,
        text: options.title || '',
        font: { size: 16, weight: 'bold' }
      }
    }
  };

  return new Chart(ctx, {
    type: options.donut === false ? 'pie' : 'doughnut',
    data: data,
    options: { ...defaultOptions, ...options.chartOptions }
  });
}

/**
 * TIMELINE - Gantt-style timeline visualization
 */
function createTimeline(containerId, events, options = {}) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container #${containerId} not found`);
    return;
  }

  const startDate = new Date(options.startDate || events[0].start);
  const endDate = new Date(options.endDate || events[events.length - 1].end);
  const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

  let html = '<div class="timeline-container" style="position: relative; height: ' + (events.length * 60) + 'px; margin: 2rem 0;">';

  // Time axis
  html += '<div class="timeline-axis" style="display: flex; justify-content: space-between; margin-bottom: 1rem; font-size: 0.75rem; color: var(--text-tertiary);">';
  for (let i = 0; i <= 12; i++) {
    const monthDate = new Date(startDate);
    monthDate.setMonth(monthDate.getMonth() + i);
    html += `<span>M${i}</span>`;
  }
  html += '</div>';

  // Events
  events.forEach((event, index) => {
    const eventStart = new Date(event.start);
    const eventEnd = new Date(event.end);
    const startDays = Math.ceil((eventStart - startDate) / (1000 * 60 * 60 * 24));
    const durationDays = Math.ceil((eventEnd - eventStart) / (1000 * 60 * 60 * 24));

    const left = (startDays / totalDays) * 100;
    const width = (durationDays / totalDays) * 100;
    const top = index * 60;

    const color = event.color || 'var(--primary)';

    html += `
      <div class="timeline-event" style="
        position: absolute;
        left: ${left}%;
        width: ${width}%;
        top: ${top}px;
        height: 40px;
        background: ${color};
        border-radius: 4px;
        padding: 8px 12px;
        color: white;
        font-size: 0.875rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      " title="${event.description || ''}">
        ${event.title}
      </div>
    `;
  });

  html += '</div>';
  container.innerHTML = html;

  // Add hover effect
  container.querySelectorAll('.timeline-event').forEach(el => {
    el.addEventListener('mouseenter', () => {
      el.style.transform = 'translateY(-2px)';
      el.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
    });
    el.addEventListener('mouseleave', () => {
      el.style.transform = 'translateY(0)';
      el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
    });
  });
}

/**
 * PROGRESS BAR - Milestone completion
 */
function createProgressBar(containerId, value, options = {}) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container #${containerId} not found`);
    return;
  }

  const percentage = Math.min(Math.max(value, 0), 100);
  const color = options.color || 'var(--primary)';
  const label = options.label || '';
  const showPercentage = options.showPercentage !== false;

  const html = `
    <div class="progress-bar-container" style="margin: 1rem 0;">
      ${label ? `<div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.875rem;">
        <span>${label}</span>
        ${showPercentage ? `<span style="font-weight: 600;">${percentage}%</span>` : ''}
      </div>` : ''}
      <div style="
        width: 100%;
        height: ${options.height || 8}px;
        background: var(--surface-2);
        border-radius: 999px;
        overflow: hidden;
      ">
        <div style="
          width: ${percentage}%;
          height: 100%;
          background: ${color};
          transition: width 1s ease-out;
          border-radius: 999px;
        "></div>
      </div>
    </div>
  `;

  container.innerHTML = html;
}

/**
 * METRIC COMPARISON - Side-by-side comparison
 */
function createMetricComparison(containerId, metrics) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container #${containerId} not found`);
    return;
  }

  const html = `
    <div class="metric-comparison" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; margin: 2rem 0;">
      ${metrics.map(metric => `
        <div class="comparison-item" style="
          padding: 1.5rem;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 12px;
          text-align: center;
          transition: all 0.2s;
        ">
          <div style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-tertiary); margin-bottom: 0.5rem;">
            ${metric.label}
          </div>
          <div style="font-size: 2rem; font-weight: 700; color: ${metric.color || 'var(--primary)'}; margin-bottom: 0.5rem;">
            ${metric.value}
          </div>
          ${metric.change ? `
            <div style="font-size: 0.875rem; color: ${metric.change > 0 ? 'var(--success)' : 'var(--error)'};">
              ${metric.change > 0 ? '↑' : '↓'} ${Math.abs(metric.change)}%
            </div>
          ` : ''}
        </div>
      `).join('')}
    </div>
  `;

  container.innerHTML = html;

  // Add hover effect
  container.querySelectorAll('.comparison-item').forEach(el => {
    el.addEventListener('mouseenter', () => {
      el.style.transform = 'translateY(-4px)';
      el.style.boxShadow = 'var(--shadow-lg)';
    });
    el.addEventListener('mouseleave', () => {
      el.style.transform = 'translateY(0)';
      el.style.boxShadow = 'none';
    });
  });
}

/**
 * LOAD CHART.JS CDN
 */
async function loadChartJS() {
  if (typeof Chart !== 'undefined') return;

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js';
    script.onload = () => {
      console.log('✅ Chart.js loaded');
      resolve();
    };
    script.onerror = () => reject(new Error('Failed to load Chart.js'));
    document.head.appendChild(script);
  });
}

// Export functions
if (typeof window !== 'undefined') {
  window.Visualizations = {
    animateMetric,
    createKPICard,
    createBarChart,
    createLineChart,
    createDonutChart,
    createTimeline,
    createProgressBar,
    createMetricComparison,
    loadChartJS
  };
}
