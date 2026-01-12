// Main JavaScript file for the website

let BRAND_MAP = {};

// DOM Elements
let brandsGrid = null;
let materialsGrid = null;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', async function() {
    console.log('Website initialized');
    
    // Get DOM elements
    brandsGrid = document.getElementById('brandsGrid');
    materialsGrid = document.getElementById('materialsGrid');

    // Update cart count (always run)
    updateCartCount();

    // Only run Supabase loading for index page
    if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
        // Load Supabase first, then load content
        if (typeof ensureSupabase !== 'undefined') {
            ensureSupabase(async () => {
                console.log('Supabase loaded, loading brands...');
                await loadBrands();
                await loadMaterials();
            });
        } else {
            // Fallback: try to load brands/materials without ensureSupabase
            console.warn('ensureSupabase not found, attempting direct loading');
            await loadBrands();
            await loadMaterials();
        }
    }
});

// Add smooth scroll to sections
document.addEventListener('DOMContentLoaded', () => {
    // Force-smooth-scroll helper (uses rAF to bypass browser reduced-motion)
    function forceSmoothScrollTo(targetY, duration = 800) {
        const startY = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
        const diff = targetY - startY;
        if (diff === 0) return;
        const startTime = performance.now();

        const ease = t => 0.5 * (1 - Math.cos(Math.PI * t)); // easeInOut

        function step(now) {
            const elapsed = Math.min(1, (now - startTime) / duration);
            const eased = ease(elapsed);
            window.scrollTo(0, Math.round(startY + diff * eased));
            if (elapsed < 1) requestAnimationFrame(step);
        }

        requestAnimationFrame(step);
    }

    // Smooth scroll for hero buttons
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (!targetId || targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (!targetElement) return;

            e.preventDefault();

            // Prefer GSAP ScrollTo plugin if available; otherwise fallback to native
            try {
                const hasScrollToPlugin = (typeof ScrollToPlugin !== 'undefined')
                    || (typeof gsap !== 'undefined' && gsap.plugins && gsap.plugins.ScrollToPlugin)
                    || (typeof gsap !== 'undefined' && gsap.core && gsap.core.plugins && gsap.core.plugins.ScrollToPlugin);

                if (hasScrollToPlugin && typeof gsap !== 'undefined' && typeof gsap.to === 'function') {
                    gsap.to(window, {
                        duration: 1,
                        scrollTo: {
                            y: targetElement,
                            offsetY: 80
                        },
                        ease: "power2.inOut"
                    });
                    return;
                }
            } catch (err) {
                // ignore and fallback to native
            }

            // Fallback: native smooth scroll with offset
            const y = targetElement.getBoundingClientRect().top + window.pageYOffset - 80;
            // Use forced JS-based smooth scroll to bypass browser reduced-motion
            try {
                forceSmoothScrollTo(y, 800);
            } catch (err) {
                // last-resort: native call
                window.scrollTo({ top: y, behavior: 'smooth' });
            }
        });
    });
});


// Add error display function
function showErrorMessage(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'global-error';
    errorDiv.innerHTML = `
        <div class="error-content">
            <i class="fas fa-exclamation-triangle"></i>
            <span>${message}</span>
            <button onclick="this.parentElement.parentElement.remove()" class="error-close">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #c62828;
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        z-index: 10000;
        animation: fadeInUp 0.3s ease;
        max-width: 400px;
        box-shadow: 0 5px 20px rgba(198, 40, 40, 0.3);
    `;
    
    document.body.appendChild(errorDiv);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.remove();
        }
    }, 5000);
}

// Add to script.js - Helper function to refresh animations after dynamic content
function refreshPageAnimations() {
    if (window.gsapAnimations && typeof window.gsapAnimations.refreshAnimations === 'function') {
        window.gsapAnimations.refreshAnimations();
    }

    if (typeof ScrollTrigger !== 'undefined' && typeof ScrollTrigger.refresh === 'function') {
        ScrollTrigger.refresh();
    }
}

// Equalize heights of material cards per row
function equalizeMaterialCards() {
    try {
        const grid = document.getElementById('materialsGrid');
        if (!grid) return;

        const rows = grid.querySelectorAll('.materials-row-inner');
        rows.forEach(row => {
            let maxHeight = 0;
            const cards = Array.from(row.querySelectorAll('.material-card'));
            if (!cards.length) return;

            // Reset any inline heights first
            cards.forEach(card => card.style.height = 'auto');

            // Measure
            cards.forEach(card => {
                const h = card.offsetHeight;
                if (h > maxHeight) maxHeight = h;
            });

            // Apply
            cards.forEach(card => card.style.height = maxHeight + 'px');
        });
    } catch (err) {
        console.warn('equalizeMaterialCards error', err);
    }
}

