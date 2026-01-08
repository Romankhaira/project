// animations.js - Interactive Animations for PEINTURE LAND

class AnimationsManager {
    constructor() {
        this.init();
    }
    
    init() {
        console.log('Animations Manager initialized');
        
        // Initialize all animations
        this.initScrollReveal();
        this.initHoverEffects();
        this.initPageTransitions();
        this.initLoadingAnimations();
        this.initCartAnimations();
        this.initButtonAnimations();
        this.initPaintEffects();
    }
    
    // Scroll reveal animations
    initScrollReveal() {
        const revealElements = document.querySelectorAll('.reveal-on-scroll');
        
        const revealOnScroll = () => {
            revealElements.forEach(element => {
                const elementTop = element.getBoundingClientRect().top;
                const elementVisible = 150;
                
                if (elementTop < window.innerHeight - elementVisible) {
                    element.classList.add('visible');
                }
            });
        };
        
        // Initial check
        revealOnScroll();
        
        // Listen for scroll events
        window.addEventListener('scroll', revealOnScroll);
        
        // Add reveal class to elements that should animate on scroll
        this.addRevealClasses();
    }
    
    addRevealClasses() {
        // Add reveal classes to elements
        const elementsToReveal = [
            '.brands-grid .brand-card',
            '.products-grid .product-card',
            '.product-detail-container',
            '.cart-item > *'
        ];
        
        elementsToReveal.forEach(selector => {
            document.querySelectorAll(selector).forEach(element => {
                element.classList.add('reveal-on-scroll');
            });
        });
    }
    
    // Hover effects
    initHoverEffects() {
        // Add hover classes to interactive elements
        const hoverElements = [
            '.brand-card',
            '.product-card',
            '.btn',
            '.cart-item',
            '.related-product-card'
        ];
        
        hoverElements.forEach(selector => {
            document.querySelectorAll(selector).forEach(element => {
                element.classList.add('hover-float', 'hover-glow');
            });
        });
    }
    
    // Page transition animations
    initPageTransitions() {
        // Add page transition class to main content
        const mainContent = document.querySelector('main') || document.querySelector('.container');
        if (mainContent) {
            mainContent.classList.add('page-transition');
        }
        
        // Animate page load
        document.body.style.opacity = '0';
        window.addEventListener('load', () => {
            document.body.style.transition = 'opacity 0.6s ease';
            document.body.style.opacity = '1';
            
            // Add paint drip effect to header
            const header = document.querySelector('.header');
            if (header) {
                header.classList.add('animate-paint-drip');
            }
        });
    }
    
    // Loading animations
    initLoadingAnimations() {
        // Replace loading text with spinner
        const loadingElements = document.querySelectorAll('.loading');
        loadingElements.forEach(element => {
            if (element.textContent.includes('Loading')) {
                element.innerHTML = `
                    <div class="loading-spinner"></div>
                    <p>${element.textContent}</p>
                `;
            }
        });
    }
    
