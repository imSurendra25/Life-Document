// Brainstorm – ideas with date/time, share via Gmail & other platforms

const BRAINSTORM_STORAGE_KEY = 'codenibbler-brainstorm';
let ideas = [];
let currentShareIdea = null;

function initBrainstorm() {
    loadIdeas();
    renderIdeas();
}

function loadIdeas() {
    try {
        const raw = localStorage.getItem(BRAINSTORM_STORAGE_KEY);
        ideas = raw ? JSON.parse(raw) : [];
        ideas.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } catch (e) {
        ideas = [];
    }
}

function saveIdeas() {
    localStorage.setItem(BRAINSTORM_STORAGE_KEY, JSON.stringify(ideas));
    renderIdeas();
}

function addIdea() {
    const title = document.getElementById('ideaTitle').value.trim();
    const content = document.getElementById('ideaContent').value.trim();

    if (!title && !content) {
        alert('Add a title or some content for your idea.');
        return;
    }

    const now = new Date();
    const idea = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2),
        title: title || 'Untitled idea',
        content: content || '',
        createdAt: now.toISOString(),
        dateLabel: now.toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }),
        timeLabel: now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };

    ideas.unshift(idea);
    saveIdeas();

    document.getElementById('ideaTitle').value = '';
    document.getElementById('ideaContent').value = '';
    document.getElementById('ideaTitle').focus();
}

function deleteIdea(id) {
    if (!confirm('Delete this idea?')) return;
    ideas = ideas.filter(i => i.id !== id);
    saveIdeas();
}

function getShareText(idea) {
    const lines = [
        idea.title,
        '',
        idea.content || '(no content)',
        '',
        `Date: ${idea.dateLabel} at ${idea.timeLabel}`,
        '— from CodeNibbler Brainstorm'
    ];
    return lines.join('\n');
}

function getShareUrl(idea) {
    const text = encodeURIComponent(getShareText(idea));
    return `mailto:?subject=${encodeURIComponent(idea.title)}&body=${text}`;
}

function shareByGmail(idea) {
    window.location.href = getShareUrl(idea);
}

function shareByTwitter(idea) {
    const text = idea.title + (idea.content ? ': ' + idea.content.slice(0, 200) + (idea.content.length > 200 ? '…' : '')) + ' #ideas';
    const url = 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(text);
    window.open(url, '_blank', 'noopener,noreferrer,width=550,height=420');
}

function shareByLinkedIn(idea) {
    const url = 'https://www.linkedin.com/sharing/share-offsite/?url=' + encodeURIComponent(window.location.href) + '&summary=' + encodeURIComponent(idea.title + '\n\n' + (idea.content || '').slice(0, 256));
    window.open(url, '_blank', 'noopener,noreferrer,width=600,height=600');
}

function shareByWhatsApp(idea) {
    const text = getShareText(idea);
    const url = 'https://wa.me/?text=' + encodeURIComponent(text);
    window.open(url, '_blank', 'noopener,noreferrer');
}

function openShareModal(idea) {
    currentShareIdea = idea;
    const modal = document.getElementById('shareModal');
    const container = document.getElementById('shareButtons');
    container.innerHTML = `
        <a href="${getShareUrl(idea)}" class="btn-share btn-share-gmail" target="_blank" rel="noopener">📧 Gmail</a>
        <button type="button" class="btn-share btn-share-twitter" onclick="shareByTwitter(currentShareIdea)">𝕏 Twitter</button>
        <button type="button" class="btn-share btn-share-linkedin" onclick="shareByLinkedIn(currentShareIdea)">in LinkedIn</button>
        <button type="button" class="btn-share btn-share-whatsapp" onclick="shareByWhatsApp(currentShareIdea)">WhatsApp</button>
    `;
    modal.classList.add('active');
}

function closeShareModal() {
    currentShareIdea = null;
    document.getElementById('shareModal').classList.remove('active');
}

function copyCurrentShareText() {
    if (!currentShareIdea) return;
    const text = getShareText(currentShareIdea);
    navigator.clipboard.writeText(text).then(() => {
        const btn = document.querySelector('.btn-copy-full');
        if (btn) {
            const orig = btn.textContent;
            btn.textContent = 'Copied!';
            setTimeout(() => { btn.textContent = orig; }, 2000);
        }
    }).catch(() => alert('Could not copy. Try selecting and copying manually.'));
}

function copyIdeaText(idea) {
    const text = getShareText(idea);
    navigator.clipboard.writeText(text).then(() => {
        const el = document.querySelector(`[data-copy-feedback="${idea.id}"]`);
        if (el) {
            el.textContent = 'Copied!';
            setTimeout(() => { el.textContent = 'Copy'; }, 2000);
        }
    }).catch(() => alert('Could not copy.'));
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function getIdeaById(id) {
    return ideas.find(i => i.id === id);
}

function renderIdeas() {
    const grid = document.getElementById('ideasGrid');
    if (!grid) return;

    if (ideas.length === 0) {
        grid.innerHTML = '<div class="empty-ideas"><strong>No ideas yet</strong>Add your first idea above.</div>';
        return;
    }

    grid.innerHTML = ideas.map(idea => `
        <div class="idea-card" data-id="${idea.id}">
            <div class="idea-card-title">${escapeHtml(idea.title)}</div>
            <div class="idea-card-datetime">${escapeHtml(idea.dateLabel)} · ${escapeHtml(idea.timeLabel)}</div>
            <div class="idea-card-content">${escapeHtml(idea.content)}</div>
            <div class="idea-card-actions">
                <a href="${getShareUrl(idea)}" class="btn-share btn-share-gmail" target="_blank" rel="noopener" title="Send via Gmail">📧 Gmail</a>
                <button type="button" class="btn-share btn-share-more" data-idea-id="${idea.id}" title="More share options">Share</button>
                <button type="button" class="btn-share btn-share-twitter" data-idea-id="${idea.id}" title="Share on X">𝕏</button>
                <button type="button" class="btn-share btn-share-whatsapp" data-idea-id="${idea.id}" title="Share on WhatsApp">WhatsApp</button>
                <button type="button" class="btn-copy-idea" data-idea-id="${idea.id}" data-copy-feedback="${idea.id}">Copy</button>
                <button type="button" class="btn-delete-idea" data-idea-id="${idea.id}">Delete</button>
            </div>
        </div>
    `).join('');

    grid.querySelectorAll('.btn-share-more').forEach(btn => {
        btn.addEventListener('click', () => openShareModal(getIdeaById(btn.dataset.ideaId)));
    });
    grid.querySelectorAll('.btn-share-twitter').forEach(btn => {
        btn.addEventListener('click', () => shareByTwitter(getIdeaById(btn.dataset.ideaId)));
    });
    grid.querySelectorAll('.btn-share-whatsapp').forEach(btn => {
        btn.addEventListener('click', () => shareByWhatsApp(getIdeaById(btn.dataset.ideaId)));
    });
    grid.querySelectorAll('.btn-copy-idea').forEach(btn => {
        btn.addEventListener('click', () => {
            copyIdeaText(getIdeaById(btn.dataset.ideaId));
            btn.textContent = 'Copied!';
            setTimeout(() => { btn.textContent = 'Copy'; }, 2000);
        });
    });
    grid.querySelectorAll('.btn-delete-idea').forEach(btn => {
        btn.addEventListener('click', () => deleteIdea(btn.dataset.ideaId));
    });
}

document.addEventListener('DOMContentLoaded', initBrainstorm);
