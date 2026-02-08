// Data Management using localStorage
const dataStore = {
    habits: [],
    habitCategories: [],
    todos: [],
    courses: [],
    journalEntries: [],
    journalCategories: [],
    skills: [],
    affirmations: {}
};

let currentAffirmationTime = 'morning';
let currentEditingId = null;

// Initialize app
function initializeApp() {
    loadAllData();
    updateLiveTime();
    setInterval(updateLiveTime, 1000);
    updateDaysLeft();
    generateDotCalendar();
    generateProgressCharts();
    setupAffirmationTabs();
    renderAllData();
    console.log('Dashboard initialized!');
}

// ============================================
// DATA PERSISTENCE
// ============================================

function saveData() {
    localStorage.setItem('codenibbler-data', JSON.stringify(dataStore));
}

function loadAllData() {
    const savedData = localStorage.getItem('codenibbler-data');
    if (savedData) {
        Object.assign(dataStore, JSON.parse(savedData));
    }
}

// ============================================
// TIME & CALENDAR FUNCTIONS
// ============================================

function updateLiveTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    const liveTimeElement = document.getElementById('liveTime');
    if (liveTimeElement) {
        liveTimeElement.textContent = `${hours}:${minutes}:${seconds}`;
    }
}

function updateDaysLeft() {
    const today = new Date();
    const currentYear = today.getFullYear();
    const endOfYear = new Date(currentYear, 11, 31);
    const daysLeft = Math.ceil((endOfYear - today) / (1000 * 60 * 60 * 24));
    
    const daysLeftElement = document.getElementById('daysLeft');
    if (daysLeftElement) {
        daysLeftElement.textContent = daysLeft;
    }
}

function generateDotCalendar() {
    const dotCalendar = document.getElementById('dotCalendar');
    if (!dotCalendar) return;
    dotCalendar.innerHTML = '';
    
    const today = new Date();
    const startOfYear = new Date(today.getFullYear(), 0, 1);
    const dayOfYear = Math.floor((today - startOfYear) / (1000 * 60 * 60 * 24)) + 1;
    
    for (let i = 1; i <= 365; i++) {
        const dot = document.createElement('div');
        dot.className = 'dot';
        
        if (i < dayOfYear) {
            // Past days - randomly mark as completed or partial
            const random = Math.random();
            if (random > 0.6) dot.classList.add('completed');
            else if (random > 0.3) dot.classList.add('partial');
        } else if (i === dayOfYear) {
            dot.classList.add('today');
        }
        
        dot.title = `Day ${i}`;
        dot.addEventListener('click', () => toggleDotStatus(dot));
        dotCalendar.appendChild(dot);
    }
}

function toggleDotStatus(dot) {
    if (dot.classList.contains('completed')) {
        dot.classList.remove('completed');
        dot.classList.add('partial');
    } else if (dot.classList.contains('partial')) {
        dot.classList.remove('partial');
    } else {
        dot.classList.add('completed');
    }
}

function generateProgressCharts() {
    // Daily Progress (based on today's completed tasks)
    const completedToday = dataStore.todos.filter(t => t.completed).length;
    const totalToday = dataStore.todos.length;
    const dailyPercent = totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 0;
    
    const dailyChart = document.getElementById('dailyProgress');
    if (dailyChart) {
        dailyChart.innerHTML = `<div style="height: 100%; background: linear-gradient(90deg, #007bff 0%, #0056b3 100%); width: ${dailyPercent}%"></div>`;
    }
    
    const dailyPercLabel = document.getElementById('dailyPercentage');
    if (dailyPercLabel) dailyPercLabel.textContent = `${dailyPercent}%`;
    
    // Yearly Progress (based on year completion)
    const today = new Date();
    const startOfYear = new Date(today.getFullYear(), 0, 1);
    const dayOfYear = Math.floor((today - startOfYear) / (1000 * 60 * 60 * 24)) + 1;
    const yearlyPercent = Math.round((dayOfYear / 365) * 100);
    
    const yearlyChart = document.getElementById('yearlyProgress');
    if (yearlyChart) {
        yearlyChart.innerHTML = `<div style="height: 100%; background: linear-gradient(90deg, #28a745 0%, #20c997 100%); width: ${yearlyPercent}%"></div>`;
    }
    
    const yearlyPercLabel = document.getElementById('yearlyPercentage');
    if (yearlyPercLabel) yearlyPercLabel.textContent = `${yearlyPercent}%`;
}

