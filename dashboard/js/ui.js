// dashboard/js/ui.js
// Handles all DOM manipulation and Chart rendering

let hourlyChartInstance = null;
let scatterChartInstance = null;

export function updateStatusBadge(connected, host) {
    const badge = document.getElementById('apiStatusBadge');
    if (!badge) return;

    if (connected) {
        badge.className = 'status-badge success';
        badge.style.background = 'rgba(34, 197, 94, 0.15)';
        badge.style.borderColor = 'rgba(34, 197, 94, 0.4)';
        badge.style.color = '#22c55e';
        badge.innerHTML = `🟢 LIVE API CONNECTED (${host.replace('http://','')})`;
    } else {
        badge.className = 'status-badge warning';
        badge.style.background = 'rgba(234, 179, 8, 0.15)';
        badge.style.borderColor = 'rgba(234, 179, 8, 0.4)';
        badge.style.color = '#eab308';
        badge.innerHTML = '🟡 SIMULATOR MODE (API Offline)';
    }
}

export function updateLivePredictionUI(data) {
    const pred = data.prediction;
    const src = data.source;
    const lat = data.latency_ms;
    const conf = (data.confidence * 100).toFixed(1);

    const gauge = document.getElementById('gaugeVal');
    const sourceTag = document.getElementById('predictSource');
    const latSpan = document.getElementById('predictLatency');
    const gBar = document.getElementById('gaugeBar');
    const logBox = document.getElementById('apiConsoleLog');

    if (gauge) {
        gauge.innerText = conf + '%';
        gauge.style.color = pred === 1 ? '#22c55e' : '#ef4444';
    }
    if (gBar) {
        gBar.style.width = conf + '%';
        gBar.style.background = pred === 1 ? '#22c55e' : '#ef4444';
    }
    if (sourceTag) sourceTag.innerText = src.toUpperCase();
    if (latSpan) latSpan.innerText = lat.toFixed(1) + ' ms';

    if (logBox) {
        const now = new Date().toLocaleTimeString();
        logBox.innerHTML = `[${now}] POST /predict ➔ <span style="color:#22c55e;">200 OK</span> (${lat.toFixed(1)}ms)<br>` +
                           `<span style="color:#a78bfa;">Source: ${src.toUpperCase()} | Prob: ${conf}%</span>`;
    }
}

export function updatePredictionOfflineUI(API_BASE_URL) {
    const gauge = document.getElementById('gaugeVal');
    const logBox = document.getElementById('apiConsoleLog');
    if (gauge) {
        gauge.innerText = 'API Offline';
        gauge.style.color = '#dc2626';
    }
    if (logBox) {
        logBox.innerHTML = `<span style="color:#dc2626;">API Error: Unable to connect to backend at ${API_BASE_URL}. Ensure uvicorn server is running.</span>`;
    }
}

export function renderDashboard(data) {
    const statusDiv = document.getElementById('uploadStatus');
    if (statusDiv) statusDiv.innerHTML = `🟢 Live Analysis Complete (${data.simulator_used}): <b>${data.filename}</b>`;

    // Update Summary Cards
    document.getElementById('trendTotalCust').innerText = data.summary.total_customers.toLocaleString();
    document.getElementById('trendChurnRate').innerText = data.summary.churn_rate_pct + '%';
    document.getElementById('trendLoyalCount').innerText = data.summary.loyal_repeat_count.toLocaleString();
    document.getElementById('trendRevenueRisk').innerText = '$' + data.summary.potential_revenue_at_risk_usd.toLocaleString();

    // Render Hourly Trend Chart
    const ctxHourly = document.getElementById('uploadHourlyTrendChart');
    if (ctxHourly) {
        if (hourlyChartInstance) hourlyChartInstance.destroy();
        hourlyChartInstance = new Chart(ctxHourly, {
            type: 'line',
            data: {
                labels: data.hourly_trends.hours.map(h => `${h}:00`),
                datasets: [{
                    label: 'Avg Churn Risk (%)',
                    data: data.hourly_trends.churn_probabilities.map(p => (p * 100).toFixed(1)),
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    fill: true,
                    tension: 0.3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { min: 0, max: 100, grid: { color: 'rgba(255,255,255,0.05)' } },
                    x: { grid: { display: false } }
                }
            }
        });
    }

    // Render Scatter Matrix Chart
    const ctxScatter = document.getElementById('uploadScatterChart');
    if (ctxScatter) {
        if (scatterChartInstance) scatterChartInstance.destroy();

        const pointsHigh = data.scatter_data.filter(p => p.risk_level === 'HIGH_RISK').map(p => ({ x: p.recency_days, y: p.monetary_usd }));
        const pointsLow = data.scatter_data.filter(p => p.risk_level === 'LOW_RISK').map(p => ({ x: p.recency_days, y: p.monetary_usd }));

        scatterChartInstance = new Chart(ctxScatter, {
            type: 'scatter',
            data: {
                datasets: [
                    { label: 'High Churn Risk', data: pointsHigh, backgroundColor: '#ef4444' },
                    { label: 'Repeat Buyer', data: pointsLow, backgroundColor: '#22c55e' }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { labels: { color: '#94a3b8', font: { size: 10 } } } },
                scales: {
                    x: { title: { display: true, text: 'Recency (Days)', color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
                    y: { title: { display: true, text: 'Monetary ($)', color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } }
                }
            }
        });
    }

    // Populate Top At-Risk Customer Table
    const tbody = document.getElementById('atRiskTbody');
    if (tbody && data.top_at_risk_customers) {
        tbody.innerHTML = '';
        data.top_at_risk_customers.forEach(c => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>${c.id}</strong></td>
                <td>${c.recency_days} days ago</td>
                <td style="font-weight:600;">$${c.monetary_usd.toLocaleString()}</td>
                <td><span style="color:var(--danger);font-weight:700;">${c.churn_prob}% Churn Risk</span></td>
                <td style="color:var(--danger);font-weight:700;font-family:'JetBrains Mono',monospace;">$${c.expected_value_lost_usd.toLocaleString()}</td>
                <td><button class="btn-action-sm" onclick="window.openCouponModal('${c.id}', ${c.monetary_usd}, ${c.churn_prob})">Simulate Offer</button></td>
            `;
            tbody.appendChild(row);
        });
    }
}
