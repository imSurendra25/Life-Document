// Constants
const BIZ_KEY = 'codenibbler-business-ideas';
const CLIENT_KEY = 'codenibbler-clients';
const FIN_KEY = 'codenibbler-finance';

// State
let businesses = [];
let clients = [];
let transactions = [];

// Init
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    initClock();
    renderBusinesses();
    renderClients();
    renderFinance();
    updateStats();
});

// --- Data Management ---
function loadData() {
    const bData = localStorage.getItem(BIZ_KEY);
    const cData = localStorage.getItem(CLIENT_KEY);
    const fData = localStorage.getItem(FIN_KEY);

    if (bData) businesses = JSON.parse(bData);
    if (cData) clients = JSON.parse(cData);
    if (fData) transactions = JSON.parse(fData);
}

function saveData() {
    localStorage.setItem(BIZ_KEY, JSON.stringify(businesses));
    localStorage.setItem(CLIENT_KEY, JSON.stringify(clients));
    localStorage.setItem(FIN_KEY, JSON.stringify(transactions));
    updateStats();
}

// --- Render Functions ---
function renderBusinesses(filter = 'all') {
    const container = document.getElementById('businessList');
    const select = document.getElementById('tBusiness');
    
    // Update Select Dropdown for Finance
    if(select) {
        select.innerHTML = '<option value="">Select Business...</option>' + 
            businesses.map(b => `<option value="${b.id}">${b.name}</option>`).join('');
    }

    let filtered = businesses;
    if (filter === 'active') filtered = businesses.filter(b => ['Active', 'Scaled'].includes(b.status));
    if (filter === 'idea') filtered = businesses.filter(b => ['Idea', 'Planning'].includes(b.status));

    container.innerHTML = filtered.map(b => {
        // Calculate financials for this business
        const bizTrans = transactions.filter(t => t.businessId == b.id);
        const rev = bizTrans.filter(t => t.type === 'Revenue').reduce((acc, t) => acc + Number(t.amount), 0);
        const exp = bizTrans.filter(t => t.type === 'Expense').reduce((acc, t) => acc + Number(t.amount), 0);
        const profit = rev - exp;

        return `
        <div class="business-card ${b.status === 'Active' ? 'active-biz' : 'idea-biz'}">
            <div class="biz-header">
                <div>
                    <h3 style="margin-bottom:5px;">${b.name}</h3>
                    <span class="biz-type">${b.type}</span>
                </div>
                <span class="biz-status" style="color: ${b.status === 'Active' ? 'var(--success)' : 'var(--warning)'}">${b.status}</span>
            </div>
            <p style="font-size:0.9rem; color:#666; margin-bottom:1rem;">${b.swot ? b.swot.substring(0, 80) + '...' : 'No analysis added.'}</p>
            
            <div class="biz-stats">
                <div class="b-stat">
                    <span class="text-success">$${rev.toLocaleString()}</span>
                    <label>Revenue</label>
                </div>
                <div class="b-stat">
                    <span class="${profit >= 0 ? 'text-success' : 'text-danger'}">$${profit.toLocaleString()}</span>
                    <label>Profit</label>
                </div>
                <div class="b-stat">
                    <span>${clients.filter(c => c.businessId == b.id).length}</span>
                    <label>Clients</label>
                </div>
            </div>

            <div class="biz-footer">
                <small>Updated: ${new Date(b.updated).toLocaleDateString()}</small>
                <div class="biz-actions">
                    <button onclick="deleteBusiness(${b.id})"><i class="fas fa-trash"></i></button>
                    <button onclick="alert('Edit feature coming soon!')"><i class="fas fa-edit"></i></button>
                </div>
            </div>
        </div>
    `}).join('');
}

function renderClients() {
    const container = document.getElementById('clientList');
    container.innerHTML = clients.map(c => `
        <div class="client-item">
            <div class="client-info">
                <h4>${c.name}</h4>
                <p>${c.email || 'No email'} • ${getBusinessName(c.businessId)}</p>
            </div>
            <button onclick="deleteClient(${c.id})" style="border:none; background:none; color:#ef4444; cursor:pointer;"><i class="fas fa-times"></i></button>
        </div>
    `).join('');
}

function renderFinance() {
    const list = document.getElementById('transactionList');
    
    // Calculate Totals
    const invest = transactions.filter(t => t.type === 'Investment').reduce((acc, t) => acc + Number(t.amount), 0);
    const expense = transactions.filter(t => t.type === 'Expense').reduce((acc, t) => acc + Number(t.amount), 0);
    const revenue = transactions.filter(t => t.type === 'Revenue').reduce((acc, t) => acc + Number(t.amount), 0);

    document.getElementById('sumInvest').textContent = `$${invest.toLocaleString()}`;
    document.getElementById('sumExpense').textContent = `$${expense.toLocaleString()}`;
    document.getElementById('sumRevenue').textContent = `$${revenue.toLocaleString()}`;

    // Render List (Last 10)
    list.innerHTML = transactions.slice(0, 10).map(t => `
        <div class="trans-item ${t.type.toLowerCase()}">
            <div>
                <strong>${t.type}</strong> - ${t.desc}
                <div style="font-size:0.75rem; color:#888;">${new Date(t.date).toLocaleDateString()} • ${getBusinessName(t.businessId)}</div>
            </div>
            <span style="font-weight:600;">$${Number(t.amount).toLocaleString()}</span>
        </div>
    `).join('');
}