// ============================================
// AFFIRMATIONS
// ============================================

function setupAffirmationTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentAffirmationTime = btn.dataset.time;
            displayAffirmation();
        });
    });
}

function addAffirmation() {
    const input = document.getElementById('affirmationInput');
    if (!input.value.trim()) return;
    
    if (!dataStore.affirmations[currentAffirmationTime]) {
        dataStore.affirmations[currentAffirmationTime] = [];
    }
    
    dataStore.affirmations[currentAffirmationTime].push({
        id: Date.now(),
        text: input.value,
        timestamp: new Date().toLocaleString()
    });
    
    input.value = '';
    saveData();
    displayAffirmation();
    renderAffirmations();
}

function displayAffirmation() {
    const affirmations = dataStore.affirmations[currentAffirmationTime] || [];
    const displayElement = document.getElementById('affirmationText');
    
    if (affirmations.length === 0) {
        displayElement.textContent = 'Add your first affirmation...';
    } else {
        const random = affirmations[Math.floor(Math.random() * affirmations.length)];
        displayElement.textContent = random.text;
    }
}

function renderAffirmations() {
    const affirmations = dataStore.affirmations[currentAffirmationTime] || [];
    const listElement = document.getElementById('affirmationsList');
    listElement.innerHTML = '';
    
    affirmations.forEach(aff => {
        const div = document.createElement('div');
        div.className = 'affirmation-item';
        div.innerHTML = `
            <div>
                <p>${aff.text}</p>
                <span class="affirmation-time">${aff.timestamp}</span>
            </div>
            <button onclick="deleteAffirmation('${currentAffirmationTime}', ${aff.id})" style="background: none; border: none; color: white; cursor: pointer; font-size: 16px;">×</button>
        `;
        listElement.appendChild(div);
    });
}

function deleteAffirmation(time, id) {
    dataStore.affirmations[time] = dataStore.affirmations[time].filter(a => a.id !== id);
    saveData();
    renderAffirmations();
    displayAffirmation();
}

// ============================================
// HABIT MANAGEMENT
// ============================================

function addHabitCategory() {
    const input = document.getElementById('habitCategoryInput');
    if (!input.value.trim()) return;
    
    const category = {
        id: Date.now(),
        name: input.value
    };
    
    dataStore.habitCategories.push(category);
    input.value = '';
    saveData();
    renderHabitCategories();
    updateHabitCategorySelect();
}

function renderHabitCategories() {
    const container = document.getElementById('habitCategories');
    container.innerHTML = '';
    
    dataStore.habitCategories.forEach(cat => {
        const tag = document.createElement('div');
        tag.className = 'category-tag';
        tag.innerHTML = `
            ${cat.name}
            <button class="delete-btn" onclick="deleteHabitCategory(${cat.id})">×</button>
        `;
        container.appendChild(tag);
    });
}

function deleteHabitCategory(id) {
    dataStore.habitCategories = dataStore.habitCategories.filter(c => c.id !== id);
    dataStore.habits = dataStore.habits.filter(h => h.categoryId !== id);
    saveData();
    renderHabitCategories();
    renderHabits();
    updateHabitCategorySelect();
}

function updateHabitCategorySelect() {
    const select = document.getElementById('habitCategory');
    const currentValue = select.value;
    select.innerHTML = '<option value="">Select category...</option>';
    
    dataStore.habitCategories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.id;
        option.textContent = cat.name;
        select.appendChild(option);
    });
    
    select.value = currentValue;
}

