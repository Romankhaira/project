// js/brand.js
document.addEventListener('DOMContentLoaded', async () => {
    // Get brand ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const brandId = urlParams.get('id');
    
    if (!brandId) {
        window.location.href = 'index.html';
        return;
    }

    try {
        // Fetch brand details
        const { data: brand, error: brandError } = await window.supabaseClient
            .from('brands')
            .select('*')
            .eq('id', brandId)
            .single();

        if (brandError) throw brandError;
        
        // Render brand info
        renderBrandInfo(brand);
        
        // Fetch products for this brand
        const { data: products, error: productsError } = await window.supabaseClient
            .from('products')
            .select('*')
            .eq('brand_id', brandId);

        if (productsError) throw productsError;
        
        // Render products
        await renderProducts(products);
        
        // Update product count
        document.getElementById('product-count').textContent = 
            `${products.length} product${products.length !== 1 ? 's' : ''} available`;
            
    } catch (error) {
        console.error('Error loading brand:', error);
        showError('Failed to load brand information. Please try again.');
    }
});

function renderBrandInfo(brand) {
    const brandInfo = document.getElementById('brand-info');
    if (!brandInfo) return;

    brandInfo.innerHTML = `
        <div class="brand-logo-container">
            <img src="${brand.logo_url}" alt="${brand.name}" class="brand-logo-large"
                 onerror="this.src='data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20width=%22120%22%20height=%22120%22%3E%3Crect%20width=%22120%22%20height=%22120%22%20fill=%222A2F36%22/%3E%3Ctext%20x=%2250%25%22%20y=%2250%25%22%20dominant-baseline=%22middle%22%20text-anchor=%22middle%22%20fill=%23EAEAEA%22%20font-family=%22Arial%22%20font-size=%2214%22%3E${encodeURIComponent(brand.name)}%3C/text%3E%3C/svg%3E'">
        </div>
        <div class="brand-details">
            <h1 class="brand-title">${brand.name}</h1>
            <p class="brand-description">${brand.description}</p>
        </div>
    `;
}

async function renderProducts(products) {
    const productsGrid = document.getElementById('products-grid');
    if (!productsGrid) return;

    if (products.length === 0) {
        productsGrid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-paint-roller"></i>
                <h3>No products available</h3>
                <p>This brand doesn't have any products listed yet.</p>
                <a href="index.html" class="btn btn-primary">Back to Brands</a>
            </div>
        `;
        return;
    }

    // Clear loading state
    productsGrid.innerHTML = '';
    
    // Process each product
    for (const product of products) {
        const productCard = await createProductCard(product);
        productsGrid.appendChild(productCard);
    }
}

async function createProductCard(product) {
    // Create card element
    const card = document.createElement('div');
    card.className = 'card product-card reveal-card';
    card.dataset.productId = product.id;
    
    // Fetch product properties for this product
    const { data: propertyRelations, error } = await window.supabaseClient
        .from('product_properties')
        .select(`
            property_id,
            properties (
                id,
                name,
                icon_url,
                short_label
            )
        `)
        .eq('product_id', product.id);
    
    let propertiesHTML = '';
    if (!error && propertyRelations && propertyRelations.length > 0) {
        propertiesHTML = `
            <div class="product-properties">
                ${propertyRelations.map(rel => {
                    const prop = rel.properties;
                    return `
                        <div class="property-icon" title="${prop.name}">
                            <img src="${prop.icon_url}" alt="${prop.short_label}"
                                 onerror="this.style.display='none'; this.nextElementSibling?.style.display='block'">
                            <span class="property-label" style="display: none;">${prop.short_label}</span>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }
    
    // Truncate description if too long
    const shortDescription = product.description.length > 150 
        ? product.description.substring(0, 150) + '...' 
        : product.description;
    
    card.innerHTML = `
        <div class="product-image-container">
            <img src="${product.image_url}" alt="${product.name}" class="product-image"
                 onerror="this.src='data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20width=%22300%22%20height=%22200%22%3E%3Crect%20width=%22300%22%20height=%22200%22%20fill=%222A2F36%22/%3E%3Ctext%20x=%2250%25%22%20y=%2250%25%22%20dominant-baseline=%22middle%22%20text-anchor=%22middle%22%20fill=%23EAEAEA%22%20font-family=%22Arial%22%20font-size=%2214%22%3E${encodeURIComponent(product.name)}%3C/text%3E%3C/svg%3E'">
        </div>
        <div class="card-content">
            ${propertiesHTML}
            <h3 class="product-name">${product.name}</h3>
            <p class="product-description">${shortDescription}</p>
            <div class="product-actions">
                <button class="btn btn-secondary add-to-cart" 
                        data-product-id="${product.id}"
                        data-product-name="${product.name}"
                        data-image-url="${product.image_url}">
                    <i class="fas fa-cart-plus"></i> Add to Cart
                </button>
                <a href="product.html?id=${product.id}" class="btn btn-primary">
                    View Details <i class="fas fa-palette"></i>
                </a>
            </div>
            <p class="color-note" style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 0.5rem;">
                <i class="fas fa-info-circle"></i>  Click on "View Details" for product's details
            </p>
        </div>
    `;
    
    return card;
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