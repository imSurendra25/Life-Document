// Constants
const LANG_KEY = 'codenibbler-languages';
const POSTS_KEY = 'codenibbler-language-posts';

// State
let languages = [];
let posts = [];
let mediaRecorder;
let audioChunks = [];
let currentAudioBlob = null;

// Init
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    initClock();
    renderLanguages();
    renderPosts();
    renderGraphs();
    setupEventListeners();
});

// --- Time & Clock ---
function initClock() {
    const timeEl = document.getElementById('liveTime');
    const dateEl = document.getElementById('liveDate');

    const update = () => {
        const now = new Date();
        // 24 Hour Format
        timeEl.textContent = now.toLocaleTimeString('en-GB', { hour12: false });
        dateEl.textContent = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    };
    setInterval(update, 1000);
    update();
}

// --- Data Management ---
function loadData() {
    const lData = localStorage.getItem(LANG_KEY);
    const pData = localStorage.getItem(POSTS_KEY);
    if (lData) languages = JSON.parse(lData);
    if (pData) posts = JSON.parse(pData);
    updateStats();
}

function saveData() {
    localStorage.setItem(LANG_KEY, JSON.stringify(languages));
    // Note: We are saving posts, but large media files won't persist well in LS.
    // We will save metadata and warn user about media persistence.
    localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
    updateStats();
}

function updateStats() {
    document.getElementById('totalLanguages').textContent = languages.length;
    document.getElementById('totalPosts').textContent = posts.length;
}

// --- Languages Logic ---
function renderLanguages() {
    const list = document.getElementById('activeLanguagesList');
    const select = document.getElementById('postLangSelect');
    
    // Update Select Dropdown
    select.innerHTML = '<option value="">Select Language...</option>' + 
        languages.map(l => `<option value="${l.name}">${l.name}</option>`).join('');

    // Update List
    list.innerHTML = languages.map(l => `
        <div class="lang-item">
            <div class="lang-info">
                <h4>${l.name}</h4>
                <span>${l.level}</span>
            </div>
            <button class="btn-delete" onclick="deleteLanguage('${l.id}')"><i class="fas fa-trash"></i></button>
        </div>
    `).join('');
}

function addLanguage(e) {
    e.preventDefault();
    const name = document.getElementById('langName').value.trim();
    const level = document.getElementById('langLevel').value;

    if (name) {
        languages.push({ id: Date.now().toString(), name, level });
        saveData();
        renderLanguages();
        renderGraphs();
        e.target.reset();
    }
}

function deleteLanguage(id) {
    if(confirm('Stop tracking this language?')) {
        languages = languages.filter(l => l.id !== id);
        saveData();
        renderLanguages();
        renderGraphs();
    }
}

// --- Posts & Media Logic ---
function setupEventListeners() {
    document.getElementById('addLangForm').addEventListener('submit', addLanguage);
    document.getElementById('dailyPostForm').addEventListener('submit', createPost);
    
    // Video Input Change
    document.getElementById('videoInput').addEventListener('change', function(e) {
        if(this.files[0]) {
            document.getElementById('videoName').textContent = this.files[0].name;
        }
    });

    // Audio Recorder
    const recordBtn = document.getElementById('recordBtn');
    recordBtn.addEventListener('click', toggleRecording);
}

async function toggleRecording() {
    const btn = document.getElementById('recordBtn');
    const status = document.getElementById('recordStatus');
    const preview = document.getElementById('audioPreview');

    if (!mediaRecorder || mediaRecorder.state === 'inactive') {
        // Start Recording
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder = new MediaRecorder(stream);
            audioChunks = [];

            mediaRecorder.ondataavailable = e => audioChunks.push(e.data);
            mediaRecorder.onstop = () => {
                const blob = new Blob(audioChunks, { type: 'audio/webm' });
                currentAudioBlob = blob;
                const url = URL.createObjectURL(blob);
                preview.src = url;
                preview.style.display = 'block';
                status.textContent = 'Recorded';
                btn.classList.remove('recording');
                btn.innerHTML = '<i class="fas fa-microphone"></i> Record Again';
            };

            mediaRecorder.start();
            btn.classList.add('recording');
            btn.innerHTML = '<i class="fas fa-stop"></i> Stop';
            status.textContent = 'Recording...';
        } catch (err) {
            alert('Microphone access denied or not available.');
        }
    } else {
        // Stop Recording
        mediaRecorder.stop();
    }
}