function addHabit() {
    const nameInput = document.getElementById('habitInput');
    const timeInput = document.getElementById('habitTime');
    const categorySelect = document.getElementById('habitCategory');
    
    if (!nameInput.value.trim() || !categorySelect.value) {
        alert('Please fill all fields');
        return;
    }
    
    const habit = {
        id: Date.now(),
        name: nameInput.value,
        time: timeInput.value,
        categoryId: parseInt(categorySelect.value),
        completed: false,
        createdAt: new Date().toLocaleDateString()
    };
    
    dataStore.habits.push(habit);
    nameInput.value = '';
    timeInput.value = '';
    categorySelect.value = '';
    
    saveData();
    renderHabits();
    generateProgressCharts();
}

function renderHabits() {
    const container = document.getElementById('habitsList');
    container.innerHTML = '';
    
    dataStore.habits.forEach(habit => {
        const category = dataStore.habitCategories.find(c => c.id === habit.categoryId);
        const div = document.createElement('div');
        div.className = 'habit-item';
        div.innerHTML = `
            <input type="checkbox" ${habit.completed ? 'checked' : ''} onchange="toggleHabit(${habit.id})">
            <div class="habit-item-content">
                <div class="habit-item-name">${habit.name}</div>
                <div class="habit-item-time">${category?.name || 'Uncategorized'} • ${habit.time || 'No time'}</div>
            </div>
            <div class="habit-item-actions">
                <button onclick="editHabit(${habit.id})">✏️</button>
                <button onclick="deleteHabit(${habit.id})">🗑️</button>
            </div>
        `;
        container.appendChild(div);
    });
}

function toggleHabit(id) {
    const habit = dataStore.habits.find(h => h.id === id);
    if (habit) {
        habit.completed = !habit.completed;
        saveData();
        renderHabits();
        generateProgressCharts();
    }
}

function editHabit(id) {
    currentEditingId = id;
    const habit = dataStore.habits.find(h => h.id === id);
    document.getElementById('editHabitInput').value = habit.name;
    document.getElementById('editHabitTime').value = habit.time;
    openModal('editHabitModal');
}

function saveEditHabit() {
    const habit = dataStore.habits.find(h => h.id === currentEditingId);
    if (habit) {
        habit.name = document.getElementById('editHabitInput').value;
        habit.time = document.getElementById('editHabitTime').value;
        saveData();
        renderHabits();
        closeModal('editHabitModal');
    }
}

function deleteHabit(id) {
    if (confirm('Delete this habit?')) {
        dataStore.habits = dataStore.habits.filter(h => h.id !== id);
        saveData();
        renderHabits();
        generateProgressCharts();
    }
}

// ============================================
// SKILLS MANAGEMENT
// ============================================

function addSkill() {
    const nameInput = document.getElementById('skillInput');
    const levelSelect = document.getElementById('skillLevel');
    
    if (!nameInput.value.trim()) return;
    
    const skill = {
        id: Date.now(),
        name: nameInput.value,
        level: levelSelect.value,
        addedAt: new Date().toLocaleDateString()
    };
    
    dataStore.skills.push(skill);
    nameInput.value = '';
    levelSelect.value = 'beginner';
    
    saveData();
    renderSkills();
}

function renderSkills() {
    const container = document.getElementById('skillsList');
    container.innerHTML = '';
    
    dataStore.skills.forEach(skill => {
        const div = document.createElement('div');
        div.className = 'skill-item';
        div.innerHTML = `
            <div class="skill-info">
                <div class="skill-name">${skill.name}</div>
                <div class="skill-level ${skill.level}">${skill.level.charAt(0).toUpperCase() + skill.level.slice(1)}</div>
            </div>
            <div class="skill-actions">
                <button onclick="deleteSkill(${skill.id})">🗑️</button>
            </div>
        `;
        container.appendChild(div);
    });
}

