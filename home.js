// Homepage functionality
class HomePage {
  static instance = null;
  
  static getInstance() {
    if (!HomePage.instance) {
      HomePage.instance = new HomePage();
    }
    return HomePage.instance;
  }

  constructor() {
    if (HomePage.instance) {
      return HomePage.instance;
    }
    
    this.isInitialized = false;
    this.dataLoaded = false;
    HomePage.instance = this;
    
    console.log('HomePage: Instance created');
  }

  async init() {
    if (this.isInitialized) return;
    
    console.log('HomePage: Starting initialization...');
    
    await this.waitForDependencies();
    
    if (!this.dataLoaded) {
      await this.loadData();
      this.dataLoaded = true;
    }
    
    if (!this.isInitialized) {
      this.setupPageAnimations();
      this.setupCardClickHandlers();
      this.isInitialized = true;
    }
    
    console.log('HomePage: Initialization complete');
  }

  waitForDependencies() {
    return new Promise((resolve) => {
      if (window.SupabaseClient && window.SupabaseClient.supabase && window.app) {
        resolve();
        return;
      }
      
      const checkAndResolve = () => {
        if (window.SupabaseClient && window.SupabaseClient.supabase && window.app) {
          document.removeEventListener('supabaseReady', checkAndResolve);
          document.removeEventListener('appReady', checkAndResolve);
          resolve();
        }
      };
      
      document.addEventListener('supabaseReady', checkAndResolve);
      document.addEventListener('appReady', checkAndResolve);
      
      setTimeout(() => {
        document.removeEventListener('supabaseReady', checkAndResolve);
        document.removeEventListener('appReady', checkAndResolve);
        console.warn('HomePage: Dependencies timeout, proceeding anyway');
        resolve();
      }, 3000);
    });
  }

  async loadData() {
    try {
      if (!window.SupabaseClient || !window.SupabaseClient.supabase) {
        throw new Error('Supabase client not available');
      }
      
      const supabase = window.SupabaseClient.supabase;
      
      console.log('HomePage: Loading data...');
      
      // Load brands
      const { data: brands, error: brandsError } = await supabase
        .from('brands')
        .select('*')
        .order('name');
      
      if (brandsError) throw brandsError;
      
      // Load materials
      const { data: materials, error: materialsError } = await supabase
        .from('materials')
        .select('*')
        .order('name');
      
      if (materialsError) throw materialsError;
      
      this.renderBrands(brands || []);
      this.renderMaterials(materials || []);
      
      // Setup hover effects after rendering
      setTimeout(() => {
        if (window.app && window.app.setupCardHoverEffects) {
          window.app.setupCardHoverEffects('.brand-card, .material-card');
        }
        
        // Refresh lazy loading
        if (window.app && window.app.refreshLazyLoading) {
          window.app.refreshLazyLoading();
        }
        
        // Setup click handlers
        this.setupCardClickHandlers();
      }, 100);
      
    } catch (error) {
      console.error('HomePage: Error loading data:', error);
      this.showError();
    }
  }

  renderBrands(brands) {
    const container = document.getElementById('brands-grid');
    if (!container) return;
    
    container.innerHTML = brands.map(brand => `
      <div class="card brand-card animate-on-scroll" data-brand-id="${brand.id}" data-brand-name="${brand.name}">
        <div class="glass-card">
          <img 
            data-src="${brand.logo_url}" 
            alt="${brand.name}" 
            class="card-image"
            loading="lazy"
          >
          <div class="card-content">
            <h3 class="card-title">${brand.name}</h3>
            <p class="card-description">${brand.description}</p>
            <div class="card-cta">
              <span class="card-link">
                View Products
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </span>
              <span class="click-hint">Click anywhere to explore</span>
            </div>
          </div>
        </div>
      </div>
    `).join('');
  }

  renderMaterials(materials) {
    const container = document.getElementById('materials-grid');
    if (!container) return;
    
    container.innerHTML = materials.map(material => `
      <div class="card material-card animate-on-scroll" data-material-id="${material.id}" data-material-name="${material.name}">
        <div class="glass-card">
          <img 
            data-src="${material.image_url}" 
            alt="${material.name}" 
            class="card-image"
            loading="lazy"
          >
          <div class="card-content">
            <h3 class="card-title">${material.name}</h3>
            <p class="card-description">${material.description}</p>
            <div class="card-cta">
              <span class="card-link">
                View Details
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </span>
              <span class="click-hint">Click anywhere to explore</span>
            </div>
          </div>
        </div>
      </div>
    `).join('');
  }

