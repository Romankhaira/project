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
        
        if (error) {
            throw error;
        }
        
        console.log('Brands loaded:', brands);
        console.log('Number of brands:', brands?.length || 0);
        
        // Build brand map for other pages
        BRAND_MAP = {};
        if (brands && brands.length > 0) {
            brands.forEach(brand => {
                BRAND_MAP[brand.id] = brand.name;
            });
        }
        
        // Clear loading state
        if (brandsGrid) {
            brandsGrid.innerHTML = '';
            
            // Create brand cards
            if (brands && brands.length > 0) {
                brands.forEach(brand => {
                    console.log('Creating card for brand:', brand.name, 'ID:', brand.id);
                    const brandCard = createBrandCard(brand);
                    brandsGrid.appendChild(brandCard);
                });
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
    card.className = 'brand-card';
    
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
        
        if (error) {
            throw error;
        }
        
        console.log('Materials loaded:', materials);
        console.log('Number of materials:', materials?.length || 0);
        
        // Clear loading state
        if (materialsGrid) {
            materialsGrid.innerHTML = '';
            
            // Create material cards
            if (materials && materials.length > 0) {
                materials.forEach(material => {
                    console.log('Creating card for material:', material.name, 'ID:', material.id);
                    const materialCard = createMaterialCard(material);
                    materialsGrid.appendChild(materialCard);
                });
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

// Create a material card element
function createMaterialCard(material) {
    console.log('Creating material card:', material.name, 'with ID:', material.id);
    
    const card = document.createElement('a');
    card.href = `material.html?id=${material.id}`;
    card.className = 'material-card';
    
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
            animation: fadeIn 0.3s ease, fadeOut 0.3s ease 2.7s forwards;
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
    addToCartFallback
};

// Export BRAND_MAP for other pages
window.BRAND_MAP = BRAND_MAP;