function deleteSkill(id) {
    if (confirm('Delete this skill?')) {
        dataStore.skills = dataStore.skills.filter(s => s.id !== id);
        saveData();
        renderSkills();
    }
}

// ============================================
// TO-DO MANAGEMENT
// ============================================

function addTodo() {
    const input = document.getElementById('todoInput');
    const timeInput = document.getElementById('todoTime');
    
    if (!input.value.trim()) return;
    
    const todo = {
        id: Date.now(),
        title: input.value,
        time: timeInput.value,
        completed: false,
        createdAt: new Date().toLocaleDateString()
    };
    
    dataStore.todos.push(todo);
    input.value = '';
    timeInput.value = '';
    
    saveData();
    renderTodos();
    generateProgressCharts();
}

function renderTodos() {
    const container = document.getElementById('todoList');
    container.innerHTML = '';
    
    const sorted = [...dataStore.todos].sort((a, b) => {
        if (!a.time) return 1;
        if (!b.time) return -1;
        return a.time.localeCompare(b.time);
    });
    
    sorted.forEach(todo => {
        const div = document.createElement('div');
        div.className = 'todo-item' + (todo.completed ? ' completed' : '');
        div.innerHTML = `
            <div class="todo-time">${todo.time || '--:--'}</div>
            <div class="todo-content">
                <h4>${todo.title}</h4>
                <p>Created: ${todo.createdAt}</p>
            </div>
            <input type="checkbox" ${todo.completed ? 'checked' : ''} onchange="toggleTodo(${todo.id})">
            <button onclick="deleteTodo(${todo.id})" style="background: none; border: none; cursor: pointer; color: #ff6b6b;">🗑️</button>
        `;
        container.appendChild(div);
    });
}

function toggleTodo(id) {
    const todo = dataStore.todos.find(t => t.id === id);
    if (todo) {
        todo.completed = !todo.completed;
        saveData();
        renderTodos();
        generateProgressCharts();
    }
}

function deleteTodo(id) {
    dataStore.todos = dataStore.todos.filter(t => t.id !== id);
    saveData();
    renderTodos();
    generateProgressCharts();
}

// ============================================
// COURSE MANAGEMENT
// ============================================

function addCourse() {
    const nameInput = document.getElementById('courseInput');
    const progressInput = document.getElementById('courseProgress');
    
    if (!nameInput.value.trim()) return;
    
    const course = {
        id: Date.now(),
        name: nameInput.value,
        progress: parseInt(progressInput.value) || 0,
        addedAt: new Date().toLocaleDateString()
    };
    
    dataStore.courses.push(course);
    nameInput.value = '';
    progressInput.value = '';
    
    saveData();
    renderCourses();
}

function renderCourses() {
    const container = document.getElementById('coursesList');
    container.innerHTML = '';
    
    dataStore.courses.forEach(course => {
        const div = document.createElement('div');
        div.className = 'course-item';
        div.innerHTML = `
            <div class="course-info">
                <h4>${course.name}</h4>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${course.progress}%"></div>
                </div>
                <span class="course-status">${course.progress}% Complete</span>
            </div>
            <div class="course-actions">
                <button onclick="deleteCourse(${course.id})">🗑️</button>
            </div>
        `;
        container.appendChild(div);
    });
}

function deleteCourse(id) {
    if (confirm('Delete this course?')) {
        dataStore.courses = dataStore.courses.filter(c => c.id !== id);
        saveData();
        renderCourses();
    }
}

// ============================================
// JOURNAL MANAGEMENT
// ============================================

function addJournalCategory() {
    const input = document.getElementById('journalCategoryInput');
    if (!input.value.trim()) return;
    
    const category = {
        id: Date.now(),
        name: input.value
    };
    
    dataStore.journalCategories.push(category);
    input.value = '';
    saveData();
    renderJournalCategories();
    updateJournalCategorySelect();
}

