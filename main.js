// Main Application Controller
class AppController {
  static instance = null;
  
  static getInstance() {
    if (!AppController.instance) {
      AppController.instance = new AppController();
    }
    return AppController.instance;
  }

  constructor() {
    if (AppController.instance) {
      return AppController.instance;
    }
    
    this.isInitialized = false;
    this.animationTriggers = new Set();
    this.scrollObservers = new Set();
    AppController.instance = this;
    
    this.init();
  }

  async init() {
    if (this.isInitialized) return;
    
    console.log('AppController: Initializing...');
    
    // Initialize GSAP ScrollTrigger once
    if (!gsap.plugins.scrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);
    }
    
    // Set up global animation defaults
    gsap.defaults({
      ease: "power3.out",
      duration: 1
    });
    
    this.setupCursorGlow();
    this.setupPageTransitions();
    this.initCart();
    this.setupLazyLoading();
    this.setupGlobalScrollAnimations();
    
    this.isInitialized = true;
    console.log('AppController: Initialized successfully');
    
    setTimeout(() => {
      if (!this.readyEventDispatched) {
        document.dispatchEvent(new CustomEvent('appReady'));
        this.readyEventDispatched = true;
      }
    }, 100);
  }

  setupCursorGlow() {
    // Remove existing cursor glow
    const existingGlow = document.querySelector('.cursor-glow');
    if (existingGlow) existingGlow.remove();
    
    // Create cursor glow element
    this.cursorGlow = document.createElement('div');
    this.cursorGlow.className = 'cursor-glow';
    document.body.appendChild(this.cursorGlow);

    // Simple mouse tracking - FIXED POSITION
    document.addEventListener('mousemove', (e) => {
      // Use fixed positioning - no scroll adjustment needed!
      this.cursorGlow.style.left = e.clientX + 'px';
      this.cursorGlow.style.top = e.clientY + 'px';
    });

    // Hide/show effects
    document.addEventListener('mouseleave', () => {
      this.cursorGlow.style.opacity = '0';
    });

    document.addEventListener('mouseenter', () => {
      this.cursorGlow.style.opacity = '0.7';
    });
    
    // Initial fade in
    setTimeout(() => {
      this.cursorGlow.style.opacity = '0.7';
    }, 500);
  }

  setupPageTransitions() {
    // Simple fade in
    gsap.fromTo('body',
      { opacity: 0 },
      {
        opacity: 1,
        duration: 0.8,
        ease: "power2.out"
      }
    );
  }

  setupGlobalScrollAnimations() {
    // Setup staggered reveal animations for all content
    this.setupStaggeredReveals();
    
    // Setup parallax effects
    this.setupParallaxEffects();
    
    // Setup scroll progress indicators
    this.setupScrollProgress();
  }
  
  setupStaggeredReveals() {
    console.log('Setting up staggered reveals...');
    
    // Create observer for cards
    const cardObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          const card = entry.target;
          
          // Mark as animated
          card.dataset.animated = 'true';
          
          // Stop observing
          cardObserver.unobserve(card);
          
          // Cinematic entrance animation
          gsap.fromTo(card,
            {
              y: 100,
              opacity: 0,
              rotationX: 15,
              rotationY: 10,
              scale: 0.8,
              filter: 'blur(10px)'
            },
            {
              y: 0,
              opacity: 1,
              rotationX: 0,
              rotationY: 0,
              scale: 1,
              filter: 'blur(0px)',
              duration: 1.2,
              delay: index * 0.15,
              ease: "power4.out",
              overwrite: true
            }
          );
        }
      });
    }, {
      threshold: 0.05,
      rootMargin: "0px 0px -50px 0px"
    });
  
    // Observe all cards with class .card
    setTimeout(() => {
      const cards = document.querySelectorAll('.card:not([data-animated])');
      console.log(`Found ${cards.length} cards to animate`);
      
      cards.forEach(card => {
        cardObserver.observe(card);
      });
    }, 300);
    
    this.scrollObservers.add(cardObserver);
  }
  
  setupParallaxEffects() {
    // Add subtle parallax to card images
    const cardImages = document.querySelectorAll('.card-image');
    
    cardImages.forEach((img, index) => {
      const parallaxTL = gsap.timeline({
        scrollTrigger: {
          trigger: img.closest('.card'),
          start: "top bottom",
          end: "bottom top",
          scrub: 0.5,
          toggleActions: "play none none reverse"
        }
      });
      
      parallaxTL.to(img, {
        y: -30,
        scale: 1.05,
        duration: 1,
        ease: "none"
      });
      
      this.animationTriggers.add(parallaxTL.scrollTrigger);
    });
  }
  
  setupCardHoverEffects(selector = '.card') {
    const cards = document.querySelectorAll(selector);
    console.log(`Setting up hover effects for ${cards.length} cards`);
    
    cards.forEach(card => {
      if (card.dataset.hasHover) return;
      card.dataset.hasHover = 'true';
      
      // Enhanced 3D hover with depth
      card.addEventListener('mouseenter', () => {
        gsap.to(card, {
          scale: 1.02,
          duration: 0.3,
          ease: "power2.out"
        });
        
        // Add depth shadow
        gsap.to(card, {
          boxShadow: '0 25px 50px rgba(0, 224, 255, 0.15), 0 0 100px rgba(0, 224, 255, 0.05)',
          duration: 0.3,
          ease: "power2.out"
        });
      });
      
      card.addEventListener('mousemove', (e) => {
        if (window.innerWidth < 768) return;
        
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        // Calculate 3D rotation
        const rotateY = ((x - centerX) / rect.width) * 15;
        const rotateX = ((centerY - y) / rect.height) * 10;
        
        gsap.to(card, {
          rotateX: rotateX,
          rotateY: rotateY,
          transformPerspective: 1200,
          duration: 0.3,
          ease: "power2.out"
        });
        
        // Float image on hover
        const img = card.querySelector('.card-image');
        if (img) {
          gsap.to(img, {
            y: -15,
            scale: 1.08,
            duration: 0.3,
            ease: "power2.out"
          });
        }
        
        // Glow effect
        const glow = card.querySelector('.glass-card');
        if (glow) {
          gsap.to(glow, {
            boxShadow: '0 0 40px rgba(0, 224, 255, 0.3), inset 0 0 40px rgba(255, 176, 0, 0.1)',
            duration: 0.3,
            ease: "power2.out"
          });
        }
      });
      
      card.addEventListener('mouseleave', () => {
        // Reset all transformations
        gsap.to(card, {
          scale: 1,
          rotateX: 0,
          rotateY: 0,
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
          duration: 0.5,
          ease: "power3.out"
        });
        
        // Reset image
        const img = card.querySelector('.card-image');
        if (img) {
          gsap.to(img, {
            y: 0,
            scale: 1,
            duration: 0.5,
            ease: "power3.out"
          });
        }
        
        // Reset glow
        const glow = card.querySelector('.glass-card');
        if (glow) {
          gsap.to(glow, {
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            duration: 0.5,
            ease: "power3.out"
          });
        }
      });
    });
  }
  
  setupScrollProgress() {
    // Remove existing progress bar
    const existingProgress = document.querySelector('.scroll-progress');
    if (existingProgress) existingProgress.remove();
    
    // Create scroll progress bar
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress';
    progressBar.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 0%;
      height: 3px;
      background: linear-gradient(90deg, 
        var(--accent-primary), 
        var(--accent-secondary),
        var(--accent-primary)
      );
      z-index: 9998;
      transition: width 0.1s ease;
      box-shadow: 0 0 20px var(--accent-primary);
    `;
    document.body.appendChild(progressBar);
  
    // Update progress on scroll with GSAP for smoothness
    let scrollTween;
    window.addEventListener('scroll', () => {
      const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (winScroll / height) * 100;
      
      if (scrollTween) scrollTween.kill();
      
      scrollTween = gsap.to(progressBar, {
        width: `${scrolled}%`,
        duration: 0.2,
        ease: "power2.out"
      });
    });
    
    this.progressBar = progressBar;
  }


  initCart() {
    const cart = JSON.parse(localStorage.getItem('paint_cart')) || [];
    this.updateCartBadge(cart.length);
    
    document.addEventListener('cartUpdate', (e) => {
      this.updateCartBadge(e.detail.totalItems);
    });
  }

  updateCartBadge(count) {
    let badge = document.querySelector('.cart-badge');
    const cartBtn = document.querySelector('.cart-btn');
    
    if (!badge && cartBtn) {
      badge = document.createElement('span');
      badge.className = 'cart-badge';
      cartBtn.appendChild(badge);
    }
    
    if (badge) {
      badge.textContent = count;
      badge.style.display = count > 0 ? 'flex' : 'none';
      
      if (count > 0) {
        gsap.fromTo(badge,
          { scale: 0 },
          { scale: 1, duration: 0.3, ease: "back.out(1.7)" }
        );
      }
    }
  }

  setupLazyLoading() {
    if (this.lazyObserver) {
      this.lazyObserver.disconnect();
    }
    
    this.lazyObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          const src = img.getAttribute('data-src');
          
          if (src) {
            // Load image
            const image = new Image();
            image.src = src;
            image.onload = () => {
              img.src = src;
              img.removeAttribute('data-src');
              
              // Cinematic image reveal
              gsap.fromTo(img,
                {
                  opacity: 0,
                  scale: 1.1,
                  filter: 'blur(10px)'
                },
                {
                  opacity: 1,
                  scale: 1,
                  filter: 'blur(0px)',
                  duration: 0.8,
                  ease: "power3.out"
                }
              );
            };
          }
          
          this.lazyObserver.unobserve(img);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '100px'
    });
    
    this.observeLazyImages();
  }

  observeLazyImages() {
    if (!this.lazyObserver) return;
    
    document.querySelectorAll('img[data-src]').forEach(img => {
      img.style.backgroundColor = '#1A1D22';
      img.style.borderRadius = '8px';
      this.lazyObserver.observe(img);
    });
  }

  refreshLazyLoading() {
    this.observeLazyImages();
  }

  cleanup() {
    // Kill all GSAP animations
    this.animationTriggers.forEach(trigger => {
      if (trigger.kill) trigger.kill();
    });
    this.animationTriggers.clear();
    
    // Disconnect observers
    this.scrollObservers.forEach(observer => {
      observer.disconnect();
    });
    this.scrollObservers.clear();
    
    if (this.lazyObserver) {
      this.lazyObserver.disconnect();
    }
    
    // Remove cursor glow
    const cursorGlow = document.querySelector('.cursor-glow');
    if (cursorGlow) cursorGlow.remove();
    
    // Remove progress bar
    const progressBar = document.querySelector('.scroll-progress');
    if (progressBar) progressBar.remove();
  }
}

// Initialize app
function initializeApp() {
  if (window.app && window.app.isInitialized) {
    console.log('App already initialized');
    return;
  }
  
  console.log('Starting app initialization...');
  window.app = AppController.getInstance();
  
  window.addEventListener('beforeunload', () => {
    if (window.app) {
      window.app.cleanup();
    }
  });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  setTimeout(initializeApp, 100);
}
