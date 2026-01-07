// js/product.js
let selectedColor = null;
document.addEventListener('DOMContentLoaded', async () => {
    // Get product ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    
    if (!productId) {
        window.location.href = 'index.html';
        return;
    }

    try {
        // Fetch product details
        const { data: product, error: productError } = await window.supabaseClient
            .from('products')
            .select(`
                *,
                brands (
                    id,
                    name,
                    logo_url
                )
            `)
            .eq('id', productId)
            .single();

        if (productError) throw productError;
        
        // Fetch product properties
        const { data: propertyRelations, error: propError } = await window.supabaseClient
            .from('product_properties')
            .select(`
                property_id,
                properties (
                    id,
                    name,
                    icon_url,
                    short_label,
                    full_description
                )
            `)
            .eq('product_id', productId);
        
        if (propError) console.error('Error loading properties:', propError);
        
        // Fetch color groups for this product
        const { data: colorGroupRelations, error: colorError } = await window.supabaseClient
            .from('product_color_groups')
            .select(`
                group_id,
                color_groups (
                    id,
                    name,
                    display_name,
                    sort_order
                )
            `)
            .eq('product_id', productId)
            .order('sort_order');
        
        if (colorError) console.error('Error loading colors:', colorError);
        
        // If color groups exist, fetch color variants for each group
        let colorGroupsWithVariants = [];
        if (colorGroupRelations && colorGroupRelations.length > 0) {
            const groupIds = colorGroupRelations.map(rel => rel.color_groups.id);
            
            const { data: colorVariants, error: variantsError } = await window.supabaseClient
                .from('color_variants')
                .select('*')
                .in('group_id', groupIds)
                .order('sort_order');
            
            if (!variantsError && colorVariants) {
                // Organize variants by group
                colorGroupRelations.forEach(groupRel => {
                    const group = groupRel.color_groups;
                    const variants = colorVariants.filter(v => v.group_id === group.id);
                    colorGroupsWithVariants.push({
                        ...group,
                        variants: variants.sort((a, b) => a.sort_order - b.sort_order)
                    });
                });
            }
        }
        
        // Render product with all data
        renderProduct(product, propertyRelations || [], colorGroupsWithVariants);
            
    } catch (error) {
        console.error('Error loading product:', error);
        showError('Failed to load product information. Please try again.');
    }
});

