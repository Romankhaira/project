// Product page functionality
class ProductPage {
  constructor() {
    this.productId = this.getProductId();
    this.selectedColor = null;
    this.colorGroups = [];
    this.init();
  }

  getProductId() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
  }

  async init() {
    if (!this.productId) {
      this.showError('No product selected');
      return;
    }
    
    await this.loadProductData();
    this.setupEventListeners();
    this.setupAnimations();
  }

  async loadProductData() {
    try {
      // Load product details
      const { data: product, error: productError } = await window.SupabaseClient.supabase
        .from('products')
        .select('*')
        .eq('id', this.productId)
        .single();
      
      if (productError) throw productError;
      
      // Update page
      document.title = `${product.name} - Paint Details`;
      document.getElementById('product-name').textContent = product.name;
      document.getElementById('product-description').textContent = product.description;
      
      // Load product image
      const productImage = document.getElementById('product-image');
      if (productImage && product.image_url) {
        productImage.src = product.image_url;
        productImage.alt = product.name;
      }
      
      // Load product properties
      await this.loadProductProperties(product.id);
      
      // Load color groups
      await this.loadColorGroups(product.id);
      
      this.product = product;
      
    } catch (error) {
      console.error('Error loading product:', error);
      this.showError('Failed to load product data');
    }
  }

  async loadProductProperties(productId) {
    try {
      const { data: propertyLinks, error: linkError } = await window.SupabaseClient.supabase
        .from('product_properties')
        .select('property_id')
        .eq('product_id', productId)
        .order('sort_order');
      
      if (linkError) throw linkError;
      
      if (!propertyLinks || propertyLinks.length === 0) {
        // Hide properties section if none exist
        const propertiesSection = document.getElementById('product-properties');
        if (propertiesSection) {
          propertiesSection.style.display = 'none';
        }
        return;
      }
      
      const propertyIds = propertyLinks.map(link => link.property_id);
      
      const { data: properties, error: propError } = await window.SupabaseClient.supabase
        .from('properties')
        .select('*')
        .in('id', propertyIds)
        .order('short_label');
      
      if (propError) throw propError;
      
      this.renderProperties(properties || []);
      
    } catch (error) {
      console.error('Error loading properties:', error);
      // Hide properties section on error
      const propertiesSection = document.getElementById('product-properties');
      if (propertiesSection) {
        propertiesSection.style.display = 'none';
      }
    }
  }

  renderProperties(properties) {
    const container = document.getElementById('properties-list');
    if (!container) return;
    
    container.innerHTML = properties.map(prop => `
      <div class="property-item">
        <img src="${prop.icon_url}" alt="${prop.name}" class="property-icon">
        <span class="property-label">${prop.short_label}</span>
      </div>
    `).join('');
  }

  async loadColorGroups(productId) {
    try {
      // Get color groups for this product
      const { data: productColorGroups, error: pcgError } = await window.SupabaseClient.supabase
        .from('product_color_groups')
        .select('group_id, sort_order')
        .eq('product_id', productId)
        .order('sort_order');
      
      if (pcgError) throw pcgError;
      
      if (!productColorGroups || productColorGroups.length === 0) {
        // Hide color selector if no colors
        const colorSection = document.getElementById('color-selector');
        if (colorSection) {
          colorSection.style.display = 'none';
        }
        return;
      }
      
      const groupIds = productColorGroups.map(pcg => pcg.group_id);
      
      // Get color groups
      const { data: groups, error: groupsError } = await window.SupabaseClient.supabase
        .from('color_groups')
        .select('*')
        .in('id', groupIds)
        .order('sort_order');
      
      if (groupsError) throw groupsError;
      
      // Get color variants for each group
      this.colorGroups = await Promise.all(
        groups.map(async (group) => {
          const { data: variants, error: variantsError } = await window.SupabaseClient.supabase
            .from('color_variants')
            .select('*')
            .eq('group_id', group.id)
            .order('sort_order');
          
          if (variantsError) throw variantsError;
          
          return {
            ...group,
            variants: variants || []
          };
        })
      );
      
      this.renderColorGroups();
      
    } catch (error) {
      console.error('Error loading colors:', error);
      // Hide color selector on error
      const colorSection = document.getElementById('color-selector');
      if (colorSection) {
        colorSection.style.display = 'none';
      }
    }
  }

  renderColorGroups() {
    const container = document.getElementById('color-groups');
    if (!container) return;
    
    container.innerHTML = this.colorGroups.map(group => `
      <div class="color-group" data-group-id="${group.id}">
        <div class="color-group-name">${group.display_name}</div>
        <div class="color-variants">
          ${group.variants.map(variant => `
            <div 
              class="color-variant" 
              data-variant-id="${variant.id}"
              style="background-color: ${variant.hex_code};"
              title="${variant.name} (${variant.shade_code})"
            ></div>
          `).join('')}
        </div>
      </div>
    `).join('');
    
    // Set first group as active
    const firstGroup = container.querySelector('.color-group');
    if (firstGroup) {
      firstGroup.classList.add('active');
    }
  }

  setupEventListeners() {
    // Color group selection
    document.addEventListener('click', (e) => {
      const colorGroup = e.target.closest('.color-group');
      if (colorGroup) {
        document.querySelectorAll('.color-group').forEach(g => g.classList.remove('active'));
        colorGroup.classList.add('active');
      }
      
      // Color variant selection
      const colorVariant = e.target.closest('.color-variant');
      if (colorVariant) {
        document.querySelectorAll('.color-variant').forEach(v => v.classList.remove('selected'));
        colorVariant.classList.add('selected');
        
        const variantId = colorVariant.dataset.variantId;
        this.selectedColor = this.getVariantDetails(variantId);
        
        // Update selected color display
        const colorDisplay = document.getElementById('selected-color');
        if (colorDisplay && this.selectedColor) {
          colorDisplay.textContent = `${this.selectedColor.name} (${this.selectedColor.shade_code})`;
          colorDisplay.style.color = this.selectedColor.hex_code;
        }
      }
    });
    
    // Add to cart button
    const addToCartBtn = document.getElementById('add-to-cart');
    if (addToCartBtn) {
      addToCartBtn.addEventListener('click', () => this.addToCart());
    }
  }

  getVariantDetails(variantId) {
    for (const group of this.colorGroups) {
      const variant = group.variants.find(v => v.id === variantId);
      if (variant) {
        return {
          ...variant,
          groupName: group.display_name
        };
      }
    }
    return null;
  }

  addToCart() {
    if (!this.product) return;
    
    const colorInfo = this.selectedColor ? 
      `${this.selectedColor.groupName} - ${this.selectedColor.name}` : 
      'No color selected';
    
    const event = new CustomEvent('addToCart', {
      detail: {
        id: this.product.id,
        name: this.product.name,
        image_url: this.product.image_url,
        selectedColor: colorInfo
      }
    });
    
    document.dispatchEvent(event);
    
    // Show success animation
    const btn = document.getElementById('add-to-cart');
    const originalText = btn.textContent;
    
    btn.textContent = 'Added to Cart! ✓';
    btn.style.background = 'var(--accent-tertiary)';
    
    gsap.fromTo(btn,
      { scale: 1 },
      {
        scale: 1.1,
        duration: 0.2,
        yoyo: true,
        repeat: 1,
        onComplete: () => {
          setTimeout(() => {
            btn.textContent = originalText;
            btn.style.background = '';
          }, 2000);
        }
      }
    );
  }

  setupAnimations() {
    // Animate product image
    const productImage = document.getElementById('product-image');
    if (productImage) {
      gsap.from(productImage, {
        scale: 0.8,
        opacity: 0,
        duration: 1,
        ease: "power3.out"
      });
    }
    
    // Animate product details
    gsap.from('#product-details > *', {
      y: 30,
      opacity: 0,
      duration: 0.6,
      stagger: 0.1,
      delay: 0.3,
      ease: "power3.out"
    });
    
    // Animate color groups
    gsap.from('#color-groups .color-group', {
      y: 20,
      opacity: 0,
      duration: 0.5,
      stagger: 0.1,
      delay: 0.5,
      ease: "power3.out"
    });
  }

  showError(message) {
    const container = document.querySelector('.main-content');
    if (container) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">⚠️</div>
          <h2>Error</h2>
          <p>${message}</p>
          <a href="index.html" class="card-link">Return to Home</a>
        </div>
      `;
    }
  }
}

// Initialize product page
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('product-name')) {
    new ProductPage();
  }
});
