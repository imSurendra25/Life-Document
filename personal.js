// Constants
const PERSONAL_KEY = 'codenibbler-personal-data';

// Default Data Structure
const defaultData = {
    currency: '$',
    categories: [
        { id: 1, name: 'Career', sub: ['Skills', 'Productivity', 'Networking'], scores: [5, 5, 5], reflection: '' },
        { id: 2, name: 'Health', sub: ['Physical', 'Diet', 'Mental'], scores: [5, 5, 5], reflection: '' },
        { id: 3, name: 'Money', sub: ['Savings', 'Investing', 'Budget'], scores: [5, 5, 5], reflection: '' },
        { id: 4, name: 'Relationships', sub: ['Family', 'Partner', 'Social'], scores: [5, 5, 5], reflection: '' }
    ],
    income: [],
    expenses: [],
    banks: [],
    investments: [],
    contacts: [],
    history: [] // For graph
};

let data = JSON.parse(JSON.stringify(defaultData));
let growthChart;
let expenseChart;

// Init
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    initChart();
    renderAll();
});

// --- Data Management ---
function loadData() {
    const stored = localStorage.getItem(PERSONAL_KEY);
    if (stored) {
        data = { ...defaultData, ...JSON.parse(stored) }; // Merge to ensure new fields exist
    }
    document.getElementById('currencySelector').value = data.currency || '$';
}

function saveData() {
    localStorage.setItem(PERSONAL_KEY, JSON.stringify(data));
    updateLifeScore();
}

function renderAll() {
    renderCategories();
    renderFinance();
    renderAnalysis();
    renderInvestments();
    renderContacts();
    updateLifeScore();
}

// --- Categories & Subcategories ---
function renderCategories() {
    const grid = document.getElementById('categoriesGrid');
    grid.innerHTML = data.categories.map((cat, idx) => `
        <div class="card category-card">
            <div class="cat-header">
                <h3>${cat.name}</h3>
                <span class="cat-score">${(cat.scores.reduce((a, b) => a + b, 0) / cat.scores.length).toFixed(1)}</span>
            </div>
            <div class="sliders-container">
                ${cat.sub.map((sub, sIdx) => `
                    <div class="slider-group">
                        <label>${sub} <span>${cat.scores[sIdx]}</span></label>
                        <input type="range" min="1" max="10" value="${cat.scores[sIdx]}" 
                            oninput="updateCategoryScore(${idx}, ${sIdx}, this.value)">
                    </div>
                `).join('')}
                <button class="btn-text" onclick="addSubcategory(${idx})">+ Add Subcategory</button>
            </div>
            <textarea placeholder="Reflections..." onchange="updateReflection(${idx}, this.value)">${cat.reflection || ''}</textarea>
            <button class="btn-delete-cat" onclick="deleteCategory(${idx})"><i class="fas fa-trash"></i></button>
        </div>
    `).join('');
}

function updateCategoryScore(catIdx, subIdx, value) {
    data.categories[catIdx].scores[subIdx] = parseInt(value);
    saveData();
    renderCategories(); // Re-render to update numbers
}

function updateReflection(catIdx, val) {
    data.categories[catIdx].reflection = val;
    saveData();
}

function addCategory() {
    const name = document.getElementById('newCatName').value;
    if (name) {
        data.categories.push({
            id: Date.now(),
            name: name,
            sub: ['General'],
            scores: [5],
            reflection: ''
        });
        saveData();
        renderCategories();
        renderModalCatList();
        document.getElementById('newCatName').value = '';
    }
}

function addSubcategory(catIdx) {
    const name = prompt("Enter subcategory name:");
    if (name) {
        data.categories[catIdx].sub.push(name);
        data.categories[catIdx].scores.push(5);
        saveData();
        renderCategories();
    }
}

function deleteCategory(idx) {
    if (confirm('Delete this category?')) {
        data.categories.splice(idx, 1);
        saveData();
        renderCategories();
    }
}

// --- Finance ---
function updateCurrencyDisplay() {
    data.currency = document.getElementById('currencySelector').value;
    saveData();
    renderFinance();
    renderAnalysis();
    renderInvestments();
}