function renderProduct(product, properties, colorGroups) {
    const productContent = document.getElementById('product-content');
    if (!productContent) return;

    // Create properties section if properties exist
    let propertiesHTML = '';
    if (properties && properties.length > 0) {
        propertiesHTML = `
            <div class="product-properties-section">
                <h3 class="section-subtitle">Properties</h3>
                <div class="properties-grid">
                    ${properties.map(rel => {
                        const prop = rel.properties;
                        return `
                            <div class="property-item" title="${prop.full_description || prop.name}">
                                <img src="${prop.icon_url}" alt="${prop.short_label}" class="property-icon-large"
                                     onerror="this.style.display='none'; this.nextElementSibling?.style.display='flex'">
                                <div class="property-fallback" style="display: none;">
                                    <span class="property-label-large">${prop.short_label}</span>
                                </div>
                                <div class="property-info">
                                    <span class="property-name">${prop.name}</span>
                                    <span class="property-desc">${prop.full_description || ''}</span>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }

    // Reset selected color
    selectedColor = null;

    // Create color selection section if color groups exist
    let colorSelectionHTML = '';
    let colorSwatchesHTML = '';
    if (colorGroups && colorGroups.length > 0) {
        colorSelectionHTML = `
            <div class="color-selection">
                <h3 class="section-subtitle">Select Color</h3>
                <div class="color-selection-prompt">
                    <i class="fas fa-palette"></i>
                    <span>Please select a color before adding to cart</span>
                </div>
                <div class="selected-color-indicator" id="selected-color-indicator" style="display: none;">
                    <div class="color-preview-swatch-small" id="selected-color-swatch"></div>
                    <span class="selected-color-name" id="selected-color-name"></span>
                </div>
            </div>
        `;
        
        colorSwatchesHTML = `
            <div class="color-swatches-section">
                <h4 class="color-section-title">Available Colors</h4>
                ${colorGroups.map(group => `
                    <div class="color-group">
                        <h5 class="color-group-name">${group.display_name || group.name}</h5>
                        <div class="color-swatches">
                            ${group.variants.map(variant => `
                                <div class="color-swatch ${variant.is_default ? 'default-color' : ''}" 
                                     title="${variant.name} - ${variant.shade_code}" 
                                     style="background-color: ${variant.hex_code};"
                                     data-hex="${variant.hex_code}"
                                     data-name="${variant.name}"
                                     data-code="${variant.shade_code}">
                                    ${variant.is_default ? '<div class="default-badge" title="Default Color"><i class="fas fa-star"></i></div>' : ''}
                                    <div class="color-tooltip">
                                        <span class="color-name">${variant.name}</span>
                                        <span class="color-code">${variant.shade_code}</span>
                                        <span class="color-hex">${variant.hex_code}</span>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    productContent.innerHTML = `
        <div class="product-main">
            <div class="product-image-container">
                <img src="${product.image_url}" alt="${product.name}" class="product-detail-image"
                     onerror="this.src='data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20width=%22600%22%20height=%22400%22%3E%3Crect%20width=%22600%22%20height=%22400%22%20fill=%222A2F36%22/%3E%3Ctext%20x=%2250%25%22%20y=%2250%25%22%20dominant-baseline=%22middle%22%20text-anchor=%22middle%22%20fill=%23EAEAEA%22%20font-family=%22Arial%22%20font-size=%2218%22%3E${encodeURIComponent(product.name)}%3C/text%3E%3C/svg%3E'">
                <div class="product-brand">
                    <img src="${product.brands.logo_url}" alt="${product.brands.name}" class="brand-logo-small"
                         onerror="this.src='data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20width=%2240%22%20height=%2240%22%3E%3Crect%20width=%2240%22%20height=%2240%22%20fill=%222A2F36%22/%3E%3Ctext%20x=%2250%25%22%20y=%2250%25%22%20dominant-baseline=%22middle%22%20text-anchor=%22middle%22%20fill=%23EAEAEA%22%20font-family=%22Arial%22%20font-size=%2210%22%3E${encodeURIComponent(product.brands.name)}%3C/text%3E%3C/svg%3E'">
                    <span>${product.brands.name}</span>
                </div>
            </div>
            
            <div class="product-info">
                <h1 class="product-title">${product.name}</h1>
                
                ${propertiesHTML}
                
                ${colorSelectionHTML}
                
                <div class="product-description-section">
                    <h3 class="section-subtitle">Description</h3>
                    <p class="product-description-full">${product.description}</p>
                </div>
                
                ${colorSwatchesHTML}
                
                <div class="product-actions">
                    <button class="btn btn-primary btn-large add-to-cart" 
                            data-product-id="${product.id}"
                            data-product-name="${product.name}"
                            data-image-url="${product.image_url}"
                            id="add-to-cart-btn">
                        <i class="fas fa-cart-plus"></i> Add to Cart
                    </button>
                    <button class="btn btn-secondary btn-large" id="whatsapp-single">
                        <i class="fab fa-whatsapp"></i> Order via WhatsApp
                    </button>
                    <a href="brand.html?id=${product.brands.id}" class="btn btn-outline">
                        <i class="fas fa-arrow-left"></i> View More from ${product.brands.name}
                    </a>
                </div>
            </div>
        </div>
    `;

    // Color selection logic
    const colorSwatches = document.querySelectorAll('.color-swatch');
    const selectedColorIndicator = document.getElementById('selected-color-indicator');
    const selectedColorSwatch = document.getElementById('selected-color-swatch');
    const selectedColorName = document.getElementById('selected-color-name');
    const addToCartBtn = document.getElementById('add-to-cart-btn');
    const colorSelectionPrompt = document.querySelector('.color-selection-prompt');

    // Select default color if exists
    const defaultColor = document.querySelector('.default-color');
    if (defaultColor) {
        selectColor(defaultColor);
        colorSelectionPrompt.innerHTML = '<i class="fas fa-check-circle"></i><span>Default color selected</span>';
        colorSelectionPrompt.style.background = 'rgba(0, 255, 157, 0.1)';
        colorSelectionPrompt.style.borderColor = 'var(--success)';
        colorSelectionPrompt.style.color = 'var(--success)';
    }

    colorSwatches.forEach(swatch => {
        // Hover effects
        swatch.addEventListener('mouseenter', (e) => {
            const tooltip = swatch.querySelector('.color-tooltip');
            if (tooltip) {
                tooltip.style.display = 'block';
            }
        });
        
        swatch.addEventListener('mouseleave', (e) => {
            const tooltip = swatch.querySelector('.color-tooltip');
            if (tooltip) {
                tooltip.style.display = 'none';
            }
        });
        
        // Click to select
        swatch.addEventListener('click', (e) => {
            selectColor(swatch);
        });
    });

    function selectColor(swatch) {
        // Remove selection from all swatches
        colorSwatches.forEach(s => {
            s.style.border = '2px solid white';
            s.style.transform = 'scale(1)';
        });
        
        // Add selection to clicked swatch
        swatch.style.border = '3px solid var(--accent-primary)';
        swatch.style.transform = 'scale(1.1)';
        
        // Update selected color
        selectedColor = {
            hex: swatch.dataset.hex,
            name: swatch.dataset.name,
            code: swatch.dataset.code
        };
        
        // Show selected color indicator
        if (selectedColorIndicator && selectedColorSwatch && selectedColorName) {
            selectedColorSwatch.style.backgroundColor = selectedColor.hex;
            selectedColorName.textContent = `${selectedColor.name} (${selectedColor.code})`;
            selectedColorIndicator.style.display = 'flex';
        }
        
        // Update prompt
        if (colorSelectionPrompt) {
            colorSelectionPrompt.innerHTML = '<i class="fas fa-check-circle"></i><span>Color selected - Ready to add to cart</span>';
            colorSelectionPrompt.style.background = 'rgba(0, 224, 255, 0.1)';
            colorSelectionPrompt.style.borderColor = 'var(--accent-primary)';
            colorSelectionPrompt.style.color = 'var(--accent-primary)';
        }
    }

    // Update add to cart button click handler
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', (e) => {
            const button = e.target.closest('.add-to-cart');
            
            // Check if color selection is required and not selected
            if (colorGroups && colorGroups.length > 0 && !selectedColor) {
                showColorRequiredMessage('Please select a color before adding to cart');
                return;
            }
            
            const productId = button.dataset.productId;
            const productName = button.dataset.productName;
            const imageUrl = button.dataset.imageUrl;
            
            // Add to cart with color info if available
            if (window.cartSystem) {
                window.cartSystem.addToCart(productId, productName, imageUrl, selectedColor);
            }
        });
    }

    // WhatsApp button remains the same
    const whatsappBtn = document.getElementById('whatsapp-single');
    if (whatsappBtn) {
        whatsappBtn.addEventListener('click', () => {
            const phoneNumber = '+1234567890';
            let message = `I want to order this product:\n\nProduct: ${product.name}\nBrand: ${product.brands.name}`;
            
            // Add color info if selected
            if (selectedColor) {
                message += `\nColor: ${selectedColor.name} (${selectedColor.code})`;
            }
            
            message += `\n\n${product.whatsapp_message || 'I want to order this product'}`;
            
            window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank');
        });
    }
}

function showColorPreview(hex, name) {
    // Create or update preview modal
    let preview = document.getElementById('color-preview');
    if (!preview) {
        preview = document.createElement('div');
        preview.id = 'color-preview';
        preview.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: var(--bg-secondary);
            border: 2px solid var(--border-color);
            border-radius: 16px;
            padding: 2rem;
            z-index: 10001;
            display: none;
            flex-direction: column;
            align-items: center;
            gap: 1rem;
            box-shadow: 0 20px 60px rgba(0,0,0,0.5);
        `;
        document.body.appendChild(preview);
    }
    
    preview.innerHTML = `
        <div class="color-preview-swatch" style="width: 100px; height: 100px; border-radius: 50%; background-color: ${hex}; border: 3px solid white; box-shadow: 0 10px 30px rgba(0,0,0,0.3);"></div>
        <div class="color-info">
            <h4 style="margin-bottom: 0.5rem; color: var(--text-primary);">${name}</h4>
            <div style="color: var(--text-secondary); font-family: 'JetBrains Mono', monospace; font-size: 0.9rem;">
                ${hex}
            </div>
        </div>
        <button id="close-preview" class="btn btn-secondary" style="margin-top: 1rem;">Close</button>
    `;
    
    preview.style.display = 'flex';
    
    // Add overlay
    let overlay = document.getElementById('preview-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'preview-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            backdrop-filter: blur(5px);
            z-index: 10000;
        `;
        document.body.appendChild(overlay);
    }
    
    overlay.style.display = 'block';
    
    // Close functionality
    const closeBtn = document.getElementById('close-preview');
    closeBtn.addEventListener('click', () => {
        preview.style.display = 'none';
        overlay.style.display = 'none';
    });
    
    overlay.addEventListener('click', () => {
        preview.style.display = 'none';
        overlay.style.display = 'none';
    });
}

function showColorRequiredMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'color-required-message';
    messageDiv.innerHTML = `
        <i class="fas fa-exclamation-triangle"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(messageDiv);
    
    // Animate in
    gsap.fromTo(messageDiv, 
        { x: 100, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.3 }
    );
    
    // Remove after 3 seconds
    setTimeout(() => {
        gsap.to(messageDiv, {
            x: 100,
            opacity: 0,
            duration: 0.3,
            onComplete: () => messageDiv.remove()
        });
    }, 3000);
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