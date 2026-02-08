// Blog Data Management
const blogStore = {
    posts: [],
    categories: [],
    currentFilter: {
        search: '',
        category: '',
        status: ''
    }
};

let currentEditingPostId = null;

// --- Rich Text Editor Functions ---
function formatDoc(cmd, value = null) {
    document.execCommand(cmd, false, value);
    const editor = document.getElementById('richEditor');
    if(editor) editor.focus();
}

function insertMedia(input) {
    const file = input.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const editor = document.getElementById('richEditor');
        editor.focus(); // Ensure editor has focus

        let html = '';
        if (file.type.startsWith('image/')) {
            // Ask for size preference
            const width = prompt("Enter image width (e.g., 300px, 50%, 100%) or leave empty for default:", "100%");
            const styleWidth = width ? `width: ${width};` : 'max-width: 100%;';
            html = `<img src="${e.target.result}" alt="Image" style="${styleWidth} height: auto; margin: 10px auto; display: block;">`;
        } else if (file.type.startsWith('video/')) {
            html = `<video src="${e.target.result}" controls style="max-width: 100%; height: auto; margin: 10px 0; display: block;"></video>`;
        } else {
            // Handle other files as downloadable links
            html = `<div style="margin: 10px 0; padding: 10px; background: #f1f1f1; border-radius: 5px; display: inline-block;">
                        <a href="${e.target.result}" download="${file.name}" style="text-decoration: none; color: #333; font-weight: bold;">
                            📎 ${file.name}
                        </a>
                    </div>`;
        }
        
        document.execCommand('insertHTML', false, html + '<p><br></p>');
    };
    reader.readAsDataURL(file);
    input.value = ''; // Reset input to allow selecting same file again
}

// Initialize
function initializeBlog() {
    loadBlogData();
    renderBlogCategories();
    updateCategorySelects();
    renderBlogPosts();
    
    // Check for post ID in URL to open detail view automatically
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');
    if (postId) {
        viewBlogPost(parseInt(postId));
    }
    
    console.log('Blog initialized!');
}

// ============================================
// DATA PERSISTENCE
// ============================================

function saveBlogData() {
    localStorage.setItem('codenibbler-blog', JSON.stringify(blogStore));
}

function loadBlogData() {
    const savedData = localStorage.getItem('codenibbler-blog');
    if (savedData) {
        Object.assign(blogStore, JSON.parse(savedData));
    }
}

// ============================================
// CATEGORY MANAGEMENT
// ============================================

function addBlogCategory() {
    const input = document.getElementById('newCategoryInput');
    if (!input.value.trim()) return;
    
    const category = {
        id: Date.now(),
        name: input.value
    };
    
    blogStore.categories.push(category);
    input.value = '';
    saveBlogData();
    renderBlogCategories();
    updateCategorySelects();
}

function renderBlogCategories() {
    const container = document.getElementById('blogCategories');
    container.innerHTML = '';
    
    blogStore.categories.forEach(cat => {
        const tag = document.createElement('div');
        tag.className = 'category-tag';
        tag.innerHTML = `
            ${cat.name}
            <button class="delete-btn" onclick="deleteBlogCategory(${cat.id})">×</button>
        `;
        container.appendChild(tag);
    });
}

function deleteBlogCategory(id) {
    blogStore.categories = blogStore.categories.filter(c => c.id !== id);
    blogStore.posts = blogStore.posts.filter(p => p.categoryId !== id);
    saveBlogData();
    renderBlogCategories();
    updateCategorySelects();
    renderBlogPosts();
}

function updateCategorySelects() {
    const selects = [
        document.getElementById('postCategory'),
        document.getElementById('filterCategory'),
        document.getElementById('editPostCategory')
    ];
    
    selects.forEach(select => {
        if (!select) return;
        const currentValue = select.value;
        select.innerHTML = '<option value="">Select category...</option>';
        
        blogStore.categories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat.id;
            option.textContent = cat.name;
            select.appendChild(option);
        });
        
        select.value = currentValue;
    });
}

// ============================================
// BLOG POST MANAGEMENT
// ============================================