function updateStats() {
    const totalRev = transactions.filter(t => t.type === 'Revenue').reduce((acc, t) => acc + Number(t.amount), 0);
    const totalExp = transactions.filter(t => t.type === 'Expense').reduce((acc, t) => acc + Number(t.amount), 0);
    
    document.getElementById('totalRevenue').textContent = `$${totalRev.toLocaleString()}`;
    document.getElementById('totalProfit').textContent = `$${(totalRev - totalExp).toLocaleString()}`;
    document.getElementById('totalClients').textContent = clients.length;
}

// --- Actions ---
document.getElementById('businessForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('bName').value;
    const type = document.getElementById('bType').value;
    const status = document.getElementById('bStatus').value;
    const dist = document.getElementById('bDist').value;
    const swot = document.getElementById('bSwot').value;

    const newBiz = {
        id: Date.now(),
        name, type, status, dist, swot,
        updated: new Date().toISOString()
    };

    businesses.unshift(newBiz);
    saveData();
    renderBusinesses();
    closeModal('businessModal');
    e.target.reset();
});

document.getElementById('transactionForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const businessId = document.getElementById('tBusiness').value;
    const type = document.getElementById('tType').value;
    const amount = document.getElementById('tAmount').value;
    const desc = document.getElementById('tDesc').value;
    const date = document.getElementById('tDate').value;

    if(!businessId) { alert('Please select a business'); return; }

    const newTrans = {
        id: Date.now(),
        businessId, type, amount, desc, date
    };

    transactions.unshift(newTrans);
    saveData();
    renderFinance();
    renderBusinesses(); // Update cards
    closeModal('transactionModal');
    e.target.reset();
});

function deleteBusiness(id) {
    if(confirm('Delete this business? All related clients and finance data will remain but be unlinked.')) {
        businesses = businesses.filter(b => b.id !== id);
        saveData();
        renderBusinesses();
    }
}

function deleteClient(id) {
    if(confirm('Remove client?')) {
        clients = clients.filter(c => c.id !== id);
        saveData();
        renderClients();
    }
}

// --- Helpers ---
function getBusinessName(id) {
    const b = businesses.find(b => b.id == id);
    return b ? b.name : 'Unknown Business';
}

function filterBusinesses(filter) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');
    renderBusinesses(filter);
}

// --- Modals ---
function openBusinessModal() { document.getElementById('businessModal').classList.add('active'); }
function openTransactionModal() { 
    // Set default date
    document.getElementById('tDate').valueAsDate = new Date();
    document.getElementById('transactionModal').classList.add('active'); 
}
function openClientModal() {
    const name = prompt("Client Name:");
    if(!name) return;
    const email = prompt("Client Email (Optional):");
    
    // Simple prompt-based add for brevity, can be full modal
    if(businesses.length === 0) { alert("Create a business first!"); return; }
    
    // Auto-assign to first business for MVP or ask
    const bizName = prompt("Assign to Business (Enter exact name):", businesses[0].name);
    const biz = businesses.find(b => b.name === bizName);
    
    if(biz) {
        clients.push({ id: Date.now(), name, email, businessId: biz.id });
        saveData();
        renderClients();
        renderBusinesses(); // Update client count
    } else {
        alert("Business not found.");
    }
}

function closeModal(id) { document.getElementById(id).classList.remove('active'); }

// --- Clock & Calendar ---
function initClock() {
    const timeEl = document.getElementById('liveClock');
    const dateEl = document.getElementById('liveDate');
    const yearEl = document.getElementById('currentYear');
    const daysEl = document.getElementById('daysLeft');
    const progEl = document.getElementById('yearProgress');

    const update = () => {
        const now = new Date();
        timeEl.textContent = now.toLocaleTimeString();
        dateEl.textContent = now.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
        
        // Year Progress
        const start = new Date(now.getFullYear(), 0, 0);
        const diff = now - start;
        const oneDay = 1000 * 60 * 60 * 24;
        const day = Math.floor(diff / oneDay);
        const totalDays = 365;
        const percent = (day / totalDays) * 100;
        
        yearEl.textContent = now.getFullYear();
        daysEl.textContent = totalDays - day;
        progEl.style.width = `${percent}%`;
    };
    setInterval(update, 1000);
    update();
}