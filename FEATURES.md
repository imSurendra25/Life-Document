# CodeNibbler - Complete Feature Documentation

## Dashboard Features (main.html)

### Sidebar Components
1. **Live Time Display** ⏱️
   - Real-time clock updating every second
   - Shows current time in HH:MM:SS format

2. **Days Left Counter** 📅
   - Automatically calculates remaining days in current year
   - Updates daily

3. **Progress Charts** 📊
   - **Daily Progress**: Based on completed tasks/habits today
   - **Yearly Progress**: Based on days passed (auto-calculated)
   - Visual bar charts with percentage display

4. **Year Overview (Dot Calendar)** 🎨
   - 365 dots representing each day of the year
   - Color coding:
     - Gray: Not completed
     - Yellow: Partially completed
     - Green: Fully completed
     - Blue: Today
   - Interactive: Click dots to toggle completion status

### Main Content Sections

#### 1. **Daily Affirmations** 🌟
   - Time-based tabs: Morning, Afternoon, Evening, Dinner, Night
   - Add custom affirmations for each time period
   - Display random affirmation from selected time
   - View all affirmations for current time
   - Delete affirmations individually
   - Data persists in localStorage

#### 2. **Habits & Categories** 🎯
   - Create multiple habit categories
   - Manage categories (add/delete)
   - Add habits with:
     - Name
     - Category
     - Time of day
   - Mark habits as complete/incomplete
   - Edit and delete habits
   - Progress tracking across all habits

#### 3. **Skills Dashboard** 💡
   - Add skills with proficiency levels:
     - Beginner
     - Intermediate
     - Advanced
     - Expert
   - Color-coded skill levels
   - Track skill development
   - Add and delete skills

#### 4. **Daily To-Do List** ✅
   - Add tasks with optional time scheduling
   - Auto-sorted by time
   - Check off completed tasks
   - Visual feedback for completion
   - Delete tasks
   - Track daily completion percentage

#### 5. **Learning Courses** 📚
   - Add courses with progress percentage
   - Track progress on multiple courses simultaneously
   - Update progress anytime
   - Visual progress bars
   - Delete completed/dropped courses

#### 6. **Journal with Categories** 📝
   - Create multiple journal categories
   - Manage categories (add/delete)
   - Write journal entries in markdown
   - Auto-save entry dates and timestamps
   - Edit entries anytime
   - Delete entries
   - View all entries by category
   - Search functionality

### Data Management
- **Automatic LocalStorage Persistence**: All data automatically saves to browser storage
- **No Account Required**: Works offline and on any browser
- **Portable**: Export/import data across devices
- **Real-time Updates**: All changes instantly reflected

---

## Blog Management (blog.html)

### Blog Features
1. **Create Blog Posts**
   - Title
   - Category (create/manage categories)
   - Tags (multiple)
   - Rich content editing
   - Featured image URL
   - Publish or Save as Draft

2. **Blog Categories**
   - Create custom categories
   - Assign posts to categories
   - Filter by category
   - Delete categories (auto-removes from posts)

3. **Blog Post Management**
   - View all posts in grid layout
   - Filter by:
     - Search text (title/content)
     - Category
     - Status (Published/Draft)
   - Edit existing posts
   - Delete posts
   - View detailed post with formatting

4. **Blog Features**
   - Post metadata (date, category, status)
   - Post statistics (views, likes)
   - Draft management
   - Publication status
   - Full-screen post view modal
   - Responsive blog card layout

---

## Technical Stack

### Frontend
- HTML5 (Semantic)
- CSS3 (Responsive Grid/Flexbox)
- Vanilla JavaScript (ES6+)

### Data Storage
- Browser LocalStorage API
- JSON serialization
- Client-side only (no backend required)

### Browser Compatibility
- All modern browsers
- Chrome, Firefox, Safari, Edge
- Mobile responsive

---

## Features Summary

### Core Functionalities ✅

| Feature | Status | CRUD |
|---------|--------|------|
| Habits & Categories | ✅ Complete | Create, Read, Update, Delete |
| Skills List | ✅ Complete | Create, Read, Update, Delete |
| Daily Affirmations | ✅ Complete | Create, Read, Update, Delete |
| To-Do List | ✅ Complete | Create, Read, Update, Delete |
| Learning Courses | ✅ Complete | Create, Read, Update, Delete |
| Journal Entries | ✅ Complete | Create, Read, Update, Delete |
| Blog Posts | ✅ Complete | Create, Read, Update, Delete |
| Blog Categories | ✅ Complete | Create, Read, Delete |
| Live Time Clock | ✅ Complete | Real-time |
| Days Counter | ✅ Complete | Auto-calculated |
| Dot Calendar | ✅ Complete | Interactive |
| Progress Charts | ✅ Complete | Auto-calculated |

---

## Usage Instructions

### Dashboard (main.html)

**Add Habit:**
1. Navigate to "Habits & Categories"
2. Create a category first
3. Enter habit name, select category, set time
4. Click "Add Habit"

**Add Affirmation:**
1. Select time period (Morning, Afternoon, etc.)
2. Type your affirmation
3. Click "Add Affirmation"
4. View your affirmation displayed above

**Track To-Do:**
1. Enter task title and optional time
2. Click "Add Task"
3. Check off completed tasks
4. Tasks auto-sort by time

**Add Learning Course:**
1. Enter course name and progress percentage
2. Click "Add Course"
3. Update progress anytime
4. Delete when complete

**Write Journal:**
1. Create journal category if needed
2. Select category and write entry
3. Click "Save Entry"
4. Edit or delete anytime

### Blog (blog.html)

**Create Blog Post:**
1. Enter title, content
2. Create/select category
3. Add tags (comma-separated)
4. Add featured image URL
5. Click "Publish Post" or "Save Draft"

**Manage Blog:**
1. View all posts in grid
2. Use search/filter controls
3. Click "View" to see full post
4. Click "Edit" to modify
5. Click "Delete" to remove

---

## File Structure

```
One Page/
├── indexx.html              (Landing page)
├── style.css                (Landing page styles)
├── main.html                (Dashboard)
├── main.css                 (Dashboard styles)
├── main.js                  (Dashboard functionality)
├── blog.html                (Blog management)
├── blog.css                 (Blog styles)
├── blog.js                  (Blog functionality)
├── favicon.ico              (Browser icon)
├── men.jpg                  (Sample image)
└── logo and Icon/           (Assets folder)
```

---

## Tips & Tricks

1. **Backup Your Data**: Use browser DevTools to export localStorage JSON
2. **Use Categories**: Organize habits, journals, and blogs better
3. **Tags on Blog**: Help organize and find posts later
4. **Daily Affirmations**: Set different affirmations for each time period
5. **Progress Tracking**: Update course progress regularly
6. **Time Management**: Use time-based scheduling for tasks and habits

---

## Future Enhancement Ideas

- [ ] Dark mode toggle
- [ ] Export data as PDF
- [ ] Sync across devices (cloud storage)
- [ ] Social sharing of blog posts
- [ ] Advanced analytics dashboard
- [ ] Habit streaks tracker
- [ ] Integration with calendar
- [ ] Notifications for scheduled tasks
- [ ] Rich text editor for journal/blog
- [ ] Image gallery support

---

**Version:** 1.0.0  
**Last Updated:** February 7, 2026  
**Author:** CodeNibbler Team