function publishBlogPost() {
    const title = document.getElementById('postTitle').value;
    
    // Get content from Rich Editor if available, else fallback
    let content = '';
    const richEditor = document.getElementById('richEditor');
    if (richEditor) content = richEditor.innerHTML;
    else if (document.getElementById('postContent')) content = document.getElementById('postContent').value;

    const categoryId = document.getElementById('postCategory').value;
    const tags = document.getElementById('postTags').value;
    let image = document.getElementById('postImage').value;
    
    if (!title.trim() || !content.trim()) {
        alert('Please fill title and content');
        return;
    }

    // Auto-detect image from content if featured image is empty
    if (!image && content) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = content;
        const firstImg = tempDiv.querySelector('img');
        if (firstImg) image = firstImg.src;
    }
    
    const post = {
        id: Date.now(),
        title: title,
        content: content,
        categoryId: categoryId ? parseInt(categoryId) : 0,
        tags: tags.split(',').map(t => t.trim()).filter(t => t),
        image: image || 'https://via.placeholder.com/400x200?text=' + encodeURIComponent(title),
        status: 'published',
        createdAt: new Date().toLocaleString(),
        updatedAt: new Date().toLocaleString(),
        views: 0,
        likes: 0
    };
    
    blogStore.posts.unshift(post); // Add to top
    saveBlogData();
    clearForm();
    renderBlogPosts();
    alert('Post published successfully!');
}

function saveDraft() {
    const title = document.getElementById('postTitle').value;
    
    let content = '';
    const richEditor = document.getElementById('richEditor');
    if (richEditor) content = richEditor.innerHTML;
    else if (document.getElementById('postContent')) content = document.getElementById('postContent').value;

    const categoryId = document.getElementById('postCategory').value;
    const tags = document.getElementById('postTags').value;
    let image = document.getElementById('postImage').value;
    
    if (!title.trim() || !content.trim()) {
        alert('Please fill title and content');
        return;
    }

    // Auto-detect image from content if featured image is empty
    if (!image && content) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = content;
        const firstImg = tempDiv.querySelector('img');
        if (firstImg) image = firstImg.src;
    }
    
    const post = {
        id: Date.now(),
        title: title,
        content: content,
        categoryId: categoryId ? parseInt(categoryId) : 0,
        tags: tags.split(',').map(t => t.trim()).filter(t => t),
        image: image || 'https://via.placeholder.com/400x200?text=' + encodeURIComponent(title),
        status: 'draft',
        createdAt: new Date().toLocaleString(),
        updatedAt: new Date().toLocaleString(),
        views: 0,
        likes: 0
    };
    
    blogStore.posts.unshift(post);
    saveBlogData();
    clearForm();
    renderBlogPosts();
    alert('Draft saved!');
}

function clearForm() {
    document.getElementById('postTitle').value = '';
    
    const richEditor = document.getElementById('richEditor');
    if (richEditor) richEditor.innerHTML = '';
    
    document.getElementById('postCategory').value = '';
    document.getElementById('postTags').value = '';
    document.getElementById('postImage').value = '';
}