function renderFinance() {
    const cur = data.currency;
    
    // Income
    const incList = document.getElementById('incomeList');
    incList.innerHTML = data.income.map((i, idx) => `
        <div class="list-item">
            <span>${i.source} <small>(${i.type})</small></span>
            <span>${cur}${i.amount} <i class="fas fa-times text-danger" onclick="deleteItem('income', ${idx})"></i></span>
        </div>
    `).join('');
    
    const currentInc = data.income.filter(i => i.type === 'Current').reduce((a, b) => a + Number(b.amount), 0);
    const projInc = data.income.filter(i => i.type === 'Upcoming').reduce((a, b) => a + Number(b.amount), 0);
    document.getElementById('totalIncome').textContent = `${cur}${currentInc}`;
    document.getElementById('projectedIncome').textContent = `${cur}${projInc}`;

    // Expenses
    const expList = document.getElementById('expenseList');
    expList.innerHTML = data.expenses.map((e, idx) => `
        <div class="list-item">
            <span>${e.name} <small>${e.type}</small></span>
            <span>${e.currency}${e.cost} <i class="fas fa-times text-danger" onclick="deleteItem('expenses', ${idx})"></i></span>
        </div>
    `).join('');
    
    // Simple total (ignoring currency conversion for simplicity in this view)
    const totalExp = data.expenses.reduce((a, b) => a + Number(b.cost), 0);
    document.getElementById('totalExpense').textContent = `${totalExp}`;

    // Banks
    const bankList = document.getElementById('bankList');
    bankList.innerHTML = data.banks.map((b, idx) => `
        <div class="list-item">
            <span>${b.name}</span>
            <span>${cur}${b.balance} <i class="fas fa-times text-danger" onclick="deleteItem('banks', ${idx})"></i></span>
        </div>
    `).join('');
    const totalBank = data.banks.reduce((a, b) => a + Number(b.balance), 0);
    document.getElementById('totalBank').textContent = `${cur}${totalBank}`;
}

function renderInvestments() {
    const tbody = document.getElementById('investmentTable');
    tbody.innerHTML = data.investments.map((inv, idx) => `
        <tr>
            <td><span class="badge">${inv.domain}</span></td>
            <td>${inv.platform}</td>
            <td>${inv.duration}</td>
            <td>${data.currency}${inv.amount}</td>
            <td><button class="btn-icon text-danger" onclick="deleteItem('investments', ${idx})"><i class="fas fa-trash"></i></button></td>
        </tr>
    `).join('');
}

// --- Contacts ---
function renderContacts() {
    const family = data.contacts.filter(c => c.type === 'personal');
    const network = data.contacts.filter(c => c.type === 'business');

    const renderList = (list, containerId) => {
        document.getElementById(containerId).innerHTML = list.map(c => `
            <div class="contact-item">
                <div class="c-avatar">${c.name.charAt(0)}</div>
                <div class="c-info">
                    <h4>${c.name}</h4>
                    <p>${c.profession} • ${c.location || 'Unknown'}</p>
                </div>
                <button onclick="deleteContact(${c.id})" class="btn-icon"><i class="fas fa-times"></i></button>
            </div>
        `).join('');
    };

    renderList(family, 'familyList');
    renderList(network, 'networkList');
}

// --- Actions ---
document.getElementById('incomeForm').addEventListener('submit', e => {
    e.preventDefault();
    data.income.push({
        source: document.getElementById('incSource').value,
        amount: document.getElementById('incAmount').value,
        type: document.getElementById('incType').value
    });
    saveData(); renderFinance(); renderAnalysis(); closeModal('incomeModal'); e.target.reset();
});

document.getElementById('expenseForm').addEventListener('submit', e => {
    e.preventDefault();
    data.expenses.push({
        name: document.getElementById('expName').value,
        cost: document.getElementById('expCost').value,
        currency: document.getElementById('expCurrency').value,
        type: document.getElementById('expType').value || 'Uncategorized'
    });
    saveData(); renderFinance(); renderAnalysis(); closeModal('expenseModal'); e.target.reset();
});

document.getElementById('bankForm').addEventListener('submit', e => {
    e.preventDefault();
    data.banks.push({
        name: document.getElementById('bankName').value,
        balance: document.getElementById('bankBalance').value
    });
    saveData(); renderFinance(); closeModal('bankModal'); e.target.reset();
});

document.getElementById('investForm').addEventListener('submit', e => {
    e.preventDefault();
    data.investments.push({
        domain: document.getElementById('invDomain').value,
        platform: document.getElementById('invPlatform').value,
        duration: document.getElementById('invDuration').value,
        amount: document.getElementById('invAmount').value
    });
    saveData(); renderInvestments(); closeModal('investModal'); e.target.reset();
});

document.getElementById('contactForm').addEventListener('submit', e => {
    e.preventDefault();
    data.contacts.push({
        id: Date.now(),
        type: document.getElementById('contactType').value,
        name: document.getElementById('cName').value,
        profession: document.getElementById('cProfession').value,
        age: document.getElementById('cAge').value,
        location: document.getElementById('cLocation').value,
        country: document.getElementById('cCountry').value,
        info: document.getElementById('cInfo').value
    });
    saveData(); renderContacts(); closeModal('contactModal'); e.target.reset();
});

function deleteItem(arrayName, idx) {
    if(confirm('Remove item?')) {
        data[arrayName].splice(idx, 1);
        saveData();
        if(arrayName === 'investments') {
            renderInvestments();
        } else {
            renderFinance();
            renderAnalysis();
        }
    }
}

function deleteContact(id) {
    if(confirm('Remove contact?')) {
        data.contacts = data.contacts.filter(c => c.id !== id);
        saveData();
        renderContacts();
    }
}

