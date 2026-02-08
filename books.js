// Books – book list, reading log (date/time, chapter, learnings), daily tracker, calendar

const BOOKS_STORAGE_KEY = 'codenibbler-books';
const SESSIONS_STORAGE_KEY = 'codenibbler-reading-sessions';

let books = [];
let sessions = [];
let calendarMonth = new Date().getMonth();
let calendarYear = new Date().getFullYear();

function loadData() {
    try {
        const b = localStorage.getItem(BOOKS_STORAGE_KEY);
        books = b ? JSON.parse(b) : [];
        const s = localStorage.getItem(SESSIONS_STORAGE_KEY);
        sessions = s ? JSON.parse(s) : [];
        sessions.sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime));
    } catch (e) {
        books = [];
        sessions = [];
    }
}

function saveBooks() {
    localStorage.setItem(BOOKS_STORAGE_KEY, JSON.stringify(books));
    renderBooksList();
    renderBookSelect();
}

function saveSessions() {
    localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
    sessions.sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime));
    renderSessions();
    renderCalendar();
    renderStats();
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Live day
function updateLiveDay() {
    const el = document.getElementById('liveDay');
    if (!el) return;
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };
    el.textContent = 'Live: ' + now.toLocaleDateString(undefined, options);
}

// Stats
function renderStats() {
    const el = document.getElementById('readingStats');
    if (!el) return;
    const today = new Date().toDateString();
    const todayCount = sessions.filter(s => new Date(s.dateTime).toDateString() === today).length;
    const thisMonth = new Date().getMonth();
    const thisYear = new Date().getFullYear();
    const monthCount = sessions.filter(s => {
        const d = new Date(s.dateTime);
        return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    }).length;
    el.innerHTML = `Today: <strong>${todayCount}</strong> reading log(s) &nbsp;|&nbsp; This month: <strong>${monthCount}</strong> reading log(s)`;
}

// Calendar
function getDaysWithReading(month, year) {
    const set = new Set();
    sessions.forEach(s => {
        const d = new Date(s.dateTime);
        if (d.getMonth() === month && d.getFullYear() === year) {
            set.add(d.getDate());
        }
    });
    return set;
}

function renderCalendar() {
    const wrap = document.getElementById('booksCalendar');
    const monthYearEl = document.getElementById('calMonthYear');
    if (!wrap || !monthYearEl) return;

    const first = new Date(calendarYear, calendarMonth, 1);
    const last = new Date(calendarYear, calendarMonth + 1, 0);
    const startDay = first.getDay();
    const daysInMonth = last.getDate();
    const prevMonthLast = new Date(calendarYear, calendarMonth, 0).getDate();

    monthYearEl.textContent = first.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

    const daysWithReading = getDaysWithReading(calendarMonth, calendarYear);
    const today = new Date();
    const isCurrentMonth = today.getMonth() === calendarMonth && today.getFullYear() === calendarYear;
    const todayDate = today.getDate();

    let html = '';
    const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    dayLabels.forEach(l => { html += `<div class="cal-day-label">${l}</div>`; });

    for (let i = 0; i < startDay; i++) {
        const d = prevMonthLast - startDay + i + 1;
        html += `<div class="cal-day other-month">${d}</div>`;
    }
    for (let d = 1; d <= daysInMonth; d++) {
        let cls = 'cal-day';
        if (isCurrentMonth && d === todayDate) cls += ' today';
        if (daysWithReading.has(d)) cls += ' read';
        html += `<div class="${cls}" title="${daysWithReading.has(d) ? 'You read on this day' : ''}">${d}</div>`;
    }
    const totalCells = startDay + daysInMonth;
    const remaining = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
    for (let i = 0; i < remaining; i++) {
        html += `<div class="cal-day other-month">${i + 1}</div>`;
    }
    wrap.innerHTML = html;
}

function prevMonth() {
    if (calendarMonth === 0) {
        calendarMonth = 11;
        calendarYear--;
    } else {
        calendarMonth--;
    }
    renderCalendar();
}

function nextMonth() {
    if (calendarMonth === 11) {
        calendarMonth = 0;
        calendarYear++;
    } else {
        calendarMonth++;
    }
    renderCalendar();
}

