// dashboard/js/api.js
// Handles all backend communication

export let API_BASE_URL = 'http://127.0.0.1:8000';

export async function checkBackendHealth() {
    const hosts = ['http://127.0.0.1:8000', 'http://localhost:8000'];
    for (const host of hosts) {
        try {
            const res = await fetch(`${host}/`);
            const data = await res.json();
            if (data.status === 'ok') {
                API_BASE_URL = host;
                return host;
            }
        } catch (e) {}
    }
    return null;
}

export async function predictCustomer(features) {
    const res = await fetch(`${API_BASE_URL}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ features })
    });
    if (!res.ok) throw new Error(`API returned HTTP ${res.status}`);
    return await res.json();
}

export async function uploadDataset(file, simType) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('simulator_type', simType);

    const res = await fetch(`${API_BASE_URL}/upload-dataset`, {
        method: 'POST',
        body: formData
    });
    if (!res.ok) throw new Error('API processing error');
    return await res.json();
}