function renderJournalCategories() {
    const container = document.getElementById('journalCategories');
    container.innerHTML = '';
    
    dataStore.journalCategories.forEach(cat => {
        const tag = document.createElement('div');
        tag.className = 'category-tag';
        tag.innerHTML = `
            ${cat.name}
            <button class="delete-btn" onclick="deleteJournalCategory(${cat.id})">×</button>
        `;
        container.appendChild(tag);
    });
}

function deleteJournalCategory(id) {
    dataStore.journalCategories = dataStore.journalCategories.filter(c => c.id !== id);
    dataStore.journalEntries = dataStore.journalEntries.filter(e => e.categoryId !== id);
    saveData();
    renderJournalCategories();
    renderJournalEntries();
    updateJournalCategorySelect();
}

function updateJournalCategorySelect() {
    const select = document.getElementById('journalCategory');
    const currentValue = select.value;
    select.innerHTML = '<option value="">Select category...</option>';
    
    dataStore.journalCategories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.id;
        option.textContent = cat.name;
        select.appendChild(option);
    });
    
    select.value = currentValue;
}

function addJournalEntry() {
    const textInput = document.getElementById('journalInput');
    const categorySelect = document.getElementById('journalCategory');
    
    if (!textInput.value.trim()) {
        alert('Please write something');
        return;
    }
    
    const entry = {
        id: Date.now(),
        categoryId: parseInt(categorySelect.value) || 0,
        title: textInput.value.substring(0, 50),
        content: textInput.value,
        timestamp: new Date().toLocaleString(),
        date: new Date().toLocaleDateString()
    };
    
    dataStore.journalEntries.push(entry);
    textInput.value = '';
    categorySelect.value = '';
    
    saveData();
    renderJournalEntries();
}

function renderJournalEntries() {
    const container = document.getElementById('journalEntries');
    container.innerHTML = '';
    
    const sorted = [...dataStore.journalEntries].sort((a, b) => b.id - a.id);
    
    sorted.forEach(entry => {
        const category = dataStore.journalCategories.find(c => c.id === entry.categoryId);
        const div = document.createElement('div');
        div.className = 'journal-entry';
        div.innerHTML = `
            <div class="entry-date">${entry.date} ${category ? '• ' + category.name : ''}</div>
            <h4>${entry.title}</h4>
            <p>${entry.content.substring(0, 100)}...</p>
            <div class="journal-entry-actions">
                <button onclick="editJournalEntry(${entry.id})">Edit</button>
                <button onclick="deleteJournalEntry(${entry.id})">Delete</button>
            </div>
        `;
        container.appendChild(div);
    });
}

function editJournalEntry(id) {
    currentEditingId = id;
    const entry = dataStore.journalEntries.find(e => e.id === id);
    document.getElementById('editJournalInput').value = entry.content;
    openModal('editJournalModal');
}

function saveEditJournal() {
    const entry = dataStore.journalEntries.find(e => e.id === currentEditingId);
    if (entry) {
        entry.content = document.getElementById('editJournalInput').value;
        entry.title = entry.content.substring(0, 50);
        entry.timestamp = new Date().toLocaleString();
        saveData();
        renderJournalEntries();
        closeModal('editJournalModal');
    }
}

function deleteJournalEntry(id) {
    if (confirm('Delete this entry?')) {
        dataStore.journalEntries = dataStore.journalEntries.filter(e => e.id !== id);
        saveData();
        renderJournalEntries();
    }
}

// ============================================
// MODAL FUNCTIONS
// ============================================

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
}

// ============================================
// RENDER ALL DATA
// ============================================

function renderAllData() {
    renderHabitCategories();
    updateHabitCategorySelect();
    renderHabits();
    renderSkills();
    renderTodos();
    renderCourses();
    renderJournalCategories();
    updateJournalCategorySelect();
    renderJournalEntries();
    displayAffirmation();
    renderAffirmations();
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initializeApp);
