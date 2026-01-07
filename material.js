// Material page functionality
class MaterialPage {
  constructor() {
    this.materialId = this.getMaterialId();
    this.init();
  }

  getMaterialId() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
  }

  async init() {
    if (!this.materialId) {
      this.showError('No material selected');
      return;
    }
    
    await this.loadMaterialData();
    this.setupAnimations();
  }

  async loadMaterialData() {
    try {
        const supabase = window.SupabaseClient.supabase;
        const { data, error } = await supabase
        .from('materials')
        .select('*')
        .eq('id', this.materialId)
        .single();
      
      if (error) throw error;
      
      // Update page
      document.title = `${material.name} - Equipment Details`;
      document.getElementById('material-name').textContent = material.name;
      document.getElementById('material-description').textContent = material.description;
      
      // Load material image
      const materialImage = document.getElementById('material-image');
      if (materialImage && material.image_url) {
        materialImage.src = material.image_url;
        materialImage.alt = material.name;
      }
      
    } catch (error) {
      console.error('Error loading material:', error);
      this.showError('Failed to load material data');
    }
  }

  setupAnimations() {
    // Animate material image
    const materialImage = document.getElementById('material-image');
    if (materialImage) {
      gsap.from(materialImage, {
        scale: 0.8,
        opacity: 0,
        duration: 1,
        ease: "power3.out"
      });
    }
    
    // Animate material details
    gsap.from('#material-details > *', {
      y: 30,
      opacity: 0,
      duration: 0.6,
      stagger: 0.1,
      delay: 0.3,
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

// Initialize material page
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('material-name')) {
    new MaterialPage();
  }
});