// Load all brands from Supabase
async function loadBrands() {
    try {
        console.log('Loading brands from Supabase...');
        
        if (!window.supabaseClient) {
            console.error('Supabase client not available');
            return;
        }
        
        // Show loading state
        if (brandsGrid) {
            brandsGrid.innerHTML = `<div class="loading">Loading brands...</div>`;
        }
        
        // Fetch brands from Supabase
        const { data: brands, error } = await window.supabaseClient
            .from('brands')
            .select('*')
            .order('name');

        if (error) throw error;

        console.log('Brands loaded:', brands);

        // Build brand map for other pages
        BRAND_MAP = {};
        if (brands && brands.length > 0) {
            brands.forEach(brand => {
                BRAND_MAP[brand.id] = brand.name;
            });
        }

        // Clear loading state and render
        if (brandsGrid) {
            brandsGrid.innerHTML = '';

            if (brands && brands.length > 0) {
                brands.forEach(brand => {
                    const brandCard = createBrandCard(brand);
                    brandsGrid.appendChild(brandCard);
                });

                // REFRESH ANIMATIONS AFTER CARDS ARE ADDED
                setTimeout(() => refreshPageAnimations(), 100);
            } else {
                brandsGrid.innerHTML = `<div class="loading">No brands found. Please add brands in Supabase.</div>`;
            }
        }
        
    } catch (error) {
        console.error('Error loading brands:', error);
        if (brandsGrid) {
            brandsGrid.innerHTML = `<div class="loading error">Error loading brands. Please try again later.</div>`;
        }
    }
}

// Create a brand card element
function createBrandCard(brand) {
    console.log('Creating brand card:', brand.name, 'with ID:', brand.id);
    
    const card = document.createElement('a');
    card.href = `brand.html?id=${brand.id}`;
    card.className = 'brand-card will-animate';
    
    card.innerHTML = `
        <img src="${brand.logo_url || 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=200&fit=crop'}" 
             alt="${brand.name}" 
             class="brand-image">
        <div class="brand-info">
            <h3 class="brand-name">${brand.name}</h3>
            <p class="brand-description">${brand.description || 'Professional paint products'}</p>
            <div class="view-products">
                View Products <i class="fas fa-arrow-right"></i>
            </div>
        </div>
    `;
    
    // Add click event listener for debugging
    card.addEventListener('click', function(e) {
        console.log('Brand card clicked:', brand.name);
        console.log('Link URL:', this.href);
    });
    
    return card;
}

// Load all materials from Supabase
async function loadMaterials() {
    try {
        console.log('Loading materials from Supabase...');
        
        if (!window.supabaseClient) {
            console.error('Supabase client not available');
            return;
        }
        
        // Show loading state
        if (materialsGrid) {
            materialsGrid.innerHTML = `<div class="loading">Loading materials...</div>`;
        }
        
        // Fetch materials from Supabase
        const { data: materials, error } = await window.supabaseClient
            .from('materials')
            .select('*')
            .order('name');

        if (error) throw error;

        console.log('Materials loaded:', materials);

        // Clear loading state and render
        if (materialsGrid) {
            materialsGrid.innerHTML = '';

            if (materials && materials.length > 0) {
              // Clear before rendering
              materialsGrid.innerHTML = '';

              // Group into rows of 7
              for (let i = 0; i < materials.length; i += 7) {
                const group = materials.slice(i, i + 7);

                const row = document.createElement('div');
                row.className = 'materials-row';

                const leftArrow = document.createElement('button');
                leftArrow.className = 'row-arrow left';
                leftArrow.innerHTML = '‹';
                leftArrow.disabled = true;

                const rightArrow = document.createElement('button');
                rightArrow.className = 'row-arrow right';
                rightArrow.innerHTML = '›';

                const viewport = document.createElement('div');
                viewport.className = 'materials-row-viewport';

                const inner = document.createElement('div');
                inner.className = 'materials-row-inner';

                group.forEach(material => {
                  const card = createMaterialCard(material);
                  inner.appendChild(card);
                });

                viewport.appendChild(inner);
                row.appendChild(leftArrow);
                row.appendChild(viewport);
                row.appendChild(rightArrow);

                materialsGrid.appendChild(row);

                initMaterialRowScroll(row);
              }

              setTimeout(() => refreshPageAnimations(), 100);
              
              // Equalize heights after rows and arrows are added
              setTimeout(() => equalizeMaterialCards(), 100);
            } else {
                materialsGrid.innerHTML = `<div class="loading">No materials found. Please add materials in Supabase.</div>`;
            }
        }
    } catch (error) {
        console.error('Error loading materials:', error);
        if (materialsGrid) {
            materialsGrid.innerHTML = `<div class="loading error">Error loading materials. Please try again later.</div>`;
        }
    }
}

