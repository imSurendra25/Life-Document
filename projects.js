// Constants
const PROJECTS_KEY = 'codenibbler-projects';
const CATEGORIES_KEY = 'codenibbler-project-categories';

// State
let projects = [];
let categories = ['Web Development', 'UI/UX Design', 'Content Writing', 'Graphics'];

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    initClock();
    renderCategories();
    renderProjects();
    setupEventListeners();
});

// --- Data Management ---

function loadData() {
    const pData = localStorage.getItem(PROJECTS_KEY);
    const cData = localStorage.getItem(CATEGORIES_KEY);

    if (pData) projects = JSON.parse(pData);
    if (cData) categories = JSON.parse(cData);
}

function saveData() {
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
    updateStats();
}

// --- Rendering ---

function renderCategories() {
    const filterContainer = document.getElementById('categoryFilters');
    const selectContainer = document.getElementById('pCategory');
    const listContainer = document.getElementById('categoryList');

    // 1. Filters
    let filterHtml = '<button class="filter-btn active" onclick="filterProjects(\'all\', this)">All</button>';
    categories.forEach(cat => {
        filterHtml += `<button class="filter-btn" onclick="filterProjects('${cat}', this)">${cat}</button>`;
    });
    filterContainer.innerHTML = filterHtml;

    // 2. Select Dropdown
    selectContainer.innerHTML = categories.map(cat => `<option value="${cat}">${cat}</option>`).join('');

    // 3. Manage List
    listContainer.innerHTML = categories.map(cat => `
        <li>
            <span>${cat}</span>
            <button onclick="deleteCategory('${cat}')" class="text-red"><i class="fas fa-trash"></i></button>
        </li>
    `).join('');

    updateStats();
}

function renderProjects(filter = 'all', searchTerm = '') {
    const grid = document.getElementById('projectsGrid');
    const emptyState = document.getElementById('emptyState');

    let filtered = projects.sort((a, b) => new Date(b.date) - new Date(a.date));

    if (filter !== 'all') {
        filtered = filtered.filter(p => p.category === filter);
    }

    if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filtered = filtered.filter(p => 
            p.title.toLowerCase().includes(term) || 
            p.desc.toLowerCase().includes(term)
        );
    }

    if (filtered.length === 0) {
        grid.innerHTML = '';
        emptyState.classList.remove('hidden');
        return;
    }

    emptyState.classList.add('hidden');
    grid.innerHTML = filtered.map(p => `
        <div class="project-card">
            <div class="card-img">
                <span class="card-category">${p.category}</span>
                <img src="${p.image || 'https://via.placeholder.com/400x200?text=No+Preview'}" alt="${p.title}" onerror="this.src='https://via.placeholder.com/400x200?text=Error'">
            </div>
            <div class="card-body">
                <span class="card-date"><i class="far fa-clock"></i> ${new Date(p.date).toLocaleDateString()} ${new Date(p.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                <h3 class="card-title">${p.title}</h3>
                <p class="card-desc">${p.desc || 'No description provided.'}</p>
                <div class="card-footer">
                    <a href="${p.link}" target="_blank" class="btn-link">View Project <i class="fas fa-external-link-alt"></i></a>
                    <div class="card-actions">
                        <button onclick="deleteProject(${p.id})" title="Delete"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

function updateStats() {
    document.getElementById('totalProjects').textContent = projects.length;
    document.getElementById('totalCategories').textContent = categories.length;
}

// --- Actions ---

function handleProjectSubmit(e) {
    e.preventDefault();
    
    const title = document.getElementById('pTitle').value;
    const category = document.getElementById('pCategory').value;
    const link = document.getElementById('pLink').value;
    const image = document.getElementById('pImage').value;
    const desc = document.getElementById('pDesc').value;

    const newProject = {
        id: Date.now(),
        title,
        category,
        link,
        image,
        desc,
        date: new Date().toISOString()
    };

    projects.unshift(newProject);
    saveData();
    renderProjects();
    closeProjectModal();
    e.target.reset();
}

function deleteProject(id) {
    if(confirm('Are you sure you want to delete this project?')) {
        projects = projects.filter(p => p.id !== id);
        saveData();
        renderProjects();
    }
}

function addCategory() {
    const input = document.getElementById('newCatName');
    const name = input.value.trim();
    
    if (name && !categories.includes(name)) {
        categories.push(name);
        saveData();
        renderCategories();
        input.value = '';
    } else if (categories.includes(name)) {
        alert('Category already exists!');
    }
}

function deleteCategory(name) {
    if(confirm(`Delete category "${name}"? Projects in this category will remain but category label might be lost.`)) {
        categories = categories.filter(c => c !== name);
        saveData();
        renderCategories();
    }
}

function filterProjects(cat, btn) {
    // Update active button
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    renderProjects(cat, document.getElementById('searchInput').value);
}

// --- UI Helpers ---

function openProjectModal() {
    document.getElementById('projectModal').classList.add('active');
}

function closeProjectModal() {
    document.getElementById('projectModal').classList.remove('active');
}

function openCategoryModal() {
    document.getElementById('categoryModal').classList.add('active');
}

function closeCategoryModal() {
    document.getElementById('categoryModal').classList.remove('active');
}

function initClock() {
    const update = () => {
        const now = new Date();
        document.getElementById('liveClock').textContent = now.toLocaleTimeString();
    };
    setInterval(update, 1000);
    update();
}

function setupEventListeners() {
    // Search
    document.getElementById('searchInput').addEventListener('input', (e) => {
        const activeCat = document.querySelector('.filter-btn.active').textContent;
        const cat = activeCat === 'All' ? 'all' : activeCat;
        renderProjects(cat, e.target.value);
    });

    // Form Submit
    document.getElementById('projectForm').addEventListener('submit', handleProjectSubmit);

    // Close modals on outside click
    window.onclick = (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.classList.remove('active');
        }
    };
}

// Add some CSS for the category list dynamically
const style = document.createElement('style');
style.textContent = `
    .category-list { list-style: none; margin-top: 1rem; }
    .category-list li { 
        display: flex; justify-content: space-between; 
        padding: 10px; border-bottom: 1px solid #eee; 
    }
    .add-cat-row { display: flex; gap: 10px; }
    .add-cat-row input { flex: 1; padding: 8px; border: 1px solid #ddd; border-radius: 4px; }
    .text-red { color: #ff4757; background: none; border: none; cursor: pointer; }
    .hidden { display: none; }
    .empty-state { text-align: center; padding: 3rem; color: #888; }
    .empty-state i { font-size: 3rem; margin-bottom: 1rem; opacity: 0.5; }
    .full-width { width: 100%; margin-top: 1rem; }
    .form-group { margin-bottom: 1rem; }
    .form-group label { display: block; margin-bottom: 0.5rem; font-weight: 500; }
    .form-group input, .form-group select, .form-group textarea {
        width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px;
    }
    .btn-link { text-decoration: none; color: var(--primary); font-weight: 600; font-size: 0.9rem; }
    .btn-link:hover { text-decoration: underline; }
`;
document.head.appendChild(style);