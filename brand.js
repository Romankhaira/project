// Brand page functionality
class BrandPage {
  constructor() {
    this.brandId = this.getBrandId();
    this.init();
  }

  getBrandId() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
  }

  async init() {
    if (!this.brandId) {
      this.showError('No brand selected');
      return;
    }
    
    await this.loadBrandData();
    this.setupSearch();
    this.setupAnimations();
  }

  async loadBrandData() {
    try {
      // Load brand details
      const supabase = window.SupabaseClient.supabase;
      const { data: brand, error: brandError } = await supabase
        .from('brands')
        .select('*')
        .eq('id', this.brandId)
        .single();
      
      if (brandError) throw brandError;
      
      // Update page title
      document.title = `${brand.name} - Paint Products`;
      document.getElementById('brand-name').textContent = brand.name;
      document.getElementById('brand-description').textContent = brand.description;
      
      // Load brand products
      await this.loadProducts(brand.id);
      
    } catch (error) {
      console.error('Error loading brand:', error);
      this.showError('Failed to load brand data');
    }
  }

  async loadProducts(brandId) {
    try {
      const { data: products, error: productsError } = await window.SupabaseClient.supabase
        .from('products')
        .select('*')
        .eq('brand_id', brandId)
        .order('name');
      
      if (productsError) throw productsError;
      
      // Load properties for each product
      const productsWithProperties = await Promise.all(
        products.map(async (product) => {
          const properties = await this.loadProductProperties(product.id);
          return { ...product, properties };
        })
      );
      
      this.renderProducts(productsWithProperties);
      this.originalProducts = productsWithProperties;
      
    } catch (error) {
      console.error('Error loading products:', error);
      this.showProductsError();
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
        return [];
      }
      
      const propertyIds = propertyLinks.map(link => link.property_id);
      
      const { data: properties, error: propError } = await window.SupabaseClient.supabase
        .from('properties')
        .select('*')
        .in('id', propertyIds)
        .order('short_label');
      
      if (propError) throw propError;
      
      return properties || [];
      
    } catch (error) {
      console.error('Error loading properties:', error);
      return [];
    }
  }

  renderProducts(products) {
    const container = document.getElementById('products-grid');
    if (!container) return;
    
    if (products.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">🎨</div>
          <p>No products found for this brand.</p>
        </div>
      `;
      return;
    }
    
    container.innerHTML = products.map(product => `
      <div class="card product-card glow-border">
        <div class="glass-card">
          <img 
            data-src="${product.image_url}" 
            alt="${product.name}" 
            class="card-image lazy-image"
          >
          <div class="card-content">
            <h3 class="card-title">${product.name}</h3>
            
            ${product.properties && product.properties.length > 0 ? `
              <div class="properties-container">
                ${product.properties.map(prop => `
                  <div class="property-item">
                    <img src="${prop.icon_url}" alt="${prop.name}" class="property-icon">
                    <span class="property-label">${prop.short_label}</span>
                  </div>
                `).join('')}
              </div>
            ` : ''}
            
            <p class="card-description">${product.description}</p>
            <div class="card-actions">
              <a href="product.html?id=${product.id}" class="card-link">
                View Details & Colors
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </a>
              <button class="add-to-cart-btn" data-product='${JSON.stringify(product)}'>
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    `).join('');
    
    // Add event listeners to add-to-cart buttons
    container.querySelectorAll('.add-to-cart-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const product = JSON.parse(e.target.dataset.product);
        this.addToCart(product);
      });
    });
  }

  setupSearch() {
    const searchInput = document.getElementById('product-search');
    if (!searchInput) return;
    
    searchInput.addEventListener('input', (e) => {
      const searchTerm = e.target.value.toLowerCase();
      
      if (!this.originalProducts) return;
      
      const filtered = this.originalProducts.filter(product =>
        product.name.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm)
      );
      
      this.renderProducts(filtered);
      
      // Animate filtered results
      gsap.fromTo('#products-grid .card',
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.3,
          stagger: 0.05,
          ease: "power2.out"
        }
      );
    });
  }

  addToCart(product) {
    const event = new CustomEvent('addToCart', {
      detail: {
        id: product.id,
        name: product.name,
        image_url: product.image_url,
        selectedColor: null
      }
    });
    
    document.dispatchEvent(event);
    
    // Show confirmation animation
    const btn = event.target;
    const originalText = btn.textContent;
    
    btn.textContent = 'Added! ✓';
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
          }, 1000);
        }
      }
    );
  }

  setupAnimations() {
    // Animate brand header
    gsap.from('.brand-header', {
      y: -30,
      opacity: 0,
      duration: 0.8,
      ease: "power3.out"
    });
    
    // Animate search bar
    gsap.from('#product-search', {
      y: 20,
      opacity: 0,
      duration: 0.6,
      delay: 0.2,
      ease: "power3.out"
    });
    
    // Setup scroll animations for products
    ScrollTrigger.batch('#products-grid .card', {
      onEnter: batch => gsap.from(batch, {
        y: 50,
        opacity: 0,
        stagger: 0.1,
        duration: 0.6,
        ease: "power3.out"
      })
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

  showProductsError() {
    const container = document.getElementById('products-grid');
    if (container) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">⚠️</div>
          <p>Failed to load products. Please try again.</p>
        </div>
      `;
    }
  }
}

// Initialize brand page
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('brand-name')) {
    new BrandPage();
  }
});