// Books list
function renderBooksList() {
    const el = document.getElementById('booksList');
    if (!el) return;
    if (books.length === 0) {
        el.innerHTML = '<div class="empty-books">No books yet. Add your first book above.</div>';
        return;
    }
    el.innerHTML = books.map(b => `
        <div class="book-item" data-id="${b.id}">
            <div class="book-info">
                <strong>${escapeHtml(b.title)}</strong>
                ${b.author ? `<span>${escapeHtml(b.author)}</span>` : ''}
            </div>
            <div class="book-actions">
                <button type="button" class="delete" data-id="${b.id}">Delete</button>
            </div>
        </div>
    `).join('');
    el.querySelectorAll('.book-actions button.delete').forEach(btn => {
        btn.addEventListener('click', () => deleteBook(btn.dataset.id));
    });
}

function renderBookSelect() {
    const el = document.getElementById('logBook');
    if (!el) return;
    const current = el.value;
    el.innerHTML = '<option value="">Select a book...</option>' + books.map(b => `<option value="${b.id}" ${b.id === current ? 'selected' : ''}>${escapeHtml(b.title)}${b.author ? ' – ' + escapeHtml(b.author) : ''}</option>`).join('');
}

function addBook() {
    const titleEl = document.getElementById('bookTitle');
    const authorEl = document.getElementById('bookAuthor');
    const title = titleEl && titleEl.value.trim();
    if (!title) {
        alert('Enter a book title.');
        return;
    }
    const book = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2),
        title,
        author: authorEl ? authorEl.value.trim() : '',
        createdAt: new Date().toISOString()
    };
    books.push(book);
    saveBooks();
    titleEl.value = '';
    if (authorEl) authorEl.value = '';
}

function deleteBook(id) {
    if (!confirm('Remove this book from your list?')) return;
    books = books.filter(b => b.id !== id);
    sessions = sessions.filter(s => s.bookId !== id);
    saveBooks();
    saveSessions();
}

// Reading log
function logReading() {
    const bookId = document.getElementById('logBook')?.value;
    const dateTimeEl = document.getElementById('logDateTime');
    const chapterEl = document.getElementById('logChapter');
    const learnedEl = document.getElementById('logLearned');
    if (!bookId) {
        alert('Select a book.');
        return;
    }
    let dateTime = dateTimeEl && dateTimeEl.value;
    if (!dateTime) {
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        dateTime = now.toISOString().slice(0, 16);
    }
    const session = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2),
        bookId,
        dateTime: new Date(dateTime).toISOString(),
        chapter: chapterEl ? chapterEl.value.trim() : '',
        learned: learnedEl ? learnedEl.value.trim() : '',
        createdAt: new Date().toISOString()
    };
    sessions.unshift(session);
    saveSessions();
    if (dateTimeEl) dateTimeEl.value = '';
    if (chapterEl) chapterEl.value = '';
    if (learnedEl) learnedEl.value = '';
}

function renderSessions() {
    const el = document.getElementById('readingSessionsList');
    if (!el) return;
    if (sessions.length === 0) {
        el.innerHTML = '<div class="empty-sessions">No reading logs yet. Log your first reading above.</div>';
        return;
    }
    const bookMap = {};
    books.forEach(b => { bookMap[b.id] = b; });
    el.innerHTML = sessions.slice(0, 30).map(s => {
        const book = bookMap[s.bookId];
        const bookTitle = book ? book.title : 'Unknown book';
        const d = new Date(s.dateTime);
        const dateStr = d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
        const timeStr = d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
        return `
            <div class="session-item">
                <div class="session-book">${escapeHtml(bookTitle)}</div>
                <div class="session-meta">${dateStr} at ${timeStr} ${s.chapter ? ' · ' + escapeHtml(s.chapter) : ''}</div>
                ${s.learned ? `<div class="session-learned">${escapeHtml(s.learned)}</div>` : ''}
            </div>
        `;
    }).join('');
}

function init() {
    loadData();
    updateLiveDay();
    setInterval(updateLiveDay, 1000);
    renderStats();
    renderCalendar();
    renderBooksList();
    renderBookSelect();
    renderSessions();

    document.getElementById('btnAddBook')?.addEventListener('click', addBook);
    document.getElementById('btnLogReading')?.addEventListener('click', logReading);
    document.getElementById('calPrev')?.addEventListener('click', prevMonth);
    document.getElementById('calNext')?.addEventListener('click', nextMonth);

    const dateTimeEl = document.getElementById('logDateTime');
    if (dateTimeEl) {
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        dateTimeEl.value = now.toISOString().slice(0, 16);
    }
}

document.addEventListener('DOMContentLoaded', init);
