const tools = [
    {
        name: "Midjourney",
        category: "Design / Images",
        icon: "🎨",
        rating: 4.9,
        reviews: 240,
        desc: "Generates high-quality, conceptual images from natural language descriptions with unparalleled artistic fidelity.",
        price: "Paid",
        url: "https://www.midjourney.com/home" // Note: many sites block iframing, but we will demonstrate the concept
    },
    {
        name: "Copy.ai",
        category: "Writing & Content",
        icon: "✍️",
        rating: 4.8,
        reviews: 185,
        desc: "An AI-powered copywriter that generates high-quality content for blogs, ads, emails, and websites in seconds.",
        price: "Freemium",
        url: "https://www.copy.ai/"
    },
    {
        name: "Opus Clip",
        category: "Video Generation",
        icon: "🎬",
        rating: 4.7,
        reviews: 112,
        desc: "Turn long-form videos into high-quality viral shorts instantly with AI-driven clipping and dynamic captions.",
        price: "Freemium",
        url: "https://www.opus.pro/"
    },
    {
        name: "GitHub Copilot",
        category: "Development",
        icon: "💻",
        rating: 4.9,
        reviews: 890,
        desc: "Your AI pair programmer that suggests code and entire functions in real-time right inside your editor.",
        price: "Paid",
        url: "https://github.com/features/copilot"
    },
    {
        name: "Notion AI",
        category: "Productivity",
        icon: "📝",
        rating: 4.8,
        reviews: 320,
        desc: "Work faster. Write better. Think bigger. Notion AI allows you to extract insights and generate text directly in your workspace.",
        price: "Paid",
        url: "https://www.notion.so/product/ai"
    },
    {
        name: "Leonardo AI",
        category: "Design / Images",
        icon: "🖼️",
        rating: 4.6,
        reviews: 95,
        desc: "Create stunning game assets, art, and designs with a suite of fine-tuned stable diffusion models.",
        price: "Free",
        url: "https://leonardo.ai/"
    },
    {
        name: "ChatGPT",
        category: "Writing & Content",
        icon: "🤖",
        rating: 4.9,
        reviews: 1540,
        desc: "Advanced conversational AI for writing, coding, brainstorming, and answering any prompt.",
        price: "Freemium",
        url: "https://chat.openai.com/"
    },
    {
        name: "Synthesia",
        category: "Video Generation",
        icon: "📹",
        rating: 4.5,
        reviews: 210,
        desc: "Create professional AI videos from text with hyper-realistic AI avatars and natural voices.",
        price: "Paid",
        url: "https://www.synthesia.io/"
    }
];

function renderTools(filteredTools) {
    const grid = document.getElementById('toolsGrid');
    if (!grid) return;
    
    grid.innerHTML = '';

    if (filteredTools.length === 0) {
        grid.innerHTML = `<div class="no-results">
            <h3>No tools found</h3>
            <p>Try adjusting your search query or filters.</p>
        </div>`;
        return;
    }
    
    filteredTools.forEach(tool => {
        const card = document.createElement('div');
        card.className = 'tool-card';
        card.innerHTML = `
            <div class="tool-header">
                <div class="tool-icon">${tool.icon}</div>
                <div class="tool-info">
                    <h3>${tool.name}</h3>
                    <div class="tool-rating">
                        <span class="star">★</span> ${tool.rating} 
                        <span>(${tool.reviews})</span>
                    </div>
                </div>
            </div>
            <p class="tool-desc">${tool.desc}</p>
            <div class="tool-footer">
                <span class="tool-price">${tool.price}</span>
                <button class="btn-primary use-app-btn" data-url="${tool.url}" data-name="${tool.name}" style="padding: 8px 16px; font-size: 0.9rem;">Use App <span style="font-size: 1.1rem; line-height: 0; position:relative; top:2px;">⚡</span></button>
            </div>
        `;
        grid.appendChild(card);
    });

    // Reattach listeners to new buttons
    attachAppModalListeners();
}