// --- Chart & Score ---
function updateLifeScore() {
    let total = 0, count = 0;
    data.categories.forEach(c => {
        c.scores.forEach(s => {
            total += s;
            count++;
        });
    });
    const avg = count ? (total / count).toFixed(1) : 0.0;
    document.getElementById('overallScore').textContent = avg;
}

function initChart() {
    const ctx = document.getElementById('growthChart').getContext('2d');
    growthChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.history.map(h => new Date(h.date).toLocaleDateString()),
            datasets: [{
                label: 'Life Score',
                data: data.history.map(h => h.score),
                borderColor: '#007bff',
                tension: 0.4
            }],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { labels: { color: '#374151' } }
            },
            scales: {
                y: {
                    ticks: { color: '#6b7280' },
                    grid: { color: '#e5e7eb' }
                },
                x: {
                    ticks: { color: '#6b7280' },
                    grid: { color: '#e5e7eb' }
                }
            }
        }
    });
}

function logToday() {
    const score = document.getElementById('overallScore').textContent;
    data.history.push({ date: new Date().toISOString(), score: score });
    saveData();
    // Update chart
    growthChart.data.labels.push(new Date().toLocaleDateString());
    growthChart.data.datasets[0].data.push(score);
    growthChart.update();
}

function resetHistory() {
    if(confirm('Clear all history?')) {
        data.history = [];
        saveData();
        growthChart.data.labels = [];
        growthChart.data.datasets[0].data = [];
        growthChart.update();
    }
}

// --- Analysis ---
function renderAnalysis() {
    const cur = data.currency;
    document.querySelectorAll('.currency-symbol').forEach(el => el.textContent = cur);

    // 1. Calculate Income in main currency
    const totalIncome = data.income
        .filter(i => i.type === 'Current')
        .reduce((a, b) => a + Number(b.amount), 0);

    // 2. Calculate Expenses in main currency
    const expensesInMainCurrency = data.expenses.filter(e => e.currency === cur);
    const totalExpense = expensesInMainCurrency.reduce((a, b) => a + Number(b.cost), 0);
    
    // 3. Calculate Net Flow
    const netFlow = totalIncome - totalExpense;

    // 4. Update Summary DOM
    document.getElementById('analysisIncome').textContent = `${cur}${totalIncome.toFixed(2)}`;
    document.getElementById('analysisExpense').textContent = `${cur}${totalExpense.toFixed(2)}`;
    const netFlowEl = document.getElementById('analysisNetFlow');
    netFlowEl.textContent = `${cur}${netFlow.toFixed(2)}`;
    netFlowEl.className = 'text-primary'; // reset
    if (netFlow >= 0) {
        netFlowEl.classList.add('text-success');
    } else {
        netFlowEl.classList.add('text-danger');
    }

    // 5. Group expenses by category for the chart
    const expenseGroups = expensesInMainCurrency.reduce((acc, expense) => {
        const category = expense.type || 'Uncategorized';
        if (!acc[category]) {
            acc[category] = 0;
        }
        acc[category] += Number(expense.cost);
        return acc;
    }, {});

    const chartLabels = Object.keys(expenseGroups);
    const chartData = Object.values(expenseGroups);

    // 6. Render Doughnut Chart
    const ctx = document.getElementById('expenseChart').getContext('2d');
    
    if (expenseChart) {
        expenseChart.destroy();
    }

    if (chartLabels.length > 0) {
        expenseChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: chartLabels,
                datasets: [{
                    label: 'Expense Breakdown',
                    data: chartData,
                    backgroundColor: ['#dc3545', '#fd7e14', '#ffc107', '#28a745', '#20c997', '#17a2b8', '#007bff', '#6f42c1', '#e83e8c'],
                    borderColor: '#fff',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            color: '#374151'
                        }
                    }
                }
            }
        });
    } else {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#9ca3af';
        ctx.fillText('No expense data in selected currency.', ctx.canvas.width / 2, ctx.canvas.height / 2);
    }
}

// --- Modals ---
function openCategoryModal() {
    document.getElementById('categoryModal').classList.add('active');
    renderModalCatList();
}
function renderModalCatList() {
    const list = document.getElementById('modalCatList');
    list.innerHTML = data.categories.map((c, i) => `
        <div class="list-item">
            <span>${c.name}</span>
            <button class="text-danger btn-icon" onclick="deleteCategory(${i})"><i class="fas fa-trash"></i></button>
        </div>
    `).join('');
}

function openIncomeModal() { document.getElementById('incomeModal').classList.add('active'); }
function openExpenseModal() { document.getElementById('expenseModal').classList.add('active'); }
function openBankModal() { document.getElementById('bankModal').classList.add('active'); }
function openInvestModal() { document.getElementById('investModal').classList.add('active'); }

function openContactModal(type) {
    document.getElementById('contactType').value = type;
    document.getElementById('contactModalTitle').textContent = type === 'personal' ? 'Add Friend/Family' : 'Add Professional Contact';
    document.getElementById('contactModal').classList.add('active');
}

function closeModal(id) { document.getElementById(id).classList.remove('active'); }