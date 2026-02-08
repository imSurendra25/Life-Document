// Constants
const CONTENT_KEY = 'codenibbler-content';
const PLATFORMS_KEY = 'codenibbler-platforms';

// Default Data
const defaultPlatforms = ['YouTube', 'Instagram', 'LinkedIn', 'GitHub', 'Twitter', 'TikTok', 'Blog'];

// State
let contentItems = [];
let platforms = [];
let currentEditId = null;

// Init
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    renderPlatforms();
    renderContent();
    updateStats();
    
    // Event Listeners
    document.getElementById('ideaForm').addEventListener('submit', handleAddIdea);
});

// --- Data Management ---
function loadData() {
    const cData = localStorage.getItem(CONTENT_KEY);
    const pData = localStorage.getItem(PLATFORMS_KEY);

    if (cData) contentItems = JSON.parse(cData);
    
    if (pData) {
        platforms = JSON.parse(pData);
    } else {
        platforms = defaultPlatforms;
        saveData();
    }
}

function saveData() {
    localStorage.setItem(CONTENT_KEY, JSON.stringify(contentItems));
    localStorage.setItem(PLATFORMS_KEY, JSON.stringify(platforms));
    updateStats();
}

// --- Rendering ---
function renderPlatforms() {
    const selects = [document.getElementById('ideaPlatform'), document.getElementById('editPlatform')];
    
    const optionsHtml = platforms.map(p => `<option value="${p}">${p}</option>`).join('');
    
    selects.forEach(sel => {
        if(sel) sel.innerHTML = optionsHtml;
    });
}

function renderContent(filter = 'all') {
    const grid = document.getElementById('contentGrid');
    const empty = document.getElementById('emptyState');
    
    let filtered = contentItems.sort((a, b) => b.id - a.id); // Newest first

    if (filter === 'idea') filtered = filtered.filter(i => i.status === 'Idea');
    if (filter === 'scripting') filtered = filtered.filter(i => ['Scripting', 'Filming', 'Editing'].includes(i.status));
    if (filter === 'posted') filtered = filtered.filter(i => i.status === 'Posted');

    if (filtered.length === 0) {
        grid.innerHTML = '';
        empty.classList.remove('hidden');
        return;
    }

    empty.classList.add('hidden');
    grid.innerHTML = filtered.map(item => {
        const platClass = `plat-${item.platform.toLowerCase().replace(/\s+/g, '')}`;
        const statusClass = `status-${item.status.toLowerCase()}`;
        
        return `
        <div class="content-card">
            <div class="card-header">
                <span class="platform-badge ${platClass}" style="${!getPlatColor(item.platform) ? 'background:#666' : ''}">${item.platform}</span>
                <span class="status-badge ${statusClass}">${item.status}</span>
            </div>
            <h3 class="card-title">${item.title}</h3>
            <div class="card-meta">
                <span><i class="fas fa-tag"></i> ${item.type}</span>
                ${item.postedDate ? `<span><i class="fas fa-check-circle"></i> ${new Date(item.postedDate).toLocaleDateString()}</span>` : ''}
            </div>
            ${item.script ? `<div class="card-preview">${item.script.substring(0, 100)}...</div>` : ''}
            <div class="card-footer">
                <span style="font-size:0.8rem; color:#888;">${new Date(item.created).toLocaleDateString()}</span>
                <button class="btn-edit" onclick="openEditor(${item.id})">Edit / Script</button>
            </div>
        </div>
    `}).join('');
}

function updateStats() {
    const ideas = contentItems.filter(i => i.status === 'Idea').length;
    const posted = contentItems.filter(i => i.status === 'Posted').length;
    const progress = contentItems.length - ideas - posted;

    document.getElementById('statIdeas').textContent = ideas;
    document.getElementById('statInProgress').textContent = progress;
    document.getElementById('statPosted').textContent = posted;
}

// --- Actions ---
function handleAddIdea(e) {
    e.preventDefault();
    const title = document.getElementById('ideaTitle').value;
    const platform = document.getElementById('ideaPlatform').value;
    const type = document.getElementById('ideaType').value;

    const newItem = {
        id: Date.now(),
        title,
        platform,
        type,
        status: 'Idea',
        script: '',
        plannedDate: '',
        postedDate: '',
        created: new Date().toISOString()
    };

    contentItems.unshift(newItem);
    saveData();
    renderContent();
    e.target.reset();
}

function saveContent() {
    if (!currentEditId) return;

    const item = contentItems.find(i => i.id === currentEditId);
    if (item) {
        item.title = document.getElementById('editTitle').value;
        item.platform = document.getElementById('editPlatform').value;
        item.status = document.getElementById('editStatus').value;
        item.script = document.getElementById('editScript').value;
        item.plannedDate = document.getElementById('editPlannedDate').value;
        item.postedDate = document.getElementById('editPostedDate').value;
        
        // Auto-set posted date if status changed to Posted and date is empty
        if (item.status === 'Posted' && !item.postedDate) {
            item.postedDate = new Date().toISOString().slice(0, 16); // Format for datetime-local
        }

        saveData();
        renderContent();
        closeEditorModal();
    }
}

function deleteContent() {
    if (confirm('Are you sure you want to delete this content?')) {
        contentItems = contentItems.filter(i => i.id !== currentEditId);
        saveData();
        renderContent();
        closeEditorModal();
    }
}

// --- UI Helpers ---
function openEditor(id) {
    currentEditId = id;
    const item = contentItems.find(i => i.id === id);
    if (!item) return;

    document.getElementById('editId').value = item.id;
    document.getElementById('editTitle').value = item.title;
    document.getElementById('editPlatform').value = item.platform;
    document.getElementById('editStatus').value = item.status;
    document.getElementById('editScript').value = item.script || '';
    document.getElementById('editPlannedDate').value = item.plannedDate || '';
    document.getElementById('editPostedDate').value = item.postedDate || '';

    document.getElementById('editorModal').classList.add('active');
}

function closeEditorModal() {
    document.getElementById('editorModal').classList.remove('active');
    currentEditId = null;
}

function filterContent(filter) {
    // Update active button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.filter === filter) btn.classList.add('active');
    });
    renderContent(filter);
}

function openPlatformModal() {
    const newPlat = prompt("Enter new platform name:");
    if (newPlat && !platforms.includes(newPlat)) {
        platforms.push(newPlat);
        saveData();
        renderPlatforms();
    }
}

// Helper for platform colors (simple mapping)
function getPlatColor(plat) {
    const map = {
        'YouTube': true,
        'Instagram': true,
        'LinkedIn': true,
        'GitHub': true,
        'Twitter': true,
        'TikTok': true
    };
    return map[plat];
}

// Close modal on outside click
window.onclick = (e) => {
    if (e.target.classList.contains('modal')) {
        closeEditorModal();
    }
};

// Add dynamic styles for platform badges if needed
const style = document.createElement('style');
style.textContent = `
    .plat-blog { background: #f57c00; }
`;
document.head.appendChild(style);