function initMaterialRowScroll(row) {
    const inner = row.querySelector('.materials-row-inner');
    const leftArrow = row.querySelector('.row-arrow.left');
    const rightArrow = row.querySelector('.row-arrow.right');

    let currentX = 0;

    function getScrollValues() {
        const card = inner.querySelector('.material-card');
        if (!card) {
            return { scrollStep: 0, maxScroll: 0 };
        }
        const cardWidth = card.offsetWidth + 30; // card + gap
        const scrollStep = cardWidth * 2; // scroll 2 cards

        const viewport = row.querySelector('.materials-row-viewport');
        const maxScroll = viewport ? inner.scrollWidth - viewport.offsetWidth : 0;

        return { scrollStep, maxScroll };
    }

    function updateArrows(maxScroll) {
        leftArrow.disabled = currentX >= 0;
        // Disable right arrow if no scroll needed or at end
        rightArrow.disabled = maxScroll <= 0 || Math.abs(currentX) >= maxScroll;
    }

    rightArrow.addEventListener('click', () => {
        const { scrollStep, maxScroll } = getScrollValues();
        currentX = Math.max(currentX - scrollStep, -maxScroll);

        gsap.to(inner, {
            x: currentX,
            duration: 0.6,
            ease: 'power3.out'
        });

        updateArrows(maxScroll);
    });

    leftArrow.addEventListener('click', () => {
        const { scrollStep, maxScroll } = getScrollValues();
        currentX = Math.min(currentX + scrollStep, 0);

        gsap.to(inner, {
            x: currentX,
            duration: 0.6,
            ease: 'power3.out'
        });

        updateArrows(maxScroll);
    });

    window.addEventListener('resize', () => {
        currentX = 0;
        gsap.set(inner, { x: 0 });
        const { maxScroll } = getScrollValues();
        updateArrows(maxScroll);
    });

    // Initialize arrow states after DOM is ready
    setTimeout(() => {
        const { maxScroll } = getScrollValues();
        updateArrows(maxScroll);
    }, 100);
}

// Create a material card element
function createMaterialCard(material) {
    console.log('Creating material card:', material.name, 'with ID:', material.id);
    
    const card = document.createElement('a');
    card.href = `material.html?id=${material.id}`;
    card.className = 'material-card will-animate';
    
    card.innerHTML = `
        <div class="material-info">
            <img src="${material.image_url || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=100&h=100&fit=crop'}" 
                 alt="${material.name}" 
                 class="material-image">
            <h3 class="material-name">${material.name}</h3>
            <p class="material-description">${material.description || 'High-quality painting material'}</p>
            <div class="view-materials">
                View Details <i class="fas fa-arrow-right"></i>
            </div>
        </div>
    `;
    
    return card;
}

// Update cart count in header
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('peintureLandCart')) || [];
    const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
    
    const cartCountElements = document.querySelectorAll('.cart-count');
    cartCountElements.forEach(element => {
        element.textContent = cartCount;
    });
}

// Add to cart fallback function
function addToCartFallback(product) {
    try {
        const cart = JSON.parse(localStorage.getItem('peintureLandCart')) || [];
        const existingItem = cart.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                ...product,
                quantity: 1
            });
        }
        
        localStorage.setItem('peintureLandCart', JSON.stringify(cart));
        
        // Update cart count
        updateCartCount();

        // Animate cart count using GSAP if available
        if (typeof gsap !== 'undefined') {
            const cartCountElement = document.querySelector('.cart-count');
            if (cartCountElement) {
                gsap.to(cartCountElement, {
                    scale: 1.3,
                    duration: 0.2,
                    yoyo: true,
                    repeat: 1,
                    ease: "power2.inOut"
                });
            }
        }
        
        // Show notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            z-index: 10000;
            font-weight: 600;
        `;
        notification.innerHTML = `<i class="fas fa-check-circle"></i> ${product.name} added to cart`;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 3000);
        
    } catch (error) {
        console.error('Error adding to cart:', error);
    }
}

// Export functions for use in other files
window.websiteFunctions = {
    loadBrands,
    updateCartCount,
    createBrandCard,
    equalizeMaterialCards,
    addToCartFallback
};

// Ensure equal heights on page load and when materialsGrid changes
window.addEventListener('load', () => {
    setTimeout(() => equalizeMaterialCards(), 150);
});

(function setupMaterialsObserver() {
    try {
        const grid = document.getElementById('materialsGrid');
        if (!grid) return;

        const observer = new MutationObserver(() => {
            // Defer slightly to allow DOM changes to settle (images/styles)
            setTimeout(() => equalizeMaterialCards(), 80);
        });

        observer.observe(grid, { childList: true, subtree: true });
    } catch (err) {
        // not critical
    }
})();

// Export BRAND_MAP for other pages
window.BRAND_MAP = BRAND_MAP;