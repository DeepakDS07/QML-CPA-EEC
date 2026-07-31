import { checkBackendHealth, predictCustomer, uploadDataset, API_BASE_URL } from './api.js';
import { updateStatusBadge, updateLivePredictionUI, updatePredictionOfflineUI, renderDashboard } from './ui.js';

document.addEventListener('DOMContentLoaded', async () => {
    const host = await checkBackendHealth();
    updateStatusBadge(host !== null, host);

    initInteractiveEvents();
    initDatasetUpload();
    initActionHandlers();
});

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
            (r / 100.0) * Math.PI, (f / 30.0) * Math.PI, (m / 1000.0) * Math.PI,
            (m / (f + 1e-5) / 500.0) * Math.PI, d * Math.PI, (m / 1000.0) * d * Math.PI,
            Math.sin(2 * Math.PI * 14 / 24) * Math.PI, Math.cos(2 * Math.PI * 14 / 24) * Math.PI
        ];

        try {
            const data = await predictCustomer(features);
            updateLivePredictionUI(data);
        } catch (e) {
            updatePredictionOfflineUI(API_BASE_URL);
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
                (r / 100.0) * Math.PI, (f / 30.0) * Math.PI, (m / 1000.0) * Math.PI,
                (m / (f + 1e-5) / 500.0) * Math.PI, d * Math.PI, (m / 1000.0) * d * Math.PI,
                Math.sin(2 * Math.PI * 14 / 24) * Math.PI, Math.cos(2 * Math.PI * 14 / 24) * Math.PI
            ];

            try {
                const data = await predictCustomer(features);
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

function initDatasetUpload() {
    const fileInput = document.getElementById('csvFileInput');
    const dropzone = document.getElementById('dropzone');
    const statusDiv = document.getElementById('uploadStatus');

    if (!fileInput) return;

    if (dropzone) {
        dropzone.addEventListener('dragover', (e) => { e.preventDefault(); });
        dropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            if (e.dataTransfer.files.length > 0) {
                fileInput.files = e.dataTransfer.files;
                processFileUpload(fileInput.files[0]);
            }
        });
    }

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) processFileUpload(e.target.files[0]);
    });

    async function processFileUpload(file) {
        if (statusDiv) statusDiv.innerHTML = '⏳ Uploading dataset & calculating quantum trends...';
        const simType = document.getElementById('simulatorToggle') ? document.getElementById('simulatorToggle').value : 'ideal';
        
        try {
            const data = await uploadDataset(file, simType);
            renderDashboard(data);
        } catch (err) {
            if (statusDiv) statusDiv.innerHTML = `<span style="color:#ef4444;">❌ Processing error. Ensure backend server is running.</span>`;
            console.error(err);
        }
    }
}

function initActionHandlers() {
    const pdfBtn = document.getElementById('downloadPdfBtn');
    if (pdfBtn) {
        pdfBtn.addEventListener('click', () => { window.open(`${API_BASE_URL}/report/download`, '_blank'); });
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
                csvRows += `${inv},85123A,WHITE HANGING HEART T-LIGHT HOLDER,${qty},2010-12-${day} ${hour}:26:00,${price},${cust},United Kingdom\n`;
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
                if (filter === 'all') r.style.display = '';
                else if (filter === 'quantum') r.style.display = r.innerHTML.includes('Quantum') ? '' : 'none';
                else if (filter === 'classical') r.style.display = r.innerHTML.includes('Classical') ? '' : 'none';
            });
        });
    });
}

// Global modal functions needed for inline HTML
window.activeCouponCustomerId = null;
window.activeCouponMonetary = 0;
window.activeCouponChurnRisk = 0;

window.openCouponModal = function(customerId, monetaryValue, churnRisk) {
    window.activeCouponCustomerId = customerId;
    window.activeCouponMonetary = monetaryValue;
    window.activeCouponChurnRisk = churnRisk;
    document.getElementById('couponModal').style.display = 'flex';
    document.getElementById('mCustId').innerText = customerId;
    document.getElementById('mExpectedLoss').innerText = '$' + (monetaryValue * (churnRisk/100)).toFixed(2);
    document.getElementById('mDiscountCost').innerText = '$0.00';
    document.getElementById('mNetSaved').innerText = '+$0.00';
};

window.closeCouponModal = function() {
    document.getElementById('couponModal').style.display = 'none';
};

window.calculateCouponImpact = function() {
    const offer = parseFloat(document.getElementById('offerSelect').value);
    const cost = window.activeCouponMonetary * offer;
    const expectedLoss = window.activeCouponMonetary * (window.activeCouponChurnRisk / 100.0);
    const netSaved = expectedLoss - cost;
    
    document.getElementById('mDiscountCost').innerText = '-$' + cost.toFixed(2);
    document.getElementById('mDiscountCost').style.color = '#ef4444';
    
    const savedEl = document.getElementById('mNetSaved');
    if (netSaved > 0) {
        savedEl.innerText = '+$' + netSaved.toFixed(2);
        savedEl.className = 'sim-val text-success font-bold';
    } else {
        savedEl.innerText = '-$' + Math.abs(netSaved).toFixed(2);
        savedEl.className = 'sim-val font-bold';
        savedEl.style.color = '#ef4444';
    }
};

window.confirmCouponStrategy = function() {
    alert(`Successfully applied strategy to ${window.activeCouponCustomerId}! API POST request simulated.`);
    window.closeCouponModal();
};
