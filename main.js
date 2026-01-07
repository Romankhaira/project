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
  console.log('Setting up cursor glow...');
  
  // Remove existing cursor glow
  document.querySelectorAll('.cursor-glow').forEach(el => el.remove());
  
  // Create cursor glow element
  this.cursorGlow = document.createElement('div');
  this.cursorGlow.className = 'cursor-glow';
  
  // Force display and visibility with inline styles
  this.cursorGlow.style.cssText = `
    display: block !important;
    visibility: visible !important;
    position: fixed !important;
    width: 200px !important;
    height: 200px !important;
    background: radial-gradient(circle, rgba(0,224,255,0.8) 0%, rgba(0,224,255,0) 70%) !important;
    border-radius: 50% !important;
    pointer-events: none !important;
    z-index: 9999 !important;
    filter: blur(30px) !important;
    opacity: 0.7 !important;
    transform: translate(-50%, -50%) !important;
    left: 0 !important;
    top: 0 !important;
    mix-blend-mode: screen !important;
    will-change: transform !important;
  `;
  
  // Add to body
  document.body.appendChild(this.cursorGlow);
  
  console.log('Cursor glow element created');
  
  // Track mouse position in viewport coordinates
  let clientX = window.innerWidth / 2;
  let clientY = window.innerHeight / 2;
  let lastScrollY = window.scrollY;
  
  // Function to update cursor position
  const updateCursorPosition = (e) => {
    clientX = e.clientX;
    clientY = e.clientY;
    
    // Update glow position immediately
    this.cursorGlow.style.left = clientX + 'px';
    this.cursorGlow.style.top = (clientY + window.scrollY) + 'px';
    this.cursorGlow.style.opacity = '0.7';
  };
  
  // Function to handle scroll updates
  const updateOnScroll = () => {
    // Get current scroll position
    const currentScrollY = window.scrollY;
    
    // Only update if scroll position changed
    if (currentScrollY !== lastScrollY) {
      lastScrollY = currentScrollY;
      
      // Update glow position based on current mouse position and scroll
      this.cursorGlow.style.top = (clientY + currentScrollY) + 'px';
    }
  };
  
  // Function to handle window resize
  const updateOnResize = () => {
    // Keep cursor within bounds
    if (clientX > window.innerWidth) clientX = window.innerWidth - 20;
    if (clientY > window.innerHeight) clientY = window.innerHeight - 20;
    
    // Update position
    this.cursorGlow.style.left = clientX + 'px';
    this.cursorGlow.style.top = (clientY + window.scrollY) + 'px';
  };
  
  // Add event listeners
  document.addEventListener('mousemove', updateCursorPosition);
  window.addEventListener('scroll', updateOnScroll);
  window.addEventListener('resize', updateOnResize);
  
  // Hide/show on mouse enter/leave
  document.addEventListener('mouseleave', () => {
    this.cursorGlow.style.opacity = '0';
  });
  
  document.addEventListener('mouseenter', () => {
    this.cursorGlow.style.opacity = '0.7';
  });
  
  // Initial position (center of viewport)
  this.cursorGlow.style.left = clientX + 'px';
  this.cursorGlow.style.top = (clientY + window.scrollY) + 'px';
  
  // Request animation frame for smooth updates during scroll
  let animationFrameId;
  const smoothUpdate = () => {
    this.cursorGlow.style.top = (clientY + window.scrollY) + 'px';
    animationFrameId = requestAnimationFrame(smoothUpdate);
  };
  
  // Start smooth updates
  animationFrameId = requestAnimationFrame(smoothUpdate);
  
  // Store handlers for cleanup
  this.cursorHandlers = {
    mousemove: updateCursorPosition,
    scroll: updateOnScroll,
    resize: updateOnResize
  };
  
  // Store animation frame ID for cleanup
  this.cursorAnimationFrame = animationFrameId;
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
    // Create a master timeline for scroll animations
    const revealTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: "body",
        start: "top top",
        end: "bottom bottom",
        scrub: 0.5
      }
    });

    // Animate page header on load
    const pageHeader = document.querySelector('.page-header');
    if (pageHeader) {
      gsap.from(pageHeader, {
        y: 50,
        opacity: 0,
        duration: 1,
        ease: "power3.out"
      });
    }

    // Setup observer for staggered card reveals
    const cardObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          const card = entry.target;
          
          // Remove observer once animated
          cardObserver.unobserve(card);
          
          // Staggered animation with index-based delay
          gsap.fromTo(card,
            {
              y: 80,
              opacity: 0,
              rotationX: 10,
              scale: 0.9
            },
            {
              y: 0,
              opacity: 1,
              rotationX: 0,
              scale: 1,
              duration: 1,
              delay: index * 0.1,
              ease: "back.out(1.4)",
              clearProps: "all"
            }
          );
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: "0px 0px -100px 0px"
    });

    // Observe all cards
    document.querySelectorAll('.card').forEach(card => {
      cardObserver.observe(card);
    });
    
    this.scrollObservers.add(cardObserver);
  }

  setupParallaxEffects() {
    // Add parallax to header images
    const headerImages = document.querySelectorAll('.card-image, .product-image');
    
    headerImages.forEach((img, index) => {
      const parallaxTL = gsap.timeline({
        scrollTrigger: {
          trigger: img,
          start: "top bottom",
          end: "bottom top",
          scrub: 0.5
        }
      });
      
      parallaxTL.to(img, {
        y: -50,
        ease: "none"
      });
      
      this.animationTriggers.add(parallaxTL.scrollTrigger);
    });
  }

  setupScrollProgress() {
    // Create scroll progress bar
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress';
    progressBar.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 0;
      height: 3px;
      background: linear-gradient(90deg, var(--accent-primary), var(--accent-secondary));
      z-index: 9998;
      transition: width 0.1s;
    `;
    document.body.appendChild(progressBar);

    // Update progress on scroll
    window.addEventListener('scroll', () => {
      const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (winScroll / height) * 100;
      progressBar.style.width = scrolled + "%";
    });
  }

  setupCardHoverEffects(selector = '.card') {
    const cards = document.querySelectorAll(selector);
    
    cards.forEach(card => {
      if (card.dataset.hasHover) return;
      card.dataset.hasHover = 'true';
      
      // Enhanced 3D hover effect
      card.addEventListener('mousemove', (e) => {
        if (window.innerWidth < 768) return;
        
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        // Calculate rotation
        const rotateY = ((x - centerX) / rect.width) * 20;
        const rotateX = ((centerY - y) / rect.height) * 20;
        
        // Animate card
        gsap.to(card, {
          duration: 0.3,
          rotateX: rotateX,
          rotateY: rotateY,
          transformPerspective: 1000,
          ease: "power2.out"
        });
        
        // Add floating effect to image
        const img = card.querySelector('img');
        if (img) {
          gsap.to(img, {
            duration: 0.3,
            y: -10,
            scale: 1.05,
            ease: "power2.out"
          });
        }
      });
      
      card.addEventListener('mouseleave', () => {
        gsap.to(card, {
          duration: 0.5,
          rotateX: 0,
          rotateY: 0,
          ease: "power3.out"
        });
        
        const img = card.querySelector('img');
        if (img) {
          gsap.to(img, {
            duration: 0.5,
            y: 0,
            scale: 1,
            ease: "power3.out"
          });
        }
      });
    });
  }

  // NEW: Cinematic Entrance Animation for Sections
  animateSectionEntrance(section) {
    const children = section.querySelectorAll(':scope > *');
    
    gsap.fromTo(children,
      {
        y: 50,
        opacity: 0,
        scale: 0.95
      },
      {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: section,
          start: "top 80%",
          toggleActions: "play none none reverse"
        }
      }
    );
  }

  // NEW: Floating Animation for Elements
  setupFloatingAnimations() {
    const floatElements = document.querySelectorAll('.glass-card, .card');
    
    floatElements.forEach(el => {
      gsap.to(el, {
        y: -10,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: Math.random() * 1
      });
    });
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
    if (this.cursorGlow) {
      this.cursorGlow.remove();
    }
  
    // Remove cursor event listeners
    if (this.cursorHandlers) {
      document.removeEventListener('mousemove', this.cursorHandlers.mousemove);
      window.removeEventListener('scroll', this.cursorHandlers.scroll);
      window.removeEventListener('resize', this.cursorHandlers.resize);
    }
  
    // Cancel animation frame
    if (this.cursorAnimationFrame) {
      cancelAnimationFrame(this.cursorAnimationFrame);
    }
  
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