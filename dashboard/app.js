// ==========================================================================
// QUANTUM ANALYTICS -- ENTERPRISE DASHBOARD & LIVE API ENGINE
// ==========================================================================

let API_BASE_URL = 'http://127.0.0.1:8000';

document.addEventListener('DOMContentLoaded', () => {
    initInteractiveEvents();
    initDatasetUpload();
    initActionHandlers();
    checkBackendHealth();
});

// 1. LIVE BACKEND HEALTH CHECK & STATUS BADGE
async function checkBackendHealth() {
    const badge = document.getElementById('apiStatusBadge');
    
    // Try 127.0.0.1 first, then fallback to localhost
    const hosts = ['http://127.0.0.1:8000', 'http://localhost:8000'];
    let connected = false;

    for (const host of hosts) {
        try {
            const res = await fetch(`${host}/`);
            const data = await res.json();
            if (data.status === 'ok') {
                API_BASE_URL = host;
                connected = true;
                if (badge) {
                    badge.className = 'status-badge success';
                    badge.style.background = 'rgba(34, 197, 94, 0.15)';
                    badge.style.borderColor = 'rgba(34, 197, 94, 0.4)';
                    badge.style.color = '#22c55e';
                    badge.innerHTML = `🟢 LIVE API CONNECTED (${host.replace('http://','')})`;
                }
                break;
            }
        } catch (e) {
            // try next
        }
    }

    if (!connected && badge) {
        badge.className = 'status-badge warning';
        badge.style.background = 'rgba(234, 179, 8, 0.15)';
        badge.style.borderColor = 'rgba(234, 179, 8, 0.4)';
        badge.style.color = '#eab308';
        badge.innerHTML = '🟡 SIMULATOR MODE (API Offline)';
    }
}

// 2. INTERACTIVE SLIDERS & LIVE PREDICTOR
function initInteractiveEvents() {
    ['Recency', 'Frequency', 'Monetary', 'Diversity'].forEach(f => {
        const slider = document.getElementById('s' + f);
        const valSpan = document.getElementById('v' + f);
        if (slider && valSpan) {
            slider.addEventListener('input', (e) => {
                valSpan.innerText = e.target.value;
                updateLivePrediction();
            });
        }
    });

    async function updateLivePrediction() {
        const r = parseFloat(document.getElementById('sRecency').value);
        const f = parseFloat(document.getElementById('sFrequency').value);
        const m = parseFloat(document.getElementById('sMonetary').value);
        const d = parseFloat(document.getElementById('sDiversity').value);

        const features = [
            (r / 100.0) * Math.PI,
            (f / 30.0) * Math.PI,
            (m / 1000.0) * Math.PI,
            (m / (f + 1e-5) / 500.0) * Math.PI,
            d * Math.PI,
            (m / 1000.0) * d * Math.PI,
            Math.sin(2 * Math.PI * 14 / 24) * Math.PI,
            Math.cos(2 * Math.PI * 14 / 24) * Math.PI
        ];

        try {
            const res = await fetch(`${API_BASE_URL}/predict`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ features })
            });

            if (res.ok) {
                const data = await res.json();
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
            } else {
                throw new Error(`API returned HTTP ${res.status}`);
            }
        } catch (e) {
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
    }

    const btnBench = document.getElementById('runBenchmarkBtn');
    if (btnBench) {
        btnBench.addEventListener('click', async () => {
            btnBench.innerText = 'Requesting Inference...';
            const t0 = performance.now();

            const r = parseFloat(document.getElementById('sRecency').value);
            const f = parseFloat(document.getElementById('sFrequency').value);
            const m = parseFloat(document.getElementById('sMonetary').value);
            const d = parseFloat(document.getElementById('sDiversity').value);

            const features = [
                (r / 100.0) * Math.PI,
                (f / 30.0) * Math.PI,
                (m / 1000.0) * Math.PI,
                (m / (f + 1e-5) / 500.0) * Math.PI,
                d * Math.PI,
                (m / 1000.0) * d * Math.PI,
                Math.sin(2 * Math.PI * 14 / 24) * Math.PI,
                Math.cos(2 * Math.PI * 14 / 24) * Math.PI
            ];

            try {
                const res = await fetch(`${API_BASE_URL}/predict`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ features })
                });

                if (!res.ok) throw new Error(`API Returned HTTP ${res.status}`);

                const data = await res.json();
                const totalLat = performance.now() - t0;

                alert(`LIVE BACKEND INFERENCE RESPONSE (${API_BASE_URL}/predict)\n\n` +
                      `• Customer Prediction: ${data.prediction === 1 ? 'Repeat Buyer (Class 1)' : 'Churn Risk (Class 0)'}\n` +
                      `• Model Probability:   ${(data.confidence * 100).toFixed(1)}%\n` +
                      `• Execution Source:    ${data.source.toUpperCase()}\n` +
                      `• Model Latency:       ${data.latency_ms.toFixed(2)} ms\n` +
                      `• Total Round-Trip:    ${totalLat.toFixed(2)} ms\n\n` +
                      `Status: 🟢 100% Genuine Prediction from Production Backend`);
            } catch (e) {
                alert(`API Connection Failed:\n\nUnable to reach ${API_BASE_URL}/predict.\nPlease ensure the uvicorn backend server is running on port 8000.`);
            } finally {
                btnBench.innerText = 'Run Inference Request';
            }
        });
    }
}