    // Cart animations
    initCartAnimations() {
        // Animate cart icon when items are added
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('add-to-cart') || 
                e.target.closest('.add-to-cart')) {
                
                // Animate cart icon
                const cartIcon = document.querySelector('.cart-link i');
                if (cartIcon) {
                    cartIcon.classList.remove('animate-cart-add');
                    void cartIcon.offsetWidth; // Trigger reflow
                    cartIcon.classList.add('animate-cart-add');
                    
                    // Remove animation after it completes
                    setTimeout(() => {
                        cartIcon.classList.remove('animate-cart-add');
                    }, 500);
                }
                
                // Animate button
                const button = e.target.classList.contains('add-to-cart') ? 
                    e.target : e.target.closest('.add-to-cart');
                button.classList.remove('animate-button-pulse');
                void button.offsetWidth;
                button.classList.add('animate-button-pulse');
                
                setTimeout(() => {
                    button.classList.remove('animate-button-pulse');
                }, 1000);
            }
        });
    }
    
    // Button animations
    initButtonAnimations() {
        // Add pulse animation to CTA buttons
        const ctaButtons = document.querySelectorAll('.btn-checkout, .btn-whatsapp-order, .btn-primary');
        ctaButtons.forEach(button => {
            button.classList.add('animate-button-pulse');
        });
        
        // Add hover effects to all buttons
        document.querySelectorAll('.btn').forEach(button => {
            button.addEventListener('mouseenter', () => {
                button.classList.add('animate-shake');
            });
            
            button.addEventListener('mouseleave', () => {
                button.classList.remove('animate-shake');
            });
        });
    }
    
    // Paint-specific effects
    initPaintEffects() {
        // Add paint cursor to interactive elements
        document.body.classList.add('paint-cursor');
        
        // Add color shift animation to brand logos
        document.querySelectorAll('.brand-image').forEach((img, index) => {
            setTimeout(() => {
                img.classList.add('animate-color-shift');
                img.style.animationDelay = `${index * 0.5}s`;
            }, 100);
        });
        
        // Add paint splash effect to hero section
        const hero = document.querySelector('.hero');
        if (hero) {
            hero.style.position = 'relative';
            hero.style.overflow = 'hidden';
            
            // Create paint splashes
            for (let i = 0; i < 5; i++) {
                const splash = document.createElement('div');
                splash.style.position = 'absolute';
                splash.style.width = `${Math.random() * 100 + 50}px`;
                splash.style.height = splash.style.width;
                splash.style.background = `radial-gradient(circle, 
                    rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.3),
                    transparent 70%)`;
                splash.style.borderRadius = '50%';
                splash.style.top = `${Math.random() * 100}%`;
                splash.style.left = `${Math.random() * 100}%`;
                splash.style.opacity = '0';
                splash.style.animation = `paintSplash ${Math.random() * 3 + 2}s infinite`;
                splash.style.animationDelay = `${Math.random() * 2}s`;
                splash.style.zIndex = '1';
                hero.appendChild(splash);
            }
        }
    }
    
    // Stagger animation for lists
    staggerAnimation(container) {
        container.classList.add('stagger-animation');
    }
    
    // Animate element with specific animation
    animateElement(element, animationClass) {
        element.classList.remove(animationClass);
        void element.offsetWidth; // Trigger reflow
        element.classList.add(animationClass);
    }
    
    // Create confetti effect
    createConfetti() {
        const colors = ['#4facfe', '#00f2fe', '#f093fb', '#f5576c', '#667eea', '#764ba2'];
        const container = document.createElement('div');
        container.style.position = 'fixed';
        container.style.top = '0';
        container.style.left = '0';
        container.style.width = '100%';
        container.style.height = '100%';
        container.style.pointerEvents = 'none';
        container.style.zIndex = '9999';
        
        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.style.position = 'absolute';
            confetti.style.width = '10px';
            confetti.style.height = '10px';
            confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.borderRadius = '50%';
            confetti.style.top = '-20px';
            confetti.style.left = `${Math.random() * 100}%`;
            confetti.style.opacity = '0.8';
            
            const animation = confetti.animate([
                { transform: `translate(0, 0) rotate(0deg)`, opacity: 1 },
                { transform: `translate(${Math.random() * 100 - 50}px, ${window.innerHeight}px) rotate(${Math.random() * 360}deg)`, opacity: 0 }
            ], {
                duration: Math.random() * 2000 + 1000,
                easing: 'cubic-bezier(0.215, 0.610, 0.355, 1)'
            });
            
            container.appendChild(confetti);
            
            animation.onfinish = () => {
                confetti.remove();
            };
        }
        
        document.body.appendChild(container);
        
        setTimeout(() => {
            container.remove();
        }, 2000);
    }
    
    // Animate success message
    showSuccessAnimation(message) {
        const successDiv = document.createElement('div');
        successDiv.innerHTML = `
            <div style="
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
                color: white;
                padding: 30px 50px;
                border-radius: 20px;
                box-shadow: 0 20px 40px rgba(0,0,0,0.3);
                z-index: 10000;
                text-align: center;
                animation: fadeInScale 0.5s ease;
            ">
                <i class="fas fa-check-circle" style="font-size: 3rem; margin-bottom: 15px;"></i>
                <h3 style="margin: 0; font-size: 1.5rem;">${message}</h3>
            </div>
        `;
        
        document.body.appendChild(successDiv);
        
        setTimeout(() => {
            successDiv.style.animation = 'fadeInScale 0.5s ease reverse forwards';
            setTimeout(() => {
                successDiv.remove();
            }, 500);
        }, 2000);
    }
}

// Initialize animations when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.animationsManager = new AnimationsManager();
});

// Export for use in other files
window.AnimationsManager = AnimationsManager;