function renderBlogPosts() {
    const grid = document.getElementById('blogGrid');
    grid.innerHTML = '';
    
    let posts = [...blogStore.posts];
    
    // Apply filters
    posts = posts.filter(post => {
        if (blogStore.currentFilter.search) {
            const search = blogStore.currentFilter.search.toLowerCase();
            if (!post.title.toLowerCase().includes(search) && 
                !post.content.toLowerCase().includes(search)) {
                return false;
            }
        }
        
        if (blogStore.currentFilter.category) {
            if (post.categoryId !== parseInt(blogStore.currentFilter.category)) {
                return false;
            }
        }
        
        if (blogStore.currentFilter.status) {
            if (post.status !== blogStore.currentFilter.status) {
                return false;
            }
        }
        
        return true;
    });
    
    // Sort by newest first
    posts.sort((a, b) => b.id - a.id);
    
    if (posts.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
                <h3 style="color: #999; margin-bottom: 10px;">No blog posts found</h3>
                <p style="color: #bbb;">Create your first blog post to get started!</p>
            </div>
        `;
        return;
    }
    
    posts.forEach(post => {
        const category = blogStore.categories.find(c => c.id === post.categoryId);
        // Strip HTML for excerpt
        const tmp = document.createElement("DIV");
        tmp.innerHTML = post.content;
        const plainText = tmp.textContent || tmp.innerText || "";

        const card = document.createElement('div');
        card.className = 'blog-card';
        card.innerHTML = `
            <img src="${post.image}" alt="${post.title}" class="blog-card-image" onerror="this.src='https://via.placeholder.com/400x200?text=No+Image'">
            <div class="blog-card-content">
                <h3 class="blog-card-title">${post.title}</h3>
                <p class="blog-card-excerpt">${plainText.substring(0, 100)}...</p>
                <div class="blog-card-meta">
                    ${category ? `<span class="category-badge">${category.name}</span>` : ''}
                    <span class="status-badge ${post.status}">${post.status}</span>
                </div>
                <p style="font-size: 12px; color: #999; margin-bottom: 15px;">
                    ${post.createdAt}
                </p>
                <div class="blog-card-actions">
                    <button class="edit-btn" onclick="viewBlogPost(${post.id})">View</button>
                    <button class="edit-btn" onclick="editBlogPost(${post.id})">Edit</button>
                    <button class="delete-btn" onclick="deleteBlogPost(${post.id})">Delete</button>
                </div>
            </div>
        `;
        
        card.querySelector('.blog-card-title').addEventListener('click', () => viewBlogPost(post.id));
        card.querySelector('.blog-card-excerpt').addEventListener('click', () => viewBlogPost(post.id));
        
        grid.appendChild(card);
    });
}

function viewBlogPost(id) {
    const post = blogStore.posts.find(p => p.id === id);
    if (!post) return;
    
    const category = blogStore.categories.find(c => c.id === post.categoryId);
    document.getElementById('detailImage').src = post.image;
    document.getElementById('detailTitle').textContent = post.title;
    document.getElementById('detailDate').textContent = post.createdAt;
    document.getElementById('detailCategory').textContent = category?.name || 'Uncategorized';
    document.getElementById('detailStatus').textContent = post.status;
    document.getElementById('detailStatus').className = `status-badge ${post.status}`;
    
    const tagsDiv = document.getElementById('detailTags');
    tagsDiv.innerHTML = '';
    post.tags.forEach(tag => {
        const span = document.createElement('span');
        span.className = 'post-tags';
        span.innerHTML = `<span>${tag}</span>`;
        tagsDiv.appendChild(span);
    });
    
    const contentDiv = document.getElementById('detailContent');
    // Render HTML content directly
    contentDiv.innerHTML = post.content;
    
    // Increment views
    post.views = (post.views || 0) + 1;
    saveBlogData();
    
    openModal('postDetailModal');
}

function editBlogPost(id) {
    currentEditingPostId = id;
    const post = blogStore.posts.find(p => p.id === id);
    if (!post) return;
    
    document.getElementById('editPostTitle').value = post.title;
    document.getElementById('editPostCategory').value = post.categoryId;
    document.getElementById('editPostTags').value = post.tags.join(', ');
    document.getElementById('editPostContent').value = post.content;
    document.getElementById('editPostImage').value = post.image;
    
    openModal('editPostModal');
}

function saveEditPost() {
    const post = blogStore.posts.find(p => p.id === currentEditingPostId);
    if (!post) return;
    
    post.title = document.getElementById('editPostTitle').value;
    post.categoryId = parseInt(document.getElementById('editPostCategory').value) || 0;
    post.tags = document.getElementById('editPostTags').value.split(',').map(t => t.trim()).filter(t => t);
    post.content = document.getElementById('editPostContent').value;
    post.image = document.getElementById('editPostImage').value;
    post.updatedAt = new Date().toLocaleString();
    
    saveBlogData();
    closeModal('editPostModal');
    renderBlogPosts();
    alert('Post updated!');
}

function deleteBlogPost(id) {
    if (!confirm('Delete this blog post?')) return;
    
    blogStore.posts = blogStore.posts.filter(p => p.id !== id);
    saveBlogData();
    renderBlogPosts();
}

// ============================================
// FILTER & SEARCH
// ============================================

function filterBlogPosts() {
    blogStore.currentFilter.search = document.getElementById('searchInput')?.value || '';
    blogStore.currentFilter.category = document.getElementById('filterCategory')?.value || '';
    blogStore.currentFilter.status = document.getElementById('filterStatus')?.value || '';
    
    renderBlogPosts();
}

// ============================================
// MODAL MANAGEMENT
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

// Close modal when clicking outside
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('active');
    }
});

// Initialize
document.addEventListener('DOMContentLoaded', initializeBlog);
