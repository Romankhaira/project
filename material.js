// js/material.js
document.addEventListener('DOMContentLoaded', async () => {
    // Get material ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const materialId = urlParams.get('id');
    
    if (!materialId) {
        window.location.href = 'index.html';
        return;
    }

    try {
        // Fetch material details
        const { data: material, error } = await window.supabaseClient
            .from('materials')
            .select('*')
            .eq('id', materialId)
            .single();

        if (error) throw error;
        
        // Render material
        renderMaterial(material);
            
    } catch (error) {
        console.error('Error loading material:', error);
        showError('Failed to load material information. Please try again.');
    }
});

function renderMaterial(material) {
    const materialContent = document.getElementById('material-content');
    if (!materialContent) return;

    materialContent.innerHTML = `
        <div class="material-image-container">
            <img src="${material.image_url}" alt="${material.name}" class="material-detail-image"
                 onerror="this.src='data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20width=%22600%22%20height=%22400%22%3E%3Crect%20width=%22600%22%20height=%22400%22%20fill=%222A2F36%22/%3E%3Ctext%20x=%2250%25%22%20y=%2250%25%22%20dominant-baseline=%22middle%22%20text-anchor=%22middle%22%20fill=%23EAEAEA%22%20font-family=%22Arial%22%20font-size=%2218%22%3E${encodeURIComponent(material.name)}%3C/text%3E%3C/svg%3E'">
        </div>
        <div class="material-info">
            <h1 class="material-title">${material.name}</h1>
            <p class="material-description">${material.description}</p>
            <div class="material-actions">
                <button class="btn btn-primary add-to-cart" 
                        id="add-to-cart-material"
                        data-product-id="${material.id}"
                        data-product-name="${material.name}"
                        data-image-url="${material.image_url}">
                    <i class="fas fa-cart-plus"></i> Add to Cart
                </button>
                <a href="index.html" class="btn btn-secondary">
                    <i class="fas fa-arrow-left"></i> Back to Tools
                </a>
            </div>
        </div>
    `;

    // Add event listener for the add to cart button
    const addToCartBtn = document.getElementById('add-to-cart-material');
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', function() {
            const productId = this.dataset.productId;
            const productName = this.dataset.productName;
            const imageUrl = this.dataset.imageUrl;

            if (window.cartSystem) {
                window.cartSystem.addToCart(productId, productName, imageUrl, null);
            } else {
                console.error('Cart system not initialized');
                showError('Cart system not available. Please refresh the page.');
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