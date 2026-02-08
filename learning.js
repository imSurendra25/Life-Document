// Learning page: store notes, images, videos, links — Soft Skills & Hard Skills

const LEARNING_STORAGE_KEY = 'codenibbler-learning';

let learningItems = [];
let currentFilter = 'all';
let editingLearningId = null;

// Content type fields to show/hide
const contentFields = {
    note: 'learningNoteContent',
    image: 'learningImageWrap',
    video: 'learningVideoWrap',
    link: 'learningLinkWrap'
};

function initLearningPage() {
    loadLearningItems();
    renderLearningItems();
    setupContentTypeSwitch();
    setupFilterButtons();
}

function loadLearningItems() {
    try {
        const raw = localStorage.getItem(LEARNING_STORAGE_KEY);
        learningItems = raw ? JSON.parse(raw) : [];
    } catch (e) {
        learningItems = [];
    }
}

function saveLearningItems() {
    localStorage.setItem(LEARNING_STORAGE_KEY, JSON.stringify(learningItems));
    renderLearningItems();
}

function setupContentTypeSwitch() {
    const select = document.getElementById('learningContentType');
    if (!select) return;
    select.addEventListener('change', showContentFieldForType);
    showContentFieldForType();
}

function showContentFieldForType() {
    const select = document.getElementById('learningContentType');
    const type = select ? select.value : 'note';

    const noteWrap = document.getElementById('learningNoteWrap');
    if (noteWrap) noteWrap.classList.add('hidden');
    document.getElementById('learningImageWrap').classList.add('hidden');
    document.getElementById('learningVideoWrap').classList.add('hidden');
    document.getElementById('learningLinkWrap').classList.add('hidden');

    if (type === 'note') {
        if (noteWrap) noteWrap.classList.remove('hidden');
    } else if (type === 'image') {
        document.getElementById('learningImageWrap').classList.remove('hidden');
    } else if (type === 'video') {
        document.getElementById('learningVideoWrap').classList.remove('hidden');
    } else if (type === 'link') {
        document.getElementById('learningLinkWrap').classList.remove('hidden');
    }
}

function setupFilterButtons() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            renderLearningItems();
        });
    });
}

function getContentByType() {
    const type = document.getElementById('learningContentType').value;
    let content = '';

    if (type === 'note') {
        content = document.getElementById('learningNoteContent').value.trim();
    } else if (type === 'image') {
        const preview = document.getElementById('learningImagePreview');
        const img = preview.querySelector('img');
        content = img ? img.src : ''; // base64 data URL
    } else if (type === 'video') {
        content = document.getElementById('learningVideoUrl').value.trim();
    } else if (type === 'link') {
        const url = document.getElementById('learningLinkUrl').value.trim();
        const label = document.getElementById('learningLinkLabel').value.trim();
        content = JSON.stringify({ url, label });
    }

    return content;
}

function addLearningItem() {
    const title = document.getElementById('learningTitle').value.trim();
    const skillType = document.getElementById('learningSkillType').value;
    const contentType = document.getElementById('learningContentType').value;
    const content = getContentByType();

    if (!title) {
        alert('Please enter a title.');
        return;
    }

    if (contentType === 'image' && !content) {
        alert('Please choose an image.');
        return;
    }

    if ((contentType === 'video' || contentType === 'link') && !content) {
        alert('Please enter a URL.');
        return;
    }

    const item = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2),
        skillType,
        title,
        contentType,
        content,
        createdAt: new Date().toISOString()
    };

    learningItems.unshift(item);
    saveLearningItems();
    clearLearningForm();
}

function clearLearningForm() {
    document.getElementById('learningTitle').value = '';
    document.getElementById('learningSkillType').value = 'soft';
    document.getElementById('learningContentType').value = 'note';
    document.getElementById('learningNoteContent').value = '';
    document.getElementById('learningVideoUrl').value = '';
    document.getElementById('learningLinkUrl').value = '';
    document.getElementById('learningLinkLabel').value = '';
    document.getElementById('learningImageFile').value = '';
    document.getElementById('learningImagePreview').innerHTML = '';
    showContentFieldForType();
}

// Image preview on file select
document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('learningImageFile');
    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            const preview = document.getElementById('learningImagePreview');
            preview.innerHTML = '';
            if (file && file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (ev) => {
                    const img = document.createElement('img');
                    img.src = ev.target.result;
                    img.alt = file.name;
                    preview.appendChild(img);
                };
                reader.readAsDataURL(file);
            }
        });
    }
});

