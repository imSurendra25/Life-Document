document.addEventListener('DOMContentLoaded', () => {
    loadJourney();
});

function loadJourney() {
    const timeline = document.getElementById('journeyTimeline');
    const events = [];

    // Helper to safely parse JSON
    const getStore = (key) => {
        try {
            return JSON.parse(localStorage.getItem(key)) || {};
        } catch (e) {
            return {};
        }
    };

    // 1. Dashboard Data (Tasks, Journal, Habits, Courses)
    const dashData = getStore('codenibbler-data');
    
    // Tasks
    if (dashData.tasks && Array.isArray(dashData.tasks)) {
        dashData.tasks.forEach(task => {
            if (task.completed) {
                events.push({
                    date: new Date(task.createdAt || Date.now()), // Fallback if no completion date stored
                    type: 'Task',
                    icon: 'fa-check-circle',
                    title: 'Completed Task',
                    desc: task.text,
                    source: 'Dashboard'
                });
            }
        });
    }

    // Journal Entries
    if (dashData.journal && Array.isArray(dashData.journal)) {
        dashData.journal.forEach(entry => {
            events.push({
                date: new Date(entry.timestamp || Date.now()),
                type: 'Journal',
                icon: 'fa-book',
                title: 'Journal Entry',
                desc: entry.text.substring(0, 100) + (entry.text.length > 100 ? '...' : ''),
                source: 'Journal'
            });
        });
    }

    // Courses (Learning)
    if (dashData.courses && Array.isArray(dashData.courses)) {
        dashData.courses.forEach(course => {
            events.push({
                date: new Date(course.createdAt || Date.now()), // Assuming creation is the start
                type: 'Learning',
                icon: 'fa-graduation-cap',
                title: `Started Course: ${course.name}`,
                desc: `Current Progress: ${course.progress}%`,
                source: 'Learning'
            });
        });
    }

    // 2. Blog Posts
    const blogData = getStore('codenibbler-blog');
    if (blogData.posts && Array.isArray(blogData.posts)) {
        blogData.posts.forEach(post => {
            if (post.status === 'published') {
                events.push({
                    date: new Date(post.createdAt),
                    type: 'Blog',
                    icon: 'fa-pen-nib',
                    title: `Published: ${post.title}`,
                    desc: `Category: ${post.category}`,
                    source: 'Blog'
                });
            }
        });
    }

    // 3. Projects
    const projectData = getStore('codenibbler-projects'); // Assuming key
    if (projectData.projects && Array.isArray(projectData.projects)) {
        projectData.projects.forEach(proj => {
            events.push({
                date: new Date(proj.createdAt || Date.now()),
                type: 'Project',
                icon: 'fa-code',
                title: `New Project: ${proj.title}`,
                desc: proj.desc || 'No description',
                source: 'Projects'
            });
        });
    }

    // 4. Books
    const bookData = getStore('codenibbler-books'); // Assuming key
    if (bookData.logs && Array.isArray(bookData.logs)) {
        bookData.logs.forEach(log => {
            events.push({
                date: new Date(log.date || Date.now()),
                type: 'Reading',
                icon: 'fa-book-open',
                title: `Read: ${log.bookTitle}`,
                desc: `Learned: ${log.learned}`,
                source: 'Books'
            });
        });
    }

    // 5. Brainstorm Ideas
    const ideaData = getStore('codenibbler-brainstorm');
    if (ideaData.ideas && Array.isArray(ideaData.ideas)) {
        ideaData.ideas.forEach(idea => {
            events.push({
                date: new Date(idea.createdAt || Date.now()),
                type: 'Idea',
                icon: 'fa-lightbulb',
                title: `New Idea: ${idea.title}`,
                desc: idea.content,
                source: 'Brainstorm'
            });
        });
    }

    // 6. Goals
    const goalData = getStore('codenibbler-goals');
    if (goalData.goals && Array.isArray(goalData.goals)) {
        goalData.goals.forEach(goal => {
            events.push({
                date: new Date(goal.startDate || Date.now()),
                type: 'Goal',
                icon: 'fa-bullseye',
                title: `Set Goal: ${goal.title}`,
                desc: goal.desc,
                source: 'Goals'
            });
        });
    }

    // Sort events by date (newest first)
    events.sort((a, b) => b.date - a.date);

    // Update Stats
    document.getElementById('totalMilestones').textContent = events.length;
    if (events.length > 0) {
        const firstDate = events[events.length - 1].date;
        const diffTime = Math.abs(new Date() - firstDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        document.getElementById('daysActive').textContent = diffDays;
        
        const lastDate = events[0].date;
        document.getElementById('latestActivity').textContent = lastDate.toLocaleDateString();
    }

    // Render Timeline
    timeline.innerHTML = '';
    
    if (events.length === 0) {
        timeline.innerHTML = `
            <div style="text-align:center; padding: 40px;">
                <h3>Your journey starts now!</h3>
                <p>Complete tasks, write journals, or add projects to see them appear here.</p>
            </div>`;
        return;
    }

    events.forEach(event => {
        const dateStr = event.date.toLocaleDateString(undefined, { 
            weekday: 'short', 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        const html = `
            <div class="timeline-item">
                <div class="timeline-icon">
                    <i class="fas ${event.icon}"></i>
                </div>
                <div class="timeline-content">
                    <span class="timeline-date">${dateStr}</span>
                    <h3>${event.title}</h3>
                    <p>${event.desc}</p>
                    <span class="timeline-tag">${event.source}</span>
                </div>
            </div>
        `;
        timeline.innerHTML += html;
    });
}