// 3. DATASET UPLOAD & LIVE TREND VISUALIZER
function initDatasetUpload() {
    const fileInput = document.getElementById('csvFileInput');
    const dropzone = document.getElementById('dropzone');
    const statusDiv = document.getElementById('uploadStatus');

    if (!fileInput) return;

    if (dropzone) {
        dropzone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropzone.style.borderColor = '#22c55e';
            dropzone.style.background = 'rgba(34, 197, 94, 0.08)';
        });

        dropzone.addEventListener('dragleave', () => {
            dropzone.style.borderColor = 'rgba(124, 58, 237, 0.4)';
            dropzone.style.background = 'rgba(124, 58, 237, 0.04)';
        });

        dropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropzone.style.borderColor = 'rgba(124, 58, 237, 0.4)';
            dropzone.style.background = 'rgba(124, 58, 237, 0.04)';

            if (e.dataTransfer.files.length > 0) {
                fileInput.files = e.dataTransfer.files;
                processFileUpload(fileInput.files[0]);
            }
        });
    }

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            processFileUpload(e.target.files[0]);
        }
    });

    let hourlyChartInstance = null;
    let scatterChartInstance = null;

    async function processFileUpload(file) {
        if (statusDiv) statusDiv.innerHTML = '⏳ Uploading dataset & calculating quantum trends...';

        const simType = document.getElementById('simulatorToggle') ? document.getElementById('simulatorToggle').value : 'ideal';

        const formData = new FormData();
        formData.append('file', file);
        formData.append('simulator_type', simType);

        try {
            const res = await fetch(`${API_BASE_URL}/upload-dataset`, {
                method: 'POST',
                body: formData
            });

            if (!res.ok) throw new Error('API processing error');

            const data = await res.json();
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

            // Populate Top At-Risk Customer Table (Sorted by Expected Value Lost)
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
                        <td><button class="btn-action-sm" onclick="openCouponModal('${c.id}', ${c.monetary_usd}, ${c.churn_prob})">Simulate Offer</button></td>
                    `;
                    tbody.appendChild(row);
                });
            }

        } catch (err) {
            if (statusDiv) statusDiv.innerHTML = `<span style="color:#ef4444;">❌ Processing error. Ensure backend server is running.</span>`;
            console.error(err);
        }
    }
}

// 4. ADDITIONAL ACTION HANDLERS
function initActionHandlers() {
    const pdfBtn = document.getElementById('downloadPdfBtn');
    if (pdfBtn) {
        pdfBtn.addEventListener('click', () => {
            window.open(`${API_BASE_URL}/report/download`, '_blank');
        });
    }

    const csvSampleBtn = document.getElementById('downloadSampleCsvBtn');
    if (csvSampleBtn) {
        csvSampleBtn.addEventListener('click', () => {
            const csvHeader = "InvoiceNo,StockCode,Description,Quantity,InvoiceDate,UnitPrice,CustomerID,Country\n";
            let csvRows = "";
            for (let i = 1; i <= 100; i++) {
                const inv = 536365 + Math.floor(i / 2);
                const cust = 13000 + (i % 15);
                const qty = Math.floor(Math.random() * 8) + 1;
                const price = (Math.random() * 35 + 4).toFixed(2);
                const hour = String((i * 3) % 24).padStart(2, '0');
                const day = String((i % 28) + 1).padStart(2, '0');
                const dateStr = `2010-12-${day} ${hour}:26:00`;
                csvRows += `${inv},85123A,WHITE HANGING HEART T-LIGHT HOLDER,${qty},${dateStr},${price},${cust},United Kingdom\n`;
            }
            const blob = new Blob([csvHeader + csvRows], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'sample_retail_receipts.csv';
            a.click();
            window.URL.revokeObjectURL(url);
        });
    }

    const searchInput = document.getElementById('atRiskSearchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const q = e.target.value.toLowerCase();
            const rows = document.querySelectorAll('#atRiskTbody tr');
            rows.forEach(r => {
                const txt = r.innerText.toLowerCase();
                r.style.display = txt.includes(q) ? '' : 'none';
            });
        });
    }

    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.tab-btn').forEach(b => {
                b.classList.remove('active');
                b.style.background = 'rgba(255,255,255,0.08)';
                b.style.color = '#94a3b8';
            });
            const target = e.target;
            target.classList.add('active');
            target.style.background = 'var(--primary)';
            target.style.color = '#fff';

            const filter = target.getAttribute('data-filter');
            const rows = document.querySelectorAll('#leaderboard-section tbody tr');
            rows.forEach(r => {
                if (filter === 'all') {
                    r.style.display = '';
                } else if (filter === 'quantum') {
                    r.style.display = r.innerHTML.includes('Quantum') ? '' : 'none';
                } else if (filter === 'classical') {
                    r.style.display = r.innerHTML.includes('Classical') ? '' : 'none';
                }
            });
        });
    });
}