// Search and Filter Logic
function updateFeed() {
    const searchInput = document.getElementById('searchInput').value.toLowerCase();
    
    // Get checked categories
    const categoryCheckboxes = document.querySelectorAll('.cat-filter:checked');
    const selectedCategories = Array.from(categoryCheckboxes).map(cb => cb.value);
    const filterAll = document.getElementById('filterAll').checked;

    let results = tools.filter(tool => {
        // Search Matching
        const matchesSearch = tool.name.toLowerCase().includes(searchInput) || 
                              tool.desc.toLowerCase().includes(searchInput) ||
                              tool.category.toLowerCase().includes(searchInput);
                              
        // Category Matching
        const matchesCategory = filterAll || selectedCategories.length === 0 || selectedCategories.includes(tool.category);

        return matchesSearch && matchesCategory;
    });

    renderTools(results);
}

// Initialization and Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Initial Render
    renderTools(tools);
    
    // Search Listener
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    
    if (searchInput) {
        searchInput.addEventListener('input', updateFeed);
    }
    if (searchBtn) {
        searchBtn.addEventListener('click', (e) => {
            e.preventDefault();
            updateFeed();
            // Scroll to tools if searching from hero
            document.getElementById('toolsGrid').scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    }

    // Category Filter Listeners
    const filterAll = document.getElementById('filterAll');
    const catFilters = document.querySelectorAll('.cat-filter');

    if (filterAll) {
        filterAll.addEventListener('change', (e) => {
            if (e.target.checked) {
                catFilters.forEach(cb => cb.checked = false);
            }
            updateFeed();
        });
    }

    catFilters.forEach(cb => {
        cb.addEventListener('change', () => {
            const anyChecked = Array.from(catFilters).some(c => c.checked);
            if (anyChecked) {
                filterAll.checked = false;
            } else {
                filterAll.checked = true;
            }
            updateFeed();
        });
    });

    // Tag clicks in Hero
    const tags = document.querySelectorAll('.hero-tags .tag');
    tags.forEach(tag => {
        tag.addEventListener('click', (e) => {
            e.preventDefault();
            searchInput.value = tag.innerText;
            updateFeed();
            document.getElementById('toolsGrid').scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });

    // Modal Logic
    const loginModal = document.getElementById('loginModal');
    const loginBtn = document.getElementById('loginBtn');
    const closeModal = document.getElementById('closeModal');
    const loginForm = document.getElementById('loginForm');

    if (loginBtn && loginModal) {
        loginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            loginModal.classList.add('active');
        });
    }

    if (closeModal) {
        closeModal.addEventListener('click', () => {
            loginModal.classList.remove('active');
        });
    }

    // Close on outside click
    window.addEventListener('click', (e) => {
        if (e.target === loginModal) {
            loginModal.classList.remove('active');
        }
    });

    // Handle Form Submit
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = loginForm.querySelector('button');
            const originalText = btn.innerText;
            btn.innerText = "Processing...";
            
            setTimeout(() => {
                btn.innerText = "Success! Logging in...";
                btn.style.background = "#10B981"; // Green color
                
                setTimeout(() => {
                    loginModal.classList.remove('active');
                    btn.innerText = originalText;
                    btn.style.background = "";
                    // Update login button to show logged in state
                    loginBtn.innerText = "My Account";
                    loginBtn.classList.add('logged-in');
                }, 1000);
            }, 1000);
        });
    }
});

// App Modal Logic
function attachAppModalListeners() {
    const appBtns = document.querySelectorAll('.use-app-btn');
    const appModal = document.getElementById('appModal');
    const appFrame = document.getElementById('appFrame');
    const closeAppModal = document.getElementById('closeAppModal');
    const appModalTitle = document.getElementById('appModalTitle');
    const appExternalLink = document.getElementById('appExternalLink');

    if (!appModal || !appBtns) return;

    appBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const url = btn.getAttribute('data-url');
            const name = btn.getAttribute('data-name');
            
            appModalTitle.innerText = "Using " + name;
            appExternalLink.href = url;
            appFrame.src = url; // Load the site into the iframe
            appModal.classList.add('active');
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
        });
    });

    if (closeAppModal) {
        closeAppModal.addEventListener('click', () => {
            appModal.classList.remove('active');
            setTimeout(() => { appFrame.src = "about:blank"; }, 300); // clear memory
            document.body.style.overflow = ''; 
        });
    }
}
