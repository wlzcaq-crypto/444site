/**
 * NeuroAssistant Web — Dashboard JavaScript
 * Handles all AJAX interactions with the backend API.
 */

// --- Toast Notifications ---
function showToast(message) {
    const toast = document.getElementById('toast');
    const text = document.getElementById('toastText');
    text.textContent = message;
    toast.classList.add('visible');
    setTimeout(() => toast.classList.remove('visible'), 2500);
}

// --- API Helper ---
async function apiCall(endpoint, method = 'GET', body = null) {
    const options = {
        method,
        headers: { 'Content-Type': 'application/json' },
    };
    if (body) {
        options.body = JSON.stringify(body);
    }
    try {
        const response = await fetch(endpoint, options);
        return await response.json();
    } catch (error) {
        console.error(`API Error (${endpoint}):`, error);
        showToast('Connection error');
        return null;
    }
}

// --- Toggle AI Commenting ---
async function toggleCommenting() {
    const result = await apiCall('/api/toggle-commenting', 'POST');
    if (result) {
        const statusEl = document.getElementById('commentingStatus');
        statusEl.textContent = result.enabled ? 'Enabled' : 'Disabled';
        showToast(result.enabled ? 'AI Commenting enabled' : 'AI Commenting disabled');
    }
}

// --- Toggle Auto-Dialogue ---
async function toggleDialogue() {
    const result = await apiCall('/api/toggle-dialogue', 'POST');
    if (result) {
        const statusEl = document.getElementById('dialogueStatus');
        statusEl.textContent = result.enabled ? 'Enabled' : 'Disabled';
        showToast(result.enabled ? 'Auto-Dialogue enabled' : 'Auto-Dialogue disabled');
    }
}

// --- Save Prompt ---
async function savePrompt() {
    const prompt = document.getElementById('promptEditor').value;
    const result = await apiCall('/api/save-prompt', 'POST', { prompt });
    if (result && result.success) {
        showToast('Prompt saved');
    }
}

// --- Language Switcher ---
async function setLanguage(lang) {
    const result = await apiCall('/api/set-language', 'POST', { language: lang });
    if (result && result.success) {
        // Reload the page to apply translations
        window.location.reload();
    }
}

// --- Add Channel ---
async function addChannel() {
    const input = document.getElementById('channelInput');
    const username = input.value.trim();
    if (!username) {
        showToast('Enter a channel username');
        return;
    }
    const result = await apiCall('/api/add-channel', 'POST', { username });
    if (result) {
        if (result.success || result.channel) {
            showToast('Channel added');
            input.value = '';
            // Reload to refresh channel list
            window.location.reload();
        } else if (result.error) {
            showToast(result.error);
        }
    }
}

// --- Remove Channel ---
async function removeChannel(channelId) {
    const result = await apiCall('/api/remove-channel', 'POST', { channel_id: channelId });
    if (result && result.success) {
        // Remove the element from DOM
        const item = document.querySelector(`.channel-item[data-id="${channelId}"]`);
        if (item) {
            item.style.opacity = '0';
            item.style.transform = 'translateX(-10px)';
            setTimeout(() => item.remove(), 200);
        }
        showToast('Channel removed');
        updateStats();
    }
}

// --- Connect / Disconnect ---
async function connectClient() {
    showToast('Connecting...');
    const result = await apiCall('/api/connect', 'POST');
    if (result && result.connected) {
        showToast('Connected');
        window.location.reload();
    } else if (result && result.error) {
        showToast('Error: ' + result.error);
    }
}

async function disconnectClient() {
    const result = await apiCall('/api/disconnect', 'POST');
    if (result && result.success) {
        showToast('Disconnected');
        window.location.reload();
    }
}

// --- Skynet Controls ---
let skynetActive = document.getElementById('skynetStatus')?.classList.contains('skynet-active') || false;

async function toggleSkynet() {
    if (skynetActive) {
        const result = await apiCall('/api/skynet/stop', 'POST');
        if (result && result.success) {
            skynetActive = false;
            updateSkynetUI();
            showToast('Skynet Discovery stopped');
        }
    } else {
        const result = await apiCall('/api/skynet/start', 'POST');
        if (result && result.success) {
            skynetActive = true;
            updateSkynetUI();
            showToast('Skynet Discovery started');
        } else if (result && result.error) {
            showToast(result.error);
        }
    }
}

function updateSkynetUI() {
    const statusEl = document.getElementById('skynetStatus');
    const btn = document.getElementById('skynetBtn');
    if (skynetActive) {
        statusEl.classList.add('skynet-active');
        statusEl.textContent = 'Discovery Active';
        btn.textContent = 'Stop Discovery';
        btn.className = 'btn btn-secondary';
    } else {
        statusEl.classList.remove('skynet-active');
        statusEl.textContent = 'Discovery Inactive';
        btn.textContent = 'Start Discovery';
        btn.className = 'btn btn-primary';
    }
}

async function saveSkynetKeywords() {
    const keywords = document.getElementById('skynetKeywords').value;
    const result = await apiCall('/api/skynet/keywords', 'POST', { keywords });
    if (result && result.success) {
        showToast('Keywords saved');
    }
}

// --- Load Discovery Log ---
async function loadDiscoveryLog() {
    const result = await apiCall('/api/skynet/log');
    const container = document.getElementById('discoveryLog');
    if (result && result.log && result.log.length > 0) {
        container.innerHTML = result.log.map(entry => `
            <div class="log-entry">
                <span class="log-action ${entry.action}">${entry.action}</span>
                <span class="log-channel">@${entry.channel_username}</span>
                <span class="log-details">${entry.details || ''}</span>
            </div>
        `).join('');
    } else {
        container.innerHTML = '<div class="log-placeholder">No discovery activity yet</div>';
    }
}

// --- Update Stats Periodically ---
async function updateStats() {
    const result = await apiCall('/api/status');
    if (result) {
        document.getElementById('commentCount').textContent = result.comment_count;
        document.getElementById('channelCount').textContent = result.channel_count;
        document.getElementById('channelBadge').textContent = result.channel_count;

        // Update status badge
        const badge = document.getElementById('statusBadge');
        const statusText = document.getElementById('statusText');
        if (result.connected) {
            badge.className = 'status-badge status-active';
            statusText.textContent = 'ACTIVE';
        } else {
            badge.className = 'status-badge status-offline';
            statusText.textContent = 'OFFLINE';
        }
    }
}

// --- Auto-refresh every 5 seconds ---
setInterval(() => {
    updateStats();
    loadDiscoveryLog();
}, 5000);

// Initial load
document.addEventListener('DOMContentLoaded', () => {
    loadDiscoveryLog();
});

// --- Keyboard shortcut: Enter to add channel ---
document.getElementById('channelInput')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        addChannel();
    }
});