  setupCardClickHandlers() {
    // Brand cards - navigate to brand.html
    document.querySelectorAll('.brand-card').forEach(card => {
      card.addEventListener('click', (e) => {
        // Don't navigate if clicking on internal links or buttons
        if (e.target.tagName === 'A' || e.target.tagName === 'BUTTON' || 
            e.target.closest('a') || e.target.closest('button')) {
          return;
        }
        
        const brandId = card.dataset.brandId;
        
        if (brandId) {
          // Animate card click
          gsap.to(card, {
            scale: 0.95,
            duration: 0.2,
            yoyo: true,
            repeat: 1,
            ease: "power2.out",
            onComplete: () => {
              // Navigate to brand page
              window.location.href = `brand.html?id=${brandId}`;
            }
          });
        }
      });
      
      // Add clickable cursor
      card.style.cursor = 'pointer';
    });
    
    // Material cards - navigate to material.html
    document.querySelectorAll('.material-card').forEach(card => {
      card.addEventListener('click', (e) => {
        // Don't navigate if clicking on internal links or buttons
        if (e.target.tagName === 'A' || e.target.tagName === 'BUTTON' || 
            e.target.closest('a') || e.target.closest('button')) {
          return;
        }
        
        const materialId = card.dataset.materialId;
        
        if (materialId) {
          // Animate card click
          gsap.to(card, {
            scale: 0.95,
            duration: 0.2,
            yoyo: true,
            repeat: 1,
            ease: "power2.out",
            onComplete: () => {
              // Navigate to material page
              window.location.href = `material.html?id=${materialId}`;
            }
          });
        }
      });
      
      // Add clickable cursor
      card.style.cursor = 'pointer';
    });
    
    console.log('Card click handlers setup complete');
  }


  setupPageAnimations() {
    console.log('HomePage: Setting up page animations...');
    
    // Animate page header with cinematic effect
    const pageHeader = document.querySelector('.page-header');
    if (pageHeader) {
      gsap.from(pageHeader, {
        duration: 1.5,
        y: -100,
        opacity: 0,
        rotationX: 15,
        ease: "power4.out",
        delay: 0.3
      });
    }
    
    // Animate section headers with shimmer effect
    const sections = document.querySelectorAll('section');
    sections.forEach((section, index) => {
      const header = section.querySelector('h2');
      if (header) {
        gsap.from(header, {
          duration: 1,
          x: -50,
          opacity: 0,
          skewX: 10,
          ease: "power3.out",
          delay: 0.5 + (index * 0.2)
        });
      }
      
      // Animate section content
      const content = section.querySelectorAll('p, .grid');
      content.forEach((el, i) => {
        gsap.from(el, {
          duration: 0.8,
          y: 30,
          opacity: 0,
          ease: "power3.out",
          delay: 0.7 + (index * 0.2) + (i * 0.1)
        });
      });
    });
    
    // Setup card animations after data loads
    setTimeout(() => {
      if (window.app && window.app.setupCardHoverEffects) {
        window.app.setupCardHoverEffects('.brand-card, .material-card');
      }
    }, 1000);
  }


  showError() {
    const containers = ['brands-grid', 'materials-grid'];
    containers.forEach(id => {
      const container = document.getElementById(id);
      if (container) {
        container.innerHTML = `
          <div class="empty-state">
            <div class="empty-icon">⚠️</div>
            <p>Failed to load data. Please refresh the page.</p>
            <button onclick="location.reload()" class="retry-btn">
              Retry
            </button>
          </div>
        `;
      }
    });
  }
}

// Initialize homepage
function initHomePage() {
  if (!document.getElementById('brands-grid')) return;
  
  if (window.homePageInitialized) {
    console.log('HomePage already initialized');
    return;
  }
  
  window.homePageInitialized = true;
  console.log('Initializing HomePage...');
  
  const homePage = HomePage.getInstance();
  homePage.init();
}

// Initialize when ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initHomePage);
} else {
  initHomePage();
}
