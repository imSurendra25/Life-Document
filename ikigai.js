// Ikigai Discovery – detailed form, save & load, dashboard

const IKIGAI_STORAGE_KEY = 'codenibbler-ikigai';

const fields = {
    love: 'ikigaiLove',
    good: 'ikigaiGood',
    world: 'ikigaiWorld',
    paid: 'ikigaiPaid'
};

const detailFields = {
    love: ['detailLove1', 'detailLove2', 'detailLove3'],
    good: ['detailGood1', 'detailGood2', 'detailGood3'],
    world: ['detailWorld1', 'detailWorld2', 'detailWorld3'],
    paid: ['detailPaid1', 'detailPaid2', 'detailPaid3']
};

const labels = {
    love: 'What You Love',
    good: "What You're Good At",
    world: 'What the World Needs',
    paid: 'What You Can Be Paid For'
};

function getAllData() {
    const data = { lastUpdated: null };
    Object.keys(fields).forEach(key => {
        const el = document.getElementById(fields[key]);
        data[key] = el ? el.value.trim() : '';
    });
    Object.keys(detailFields).forEach(key => {
        data[key + 'Detail'] = detailFields[key].map(id => {
            const el = document.getElementById(id);
            return el ? el.value.trim() : '';
        });
    });
    return data;
}

function loadIkigai() {
    try {
        const raw = localStorage.getItem(IKIGAI_STORAGE_KEY);
        const saved = raw ? JSON.parse(raw) : {};
        Object.keys(fields).forEach(key => {
            const el = document.getElementById(fields[key]);
            if (el && saved[key]) el.value = saved[key];
        });
        Object.keys(detailFields).forEach(key => {
            const ids = detailFields[key];
            const arr = saved[key + 'Detail'];
            if (Array.isArray(arr)) {
                ids.forEach((id, i) => {
                    const el = document.getElementById(id);
                    if (el && arr[i]) el.value = arr[i];
                });
            }
        });
    } catch (e) {
        // ignore
    }
}

function saveIkigai() {
    const data = getAllData();
    data.lastUpdated = new Date().toISOString();
    localStorage.setItem(IKIGAI_STORAGE_KEY, JSON.stringify(data));
    showToast('Reflections saved.');
    renderDashboard();
}

function showToast(message) {
    const existing = document.querySelector('.saved-toast');
    if (existing) existing.remove();
    const toast = document.createElement('div');
    toast.className = 'saved-toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
}

function getStoredData() {
    try {
        const raw = localStorage.getItem(IKIGAI_STORAGE_KEY);
        return raw ? JSON.parse(raw) : {};
    } catch (e) {
        return {};
    }
}

function renderDashboard() {
    const data = getStoredData();
    const progressEl = document.getElementById('dashboardProgress');
    const gridEl = document.getElementById('dashboardGrid');
    const discoveryEl = document.getElementById('discoveryContent');
    const updatedEl = document.getElementById('dashboardUpdated');

    if (!progressEl || !gridEl || !discoveryEl) return;

    const summaries = {
        love: data.love || '',
        good: data.good || '',
        world: data.world || '',
        paid: data.paid || ''
    };
    const details = {
        love: data.loveDetail || [],
        good: data.goodDetail || [],
        world: data.worldDetail || [],
        paid: data.paidDetail || []
    };

    const filled = Object.values(summaries).filter(Boolean).length;
    const percent = Math.round((filled / 4) * 100);

    progressEl.innerHTML = `
        <div class="progress-text">Your progress: ${filled} of 4 quadrants completed</div>
        <div class="progress-bar-wrap"><div class="progress-bar-fill" style="width: ${percent}%"></div></div>
    `;

    gridEl.innerHTML = Object.keys(labels).map(key => {
        const summary = summaries[key];
        const detailArr = details[key] || [];
        const bullets = detailArr.filter(Boolean);
        return `
            <div class="dashboard-card ${key}">
                <h4>${labels[key]}</h4>
                <div class="card-summary">${summary ? escapeHtml(summary) : '— Not filled yet. Use the form above to reflect.'}</div>
                ${bullets.length ? `
                    <div class="card-details">
                        <ul>${bullets.map(b => `<li>${escapeHtml(b)}</li>`).join('')}</ul>
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');

    if (filled === 4 && summaries.love && summaries.good && summaries.world && summaries.paid) {
        discoveryEl.innerHTML = `
            <p><strong>Your Ikigai</strong> is where these four meet: what you love, what you're good at, what the world needs, and what you can be paid for.</p>
            <p>You've captured all four. Keep refining your answers over time. Your reason for being is already within you—this dashboard helps you see it clearly.</p>
        `;
    } else {
        discoveryEl.innerHTML = `
            <p>Complete the detailed form above to fill your dashboard. You've reflected on <strong>${filled} of 4</strong> areas.</p>
            <p>There are no wrong answers. Take your time and discover yourself—your life discovery will appear here once all four quadrants have a summary.</p>
        `;
    }

    if (updatedEl && data.lastUpdated) {
        const d = new Date(data.lastUpdated);
        updatedEl.textContent = 'Last updated: ' + d.toLocaleDateString(undefined, { dateStyle: 'medium' }) + ' at ' + d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    } else if (updatedEl) {
        updatedEl.textContent = 'Save your reflections to see last updated.';
    }
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showSummary() {
    const data = getAllData();
    const grid = document.getElementById('summaryGrid');
    const statement = document.getElementById('ikigaiStatement');
    const section = document.getElementById('summarySection');

    if (!grid || !statement || !section) return;

    const summaries = { love: data.love, good: data.good, world: data.world, paid: data.paid };

    grid.innerHTML = Object.keys(fields).map(key => `
        <div class="summary-card ${summaries[key] ? '' : 'empty'}">
            <h4>${labels[key]}</h4>
            <p>${summaries[key] ? escapeHtml(summaries[key]) : 'Not filled yet. Go back and reflect.'}</p>
        </div>
    `).join('');

    const filled = Object.values(summaries).filter(Boolean).length;
    if (filled === 4) {
        statement.innerHTML = `
            <div class="statement-label">Your Ikigai</div>
            <p>You find meaning where <strong>what you love</strong>, <strong>what you're good at</strong>, <strong>what the world needs</strong>, and <strong>what you can be paid for</strong> meet. Keep refining these four areas—your reason for being is already within you.</p>
        `;
    } else {
        statement.innerHTML = `
            <div class="statement-label">Keep going</div>
            <p>You've reflected on ${filled} of 4 areas. Complete all four to see your Ikigai summary. There are no wrong answers—only your honest reflection.</p>
        `;
    }

    section.hidden = false;
    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function initIkigai() {
    loadIkigai();
    renderDashboard();
    document.getElementById('btnSave')?.addEventListener('click', saveIkigai);
    document.getElementById('btnSummary')?.addEventListener('click', showSummary);

    const allIds = Object.values(fields).concat(...Object.values(detailFields));
    let saveTimeout;
    allIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', () => {
                clearTimeout(saveTimeout);
                saveTimeout = setTimeout(() => {
                    const data = getAllData();
                    data.lastUpdated = new Date().toISOString();
                    localStorage.setItem(IKIGAI_STORAGE_KEY, JSON.stringify(data));
                    renderDashboard();
                }, 800);
            });
        }
    });
}

document.addEventListener('DOMContentLoaded', initIkigai);