function renderLearningItems() {
    const softList = document.getElementById('softSkillsList');
    const hardList = document.getElementById('hardSkillsList');
    if (!softList || !hardList) return;

    const showSoft = currentFilter === 'all' || currentFilter === 'soft';
    const showHard = currentFilter === 'all' || currentFilter === 'hard';

    const softItems = learningItems.filter(i => i.skillType === 'soft');
    const hardItems = learningItems.filter(i => i.skillType === 'hard');

    softList.innerHTML = showSoft
        ? (softItems.length ? softItems.map(item => renderOneItem(item)).join('') : '<p class="empty-state">No soft skill items yet. Add one above.</p>')
        : '';

    hardList.innerHTML = showHard
        ? (hardItems.length ? hardItems.map(item => renderOneItem(item)).join('') : '<p class="empty-state">No hard skill items yet. Add one above.</p>')
        : '';

    if (currentFilter !== 'all') {
        if (currentFilter === 'soft') hardList.innerHTML = '';
        if (currentFilter === 'hard') softList.innerHTML = '';
    }

    // Re-attach delete handlers
    learningItems.forEach(item => {
        const delBtn = document.querySelector(`[data-delete-id="${item.id}"]`);
        if (delBtn) delBtn.addEventListener('click', () => deleteLearningItem(item.id));
        const editBtn = document.querySelector(`[data-edit-id="${item.id}"]`);
        if (editBtn) editBtn.addEventListener('click', () => openEditLearning(item));
    });
}

function renderOneItem(item) {
    const contentHtml = formatContentForDisplay(item.contentType, item.content);
    const date = new Date(item.createdAt).toLocaleDateString(undefined, { dateStyle: 'short' });
    const typeLabel = { note: 'Note', image: 'Image', video: 'Video', link: 'Link' }[item.contentType] || item.contentType;

    return `
        <div class="learning-item" data-skill="${item.skillType}" data-id="${item.id}">
            <div class="learning-item-title">${escapeHtml(item.title)}</div>
            <div class="learning-item-meta">${typeLabel} · ${date}</div>
            <div class="learning-item-content">${contentHtml}</div>
            <div class="learning-item-actions">
                <button class="btn-edit" data-edit-id="${item.id}">Edit</button>
                <button class="btn-delete" data-delete-id="${item.id}">Delete</button>
            </div>
        </div>
    `;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatContentForDisplay(type, content) {
    if (!content) return '';
    if (type === 'note') return escapeHtml(content).replace(/\n/g, '<br>');
    if (type === 'image' && content.startsWith('data:')) {
        return `<img src="${content}" alt="Uploaded" />`;
    }
    if (type === 'video') {
        const url = content.trim();
        let embedUrl = url;
        if (url.includes('youtube.com/watch?v=')) {
            const id = url.split('v=')[1]?.split('&')[0];
            embedUrl = id ? `https://www.youtube.com/embed/${id}` : url;
        } else if (url.includes('youtu.be/')) {
            const id = url.split('youtu.be/')[1]?.split('?')[0];
            embedUrl = id ? `https://www.youtube.com/embed/${id}` : url;
        } else if (url.includes('vimeo.com/')) {
            const id = url.split('vimeo.com/')[1]?.split('?')[0];
            embedUrl = id ? `https://player.vimeo.com/video/${id}` : url;
        }
        if (embedUrl !== url) {
            return `<div class="video-embed"><iframe src="${embedUrl}" frameborder="0" allowfullscreen></iframe></div>`;
        }
        return `<a href="${escapeHtml(url)}" target="_blank" rel="noopener">Watch video</a>`;
    }
    if (type === 'link') {
        try {
            const { url, label } = JSON.parse(content);
            const text = label || url;
            return `<a href="${escapeHtml(url)}" target="_blank" rel="noopener">${escapeHtml(text)}</a>`;
        } catch (e) {
            return `<a href="${escapeHtml(content)}" target="_blank" rel="noopener">Open link</a>`;
        }
    }
    return escapeHtml(content);
}

function deleteLearningItem(id) {
    if (!confirm('Delete this learning item?')) return;
    learningItems = learningItems.filter(i => i.id !== id);
    saveLearningItems();
}

function openEditLearning(item) {
    editingLearningId = item.id;
    document.getElementById('editLearningTitle').value = item.title;
    document.getElementById('editLearningSkillType').value = item.skillType;
    document.getElementById('editLearningContent').value = item.contentType === 'link'
        ? (() => { try { const o = JSON.parse(item.content); return o.url + '\n' + (o.label || ''); } catch (e) { return item.content; } })()
        : item.content;
    document.getElementById('editLearningModal').classList.add('active');
}

function closeLearningModal() {
    editingLearningId = null;
    document.getElementById('editLearningModal').classList.remove('active');
}

function saveEditLearning() {
    if (!editingLearningId) return;
    const title = document.getElementById('editLearningTitle').value.trim();
    const skillType = document.getElementById('editLearningSkillType').value;
    let content = document.getElementById('editLearningContent').value.trim();

    const item = learningItems.find(i => i.id === editingLearningId);
    if (!item) return;

    if (item.contentType === 'link' && content.includes('\n')) {
        const [url, ...labelParts] = content.split('\n');
        content = JSON.stringify({ url: url.trim(), label: labelParts.join('\n').trim() });
    }

    item.title = title;
    item.skillType = skillType;
    item.content = content;
    saveLearningItems();
    closeLearningModal();
}

// Run on load
document.addEventListener('DOMContentLoaded', initLearningPage);