function createPost(e) {
    e.preventDefault();
    const lang = document.getElementById('postLangSelect').value;
    const title = document.getElementById('postTitle').value;
    const content = document.getElementById('postContent').value;
    const videoFile = document.getElementById('videoInput').files[0];

    if (!lang) { alert('Please select a language'); return; }

    // Handle Media (Note: For static site, we use ObjectURLs for session. 
    // Persistence of blobs in LocalStorage is limited/risky. We save what we can.)
    let audioUrl = currentAudioBlob ? URL.createObjectURL(currentAudioBlob) : null;
    let videoUrl = videoFile ? URL.createObjectURL(videoFile) : null;

    const newPost = {
        id: Date.now(),
        lang,
        title,
        content,
        date: new Date().toISOString(),
        hasAudio: !!currentAudioBlob,
        hasVideo: !!videoFile,
        // In a real app, we'd upload these. Here we store temp URLs for the session.
        // If user refreshes, media might be lost in this simple demo.
        tempAudio: audioUrl,
        tempVideo: videoUrl
    };

    posts.unshift(newPost);
    saveData();
    renderPosts();
    renderGraphs();
    
    // Reset Form
    e.target.reset();
    document.getElementById('audioPreview').style.display = 'none';
    document.getElementById('videoName').textContent = 'No video selected';
    document.getElementById('recordStatus').textContent = 'Ready';
    currentAudioBlob = null;
}

function renderPosts() {
    const grid = document.getElementById('feedGrid');
    const empty = document.getElementById('emptyFeed');

    if (posts.length === 0) {
        grid.innerHTML = '';
        empty.classList.remove('hidden');
        return;
    }

    empty.classList.add('hidden');
    grid.innerHTML = posts.map(p => `
        <div class="feed-card">
            <div class="feed-header">
                <div>
                    <span class="feed-lang-badge">${p.lang}</span>
                    <h3 style="margin-top:5px; font-size:1.1rem;">${p.title}</h3>
                </div>
                <span class="feed-date">${new Date(p.date).toLocaleDateString()} ${new Date(p.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
            </div>
            <div class="feed-content">
                <p class="feed-text">${p.content}</p>
                
                ${p.tempAudio ? `
                    <div class="feed-media">
                        <label><i class="fas fa-microphone"></i> Voice Note</label>
                        <audio controls src="${p.tempAudio}"></audio>
                    </div>` : ''}
                
                ${p.tempVideo ? `
                    <div class="feed-media">
                        <label><i class="fas fa-video"></i> Video Update</label>
                        <video controls src="${p.tempVideo}"></video>
                    </div>` : ''}
                    
                ${(!p.tempAudio && p.hasAudio) || (!p.tempVideo && p.hasVideo) ? 
                    `<p style="font-size:0.8rem; color:orange; margin-top:5px;">* Media from previous session expired (Storage Limit)</p>` : ''}
            </div>
        </div>
    `).join('');
}

// --- Graphs Logic ---
function renderGraphs() {
    // 1. Overall Chart (Posts per Language)
    const overallContainer = document.getElementById('overallChart');
    const counts = {};
    languages.forEach(l => counts[l.name] = 0);
    posts.forEach(p => {
        if (counts[p.lang] !== undefined) counts[p.lang]++;
    });

    const maxCount = Math.max(...Object.values(counts), 1);

    overallContainer.innerHTML = Object.keys(counts).map(lang => {
        const percent = (counts[lang] / maxCount) * 100;
        return `
            <div class="bar-row">
                <span class="bar-label">${lang}</span>
                <div class="bar-track"><div class="bar-fill" style="width: ${percent}%"></div></div>
                <span class="bar-value">${counts[lang]}</span>
            </div>
        `;
    }).join('');

    // 2. Current Focus (Just showing top active language for now)
    // For simplicity, we'll visualize the same data vertically or just show the most recent
    const currentContainer = document.getElementById('currentLangChart');
    // Reuse counts for vertical bars
    currentContainer.innerHTML = Object.keys(counts).map(lang => {
        const height = (counts[lang] / maxCount) * 100;
        return `
            <div class="bar-col">
                <div class="bar-col-track" style="height: ${height}%"></div>
                <span class="bar-col-label">${lang.substring(0, 3)}</span>
            </div>
        `;
    }).join('');
}