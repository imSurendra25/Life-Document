// Load blog posts from blog storage and display them on landing page
function loadBlogPostsPreview() {
    const blogGrid = document.getElementById('blogGrid');
    const blogData = localStorage.getItem('codenibbler-blog');
    
    if (!blogData) {
        // No blog data - keep default message
        return;
    }
    
    const blog = JSON.parse(blogData);
    const publishedPosts = blog.posts.filter(post => post.status === 'published');
    
    // Sort by date (newest first)
    publishedPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Get latest 3 posts
    const latestPosts = publishedPosts.slice(0, 3);
    
    if (latestPosts.length === 0) {
        // No published posts yet
        blogGrid.innerHTML = `
            <div class="no-posts">
                <p>No blog posts yet. <a href="blog.html">Create one now!</a></p>
            </div>
        `;
        return;
    }
    
    // Clear the grid
    blogGrid.innerHTML = '';
    
    // Add each post as a card
    latestPosts.forEach(post => {
        const postCard = document.createElement('div');
        postCard.className = 'blog-post';
        
        const formattedDate = new Date(post.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        
        postCard.innerHTML = `
            <div class="blog-image">
                ${post.image ? `<img src="${post.image}" alt="${post.title}" style="width: 100%; height: 100%; object-fit: cover;">` : '📝'}
            </div>
            <div class="blog-content">
                <span class="blog-category">${post.category || 'Uncategorized'}</span>
                <h3>${post.title}</h3>
                <p>${post.content.substring(0, 100)}...</p>
                <div class="blog-meta">
                    <span>${formattedDate}</span> • 
                    <span>${post.tags ? post.tags.split(',').length : 0} tags</span>
                </div>
            </div>
        `;
        
        postCard.addEventListener('click', () => {
            window.location.href = 'blog.html';
        });
        
        blogGrid.appendChild(postCard);
    });
}

// Handle contact form submission – messages go to YOUR Gmail (set in form data-contact-email)
function setupContactForm() {
    const contactForm = document.getElementById('contactForm');
    
    if (!contactForm) return;
    
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const yourGmail = (this.dataset.contactEmail || 'your.email@gmail.com').trim();
        const senderEmail = this.querySelector('input[name="sender"]').value.trim();
        const message = this.querySelector('textarea[name="message"]').value.trim();
        
        const subject = 'CodeNibbler – Message from ' + senderEmail;
        const body = `You received a message from your CodeNibbler site:\n\nFrom: ${senderEmail}\n\nMessage:\n${message}`;
        
        window.location.href = `mailto:${yourGmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        
        setTimeout(() => {
            this.reset();
            alert('Your email app will open. Send the email to deliver the message to your inbox.');
        }, 100);
    });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    loadBlogPostsPreview();
    setupContactForm();
});

// Listen for changes in blog storage (when user adds/updates posts)
window.addEventListener('storage', function(e) {
    if (e.key === 'codenibbler-blog') {
        loadBlogPostsPreview();
    }
});
