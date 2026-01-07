// js/home.js
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize GSAP animations
    initHomeAnimations();

    // Wait for supabaseClient to be available
    if (!window.supabaseClient) {
        console.error('Supabase client not initialized');
        showError('Failed to connect to database. Please refresh the page.');
        return;
    }

        // In the try-catch block after rendering:
    try {
        const [brandsResponse, materialsResponse] = await Promise.all([
            window.supabaseClient.from('brands').select('*'),
            window.supabaseClient.from('materials').select('*')
        ]);

        if (brandsResponse.error) throw brandsResponse.error;
        if (materialsResponse.error) throw materialsResponse.error;

        // Render brands
        renderBrands(brandsResponse.data);
        
        // Render materials
        renderMaterials(materialsResponse.data);

        // Remove loading states
        if (typeof window.removeLoadingStates === 'function') {
            window.removeLoadingStates();
        }
        
        // Animate cards
        animateCards();
        
    } catch (error) {
        console.error('Error loading data:', error);
        showError('Failed to load content. Please refresh the page.');
        
        // Still remove loading states even on error
        if (typeof window.removeLoadingStates === 'function') {
            window.removeLoadingStates();
        }
    }
});

function renderBrands(brands) {
    const brandsGrid = document.getElementById('brands-grid');
    if (!brandsGrid) return;

    // Create placeholder image data URL
    const placeholderImage = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Crect width='80' height='80' fill='%232A2F36'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23EAEAEA' font-family='Arial' font-size='12'%3ELOGO%3C/text%3E%3C/svg%3E`;

    brandsGrid.innerHTML = brands.map(brand => `
        <div class="card brand-card" data-brand-id="${brand.id}">
            <img src="${brand.logo_url}" alt="${brand.name}" class="brand-logo" 
                 onerror="this.src='${placeholderImage}'">
            <div class="card-content">
                <h3>${brand.name}</h3>
                <p>${brand.description}</p>
                <a href="brand.html?id=${brand.id}" class="card-link">
                    View Products <i class="fas fa-arrow-right"></i>
                </a>
            </div>
        </div>
    `).join('');

    // Add click handlers
    document.querySelectorAll('.brand-card').forEach(card => {
        card.addEventListener('click', (e) => {
            if (!e.target.closest('.card-link')) {
                const brandId = card.dataset.brandId;
                window.location.href = `brand.html?id=${brandId}`;
            }
        });
    });
}

function renderMaterials(materials) {
    const materialsGrid = document.getElementById('materials-grid');
    if (!materialsGrid) return;

    // Create placeholder image data URL
    const placeholderImage = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'%3E%3Crect width='300' height='200' fill='%232A2F36'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23EAEAEA' font-family='Arial' font-size='14'%3ETOOL%3C/text%3E%3C/svg%3E`;

    materialsGrid.innerHTML = materials.map(material => `
        <div class="card material-card" data-material-id="${material.id}">
            <img src="${material.image_url}" alt="${material.name}" class="material-image" 
                 onerror="this.src='${placeholderImage}'">
            <div class="card-content">
                <h3>${material.name}</h3>
                <p>${material.description}</p>
                <a href="material.html?id=${material.id}" class="card-link">
                    View Details <i class="fas fa-arrow-right"></i>
                </a>
            </div>
        </div>
    `).join('');

    // Add click handlers
    document.querySelectorAll('.material-card').forEach(card => {
        card.addEventListener('click', (e) => {
            if (!e.target.closest('.card-link')) {
                const materialId = card.dataset.materialId;
                window.location.href = `material.html?id=${materialId}`;
            }
        });
    });
}

function initHomeAnimations() {
    // Animate hero title lines
    const titleLines = document.querySelectorAll('.title-line, .title-accent');
    if (titleLines.length > 0) {
        gsap.to(titleLines, {
            opacity: 1,
            y: 0,
            duration: 1.5,
            stagger: 0.3,
            ease: 'power3.out',
            delay: 0.5
        });
    }

    // Animate hero subtitle
    const heroSubtitle = document.querySelector('.hero-subtitle');
    if (heroSubtitle) {
        gsap.from(heroSubtitle, {
            opacity: 0,
            y: 20,
            duration: 1,
            delay: 1.5,
            ease: 'power2.out'
        });
    }

    // Animate CTA buttons
    const heroCta = document.querySelector('.hero-cta');
    if (heroCta) {
        gsap.from(heroCta, {
            opacity: 0,
            y: 20,
            duration: 1,
            delay: 2,
            ease: 'power2.out'
        });
    }

    // 3D tilt effect for paint canisters
    const canisters = document.querySelectorAll('.paint-canister');
    canisters.forEach((canister, index) => {
        gsap.to(canister, {
            rotation: index % 2 === 0 ? -3 : 3,
            y: index % 2 === 0 ? -10 : 10,
            duration: 3,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
            delay: index * 0.5
        });
    });
}

function animateCards() {
    const cards = document.querySelectorAll('.card');
    if (cards.length > 0) {
        gsap.from(cards, {
            opacity: 0,
            y: 50,
            duration: 1,
            stagger: 0.1,
            scrollTrigger: {
                trigger: '.brands-grid, .materials-grid',
                start: 'top 80%',
                end: 'bottom 20%',
                toggleActions: 'play none none none'
            }
        });
    }
}

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `
        <i class="fas fa-exclamation-triangle"></i>
        <span>${message}</span>
    `;
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--danger);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
        errorDiv.style.animation = 'slideOut 0.3s ease-out forwards';
        setTimeout(() => errorDiv.remove(), 300);
    }, 5000);
}

// Add CSS for animations if not already added
if (!document.querySelector('#error-animations')) {
    const style = document.createElement('style');
    style.id = 'error-animations';
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}